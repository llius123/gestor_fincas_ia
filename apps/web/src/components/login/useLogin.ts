import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAuth, type UserRole } from '../../hooks/useAuth'

interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  success: boolean
  message?: string
  token?: string
  user?: {
    id: number
    username: string
    role: UserRole
  }
}

export const useLogin = () => {
  const { login: setAuth } = useAuth()
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginCredentials): Promise<LoginResponse> => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const result = await response.json()
      return result
    },
    onSuccess: (data: LoginResponse) => {
      console.log('Login successful', data)
      if (data.token && data.user) {
        console.log('Setting auth and navigating to profile...')
        // Use the auth hook to manage authentication state
        setAuth(data.token, data.user)
        // Redirect to profile page after successful login
        setTimeout(() => {
          navigate({ to: '/profile' })
        }, 100)
      } else {
        console.error('Missing token or user in response:', data)
      }
    },
    onError: (error) => {
      console.error('Login failed:', error)
    }
  })

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate(credentials)
  }

  return {
    credentials,
    isLoading: loginMutation.isPending,
    error: loginMutation.error?.message,
    isSuccess: loginMutation.isSuccess,
    handleInputChange,
    handleSubmit,
  }
}