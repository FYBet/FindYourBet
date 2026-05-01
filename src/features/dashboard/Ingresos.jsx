import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../../lib/animations'
import './dashboard.css'

const KPIs = [
  { label: 'Suscriptores', value: '0', colorClass: '', sub: 'Clientes activos' },
  { label: 'Ingresos Brutos', value: '€0.00', colorClass: 'green', sub: 'Antes de comisión' },
  { label: 'Ingresos Netos', value: '€0.00', colorClass: 'green', sub: 'Después de comisión' },
  { label: 'Próximo Tier', value: '50', colorClass: 'yellow', sub: 'Apuestas necesarias' },
]

export default function Ingresos() {
  return (
    <motion.div key="ingresos"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

      <div className="page-header">
        <h2>Ingresos y Comisiones</h2>
        <p>Seguimiento de lo que ganas en FindYourBet.</p>
      </div>

      <motion.div className="commission-banner" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h3>Comisión FYB este mes</h3>
          <p>Tier actual: <strong>Nuevo</strong> — 30% de comisión sobre suscripciones</p>
        </div>
        <div className="commission-amount">€0.00</div>
      </motion.div>

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
    </motion.div>
  )
}
