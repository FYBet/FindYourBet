import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

export function useDMs(currentUserId) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!currentUserId) return
    fetchConversations()
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [currentUserId])

  const fetchConversations = async () => {
    const { data } = await supabase
      .from('dm_conversations')
      .select('*')
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false })

    if (!data) { setLoading(false); return }

    // Busca l'últim missatge i info de l'altre usuari per cada conversa
    const enriched = await Promise.all(data.map(async (conv) => {
      const otherId = conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id
      const isAccepted = conv.user1_id === currentUserId ? conv.user1_accepted : conv.user2_accepted
      const otherAccepted = conv.user1_id === currentUserId ? conv.user2_accepted : conv.user1_accepted

      const [{ data: profile }, { data: lastMsg }, { count: unread }] = await Promise.all([
        supabase.from('profiles').select('username, name').eq('id', otherId).single(),
        supabase.from('direct_messages').select('content, created_at, sender_id')
          .eq('conversation_id', conv.id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('direct_messages').select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id).eq('sender_id', otherId).is('read_at', null)
      ])

      return {
        ...conv,
        otherId,
        otherUsername: profile?.username || otherId.slice(0, 6),
        otherName: profile?.name || '',
        lastMessage: lastMsg?.content || '',
        lastMessageAt: lastMsg?.created_at || conv.created_at,
        lastMessageIsOwn: lastMsg?.sender_id === currentUserId,
        unread: unread || 0,
        isAccepted,
        otherAccepted,
        isPending: !otherAccepted && conv.user1_id !== currentUserId,
      }
    }))

    const total = enriched.reduce((sum, c) => sum + c.unread, 0)
    setUnreadCount(total)
    setConversations(enriched.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)))
    setLoading(false)
  }

  const startConversation = async (otherUserId, isFollowing) => {
    // Comprova si ja existeix
    const { data: existing } = await supabase
      .from('dm_conversations')
      .select('*')
      .or(
        `and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`
      )
      .single()

    if (existing) return existing

    const { data } = await supabase.from('dm_conversations').insert({
      user1_id: currentUserId,
      user2_id: otherUserId,
      user1_accepted: true,
      user2_accepted: isFollowing // si et segueix, acceptat directament
    }).select().single()

    await fetchConversations()
    return data
  }

  const acceptConversation = async (conversationId) => {
    const conv = conversations.find(c => c.id === conversationId)
    if (!conv) return
    const field = conv.user1_id === currentUserId ? 'user1_accepted' : 'user2_accepted'
    await supabase.from('dm_conversations').update({ [field]: true }).eq('id', conversationId)
    await fetchConversations()
  }

  const sendMessage = async (conversationId, content) => {
    if (!content.trim()) return
    await supabase.from('direct_messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: content.trim()
    })
    await fetchConversations()
  }

  const fetchMessages = async (conversationId) => {
    const { data } = await supabase
      .from('direct_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    // Marca com llegits
    await supabase.from('direct_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId)
      .is('read_at', null)

    await fetchConversations()
    return data || []
  }

  const blockUser = async (conversationId) => {
    await supabase.from('dm_conversations').delete().eq('id', conversationId)
    setConversations(prev => prev.filter(c => c.id !== conversationId))
  }

  return {
    conversations, loading, unreadCount,
    startConversation, acceptConversation,
    sendMessage, fetchMessages, blockUser,
    refetch: fetchConversations
  }
}