// IDs dels comptes administradors de FYB.
// S'usen per fer-los "invisibles" a les vistes públiques:
//  - no compten al recompte de membres dels canals
//  - no apareixen a la llista de membres
//  - les seves visites/views no es registren
// La idea: fyourbet pot supervisar sense que ningú sàpiga on és.
export const ADMIN_USER_IDS = new Set([
  'fbe0bfe2-858d-4f56-a155-dd79e054fc1f', // fyourbet@gmail.com
])

export function isAdminUserId(userId) {
  return ADMIN_USER_IDS.has(userId)
}

// Filtra un array d'objectes traient els d'admins. `getId` extreu l'id de cada item.
export function filterOutAdmins(items, getId = (x) => x?.user_id ?? x?.id) {
  if (!items) return items
  return items.filter(i => !ADMIN_USER_IDS.has(getId(i)))
}
