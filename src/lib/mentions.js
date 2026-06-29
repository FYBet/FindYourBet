// Utilitats per a mencions @usuario al xat (canals i DMs).
// Els noms d'usuari FYB són lletres/números/_ (2-20 chars), igual que al registre.

export const MENTION_RE = /@([A-Za-z0-9_]{2,20})/g

// Detecta una menció que s'està escrivint a la posició del cursor: un "@..." precedit
// d'espai o inici de text. Retorna { query, start } o null.
export function getActiveMention(text, caret) {
  const pos = caret ?? text.length
  const upto = text.slice(0, pos)
  const m = /(?:^|\s)@([A-Za-z0-9_]{0,20})$/.exec(upto)
  if (!m) return null
  const query = m[1]
  return { query, start: pos - query.length - 1 } // start = posició de l'@
}

// Substitueix el token actiu per "@username " i retorna el nou text + posició del cursor.
export function insertMention(text, caret, start, username) {
  const pos = caret ?? text.length
  const before = text.slice(0, start)
  const after = text.slice(pos)
  const ins = `@${username} `
  return { text: before + ins + after, caret: (before + ins).length }
}
