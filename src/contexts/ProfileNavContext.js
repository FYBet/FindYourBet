import { createContext, useContext } from 'react'

export const ProfileNavContext = createContext(() => {})
export const useProfileNav = () => useContext(ProfileNavContext)
