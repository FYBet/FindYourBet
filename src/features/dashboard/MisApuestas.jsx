import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, stagger } from '../../lib/animations'
import { Button } from '../../components/ui/Button'
import './dashboard.css'

const PERIODS = [
  { id: 'setmanal', label: 'Semanal' },
  { id: 'mensual', label: 'Mensual' },
  { id: 'anual', label: 'Anual' },
  { id: 'total', label: 'Total' },
  { id: 'trimestral', label: 'Ranking' },
]

export default function MisApuestas({ bets, loadingBets, won, lost, yieldVal, avgOdds, onNewBet, onResolveBet, period, onPeriodChange }) {
  const KPIs = [
    { label: 'Yield', value: `${yieldVal.toFixed(2)}%`, colorClass: yieldVal >= 0 ? 'green' : 'red', sub: 'Beneficio sobre lo apostado' },
    { label: 'W / L', value: `${won.length} / ${lost.length}`, colorClass: '', sub: 'Ganadas / Perdidas' },
    { label: 'Total Apuestas', value: bets.length, colorClass: '', sub: 'Historial completo' },
    { label: 'Cuota Media', value: avgOdds, colorClass: 'yellow', sub: 'Promedio de cuotas' },
  ]

  return (
    <motion.div key="apuestas"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

      <div className="page-header">
        <h2>Panel de Tipster</h2>
        <p>Gestiona y publica tus apuestas. Tu historial es público y auditable.</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <select value={period} onChange={e => onPeriodChange(e.target.value)}
          style={{ background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, padding: '10px 14px', borderRadius: 'var(--radius-md)', outline: 'none', cursor: 'pointer', width: 'fit-content' }}>
          {PERIODS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>

        <AnimatePresence>
          {period === 'trimestral' && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              style={{ marginTop: '10px', padding: '10px 14px', background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-primary-border)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--color-text-muted)', maxWidth: '420px' }}>
              💡 El modo <strong style={{ color: 'var(--color-text)' }}>Ranking</strong> refleja tu rendimiento de los últimos 3 meses. Es exactamente la puntuación que aparece en el ranking público y la que otros usuarios ven al evaluar tu historial como tipster.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div className="kpi-grid" initial="hidden" animate="visible" variants={stagger}>
        {KPIs.map((k, i) => (
          <motion.div key={i} className="kpi-card" variants={fadeUp}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}>
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-value ${k.colorClass}`}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="section-head">
        <div className="section-title">Historial de Apuestas</div>
        <Button size="sm" onClick={onNewBet}>+ Nueva Apuesta</Button>
      </div>

      <div className="bets-table">
        {loadingBets ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <div>Cargando apuestas...</div>
          </div>
        ) : bets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">Sin apuestas en este período</div>
            <div className="empty-sub">No hay apuestas registradas para el período seleccionado.</div>
          </div>
        ) : (
          <>
            <div className="table-header">
              <span>Evento</span><span>Cuota</span><span>Stake</span><span>Estado</span><span>Resolver</span>
            </div>
            <AnimatePresence>
              {bets.map(b => (
                <motion.div key={b.id} className="table-row"
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                  <div>
                    <div className="event-name">{b.event}</div>
                    <div className="event-meta">{b.sport} · {b.market} · <strong>{b.pick}</strong></div>
                  </div>
                  <span style={{ fontWeight: 600 }}>{parseFloat(b.odds).toFixed(2)}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>S{b.stake}</span>
                  <span>
                    {b.status === 'won' && <span className="badge badge-green">Ganada ✓</span>}
                    {b.status === 'lost' && <span className="badge badge-red">Perdida ✗</span>}
                    {b.status === 'pending' && <span className="badge badge-gray">Pendiente</span>}
                  </span>
                  <div className="resolve-btns">
                    {b.status === 'pending' && (
                      <>
                        <motion.button className="btn-win"
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => onResolveBet(b.id, 'won')}>✓ Win</motion.button>
                        <motion.button className="btn-loss"
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => onResolveBet(b.id, 'lost')}>✗ Loss</motion.button>
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