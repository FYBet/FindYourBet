import { useState } from 'react'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' }
  })
}

export default function Register({ navigate, login }) {
  const [form, setForm] = useState({
    name: '', surname: '', birthdate: '', nationality: '',
    user: '', email: '', pass: '', passConfirm: ''
  })
  const [terms, setTerms] = useState(false)
  const [age, setAge] = useState(false)
  const [error, setError] = useState('')

  const update = (field, val) => setForm({ ...form, [field]: val })

  const handleRegister = () => {
    if (!form.name || !form.surname || !form.birthdate || !form.user || !form.email || !form.pass || !form.passConfirm) {
      setError('Rellena todos los campos obligatorios'); return
    }
    if (form.pass !== form.passConfirm) {
      setError('Las contraseñas no coinciden'); return
    }
    if (form.pass.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres'); return
    }
    if (!/[A-Z]/.test(form.pass)) {
      setError('La contraseña debe contener al menos una mayúscula'); return
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/.test(form.pass)) {
      setError('La contraseña debe contener al menos un carácter especial (!@#$%...)'); return
    }
    const birth = new Date(form.birthdate)
    const today = new Date()
    const edad = today.getFullYear() - birth.getFullYear()
    if (edad < 18) {
      setError('Debes ser mayor de 18 años para registrarte'); return
    }
    if (!terms || !age) {
      setError('Debes aceptar los términos y confirmar tu edad'); return
    }
    setError('')
    login({ name: form.name, surname: form.surname, user: form.user, email: form.email })
  }

  const inputStyle = {
    width: '100%', background: 'var(--color-bg-soft)',
    border: '0.5px solid var(--color-border)', color: 'var(--color-text)',
    fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '12px 14px',
    borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: 'var(--color-text-soft)', textTransform: 'uppercase',
    letterSpacing: '0.8px', marginBottom: '8px'
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 53px)', padding: '32px 24px' }}>
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '40px', width: '100%', maxWidth: '480px' }}
        >
          <motion.div variants={fadeUp} custom={1}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '6px' }}>
              FindYour<span style={{ color: 'var(--color-text)' }}>Bet</span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '28px' }}>Crea tu cuenta — es gratis</div>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--color-error-light)', border: '0.5px solid var(--color-error-border)', color: 'var(--color-error)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '18px' }}>
              {error}
            </motion.div>
          )}

          {/* NOM I COGNOMS */}
          <motion.div variants={fadeUp} custom={2} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input type="text" style={inputStyle} placeholder="Tu nombre" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Apellidos *</label>
              <input type="text" style={inputStyle} placeholder="Tus apellidos" value={form.surname} onChange={e => update('surname', e.target.value)} />
            </div>
          </motion.div>

          {/* DATA I NACIONALITAT */}
          <motion.div variants={fadeUp} custom={3} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={labelStyle}>Fecha de nacimiento *</label>
              <input type="date" style={inputStyle} value={form.birthdate} onChange={e => update('birthdate', e.target.value)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]} />
            </div>
            <div>
              <label style={labelStyle}>Nacionalidad *</label>
              <select style={inputStyle} value={form.nationality} onChange={e => update('nationality', e.target.value)}>
                <option value="">Seleccionar...</option>
                {['España', 'México', 'Argentina', 'Colombia', 'Chile', 'Perú', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Otra'].map(n => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* USUARI */}
          <motion.div variants={fadeUp} custom={4} style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Nombre de usuario *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '14px' }}>@</span>
              <input type="text" style={{ ...inputStyle, paddingLeft: '28px' }} placeholder="tuusuario" value={form.user} onChange={e => update('user', e.target.value.replace('@', ''))} />
            </div>
          </motion.div>

          {/* EMAIL */}
          <motion.div variants={fadeUp} custom={5} style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Email *</label>
            <input type="email" style={inputStyle} placeholder="tu@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
          </motion.div>

          {/* CONTRASENYES */}
          <motion.div variants={fadeUp} custom={6} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={labelStyle}>Contraseña *</label>
              <input type="password" style={inputStyle} placeholder="Mínimo 8 caracteres" value={form.pass} onChange={e => update('pass', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Repetir contraseña *</label>
              <input type="password" style={inputStyle} placeholder="Repite la contraseña" value={form.passConfirm} onChange={e => update('passConfirm', e.target.value)} />
            </div>
          </motion.div>

          {/* CHECKBOXES */}
          <motion.div variants={fadeUp} custom={7} style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-soft)' }}>
              <input type="checkbox" checked={age} onChange={e => setAge(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--color-primary)', width: '15px', height: '15px', flexShrink: 0 }} />
              <span>Confirmo que tengo <strong>18 años o más</strong> y que las apuestas están permitidas en mi país de residencia.</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-soft)' }}>
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--color-primary)', width: '15px', height: '15px', flexShrink: 0 }} />
              <span>He leído y acepto los <a href="#" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Términos y Condiciones</a> y la <a href="#" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Política de Privacidad</a>.</span>
            </label>
          </motion.div>

          <motion.div variants={fadeUp} custom={8}>
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleRegister}
              style={{ width: '100%', background: 'var(--color-primary)', border: 'none', color: 'var(--color-primary-light)', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, padding: '12px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
            >
              Crear cuenta
            </motion.button>
          </motion.div>

          <motion.div variants={fadeUp} custom={9}
            style={{ background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginTop: '16px', fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            🔒 Tus datos están protegidos y nunca serán compartidos con terceros.
          </motion.div>

          <motion.div variants={fadeUp} custom={10}
            style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            ¿Ya tienes cuenta?{' '}
            <span onClick={() => navigate('login')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}>
              Inicia sesión
            </span>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}