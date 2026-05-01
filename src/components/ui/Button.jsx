import { motion } from 'framer-motion'
import './ui.css'

export function Button({ children, onClick, variant = 'primary', disabled = false, full = false, size, className = '', ...props }) {
  const classes = ['btn', `btn-${variant}`, full && 'btn-full', size && `btn-${size}`, className]
    .filter(Boolean).join(' ')

  return (
    <motion.button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
