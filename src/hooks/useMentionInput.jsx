import { useState, useRef } from 'react'
import { getActiveMention, insertMention } from '../lib/mentions'
import { useMentionSuggestions } from './useMentionSuggestions'
import MentionDropdown from '../components/ui/MentionDropdown'

// Encapsula l'autocompletat de mencions per a un textarea controlat.
// Ús: const m = useMentionInput({ currentUser, text, setText, inputRef })
//  - onChange:  m.handleChange(e.target.value, e.target.selectionStart)
//  - onKeyDown: if (m.handleKeyDown(e)) return  // tecla consumida pel dropdown
//  - render:    { m.dropdown }  (dins d'un contenidor position:relative damunt l'input)
export function useMentionInput({ currentUser, text, setText, inputRef }) {
  const { search } = useMentionSuggestions(currentUser)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [active, setActive] = useState(0)
  const mentionRef = useRef(null) // { query, start } de la menció activa

  const handleChange = (value, caret) => {
    setText(value)
    const mention = getActiveMention(value, caret)
    if (!mention) { setOpen(false); mentionRef.current = null; return }
    mentionRef.current = mention
    search(mention.query).then(res => { setItems(res); setActive(0); setOpen(res.length > 0) })
  }

  const pick = (user) => {
    const mention = mentionRef.current
    if (!mention) return
    const caret = inputRef.current?.selectionStart ?? text.length
    const { text: nt, caret: nc } = insertMention(text, caret, mention.start, user.username)
    setText(nt)
    setOpen(false)
    mentionRef.current = null
    requestAnimationFrame(() => {
      const el = inputRef.current
      if (el) { el.focus(); el.setSelectionRange(nc, nc) }
    })
  }

  // Retorna true si la tecla l'ha consumit el dropdown (el caller NO ha d'enviar).
  const handleKeyDown = (e) => {
    if (!open || !items.length) return false
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => (a + 1) % items.length); return true }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => (a - 1 + items.length) % items.length); return true }
    if (e.key === 'Enter') { e.preventDefault(); pick(items[active]); return true }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return true }
    return false
  }

  const dropdown = open ? <MentionDropdown items={items} active={active} onPick={pick} /> : null
  return { handleChange, handleKeyDown, dropdown }
}
