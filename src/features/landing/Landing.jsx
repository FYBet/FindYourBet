import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../../lib/animations'
import { Button } from '../../components/ui/Button'
import './landing.css'

const STATS = [
  { num: '1.240', label: 'Tipsters activos' },
  { num: '98.400', label: 'Apuestas auditadas' },
  { num: '+34%', label: 'ROI medio top 10' },
  { num: '12', label: 'Categorías disponibles' },
]

const FEATURES = [
  { title: 'Track record auditado', desc: 'Cada apuesta verificada y registrada. No hay forma de modificar el historial.' },
  { title: 'Ranking transparente', desc: 'Ordenado por ROI real, racha y volumen. Los mejores arriba, siempre.' },
  { title: 'Suscripciones VIP', desc: 'Accede a las apuestas privadas de los tipsters que más te interesan.' },
  { title: 'Chat en tiempo real', desc: 'Los tipsters publican picks y análisis. Interactúa con la comunidad.' },
  { title: 'Tus estadísticas', desc: 'Lleva un control de tus apuestas, ROI y evolución en el tiempo.' },
  { title: '12 categorías', desc: 'Fútbol, baloncesto, tenis, eSports y más. Filtra por lo que te interesa.' },
]

const TIPSTERS = [
  { rank: '#1', initials: 'MG', name: 'MarcGol', sport: 'Fútbol · La Liga', roi: '+41%', acierto: '87%', picks: '312' },
  { rank: '#2', initials: 'SR', name: 'SportRoi', sport: 'Baloncesto · NBA', roi: '+38%', acierto: '81%', picks: '198' },
  { rank: '#3', initials: 'BK', name: 'BetKing', sport: 'Tenis · ATP', roi: '+29%', acierto: '76%', picks: '445' },
]

export default function Landing({ navigate }) {
  return (
    <div className="landing">

      <motion.nav className="nav"
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="nav-logo">FindYour<span>Bet</span></div>
        <div className="nav-links">
          {['Tipsters', 'Ranking', 'Cómo funciona', 'Precios'].map(l => (
            <a key={l} href="#">{l}</a>
          ))}
        </div>
        <div className="nav-btns">
          <Button variant="ghost" size="sm" onClick={() => navigate('login')}>Iniciar sesión</Button>
          <Button size="sm" onClick={() => navigate('register')}>Registrarse</Button>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="hero">
        <motion.div className="hero-badge" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          Apuestas verificadas y auditadas
        </motion.div>
        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          Las mejores apuestas,<br />
          <em>con track record real</em>
        </motion.h1>
        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          Sigue a tipsters verificados, compara su historial auditado y toma decisiones inteligentes.
          Sin humo, solo datos.
        </motion.p>
        <motion.div className="hero-btns" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
          <Button onClick={() => navigate('register')}>Explorar tipsters</Button>
          <Button variant="ghost" onClick={() => navigate('register')}>¿Eres tipster?</Button>
        </motion.div>
      </section>

      {/* STATS */}
      <motion.div className="stats-bar" initial="hidden" animate="visible" variants={stagger}>
        {STATS.map((s, i) => (
          <motion.div key={i} className="stat-item" variants={fadeUp}>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* FEATURES */}
      <section className="features-section">
        <div className="features-inner">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="section-title">Todo lo que necesitas para apostar con cabeza</div>
            <div className="section-sub">Sin letra pequeña, sin trampa</div>
          </motion.div>
          <motion.div className="features-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} className="feature-card" variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <div className="feature-icon" />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* RANKING */}
      <section className="ranking-section">
        <div className="ranking-inner">
          <motion.div className="ranking-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2>Top tipsters esta semana</h2>
            <a href="#">Ver ranking completo →</a>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {TIPSTERS.map((t, i) => (
              <motion.div key={i} className="tipster-card" variants={fadeUp}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}>
                <div className="tipster-rank">{t.rank}</div>
                <div className="tipster-avatar">{t.initials}</div>
                <div className="tipster-info">
                  <div className="tipster-name">
                    {t.name}
                    <span className="verified-badge">Verificado</span>
                  </div>
                  <div className="tipster-sport">{t.sport}</div>
                </div>
                <div className="tipster-stats">
                  {[{ val: t.roi, label: 'ROI' }, { val: t.acierto, label: 'Acierto' }, { val: t.picks, label: 'Picks' }].map((s, j) => (
                    <div key={j} className="tipster-stat">
                      <div className="tipster-stat-val">{s.val}</div>
                      <div className="tipster-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <motion.div className="cta-box" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2>Empieza gratis hoy</h2>
            <p>Sin tarjeta de crédito. Accede al ranking completo y sigue a tipsters de forma gratuita.</p>
            <div className="cta-btns">
              <Button onClick={() => navigate('register')}>Crear cuenta gratis</Button>
              <Button variant="ghost" onClick={() => navigate('login')}>Ver tipsters</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">FindYour<span>Bet</span></div>
        <p>© 2025 FindYourBet. Apuesta con responsabilidad.</p>
        <div className="footer-links">
          {['Términos', 'Privacidad', 'Contacto'].map(l => (
            <a key={l} href="#">{l}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}
