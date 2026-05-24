import { useState, useEffect } from 'react'

// Avatar amb fallback robust: si la imatge falla a carregar, mostra la inicial del nom.
// Resetegem l'estat d'error cada vegada que canvia el url — així una imatge nova substitueix la fallida.
export default function Avatar({
  url,
  name,
  size = 40,
  fontSize,           // si no s'especifica, es calcula a partir del size
  borderWidth = 0,
  bg = 'var(--color-primary-light)',
  fg = 'var(--color-primary)',
  className,
  style,
  onClick,
}) {
  const [errored, setErrored] = useState(false)

  // Si el url canvia, torna a intentar carregar (cas: usuari puja avatar nou)
  useEffect(() => { setErrored(false) }, [url])

  const computedFontSize = fontSize ?? Math.round(size * 0.42)
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?'

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: borderWidth ? `${borderWidth}px solid var(--color-bg)` : undefined,
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg,
    color: fg,
    fontSize: computedFontSize,
    fontWeight: 700,
    cursor: onClick ? 'pointer' : undefined,
    ...style,
  }

  if (url && !errored) {
    return (
      <div className={className} style={baseStyle} onClick={onClick}>
        <img
          src={url}
          alt=""
          onError={() => setErrored(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    )
  }

  return (
    <div className={className} style={baseStyle} onClick={onClick}>
      {initial}
    </div>
  )
}
