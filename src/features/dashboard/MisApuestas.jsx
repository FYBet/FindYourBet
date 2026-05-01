import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' }
  })
}

export default function MisApuestas({ bets, loadingBets, won, lost, yieldVal, avgOdds, onNewBet, onResolveBet }) {
  return (
    <motion.div key="apuestas" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, marginBottom: '4px' }}>Panel de Tipster</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Gestiona y publica tus apuestas. Tu historial es público y auditable.</p>
      </div>

      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Yield', value: yieldVal.toFixed(2) + '%', color: yieldVal >= 0 ? 'var(--color-primary)' : 'var(--color-error)', sub: 'Beneficio sobre lo apostado' },
          { label: 'W / L', value: `${won.length} / ${lost.length}`, color: 'var(--color-text)', sub: 'Ganadas / Perdidas' },
          { label: 'Total Apuestas', value: bets.length, color: 'var(--color-text)', sub: 'Historial completo' },
          { label: 'Cuota Media', value: avgOdds, color: 'var(--color-warning)', sub: 'Promedio de cuotas' },
        ].map((k, i) => (
          <motion.div key={i} variants={fadeUp} whileHover={{ y: -2, transition: { duration: 0.2 } }}
            style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', padding: '20px 24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, lineHeight: 1, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>{k.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Historial de Apuestas</div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onNewBet}
          style={{ background: 'var(--color-primary)', border: 'none', color: 'var(--color-primary-light)', padding: '7px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
          + Nueva Apuesta
        </motion.button>
      </div>

      <div style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loadingBets ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <div style={{ fontSize: '14px' }}>Cargando apuestas...</div>
          </div>
        ) : bets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-soft)', marginBottom: '8px' }}>Sin apuestas todavía</div>
            <div style={{ fontSize: '13px', marginBottom: '24px' }}>Publica tu primera apuesta para empezar a construir tu historial auditable.</div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onNewBet}
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
                <motion.div key={b.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '0.5px solid var(--color-border)', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{b.event}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{b.sport} · {b.market} · <strong>{b.pick}</strong></div>
                  </div>
                  <span style={{ fontWeight: 600 }}>{parseFloat(b.odds).toFixed(2)}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>S{b.stake}</span>
                  <span>
                    {b.status === 'won' && <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '0.5px solid var(--color-primary-border)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600 }}>Ganada ✓</span>}
                    {b.status === 'lost' && <span style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', border: '0.5px solid var(--color-error-border)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600 }}>Perdida ✗</span>}
                    {b.status === 'pending' && <span style={{ background: 'var(--color-bg-soft)', color: 'var(--color-text-muted)', border: '0.5px solid var(--color-border)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600 }}>Pendiente</span>}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {b.status === 'pending' && (
                      <>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onResolveBet(b.id, 'won')}
                          style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '0.5px solid var(--color-primary-border)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>✓ Win</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onResolveBet(b.id, 'lost')}
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
  )
}