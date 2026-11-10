import { createContext, useContext, useEffect, useState } from 'react'
import { auth, tokenStore } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, if we have a token, ask the API who we are
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false)
      return
    }
    auth
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  async function login(credentials) {
    const { token, user } = await auth.login(credentials)
    tokenStore.set(token)
    setUser(user)
  }

  async function register(data) {
    const { token, user } = await auth.register(data)
    tokenStore.set(token)
    setUser(user)
  }

  function logout() {
    tokenStore.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
