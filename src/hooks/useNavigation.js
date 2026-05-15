// Centralizamos la navegación aquí para que si cambiamos
// de sistema de routing (React Router, etc.) solo
// haga falta tocar este fichero y no todos los componentes
import { useState } from 'react'

export function useNavigation(initial = 'landing') {
  const [page, setPage] = useState(initial)

  const navigate = (p) => {
    setPage(p)
    window.scrollTo(0, 0)
  }

  return { page, navigate }
}