# API - Gestor Fincas IA

Este directorio contiene la API REST del sistema de gestión de fincas.

## Propósito

- Manejo de la lógica de negocio del sistema
- Endpoints para la gestión de fincas, cultivos y datos agrícolas
- Integración con servicios de inteligencia artificial
- Autenticación y autorización de usuarios

## Funcionalidades

- CRUD de fincas y propiedades
- Gestión de cultivos y seguimiento
- APIs para análisis de datos agrícolas
- Integración con modelos de IA para predicciones
- Sistema de autenticación y autorización

## Setup y Instalación

### Prerrequisitos
- **Bun**: >= 1.0.0
- **Node.js**: >= 18 (como fallback)
- **VSCode Extensions**: REST Client, SQLite Viewer

### Instalación

```bash
# 1. Instalar dependencias
cd apps/api
bun install

# 2. Inicializar base de datos (automático al arrancar)
# La BD SQLite se crea en data.db

# 3. Ejecutar en desarrollo
bun run dev

# 4. Verificar funcionamiento
curl http://localhost:3001/api/health
```

### Primera ejecución

Al arrancar por primera vez:
- ✅ Se crea automáticamente `data.db`
- ✅ Se inicializan las tablas requeridas
- ✅ Se crea usuario por defecto: `admin` / `admin123`
- ✅ Swagger disponible en: http://localhost:3001/swagger

## Arquitectura

La API sigue los principios de **Arquitectura Hexagonal** (Ports & Adapters) para mantener el código limpio, testeable y desacoplado.

### Estructura por Capas

```
src/
├── {domain}/
│   ├── domain/           # 🔵 Núcleo del negocio
│   │   ├── entities/     # Entidades del dominio
│   │   ├── value-objects/  # Objetos de valor
│   │   ├── ports/        # Interfaces (puertos)
│   │   └── services/     # Servicios del dominio
│   ├── application/      # 🟡 Casos de uso
│   │   └── use-cases/    # Lógica de aplicación
│   └── infrastructure/   # 🔴 Adaptadores externos
│       ├── repositories/ # Implementaciones BD
│       ├── services/     # Servicios externos
│       └── http/         # Controladores HTTP
```

### Principios Aplicados

#### **1. Domain Layer (Núcleo)**
- **Entidades**: Objetos de negocio con identidad (`User`, `Farm`, etc.)
- **Value Objects**: Objetos inmutables sin identidad (`Credentials`, `Email`, etc.)
- **Ports**: Interfaces que definen contratos (`UserRepository`, `AuthenticationService`)
- **Domain Services**: Lógica que no pertenece a una entidad específica

#### **2. Application Layer (Casos de Uso)**
- **Use Cases**: Orquestación de la lógica de negocio
- **No dependencias externas**: Solo usa puertos del dominio
- **Coordinación**: Entre entidades y servicios del dominio

#### **3. Infrastructure Layer (Adaptadores)**
- **Repositories**: Implementaciones de persistencia (`SqliteUserRepository`)
- **External Services**: APIs, email, etc. (`SimpleAuthenticationService`)
- **HTTP Controllers**: Puntos de entrada REST (`AuthController`)
- **Configuration**: Inyección de dependencias

### Ventajas de esta Arquitectura

✅ **Testeable**: Dominio independiente de infraestructura  
✅ **Mantenible**: Separación clara de responsabilidades  
✅ **Flexible**: Fácil cambio de BD, frameworks, etc.  
✅ **Escalable**: Estructura modular por dominios  
✅ **Clean Code**: Dependencias hacia adentro

### Ejemplo Implementado: Autenticación

```typescript
// Domain
interface UserRepository { ... }          // Puerto
class User { ... }                        // Entidad

// Application  
class LoginUseCase { ... }                // Caso de uso

// Infrastructure
class SqliteUserRepository { ... }        // Adaptador BD
class AuthController { ... }              // Adaptador HTTP
```

## Tecnologías

### Runtime y Framework
- **Bun**: Runtime JavaScript/TypeScript rápido
- **Elysia**: Framework web minimalista y rápido
- **TypeScript**: Tipado estático

### Base de Datos
- **bun:sqlite**: SQLite nativo integrado en Bun
- **Sin ORMs**: Queries SQL directas para máximo rendimiento

### Desarrollo
- **Hot Reload**: `bun --watch` para desarrollo
- **Build**: `bun build` para producción

## Seguridad

### 🚨 ADVERTENCIAS CRÍTICAS

⚠️ **INSEGURO PARA PRODUCCIÓN**: La implementación actual usa:
- Contraseñas en **texto plano** (sin hashing)
- Usuario hardcodeado `admin/admin123`
- Sin variables de entorno para secrets

### Implementación Actual vs Producción

| Aspecto | Desarrollo (Actual) | Producción (Requerido) |
|---------|-------------------|----------------------|
| Passwords | Plain text | bcrypt/argon2 |
| Secrets | Hardcoded | Variables de entorno |
| Authentication | Basic | JWT + Refresh tokens |
| CORS | Abierto | Configurado por dominio |
| Rate Limiting | No | Implementado |

### TODO para Producción

```typescript
// ❌ ACTUAL (Inseguro)
validatePassword(plain: string, hash: string) {
  return plain === hash;
}

// ✅ REQUERIDO (Seguro)
import bcrypt from 'bcrypt';
validatePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
```

### Variables de Entorno Requeridas

```bash
# .env
DATABASE_URL=./data.db
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://yourdomain.com
API_PORT=3001
```

### Testing de Endpoints

Cada endpoint debe incluir tests en el archivo `api.http` usando **REST Client** de VSCode.

#### Archivo de Tests: `apps/api/api.http`

- **Ubicación**: En el directorio raíz de la API, junto al código
- **Plugin requerido**: [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- **Formato**: Archivo `.http` con tests organizados por dominio

#### Reglas Obligatorias

🚨 **IMPORTANTE**: Al crear o modificar endpoints:

1. **Crear tests para todos los casos**:
   - ✅ Caso exitoso (200)
   - ❌ Casos de error (400, 401, 404, 500)
   - 🔍 Validaciones de entrada
   - 📝 Diferentes tipos de datos

2. **Organizar por dominios**:
   ```http
   ### Authentication - Login Success
   POST {{base_url}}/api/auth/login
   
   ### Authentication - Invalid Credentials  
   POST {{base_url}}/api/auth/login
   ```

3. **Documentar casos de uso**:
   - Descripción clara del test
   - Headers necesarios
   - Body de ejemplo
   - Respuesta esperada

#### Estructura de Tests

```http
@base_url = http://localhost:3001

### [Dominio] - [Descripción del caso]
[MÉTODO] {{base_url}}/endpoint
Content-Type: application/json

{
  "field": "value"
}

###
```

## Base de Datos

### Esquema Actual

#### Tabla: users
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `username` TEXT UNIQUE NOT NULL
- `password` TEXT NOT NULL (⚠️ Plain text - inseguro)
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP

#### Tabla: test_table (desarrollo)
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `message` TEXT NOT NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

### Migraciones

🚨 **NO IMPLEMENTADO**: Sistema de migraciones
- Los cambios de schema requieren recrear la BD
- **TODO**: Implementar sistema de versioning
- **Alternativa actual**: Backup antes de cambios

## Error Handling

### Códigos de Respuesta Estándar

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | Success | Operación exitosa |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Credenciales incorrectas |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Error | Error del servidor |

### Formato de Errores

```typescript
// ✅ Respuesta exitosa
{
  "success": true,
  "data": { ... },
  "message": "Operation completed"
}

// ❌ Respuesta de error
{
  "success": false,
  "message": "Descriptive error message",
  "error": "INVALID_CREDENTIALS"
}
```

### Logging

🚨 **NO IMPLEMENTADO**: Sistema de logs
- **TODO**: Implementar winston o similar
- **Actual**: Solo console.log básico
- **Requerido**: Logs estructurados con niveles

## Documentación API

La API incluye documentación automática con **Swagger/OpenAPI** integrada en ElysiaJS.

### Swagger UI

- **URL**: `http://localhost:3001/swagger`
- **Plugin**: `@elysiajs/swagger`
- **Características**:
  - 📚 Documentación automática de endpoints
  - 🔍 Interfaz interactiva para probar APIs
  - 📝 Validación de schemas TypeScript
  - 🏷️ Organización por tags (Health, Database, Authentication)

### Reglas de Documentación Swagger

🚨 **OBLIGATORIO**: Al crear o modificar endpoints:

#### 1. Documentar cada endpoint
```typescript
.post("/api/endpoint", handler, {
  detail: {
    summary: 'Título del endpoint',
    description: 'Descripción detallada de funcionalidad',
    tags: ['DomainName']
  },
  body: t.Object({
    field: t.String({ description: 'Descripción del campo' })
  }),
  response: {
    200: t.Object({
      success: t.Boolean(),
      data: t.Any()
    }),
    400: t.Object({
      success: t.Boolean(),
      message: t.String()
    })
  }
})
```

#### 2. Elementos Requeridos
- **`summary`**: Título claro y conciso
- **`description`**: Explicación detallada del propósito
- **`tags`**: Agrupación por dominio (Authentication, Users, Farms, etc.)
- **`body`**: Schema de request con descripciones de campos
- **`response`**: Todos los códigos HTTP posibles (200, 400, 401, 404, 500)

#### 3. Organización por Tags
```typescript
tags: [
  { name: 'Health', description: 'Endpoints de salud del sistema' },
  { name: 'Authentication', description: 'Endpoints de autenticación' },
  { name: 'Users', description: 'Gestión de usuarios' },
  { name: 'Farms', description: 'Gestión de fincas' },
  { name: 'Crops', description: 'Gestión de cultivos' }
]
```

#### 4. Beneficios de la Documentación
- 🔒 **Validación automática**: Request/Response typesafe
- 📚 **Documentación viva**: Siempre actualizada con el código
- 🧪 **Testing integrado**: Swagger UI para probar endpoints
- 👥 **API First**: Frontend puede trabajar en paralelo
- 📋 **Contratos claros**: Especificaciones precisas para integraciones

## Guías de Desarrollo

### Convenciones de Naming

```typescript
// ✅ Archivos y carpetas
PascalCase/          // Entities, Value Objects, Use Cases
kebab-case.ts        // Archivos generales
camelCase           // Variables y funciones

// ✅ Ejemplos
User.ts             // Entidad
UserRepository.ts   // Interface/Port  
SqliteUserRepository.ts // Implementación
login-use-case.ts   // Archivo de caso de uso
LoginUseCase        // Clase dentro del archivo
```

### Estructura de Nuevos Dominios

```bash
src/
├── {domain-name}/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── DomainEntity.ts
│   │   ├── value-objects/
│   │   │   └── DomainValueObject.ts  
│   │   ├── ports/
│   │   │   └── DomainRepository.ts
│   │   └── services/
│   │       └── DomainService.ts
│   ├── application/
│   │   └── use-cases/
│   │       └── DomainUseCase.ts
│   └── infrastructure/
│       ├── repositories/
│       │   └── SqliteDomainRepository.ts
│       ├── services/
│       │   └── ExternalDomainService.ts
│       └── http/
│           └── DomainController.ts
```

### Checklist para Nuevas Features

🔍 **Antes de hacer commit**:

- [ ] **Arquitectura hexagonal** respetada
- [ ] **Domain layer** sin dependencias externas
- [ ] **Swagger documentation** completa
- [ ] **Tests en api.http** para todos los casos
- [ ] **Error handling** implementado
- [ ] **TypeScript** sin errores
- [ ] **Naming conventions** seguidas

### Health Checks

```bash
# Endpoint para monitoring
GET /api/health

# Response esperado
{
  "status": "ok", 
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "database": "connected"
}
```

### Performance Considerations

- 🚀 **SQLite**: Adecuado hasta 100k requests/día
- 📊 **Monitoring**: Implementar métricas de respuesta
- 🔄 **Connection pooling**: No requerido con SQLite
- 📈 **Scaling**: Considerar PostgreSQL para > 1M requests/día