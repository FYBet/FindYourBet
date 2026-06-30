// "Mayo 2026" a partir d'una data ISO (mes en castella, primera lletra majuscula).
export function formatMemberSince(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const month = d.toLocaleDateString('es-ES', { month: 'long' })
  return month.charAt(0).toUpperCase() + month.slice(1) + ' ' + d.getFullYear()
}
