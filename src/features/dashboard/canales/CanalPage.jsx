import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function CanalPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email,
          email: session.user.email,
        })
      }
    })

    const fetchChannel = async () => {
      const { data } = await supabase
        .from('channels').select('*')
        .eq('invite_code', code.toUpperCase()).single()
      if (!data) { setNotFound(true); setLoading(false); return }
      setChannel(data)
      setLoading(false)
    }

    fetchChannel()
  }, [code])

  useEffect(() => {
    if (user && channel) {
      navigate(`/dashboard?canal=${code}`)
    }
  }, [user, channel])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <div>Cargando canal...</div>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Canal no encontrado</div>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>El enlace de invitación no es válido.</div>
        <button onClick={() => navigate('/')}
          style={{ background: 'var(--color-primary)', color: '#010906', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700 }}>
          Volver al inicio
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>#{channel.name}</div>
        {channel.description && <div style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>{channel.description}</div>}
        {channel.is_private && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>🔒 Canal privado</div>}
        <div style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>
          Inicia sesión para unirte a este canal
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button onClick={() => navigate(`/login?redirect=/canal/${code}`)}
            style={{ background: 'var(--color-primary)', color: '#010906', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700 }}>
            Iniciar sesión
          </button>
          <button onClick={() => navigate(`/register?redirect=/canal/${code}`)}
            style={{ background: 'transparent', color: 'var(--color-text)', border: '0.5px solid var(--color-border)', padding: '12px 24px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>
            Registrarse
          </button>
        </div>
      </div>
    </div>
  )
}