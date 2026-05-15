import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../lib/supabase'

function Avatar({ url, name, size = 80, fontSize = 32 }) {
  if (url) return (
    <img src={url} alt="avatar"
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-bg)', display: 'block' }} />
  )
  return (
    <div style={{ width: size, height: size, background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 700, color: '#010906', border: '3px solid var(--color-bg)', flexShrink: 0 }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 20px', borderRight: '0.5px solid var(--color-border)' }}>
      <div style={{ fontSize: '20px', fontWeight: 700, color: color || 'var(--color-text)' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
    </div>
  )
}

export default function ProfileView({ userId, currentUser, onBack, onStartDM, isFollowing, isFollower, onFollow, onUnfollow }) {
  const [profile, setProfile] = useState(null)
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, won: 0, lost: 0, yieldVal: 0, avgOdds: '—' })
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [activeTab, setActiveTab] = useState('picks')

  useEffect(() => {
    if (!userId) return
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    setLoading(true)
    const [{ data: prof }, { data: resolvedBets }, { count: fersCount }, { count: fingCount }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('bets').select('*').eq('user_id', userId).neq('status', 'pending'),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    ])
    setProfile(prof)
    setFollowersCount(fersCount || 0)
    setFollowingCount(fingCount || 0)

    if (resolvedBets && resolvedBets.length > 0) {
      const won = resolvedBets.filter(b => b.status === 'won').length
      const lost = resolvedBets.filter(b => b.status === 'lost').length
      const { profit, stakeSum } = resolvedBets.reduce(
        (acc, b) => ({
          stakeSum: acc.stakeSum + b.stake,
          profit: acc.profit + (b.status === 'won' ? b.stake * (b.odds - 1) : -b.stake)
        }),
        { profit: 0, stakeSum: 0 }
      )
      const yieldVal = stakeSum > 0 ? (profit / stakeSum) * 100 : 0
      const avgOdds = (resolvedBets.reduce((s, b) => s + b.odds, 0) / resolvedBets.length).toFixed(2)
      setStats({ total: resolvedBets.length, won, lost, yieldVal, avgOdds })
      setBets(resolvedBets.slice(0, 6))
    }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>⏳ Cargando perfil...</div>
  )
  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>Usuario no encontrado</div>
  )

  const isOwnProfile = userId === currentUser?.id
  const displayName = profile.name || profile.username
  const username = profile.username
  const avatarUrl = profile.avatar_url || null

  const tierLabel = stats.total >= 150 && stats.yieldVal >= 15 ? '💎 Elite'
    : stats.total >= 80 && stats.yieldVal >= 10 ? '🥇 Gold'
    : stats.total >= 30 && stats.yieldVal >= 5 ? '🥈 Silver'
    : stats.total >= 10 ? '🥉 Bronze'
    : null

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

      {/* BACK */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--color-text-muted)' }}>←</button>
        <div style={{ fontWeight: 700, fontSize: '16px' }}>Perfil</div>
      </div>

      {/* HEADER CARD */}
      <div style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '20px' }}>

        {/* BANNER */}
        <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--color-primary-light) 0%, rgba(0,200,100,0.08) 100%)', borderBottom: '0.5px solid var(--color-border)', position: 'relative' }}>
          {!isOwnProfile && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => isFollowing ? onUnfollow(userId) : onFollow(userId)}
                style={{ background: isFollowing ? 'var(--color-bg)' : 'var(--color-primary)', color: isFollowing ? 'var(--color-text)' : '#010906', border: isFollowing ? '0.5px solid var(--color-border)' : 'none', borderRadius: 'var(--radius-md)', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
                {isFollowing ? 'Siguiendo ✓' : '+ Seguir'}
              </button>
              <button onClick={() => onStartDM(userId)}
                style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-sans)' }}>
                💬 Mensaje
              </button>
            </div>
          )}
        </div>

        {/* AVATAR + NOM */}
        <div style={{ padding: '0 28px 24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div style={{ marginTop: '-40px' }}>
              <Avatar url={avatarUrl} name={displayName} size={80} fontSize={32} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isFollower && !isOwnProfile && (
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', background: 'var(--color-bg-soft)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '0.5px solid var(--color-border)' }}>
                  Te sigue
                </span>
              )}
              {tierLabel && (
                <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '0.5px solid var(--color-primary-border)', fontWeight: 700 }}>
                  {tierLabel}
                </span>
              )}
            </div>
          </div>

          <div style={{ fontWeight: 700, fontSize: '22px', marginBottom: '2px' }}>{displayName}</div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: profile.bio ? '8px' : '16px' }}>{username}</div>
          {profile.bio && (
            <div style={{ fontSize: '14px', color: 'var(--color-text-soft)', marginBottom: '16px', lineHeight: 1.5 }}>{profile.bio}</div>
          )}

          {/* STATS SOCIALS */}
          <div style={{ display: 'flex', gap: '0' }}>
            <StatPill label="Seguidores" value={followersCount} />
            <StatPill label="Siguiendo" value={followingCount} />
            <StatPill label="Picks" value={stats.total} />
            {stats.total > 0 && (
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: stats.yieldVal >= 0 ? 'var(--color-primary)' : 'var(--color-error)' }}>
                  {stats.yieldVal >= 0 ? '+' : ''}{stats.yieldVal.toFixed(1)}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Yield</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '0.5px solid var(--color-border)' }}>
        {[{ id: 'picks', label: '📋 Últimos picks' }, { id: 'stats', label: '📊 Rendimiento' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 500, color: activeTab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)', background: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === t.id ? 'var(--color-primary)' : 'transparent'}`, cursor: 'pointer', marginBottom: '-1px', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'picks' && (
          <motion.div key="picks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {bets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontWeight: 600 }}>Sin picks todavía</div>
              </div>
            ) : (
              <div style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                {bets.map((b, i) => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < bets.length - 1 ? '0.5px solid var(--color-border)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-soft)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: b.status === 'won' ? 'var(--color-primary)' : 'var(--color-error)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.event}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {b.sport} · <strong>{b.pick}</strong> · @{parseFloat(b.odds).toFixed(2)} · {b.stake}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600, background: b.status === 'won' ? 'var(--color-primary-light)' : 'var(--color-error-light)', color: b.status === 'won' ? 'var(--color-primary)' : 'var(--color-error)', border: `0.5px solid ${b.status === 'won' ? 'var(--color-primary-border)' : 'var(--color-error-border)'}` }}>
                        {b.status === 'won' ? '✓ Win' : '✗ Loss'}
                      </span>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {new Date(b.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div key="stats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {stats.total === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                <div>Este tipster aún no tiene picks registrados.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Yield total', value: `${stats.yieldVal >= 0 ? '+' : ''}${stats.yieldVal.toFixed(2)}%`, color: stats.yieldVal >= 0 ? 'var(--color-primary)' : 'var(--color-error)', sub: 'Beneficio sobre apostado' },
                  { label: 'W / L', value: `${stats.won} / ${stats.lost}`, color: 'var(--color-text)', sub: 'Ganadas / Perdidas' },
                  { label: 'Total picks', value: stats.total, color: 'var(--color-text)', sub: 'Picks resueltos' },
                  { label: 'Cuota media', value: stats.avgOdds, color: 'var(--color-warning)', sub: 'Promedio de cuotas' },
                  { label: 'Win rate', value: stats.total > 0 ? `${((stats.won / stats.total) * 100).toFixed(0)}%` : '—', color: 'var(--color-text)', sub: 'Porcentaje de acierto' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{s.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
