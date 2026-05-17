import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'GET') return res.status(405).end()

  const { user_id } = req.query
  if (!user_id) return res.status(400).json({ error: 'user_id required' })

  const { data } = await supabase
    .from('stripe_accounts')
    .select('stripe_account_id, onboarded')
    .eq('user_id', user_id)
    .maybeSingle()

  if (!data) return res.json({ connected: false, onboarded: false })

  try {
    const account = await stripe.accounts.retrieve(data.stripe_account_id)
    const onboarded = account.details_submitted && account.charges_enabled

    if (onboarded && !data.onboarded) {
      await supabase.from('stripe_accounts').update({ onboarded: true }).eq('user_id', user_id)
    }

    res.json({ connected: true, onboarded })
  } catch {
    res.json({ connected: true, onboarded: false })
  }
}
