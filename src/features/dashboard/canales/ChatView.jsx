import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/ui/Button'
import { useMessages } from './hooks/useMessages'

const URL_REGEX = /(https?:\/\/[^\s]+)/g

function renderMessage(content, onInternalLink) {
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

  const parts = content.split(URL_REGEX)
  if (parts.length > 1) {
    return (
      <span>
        {parts.map((part, i) => {
          if (!URL_REGEX.test(part)) return part
          const isCanalLink = part.includes('fyourbet.com/canal/')
          if (isCanalLink) {
            const code = part.split('/canal/')[1]?.split(/[?#\s]/)[0]
            return (
              <span key={i} onClick={() => onInternalLink?.(code)}
                style={{ color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', wordBreak: 'break-all' }}>
                📡 {part}
              </span>
            )
          }
          return (
            <a key={i} href={part} target="_blank" rel="noreferrer"
              style={{ color: 'var(--color-primary)', textDecoration: 'underline', wordBreak: 'break-all' }}>
              {part}
            </a>
          )
        })}
      </span>
    )
  }

  return content
}

function isImageMessage(content) { return content.startsWith('[IMAGE]:') }
function isLinkMessage(content) { return content.startsWith('http://') || content.startsWith('https://') }

function InfoView({ channel, messages, isOwner, onClose, onUpdateLinkPublic, copiedLink, onCopyLink }) {
  const images = messages.filter(m => isImageMessage(m.content))
  const links = messages.filter(m => isLinkMessage(m.content))

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '360px', background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflowY: 'auto', zIndex: 10, padding: '20px', boxSizing: 'border-box' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--color-text-muted)' }}>←</button>
        <div style={{ fontWeight: 700, fontSize: '16px' }}>Info del canal</div>
      </div>

      <div style={{ background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '16px', border: '0.5px solid var(--color-border)' }}>
        <div style={{ width: '56px', height: '56px', background: 'var(--color-primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>
          {channel.name[0].toUpperCase()}
        </div>
        <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>#{channel.name}</div>
        {channel.description && <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{channel.description}</div>}
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
          {channel.is_private ? '🔒 Canal privado' : '🌐 Canal público'}
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '16px', border: '0.5px solid var(--color-border)' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Enlace de invitación</div>
        {isOwner && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', cursor: 'pointer' }}
            onClick={() => onUpdateLinkPublic(!channel.link_public)}>
            <div style={{ width: '36px', height: '20px', borderRadius: '999px', background: channel.link_public ? 'var(--color-primary)' : 'var(--color-border)', transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '2px', left: channel.link_public ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </div>
            <span style={{ fontSize: '13px', color: 'var(--color-text)' }}>Enlace visible para todos</span>
          </div>
        )}
        {(channel.link_public || isOwner) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--color-border)' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              fyourbet.com/canal/{channel.invite_code}
            </span>
            <button onClick={onCopyLink}
              style={{ fontSize: '11px', padding: '4px 10px', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'transparent', color: copiedLink ? 'var(--color-primary)' : 'var(--color-text-muted)', cursor: 'pointer', flexShrink: 0 }}>
              {copiedLink ? '✓ Copiado' : '📋 Copiar'}
            </button>
          </div>
        )}
        {!channel.link_public && !isOwner && (
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>El propietario no ha hecho público el enlace.</div>
        )}
      </div>

      {images.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
            Fotos ({images.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {images.map(m => (
              <a key={m.id} href={m.content.replace('[IMAGE]:', '')} target="_blank" rel="noreferrer">
                <img src={m.content.replace('[IMAGE]:', '')} alt="img"
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-sm)', display: 'block' }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
            Enlaces ({links.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {links.map(m => (
              <a key={m.id} href={m.content} target="_blank" rel="noreferrer"
                style={{ fontSize: '13px', color: 'var(--color-primary)', padding: '8px 12px', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--color-border)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                🔗 {m.content}
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function ChatView({ channel: initialChannel, user, onBack, memberCount, onLeave, onOpenCanal }) {
  const { messages, loading, sendMessage, bottomRef } = useMessages(initialChannel.id)
  const [channel, setChannel] = useState(initialChannel)
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [muted, setMuted] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
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

  const handleUpdateLinkPublic = async (value) => {
    await supabase.from('channels').update({ link_public: value }).eq('id', channel.id)
    setChannel(prev => ({ ...prev, link_public: value }))
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://fyourbet.com/canal/${channel.invite_code}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const menuItems = [
    { icon: 'ℹ️', label: 'Info del canal', action: () => { setShowInfo(true); setShowMenu(false) } },
    { icon: muted ? '🔔' : '🔕', label: muted ? 'Activar notificaciones' : 'Silenciar', action: () => { setMuted(!muted); setShowMenu(false) } },
    { icon: '🚩', label: 'Reportar canal', action: () => { alert('Canal reportado. Lo revisaremos pronto.'); setShowMenu(false) } },
    ...(!isOwner ? [{ icon: '🚪', label: 'Abandonar canal', action: () => { onLeave?.(); setShowMenu(false) }, danger: true }] : []),
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', position: 'relative' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--color-text-muted)' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>#{channel.name}</div>
          {channel.description && <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{channel.description}</div>}
        </div>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>👥 {memberCount} participantes</span>
        {isOwner && <span style={{ fontSize: '11px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '3px 10px', borderRadius: 'var(--radius-full)', border: '0.5px solid var(--color-primary-border)', fontWeight: 600 }}>Tu canal</span>}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(!showMenu)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: 'var(--radius-md)' }}>
            ⋮
          </button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  style={{ position: 'absolute', top: '36px', right: 0, background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', zIndex: 10, minWidth: '200px', overflow: 'hidden' }}>
                  {menuItems.map((item, i) => (
                    <button key={i} onClick={item.action}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: item.danger ? 'var(--color-error)' : 'var(--color-text)', textAlign: 'left', borderBottom: i < menuItems.length - 1 ? '0.5px solid var(--color-border)' : 'none', fontFamily: 'var(--font-sans)' }}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
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
              {renderMessage(m.content, onOpenCanal)}
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

      <AnimatePresence>
        {showInfo && (
          <InfoView
            channel={channel}
            messages={messages}
            isOwner={isOwner}
            onClose={() => setShowInfo(false)}
            onUpdateLinkPublic={handleUpdateLinkPublic}
            copiedLink={copiedLink}
            onCopyLink={handleCopyLink}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}