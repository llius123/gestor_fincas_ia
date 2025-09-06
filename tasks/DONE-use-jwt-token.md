## ✅ TAREA COMPLETADA

Pre idea:
Revisa esta tarea.
Si tienes dudas pregunta antes de empezar.

Idea:
El backend cuando se hace login devuelve un token jwt.

Tareas:
Hay que crear un middleware en el backend que verifique el token jwt que manda el front.
En el front hay que crear una ruta protegida que solo sea accesible si el token jwt esta y es valido

---

## 📝 MEJORAS PARA FUTURAS TAREAS SIMILARES

Para hacer descripciones más completas y evitar dudas:

### Estructura mejorada sugerida:

```markdown
# TODO: Implementar JWT Token Authentication

## Contexto
El sistema actual hace login pero no mantiene la sesión. Necesitamos JWT tokens para autenticación persistente.

## Objetivos
1. Backend devuelve JWT token en login
2. Frontend guarda y usa el token automáticamente  
3. Rutas protegidas verifican el token

## Tareas Backend
- [ ] Actualizar endpoint login para generar JWT token
- [ ] Crear middleware de verificación JWT
- [ ] Crear ruta protegida de ejemplo (ej: /api/profile)
- [ ] Actualizar tests en auth.http

## Tareas Frontend  
- [ ] Actualizar hook useLogin para guardar token
- [ ] Crear hook useAuth para gestión global
- [ ] Crear componente ProtectedRoute
- [ ] Crear página protegida de ejemplo (/profile)
- [ ] Seguir arquitectura Container/Component obligatoria

## Criterios de Éxito
- [ ] Login devuelve token JWT
- [ ] Token se guarda automáticamente en localStorage
- [ ] Ruta /profile funciona solo con token válido
- [ ] Sin token, redirige a login
- [ ] Token inválido, error 401

## Tests de Verificación
- [ ] curl login → obtener token
- [ ] curl /profile sin token → 401
- [ ] curl /profile con token → 200
- [ ] Frontend: acceso a /profile sin login → redirect a /login
- [ ] Frontend: logout → limpiar token y redirect

## Consideraciones Técnicas
- JWT secret: usar variable de entorno en producción
- Expiración: 24h por defecto
- Middleware: aplicar solo a rutas que lo necesiten
- Frontend: manejar expiración automáticamente
```

### Beneficios de esta estructura:
- ✅ **Contexto claro** del problema a resolver
- ✅ **Objetivos específicos** y medibles
- ✅ **Desglose detallado** backend/frontend
- ✅ **Criterios de éxito** verificables
- ✅ **Tests concretos** para validar
- ✅ **Consideraciones técnicas** importantes
