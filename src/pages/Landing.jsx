import { motion } from 'framer-motion'
import '../styles/tokens.css'

// Variants reutilitzables per no repetir configuració d'animació
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' }
  })
}

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
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 5%', borderBottom: '0.5px solid var(--color-border)',
          background: 'var(--color-bg)', position: 'sticky', top: 0, zIndex: 100
        }}
      >
        <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '-0.3px' }}>
          FindYour<span style={{ color: 'var(--color-text)' }}>Bet</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Tipsters', 'Ranking', 'Cómo funciona', 'Precios'].map(l => (
            <a key={l} href="#" style={{ fontSize: '13px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('login')} style={{ fontSize: '13px', padding: '6px 14px', border: '0.5px solid var(--color-border-strong)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer' }}>
            Iniciar sesión
          </button>
          <button onClick={() => navigate('register')} style={{ fontSize: '13px', padding: '6px 14px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: 'var(--color-primary-light)', cursor: 'pointer' }}>
            Registrarse
          </button>
        </div>
      </motion.nav>

      {/* HERO */}
      <section style={{ padding: '80px 5% 64px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
          style={{ display: 'inline-block', fontSize: '11px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', marginBottom: '20px', border: '0.5px solid var(--color-primary-border)' }}>
          Apuestas verificadas y auditadas
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-1px' }}>
          Las mejores apuestas,<br />
          <span style={{ color: 'var(--color-primary)' }}>con track record real</span>
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
          style={{ fontSize: '16px', color: 'var(--color-text-soft)', lineHeight: 1.7, marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
          Sigue a tipsters verificados, compara su historial auditado y toma decisiones inteligentes. Sin humo, solo datos.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
          style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('register')} style={{ fontSize: '14px', padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: 'var(--color-primary-light)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Explorar tipsters
          </button>
          <button onClick={() => navigate('register')} style={{ fontSize: '14px', padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-text)', border: '0.5px solid var(--color-border-strong)', cursor: 'pointer' }}>
            ¿Eres tipster?
          </button>
        </motion.div>
      </section>

      {/* STATS */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0', borderTop: '0.5px solid var(--color-border)', borderBottom: '0.5px solid var(--color-border)', background: 'var(--color-bg-soft)' }}
      >
        {STATS.map((s, i) => (
          <motion.div key={i} variants={fadeUp}
            style={{ flex: '1', minWidth: '140px', padding: '24px', textAlign: 'center', borderRight: i < STATS.length - 1 ? '0.5px solid var(--color-border)' : 'none' }}>
            <div style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--color-primary)' }}>{s.num}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* FEATURES */}
      <section style={{ padding: '72px 5%', background: 'var(--color-bg)' }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>
            Todo lo que necesitas para apostar con cabeza
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '40px' }}>
            Sin letra pequeña, sin trampa
          </div>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', maxWidth: '1400px', margin: '0 auto' }}
        >
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px', cursor: 'default' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', marginBottom: '14px' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* RANKING */}
      <section style={{ padding: '72px 5%', background: 'var(--color-bg-soft)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <div style={{ fontSize: 'clamp(18px, 2vw, 24px)', fontWeight: 700 }}>Top tipsters esta semana</div>
            <a href="#" style={{ fontSize: '13px', color: 'var(--color-primary)', textDecoration: 'none' }}>Ver ranking completo →</a>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {TIPSTERS.map((t, i) => (
              <motion.div key={i} variants={fadeUp}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)', width: '20px' }}>{t.rank}</div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', flexShrink: 0 }}>{t.initials}</div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {t.name}
                    <span style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', border: '0.5px solid var(--color-primary-border)', fontWeight: 500 }}>Verificado</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{t.sport}</div>
                </div>
                <div style={{ display: 'flex', gap: 'clamp(12px, 2vw, 28px)', flexWrap: 'wrap' }}>
                  {[{ val: t.roi, label: 'ROI' }, { val: t.acierto, label: 'Acierto' }, { val: t.picks, label: 'Picks' }].map((s, j) => (
                    <div key={j} style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' }}>{s.val}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '72px 5%', background: 'var(--color-bg)' }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ maxWidth: '1400px', margin: '0 auto', background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '64px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.5px' }}>Empieza gratis hoy</div>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginBottom: '32px' }}>Sin tarjeta de crédito. Accede al ranking completo y sigue a tipsters de forma gratuita.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('register')} style={{ fontSize: '14px', padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: 'var(--color-primary-light)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Crear cuenta gratis</button>
            <button onClick={() => navigate('login')} style={{ fontSize: '14px', padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-text)', border: '0.5px solid var(--color-border-strong)', cursor: 'pointer' }}>Ver tipsters</button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px 5%', borderTop: '0.5px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-primary)' }}>
          FindYour<span style={{ color: 'var(--color-text)' }}>Bet</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>© 2025 FindYourBet. Apuesta con responsabilidad.</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['Términos', 'Privacidad', 'Contacto'].map(l => (
            <a key={l} href="#" style={{ fontSize: '12px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}