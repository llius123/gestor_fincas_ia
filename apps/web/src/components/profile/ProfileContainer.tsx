import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { ProfileView } from './ProfileView'

export function ProfileContainer() {
  const { user, logout } = useAuth()
  const { data: profileData, isLoading, error } = useProfile()

  const handleLogout = () => {
    logout()
    // The ProtectedRoute component will redirect to login automatically
  }

  return (
    <ProfileView
      user={user}
      profileData={profileData}
      isLoading={isLoading}
      error={error?.message || null}
      onLogout={handleLogout}
    />
  )
}