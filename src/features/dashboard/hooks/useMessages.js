import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export function useMessages(channelId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!channelId) { setLoading(false); return }
    fetchMessages()
    
    // Subscripció en temps real — missatges nous arriben automàticament
    const sub = supabase
      .channel(`messages-${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'channel_messages',
        filter: `channel_id=eq.${channelId}`
      }, payload => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [channelId])

  const fetchMessages = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('channel_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100)

    setMessages(data || [])
    setLoading(false)
  }

  const sendMessage = async (content, userId) => {
    if (!content.trim()) return

    await supabase.from('channel_messages').insert({
      channel_id: channelId,
      user_id: userId,
      content: content.trim()
    })
  }

  return { messages, loading, sendMessage }
}