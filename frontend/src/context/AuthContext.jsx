import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored =
      localStorage.getItem('user') || localStorage.getItem('adminUser')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    if (userData.role === 'municipal_admin') {
      localStorage.setItem('adminUser', JSON.stringify(userData))
      localStorage.setItem('adminToken', token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', token)
    } else {
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', token)
    }
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
