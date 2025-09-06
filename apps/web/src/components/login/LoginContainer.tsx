import { useLogin } from './useLogin'
import { LoginView } from './LoginView'

export function LoginContainer() {
  const { credentials, isLoading, error, isSuccess, handleInputChange, handleSubmit } = useLogin()

  return (
    <LoginView
      credentials={credentials}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
    />
  )
}