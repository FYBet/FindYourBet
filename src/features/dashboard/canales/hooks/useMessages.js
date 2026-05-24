import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../../../lib/supabase'
import { usePolling } from '../../../../hooks/usePolling'
import { markChannelRead } from '../../../../hooks/useUnreadChannelCount'
import { isAdminUserId } from '../../../../lib/adminUsers'

export function useMessages(channelId, userId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const recordedRef = useRef(new Set())

  useEffect(() => { recordedRef.current = new Set() }, [channelId])

  const recordView = useCallback((msgId) => {
    if (!userId || userId === 'dev-skip') return
    // Stealth: els admins (fyourbet) no deixen rastre de visites
    if (isAdminUserId(userId)) return
    if (msgId.startsWith('opt-') || recordedRef.current.has(msgId)) return
    recordedRef.current.add(msgId)
    supabase
      .from('channel_message_views')
      .upsert([{ message_id: msgId, user_id: userId }], { ignoreDuplicates: true })
      .then()
  }, [userId])

  const fetchAndEnrich = useCallback(async () => {
    if (!channelId) return null
    const { data } = await supabase
      .from('channel_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100)
    if (!data) return null

    const msgIds = data.map(m => m.id)
    const { data: counts } = await supabase
      .from('channel_message_view_counts')
      .select('message_id, view_count')
      .in('message_id', msgIds)

    const countMap = {}
    ;(counts || []).forEach(r => { countMap[r.message_id] = Number(r.view_count) })

    return data.map(m => ({ ...m, view_count: countMap[m.id] || 0 }))
  }, [channelId])

  const fetchMessages = useCallback(async () => {
    const enriched = await fetchAndEnrich()
    if (enriched) {
      setMessages(enriched)
      setLoading(false)
      markChannelRead(userId, channelId)
    }
  }, [fetchAndEnrich, userId, channelId])

  useEffect(() => {
    if (!channelId) { setLoading(false); return }
    setLoading(true)
    fetchMessages()
  }, [channelId, fetchMessages])

  // Realtime: INSERT propaga missatges nous, DELETE propaga eliminacions a tots els membres
  useEffect(() => {
    if (!channelId) return
    const channel = supabase.channel(`ch-view-${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'channel_messages',
        filter: `channel_id=eq.${channelId}`,
      }, () => fetchMessages())
      .on('postgres_changes', {
        // Sense filter: DELETE events no suporten filtres sense REPLICA IDENTITY FULL
        // Es filtra per id al callback — si el missatge no és al canal actiu, no passa res
        event: 'DELETE', schema: 'public', table: 'channel_messages',
      }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id))
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [channelId, fetchMessages])

  usePolling(fetchMessages, 30000, !!channelId)

  // Hard delete: verifica via .select() que la DELETE ha afectat alguna fila
  // (si RLS bloqueja, no llença error però retorna data buit)
  const deleteMessage = useCallback(async (msgId) => {
    const { data, error } = await supabase
      .from('channel_messages')
      .delete()
      .eq('id', msgId)
      .select()
    if (error) { console.error('[CH delete] error:', error); alert('Error al eliminar: ' + error.message); return false }
    if (!data?.length) {
      console.warn('[CH delete] RLS bloqueja la DELETE — cap fila eliminada')
      alert('No se puede eliminar este mensaje (permisos)')
      return false
    }
    setMessages(prev => prev.filter(m => m.id !== msgId))
    return true
  }, [])

  const sendMessage = async (content, sendUserId) => {
    if (!content.trim()) return

    const optimistic = {
      id: `opt-${Date.now()}`,
      channel_id: channelId,
      user_id: sendUserId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      view_count: 0,
    }
    setMessages(prev => [...prev, optimistic])

    await supabase.from('channel_messages').insert({
      channel_id: channelId,
      user_id: sendUserId,
      content: content.trim(),
      created_at: new Date().toISOString(),
    })

    const enriched = await fetchAndEnrich()
    if (enriched) setMessages(enriched)
  }

  return { messages, loading, sendMessage, recordView, deleteMessage }
}
