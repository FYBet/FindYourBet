import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from '../../../lib/animations'

export default function ChannelCard({ channel, onClick, onLeave, onDelete, isOwner, memberCount }) {
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