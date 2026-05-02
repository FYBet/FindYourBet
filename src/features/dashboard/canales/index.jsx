import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stagger } from '../../../lib/animations'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/ui/Button'
import { useChannels } from './hooks/useChannels'
import ChannelCard from './ChannelCard'
import ChatView from './ChatView'
import PreviewView from './PreviewView'
import '../dashboard.css'

export default function Canales({ user }) {
  const { myChannels, joinedChannels, memberCounts, loading, createChannel, deleteChannel, searchChannels, joinChannel, leaveChannel, refetch, MAX_OWN_CHANNELS, MAX_JOINED_CHANNELS } = useChannels(user)
  const [activeChannel, setActiveChannel] = useState(null)
  const [activeMemberCount, setActiveMemberCount] = useState(0)
  const [previewChannel, setPreviewChannel] = useState(null)
  const [previewMemberCount, setPreviewMemberCount] = useState(0)
  const [joiningPreview, setJoiningPreview] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const [createError, setCreateError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [joinError, setJoinError] = useState('')

  const handleOpenChannel = (channel) => {
    setActiveMemberCount(memberCounts[channel.id] || 1)
    setActiveChannel(channel)
  }

  const handlePreviewChannel = async (channel) => {
    const { count } = await supabase
      .from('channel_members').select('*', { count: 'exact', head: true })
      .eq('channel_id', channel.id)
    setPreviewMemberCount((count || 0) + 1)
    setPreviewChannel(channel)
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleJoinFromPreview = async () => {
    if (!previewChannel) return
    setJoiningPreview(true)
    const result = await joinChannel(previewChannel.id)
    setJoiningPreview(false)
    if (result?.error) return
    setActiveMemberCount(previewMemberCount)
    setActiveChannel(previewChannel)
    setPreviewChannel(null)
    await refetch()
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

  if (previewChannel) {
    const isAlreadyMember = joinedChannels.some(j => j.id === previewChannel.id) || myChannels.some(m => m.id === previewChannel.id)
    if (isAlreadyMember) {
      return <ChatView channel={previewChannel} user={user} onBack={() => setPreviewChannel(null)} memberCount={previewMemberCount} />
    }
    return <PreviewView channel={previewChannel} user={user} onBack={() => setPreviewChannel(null)} onJoin={handleJoinFromPreview} joining={joiningPreview} memberCount={previewMemberCount} />
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
                <div key={c.id} onClick={() => handlePreviewChannel(c)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '0.5px solid var(--color-border)', cursor: 'pointer' }}>
                  <div style={{ width: '38px', height: '38px', background: 'var(--color-bg-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0, border: '0.5px solid var(--color-border)' }}>
                    {c.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>#{c.name}</div>
                    {c.description && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{c.description}</div>}
                  </div>
                  {alreadyJoined || isOwn ? (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', padding: '5px 12px' }}>Ya unido ✓</span>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--color-primary)', padding: '5px 12px', fontWeight: 600 }}>Ver canal →</span>
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