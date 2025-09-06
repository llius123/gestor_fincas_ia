import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '../../components/shared/ProtectedRoute'
import { ProfileContainer } from '../../components/profile/ProfileContainer'

export const Route = createFileRoute('/_with-header/profile')({
  component: Profile,
})

function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContainer />
    </ProtectedRoute>
  )
}