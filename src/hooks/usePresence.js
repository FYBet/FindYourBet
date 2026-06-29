import { useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { usePolling } from './usePolling'

// Marca l'usuari com "actiu" actualitzant profiles.last_seen periòdicament.
// Alimenta les analítiques d'usuaris actius del panell d'admin.
// usePolling es pausa automàticament quan la pestanya no és visible, així que
// algú amb la pestanya en segon pla deixa de comptar com a actiu de seguida.
export function usePresence(userId) {
  const ping = useCallback(async () => {
    if (!userId) return
    // Silenciós i tolerant a errors: si la columna last_seen encara no existeix,
    // no ha de petar res a l'app (el panell d'admin avisa de fer el SQL).
    try {
      await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', userId)
    } catch {
      // ignore
    }
  }, [userId])

  // Marca presència immediatament en entrar.
  useEffect(() => { if (userId) ping() }, [userId, ping])

  // I la refresca mentre la pestanya estigui activa.
  usePolling(ping, 45000, !!userId)
}
