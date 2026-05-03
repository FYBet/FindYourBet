import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Landing from './features/landing/Landing'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import Dashboard from './features/dashboard/Dashboard'

function AppRoutes() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const login = (userData) => {
    setUser(userData)
    navigate('/dashboard')
  }

  const logout = () => {
    setUser(null)
    navigate('/')
  }

  return (
    <Routes>
      <Route path="/" element={<Landing navigate={(page) => navigate(`/${page === 'landing' ? '' : page}`)} />} />
      <Route path="/login" element={<Login navigate={(page) => navigate(`/${page === 'landing' ? '' : page}`)} login={login} />} />
      <Route path="/register" element={<Register navigate={(page) => navigate(`/${page === 'landing' ? '' : page}`)} login={login} />} />
      <Route path="/dashboard" element={user ? <Dashboard navigate={(page) => navigate(`/${page === 'landing' ? '' : page}`)} user={user} logout={logout} /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}