import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { FormLabel } from '../../components/ui/FormLabel'
import { supabase } from '../../lib/supabase'
import './dashboard.css'

const SPORTS = ['Fútbol', 'Baloncesto', 'Tenis', 'Béisbol', 'Fútbol Americano', 'eSports', 'MMA', 'Otros']
const MARKETS = ['1X2', 'Hándicap', 'Over/Under', 'Ambos marcan', 'Otro']

const inputStyle = { width: '100%', background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '12px 14px', borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box' }
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }

function getMinDateTime() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 10).toLowerCase()
}

export function BetModal({ open, onClose, form, setForm, onSubmit, user, preselectedChannelId }) {
  const [myChannels, setMyChannels] = useState([])
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '', isPrivate: false })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  useEffect(() => {
    if (!open || !user?.id || preselectedChannelId) return
    supabase.from('channels').select('id, name').eq('owner_id', user.id)
      .then(({ data }) => setMyChannels(data || []))
  }, [open, user])

  useEffect(() => {
    if (!open) {
      setShowCreateChannel(false)
      setCreateForm({ name: '', description: '', isPrivate: false })
      setCreateError('')
    }
  }, [open])

  const toggleChannel = (id) => {
    const current = form.channelIds || []
    set('channelIds', current.includes(id)
      ? current.filter(c => c !== id)
      : [...current, id]
    )
  }

  const handleCreateChannel = async () => {
    if (!createForm.name.trim()) { setCreateError('El nombre es obligatorio'); return }
    setCreating(true)
    setCreateError('')
    const { data, error } = await supabase
      .from('channels').insert({
        owner_id: user.id,
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        is_private: createForm.isPrivate,
        invite_code: generateInviteCode(),
      }).select().single()

    if (error) {
      setCreateError('Error al crear el canal. Inténtalo de nuevo.')
      setCreating(false)
      return
    }

    setMyChannels(prev => [data, ...prev])
    set('channelIds', [...(form.channelIds || []), data.id])
    setShowCreateChannel(false)
    setCreateForm({ name: '', description: '', isPrivate: false })
    setCreating(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}>
          <motion.div className="modal"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.96 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <div className="modal-title">Nueva Apuesta</div>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            <div className="form-group-modal">
              <FormLabel>Evento</FormLabel>
              <Input placeholder="ej. Real Madrid vs Barcelona"
                value={form.event} onChange={e => set('event', e.target.value)} />
            </div>

            <div className="form-row-modal">
              <div>
                <FormLabel>Deporte</FormLabel>
                <select className="input" value={form.sport} onChange={e => set('sport', e.target.value)}>
                  {SPORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <FormLabel>Mercado</FormLabel>
                <select className="input" value={form.market} onChange={e => set('market', e.target.value)}>
                  {MARKETS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row-modal">
              <div>
                <FormLabel>Selección</FormLabel>
                <Input placeholder="ej. Real Madrid"
                  value={form.pick} onChange={e => set('pick', e.target.value)} />
              </div>
              <div>
                <FormLabel>Cuota</FormLabel>
                <Input type="number" placeholder="ej. 1.85" step="0.01" min="1.01"
                  value={form.odds} onChange={e => set('odds', e.target.value)} />
              </div>
            </div>

            <div className="form-group-modal">
              <FormLabel>Fecha y hora del evento</FormLabel>
              <Input type="datetime-local" value={form.date}
                min={getMinDateTime()} onChange={e => set('date', e.target.value)} />
            </div>

            <div className="form-group-modal">
              <FormLabel>Stake (1–10)</FormLabel>
              <div className="stake-display">{form.stake}</div>
              <div className="stake-sub">% del bankroll recomendado</div>
              <input type="range" min="1" max="10" value={form.stake}
                onChange={e => set('stake', parseInt(e.target.value))}
                className="stake-slider" />
            </div>

            <div className="form-group-modal">
              <FormLabel>Análisis (opcional)</FormLabel>
              <textarea className="input" rows="3" style={{ resize: 'vertical' }}
                placeholder="Explica brevemente tu razonamiento..."
                value={form.analysis} onChange={e => set('analysis', e.target.value)} />
            </div>

            {/* SELECTOR CANALS */}
            {!preselectedChannelId && (
              <div className="form-group-modal">
                <FormLabel>Publicar en canales *</FormLabel>

                {myChannels.length === 0 && !showCreateChannel && (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                    Necesitas al menos un canal para publicar picks.
                  </div>
                )}

                {myChannels.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                    {myChannels.map(c => {
                      const selected = (form.channelIds || []).includes(c.id)
                      return (
                        <div key={c.id} onClick={() => toggleChannel(c.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: `0.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`, background: selected ? 'var(--color-primary-light)' : 'var(--color-bg-soft)', cursor: 'pointer' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`, background: selected ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {selected && <span style={{ color: '#010906', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: selected ? 600 : 400, color: selected ? 'var(--color-primary)' : 'var(--color-text)' }}>
                            {c.name}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                <AnimatePresence>
                  {showCreateChannel ? (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>Crear canal</div>

                      {createError && (
                        <div style={{ background: 'var(--color-error-light)', border: '0.5px solid var(--color-error-border)', color: 'var(--color-error)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '14px' }}>
                          {createError}
                        </div>
                      )}

                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Nombre *</label>
                        <input autoFocus type="text" placeholder="ej. MarcGol Tips"
                          value={createForm.name}
                          onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                          style={inputStyle} />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Descripción (opcional)</label>
                        <input type="text" placeholder="De qué va tu canal..."
                          value={createForm.description}
                          onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                          style={inputStyle} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', padding: '14px', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--color-border)', cursor: 'pointer' }}
                        onClick={() => setCreateForm(p => ({ ...p, isPrivate: !p.isPrivate }))}>
                        <div style={{ width: '40px', height: '22px', borderRadius: '999px', background: createForm.isPrivate ? 'var(--color-primary)' : 'var(--color-border)', transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}>
                          <div style={{ position: 'absolute', top: '3px', left: createForm.isPrivate ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>🔒 Canal privado</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            Solo accesible con enlace de invitación. No aparece en la búsqueda.
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button onClick={handleCreateChannel} disabled={creating || !createForm.name.trim()}>
                          {creating ? 'Creando...' : 'Crear canal'}
                        </Button>
                        <Button variant="ghost" onClick={() => { setShowCreateChannel(false); setCreateForm({ name: '', description: '', isPrivate: false }); setCreateError('') }}>
                          Cancelar
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setShowCreateChannel(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', background: 'transparent', border: '0.5px dashed var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', width: '100%' }}>
                      <span>+</span>
                      {myChannels.length === 0 ? 'Crear mi primer canal' : 'Crear nuevo canal'}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {preselectedChannelId && (
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '18px', padding: '10px 12px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--color-primary-border)' }}>
                📡 Esta apuesta se publicará en este canal y se añadirá a tu historial.
              </div>
            )}

            <Button full onClick={() => onSubmit(preselectedChannelId)}>📤 Publicar Apuesta</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
