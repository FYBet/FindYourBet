// Neteja input d'usuari abans d'interpolar-lo dins un filtre `.or()` de PostgREST.
//
// A `.or(`col.ilike.%X%,col2.ilike.%X%`)` els caràcters `,` `(` `)` tenen significat
// ESTRUCTURAL (separen i agrupen condicions). Si arriben sense netejar des d'un camp de
// cerca lliure, un usuari podria injectar condicions addicionals (filter injection) i
// alterar la query. Els eliminem. Es conserven lletres, dígits, espais i `_` (els
// usernames en poden tenir) perquè la cerca segueixi funcionant amb normalitat.
export function sanitizeSearchTerm(input) {
  return String(input ?? '')
    .replace(/[(),\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}
