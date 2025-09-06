import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_no-header')({
  component: NoHeaderLayout,
})

function NoHeaderLayout() {
  return <Outlet />
}