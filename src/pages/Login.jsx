import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

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
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetMode, setResetMode] = useState(false)

  const handleLogin = async () => {
    if (!email || !pass) { setError('Rellena todos los campos'); return }
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass })

    setLoading(false)

    if (authError) { setError('Email o contraseña incorrectos'); return }

    const meta = data.user?.user_metadata
    login({
      name: meta?.name || email.split('@')[0],
      surname: meta?.surname || '',
      user: meta?.username || '',
      email: data.user.email,
      id: data.user.id
    })
  }

  const handleResetPassword = async () => {
    if (!email) { setError('Introduce tu email primero'); return }
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173'
    })

    setLoading(false)

    if (resetError) { setError(resetError.message); return }

    setResetSent(true)
  }

  const skipLogin = () => {
    login({ name: 'Dev', surname: 'Test', user: 'devtest', email: 'dev@test.com', id: 'dev-skip' })
  }

  const inputStyle = {
    width: '100%', background: 'var(--color-bg-soft)',
    border: '0.5px solid var(--color-border)', color: 'var(--color-text)',
    fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '12px 14px',
    borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box'
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--color-bg-soft)', minHeight: '100vh', color: 'var(--color-text)' }}>

      <motion.nav
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ padding: '14px 5%', borderBottom: '0.5px solid var(--color-border)', background: 'var(--color-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div onClick={() => navigate('landing')} style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '-0.3px', cursor: 'pointer' }}>
          FindYour<span style={{ color: 'var(--color-text)' }}>Bet</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={skipLogin}
          style={{ fontSize: '12px', padding: '6px 14px', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}
        >
          ⚡ Saltar (dev)
        </motion.button>
      </motion.nav>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 53px)', padding: '24px' }}>
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '40px', width: '100%', maxWidth: '420px' }}
        >

          {/* MODE NORMAL — LOGIN */}
          {!resetMode && !resetSent && (
            <>
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
                <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              </motion.div>

              <motion.div variants={fadeUp} custom={3} style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)}
                    style={{ ...inputStyle, paddingRight: '44px' }} />
                  <button onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--color-text-muted)' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </motion.div>

              {/* OLVIDÉ MI CONTRASEÑA */}
              <motion.div variants={fadeUp} custom={4} style={{ textAlign: 'right', marginBottom: '20px' }}>
                <span
                  onClick={() => { setResetMode(true); setError('') }}
                  style={{ fontSize: '12px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}>
                  ¿Olvidaste tu contraseña?
                </span>
              </motion.div>

              <motion.div variants={fadeUp} custom={5}>
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                  onClick={handleLogin} disabled={loading}
                  style={{ width: '100%', background: loading ? 'var(--color-text-muted)' : 'var(--color-primary)', border: 'none', color: 'var(--color-primary-light)', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, padding: '12px', borderRadius: 'var(--radius-md)', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </motion.button>
              </motion.div>

              <motion.div variants={fadeUp} custom={6}
                style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                ¿No tienes cuenta?{' '}
                <span onClick={() => navigate('register')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}>
                  Regístrate gratis
                </span>
              </motion.div>
            </>
          )}

          {/* MODE RESET — INTRODUIR EMAIL */}
          {resetMode && !resetSent && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '6px' }}>
                FindYour<span style={{ color: 'var(--color-text)' }}>Bet</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
                Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
              </div>

              {error && (
                <div style={{ background: 'var(--color-error-light)', border: '0.5px solid var(--color-error-border)', color: 'var(--color-error)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '18px' }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Email</label>
                <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={handleResetPassword} disabled={loading}
                style={{ width: '100%', background: loading ? 'var(--color-text-muted)' : 'var(--color-primary)', border: 'none', color: 'var(--color-primary-light)', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, padding: '12px', borderRadius: 'var(--radius-md)', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px' }}
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </motion.button>

              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                <span onClick={() => { setResetMode(false); setError('') }} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}>
                  ← Volver al login
                </span>
              </div>
            </motion.div>
          )}

          {/* MODE RESET — EMAIL ENVIAT */}
          {resetSent && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Email enviado</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
                Hemos enviado un enlace a <strong>{email}</strong> para restablecer tu contraseña. Revisa tu bandeja de entrada.
              </div>
              <span onClick={() => { setResetMode(false); setResetSent(false); setError('') }}
                style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}>
                ← Volver al login
              </span>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  )
}