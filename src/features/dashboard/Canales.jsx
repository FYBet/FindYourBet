import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, stagger } from '../../lib/animations'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import './dashboard.css'

const MAX_OWN_CHANNELS = 5
const MAX_JOINED_CHANNELS = 30

// ── Hook missatges ──────────────────────────────────────────
function useMessages(channelId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)
  const channelIdRef = useRef(channelId)

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('channel_messages')
      .select('*')
      .eq('channel_id', channelIdRef.current)
      .order('created_at', { ascending: true })
      .limit(100)
    if (data) setMessages(data)
    setLoading(false)
  }

  useEffect(() => {
    if (!channelId) { setLoading(false); return }
    channelIdRef.current = channelId
    fetchMessages()
    // Polling cada 2 segons
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [channelId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content, userId) => {
    if (!content.trim()) return
    await supabase.from('channel_messages').insert({
      channel_id: channelId,
      user_id: userId,
      content: content.trim()
    })
    await fetchMessages()
  }

  return { messages, loading, sendMessage, bottomRef }
}

// ── Hook canals ─────────────────────────────────────────────
function useChannels(user) {
  const [myChannels, setMyChannels] = useState([])
  const [joinedChannels, setJoinedChannels] = useState([])
  const [memberCounts, setMemberCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id || user.id === 'dev-skip') { setLoading(false); return }
    fetchChannels()
  }, [user])

  const fetchChannels = async () => {
    setLoading(true)

    const { data: own } = await supabase
      .from('channels')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    setMyChannels(own || [])

    const { data: memberships } = await supabase
      .from('channel_members')
      .select('channel_id, channels(*)')
      .eq('user_id', user.id)

    // Filtra els canals propis de la llista de units
    const joined = memberships
      ?.map(m => m.channels)
      .filter(c => c && !(own || []).some(o => o.id === c.id)) || []

    setJoinedChannels(joined)

    const allChannels = [...(own || []), ...joined]
    const counts = {}
    await Promise.all(allChannels.map(async c => {
      const { count } = await supabase
        .from('channel_members')
        .select('*', { count: 'exact', head: true })
        .eq('channel_id', c.id)
      counts[c.id] = (count || 0) + 1
    }))
    setMemberCounts(counts)
    setLoading(false)
  }

  const createChannel = async (name, description) => {
    if (!name.trim()) return { error: 'El nombre es obligatorio' }
    if (myChannels.length >= MAX_OWN_CHANNELS) return { error: `Límite de ${MAX_OWN_CHANNELS} canales propios alcanzado` }

    const { data, error } = await supabase
      .from('channels')
      .insert({ owner_id: user.id, name: name.trim(), description: description.trim() })
      .select().single()

    if (!error) {
      setMyChannels(prev => [data, ...prev])
      setMemberCounts(prev => ({ ...prev, [data.id]: 1 }))
    }
    return { data, error }
  }

  const deleteChannel = async (channelId) => {
    await supabase.from('channel_messages').delete().eq('channel_id', channelId)
    await supabase.from('channel_members').delete().eq('channel_id', channelId)
    await supabase.from('channels').delete().eq('id', channelId)
    setMyChannels(prev => prev.filter(c => c.id !== channelId))
  }

  const searchChannels = async (query) => {
    if (!query.trim()) return []
    const { data } = await supabase
      .from('channels')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10)
    return data || []
  }

  const joinChannel = async (channelId) => {
    if (joinedChannels.length >= MAX_JOINED_CHANNELS) return { error: `Límite de ${MAX_JOINED_CHANNELS} canales alcanzado` }

    const { data: existing } = await supabase
      .from('channel_members')
      .select('id')
      .eq('channel_id', channelId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) return { alreadyJoined: true }

    const { error } = await supabase
      .from('channel_members')
      .insert({ channel_id: channelId, user_id: user.id })

    if (!error) await fetchChannels()
    return { error }
  }

  const leaveChannel = async (channelId) => {
    await supabase.from('channel_members').delete()
      .eq('channel_id', channelId).eq('user_id', user.id)
    await fetchChannels()
  }

  return {
    myChannels, joinedChannels, memberCounts, loading,
    createChannel, deleteChannel, searchChannels, joinChannel, leaveChannel,
    refetch: fetchChannels
  }
}

// ── Chat View ────────────────────────────────────────────────
function ChatView({ channel, user, onBack, memberCount }) {
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

  const renderMessage = (content) => {
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

// ── Canal Card ───────────────────────────────────────────────
function ChannelCard({ channel, onClick, onLeave, onDelete, isOwner, memberCount }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <motion.div variants={fadeUp}
      style={{ background: 'var(--color-bg)', border: `0.5px solid ${isOwner ? 'var(--color-primary-border)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}>
        <div style={{ width: '42px', height: '42px', background: isOwner ? 'var(--color-primary-light)' : 'var(--color-bg-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: 700, color: isOwner ? 'var(--color-primary)' : 'var(--color-text-muted)', flexShrink: 0, border: '0.5px solid var(--color-border)' }}>
          {channel.name[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>#{channel.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px', display: 'flex', gap: '8px' }}>
            {channel.description && <span>{channel.description} ·</span>}
            <span>👥 {memberCount ?? '...'} participantes</span>
          </div>
        </div>
      </div>

      {isOwner ? (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '3px 10px', borderRadius: 'var(--radius-full)', border: '0.5px solid var(--color-primary-border)', fontWeight: 600 }}>Propietario</span>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              style={{ fontSize: '12px', padding: '5px 10px', border: '0.5px solid var(--color-error-border)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-error)', cursor: 'pointer' }}>
              🗑️
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => { onDelete(channel.id); setConfirmDelete(false) }}
                style={{ fontSize: '11px', padding: '5px 10px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-error)', color: '#fff', cursor: 'pointer' }}>
                Confirmar
              </button>
              <button onClick={() => setConfirmDelete(false)}
                style={{ fontSize: '11px', padding: '5px 10px', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      ) : (
        <button onClick={onLeave}
          style={{ fontSize: '12px', padding: '5px 12px', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
          Salir
        </button>
      )}
    </motion.div>
  )
}

// ── Main ─────────────────────────────────────────────────────
export default function Canales({ user }) {
  const { myChannels, joinedChannels, memberCounts, loading, createChannel, deleteChannel, searchChannels, joinChannel, leaveChannel, refetch } = useChannels(user)
  const [activeChannel, setActiveChannel] = useState(null)
  const [activeMemberCount, setActiveMemberCount] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const [createError, setCreateError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [joinLoading, setJoinLoading] = useState(null)
  const [joinError, setJoinError] = useState('')

  const handleOpenChannel = (channel) => {
    setActiveMemberCount(memberCounts[channel.id] || 1)
    setActiveChannel(channel)
  }

  const handleCreate = async () => {
    setCreateError('')
    const result = await createChannel(createForm.name, createForm.description)
    if (result?.error) { setCreateError(result.error); return }
    setCreateForm({ name: '', description: '' })
    setShowCreate(false)
  }

  const handleSearch = async (q) => {
    setSearchQuery(q)
    setJoinError('')
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    const results = await searchChannels(q)
    setSearchResults(results)
    setSearching(false)
  }

  const handleJoin = async (channel) => {
    setJoinError('')
    setJoinLoading(channel.id)
    const result = await joinChannel(channel.id)
    setJoinLoading(null)
    if (result?.error) { setJoinError(result.error); return }
    if (result?.alreadyJoined) return
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
    await refetch()
  }

  if (activeChannel) {
    return <ChatView channel={activeChannel} user={user} onBack={() => setActiveChannel(null)} memberCount={activeMemberCount} />
  }

  const canCreateMore = myChannels.length < MAX_OWN_CHANNELS
  const canJoinMore = joinedChannels.length < MAX_JOINED_CHANNELS

  return (
    <motion.div key="canales" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, marginBottom: '4px' }}>Canales</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Mis canales: {myChannels.length}/{MAX_OWN_CHANNELS} · Unidos: {joinedChannels.length}/{MAX_JOINED_CHANNELS}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" size="sm" onClick={() => { setShowSearch(!showSearch); setShowCreate(false) }}>🔍 Buscar canal</Button>
          {canCreateMore && <Button size="sm" onClick={() => { setShowCreate(!showCreate); setShowSearch(false) }}>+ Crear canal</Button>}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Crear canal</div>
            {createError && (
              <div style={{ background: 'var(--color-error-light)', border: '0.5px solid var(--color-error-border)', color: 'var(--color-error)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '14px' }}>
                {createError}
              </div>
            )}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Nombre *</label>
              <input type="text" placeholder="ej. MarcGol Tips" value={createForm.name}
                onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                style={{ width: '100%', background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '12px 14px', borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Descripción (opcional)</label>
              <input type="text" placeholder="De qué va tu canal..." value={createForm.description}
                onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                style={{ width: '100%', background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '12px 14px', borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button onClick={handleCreate} disabled={!createForm.name.trim()}>Crear canal</Button>
              <Button variant="ghost" onClick={() => { setShowCreate(false); setCreateError('') }}>Cancelar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Buscar canales</div>
            <input type="text" placeholder="Busca por nombre del canal..."
              value={searchQuery} onChange={e => handleSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '12px 14px', borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }} />
            {joinError && (
              <div style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '12px' }}>
                {joinError}
              </div>
            )}
            {searching && <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>Buscando...</div>}
            {searchResults.map(c => {
              const alreadyJoined = joinedChannels.some(j => j.id === c.id)
              const isOwn = myChannels.some(m => m.id === c.id)
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '0.5px solid var(--color-border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>#{c.name}</div>
                    {c.description && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{c.description}</div>}
                  </div>
                  {alreadyJoined || isOwn ? (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', padding: '5px 12px' }}>Ya unido ✓</span>
                  ) : !canJoinMore ? (
                    <span style={{ fontSize: '12px', color: 'var(--color-error)', padding: '5px 12px' }}>Límite alcanzado</span>
                  ) : (
                    <Button size="sm" disabled={joinLoading === c.id} onClick={() => handleJoin(c)}>
                      {joinLoading === c.id ? 'Uniéndose...' : 'Unirse'}
                    </Button>
                  )}
                </div>
              )
            })}
            {searchQuery && !searching && searchResults.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', paddingTop: '8px' }}>No se encontraron canales</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {myChannels.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            Mis canales ({myChannels.length}/{MAX_OWN_CHANNELS})
          </div>
          <motion.div initial="hidden" animate="visible" variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {myChannels.map(c => (
              <ChannelCard key={c.id} channel={c} isOwner={true}
                memberCount={memberCounts[c.id]}
                onClick={() => handleOpenChannel(c)}
                onDelete={deleteChannel}
              />
            ))}
          </motion.div>
        </div>
      )}

      {joinedChannels.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            Canales unidos ({joinedChannels.length}/{MAX_JOINED_CHANNELS})
          </div>
          <motion.div initial="hidden" animate="visible" variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {joinedChannels.map(c => (
              <ChannelCard key={c.id} channel={c} isOwner={false}
                memberCount={memberCounts[c.id]}
                onClick={() => handleOpenChannel(c)}
                onLeave={() => leaveChannel(c.id)}
              />
            ))}
          </motion.div>
        </div>
      )}

      {!loading && myChannels.length === 0 && joinedChannels.length === 0 && !showCreate && !showSearch && (
        <div className="empty-state">
          <div className="empty-icon">📡</div>
          <div className="empty-title">Sin canales todavía</div>
          <div className="empty-sub">Crea tu propio canal o únete al de otro tipster.</div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <Button onClick={() => setShowCreate(true)}>+ Crear canal</Button>
            <Button variant="ghost" onClick={() => setShowSearch(true)}>🔍 Buscar</Button>
          </div>
        </div>
      )}

    </motion.div>
  )
}