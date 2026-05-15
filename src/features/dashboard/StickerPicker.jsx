import { useState } from 'react'
import { motion } from 'framer-motion'

const PACKS = {
  '🔥': ['🔥','💥','⚡','✨','🚀','💪','🙌','🤩','🥳','🎊','🎉','💯','😎','🫶','❤️','💚'],
  '⚽': ['⚽','🏆','🥇','🎯','🏅','🥊','🏋️','🤾','🧤','🏀','🎾','🏈','🏒','⛷️','🎽','🥋'],
  '💰': ['💸','💰','🤑','📈','📉','✅','❌','🎰','🎲','🃏','🤞','💎','🤝','📊','💹','🏦'],
  '😂': ['😭','😤','🤯','🥶','😏','🙄','😬','🤦','🤷','👀','💀','🫡','😅','🥲','😳','🫠'],
}

export function StickerPicker({ onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState(Object.keys(PACKS)[0])
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
          background: 'var(--color-bg)', border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
          zIndex: 20, width: '288px', overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', borderBottom: '0.5px solid var(--color-border)', padding: '4px 4px 0' }}>
          {Object.keys(PACKS).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '20px', padding: '8px 4px',
                borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                opacity: activeTab === tab ? 1 : 0.45,
                transition: 'opacity 0.15s',
              }}
            >{tab}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px', padding: '8px' }}>
          {PACKS[activeTab].map((s, i) => (
            <button key={i} onClick={() => onSelect(s)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '22px', padding: '6px', borderRadius: 'var(--radius-sm)',
                lineHeight: 1,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-soft)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >{s}</button>
          ))}
        </div>
      </motion.div>
    </>
  )
}
