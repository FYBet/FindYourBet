// Comisión escalonada según el precio de acceso. Cuanto más bajo el precio, mayor
// comisión: a precios bajos el coste fijo de procesamiento hace que no salga a cuenta.
// Tipsters verificados: -5 puntos en cada tramo. Precio mínimo de acceso: 1€.

export const MIN_ACCESS_PRICE = 1

// Trams ordenats de més car a més barat. `min` = preu mínim (€) per entrar al tram.
export const COMMISSION_BANDS = [
  { min: 7, rate: 0.20, label: '7€ o más' },
  { min: 5, rate: 0.25, label: '5€ – 6,99€' },
  { min: 3, rate: 0.30, label: '3€ – 4,99€' },
  { min: 2, rate: 0.35, label: '2€ – 2,99€' },
  { min: 1, rate: 0.40, label: '1€ – 1,99€' },
]

// Retorna la comissió (0-1) per a un preu en EUR. Els verificats resten 5 punts.
export function commissionRate(priceEur, isVerified = false) {
  const band = COMMISSION_BANDS.find(b => priceEur >= b.min) || COMMISSION_BANDS[COMMISSION_BANDS.length - 1]
  const rate = isVerified ? band.rate - 0.05 : band.rate
  return Math.max(0, rate)
}
