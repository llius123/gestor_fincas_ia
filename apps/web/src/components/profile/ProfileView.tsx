export type UserRole = 'Vecino' | 'Administrador';

interface User {
  id: number
  username: string
  role: UserRole
}

interface ProfileData {
  success: boolean
  message: string
  user: {
    userId: number
    username: string
  }
  timestamp: string
}

interface ProfileViewProps {
  user: User
  profileData: ProfileData | undefined
  isLoading: boolean
  error: string | null
  onLogout: () => void
}

export function ProfileView({ user, profileData, isLoading, error, onLogout }: ProfileViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error al cargar el perfil: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl">Mi Perfil</h2>

            <div className="divider"></div>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">ID de Usuario:</span>
                </label>
                <input
                  type="text"
                  value={user.id || profileData?.user.userId || ''}
                  className="input input-bordered"
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Nombre de Usuario:</span>
                </label>
                <input
                  type="text"
                  value={user.username || profileData?.user.username || ''}
                  className="input input-bordered"
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Rol:</span>
                </label>
                <input
                  type="text"
                  value={user.role || ''}
                  className="input input-bordered"
                  disabled
                />
              </div>

              {profileData?.timestamp && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Última consulta:</span>
                  </label>
                  <input
                    type="text"
                    value={new Date(profileData.timestamp).toLocaleString('es-ES')}
                    className="input input-bordered"
                    disabled
                  />
                </div>
              )}
            </div>

            <div className="divider"></div>

            <div className="card-actions justify-end">
              <button
                className="btn btn-outline btn-error"
                onClick={onLogout}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">Información de Seguridad</h3>
              <p className="text-sm text-gray-600">
                Esta página está protegida por JWT token. Solo los usuarios autenticados pueden acceder a esta información.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                🔒 Datos obtenidos de: <code>GET /api/profile</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}