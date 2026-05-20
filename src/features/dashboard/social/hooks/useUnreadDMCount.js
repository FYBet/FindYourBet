import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../../lib/supabase'
import { usePolling } from '../../../../hooks/usePolling'

export function useUnreadDMCount(userId) {
  const [count, setCount] = useState(0)

  const fetchCount = useCallback(async () => {
    if (!userId) return
    const { data: convs } = await supabase
      .from('dm_conversations')
      .select('id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    if (!convs?.length) return setCount(0)
    const { count: unread } = await supabase
      .from('direct_messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', convs.map(c => c.id))
      .neq('sender_id', userId)
      .is('read_at', null)
    setCount(unread || 0)
  }, [userId])

  useEffect(() => { if (userId) fetchCount() }, [userId, fetchCount])

  usePolling(fetchCount, 30000, !!userId)

  return count
}
