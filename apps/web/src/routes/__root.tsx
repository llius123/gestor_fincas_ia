import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-base-100">
      <div className="navbar bg-base-200">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">
            Gestor Fincas IA
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link to="/" className="[&.active]:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="[&.active]:text-primary">
                About
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
      
      <TanStackRouterDevtools />
    </div>
  ),
})