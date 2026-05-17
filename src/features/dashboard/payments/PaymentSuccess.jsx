import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'

export default function PaymentSuccess({ user }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = searchParams.get('session_id')

  const [purchase, setPurchase] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) { setLoading(false); return }

    // Poll fins que el webhook hagi processat (pot trigar 1-3s)
    let attempts = 0
    const poll = async () => {
      const { data } = await supabase
        .from('purchases')
        .select('*, offers(name), channels(name, invite_code)')
        .eq('stripe_session_id', sessionId)
        .maybeSingle()

      if (data) {
        setPurchase(data)
        setLoading(false)
      } else if (attempts < 8) {
        attempts++
        setTimeout(poll, 1500)
      } else {
        setLoading(false)
      }
    }
    poll()
  }, [sessionId])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'var(--color-bg)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ fontSize: '32px' }}>⏳</div>
      <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Confirmando tu pago...</div>
    </div>
  )

  if (!purchase) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'var(--color-bg)', fontFamily: 'var(--font-sans)', padding: '24px' }}>
      <div style={{ fontSize: '48px' }}>⚠️</div>
      <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-text)', textAlign: 'center' }}>Pago recibido</div>
      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: '320px' }}>
        Tu pago se ha procesado. Si no ves el canal en unos minutos, contacta con soporte.
      </div>
      <button onClick={() => navigate('/dashboard')} style={{ background: 'var(--color-primary)', color: '#010906', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-sans)' }}>
        Ir al dashboard
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0', background: 'var(--color-bg)', fontFamily: 'var(--font-sans)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Èxit */}
        <div style={{ background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
            ✓
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '22px', color: 'var(--color-text)', marginBottom: '6px' }}>¡Acceso conseguido!</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Ya eres miembro de <strong style={{ color: 'var(--color-text)' }}>{purchase.channels?.name}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', width: '100%' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Oferta comprada</div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>{purchase.offers?.name}</div>
          </div>

          <button onClick={() => navigate('/dashboard')} style={{ width: '100%', background: 'var(--color-primary)', color: '#010906', border: 'none', padding: '14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-sans)' }}>
            Entrar al canal →
          </button>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Recibirás un email de confirmación de Stripe
        </div>
      </div>
    </div>
  )
}
