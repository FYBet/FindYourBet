import { useState } from 'react'
import { useNavigation } from './hooks/useNavigation'
import Landing from './features/landing/Landing'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import Dashboard from './features/dashboard/Dashboard'

function App() {
  const { page, navigate } = useNavigation('landing')
  const [user, setUser] = useState(null)

  const login = (userData) => {
    setUser(userData)
    navigate('dashboard')
  }

  const logout = () => {
    setUser(null)
    navigate('landing')
  }

  return (
    <>
      {page === 'landing' && <Landing navigate={navigate} />}
      {page === 'login' && <Login navigate={navigate} login={login} />}
      {page === 'register' && <Register navigate={navigate} login={login} />}
      {page === 'dashboard' && <Dashboard navigate={navigate} user={user} logout={logout} />}
    </>
  )
}

export default App