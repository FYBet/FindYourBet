import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, stagger } from '../../lib/animations'
import { supabase } from '../../lib/supabase'
import {
  useRanking, PeriodDropdown, SportDropdown,
  MIN_BETS, SPORT_ICONS,
} from './Ranking'
import './dashboard.css'

export default function RankingAmigos({ user }) {
  const [period, setPeriod] = useState('trimestral')
  const [selectedSports, setSelectedSports] = useState([])
  const [scope, setScope] = useState('public')
  const [friendIds, setFriendIds] = useState(null)
  const [friendsLoading, setFriendsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) { setFriendsLoading(false); return }
    Promise.all([
      supabase.from('follows').select('following_id').eq('follower_id', user.id),
      supabase.from('follows').select('follower_id').eq('following_id', user.id),
    ]).then(([{ data: following }, { data: followers }]) => {
      const followingSet = new Set((following || []).map(f => f.following_id))
      const mutual = (followers || []).map(f => f.follower_id).filter(id => followingSet.has(id))
      setFriendIds([...mutual, user.id])
      setFriendsLoading(false)
    })
  }, [user?.id])

  const { ranking, loading } = useRanking(period, selectedSports, scope, friendIds ?? [])

  const toggleSport = (sport) =>
    setSelectedSports(prev => prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport])

  const isTodos = selectedSports.length === 0

  return (
    <motion.div key="ranking-amigos"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

      <div className="page-header">
        <h2>👥 Amigos</h2>
        <p>Ranking de tus amigos mutuos. Mínimo {MIN_BETS} apuestas resueltas para aparecer.</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '4px' }}>
          {[
            { id: 'public',  label: '🌐 Público',  desc: 'Apuestas en canales gratuitos' },
            { id: 'private', label: '💎 Premium', desc: 'Apuestas en canales de pago' },
          ].map(s => (
            <button key={s.id} onClick={() => setScope(s.id)} title={s.desc}
              style={{ padding: '8px 18px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)', background: scope === s.id ? 'var(--color-primary)' : 'transparent', color: scope === s.id ? '#010906' : 'var(--color-text-muted)', transition: 'all 0.15s' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <PeriodDropdown period={period} setPeriod={setPeriod} />
        <SportDropdown
          selectedSports={selectedSports}
          toggleSport={toggleSport}
          onSelectAll={() => setSelectedSports([])}
          isTodos={isTodos}
        />
      </div>

      {friendsLoading || loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div>{friendsLoading ? 'Cargando amigos...' : 'Cargando ranking...'}</div>
        </div>
      ) : friendIds !== null && friendIds.length <= 1 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">Aún no tienes amigos mutuos</div>
          <div className="empty-sub">Sigue a tipsters y espera a que te sigan de vuelta para ver su ranking aquí.</div>
        </div>
      ) : ranking.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">Ningún amigo en el ranking</div>
          <div className="empty-sub">Tus amigos necesitan mínimo {MIN_BETS} apuestas resueltas para aparecer.</div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div className="ranking-list" initial="hidden" animate="visible" variants={stagger}>
            {ranking.map((t, i) => (
              <motion.div key={t.userId} className="ranking-item" variants={fadeUp}
                layout whileHover={{ x: 4, transition: { duration: 0.2 } }}>

                <div className={`rank-pos ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}`}>
                  #{i + 1}
                </div>

                <div className="tipster-info-rank">
                  <div className="tipster-name-rank" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {t.username}
                    {user?.id === t.userId && (
                      <span style={{ fontSize: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '0.5px solid var(--color-primary-border)', fontWeight: 600 }}>
                        Tu
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <span className="tipster-user-rank" style={{ margin: 0 }}>{t.bets} apuestas resueltas</span>
                    {t.usedSports?.map(s => (
                      <span key={s} style={{ fontSize: '10px', background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '1px 7px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                        {SPORT_ICONS[s]} {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rank-metrics">
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
                    <div className="rank-metric-label">Cuota</div>
                  </div>
                  <div className="rank-metric">
                    <div className="rank-metric-val neutral">{t.habitualStake}</div>
                    <div className="rank-metric-label">Stake<br/>usual</div>
                  </div>
                </div>

              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}
