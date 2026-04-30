import { useState } from 'react'
import './Register.css'

function Register({ navigate, login }) {
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

  return (
    <div className="register-page">

      <nav className="register-nav">
        <div className="register-logo" onClick={() => navigate('landing')}>
          FindYour<span>Bet</span>
        </div>
      </nav>

      <div className="register-wrapper">
        <div className="register-box">

          <div className="register-box-logo">FindYour<span>Bet</span></div>
          <div className="register-subtitle">Crea tu cuenta</div>

          {error && (
            <div style={{ background: '#FEE2E2', border: '0.5px solid #FCA5A5', color: '#e53e3e', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '18px' }}>
              {error}
            </div>
          )}

          {/* NOM I COGNOMS */}
          <div className="form-row">
            <div>
              <label className="form-label">Nombre *</label>
              <input type="text" className="form-input" placeholder="" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Apellidos *</label>
              <input type="text" className="form-input" placeholder="" value={form.surname} onChange={e => update('surname', e.target.value)} />
            </div>
          </div>

          {/* DATA NEIXEMENT I NACIONALITAT */}
          <div className="form-row">
            <div>
              <label className="form-label">Fecha de nacimiento *</label>
              <input type="date" className="form-input" value={form.birthdate} onChange={e => update('birthdate', e.target.value)} max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="form-label">Nacionalidad *</label>
              <select className="form-input" value={form.nationality} onChange={e => update('nationality', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>España</option>
                <option>México</option>
                <option>Argentina</option>
                <option>Colombia</option>
                <option>Chile</option>
                <option>Perú</option>
                <option>Venezuela</option>
                <option>Ecuador</option>
                <option>Bolivia</option>
                <option>Paraguay</option>
                <option>Uruguay</option>
                <option>Otra</option>
              </select>
            </div>
          </div>

          {/* USUARI */}
          <div className="form-group">
            <label className="form-label">Nombre de usuario *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '14px' }}>@</span>
              <input type="text" className="form-input" placeholder="" value={form.user} onChange={e => update('user', e.target.value.replace('@', ''))} style={{ paddingLeft: '28px' }} />
            </div>
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" placeholder="" value={form.email} onChange={e => update('email', e.target.value)} />
          </div>

          {/* CONTRASENYES */}
          <div className="form-row">
            <div>
              <label className="form-label">Contraseña *</label>
              <input type="password" className="form-input" placeholder="" value={form.pass} onChange={e => update('pass', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Repetir contraseña *</label>
              <input type="password" className="form-input" placeholder="" value={form.passConfirm} onChange={e => update('passConfirm', e.target.value)} />
            </div>
          </div>

          {/* CHECKBOXES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#555' }}>
              <input type="checkbox" checked={age} onChange={e => setAge(e.target.checked)} style={{ marginTop: '2px', accentColor: '#0F6E56', width: '15px', height: '15px', flexShrink: 0 }} />
              <span>Confirmo que tengo <strong>18 años o más</strong> y que las apuestas están permitidas en mi país de residencia.</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#555' }}>
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ marginTop: '2px', accentColor: '#0F6E56', width: '15px', height: '15px', flexShrink: 0 }} />
              <span>He leído y acepto los <a href="#" style={{ color: '#0F6E56', fontWeight: 500 }}>Términos y Condiciones</a> y la <a href="#" style={{ color: '#0F6E56', fontWeight: 500 }}>Política de Privacidad</a> de FindYourBet.</span>
            </label>
          </div>

          <button className="btn-submit" onClick={handleRegister}>
            Crear cuenta
          </button>

          <div style={{ background: '#f9f9f7', border: '0.5px solid #e0e0e0', borderRadius: '8px', padding: '10px 14px', marginTop: '16px', fontSize: '12px', color: '#888', textAlign: 'center' }}>
            🔒 Tus datos están protegidos y nunca serán compartidos con terceros.
          </div>

          <div className="auth-switch">
            ¿Ya tienes cuenta?{' '}
            <a onClick={() => navigate('login')}>Inicia sesión</a>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Register