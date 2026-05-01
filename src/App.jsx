import { useState } from 'react'
import { useNavigation } from './hooks/useNavigation'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

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