import { createContext, useContext, useState, useEffect } from 'react'

const ADMIN_EMAILS = ['fyourbet@gmail.com']
const STORAGE_KEY = 'fyb_admin_mode'

const AdminModeContext = createContext({ isAdmin: false, adminMode: false, toggleAdminMode: () => {} })

export function AdminModeProvider({ user, children }) {
  const isAdmin = ADMIN_EMAILS.includes(user?.email)
  const [adminMode, setAdminMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  })

  // Desactiva el mode admin si l'usuari deixa de ser admin (logout o canvi)
  useEffect(() => {
    if (!isAdmin && adminMode) setAdminMode(false)
  }, [isAdmin, adminMode])

  const toggleAdminMode = () => {
    if (!isAdmin) return
    const next = !adminMode
    setAdminMode(next)
    sessionStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  }

  return (
    <AdminModeContext.Provider value={{ isAdmin, adminMode, toggleAdminMode }}>
      {children}
    </AdminModeContext.Provider>
  )
}

export function useAdminMode() {
  return useContext(AdminModeContext)
}
