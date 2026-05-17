import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function getRawBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    if (session.payment_status !== 'paid') return res.json({ received: true })

    const { offer_id, user_id, channel_id } = session.metadata

    // Idempotency: skip if already processed
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle()

    if (!existing) {
      const token = randomUUID()

      await supabase.from('purchases').insert({
        user_id,
        offer_id,
        channel_id,
        token,
        stripe_session_id: session.id,
        amount: session.amount_total,
      })

      await supabase.from('channel_members').upsert(
        { channel_id, user_id, role: 'member' },
        { onConflict: 'channel_id,user_id' }
      )
    }
  }

  res.json({ received: true })
}
