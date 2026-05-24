import { supabase } from './supabase'
import { isReservedUsername } from './reservedUsernames'

// Genera un username aleatori amb prefix neutre + 8 caràcters alfanumèrics
function makeCandidate() {
  const suffix = Math.random().toString(36).slice(2, 10)
  return `user_${suffix}`
}

// Genera un username únic comprovant que no col·lideix amb cap altre perfil
// ni amb cap reserva activa. Reintenta fins a 5 cops si hi ha col·lisió.
export async function generateUniqueUsername() {
  for (let i = 0; i < 5; i++) {
    const candidate = makeCandidate()
    if (isReservedUsername(candidate)) continue

    const { data: existing } = await supabase
      .from('profiles').select('id').ilike('username', candidate).maybeSingle()
    if (existing) continue

    const { data: reserved } = await supabase
      .from('username_reservations').select('id')
      .ilike('username', candidate)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()
    if (reserved) continue

    return candidate
  }
  // Fallback amb timestamp si totes les 5 col·lisionen (extremadament improbable)
  return `user_${Date.now().toString(36)}`
}
