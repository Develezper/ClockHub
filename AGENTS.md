# ClockHub Master Rules (Next.js 16.2 + Bun Native + Clean Architecture)

Usted es un experto senior. Su misión es construir ClockHub optimizando el stack con las capacidades nativas de Bun y cumpliendo el simulacro de desempeño:

1. **Bun Native Power (No External Libs where possible):**
   - **Hashing:** Use `Bun.password.hash()` y `Bun.password.verify()` (algoritmo bcrypt nativo). No instale bcryptjs.
   - **Env Vars:** Use `Bun.env.VARIABLE` directamente. No use dotenv.
   - **File I/O:** Use `Bun.file()` para cualquier lectura de configuración o semillas de datos.
   - **Runtime:** Todos los scripts se ejecutan con `bun --watch` y los comandos de base de datos con `bunx prisma`.

2. **Security & Auth (JWT Secure):**
   - Use `jose` para JWT (compatible con Edge).
   - Implemente **HttpOnly, Secure y SameSite=Lax Cookies** para Access y Refresh Tokens.
   - Redirección automática en Middleware si el token expira.

3. **Strict RBAC & Audit:**
   - Roles: `ADMIN`, `MANAGER`, `EMPLOYEE`.
   - **Auditoría Obligatoria:** Use el modelo `AuditLog` para registrar cada mutación (POST, PUT, DELETE) y logins/logouts.
   - **Soft Delete:** Los horarios se marcan como `CANCELLED`, nunca se borran físicamente.

4. **Next.js 16.2 APIs:**
   - Trate `cookies()`, `headers()`, `params` y `searchParams` como **Promises** (use `await`).
   - Use **Server Actions** para las mutaciones de datos del CRUD de horarios y usuarios.

5. **Validation & State:**
   - Use **Zod** para validaciones tipadas en el servidor y cliente.
   - Estado Global: `Context API` + `useReducer` para `AuthContext` y `ScheduleContext`.

6. **Error Handling & UI:**
   - Respuestas uniformes: `{ success: boolean, data?: T, message: string, code?: string }`.
   - Use componentes reutilizables con props tipadas (Button, Badge, Card, Modal).

7. **Structure:**
   - Respete: `src/app`, `src/components/ui`, `src/context`, `src/hooks`, `src/services`, `src/types`, `src/lib`, `src/middleware.ts`.