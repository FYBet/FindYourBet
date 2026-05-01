import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const EMPTY_FORM = {
  event: '', pick: '', odds: '', stake: 5,
  date: '', sport: 'Fútbol', market: '1X2', analysis: ''
}

export function useBets(user) {
  const [bets, setBets] = useState([])
  const [loadingBets, setLoadingBets] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!user?.id || user.id === 'dev-skip') { setLoadingBets(false); return }
    fetchBets()
  }, [user])

  const fetchBets = async () => {
    setLoadingBets(true)
    const { data, error } = await supabase
      .from('bets').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error) setBets(data || [])
    setLoadingBets(false)
  }

  const submitBet = async () => {
    if (!form.event || !form.pick || !form.odds || !form.date) {
      alert('Rellena todos los campos obligatorios'); return
    }
    const newBet = {
      user_id: user.id, event: form.event, pick: form.pick,
      odds: parseFloat(form.odds), stake: form.stake, date: form.date,
      sport: form.sport, market: form.market, analysis: form.analysis,
      status: 'pending'
    }
    if (user.id === 'dev-skip') {
      setBets(prev => [{ ...newBet, id: Date.now().toString(), created_at: new Date().toISOString() }, ...prev])
    } else {
      const { data, error } = await supabase.from('bets').insert(newBet).select()
      if (!error) setBets(prev => [data[0], ...prev])
    }
    setShowModal(false)
    setForm(EMPTY_FORM)
  }

  const resolveBet = async (id, result) => {
    if (user.id === 'dev-skip') {
      setBets(prev => prev.map(b => b.id === id ? { ...b, status: result } : b)); return
    }
    const { error } = await supabase.from('bets').update({ status: result }).eq('id', id)
    if (!error) setBets(prev => prev.map(b => b.id === id ? { ...b, status: result } : b))
  }

  const resolved = bets.filter(b => b.status !== 'pending')
  const won = bets.filter(b => b.status === 'won')
  const lost = bets.filter(b => b.status === 'lost')

  let yieldVal = 0
  if (resolved.length > 0) {
    const totals = resolved.reduce(
      (acc, b) => ({
        stakeSum: acc.stakeSum + b.stake,
        profit: acc.profit + (b.status === 'won' ? b.stake * (b.odds - 1) : -b.stake)
      }),
      { profit: 0, stakeSum: 0 }
    )
    yieldVal = totals.stakeSum > 0 ? (totals.profit / totals.stakeSum) * 100 : 0
  }

  const avgOdds = bets.length > 0
    ? (bets.reduce((s, b) => s + b.odds, 0) / bets.length).toFixed(2)
    : '—'

  return {
    bets, loadingBets, showModal, setShowModal,
    form, setForm, submitBet, resolveBet,
    won, lost, yieldVal, avgOdds
  }
}
