// Estils de background per a les cards de tipster.
// Índex 0 = sense tema (default). Índexs 1-7 = els temes oferts.
export const THEME_STYLES = [
  null, // 0 — default (var(--color-bg))
  { background: 'radial-gradient(circle at 20% 20%, rgba(0,255,150,.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(0,150,255,.08), transparent 40%), linear-gradient(135deg, #04110d 0%, #071b14 100%)' },
  { background: 'radial-gradient(circle at 0% 0%, rgba(0,255,180,.18), transparent 35%), radial-gradient(circle at 100% 100%, rgba(120,0,255,.15), transparent 40%), linear-gradient(145deg,#08121d,#05070b)' },
  { background: 'linear-gradient(145deg, #061322 0%, #0b2340 50%, #061322 100%)' },
  { background: 'radial-gradient(circle at top right, rgba(255,200,50,.15), transparent 35%), linear-gradient(135deg, #0d0b08, #17120a)' },
  { background: 'radial-gradient(circle at 20% 20%, rgba(170,0,255,.18), transparent 35%), radial-gradient(circle at 80% 70%, rgba(80,0,255,.15), transparent 40%), #07050d' },
  { background: 'radial-gradient(circle at top left, rgba(255,60,60,.15), transparent 40%), linear-gradient(145deg, #120505, #090909)' },
  { background: 'linear-gradient(rgba(0,255,170,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,.03) 1px, transparent 1px), #050808', backgroundSize: '24px 24px' },
]

export const THEME_LABELS = [
  'Estándar', 'Verde', 'Matrix', 'Azul', 'Ámbar', 'Morado', 'Rojo', 'Grid',
]

export function getThemeStyle(themeId) {
  return THEME_STYLES[themeId || 0] || null
}
