// Centralitzem la navegació aquí perquè si canviem
// de sistema de routing (React Router, etc.) només
// cal tocar aquest fitxer i no tots els components
import { useState } from 'react'

export function useNavigation(initial = 'landing') {
  const [page, setPage] = useState(initial)

  const navigate = (p) => {
    setPage(p)
    window.scrollTo(0, 0)
  }

  return { page, navigate }
}