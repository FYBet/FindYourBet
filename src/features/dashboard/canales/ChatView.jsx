import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/ui/Button'
import { useMessages } from './hooks/useMessages'

function renderMessage(content) {
  if (content.startsWith('[IMAGE]:')) {
    const url = content.replace('[IMAGE]:', '')
    return <img src={url} alt="img" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-md)', display: 'block' }} />
  }
  if (content.startsWith('[FILE:')) {
    const match = content.match(/\[FILE:(.*?)\]:(.*)/)
    if (match) return (
      <a href={match[2]} target="_blank" rel="noreferrer" style={{ color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <span>📎</span><span style={{ textDecoration: 'underline', fontSize: '13px' }}>{match[1]}</span>
      </a>
    )
  }
  return content
}

export default function ChatView({ channel, user, onBack, memberCount }) {
  const { messages, loading, sendMessage, bottomRef } = useMessages(channel.id)
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const isOwner = channel.owner_id === user.id

  const handleSend = async () => {
    if (!text.trim()) return
    const content = text
    setText('')
    await sendMessage(content, user.id)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${channel.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('channel-files').upload(path, file)
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('channel-files').getPublicUrl(path)
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase())
      const content = isImage ? `[IMAGE]:${urlData.publicUrl}` : `[FILE:${file.name}]:${urlData.publicUrl}`
      await sendMessage(content, user.id)
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--color-text-muted)' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>#{channel.name}</div>
          {channel.description && <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{channel.description}</div>}
        </div>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>👥 {memberCount} participantes</span>
        {isOwner && <span style={{ fontSize: '11px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '3px 10px', borderRadius: 'var(--radius-full)', border: '0.5px solid var(--color-primary-border)', fontWeight: 600 }}>Tu canal</span>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>⏳ Cargando mensajes...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
            <div>Sin mensajes todavía.</div>
          </div>
        ) : messages.map(m => (
          <div key={m.id} style={{ alignSelf: m.user_id === user.id ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
            <div style={{
              background: m.user_id === user.id ? 'var(--color-primary)' : 'var(--color-bg-soft)',
              color: m.user_id === user.id ? 'var(--color-primary-light)' : 'var(--color-text)',
              padding: '10px 14px', borderRadius: 'var(--radius-lg)', fontSize: '14px', lineHeight: 1.5,
              border: m.user_id === user.id ? 'none' : '0.5px solid var(--color-border)'
            }}>
              {renderMessage(m.content)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px', textAlign: m.user_id === user.id ? 'right' : 'left' }}>
              {new Date(m.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {isOwner ? (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'flex-end' }}>
          <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*,.pdf" style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '11px 14px', cursor: 'pointer', fontSize: '16px', color: 'var(--color-text-muted)', flexShrink: 0 }}>
            {uploading ? '⏳' : '📎'}
          </button>
          <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey}
            placeholder="Escribe un mensaje... (Enter para enviar)" rows={2}
            style={{ flex: 1, background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '12px 14px', borderRadius: 'var(--radius-md)', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          <Button onClick={handleSend} disabled={!text.trim()}>Enviar</Button>
        </div>
      ) : (
        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)', padding: '12px', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--color-border)' }}>
          Solo el propietario del canal puede enviar mensajes
        </div>
      )}
    </motion.div>
  )
}