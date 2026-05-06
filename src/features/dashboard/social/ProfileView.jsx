import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../../lib/supabase'

export default function ProfileView({ userId, currentUser, onBack, onStartDM, isFollowing, isFollower, onFollow, onUnfollow }) {
  const [profile, setProfile] = useState(null)
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, won: 0, lost: 0, yieldVal: 0, avgOdds: '—' })
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    if (!userId) return
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    setLoading(true)
    const [{ data: profile }, { data: bets }, { count: fersCount }, { count: fingCount }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('bets').select('*').eq('user_id', userId).neq('status', 'pending'),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    ])
    setProfile(profile)
    setFollowersCount(fersCount || 0)
    setFollowingCount(fingCount || 0)

    if (bets && bets.length > 0) {
      const won = bets.filter(b => b.status === 'won').length
      const lost = bets.filter(b => b.status === 'lost').length
      const { profit, stakeSum } = bets.reduce(
        (acc, b) => ({
          stakeSum: acc.stakeSum + b.stake,
          profit: acc.profit + (b.status === 'won' ? b.stake * (b.odds - 1) : -b.stake)
        }),
        { profit: 0, stakeSum: 0 }
      )
      const yieldVal = stakeSum > 0 ? (profit / stakeSum) * 100 : 0
      const avgOdds = (bets.reduce((s, b) => s + b.odds, 0) / bets.length).toFixed(2)
      setStats({ total: bets.length, won, lost, yieldVal, avgOdds })
      setBets(bets.slice(0, 5))
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

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--color-text-muted)' }}>←</button>
        <div style={{ fontWeight: 700, fontSize: '18px' }}>Perfil</div>
      </div>

      {/* PERFIL */}
      <div style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '28px', marginBottom: '20px' }}>

        {/* AVATAR + NOM + BOTONS */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ width: '72px', height: '72px', background: 'var(--color-primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0, border: '2px solid var(--color-primary-border)' }}>
            {(profile.username || profile.name || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
              <div style={{ fontWeight: 700, fontSize: '20px' }}>{profile.name || profile.username}</div>
              {isFollower && !isOwnProfile && (
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', background: 'var(--color-bg-soft)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '0.5px solid var(--color-border)' }}>
                  Te sigue
                </span>
              )}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
              @{profile.username}
            </div>
            {!isOwnProfile && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => isFollowing ? onUnfollow(userId) : onFollow(userId)}
                  style={{
                    padding: '8px 20px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    border: isFollowing ? '0.5px solid var(--color-border)' : 'none',
                    background: isFollowing ? 'var(--color-bg-soft)' : 'var(--color-primary)',
                    color: isFollowing ? 'var(--color-text)' : '#010906',
                  }}>
                  {isFollowing ? 'Siguiendo ✓' : 'Seguir'}
                </button>
                {/* Botó missatge SEMPRE visible si no és el teu perfil */}
                <button onClick={() => onStartDM(userId)}
                  style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', border: '0.5px solid var(--color-border)', background: 'var(--color-bg-soft)', color: 'var(--color-text)' }}>
                  💬 Mensaje
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEGUIDORS / SEGUITS */}
        <div style={{ display: 'flex', gap: '24px', paddingTop: '16px', borderTop: '0.5px solid var(--color-border)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>{followersCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Seguidores</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>{followingCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Siguiendo</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>{stats.total}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Picks</div>
          </div>
        </div>
      </div>

      {/* STATS */}
      {stats.total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Yield', value: `${stats.yieldVal >= 0 ? '+' : ''}${stats.yieldVal.toFixed(1)}%`, color: stats.yieldVal >= 0 ? 'var(--color-primary)' : 'var(--color-error)' },
            { label: 'W / L', value: `${stats.won} / ${stats.lost}`, color: 'var(--color-text)' },
            { label: 'Total picks', value: stats.total, color: 'var(--color-text)' },
            { label: 'Cuota media', value: stats.avgOdds, color: 'var(--color-warning)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ÚLTIMS PICKS */}
      {bets.length > 0 && (
        <div style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--color-border)', fontWeight: 600, fontSize: '14px' }}>
            Últimos picks
          </div>
          {bets.map((b, i) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: i < bets.length - 1 ? '0.5px solid var(--color-border)' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '13px' }}>{b.event}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {b.sport} · {b.pick} · @{parseFloat(b.odds).toFixed(2)}
                </div>
              </div>
              <span style={{
                fontSize: '11px', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600,
                background: b.status === 'won' ? 'var(--color-primary-light)' : 'var(--color-error-light)',
                color: b.status === 'won' ? 'var(--color-primary)' : 'var(--color-error)',
                border: `0.5px solid ${b.status === 'won' ? 'var(--color-primary-border)' : 'var(--color-error-border)'}`
              }}>
                {b.status === 'won' ? '✓ Win' : '✗ Loss'}
              </span>
            </div>
          ))}
        </div>
      )}

      {stats.total === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
          <div>Este tipster aún no tiene picks registrados.</div>
        </div>
      )}
    </motion.div>
  )
}