import { clampLines } from './textLimits'

// Límits de la biografia, compartits entre Mi Perfil i Tipsters perquè el camp
// es comporti igual a tot arreu (i quadri amb la restricció de la BD).
export const MAX_BIO_LEN = 200
export const MAX_BIO_LINES = 6 // màxim 6 salts de línia ("enters")

// Retalla un valor de bio als límits: com a molt 6 salts de línia i 200 caràcters.
export function clampBio(value) {
  return clampLines(value, MAX_BIO_LINES).slice(0, MAX_BIO_LEN)
}
