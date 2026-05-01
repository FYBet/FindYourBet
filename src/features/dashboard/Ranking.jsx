import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../../lib/animations'
import './dashboard.css'

const RANKING = [
  { name: 'ElTipster10', user: '@tipster10', bets: 312, yield: 18.4, wl: '198/114', odds: 1.92 },
  { name: 'BetMaster', user: '@betmaster', bets: 241, yield: 14.2, wl: '152/89', odds: 2.10 },
  { name: 'ValueKing', user: '@valueking', bets: 189, yield: 11.8, wl: '118/71', odds: 2.35 },
  { name: 'Pronos_CR', user: '@pronocr', bets: 445, yield: 9.1, wl: '267/178', odds: 1.78 },
  { name: 'SharpBets', user: '@sharpbets', bets: 98, yield: 7.3, wl: '60/38', odds: 2.88 },
]

const MEDALS = ['🥇', '🥈', '🥉']

export default function Ranking() {
  return (
    <motion.div key="ranking"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

      <div className="page-header">
        <h2>Ranking Global</h2>
        <p>Clasificación por Yield. Mínimo 5 apuestas resueltas para aparecer.</p>
      </div>

      <motion.div className="ranking-list" initial="hidden" animate="visible" variants={stagger}>
        {RANKING.map((t, i) => (
          <motion.div key={i} className="ranking-item" variants={fadeUp}
            whileHover={{ x: 4, transition: { duration: 0.2 } }}>
            <div className="rank-pos">{i < 3 ? MEDALS[i] : `#${i + 1}`}</div>
            <div className="tipster-info-rank">
              <div className="tipster-name-rank">{t.name}</div>
              <div className="tipster-user-rank">{t.user} · {t.bets} apuestas</div>
            </div>
            <div className="rank-metric">
              <div className="rank-metric-val">+{t.yield}%</div>
              <div className="rank-metric-label">Yield</div>
            </div>
            <div className="rank-metric">
              <div className="rank-metric-val neutral">{t.wl}</div>
              <div className="rank-metric-label">W/L</div>
            </div>
            <div className="rank-metric">
              <div className="rank-metric-val neutral">{t.odds}</div>
              <div className="rank-metric-label">Cuota media</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
