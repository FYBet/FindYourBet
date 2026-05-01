import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' }
  })
}

export default function Ingresos() {
  return (
    <motion.div key="ingresos" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, marginBottom: '4px' }}>Ingresos y Comisiones</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Seguimiento de lo que ganas en FindYourBet.</p>
      </div>
      <motion.div style={{ background: 'var(--color-primary-light)', border: '0.5px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Comisión FYB este mes</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-soft)' }}>Tier actual: <strong>Nuevo</strong> — 30% de comisión sobre suscripciones</div>
        </div>
        <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary)' }}>€0.00</div>
      </motion.div>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Suscriptores', value: '0', color: 'var(--color-text)', sub: 'Clientes activos' },
          { label: 'Ingresos Brutos', value: '€0.00', color: 'var(--color-primary)', sub: 'Antes de comisión' },
          { label: 'Ingresos Netos', value: '€0.00', color: 'var(--color-primary)', sub: 'Después de comisión' },
          { label: 'Próximo Tier', value: '50', color: 'var(--color-warning)', sub: 'Apuestas necesarias' },
        ].map((k, i) => (
          <motion.div key={i} variants={fadeUp} whileHover={{ y: -2, transition: { duration: 0.2 } }}
            style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', padding: '20px 24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, lineHeight: 1, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>{k.sub}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}