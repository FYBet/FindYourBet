const BASE = 'https://api.the-odds-api.com/v4'
const KEY = import.meta.env.VITE_ODDS_API_KEY

// Claus de sport per deporte FYB → sport key de The Odds API
// Ordre per popularitat: els primers rebran la majoria de partits
const SPORT_KEYS = {
  'Fútbol':      ['soccer_spain_la_liga', 'soccer_england_premier_league', 'soccer_uefa_champs_league', 'soccer_europe_uel', 'soccer_germany_bundesliga', 'soccer_italy_serie_a', 'soccer_france_ligue_one'],
  'Baloncesto':  ['basketball_nba', 'basketball_euroleague', 'basketball_spain_acb'],
  'Tenis':       ['tennis_atp_french_open', 'tennis_atp_wimbledon', 'tennis_atp_us_open', 'tennis_wta_french_open'],
  'eSports':     ['esports_lol_series_a', 'esports_csgo'],
  'MMA':         ['mma_mixed_martial_arts'],
}

// Bookmakers de referència (mercat europeu)
const BM_LIST = ['bet365', 'unibet', 'marathonbet', 'pinnacle', 'williamhill', 'bwin']

// Normalitza una cadena per comparació: minúscules, sense accents, sense puntuació
function norm(s = '') {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Filtra paraules trivials que no ajuden a la cerca
const STOP = new Set(['fc', 'cf', 'afc', 'sc', 'ac', 'ud', 'sd', 'rcd', 'vs', 'v', 'de', 'la', 'el', 'real', 'club', 'atletico', 'athletic'])

function keywords(s) {
  return norm(s).split(' ').filter(w => w.length > 1 && !STOP.has(w))
}

// Retorna un valor 0–1 de similitud entre el nom de l'event de l'usuari i els equips de l'API
function eventSimilarity(betEvent, home, away) {
  const betKw = keywords(betEvent)
  const apiKw = keywords(`${home} ${away}`)
  if (!betKw.length || !apiKw.length) return 0
  const hits = betKw.filter(w => apiKw.some(a => a.includes(w) || w.includes(a)))
  return hits.length / Math.max(betKw.length, apiKw.length)
}

// Determina l'índex del resultat (0=home, 1=draw, 2=away) a partir del pick de l'usuari
function resolveOutcomeIndex(pick, home, away) {
  const p = norm(pick)
  const h = norm(home)
  const a = norm(away)
  const hKw = keywords(home)
  const aKw = keywords(away)

  // Draw / Empate / X
  if (/^(x|empate|draw|nul)/.test(p)) return 1

  // Comprova si el pick menciona alguna paraula clau de l'equip
  const pickKw = keywords(pick)
  const hMatches = pickKw.filter(w => hKw.some(hk => hk.includes(w) || w.includes(hk))).length
  const aMatches = pickKw.filter(w => aKw.some(ak => ak.includes(w) || w.includes(ak))).length

  if (hMatches > aMatches) return 0
  if (aMatches > hMatches) return 2
  if (h.includes(p) || p.includes(h.split(' ')[0])) return 0
  if (a.includes(p) || p.includes(a.split(' ')[0])) return 2
  return -1  // no determinat
}

// Obté les quotes actuals d'un sport key de The Odds API
async function fetchOddsForSport(sportKey) {
  try {
    const params = new URLSearchParams({
      apiKey: KEY,
      regions: 'eu',
      markets: 'h2h',
      bookmakers: BM_LIST.join(','),
      oddsFormat: 'decimal',
    })
    const res = await fetch(`${BASE}/sports/${sportKey}/odds?${params}`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// Pren la mediana d'un array de números (evita outliers)
function median(arr) {
  if (!arr.length) return null
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m]
}

/**
 * Verifica la cuota d'una aposta contra The Odds API.
 * Retorna { verified_odds, odds_deviation, odds_verified, verification_at, matched_event }
 * o null si no s'ha pogut verificar (cap event trobat, API no disponible, etc.)
 */
export async function verifyBetOdds(bet) {
  if (!KEY || !bet.event || !bet.pick) return null

  // Només verifiquem mercats h2h (1X2 / guanyador)
  const market = (bet.market || '').toLowerCase()
  if (!['1x2', '', 'ganador', 'winner', 'moneyline'].includes(market)) return null

  const sportKeys = SPORT_KEYS[bet.sport]
  if (!sportKeys) return null

  // Busca a tots els sport keys en paral·lel (màx 3 per estalviar quota API)
  const toFetch = sportKeys.slice(0, 3)
  const allEvents = (await Promise.all(toFetch.map(fetchOddsForSport))).flat()

  // Troba l'event amb major similitud (threshold mínim 0.35)
  let bestMatch = null, bestScore = 0.35
  for (const ev of allEvents) {
    const score = eventSimilarity(bet.event, ev.home_team, ev.away_team)
    if (score > bestScore) { bestScore = score; bestMatch = ev }
  }
  if (!bestMatch) return null

  const outcomeIdx = resolveOutcomeIndex(bet.pick, bestMatch.home_team, bestMatch.away_team)
  if (outcomeIdx === -1) return null

  // Recull quotes de tots els bookmakers per a l'outcome triat
  const allOdds = []
  for (const bm of bestMatch.bookmakers) {
    const h2h = bm.markets?.find(m => m.key === 'h2h')
    if (!h2h) continue
    const price = h2h.outcomes?.[outcomeIdx]?.price
    if (price && price > 1) allOdds.push(price)
  }
  if (allOdds.length === 0) return null

  const verified_odds = +(median(allOdds).toFixed(2))
  const odds_deviation = +(Math.abs(bet.odds - verified_odds) / verified_odds * 100).toFixed(1)

  return {
    verified_odds,
    odds_deviation,
    odds_verified: true,
    verification_at: new Date().toISOString(),
    matched_event: `${bestMatch.home_team} vs ${bestMatch.away_team}`,
  }
}
