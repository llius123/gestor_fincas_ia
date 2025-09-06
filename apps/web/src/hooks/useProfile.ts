import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'

interface ProfileResponse {
  success: boolean
  message: string
  user: {
    userId: number
    username: string
  }
  timestamp: string
}

export const useProfile = () => {
  const { getAuthHeaders, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<ProfileResponse> => {
      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      return response.json()
    },
    enabled: isAuthenticated, // Only run query if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}