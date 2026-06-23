import { useState, useRef, useCallback } from 'react'

export function useResizablePanel(storageKey, defaultPct = 25, min = 15, max = 50) {
  const [pct, setPct] = useState(() => {
    try { return parseFloat(localStorage.getItem(storageKey)) || defaultPct }
    catch { return defaultPct }
  })
  const containerRef = useRef(null)

  const onResizerMouseDown = useCallback((e) => {
    e.preventDefault()
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'

    const onMove = (ev) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newPct = ((rect.right - ev.clientX) / rect.width) * 100
      setPct(Math.min(max, Math.max(min, newPct)))
    }

    const onUp = () => {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      setPct(prev => { localStorage.setItem(storageKey, prev.toFixed(2)); return prev })
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [storageKey, min, max]) // eslint-disable-line react-hooks/exhaustive-deps

  return { pct, containerRef, onResizerMouseDown }
}
