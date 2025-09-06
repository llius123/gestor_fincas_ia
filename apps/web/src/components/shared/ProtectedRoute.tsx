import { type ReactNode, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, navigate])

  // Show loading or nothing while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}