import { MENTION_RE } from '../../lib/mentions'

// Renderitza un text pla convertint les mencions @usuario en enllaços clicables.
// onMention(username) s'encarrega d'obrir el perfil (emergent).
export default function MentionText({ text, onMention, color = 'var(--color-primary)' }) {
  if (!text || typeof text !== 'string') return text || null
  if (!text.includes('@')) return text

  const nodes = []
  let last = 0
  let m
  const re = new RegExp(MENTION_RE.source, 'g')
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const username = m[1]
    nodes.push(
      <span key={m.index} onClick={(e) => { e.stopPropagation(); onMention?.(username) }}
        style={{ color, fontWeight: 700, cursor: 'pointer' }}>
        @{username}
      </span>
    )
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return <>{nodes}</>
}
