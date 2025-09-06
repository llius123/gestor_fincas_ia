# Web - Gestor Fincas IA

Este directorio contiene la aplicación web frontend del sistema de gestión de fincas.

## Propósito

- Interfaz de usuario para la gestión de fincas
- Dashboard interactivo para visualización de datos
- Formularios para registro y administración de cultivos
- Visualización de análisis y predicciones de IA

## Funcionalidades

- Panel de control principal con métricas de fincas
- Gestión visual de propiedades y cultivos
- Reportes y gráficos de rendimiento
- Interfaz para consultas y predicciones de IA
- Sistema de notificaciones y alertas

## Routes

Utiliza **TanStack Router** para el manejo de rutas con generación automática y tipado completo.

### Estructura de Rutas

- **`__root.tsx`**: Layout principal con navegación global
- **`index.tsx`**: Página de inicio (`/`)
- **`about.tsx`**: Página de información (`/about`)

### Tecnologías de Routing

- **@tanstack/react-router**: Router principal con tipado TypeScript
- **@tanstack/router-devtools**: Herramientas de desarrollo para debugging
- **@tanstack/router-vite-plugin**: Generación automática del árbol de rutas

### Configuración

Las rutas se generan automáticamente en `routeTree.gen.ts` mediante el plugin de Vite.

## Styling

Utiliza **TailwindCSS v4** con **DaisyUI** para el sistema de diseño y componentes UI.

### Tecnologías de Styling

- **tailwindcss@4.x**: Framework CSS utility-first (última versión)
- **@tailwindcss/postcss**: Plugin PostCSS oficial para TailwindCSS v4
- **daisyui@5.x**: Librería de componentes UI basada en TailwindCSS

## State Management

### Zustand
Gestión de estado global minimalista y reactiva.

### Configuración Básica
```typescript
import { create } from 'zustand'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: LoginData) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (credentials) => {
    // Login logic
    set({ user: userData, isAuthenticated: true })
  },
  logout: () => set({ user: null, isAuthenticated: false })
}))
```

## Data Fetching

### TanStack Query
Manejo inteligente de data fetching, caching y sincronización con el servidor.


### Setup Básico
```typescript
import { QueryClient, QueryProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    }
  }
})

// En main.tsx
<QueryProvider client={queryClient}>
  <App />
</QueryProvider>
```

### Hooks de Query
```typescript
// Custom hook para login
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      return response.json()
    },
    onSuccess: (data) => {
      // Actualizar estado global con Zustand
      useAuthStore.getState().login(data.user)
    }
  })
}
```

## Arquitectura de Estado

### División de Responsabilidades

| Librería | Propósito | Ejemplos |
|----------|-----------|----------|
| **Zustand** | Estado global de UI | Auth, theme, navigation, forms |
| **TanStack Query** | Estado del servidor | API calls, cache, background sync |
| **React State** | Estado local temporal | Modals, inputs, toggles |

### Convenciones
- **Zustand stores**: `useAuthStore`, `useUIStore`, `useSettingsStore`
- **Query keys**: `['users'], ['farms', farmId], ['crops', { status: 'active' }]`
- **Mutations**: `useCreateFarm`, `useUpdateCrop`, `useDeleteUser`

## Arquitectura de Componentes

### Patrón Container/Component

Utilizamos el patrón **Container/Component** (Smart/Dumb Components) para separar claramente la lógica de negocio de la presentación.

#### Estructura de Carpetas
```
src/
├── components/
│   ├── login/          # Componentes relacionados con login
│   │   ├── LoginContainer.tsx
│   │   ├── LoginView.tsx
│   │   └── useLogin.ts
│   ├── dashboard/      # Componentes del dashboard
│   ├── shared/         # Componentes compartidos entre rutas
│   └── ui/             # Componentes UI base reutilizables
└── routes/             # File-based routing
```

#### Responsabilidades

| Tipo | Responsabilidad | Ubicación | Ejemplo |
|------|-----------------|-----------|---------|
| **Container** | Lógica, estado, API calls | `login/`, `dashboard/` | `LoginContainer.tsx` |
| **View** | UI pura, props, presentación | `login/`, `dashboard/` | `LoginView.tsx` |
| **Hook** | Lógica reutilizable | Junto al componente | `useLogin.ts` |

#### Ejemplo: Autenticación

**Hook personalizado** (`components/login/useLogin.ts`):
```typescript
export const useLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginCredentials) => {
      // API call logic
    }
  })

  return {
    credentials,
    isLoading: loginMutation.isPending,
    error: loginMutation.error?.message,
    handleInputChange: (field, value) => {
      setCredentials(prev => ({ ...prev, [field]: value }))
    },
    handleSubmit: (e) => {
      e.preventDefault()
      loginMutation.mutate(credentials)
    }
  }
}
```

**Container** (`components/login/LoginContainer.tsx`):
```typescript
export function LoginContainer() {
  const loginLogic = useLogin()
  
  return (
    <LoginView
      credentials={loginLogic.credentials}
      isLoading={loginLogic.isLoading}
      error={loginLogic.error}
      onInputChange={loginLogic.handleInputChange}
      onSubmit={loginLogic.handleSubmit}
    />
  )
}
```

**Componente puro** (`components/login/LoginView.tsx`):
```typescript
interface LoginViewProps {
  credentials: { username: string; password: string }
  isLoading: boolean
  error?: string
  onInputChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function LoginView({ credentials, isLoading, error, onInputChange, onSubmit }: LoginViewProps) {
  return (
    <form onSubmit={onSubmit}>
      {/* UI pura sin lógica de negocio */}
    </form>
  )
}
```

#### Ventajas de esta Arquitectura

1. **Separación de responsabilidades**: UI vs lógica de negocio
2. **Reutilización**: Componentes puros pueden usarse en diferentes contextos
3. **Testing**: Más fácil testear lógica y UI por separado
4. **Mantenibilidad**: Cambios en lógica no afectan UI y viceversa
5. **Consistencia**: Patrón predecible en toda la aplicación

#### Convenciones de Naming

- **Containers**: `LoginContainer`, `DashboardContainer`, `UserProfileContainer`
- **Views**: `LoginView`, `DashboardView`, `SettingsView`
- **UI Components**: `Button`, `Modal`, `Card`, `LoadingSpinner`
- **Hooks**: `useLogin`, `useFarms`, `useAuth`, `useLocalStorage`

#### Organización por Rutas

Los componentes se agrupan por funcionalidad/ruta en lugar de por tipo:

```
components/
├── login/              # Todo lo relacionado con autenticación
│   ├── LoginContainer.tsx
│   ├── LoginView.tsx
│   └── useLogin.ts
├── dashboard/          # Todo lo relacionado con dashboard
│   ├── DashboardContainer.tsx
│   ├── DashboardView.tsx
│   └── useDashboard.ts
├── shared/             # Componentes compartidos entre rutas
│   ├── Header/
│   ├── Sidebar/
│   └── Layout/
└── ui/                 # Componentes base reutilizables
    ├── Button.tsx
    ├── Modal.tsx
    └── Card.tsx
```

**Ventajas de organizar por rutas:**
- **Cohesión**: Todo lo relacionado está junto
- **Mantenimiento**: Fácil encontrar y modificar funcionalidades
- **Escalabilidad**: Cada ruta es independiente
- **Colaboración**: Equipos pueden trabajar en rutas separadas