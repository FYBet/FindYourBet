import { useEffect, useRef } from 'react'

// Polling intel·ligent: pausa quan el navegador no és visible
export function usePolling(fn, intervalMs, enabled = true) {
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    if (!enabled) return

    let intervalId = null

    const start = () => {
      if (intervalId) return
      intervalId = setInterval(() => fnRef.current(), intervalMs)
    }

    const stop = () => {
      if (!intervalId) return
      clearInterval(intervalId)
      intervalId = null
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fnRef.current()
        start()
      } else {
        stop()
      }
    }

    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [intervalMs, enabled])
}
