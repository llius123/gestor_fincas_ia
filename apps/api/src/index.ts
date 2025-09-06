import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { db } from "./db";
import { SqliteUserRepository } from "./auth/infrastructure/repositories/SqliteUserRepository";
import { SimpleAuthenticationService } from "./auth/infrastructure/services/SimpleAuthenticationService";
import { LoginUseCase } from "./auth/application/use-cases/LoginUseCase";
import { AuthController } from "./auth/infrastructure/http/AuthController";
import { JwtAuthMiddleware } from "./auth/infrastructure/middleware/JwtAuthMiddleware";

// Initialize dependencies (Dependency Injection)
const userRepository = new SqliteUserRepository(db);
const authService = new SimpleAuthenticationService();
const loginUseCase = new LoginUseCase(userRepository, authService);
const authController = new AuthController(loginUseCase);
const jwtMiddleware = new JwtAuthMiddleware(authService);

const app = new Elysia()
  .use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }))
  .derive(async ({ headers }) => {
    const authContext = await jwtMiddleware.authenticate(headers.authorization);
    return {
      auth: authContext
    };
  })
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Gestor Fincas IA API',
          version: '1.0.0',
          description: 'API REST para el sistema de gestión de fincas con IA'
        },
        servers: [
          {
            url: 'http://localhost:3001',
            description: 'Servidor de desarrollo'
          }
        ],
        tags: [
          { name: 'Health', description: 'Endpoints de salud del sistema' },
          { name: 'Database', description: 'Endpoints de prueba de base de datos' },
          { name: 'Authentication', description: 'Endpoints de autenticación' }
        ]
      }
    })
  )
  .get("/", () => "Hello Elysia", {
    detail: {
      summary: 'Endpoint raíz',
      description: 'Endpoint de bienvenida de la API',
      tags: ['Health']
    }
  })
  .get("/api/health", () => ({ status: "ok", timestamp: new Date().toISOString() }), {
    detail: {
      summary: 'Health Check',
      description: 'Verifica el estado de la API',
      tags: ['Health']
    },
    response: t.Object({
      status: t.String(),
      timestamp: t.String()
    })
  })
  .get("/api/test-db", () => {
    try {
      // Test database connection by fetching test records
      const records = db.query('SELECT * FROM test_table ORDER BY created_at DESC LIMIT 5').all();

      // Insert a new test record
      const insertQuery = db.query('INSERT INTO test_table (message) VALUES (?)');
      insertQuery.run(`Test connection at ${new Date().toISOString()}`);

      return {
        status: "success",
        message: "Database connection working correctly",
        existingRecords: records,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      };
    }
  }, {
    detail: {
      summary: 'Test Database Connection',
      description: 'Prueba la conexión a la base de datos SQLite',
      tags: ['Database']
    },
    response: t.Object({
      status: t.String(),
      message: t.String(),
      existingRecords: t.Optional(t.Array(t.Any())),
      error: t.Optional(t.String()),
      timestamp: t.String()
    })
  })
  .post("/api/auth/login", async ({ body, set }) => {
    const result = await authController.login(body);
    set.status = result.status;
    return result.body;
  }, {
    detail: {
      summary: 'User Login',
      description: 'Autentica un usuario con username y password',
      tags: ['Authentication']
    },
    body: t.Object({
      username: t.String({ description: 'Nombre de usuario' }),
      password: t.String({ description: 'Contraseña del usuario' })
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        token: t.String(),
        user: t.Optional(t.Object({
          id: t.Number(),
          username: t.String()
        }))
      }),
      400: t.Object({
        success: t.Boolean(),
        message: t.String()
      }),
      401: t.Object({
        success: t.Boolean(),
        message: t.String()
      }),
      500: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
    }
  })
  .get("/api/profile", ({ auth }) => {
    return {
      success: true,
      message: "Profile data retrieved successfully",
      user: auth.user,
      timestamp: new Date().toISOString()
    };
  }, {
    ...jwtMiddleware.createProtectedHandler(),
    detail: {
      summary: 'Get User Profile',
      description: 'Obtiene la información del perfil del usuario autenticado (requiere JWT token)',
      tags: ['Authentication']
    },
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        user: t.Object({
          userId: t.Number(),
          username: t.String()
        }),
        timestamp: t.String()
      }),
      401: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
    }
  });

app.listen(3001);
console.log(`🦊 Elysia is running at http://localhost:3001`);
console.log(`📚 Swagger documentation: http://localhost:3001/swagger`);
console.log(`📝 Login endpoint: POST http://localhost:3001/api/auth/login`);
console.log(`🔑 Test credentials: username: admin, password: admin123`);