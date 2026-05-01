import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, stagger } from '../../lib/animations'
import { supabase } from '../../lib/supabase'
import './dashboard.css'

const MEDALS = ['🥇', '🥈', '🥉']
const MIN_BETS = 3

// Calcula el yield donat un array d'apostes resoltes
function calcYield(bets) {
  const resolved = bets.filter(b => b.status !== 'pending')
  if (resolved.length < MIN_BETS) return null
  const { profit, stakeSum } = resolved.reduce(
    (acc, b) => ({
      stakeSum: acc.stakeSum + b.stake,
      profit: acc.profit + (b.status === 'won' ? b.stake * (b.odds - 1) : -b.stake)
    }),
    { profit: 0, stakeSum: 0 }
  )
  return stakeSum > 0 ? (profit / stakeSum) * 100 : 0
}

function useRanking() {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRanking = async () => {
    // Agafem totes les apostes resoltes agrupades per usuari
    const { data: bets, error } = await supabase
      .from('bets')
      .select('user_id, odds, stake, status')
      .neq('status', 'pending')

    if (error || !bets) return

    // Agrupem per user_id
    const byUser = {}
    bets.forEach(b => {
      if (!byUser[b.user_id]) byUser[b.user_id] = []
      byUser[b.user_id].push(b)
    })

    // Calculem mètriques per cada usuari
    const entries = Object.entries(byUser)
      .map(([userId, userBets]) => {
        const resolved = userBets.filter(b => b.status !== 'pending')
        if (resolved.length < MIN_BETS) return null

        const won = userBets.filter(b => b.status === 'won').length
        const lost = userBets.filter(b => b.status === 'lost').length
        const yieldVal = calcYield(userBets)
        const avgOdds = userBets.length > 0
          ? (userBets.reduce((s, b) => s + b.odds, 0) / userBets.length).toFixed(2)
          : '—'

        return { userId, bets: resolved.length, won, lost, yieldVal, avgOdds }
      })
      .filter(Boolean)
      .sort((a, b) => b.yieldVal - a.yieldVal)

    if (entries.length === 0) { setRanking([]); setLoading(false); return }

    // Agafem els metadades dels usuaris (nom, username)
    const userIds = entries.map(e => e.userId)
    const { data: profiles } = await supabase
      .from('bets')
      .select('user_id')
      .in('user_id', userIds)

    // Com que no tenim taula de perfils encara, usem el user_id truncat com a nom
    const result = entries.map(e => ({
      ...e,
      name: e.userId.slice(0, 8).toUpperCase(),
      username: `@${e.userId.slice(0, 6)}`
    }))

    setRanking(result)
    setLoading(false)
  }

  useEffect(() => {
    fetchRanking()
    // Temps real — polling cada 10 segons
    const interval = setInterval(fetchRanking, 10000)
    return () => clearInterval(interval)
  }, [])

  return { ranking, loading, refetch: fetchRanking }
}

export default function Ranking({ user }) {
  const { ranking, loading } = useRanking()

  return (
    <motion.div key="ranking"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

      <div className="page-header">
        <h2>Ranking Global</h2>
        <p>Clasificación por Yield. Mínimo {MIN_BETS} apuestas resueltas para aparecer.</p>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div>Cargando ranking...</div>
        </div>
      ) : ranking.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <div className="empty-title">Sin datos todavía</div>
          <div className="empty-sub">
            Necesitas mínimo {MIN_BETS} apuestas resueltas para aparecer en el ranking.
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div className="ranking-list" initial="hidden" animate="visible" variants={stagger}>
            {ranking.map((t, i) => (
              <motion.div key={t.userId} className="ranking-item" variants={fadeUp}
                layout
                whileHover={{ x: 4, transition: { duration: 0.2 } }}>
                <div className={`rank-pos ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}`}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </div>
                <div className="tipster-info-rank">
                  <div className="tipster-name-rank">
                    {t.name}
                    {user?.id === t.userId && (
                      <span style={{ marginLeft: '8px', fontSize: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '0.5px solid var(--color-primary-border)', fontWeight: 600 }}>
                        Tu
                      </span>
                    )}
                  </div>
                  <div className="tipster-user-rank">{t.username} · {t.bets} apuestas resueltas</div>
                </div>
                <div className="rank-metric">
                  <div className={`rank-metric-val ${t.yieldVal >= 0 ? '' : 'red'}`}>
                    {t.yieldVal >= 0 ? '+' : ''}{t.yieldVal.toFixed(1)}%
                  </div>
                  <div className="rank-metric-label">Yield</div>
                </div>
                <div className="rank-metric">
                  <div className="rank-metric-val neutral">{t.won}/{t.lost}</div>
                  <div className="rank-metric-label">W/L</div>
                </div>
                <div className="rank-metric">
                  <div className="rank-metric-val neutral">{t.avgOdds}</div>
                  <div className="rank-metric-label">Cuota media</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}