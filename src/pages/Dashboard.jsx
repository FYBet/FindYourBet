import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' }
  })
}

const RANKING = [
  { name: 'ElTipster10', user: '@tipster10', bets: 312, yield: 18.4, wl: '198/114', odds: 1.92 },
  { name: 'BetMaster', user: '@betmaster', bets: 241, yield: 14.2, wl: '152/89', odds: 2.10 },
  { name: 'ValueKing', user: '@valueking', bets: 189, yield: 11.8, wl: '118/71', odds: 2.35 },
  { name: 'Pronos_CR', user: '@pronocr', bets: 445, yield: 9.1, wl: '267/178', odds: 1.78 },
  { name: 'SharpBets', user: '@sharpbets', bets: 98, yield: 7.3, wl: '60/38', odds: 2.88 },
]

const TABS = [
  { id: 'apuestas', label: 'Mis Apuestas' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'ingresos', label: 'Ingresos' },
]

export default function Dashboard({ user, logout }) {
  const [tab, setTab] = useState('apuestas')
  const [bets, setBets] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    event: '', pick: '', odds: '', stake: 5,
    date: '', sport: 'Fútbol', market: '1X2', analysis: ''
  })

  const submitBet = () => {
    if (!form.event || !form.pick || !form.odds || !form.date) {
      alert('Rellena todos los campos obligatorios'); return
    }
    setBets([{ ...form, id: Date.now(), odds: parseFloat(form.odds), status: 'pending' }, ...bets])
    setShowModal(false)
    setForm({ event: '', pick: '', odds: '', stake: 5, date: '', sport: 'Fútbol', market: '1X2', analysis: '' })
  }

  const resolveBet = (id, result) => setBets(bets.map(b => b.id === id ? { ...b, status: result } : b))

  const resolved = bets.filter(b => b.status !== 'pending')
  const won = bets.filter(b => b.status === 'won')
  const lost = bets.filter(b => b.status === 'lost')
  let yieldVal = 0
  if (resolved.length > 0) {
    let profit = 0, stakeSum = 0
    resolved.forEach(b => {
      stakeSum += b.stake
      if (b.status === 'won') profit += b.stake * (b.odds - 1)
      else profit -= b.stake
    })
    yieldVal = stakeSum > 0 ? (profit / stakeSum) * 100 : 0
  }
  const avgOdds = bets.length > 0
    ? (bets.reduce((s, b) => s + b.odds, 0) / bets.length).toFixed(2)
    : '—'

  const inputStyle = {
    width: '100%', background: 'var(--color-bg-soft)',
    border: '0.5px solid var(--color-border)', color: 'var(--color-text)',
    fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '12px 14px',
    borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: 'var(--color-text-soft)', textTransform: 'uppercase',
    letterSpacing: '0.8px', marginBottom: '8px'
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--color-bg-soft)', minHeight: '100vh', color: 'var(--color-text)' }}>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.96 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '36px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>Nueva Apuesta</div>
                <button onClick={() => setShowModal(false)}
                  style={{ background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', color: 'var(--color-text-muted)', width: '32px', height: '32px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '18px' }}>×</button>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Evento</label>
                <input type="text" style={inputStyle} placeholder="ej. Real Madrid vs Barcelona" value={form.event} onChange={e => setForm({ ...form, event: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={labelStyle}>Deporte</label>
                  <select style={inputStyle} value={form.sport} onChange={e => setForm({ ...form, sport: e.target.value })}>
                    {['Fútbol', 'Baloncesto', 'Tenis', 'MMA / Boxeo', 'Otro'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Mercado</label>
                  <select style={inputStyle} value={form.market} onChange={e => setForm({ ...form, market: e.target.value })}>
                    {['1X2', 'Hándicap', 'Over/Under', 'Ambos marcan', 'Otro'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={labelStyle}>Selección</label>
                  <input type="text" style={inputStyle} placeholder="ej. Real Madrid" value={form.pick} onChange={e => setForm({ ...form, pick: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Cuota</label>
                  <input type="number" style={inputStyle} placeholder="ej. 1.85" step="0.01" min="1.01" value={form.odds} onChange={e => setForm({ ...form, odds: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Fecha</label>
                <input type="date" style={inputStyle} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Stake (1–10): {form.stake}</label>
                <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center', lineHeight: 1, margin: '8px 0 4px' }}>{form.stake}</div>
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>% del bankroll recomendado</div>
                <input type="range" min="1" max="10" value={form.stake} onChange={e => setForm({ ...form, stake: parseInt(e.target.value) })} style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Análisis (opcional)</label>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows="3" placeholder="Explica brevemente tu razonamiento..." value={form.analysis} onChange={e => setForm({ ...form, analysis: e.target.value })} />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={submitBet}
                style={{ width: '100%', background: 'var(--color-primary)', border: 'none', color: 'var(--color-primary-light)', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, padding: '12px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              >
                📤 Publicar Apuesta
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 5%', background: 'var(--color-bg)', borderBottom: '0.5px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 100 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary)' }}>
            FindYour<span style={{ color: 'var(--color-text)' }}>Bet</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {TABS.map(t => (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '7px 16px', fontSize: '13px', fontWeight: 500,
                  color: tab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  background: tab === t.id ? 'var(--color-primary-light)' : 'transparent',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer', border: 'none',
                  transition: 'all 0.15s'
                }}
              >
                {t.label}
              </motion.button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', padding: '7px 14px 7px 7px', borderRadius: 'var(--radius-full)', fontSize: '13px' }}>
            <div style={{ width: '28px', height: '28px', background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-light)' }}>
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <span>{user?.name || 'Usuario'}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={logout}
            style={{ fontSize: '12px', padding: '7px 14px', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}
          >
            Salir
          </motion.button>
        </div>
      </motion.nav>

      {/* BODY */}
      <div style={{ padding: '32px 5%', maxWidth: '1400px', margin: '0 auto' }}>

        <AnimatePresence mode="wait">

          {/* TAB: APUESTAS */}
          {tab === 'apuestas' && (
            <motion.div key="apuestas" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, marginBottom: '4px' }}>Panel de Tipster</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Gestiona y publica tus apuestas. Tu historial es público y auditable.</p>
              </div>

              {/* KPIs */}
              <motion.div
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}
              >
                {[
                  { label: 'Yield', value: yieldVal.toFixed(2) + '%', color: yieldVal >= 0 ? 'var(--color-primary)' : 'var(--color-error)', sub: 'Beneficio sobre lo apostado' },
                  { label: 'W / L', value: `${won.length} / ${lost.length}`, color: 'var(--color-text)', sub: 'Ganadas / Perdidas' },
                  { label: 'Total Apuestas', value: bets.length, color: 'var(--color-text)', sub: 'Historial completo' },
                  { label: 'Cuota Media', value: avgOdds, color: 'var(--color-warning)', sub: 'Promedio de cuotas' },
                ].map((k, i) => (
                  <motion.div key={i} variants={fadeUp}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', padding: '20px 24px', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: 600 }}>{k.label}</div>
                    <div style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, lineHeight: 1, color: k.color }}>{k.value}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>{k.sub}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* TABLE */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>Historial de Apuestas</div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModal(true)}
                  style={{ background: 'var(--color-primary)', border: 'none', color: 'var(--color-primary-light)', padding: '7px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                >
                  + Nueva Apuesta
                </motion.button>
              </div>

              <div style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                {bets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-soft)', marginBottom: '8px' }}>Sin apuestas todavía</div>
                    <div style={{ fontSize: '13px', marginBottom: '24px' }}>Publica tu primera apuesta para empezar a construir tu historial auditable.</div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)}
                      style={{ background: 'var(--color-primary)', border: 'none', color: 'var(--color-primary-light)', padding: '10px 22px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                      + Publicar apuesta
                    </motion.button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', background: 'var(--color-bg-soft)', borderBottom: '0.5px solid var(--color-border)', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                      <span>Evento</span><span>Cuota</span><span>Stake</span><span>Estado</span><span>Resolver</span>
                    </div>
                    <AnimatePresence>
                      {bets.map(b => (
                        <motion.div key={b.id}
                          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '0.5px solid var(--color-border)', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '14px' }}>{b.event}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{b.sport} · {b.market} · <strong>{b.pick}</strong></div>
                          </div>
                          <span style={{ fontWeight: 600 }}>{b.odds.toFixed(2)}</span>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>S{b.stake}</span>
                          <span>
                            {b.status === 'won' && <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '0.5px solid var(--color-primary-border)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600 }}>Ganada ✓</span>}
                            {b.status === 'lost' && <span style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', border: '0.5px solid var(--color-error-border)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600 }}>Perdida ✗</span>}
                            {b.status === 'pending' && <span style={{ background: 'var(--color-bg-soft)', color: 'var(--color-text-muted)', border: '0.5px solid var(--color-border)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600 }}>Pendiente</span>}
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {b.status === 'pending' && (
                              <>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => resolveBet(b.id, 'won')}
                                  style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '0.5px solid var(--color-primary-border)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>✓ Win</motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => resolveBet(b.id, 'lost')}
                                  style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', border: '0.5px solid var(--color-error-border)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>✗ Loss</motion.button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB: RANKING */}
          {tab === 'ranking' && (
            <motion.div key="ranking" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, marginBottom: '4px' }}>Ranking Global</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Clasificación por Yield. Mínimo 5 apuestas resueltas para aparecer.</p>
              </div>
              <motion.div
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                {RANKING.map((t, i) => (
                  <motion.div key={i} variants={fadeUp}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    style={{ display: 'grid', gridTemplateColumns: '48px 1fr 100px 100px 100px', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, textAlign: 'center', color: i === 0 ? 'var(--color-warning)' : i === 1 ? 'var(--color-text-muted)' : i === 2 ? '#cd7c3c' : 'var(--color-text-muted)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{t.user} · {t.bets} apuestas</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)' }}>+{t.yield}%</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Yield</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>{t.wl}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>W/L</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>{t.odds}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Cuota media</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* TAB: INGRESOS */}
          {tab === 'ingresos' && (
            <motion.div key="ingresos" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, marginBottom: '4px' }}>Ingresos y Comisiones</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Seguimiento de lo que ganas en FindYourBet.</p>
              </div>

              <motion.div
                style={{ background: 'var(--color-primary-light)', border: '0.5px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Comisión FYB este mes</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-soft)' }}>Tier actual: <strong>Nuevo</strong> — 30% de comisión sobre suscripciones</div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary)' }}>€0.00</div>
              </motion.div>

              <motion.div
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}
              >
                {[
                  { label: 'Suscriptores', value: '0', color: 'var(--color-text)', sub: 'Clientes activos' },
                  { label: 'Ingresos Brutos', value: '€0.00', color: 'var(--color-primary)', sub: 'Antes de comisión' },
                  { label: 'Ingresos Netos', value: '€0.00', color: 'var(--color-primary)', sub: 'Después de comisión' },
                  { label: 'Próximo Tier', value: '50', color: 'var(--color-warning)', sub: 'Apuestas necesarias' },
                ].map((k, i) => (
                  <motion.div key={i} variants={fadeUp}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', padding: '20px 24px', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: 600 }}>{k.label}</div>
                    <div style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, lineHeight: 1, color: k.color }}>{k.value}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>{k.sub}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}