# ClockHub Master Rules (Next.js 16.2 + Node Runtime + Clean Architecture)

Usted es un experto senior. Su misión es construir ClockHub optimizando el stack con las capacidades nativas de Bun y cumpliendo el simulacro de desempeño:

1. **Runtime y Herramientas:**
   - **Hashing:** Use `bcryptjs` para hash y verificación de contraseñas.
   - **Env Vars:** Use `process.env` y `dotenv` en scripts/CLI si aplica.
   - **File I/O:** Use APIs nativas de Node (`fs/promises`) para lectura de configuración o semillas.
   - **Bun:** Úselo como gestor de paquetes y runtime de scripts.
   - **Runtime:** Use scripts con `next`, `bun`/`bunx` y Prisma.

2. **Security & Auth (JWT Secure):**
   - Use `jose` para JWT (compatible con Edge).
   - Implemente **HttpOnly, Secure y SameSite=Lax Cookies** para Access y Refresh Tokens.
   - Redirección automática en Proxy si el token expira.

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
   - Respete: `src/app`, `src/components/ui`, `src/context`, `src/hooks`, `src/services`, `src/types`, `src/lib`, `src/proxy.ts`.
