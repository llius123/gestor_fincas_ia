import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen">
      <nav className="flex justify-between items-center p-4 bg-gray-100 border-b">
        <Link to="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
          Gestor Fincas IA
        </Link>
        
        <div className="flex gap-4">
          <Link to="/" className="hover:text-blue-600 [&.active]:text-blue-600 [&.active]:font-semibold">
            Home
          </Link>
          <Link to="/about" className="hover:text-blue-600 [&.active]:text-blue-600 [&.active]:font-semibold">
            About
          </Link>
        </div>
      </nav>
      
      <main className="p-8">
        <Outlet />
      </main>
      
      <TanStackRouterDevtools />
    </div>
  ),
})