import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .get("/api/health", () => ({ status: "ok", timestamp: new Date().toISOString() }));

app.listen(3001);
console.log(`🦊 Elysia is running at http://localhost:3001`);