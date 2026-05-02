import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, stagger } from '../../lib/animations'
import { supabase } from '../../lib/supabase'
import './dashboard.css'

const MEDALS = ['🥇', '🥈', '🥉']
const MIN_BETS = 3

const TIER_STYLES = {
  elite:  { bg: 'rgba(139,92,246,0.15)',  color: '#8b5cf6', border: 'rgba(139,92,246,0.3)',  label: '💎 Elite'  },
  gold:   { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', border: 'rgba(245,158,11,0.3)',  label: '🥇 Gold'   },
  silver: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)', label: '🥈 Silver' },
  bronze: { bg: 'rgba(180,120,60,0.15)',  color: '#b4783c', border: 'rgba(180,120,60,0.3)',  label: '🥉 Bronze' },
}

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
    const { data: bets, error } = await supabase
      .from('bets')
      .select('user_id, odds, stake, status')
      .neq('status', 'pending')

    if (error || !bets) return

    const byUser = {}
    bets.forEach(b => {
      if (!byUser[b.user_id]) byUser[b.user_id] = []
      byUser[b.user_id].push(b)
    })

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

        const tier = resolved.length >= 150 && yieldVal >= 15 ? 'elite'
          : resolved.length >= 80 && yieldVal >= 10 ? 'gold'
          : resolved.length >= 30 && yieldVal >= 5 ? 'silver'
          : 'bronze'

        return { userId, bets: resolved.length, won, lost, yieldVal, avgOdds, tier }
      })
      .filter(Boolean)
      .sort((a, b) => b.yieldVal - a.yieldVal)

    if (entries.length === 0) { setRanking([]); setLoading(false); return }

    const userIds = entries.map(e => e.userId)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds)

    const profileMap = {}
    profiles?.forEach(p => { profileMap[p.id] = p.username })

    const result = entries.map(e => ({
      ...e,
      username: profileMap[e.userId] ? `@${profileMap[e.userId]}` : `@${e.userId.slice(0, 6)}`
    }))

    setRanking(result)
    setLoading(false)
  }

  useEffect(() => {
    fetchRanking()
    const interval = setInterval(fetchRanking, 10000)
    return () => clearInterval(interval)
  }, [])

  return { ranking, loading }
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
          <div className="empty-sub">Necesitas mínimo {MIN_BETS} apuestas resueltas para aparecer.</div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div className="ranking-list" initial="hidden" animate="visible" variants={stagger}>
            {ranking.map((t, i) => {
              const tier = TIER_STYLES[t.tier]
              return (
                <motion.div key={t.userId} className="ranking-item" variants={fadeUp}
                  layout whileHover={{ x: 4, transition: { duration: 0.2 } }}>

                  <div className={`rank-pos ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}`}>
                    {i < 3 ? MEDALS[i] : `#${i + 1}`}
                  </div>

                  <div className="tipster-info-rank">
                    <div className="tipster-name-rank" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {t.username}
                      {user?.id === t.userId && (
                        <span style={{ fontSize: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '0.5px solid var(--color-primary-border)', fontWeight: 600 }}>
                          Tu
                        </span>
                      )}
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700, background: tier.bg, color: tier.color, border: `0.5px solid ${tier.border}` }}>
                        {tier.label}
                      </span>
                    </div>
                    <div className="tipster-user-rank">{t.bets} apuestas resueltas</div>
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
              )
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}