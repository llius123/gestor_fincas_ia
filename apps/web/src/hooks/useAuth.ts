import { useState, useEffect, useCallback } from 'react'

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
  const isAuthenticated = () => {
    return localStorage.getItem('jwt-token') && localStorage.getItem('user-info') ? true : false
  }

  const getUser = () => {
    return localStorage.getItem('user-info');
  }

  return {
    login,
    logout,
    getAuthHeaders,
    isAuthenticated,
    user: () => getUser
  }
}