import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  success: boolean
  message?: string
}

export const useLogin = () => {
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

      return { success: true }
    },
    onSuccess: () => {
      console.log('Login successful')
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