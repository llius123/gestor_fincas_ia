import { createFileRoute } from '@tanstack/react-router'
import { LoginContainer } from '../../components/login/LoginContainer'

export const Route = createFileRoute('/_no-header/login')({
  component: LoginContainer,
})