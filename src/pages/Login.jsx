import { useState } from 'react'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' }
  })
}

export default function Login({ navigate, login }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (!email || !pass) { setError('Rellena todos los campos'); return }
    setError('')
    login({ name: email.split('@')[0], email })
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--color-bg-soft)', minHeight: '100vh', color: 'var(--color-text)' }}>

      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ padding: '14px 5%', borderBottom: '0.5px solid var(--color-border)', background: 'var(--color-bg)' }}
      >
        <div onClick={() => navigate('landing')} style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '-0.3px', cursor: 'pointer', display: 'inline-block' }}>
          FindYour<span style={{ color: 'var(--color-text)' }}>Bet</span>
        </div>
      </motion.nav>

      {/* FORM */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 53px)', padding: '24px' }}>
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '40px', width: '100%', maxWidth: '420px' }}
        >
          <motion.div variants={fadeUp} custom={1}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '6px' }}>
              FindYour<span style={{ color: 'var(--color-text)' }}>Bet</span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '32px' }}>Bienvenido de nuevo</div>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--color-error-light)', border: '0.5px solid var(--color-error-border)', color: 'var(--color-error)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '18px' }}>
              {error}
            </motion.div>
          )}

          <motion.div variants={fadeUp} custom={2} style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Email</label>
            <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '12px 14px', borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box' }} />
          </motion.div>

          <motion.div variants={fadeUp} custom={3} style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Contraseña</label>
            <input type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)}
              style={{ width: '100%', background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '12px 14px', borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box' }} />
          </motion.div>

          <motion.div variants={fadeUp} custom={4}>
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              style={{ width: '100%', background: 'var(--color-primary)', border: 'none', color: 'var(--color-primary-light)', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, padding: '12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginTop: '8px' }}
            >
              Iniciar sesión
            </motion.button>
          </motion.div>

          <motion.div variants={fadeUp} custom={5}
            style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            ¿No tienes cuenta?{' '}
            <span onClick={() => navigate('register')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}>
              Regístrate gratis
            </span>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}