import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

const MAX_OWN_CHANNELS = 5
const MAX_JOINED_CHANNELS = 30

// Genera un codi d'invitació aleatori de 8 caràcters
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export function useChannels(user) {
  const [myChannels, setMyChannels] = useState([])
  const [joinedChannels, setJoinedChannels] = useState([])
  const [memberCounts, setMemberCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id || user.id === 'dev-skip') { setLoading(false); return }
    fetchChannels()
  }, [user])

  const fetchChannels = async () => {
    setLoading(true)
    const { data: own } = await supabase
      .from('channels').select('*').eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    setMyChannels(own || [])

    const { data: memberships } = await supabase
      .from('channel_members').select('channel_id, channels(*)')
      .eq('user_id', user.id)

    const joined = memberships
      ?.map(m => m.channels)
      .filter(c => c && !(own || []).some(o => o.id === c.id)) || []
    setJoinedChannels(joined)

    const allChannels = [...(own || []), ...joined]
    const counts = {}
    await Promise.all(allChannels.map(async c => {
      const { count } = await supabase
        .from('channel_members').select('*', { count: 'exact', head: true })
        .eq('channel_id', c.id)
      counts[c.id] = (count || 0) + 1
    }))
    setMemberCounts(counts)
    setLoading(false)
  }

  const createChannel = async (name, description, isPrivate = false) => {
    if (!name.trim()) return { error: 'El nombre es obligatorio' }
    if (myChannels.length >= MAX_OWN_CHANNELS) return { error: `Límite de ${MAX_OWN_CHANNELS} canales propios alcanzado` }

    const invite_code = generateInviteCode()

    const { data, error } = await supabase
      .from('channels').insert({
        owner_id: user.id,
        name: name.trim(),
        description: description.trim(),
        is_private: isPrivate,
        invite_code
      })
      .select().single()

    if (!error) {
      setMyChannels(prev => [data, ...prev])
      setMemberCounts(prev => ({ ...prev, [data.id]: 1 }))
    }
    return { data, error }
  }

  const deleteChannel = async (channelId) => {
    await supabase.from('channel_messages').delete().eq('channel_id', channelId)
    await supabase.from('channel_members').delete().eq('channel_id', channelId)
    await supabase.from('channels').delete().eq('id', channelId)
    setMyChannels(prev => prev.filter(c => c.id !== channelId))
  }

  // La cerca només retorna canals públics
  const searchChannels = async (query) => {
    if (!query.trim()) return []
    const { data } = await supabase.from('channels').select('*')
      .ilike('name', `%${query}%`)
      .eq('is_private', false)
      .limit(10)
    return data || []
  }

  // Busca un canal pel codi d'invitació (per canals privats)
  const findChannelByCode = async (code) => {
    if (!code.trim()) return null
    const { data } = await supabase.from('channels').select('*')
      .eq('invite_code', code.trim().toUpperCase())
      .single()
    return data || null
  }

  const joinChannel = async (channelId) => {
    if (joinedChannels.length >= MAX_JOINED_CHANNELS) return { error: `Límite de ${MAX_JOINED_CHANNELS} canales alcanzado` }
    const { data: existing } = await supabase.from('channel_members').select('id')
      .eq('channel_id', channelId).eq('user_id', user.id).maybeSingle()
    if (existing) return { alreadyJoined: true }
    const { error } = await supabase.from('channel_members')
      .insert({ channel_id: channelId, user_id: user.id })
    if (!error) await fetchChannels()
    return { error }
  }

  const leaveChannel = async (channelId) => {
    await supabase.from('channel_members').delete()
      .eq('channel_id', channelId).eq('user_id', user.id)
    await fetchChannels()
  }

  return {
    myChannels, joinedChannels, memberCounts, loading,
    createChannel, deleteChannel, searchChannels, findChannelByCode,
    joinChannel, leaveChannel, refetch: fetchChannels,
    MAX_OWN_CHANNELS, MAX_JOINED_CHANNELS
  }
}