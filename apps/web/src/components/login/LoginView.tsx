interface LoginViewProps {
  credentials: {
    username: string
    password: string
  }
  isLoading: boolean
  error?: string
  isSuccess: boolean
  onInputChange: (field: 'username' | 'password', value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function LoginView({
  credentials,
  isLoading,
  error,
  isSuccess,
  onInputChange,
  onSubmit
}: LoginViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center text-2xl font-bold mb-6">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="alert alert-success mb-4">
              <span>¡Login exitoso!</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Usuario</span>
              </label>
              <input
                type="text"
                placeholder="Ingresa tu usuario"
                className="input input-bordered w-full"
                value={credentials.username}
                onChange={(e) => onInputChange('username', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Contraseña</span>
              </label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                className="input input-bordered w-full"
                value={credentials.password}
                onChange={(e) => onInputChange('password', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}