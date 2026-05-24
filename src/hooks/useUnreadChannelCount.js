import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { usePolling } from './usePolling'

// Clau localStorage per guardar quan l'usuari ha llegit per últim cop cada canal
export function markChannelRead(userId, channelId) {
  if (!userId || !channelId) return
  localStorage.setItem(`fyb_ch_read_${userId}_${channelId}`, new Date().toISOString())
}

export function useUnreadChannelCount(userId) {
  // Map<channelId, unreadCount> — mateixa estructura que useDMs
  const [unreadCounts, setUnreadCounts] = useState(new Map())

  // Marca un canal com llegit immediatament (localStorage + state) sense esperar el poll
  const markRead = useCallback((channelId) => {
    markChannelRead(userId, channelId)
    setUnreadCounts(prev => {
      const next = new Map(prev)
      next.delete(channelId)
      return next
    })
  }, [userId])

  const fetchUnread = useCallback(async () => {
    if (!userId) return

    const [{ data: own }, { data: memberships }] = await Promise.all([
      supabase.from('channels').select('id').eq('owner_id', userId).is('deleted_at', null),
      supabase.from('channel_members').select('channel_id').eq('user_id', userId),
    ])

    const allIds = [...new Set([
      ...(own || []).map(c => c.id),
      ...(memberships || []).map(m => m.channel_id),
    ])]

    if (!allIds.length) { setUnreadCounts(new Map()); return }

    // Per cada canal: compte missatges d'altri posteriors a l'últim read
    const results = await Promise.all(
      allIds.map(id => {
        const lastRead = localStorage.getItem(`fyb_ch_read_${userId}_${id}`)
        let query = supabase.from('channel_messages')
          .select('id', { count: 'exact', head: true })
          .eq('channel_id', id)
          .neq('user_id', userId)
        if (lastRead) query = query.gt('created_at', lastRead)
        return query.then(({ count }) => ({ id, count: count || 0 }))
      })
    )

    const newMap = new Map()
    for (const { id, count } of results) {
      if (count > 0) newMap.set(id, count)
    }
    setUnreadCounts(newMap)
  }, [userId])

  useEffect(() => { if (userId) fetchUnread() }, [userId, fetchUnread])
  usePolling(fetchUnread, 30000, !!userId)

  return {
    count: unreadCounts.size,
    unreadIds: new Set(unreadCounts.keys()),  // backward compat
    unreadCounts,
    markRead,
  }
}
