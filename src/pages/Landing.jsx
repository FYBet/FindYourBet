import './Landing.css'

function Landing({ navigate }) {
  return (
    <div className="landing">

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">FindYour<span>Bet</span></div>
        <div className="nav-links">
          {['Tipsters', 'Ranking', 'Cómo funciona', 'Precios'].map(l => (
            <a key={l} href="#">{l}</a>
          ))}
        </div>
        <div className="nav-btns">
          <button className="btn-ghost" onClick={() => navigate('login')}>Iniciar sesión</button>
          <button className="btn-primary" onClick={() => navigate('register')}>Registrarse</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">Apuestas verificadas y auditadas</div>
        <h1>Las mejores apuestas,<br /><em>con track record real</em></h1>
        <p>Sigue a tipsters verificados, compara su historial auditado y toma decisiones inteligentes. Sin humo, solo datos.</p>
        <div className="hero-btns">
          <button className="btn-lg primary" onClick={() => navigate('register')}>Explorar tipsters</button>
          <button className="btn-lg ghost" onClick={() => navigate('register')}>¿Eres tipster?</button>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        {[
          { num: '1.240', label: 'Tipsters activos' },
          { num: '98.400', label: 'Apuestas auditadas' },
          { num: '+34%', label: 'ROI medio top 10' },
          { num: '12 deportes', label: 'Categorías disponibles' },
        ].map((s, i) => (
          <div key={i} className="stat">
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div style={{ background: '#ffffff' }}>
        <section className="features-section">
          <div className="section-title">Todo lo que necesitas para apostar con cabeza</div>
          <div className="section-sub">Sin letra pequeña, sin trampa</div>
          <div className="features-grid">
            {[
              { title: 'Track record auditado', desc: 'Cada apuesta verificada y registrada. No hay forma de modificar el historial.' },
              { title: 'Ranking transparente', desc: 'Ordenado por ROI real, racha y volumen. Los mejores arriba, siempre.' },
              { title: 'Suscripciones VIP', desc: 'Accede a las apuestas privadas de los tipsters que más te interesan.' },
              { title: 'Chat en tiempo real', desc: 'Los tipsters publican picks y análisis. Interactúa con la comunidad.' },
              { title: 'Tus estadísticas', desc: 'Lleva un control de tus apuestas, ROI y evolución en el tiempo.' },
              { title: '12 categorías', desc: 'Fútbol, baloncesto, tenis, eSports y más. Filtra por lo que te interesa.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon"></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* RANKING */}
      <div className="ranking-section">
        <div className="ranking-inner">
          <div className="ranking-header">
            <h2>Top tipsters esta semana</h2>
            <a href="#">Ver ranking completo →</a>
          </div>
          {[
            { rank: '#1', initials: 'MG', name: 'MarcGol', sport: 'Fútbol · La Liga', roi: '+41%', acierto: '87%', picks: '312' },
            { rank: '#2', initials: 'SR', name: 'SportRoi', sport: 'Baloncesto · NBA', roi: '+38%', acierto: '81%', picks: '198' },
            { rank: '#3', initials: 'BK', name: 'BetKing', sport: 'Tenis · ATP', roi: '+29%', acierto: '76%', picks: '445' },
          ].map((t, i) => (
            <div key={i} className="tipster-card">
              <div className="tipster-rank">{t.rank}</div>
              <div className="tipster-avatar">{t.initials}</div>
              <div className="tipster-info">
                <div className="tipster-name">{t.name} <span className="verified-badge">Verificado</span></div>
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
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <div className="cta-inner">
          <div className="cta-box">
            <h2>Empieza gratis hoy</h2>
            <p>Sin tarjeta de crédito. Accede al ranking completo y sigue a tipsters de forma gratuita.</p>
            <div className="cta-btns">
              <button className="btn-lg primary" onClick={() => navigate('register')}>Crear cuenta gratis</button>
              <button className="btn-lg ghost" onClick={() => navigate('login')}>Ver tipsters</button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="nav-logo" style={{ fontSize: '14px' }}>FindYour<span>Bet</span></div>
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

export default Landing