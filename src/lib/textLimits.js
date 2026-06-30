// Limits i neteja de text per als camps d'escriptura de tota la web.

// Nivells de salts de linia ("enters"): generosos, nomes per evitar spam vertical.
export const LINE_LIMIT = {
  MESSAGE: 20, // xats i DMs
  FORM: 10,    // descripcions, motius, biografies, analisis...
}

// Colapsa els salts de linia que superin maxLines en espais (no talla el text).
export function clampLines(value, maxLines) {
  if (!value) return ''
  const parts = value.split('\n')
  if (parts.length <= maxLines + 1) return value
  return parts.slice(0, maxLines + 1).join('\n') + ' ' + parts.slice(maxLines + 1).join(' ')
}

// Decideix si un codepoint s'ha de treure (per codi numeric, sense ranges literals).
function isStripped(cp) {
  if (cp === 0x0A || cp === 0x09) return false // mante salt de linia i tabulador
  // control C0/C1
  if (cp <= 0x08 || cp === 0x0B || cp === 0x0C || (cp >= 0x0E && cp <= 0x1F) || (cp >= 0x7F && cp <= 0x9F)) return true
  if (cp === 0x00AD || cp === 0x061C) return true // soft hyphen, arabic letter mark
  // invisibles / zero-width / bidireccionals
  if (cp >= 0x200B && cp <= 0x200F) return true
  if (cp >= 0x202A && cp <= 0x202E) return true
  if (cp >= 0x2060 && cp <= 0x206F) return true
  if (cp === 0xFEFF) return true
  // marques combinades sobrants (zalgo) — despres de NFC les accentuades legitimes ja son precompostes
  if (cp >= 0x0300 && cp <= 0x036F) return true
  if (cp >= 0x1AB0 && cp <= 0x1AFF) return true
  if (cp >= 0x1DC0 && cp <= 0x1DFF) return true
  if (cp >= 0x20D0 && cp <= 0x20FF) return true
  if (cp >= 0xFE20 && cp <= 0xFE2F) return true
  // restes d'emoji (banderes, ZWJ, selector de variacio, keycap)
  if (cp >= 0x1F1E6 && cp <= 0x1F1FF) return true
  if (cp === 0x200D || cp === 0xFE0F || cp === 0x20E3) return true
  // lletres de fonts "fancy": matematiques, tancades, fullwidth ASCII
  if (cp >= 0x1D400 && cp <= 0x1D7FF) return true
  if (cp >= 0x2460 && cp <= 0x24FF) return true
  if (cp >= 0xFF01 && cp <= 0xFF5E) return true
  // simbols decoratius: letterlike (TM, lletres script), fletxes, tecnics, formes
  // geometriques, simbols miscel-lanis (estrelles), dingbats i fletxes extra
  if (cp >= 0x2100 && cp <= 0x214F) return true
  if (cp >= 0x2190 && cp <= 0x21FF) return true
  if (cp >= 0x2300 && cp <= 0x23FF) return true
  if (cp >= 0x2500 && cp <= 0x25FF) return true
  if (cp >= 0x2600 && cp <= 0x27BF) return true
  if (cp >= 0x2B00 && cp <= 0x2BFF) return true
  return false
}

// Neteja "equilibrada" per als camps de nomes text normal (noms, dades d'aposta,
// suport, admin...). Mante accents, n-tilde, c-trencada, puntuacio i altres alfabets.
export function sanitizeText(value) {
  if (!value) return value
  // Emojis pictografics (propietat Unicode): regex amb \p.
  const s = value.normalize('NFC').replace(/\p{Extended_Pictographic}/gu, '')
  // La resta, filtrant per codepoint.
  let out = ''
  for (const ch of s) {
    if (!isStripped(ch.codePointAt(0))) out += ch
  }
  return out
}

// Alias retrocompatible: els camps "sense emojis" usen la neteja completa.
export const stripEmojis = sanitizeText
