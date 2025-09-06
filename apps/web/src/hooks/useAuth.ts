import { useEffect, useCallback } from 'react'

export type UserRole = 'Vecino' | 'Administrador';

interface User {
  id: number
  username: string
  role: UserRole
}

interface UseAuth {
  login: (token: string, user: User) => void
  logout: () => void
  getAuthHeaders: () => { Authorization: string }
  isAuthenticated: boolean
  user: () => string | null
}

export const useAuth = (): UseAuth => {
  const logout = useCallback(() => {
    localStorage.removeItem('jwt-token')
    localStorage.removeItem('user-info')
  }, [])

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('jwt-token')
    const userInfo = localStorage.getItem('user-info')

    if (!token || !userInfo) {
      logout()
    }
  }, [logout])

  const login = (token: string, user: User) => {
    localStorage.setItem('jwt-token', token)
    localStorage.setItem('user-info', JSON.stringify(user))
  }

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
    }
  }
  const _isAuthenticated = () => {
    return !!(localStorage.getItem('jwt-token') && localStorage.getItem('user-info'))
  }

  const _getUser = () => {
    return localStorage.getItem('user-info');
  }

  return {
    login,
    logout,
    getAuthHeaders,
    isAuthenticated: _isAuthenticated(),
    user: _getUser
  }
}