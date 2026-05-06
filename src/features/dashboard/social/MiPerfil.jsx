import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../lib/supabase'

const DM_OPTIONS = [
  { id: 'followers', icon: '🔒', label: 'Solo seguidores mutuos', desc: 'Solo quien te siga y tú le sigas puede escribirte' },
  { id: 'request', icon: '📨', label: 'Un mensaje', desc: 'Cualquiera puede enviarte 1 mensaje. Tú decides si aceptas' },
  { id: 'everyone', icon: '🌐', label: 'Todos', desc: 'Cualquiera puede escribirte sin restricción' },
]

function StatPill({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 20px', borderRight: '0.5px solid var(--color-border)' }}>
      <div style={{ fontSize: '20px', fontWeight: 700, color: color || 'var(--color-text)' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
    </div>
  )
}

export default function MiPerfil({ user, onNavigate }) {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ total: 0, won: 0, lost: 0, yieldVal: 0, avgOdds: '—' })
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [recentBets, setRecentBets] = useState([])
  const [dmSetting, setDmSetting] = useState('request')
  const [loading, setLoading] = useState(true)
  const [showConfig, setShowConfig] = useState(false)
  const [showDmConfig, setShowDmConfig] = useState(false)
  const [savingDm, setSavingDm] = useState(false)
  const [activeTab, setActiveTab] = useState('picks')

  useEffect(() => {
    if (!user?.id) return
    fetchAll()
  }, [user])

  const fetchAll = async () => {
    setLoading(true)
    const [
      { data: prof },
      { data: bets },
      { count: fersCount },
      { count: fingCount },
      { data: dmSet }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('bets').select('*').eq('user_id', user.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
      supabase.from('dm_settings').select('allow_dms').eq('user_id', user.id).single(),
    ])

    setProfile(prof)
    setFollowersCount(fersCount || 0)
    setFollowingCount(fingCount || 0)
    if (dmSet) setDmSetting(dmSet.allow_dms)

    if (bets && bets.length > 0) {
      const resolved = bets.filter(b => b.status !== 'pending')
      const won = resolved.filter(b => b.status === 'won').length
      const lost = resolved.filter(b => b.status === 'lost').length
      const { profit, stakeSum } = resolved.reduce(
        (acc, b) => ({
          stakeSum: acc.stakeSum + b.stake,
          profit: acc.profit + (b.status === 'won' ? b.stake * (b.odds - 1) : -b.stake)
        }),
        { profit: 0, stakeSum: 0 }
      )
      const yieldVal = stakeSum > 0 ? (profit / stakeSum) * 100 : 0
      const avgOdds = bets.length > 0 ? (bets.reduce((s, b) => s + b.odds, 0) / bets.length).toFixed(2) : '—'
      setStats({ total: resolved.length, won, lost, yieldVal, avgOdds })
      setRecentBets(resolved.slice(0, 6))
    }
    setLoading(false)
  }

  const handleSaveDm = async (val) => {
    setSavingDm(true)
    setDmSetting(val)
    await supabase.from('dm_settings').upsert({ user_id: user.id, allow_dms: val })
    setSavingDm(false)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-text-muted)' }}>⏳ Cargando perfil...</div>
  )

  const username = profile?.username || user?.name || 'Usuario'
  const displayName = profile?.name || username
  const tierLabel = stats.total >= 150 && stats.yieldVal >= 15 ? '💎 Elite'
    : stats.total >= 80 && stats.yieldVal >= 10 ? '🥇 Gold'
    : stats.total >= 30 && stats.yieldVal >= 5 ? '🥈 Silver'
    : stats.total >= 10 ? '🥉 Bronze'
    : null

  const currentDmOption = DM_OPTIONS.find(o => o.id === dmSetting)

  return (
    <motion.div key="miperfil" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

      {/* HEADER CARD */}
      <div style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '20px' }}>

        {/* BANNER */}
        <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--color-primary-light) 0%, rgba(0,200,100,0.08) 100%)', borderBottom: '0.5px solid var(--color-border)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowConfig(!showConfig)}
              style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '6px 10px', cursor: 'pointer', fontSize: '16px', color: 'var(--color-text-muted)' }}>
              ⋯
            </button>
          </div>

          <AnimatePresence>
            {showConfig && (
              <>
                <div onClick={() => setShowConfig(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  style={{ position: 'absolute', top: '44px', right: '12px', background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', zIndex: 10, minWidth: '200px', overflow: 'hidden' }}>
                  {[
                    { icon: '🔐', label: 'Privacidad de mensajes', action: () => { setShowDmConfig(true); setShowConfig(false) } },
                    { icon: '📊', label: 'Mis estadísticas', action: () => { onNavigate('estadisticas'); setShowConfig(false) } },
                    { icon: '📋', label: 'Mi historial', action: () => { onNavigate('historial'); setShowConfig(false) } },
                  ].map((item, i, arr) => (
                    <button key={i} onClick={item.action}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text)', textAlign: 'left', borderBottom: i < arr.length - 1 ? '0.5px solid var(--color-border)' : 'none', fontFamily: 'var(--font-sans)' }}>
                      <span>{item.icon}</span><span>{item.label}</span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* AVATAR + NOM */}
        <div style={{ padding: '0 28px 24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: '#010906', border: '3px solid var(--color-bg)', marginTop: '-40px', flexShrink: 0 }}>
              {displayName[0].toUpperCase()}
            </div>
            {tierLabel && (
              <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '0.5px solid var(--color-primary-border)', fontWeight: 700 }}>
                {tierLabel}
              </span>
            )}
          </div>

          <div style={{ fontWeight: 700, fontSize: '22px', marginBottom: '2px' }}>{displayName}</div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>@{username}</div>

          {/* STATS SOCIALS */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '16px' }}>
            <StatPill label="Seguidores" value={followersCount} />
            <StatPill label="Siguiendo" value={followingCount} />
            <StatPill label="Picks" value={stats.total} />
            <div style={{ textAlign: 'center', padding: '0 20px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: stats.yieldVal >= 0 ? 'var(--color-primary)' : 'var(--color-error)' }}>
                {stats.yieldVal >= 0 ? '+' : ''}{stats.yieldVal.toFixed(1)}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Yield</div>
            </div>
          </div>

          {/* DM SETTING BADGE */}
          <div onClick={() => setShowDmConfig(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', cursor: 'pointer', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <span>{currentDmOption?.icon}</span>
            <span>Mensajes: <strong style={{ color: 'var(--color-text)' }}>{currentDmOption?.label}</strong></span>
            <span style={{ fontSize: '10px' }}>✏️</span>
          </div>
        </div>
      </div>

      {/* TABS PICKS / STATS */}
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
            {recentBets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>Sin picks todavía</div>
                <div style={{ fontSize: '13px' }}>Tus apuestas resueltas aparecerán aquí.</div>
                <button onClick={() => onNavigate('historial')}
                  style={{ marginTop: '16px', padding: '10px 20px', background: 'var(--color-primary)', color: '#010906', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
                  + Nueva apuesta
                </button>
              </div>
            ) : (
              <div style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                {recentBets.map((b, i) => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < recentBets.length - 1 ? '0.5px solid var(--color-border)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-soft)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: b.status === 'won' ? 'var(--color-primary)' : 'var(--color-error)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.event}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {b.sport} · <strong>{b.pick}</strong> · @{parseFloat(b.odds).toFixed(2)} · S{b.stake}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL CONFIG DMs */}
      <AnimatePresence>
        {showDmConfig && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
            onClick={() => setShowDmConfig(false)}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '18px' }}>🔐 Privacidad de mensajes</div>
                <button onClick={() => setShowDmConfig(false)}
                  style={{ background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ×
                </button>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                Controla quién puede enviarte mensajes directos
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {DM_OPTIONS.map(opt => (
                  <div key={opt.id} onClick={() => handleSaveDm(opt.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: `0.5px solid ${dmSetting === opt.id ? 'var(--color-primary)' : 'var(--color-border)'}`, background: dmSetting === opt.id ? 'var(--color-primary-light)' : 'var(--color-bg-soft)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <span style={{ fontSize: '22px' }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: dmSetting === opt.id ? 'var(--color-primary)' : 'var(--color-text)' }}>{opt.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{opt.desc}</div>
                    </div>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${dmSetting === opt.id ? 'var(--color-primary)' : 'var(--color-border)'}`, background: dmSetting === opt.id ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {dmSetting === opt.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#010906' }} />}
                    </div>
                  </div>
                ))}
              </div>
              {savingDm && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '12px', textAlign: 'center' }}>Guardando...</div>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}