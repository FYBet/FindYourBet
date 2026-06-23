import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../../lib/supabase'
import { usePolling } from '../../../../hooks/usePolling'

// Paritat amb useUnreadChannelCount: manté un Map<convId, nº missatges no llegits>.
// El badge de la sidebar mostra el NOMBRE DE CONVERSES amb no llegits (map.size),
// igual que Canales mostra el nombre de canals amb no llegits.
export function useUnreadDMCount(userId) {
  const [unreadByConv, setUnreadByConv] = useState(new Map())

  const fetchCount = useCallback(async () => {
    if (!userId) return
    const { data: convs } = await supabase
      .from('dm_conversations')
      .select('id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    if (!convs?.length) { setUnreadByConv(new Map()); return }

    // Una sola query: totes les files no llegides d'altri; comptem per conversa al client.
    const { data: rows } = await supabase
      .from('direct_messages')
      .select('conversation_id')
      .in('conversation_id', convs.map(c => c.id))
      .neq('sender_id', userId)
      .is('read_at', null)

    const map = new Map()
    for (const r of (rows || [])) map.set(r.conversation_id, (map.get(r.conversation_id) || 0) + 1)
    setUnreadByConv(map)
  }, [userId])

  // Sobreescriu el comptador d'una conversa amb un valor calculat en viu (DMView
  // reporta els no llegits restants mentre l'usuari fa scroll).
  const setConvCount = useCallback((convId, count) => {
    setUnreadByConv(prev => {
      const cur = prev.get(convId) || 0
      if (cur === count) return prev
      const next = new Map(prev)
      if (count > 0) next.set(convId, count)
      else next.delete(convId)
      return next
    })
  }, [])

  useEffect(() => { if (userId) fetchCount() }, [userId, fetchCount])
  usePolling(fetchCount, 30000, !!userId)

  return { count: unreadByConv.size, unreadByConv, setConvCount, refetch: fetchCount }
}
