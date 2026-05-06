import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function DMView({ conversation, currentUser, onBack, onSend, onFetchMessages, onBlock, onReport, onMute }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [muted, setMuted] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [conversation.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    const data = await onFetchMessages(conversation.id)
    setMessages(data)
    setLoading(false)
  }

  const handleSend = async () => {
    if (!text.trim()) return
    const content = text
    setText('')
    await onSend(conversation.id, content)
    await loadMessages()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const menuItems = [
    { icon: muted ? '🔔' : '🔕', label: muted ? 'Activar notificaciones' : 'Silenciar', action: () => { setMuted(!muted); setShowMenu(false) } },
    { icon: '🚩', label: 'Reportar', action: () => { onReport?.(conversation.id); setShowMenu(false) } },
    { icon: '🚫', label: 'Bloquear', action: () => { onBlock?.(conversation.id); setShowMenu(false) }, danger: true },
  ]

  const isPending = !conversation.otherAccepted && conversation.user1_id === currentUser.id
  const needsAccept = !conversation.isAccepted && conversation.user1_id !== currentUser.id

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', position: 'relative' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--color-text-muted)' }}>←</button>
        <div style={{ width: '36px', height: '36px', background: 'var(--color-primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>
          {(conversation.otherUsername || '?')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>@{conversation.otherUsername}</div>
          {conversation.otherName && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{conversation.otherName}</div>}
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(!showMenu)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--color-text-muted)', padding: '4px 8px' }}>
            ⋮
          </button>
          {showMenu && (
            <>
              <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                style={{ position: 'absolute', top: '36px', right: 0, background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', zIndex: 10, minWidth: '180px', overflow: 'hidden' }}>
                {menuItems.map((item, i) => (
                  <button key={i} onClick={item.action}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: item.danger ? 'var(--color-error)' : 'var(--color-text)', textAlign: 'left', borderBottom: i < menuItems.length - 1 ? '0.5px solid var(--color-border)' : 'none', fontFamily: 'var(--font-sans)' }}>
                    <span>{item.icon}</span><span>{item.label}</span>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* MISSATGES */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>⏳ Cargando...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
            <div>Empieza la conversación</div>
          </div>
        ) : messages.map(m => {
          const isOwn = m.sender_id === currentUser.id
          return (
            <div key={m.id} style={{ alignSelf: isOwn ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
              <div style={{
                background: isOwn ? 'var(--color-primary)' : 'var(--color-bg-soft)',
                color: isOwn ? '#010906' : 'var(--color-text)',
                padding: '10px 14px', borderRadius: 'var(--radius-lg)', fontSize: '14px', lineHeight: 1.5,
                border: isOwn ? 'none' : '0.5px solid var(--color-border)'
              }}>
                {m.content}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px', textAlign: isOwn ? 'right' : 'left' }}>
                {new Date(m.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                {isOwn && m.read_at && <span style={{ marginLeft: '4px' }}>✓✓</span>}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* BANNER PENDENT */}
      {isPending && (
        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)', padding: '12px', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--color-border)' }}>
          ⏳ Esperando que @{conversation.otherUsername} acepte la conversación
        </div>
      )}

      {/* BANNER ACCEPTAR */}
      {needsAccept && (
        <div style={{ marginTop: '12px', padding: '16px', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--color-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
            @{conversation.otherUsername} quiere enviarte un mensaje
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button onClick={() => { onBlock?.(conversation.id) }}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--color-error-border)', background: 'var(--color-error-light)', color: 'var(--color-error)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
              Rechazar
            </button>
            <button onClick={() => { /* acceptar */ }}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-primary)', color: '#010906', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* INPUT */}
      {!needsAccept && !isPending && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'flex-end' }}>
          <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey}
            placeholder="Escribe un mensaje... (Enter para enviar)" rows={2}
            style={{ flex: 1, background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '12px 14px', borderRadius: 'var(--radius-md)', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          <button onClick={handleSend} disabled={!text.trim()}
            style={{ background: text.trim() ? 'var(--color-primary)' : 'var(--color-bg-soft)', color: text.trim() ? '#010906' : 'var(--color-text-muted)', border: 'none', padding: '12px 18px', borderRadius: 'var(--radius-md)', cursor: text.trim() ? 'pointer' : 'default', fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-sans)', flexShrink: 0 }}>
            Enviar
          </button>
        </div>
      )}
    </motion.div>
  )
}