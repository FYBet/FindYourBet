// Llista d'usernames reservats — no es poden registrar ni canviar-s'hi.
// Es comparen sense distinció de majúscules/minúscules.
// Inclou marca, variants i rols administratius.
export const RESERVED_USERNAMES = [
  'findyourbet', 'find_your_bet', 'find-your-bet',
  'fyb', 'fyb_', '_fyb', 'fyourbet',
  'admin', 'administrator', 'administrador',
  'support', 'soporte', 'staff', 'mod', 'moderator', 'moderador',
  'official', 'oficial', 'team', 'system', 'root',
]

// Comprova si un username està reservat (insensible a majúscules).
// Retorna true si està bloquejat.
export function isReservedUsername(username) {
  if (!username) return false
  const normalized = username.trim().toLowerCase()
  return RESERVED_USERNAMES.includes(normalized)
}

// Comprova async si l'admin ha banejat aquest nom (taula banned_usernames).
// Es fa servir només a formularis de registre/canvi, on és acceptable un round-trip.
export async function isUsernameBanned(supabase, username) {
  if (!username) return false
  const normalized = username.trim().toLowerCase()
  const { data } = await supabase.from('banned_usernames')
    .select('username').eq('username', normalized).maybeSingle()
  return !!data
}
