import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password })
    setToken(data.accessToken)
  }

  const register = async (name, email, password) => {
    const { data } = await client.post('/auth/register', { name, email, password })
    setToken(data.accessToken)
  }

  const logout = () => setToken(null)

  return (
    <AuthContext.Provider value={{ token, login, register, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
