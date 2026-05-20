import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../lib/supabase'
import { useFollow } from '../social/hooks/useFollow'
import ProfileView from '../social/ProfileView'


function Avatar({ url, name, size = 48, fontSize = 18 }) {
  if (url) return (
    <img src={url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-bg)', flexShrink: 0 }} />
  )
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 700, color: 'var(--color-primary)', border: '2px solid var(--color-bg)', flexShrink: 0 }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  )
}

function TipsterCard({ tipster, isFollowing, isMutual, onClick }) {
  const { stats } = tipster
  const displayName = tipster.username

  return (
    <div onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,110,86,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}>

      <Avatar url={tipster.avatar_url} name={displayName} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '14px' }}>{displayName}</span>
          {isMutual ? (
            <span style={{ fontSize: '10px', color: 'var(--color-primary)', padding: '2px 8px', background: 'var(--color-primary-light)', border: '0.5px solid var(--color-primary-border)', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>👥 Amigos</span>
          ) : isFollowing && (
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', padding: '2px 8px', background: 'var(--color-bg-soft)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-full)' }}>Siguiendo</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
        {stats.total > 0 ? (
          <>
            <span style={{ fontSize: '13px', fontWeight: 700, color: stats.yieldVal >= 0 ? 'var(--color-primary)' : 'var(--color-error)' }}>
              {stats.yieldVal >= 0 ? '+' : ''}{stats.yieldVal.toFixed(1)}% yield
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {stats.won}W / {stats.lost}L · {stats.total} picks
            </span>
          </>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Sin picks</span>
        )}
      </div>
    </div>
  )
}

function enrichWithStats(profiles, bets) {
  const statsMap = {}
  for (const b of (bets || [])) {
    if (!statsMap[b.user_id]) statsMap[b.user_id] = { won: 0, lost: 0, total: 0, profit: 0, stakeSum: 0 }
    const s = statsMap[b.user_id]
    s.total++
    s.stakeSum += b.stake
    if (b.status === 'won') { s.won++; s.profit += b.stake * (b.odds - 1) }
    else { s.lost++; s.profit -= b.stake }
  }
  return profiles.map(p => {
    const s = statsMap[p.id] || { won: 0, lost: 0, total: 0, profit: 0, stakeSum: 0 }
    const yieldVal = s.stakeSum > 0 ? (s.profit / s.stakeSum) * 100 : 0
    return { ...p, stats: { ...s, yieldVal, winRate: s.total > 0 ? (s.won / s.total) * 100 : 0 } }
  })
}

function pickRandom20(pool) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 20)
}

export default function Tipsters({ user, onNavigateToChannel, onStartDM }) {
  const [query, setQuery] = useState('')
  const [pool, setPool] = useState([])
  const [displayed, setDisplayed] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const { follow, unfollow, isFollowing, isFollower, isMutual } = useFollow(user?.id)
  const searchTimeout = useRef(null)

  useEffect(() => { loadPopular() }, [])

  const loadPopular = async () => {
    setLoading(true)
    const safetyTimer = setTimeout(() => setLoading(false), 10000)
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      const uid = user?.id || ''

      const [
        { data: profiles },
        { data: bets },
        { data: myFollowing },
        { data: myFollowers },
        { data: recentBets },
        { data: recentMsgs },
      ] = await Promise.all([
        supabase.from('profiles').select('id, username, avatar_url, bio').neq('id', uid).limit(200),
        supabase.from('bets').select('user_id, stake, status, odds').in('status', ['won', 'lost']).limit(3000),
        supabase.from('follows').select('following_id').eq('follower_id', uid),
        supabase.from('follows').select('follower_id').eq('following_id', uid),
        supabase.from('bets').select('user_id').gte('created_at', sevenDaysAgo).limit(1000),
        supabase.from('channel_messages').select('user_id').gte('created_at', sevenDaysAgo).limit(2000),
      ])

      if (!profiles?.length) return

      const followingSet = new Set((myFollowing || []).map(f => f.following_id))
      const followerSet  = new Set((myFollowers || []).map(f => f.follower_id))

      // 2ns grau: qui segueix la gent que jo segueixo
      const secondDegreeMap = {}
      if (followingSet.size > 0) {
        const { data: fof } = await supabase
          .from('follows').select('following_id')
          .in('follower_id', [...followingSet])
          .neq('following_id', uid)
          .limit(2000)
        for (const f of (fof || [])) {
          if (!followingSet.has(f.following_id))
            secondDegreeMap[f.following_id] = (secondDegreeMap[f.following_id] || 0) + 1
        }
      }

      // Activitat recent (proxy: aposta o missatge en últims 7 dies)
      const recentlyActive = new Set([
        ...(recentBets || []).map(b => b.user_id),
        ...(recentMsgs || []).map(m => m.user_id),
      ])

      const statsMap = {}
      for (const b of (bets || [])) {
        if (!statsMap[b.user_id]) statsMap[b.user_id] = { won: 0, lost: 0, total: 0, profit: 0, stakeSum: 0 }
        const s = statsMap[b.user_id]
        s.total++; s.stakeSum += b.stake
        if (b.status === 'won') { s.won++; s.profit += b.stake * (b.odds - 1) }
        else { s.lost++; s.profit -= b.stake }
      }

      const scored = profiles
        .map(p => {
          // Filtre dur: inactiu els últims 7 dies o ja el segueixes
          if (!recentlyActive.has(p.id)) return null
          if (followingSet.has(p.id)) return null

          const s = statsMap[p.id] || { won: 0, lost: 0, total: 0, profit: 0, stakeSum: 0 }
          const yieldVal  = s.stakeSum > 0 ? (s.profit / s.stakeSum) * 100 : 0
          const winRate   = s.total > 0 ? (s.won / s.total) * 100 : 0

          // 1. Puntuació social (0–100)
          const isFollower   = followerSet.has(p.id)
          const isMutual     = followingSet.has(p.id) && isFollower
          const secondDegree = secondDegreeMap[p.id] || 0
          const socialScore  = Math.min(100,
            (isMutual ? 60 : isFollower ? 35 : 0) +
            Math.min(40, secondDegree * 8)
          )

          // 2. Rendiment (0–100)
          const perfScore = s.total >= 5
            ? Math.min(100, Math.max(0, 50 + yieldVal * 2) * 0.55 + winRate * 0.45)
            : s.total > 0 ? 15 : 5

          // 3. Credibilitat per volum (0–100)
          const credScore = Math.min(100, (s.total / 30) * 100)

          // 4. Perfil complet (0–100)
          const profileScore = (p.bio ? 50 : 0) + (p.avatar_url ? 50 : 0)

          const finalScore =
            socialScore  * 0.40 +
            perfScore    * 0.35 +
            credScore    * 0.15 +
            profileScore * 0.10

          return { ...p, stats: { ...s, yieldVal, winRate }, _score: finalScore }
        })
        .filter(Boolean)
        .sort((a, b) => b._score - a._score)
        .slice(0, 60)

      setPool(scored)
      setDisplayed(pickRandom20(scored))
    } finally {
      clearTimeout(safetyTimer)
      setLoading(false)
    }
  }

  const handleSearch = (q) => {
    setQuery(q)
    clearTimeout(searchTimeout.current)
    if (!q.trim()) { setSearchResults([]); return }
    searchTimeout.current = setTimeout(() => runSearch(q), 300)
  }

  const runSearch = async (q) => {
    setSearching(true)
    const { data: profiles } = await supabase
      .from('profiles').select('id, username, name, avatar_url, bio')
      .or(`username.ilike.%${q}%,name.ilike.%${q}%`)
      .neq('id', user?.id || '')
      .limit(20)

    if (!profiles?.length) { setSearchResults([]); setSearching(false); return }

    const ids = profiles.map(p => p.id)
    const { data: bets } = await supabase
      .from('bets').select('user_id, odds, stake, status')
      .in('user_id', ids).in('status', ['won', 'lost']).limit(500)

    setSearchResults(enrichWithStats(profiles, bets || []))
    setSearching(false)
  }

  if (selectedUserId) {
    return (
      <ProfileView
        userId={selectedUserId}
        currentUser={user}
        onBack={() => setSelectedUserId(null)}
        onStartDM={onStartDM || (() => {})}
        isFollowing={isFollowing(selectedUserId)}
        isFollower={isFollower(selectedUserId)}
        onFollow={follow}
        onUnfollow={unfollow}
        onNavigateToChannel={onNavigateToChannel}
        onBlock={() => alert('Usuario bloqueado.')}
        onReport={() => {}}
      />
    )
  }

  const showSearch = query.trim().length > 0
  const list = showSearch ? searchResults : displayed

  return (
    <motion.div key="tipsters" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, marginBottom: '4px' }}>Tipsters</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Descubre los mejores pronosticadores</p>
      </div>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Busca tipsters por nombre o usuario..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          style={{ width: '100%', background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontSize: '14px', padding: '12px 16px 12px 40px', borderRadius: 'var(--radius-lg)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none', opacity: 0.5 }}>🔍</span>
      </div>

      {searching && (
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', padding: '20px' }}>Buscando tipsters...</div>
      )}

      {!searching && (
        <>
          {!showSearch && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ✨ Tipsters sugeridos
              </div>
              {pool.length > 0 && (
                <button onClick={() => setDisplayed(pickRandom20(pool))}
                  style={{ background: 'none', border: '0.5px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🔄 Otros
                </button>
              )}
            </div>
          )}

          {showSearch && searchResults.length === 0 && !searching && (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', padding: '40px 20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔎</div>
              No se encontraron tipsters con ese nombre
            </div>
          )}

          {loading && !showSearch && (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', padding: '40px' }}>⏳ Cargando tipsters...</div>
          )}

          {!loading && !showSearch && displayed.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '60px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎯</div>
              <div style={{ fontWeight: 600 }}>Aún no hay tipsters registrados</div>
            </div>
          )}

          <AnimatePresence>
            <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {list.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <TipsterCard
                    tipster={t}
                    isFollowing={isFollowing(t.id)}
                    isMutual={isMutual(t.id)}
                    onClick={() => setSelectedUserId(t.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </motion.div>
  )
}
