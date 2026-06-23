import { useState, useCallback } from 'react'

function makeStorage(storageKey) {
  const read = () => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}') }
    catch { return {} }
  }
  const write = (m) => localStorage.setItem(storageKey, JSON.stringify(m))
  return { read, write }
}

export function usePinnedChannels(storageKey = 'fyb_pinned_channels') {
  const [, tick] = useState(0)
  const refresh = useCallback(() => tick(n => n + 1), [])
  const { read, write } = makeStorage(storageKey)

  const pin = useCallback((id) => {
    const m = read(); m[id] = true; write(m); refresh()
  }, [storageKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const unpin = useCallback((id) => {
    const m = read(); delete m[id]; write(m); refresh()
  }, [storageKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const isPinned = useCallback((id) => !!read()[id], [storageKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { pin, unpin, isPinned }
}
