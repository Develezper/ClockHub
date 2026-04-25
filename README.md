# ClockHub

Aplicación interna para gestión de horarios con autenticación segura, RBAC y auditoría.

## Stack
- Next.js 16.2 + React 19 + TypeScript
- PostgreSQL + Prisma
- Runtime Node.js (`process.env`, `bcryptjs`)
- Bun solo para gestión de paquetes
- JWT con `jose` en cookies HttpOnly

## Requisitos
- Bun 1.1+
- Node.js 20+
- Supabase Postgres activo
- Variables en `.env`:
  - `DATABASE_URL`
  - `DIRECT_URL` (opcional)
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `JWT_ISSUER`
  - `JWT_AUDIENCE`
  - `ACCESS_TOKEN_TTL_SECONDS`
  - `REFRESH_TOKEN_TTL_SECONDS`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`

## Comandos
```bash
bun run prisma:generate
bun run prisma:migrate
bun run prisma:seed
bun run dev
bun run lint
```

## Supabase
- Usa la cadena de conexión de Supabase con `sslmode=require`.
- Si usas pooler para `DATABASE_URL`, define `DIRECT_URL` con conexión directa para migraciones.

## Credenciales de seed
- Admin: `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- Usuarios demo:
  - `manager.alpha@clockhub.local`
  - `ana.employee@clockhub.local`
  - `luis.employee@clockhub.local`
  - `manager.beta@clockhub.local`
  - `sara.employee@clockhub.local`
- Password demo: `SEED_DEFAULT_PASSWORD` (si no existe, usa `ADMIN_PASSWORD`)

## RBAC aplicado
- `ADMIN`: gestiona todo.
- `MANAGER`: horarios de su equipo (mismo `teamId`) + propios.
- `EMPLOYEE`: solo visualiza sus horarios.
- Gestión completa de usuarios: solo `ADMIN`.

## Endpoints REST
- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/refresh`, `/api/auth/logout`
- Users: `GET/POST /api/users`, `PUT/DELETE /api/users/:id`
- Schedules: `GET/POST /api/schedules`, `PUT/DELETE /api/schedules/:id`
- Audit: `GET /api/audit-logs`

## Notas de seguridad
- Password hashing con `bcryptjs`.
- JWT Access/Refresh con `jose`.
- Cookies `HttpOnly`, `Secure` (en producción) y `SameSite=Lax`.
- Soft delete de horarios con estado `CANCELLED`.
- Auditoría obligatoria en login/logout y mutaciones.
