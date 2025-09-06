import { useState, useEffect } from 'react'

interface User {
  id: number
  username: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  })

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('jwt-token')
    const userInfo = localStorage.getItem('user-info')
    
    if (token && userInfo) {
      try {
        const user = JSON.parse(userInfo)
        setAuthState({
          isAuthenticated: true,
          user,
          token
        })
      } catch (error) {
        console.error('Error parsing user info:', error)
        logout()
      }
    }
  }, [])

  const login = (token: string, user: User) => {
    localStorage.setItem('jwt-token', token)
    localStorage.setItem('user-info', JSON.stringify(user))
    setAuthState({
      isAuthenticated: true,
      user,
      token
    })
  }

  const logout = () => {
    localStorage.removeItem('jwt-token')
    localStorage.removeItem('user-info')
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    })
  }

  const getAuthHeaders = () => {
    return authState.token ? {
      'Authorization': `Bearer ${authState.token}`
    } : {}
  }

  return {
    ...authState,
    login,
    logout,
    getAuthHeaders
  }
}