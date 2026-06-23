import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, stagger } from '../../lib/animations'
import { supabase } from '../../lib/supabase'
import { useProfileNav } from '../../contexts/ProfileNavContext'
import Username from '../../components/ui/Username'
import { isAdminUserId } from '../../lib/adminUsers'
import './dashboard.css'

// ── Exports mantinguts per RankingAmigos i altres consumidors ──────────────
export const MIN_BETS = 10
export const MAIN_SPORTS = ['Fútbol', 'Baloncesto', 'Tenis', 'eSports']
export const SPORTS_LIST = [...MAIN_SPORTS, 'Otros']
export const SPORT_ICONS = { 'Fútbol': '⚽', 'Baloncesto': '🏀', 'Tenis': '🎾', 'eSports': '🎮', 'Otros': '🏅' }
export const PERIODS = [
  { id: 'trimestral', label: 'Global' },
  { id: 'setmanal',   label: 'Semanal' },
  { id: 'mensual',    label: 'Mensual' },
  { id: 'anual',      label: 'Anual' },
  { id: 'total',      label: 'Total' },
]

function getPeriodRange(period) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  if (period === 'setmanal') {
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - day)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    return { start: monday, end: sunday }
  }
  if (period === 'mensual') return { start: new Date(year, month, 1), end: new Date(year, month + 1, 0, 23, 59, 59) }
  if (period === 'anual') return { start: new Date(year, 0, 1), end: new Date(year, 11, 31, 23, 59, 59) }
  if (period === 'trimestral') {
    const start = new Date(now)
    start.setMonth(now.getMonth() - 3)
    start.setHours(0, 0, 0, 0)
    return { start, end: now }
  }
  return null
}

function calcYieldFromBets(bets) {
  const resolved = bets.filter(b => b.status === 'won' || b.status === 'lost')
  if (resolved.length < MIN_BETS) return null
  const { profit, stakeSum } = resolved.reduce(
    (acc, b) => ({
      stakeSum: acc.stakeSum + b.stake,
      profit: acc.profit + (b.status === 'won' ? b.stake * (b.odds - 1) : -b.stake),
    }),
    { profit: 0, stakeSum: 0 }
  )
  return stakeSum > 0 ? (profit / stakeSum) * 100 : null
}

function getCombinations(arr) {
  const result = []
  for (let i = 1; i < (1 << arr.length); i++) {
    const combo = []
    for (let j = 0; j < arr.length; j++) {
      if (i & (1 << j)) combo.push(arr[j])
    }
    result.push(combo)
  }
  return result
}

function matchesSport(bet, sport) {
  if (sport === 'Otros') return !MAIN_SPORTS.includes(bet.sport)
  return bet.sport === sport
}

function getBestCombination(userBets, selectedSports) {
  const validSports = selectedSports.filter(sport => {
    const sportBets = userBets.filter(b => matchesSport(b, sport) && (b.status === 'won' || b.status === 'lost'))
    return sportBets.length >= MIN_BETS
  })
  if (validSports.length === 0) return null
  const combos = getCombinations(validSports)
  let best = null
  for (const combo of combos) {
    const comboBets = userBets.filter(b => combo.some(s => matchesSport(b, s)))
    const y = calcYieldFromBets(comboBets)
    if (y !== null && (best === null || y > best.yieldVal)) {
      best = { yieldVal: y, bets: comboBets, sports: combo }
    }
  }
  return best
}

export function useRanking(period, selectedSports, scope = 'public', filterUserIds = null) {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRanking = async () => {
    if (filterUserIds !== null && filterUserIds.length === 0) {
      setRanking([]); setLoading(false); return
    }
    setLoading(true)
    const safetyTimer = setTimeout(() => setLoading(false), 10000)
    try {
      const range = getPeriodRange(period)
      let query = supabase
        .from('bets')
        .select('user_id, odds, stake, status, date, sport, was_private, channel_id')
        .neq('status', 'pending')
        .eq('was_private', scope === 'private')
        .not('review_status', 'in', '("review","invalid")')
        .limit(2000)
      if (range) {
        query = query.gte('date', range.start.toISOString()).lte('date', range.end.toISOString())
      }
      if (filterUserIds !== null) {
        query = query.in('user_id', filterUserIds)
      }
      const { data: bets, error } = await query
      if (error || !bets) { setLoading(false); return }

      let filteredBets = bets
      if (scope === 'private') {
        const { data: activeOffers } = await supabase
          .from('offers').select('channel_id').eq('active', true)
        const premiumIds = new Set((activeOffers || []).map(o => o.channel_id))
        filteredBets = bets.filter(b => premiumIds.has(b.channel_id))
      }

      const byUser = {}
      filteredBets.forEach(b => {
        if (!byUser[b.user_id]) byUser[b.user_id] = []
        byUser[b.user_id].push(b)
      })

      const isTodos = selectedSports.length === 0

      const entries = Object.entries(byUser)
        .map(([userId, userBets]) => {
          let finalBets, usedSports
          if (isTodos) {
            const resolved = userBets.filter(b => b.status === 'won' || b.status === 'lost')
            if (resolved.length < MIN_BETS) return null
            finalBets = userBets
            usedSports = null
          } else {
            const best = getBestCombination(userBets, selectedSports)
            if (!best) return null
            finalBets = best.bets
            usedSports = best.sports
          }

          const resolved = finalBets.filter(b => b.status === 'won' || b.status === 'lost')
          const won = finalBets.filter(b => b.status === 'won').length
          const lost = finalBets.filter(b => b.status === 'lost').length
          const yieldVal = calcYieldFromBets(finalBets)
          if (yieldVal === null) return null

          const avgOdds = finalBets.length > 0
            ? (finalBets.reduce((s, b) => s + b.odds, 0) / finalBets.length).toFixed(2)
            : '—'

          const stakeFreq = {}
          finalBets.forEach(b => { stakeFreq[b.stake] = (stakeFreq[b.stake] || 0) + 1 })
          const habitualStake = finalBets.length > 0
            ? Object.entries(stakeFreq).sort((a, b) => b[1] - a[1])[0][0]
            : '—'

          return { userId, bets: resolved.length, won, lost, yieldVal, avgOdds, habitualStake, usedSports }
        })
        .filter(Boolean)
        .sort((a, b) => b.yieldVal - a.yieldVal)

      if (entries.length === 0) { setRanking([]); setLoading(false); return }

      const userIds = entries.map(e => e.userId)
      const { data: profiles } = await supabase
        .from('profiles').select('id, username, hide_from_ranking, is_verified').in('id', userIds)

      const profileMap = {}
      const verifiedSet = new Set()
      const hiddenSet = new Set()
      profiles?.forEach(p => {
        if (p.hide_from_ranking) hiddenSet.add(p.id)
        else profileMap[p.id] = p.username
        if (p.is_verified) verifiedSet.add(p.id)
      })

      setRanking(
        entries
          .filter(e => !hiddenSet.has(e.userId) && !isAdminUserId(e.userId))
          .map(e => ({ ...e, username: profileMap[e.userId] ?? e.userId.slice(0, 6), isVerified: verifiedSet.has(e.userId) }))
      )
    } catch (e) {
      // silent
    } finally {
      clearTimeout(safetyTimer)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRanking()
    const interval = setInterval(fetchRanking, 60000)
    return () => clearInterval(interval)
  }, [period, JSON.stringify(selectedSports), scope, JSON.stringify(filterUserIds)])

  return { ranking, loading }
}

export function PeriodDropdown({ period, setPeriod }) {
  const [open, setOpen] = useState(false)
  const selected = PERIODS.find(p => p.id === period)
  const isGlobal = period === 'trimestral'

  return (
    <div style={{ position: 'relative', width: 'fit-content' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{
          background: isGlobal ? 'var(--color-primary-light)' : 'var(--color-bg-soft)',
          border: isGlobal ? '1.5px solid var(--color-primary)' : '0.5px solid var(--color-border)',
          color: isGlobal ? 'var(--color-primary)' : 'var(--color-text)',
          fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 700,
          padding: '10px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'space-between',
        }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isGlobal && <span style={{ fontSize: '12px' }}>🏆</span>}
          {selected?.label}
        </span>
        <span style={{ fontSize: '10px', opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ position: 'absolute', top: '48px', left: 0, background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', zIndex: 10, minWidth: '210px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <div onClick={() => { setPeriod('trimestral'); setOpen(false) }}
                style={{ padding: '12px 16px', cursor: 'pointer', background: period === 'trimestral' ? 'var(--color-primary-light)' : 'transparent', borderBottom: '0.5px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>🏆</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>Global</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '1px' }}>Últimos 3 meses · Principal</div>
                  </div>
                  {period === 'trimestral' && <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-primary)' }}>✓</span>}
                </div>
              </div>
              <div style={{ padding: '6px 16px 2px', fontSize: '10px', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Por período</div>
              {PERIODS.slice(1).map(p => (
                <div key={p.id} onClick={() => { setPeriod(p.id); setOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', cursor: 'pointer', background: period === p.id ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                  <span style={{ fontSize: '13px', color: period === p.id ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: period === p.id ? 600 : 400 }}>{p.label}</span>
                  {period === p.id && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>✓</span>}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SportDropdown({ selectedSports, toggleSport, onSelectAll, isTodos }) {
  const [open, setOpen] = useState(false)
  const label = isTodos ? 'Todos los deportes' : selectedSports.length === 1 ? selectedSports[0] : `${selectedSports.length} deportes`

  return (
    <div style={{ position: 'relative', width: 'fit-content' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, padding: '10px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px', justifyContent: 'space-between' }}>
        <span>{label}</span>
        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ position: 'absolute', top: '48px', left: 0, background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', zIndex: 10, minWidth: '220px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <div onClick={onSelectAll}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer', borderBottom: '0.5px solid var(--color-border)', background: isTodos ? 'var(--color-primary-light)' : 'transparent' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${isTodos ? 'var(--color-primary)' : 'var(--color-border)'}`, background: isTodos ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isTodos && <span style={{ color: '#010906', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: '14px', fontWeight: isTodos ? 700 : 400, color: isTodos ? 'var(--color-primary)' : 'var(--color-text)' }}>Todos</span>
              </div>
              {SPORTS_LIST.map(sport => {
                const active = selectedSports.includes(sport)
                return (
                  <div key={sport} onClick={() => toggleSport(sport)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer', background: active ? 'var(--color-primary-light)' : 'transparent' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`, background: active ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {active && <span style={{ color: '#010906', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: active ? 700 : 400, color: active ? 'var(--color-primary)' : 'var(--color-text)' }}>{sport}</span>
                  </div>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Nou ranking per canal ──────────────────────────────────────────────────
const MIN_CH_BETS = 3

function useChannelRanking(channelType) {
  const [entries, setEntries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    hasLoadedRef.current = false
    setEntries(null)

    const doFetch = async () => {
      if (!hasLoadedRef.current) setLoading(true)
      const safetyTimer = setTimeout(() => setLoading(false), 10000)
      try {
        const { data: channels } = await supabase
          .from('channels')
          .select('id, name, owner_id, avatar_url, channel_type, price, invite_code')
          .eq('channel_type', channelType)
          .is('deleted_at', null)
          .limit(200)

        if (!channels?.length) { setEntries([]); return }

        const channelIds = channels.map(c => c.id)
        const ownerIds = [...new Set(channels.map(c => c.owner_id))]

        const [betsRes, profilesRes, membersRes] = await Promise.all([
          supabase.from('bets')
            .select('channel_id, status, stake, odds, sport')
            .in('channel_id', channelIds)
            .in('status', ['won', 'lost'])
            .limit(5000),
          supabase.from('profiles')
            .select('id, username, avatar_url, is_verified')
            .in('id', ownerIds),
          supabase.from('channel_members')
            .select('channel_id')
            .in('channel_id', channelIds),
        ])

        const profileMap = Object.fromEntries((profilesRes.data || []).map(p => [p.id, p]))

        const memberCounts = {}
        for (const m of (membersRes.data || [])) {
          memberCounts[m.channel_id] = (memberCounts[m.channel_id] || 0) + 1
        }

        const betsByChannel = {}
        for (const b of (betsRes.data || [])) {
          if (!betsByChannel[b.channel_id]) betsByChannel[b.channel_id] = []
          betsByChannel[b.channel_id].push(b)
        }

        const result = channels.map(c => {
          if (isAdminUserId(c.owner_id)) return null
          const bets = betsByChannel[c.id] || []
          if (bets.length < MIN_CH_BETS) return null

          const won = bets.filter(b => b.status === 'won').length
          const lost = bets.filter(b => b.status === 'lost').length
          const profit = bets.reduce((s, b) => s + (b.status === 'won' ? b.stake * (b.odds - 1) : -b.stake), 0)
          const stakeSum = bets.reduce((s, b) => s + b.stake, 0)
          const yieldVal = stakeSum > 0 ? (profit / stakeSum) * 100 : 0
          const avgOdds = bets.length > 0 ? bets.reduce((s, b) => s + b.odds, 0) / bets.length : 0
          const winRate = bets.length > 0 ? (won / bets.length) * 100 : 0

          // Sport dominant del canal per al filtre de la sidebar
          const sportCounts = {}
          for (const b of bets) if (b.sport) sportCounts[b.sport] = (sportCounts[b.sport] || 0) + 1
          const mainSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

          const profile = profileMap[c.owner_id]
          return {
            channelId: c.id,
            channelName: c.name,
            channelType: c.channel_type,
            channelAvatarUrl: c.avatar_url,
            inviteCode: c.invite_code,
            price: c.price,
            ownerId: c.owner_id,
            ownerUsername: profile?.username ?? '—',
            ownerAvatarUrl: profile?.avatar_url,
            isVerified: profile?.is_verified || false,
            picks: bets.length,
            won, lost,
            yieldVal,
            avgOdds: avgOdds.toFixed(2),
            winRate,
            memberCount: memberCounts[c.id] || 0,
            mainSport,
          }
        }).filter(Boolean).sort((a, b) => b.yieldVal - a.yieldVal)

        setEntries(result)
        setLastUpdated(new Date())
      } catch {
        setEntries([])
      } finally {
        clearTimeout(safetyTimer)
        hasLoadedRef.current = true
        setLoading(false)
      }
    }

    doFetch()
    const interval = setInterval(doFetch, 300000)
    return () => clearInterval(interval)
  }, [channelType])

  return { entries, loading, lastUpdated }
}

// ── Helpers de presentació ─────────────────────────────────────────────────
function getMedal(pos) {
  if (pos === 0) return '🥇'
  if (pos === 1) return '🥈'
  if (pos === 2) return '🥉'
  return null
}

const TYPE_LABELS = {
  public: 'Público',
  vip_monthly: 'VIP Mensual',
  vip_weekly: 'VIP Semanal',
  stakazo: 'Stakazo',
}

function getTopPct(pos, total) {
  if (total === 0) return '—'
  return `Top ${Math.max(1, Math.ceil((pos + 1) / total * 100))}%`
}

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k'
  return String(n)
}

function ChannelAvatar({ avatarUrl, name, size = 36 }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : '?'
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-border)' }} />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--color-bg)', border: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.33), fontWeight: 700,
      color: 'var(--color-text-muted)', flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

const TH = { fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 10px 8px', whiteSpace: 'nowrap' }
const TD = { padding: '10px 10px', verticalAlign: 'middle' }

function RankingTable({ entries, user, onNavigateToChannel }) {
  if (!entries.length) return (
    <div className="empty-state">
      <div className="empty-icon">📊</div>
      <div className="empty-title">Sin canales aún</div>
      <div className="empty-sub">No hay canales con suficientes picks resueltos para mostrar.</div>
    </div>
  )

  const total = entries.length

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* <table> garanteix alineació perfecta entre capçalera i files */}
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '52px' }} />
          <col />
          <col style={{ width: '90px' }} />
          <col style={{ width: '72px' }} />
          <col style={{ width: '86px' }} />
          <col style={{ width: '104px' }} />
          <col style={{ width: '62px' }} />
          <col style={{ width: '88px' }} />
        </colgroup>
        <thead>
          <tr>
            <th style={{ ...TH, textAlign: 'center' }}>POS</th>
            <th style={{ ...TH, textAlign: 'left' }}>CANAL</th>
            <th style={{ ...TH, textAlign: 'center' }}>YIELD</th>
            <th style={{ ...TH, textAlign: 'center' }}>W/L</th>
            <th style={{ ...TH, textAlign: 'center' }}>ACIERTOS</th>
            <th style={{ ...TH, textAlign: 'center' }}>CUOTA MEDIA</th>
            <th style={{ ...TH, textAlign: 'center' }}>PICKS</th>
            <th style={{ ...TH }} />
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const medal = getMedal(i)
            const wl = e.lost > 0
              ? `${e.won}/${e.lost}`
              : e.won > 0 ? `${e.won}/0` : '—'

            return (
              <tr key={e.channelId}
                style={{ borderTop: '0.5px solid var(--color-border)', transition: 'background 0.1s' }}
                onMouseEnter={e2 => e2.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e2 => e2.currentTarget.style.background = 'transparent'}>

                {/* POS */}
                <td style={{ ...TD, textAlign: 'center' }}>
                  {medal
                    ? <span style={{ fontSize: '18px', lineHeight: 1 }}>{medal}</span>
                    : <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>#{i + 1}</span>
                  }
                </td>

                {/* CANAL */}
                <td style={{ ...TD }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <ChannelAvatar avatarUrl={e.channelAvatarUrl} name={e.channelName} />
                    <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.channelName}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 400, flexShrink: 0 }}>—</span>
                      <Username username={e.ownerUsername} isVerified={e.isVerified} size="xs" />
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', flexShrink: 0 }}>· {formatCount(e.memberCount)} seguidores</span>
                      {user?.id === e.ownerId && (
                        <span style={{ fontSize: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '1px 6px', borderRadius: 'var(--radius-full)', border: '0.5px solid var(--color-primary-border)', fontWeight: 600, flexShrink: 0 }}>Tú</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* YIELD */}
                <td style={{ ...TD, textAlign: 'center', fontSize: '14px', fontWeight: 700, color: e.yieldVal >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {e.yieldVal >= 0 ? '+' : ''}{e.yieldVal.toFixed(1)}%
                </td>

                {/* W/L */}
                <td style={{ ...TD, textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>{wl}</td>

                {/* ACIERTOS */}
                <td style={{ ...TD, textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>{e.winRate.toFixed(0)}%</td>

                {/* CUOTA MEDIA */}
                <td style={{ ...TD, textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>{e.avgOdds}</td>

                {/* PICKS */}
                <td style={{ ...TD, textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>{e.picks}</td>

                {/* VER CANAL */}
                <td style={{ ...TD, textAlign: 'right' }}>
                  <button
                    onClick={() => onNavigateToChannel?.(e.inviteCode)}
                    disabled={!e.inviteCode || !onNavigateToChannel}
                    style={{
                      background: 'var(--color-bg)', border: '0.5px solid var(--color-border)',
                      color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '11px',
                      fontWeight: 600, padding: '5px 9px', borderRadius: 'var(--radius-md)',
                      cursor: (e.inviteCode && onNavigateToChannel) ? 'pointer' : 'default',
                      opacity: (e.inviteCode && onNavigateToChannel) ? 1 : 0.35,
                      whiteSpace: 'nowrap', transition: 'all 0.15s',
                    }}>
                    Ver canal
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function FiltersSidebar({ search, setSearch, sport, setSport, minYield, setMinYield, onlyVerified, setOnlyVerified, lastUpdated, onClearFilters }) {
  const SPORT_OPTS = [{ value: 'all', label: 'Todos' }, ...SPORTS_LIST.map(s => ({ value: s, label: s }))]
  const YIELD_OPTS = [
    { value: '0',  label: 'Todos' },
    { value: '1',  label: '> 0%' },
    { value: '5',  label: '> 5%' },
    { value: '10', label: '> 10%' },
    { value: '20', label: '> 20%' },
  ]
  const hasFilters = search || sport !== 'all' || minYield !== '0' || !onlyVerified

  const selectStyle = {
    width: '100%', background: 'var(--color-bg)', border: '0.5px solid var(--color-border)',
    color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '13px',
    padding: '8px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = {
    fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)',
    marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase',
  }

  return (
    <div style={{
      background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', padding: '16px',
      display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: '16px',
    }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>Filtros</div>

      {/* Buscar */}
      <div>
        <div style={labelStyle}>Buscar</div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar canal..."
          style={{ ...selectStyle, padding: '8px 10px' }} />
      </div>

      {/* Deporte */}
      <div>
        <div style={labelStyle}>Deporte</div>
        <select value={sport} onChange={e => setSport(e.target.value)} style={selectStyle}>
          {SPORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Min. Yield */}
      <div>
        <div style={labelStyle}>Min. Yield</div>
        <select value={minYield} onChange={e => setMinYield(e.target.value)} style={selectStyle}>
          {YIELD_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Solo verificados */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>Solo verificados</span>
        <button onClick={() => setOnlyVerified(v => !v)}
          style={{
            width: '40px', height: '22px', borderRadius: 'var(--radius-full)', flexShrink: 0,
            background: onlyVerified ? 'var(--color-primary)' : 'var(--color-bg)',
            border: onlyVerified ? 'none' : '0.5px solid var(--color-border)',
            cursor: 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0,
          }}>
          <div style={{
            width: '16px', height: '16px', borderRadius: '50%', background: 'white',
            position: 'absolute', top: '3px',
            left: onlyVerified ? '21px' : '3px', transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </button>
      </div>

      {hasFilters && (
        <button onClick={onClearFilters}
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0, textAlign: 'left', textDecoration: 'underline' }}>
          Limpiar filtros
        </button>
      )}

      {/* Estat actualització */}
      <div style={{ borderTop: '0.5px solid var(--color-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} />
          Actualizado en tiempo real
        </div>
        {lastUpdated && (
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', paddingLeft: '13px' }}>
            Última act.: {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* Consell responsable */}
      <div style={{ borderTop: '0.5px solid var(--color-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>Consejo responsable</div>
        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
          Las estadísticas son históricas y no garantizan resultados futuros. Apuesta con responsabilidad.
        </p>
        <button
          onClick={() => {}}
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0, textAlign: 'left' }}>
          Centro de ayuda →
        </button>
      </div>
    </div>
  )
}

const CHANNEL_TABS = [
  { id: 'public',      label: 'Públicos' },
  { id: 'vip_monthly', label: 'VIP Mensual' },
  { id: 'vip_weekly',  label: 'VIP Semanal' },
  { id: 'stakazo',     label: '⚡ Stakazos' },
]

const TRUST_ITEMS = [
  { icon: '✓', text: '100% Verificado', green: true },
  { icon: '📊', text: 'Estadísticas reales', green: false },
  { icon: '✓', text: 'Sin manipulaciones', green: true },
  { icon: '🎯', text: 'Juega con responsabilidad', green: false },
]

export default function Ranking({ user, onNavigateToChannel }) {
  const [activeTab, setActiveTab] = useState('public')
  const [search, setSearch] = useState('')
  const [sport, setSport] = useState('all')
  const [minYield, setMinYield] = useState('0')
  const [onlyVerified, setOnlyVerified] = useState(false)

  const { entries, loading, lastUpdated } = useChannelRanking(activeTab)

  const filtered = (entries || []).filter(e => {
    if (search && !e.channelName.toLowerCase().includes(search.toLowerCase()) && !e.ownerUsername.toLowerCase().includes(search.toLowerCase())) return false
    if (sport !== 'all' && e.mainSport !== sport) return false
    if (minYield !== '0' && e.yieldVal < Number(minYield)) return false
    if (onlyVerified && !e.isVerified) return false
    return true
  })

  const clearFilters = () => { setSearch(''); setSport('all'); setMinYield('0'); setOnlyVerified(false) }

  return (
    <motion.div key="ranking"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

      {/* ── Capçalera ── */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800 }}>Ranking</h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Descubre los canales con mejor rendimiento verificado y transparente.
          </p>
        </div>
        <div style={{
          background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
        }}>
          <span style={{ fontSize: '26px', lineHeight: 1 }}>🏆</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>Transparencia ante todo</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Stats reales · Sin manipulaciones</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid var(--color-border)', marginBottom: '16px' }}>
        {CHANNEL_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: '13px', fontWeight: activeTab === t.id ? 700 : 500, fontFamily: 'var(--font-sans)',
              color: activeTab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: `2px solid ${activeTab === t.id ? 'var(--color-primary)' : 'transparent'}`,
              marginBottom: '-0.5px', transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Trust banner ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {TRUST_ITEMS.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)',
            borderRadius: 'var(--radius-full)', padding: '5px 12px',
            fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500,
          }}>
            <span style={{ fontWeight: 700, color: item.green ? 'var(--color-success)' : 'inherit' }}>{item.icon}</span>
            {item.text}
          </div>
        ))}
      </div>

      {/* ── Layout: taula + sidebar ── */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* Taula */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            {loading
              ? <div className="empty-state"><div className="empty-icon">⏳</div><div>Cargando ranking...</div></div>
              : <RankingTable entries={filtered} user={user} onNavigateToChannel={onNavigateToChannel} />
            }
          </div>
        </div>

        {/* Sidebar de filtres */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          <FiltersSidebar
            search={search} setSearch={setSearch}
            sport={sport} setSport={setSport}
            minYield={minYield} setMinYield={setMinYield}
            onlyVerified={onlyVerified} setOnlyVerified={setOnlyVerified}
            lastUpdated={lastUpdated}
            onClearFilters={clearFilters}
          />
        </div>

      </div>

    </motion.div>
  )
}
