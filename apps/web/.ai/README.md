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