import { motion } from 'framer-motion'

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

export default function Ranking() {
  return (
    <motion.div key="ranking" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, marginBottom: '4px' }}>Ranking Global</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Clasificación por Yield. Mínimo 5 apuestas resueltas para aparecer.</p>
      </div>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {RANKING.map((t, i) => (
          <motion.div key={i} variants={fadeUp} whileHover={{ x: 4, transition: { duration: 0.2 } }}
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
  )
}