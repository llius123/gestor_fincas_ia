# Web - Gestor Fincas IA

## 🚨 NORMAS OBLIGATORIAS - LEER PRIMERO

### ✅ Reglas de Código OBLIGATORIAS
- **NUNCA usar `any`** - Tipado estricto obligatorio
- **SIEMPRE seguir arquitectura Container/Component** - Ver sección detallada abajo

### 🏗️ ARQUITECTURA OBLIGATORIA - Container/Component Pattern

**ANTES de escribir cualquier componente, SIEMPRE separar en 3 piezas:**

1. **Hook** (`useFeatureName.ts`) - Lógica, estado y API calls
2. **Container** (`FeatureContainer.tsx`) - Coordinación y llamada de hooks  
3. **View** (`FeatureView.tsx`) - UI pura que solo recibe props

**Estructura OBLIGATORIA:**
```typescript
// ✅ CORRECTO - SIEMPRE ASÍ
src/components/feature/
├── FeatureContainer.tsx    # Lógica y hooks
├── FeatureView.tsx        # UI pura con props
└── useFeature.ts          # API calls y estado

// ❌ INCORRECTO - NUNCA ASÍ  
src/routes/feature.tsx     # Todo mezclado
```

### 📋 CHECKLIST OBLIGATORIO - Verificar SIEMPRE

Antes de hacer commit, verificar:

- [ ] ✅ ¿Separé Container/View?
- [ ] ✅ ¿El View es puro (solo recibe props)?
- [ ] ✅ ¿La lógica está en el Hook o Container?
- [ ] ✅ ¿Sin `any` en ninguna parte?
- [ ] ✅ ¿Sigue la estructura de carpetas correcta?

**Si alguna respuesta es NO, CORREGIR antes de continuar.**

---

## Propósito del Proyecto

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

## Routes (OBLIGATORIO)

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

## 🏗️ ARQUITECTURA OBLIGATORIA DE COMPONENTES

### ⚠️ IMPORTANTE: Patrón Container/Component OBLIGATORIO

**TODOS los componentes DEBEN seguir el patrón Container/Component.** Este es un requisito no negociable del proyecto.

**ANTES de escribir cualquier componente, preguntarse:**
1. ¿Dónde va la lógica? → Container + Hook
2. ¿Dónde va la UI? → View (puro, solo props)
3. ¿Está todo separado correctamente? → Verificar checklist

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

#### ✅ EJEMPLO CORRECTO: Autenticación

**SIEMPRE seguir esta estructura exacta:**

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

#### ❌ EJEMPLO INCORRECTO - NUNCA HACER ESTO:

```typescript
// ❌ MAL - Todo mezclado en una ruta
function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const handleLogout = () => {
    // lógica mezclada con UI
  }

  return (
    <div>
      {/* UI mezclada con lógica */}
    </div>
  )
}
```

**Problemas de este enfoque:**
- ❌ Lógica mezclada con UI
- ❌ No reutilizable
- ❌ Difícil de testear
- ❌ Va contra las normas del proyecto

#### Ventajas de la Arquitectura Correcta

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