import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import MisApuestas from '../features/dashboard/MisApuestas'
import Ingresos from '../features/dashboard/Ingresos'
import Ranking from '../features/dashboard/Ranking'

const TABS = [
  { id: 'perfil', label: 'Mi Perfil' },
  { id: 'ranking', label: 'Ranking' },
]

const PERFIL_TABS = [
  { id: 'apuestas', label: 'Mis Apuestas' },
  { id: 'ingresos', label: 'Ingresos' },
]

export default function Dashboard({ user, logout }) {
  const [tab, setTab] = useState('perfil')
  const [perfilTab, setPerfilTab] = useState('apuestas')
  const [bets, setBets] = useState([])
  const [loadingBets, setLoadingBets] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    event: '', pick: '', odds: '', stake: 5,
    date: '', sport: 'Fútbol', market: '1X2', analysis: ''
  })

  useEffect(() => {
    if (!user?.id || user.id === 'dev-skip') {
      setLoadingBets(false)
      return
    }
    fetchBets()
  }, [user])

  const fetchBets = async () => {
    setLoadingBets(true)
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error) setBets(data || [])
    setLoadingBets(false)
  }

  const submitBet = async () => {
    if (!form.event || !form.pick || !form.odds || !form.date) {
      alert('Rellena todos los campos obligatorios'); return
    }
    const newBet = {
      user_id: user.id,
      event: form.event,
      pick: form.pick,
      odds: parseFloat(form.odds),
      stake: form.stake,
      date: form.date,
      sport: form.sport,
      market: form.market,
      analysis: form.analysis,
      status: 'pending'
    }
    if (user.id === 'dev-skip') {
      setBets([{ ...newBet, id: Date.now().toString(), created_at: new Date().toISOString() }, ...bets])
    } else {
      const { data, error } = await supabase.from('bets').insert(newBet).select()
      if (!error) setBets([data[0], ...bets])
    }
    setShowModal(false)
    setForm({ event: '', pick: '', odds: '', stake: 5, date: '', sport: 'Fútbol', market: '1X2', analysis: '' })
  }

  const resolveBet = async (id, result) => {
    if (user.id === 'dev-skip') {
      setBets(bets.map(b => b.id === id ? { ...b, status: result } : b))
      return
    }
    const { error } = await supabase
      .from('bets')
      .update({ status: result })
      .eq('id', id)
    if (!error) setBets(bets.map(b => b.id === id ? { ...b, status: result } : b))
  }

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
              <motion.button key={t.id} whileTap={{ scale: 0.97 }} onClick={() => setTab(t.id)}
                style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 500, color: tab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)', background: tab === t.id ? 'var(--color-primary-light)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: 'none', transition: 'all 0.15s' }}>
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
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={logout}
            style={{ fontSize: '12px', padding: '7px 14px', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            Salir
          </motion.button>
        </div>
      </motion.nav>

      {/* BODY */}
      <div style={{ padding: '32px 5%', maxWidth: '1400px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">

          {/* TAB: MI PERFIL */}
          {tab === 'perfil' && (
            <motion.div key="perfil" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: '0.5px solid var(--color-border)' }}>
                {PERFIL_TABS.map(t => (
                  <motion.button key={t.id} whileTap={{ scale: 0.97 }} onClick={() => setPerfilTab(t.id)}
                    style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 500, color: perfilTab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)', background: 'transparent', borderRadius: '0', cursor: 'pointer', border: 'none', borderBottom: perfilTab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent', transition: 'all 0.15s', marginBottom: '-1px' }}>
                    {t.label}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {perfilTab === 'apuestas' && (
                  <MisApuestas
                    bets={bets}
                    loadingBets={loadingBets}
                    won={won}
                    lost={lost}
                    yieldVal={yieldVal}
                    avgOdds={avgOdds}
                    onNewBet={() => setShowModal(true)}
                    onResolveBet={resolveBet}
                  />
                )}
                {perfilTab === 'ingresos' && <Ingresos />}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB: RANKING */}
          {tab === 'ranking' && <Ranking />}

        </AnimatePresence>
      </div>
    </div>
  )
}