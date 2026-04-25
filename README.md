#  ClockHub: Enterprise Schedule Management System

ClockHub es una plataforma de alto desempeño diseñada para la gestión centralizada de horarios y auditoría operativa. Construida sobre una **Arquitectura Limpia (Clean Architecture)** con **Next.js 16.2**, garantiza seguridad de nivel empresarial, trazabilidad total de acciones y control de acceso granular (RBAC).

---

##  Stack Tecnológico Superior

*   **Core**: [Next.js 16.2](https://nextjs.org/) (Node Runtime) con TypeScript Strict Mode.
*   **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) con [Prisma ORM](https://www.prisma.io/).
*   **Seguridad**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) (Hashing Rounds: 12) y [jose](https://www.npmjs.com/package/jose) para JWT en Edge.
*   **Gestión de Paquetes**: [Bun](https://bun.sh/) para máxima velocidad de instalación y ejecución.
*   **Validación**: Esquemas tipados con [Zod](https://zod.dev/).
*   **Estado Global**: React Context API + Custom Hooks.

---

##  Seguridad y Autenticación (Enterprise Ready)

ClockHub implementa un flujo de seguridad robusto basado en **JWT Secure Pattern**:

1.  **Dual Tokens**: Sistema de `Access Token` (TTL corto) y `Refresh Token` (TTL largo).
2.  **HttpOnly Cookies**: Los tokens se almacenan en cookies con flags `HttpOnly`, `Secure` y `SameSite=Lax`, haciéndolos inmunes a ataques XSS.
3.  **Token Rotation**: Implementado de forma transparente mediante el middleware de Next.js.
4.  **Middleware / Proxy Pattern**: Intercepción a nivel de Edge para validar sesiones antes de que la request toque la lógica de negocio.

---

## ⚖️ Control de Acceso basado en Roles (RBAC)

El sistema implementa una matriz de permisos estricta:

| Funcionalidad | ADMIN | MANAGER | EMPLOYEE |
| :--- | :---: | :---: | :---: |
| Crear/Editar Usuarios | ✅ | ❌ | ❌ |
| Ver Auditoría General | ✅ | ✅ (Team Only) | ❌ |
| Ver Horarios de Equipo | ✅ | ✅ | ❌ |
| Ver Horarios Propios | ✅ | ✅ | ✅ |
| Soft Delete (Cancelación) | ✅ | ✅ | ❌ |

---

##  Instalación y Configuración

### 1. Requisitos Previos
*   Bun >= 1.1 o Node.js >= 20
*   Instancia de PostgreSQL (Supabase recomendada)

### 2. Configuración del Entorno
Clona el repositorio y crea un archivo `.env` basado en el siguiente esquema:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/dbname?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:port/dbname"

# Auth Secrets
JWT_ACCESS_SECRET="generate-a-strong-secret-1"
JWT_REFRESH_SECRET="generate-a-strong-secret-2"
JWT_ISSUER="clockhub-auth"
JWT_AUDIENCE="clockhub-web"

# Timeouts
ACCESS_TOKEN_TTL_SECONDS="900"
REFRESH_TOKEN_TTL_SECONDS="604800"

# Initial Admin
ADMIN_EMAIL="admin@clockhub.com"
ADMIN_PASSWORD="TuPasswordSegura2026"
```

### 3. Ejecución
```bash
# 1. Instalar dependencias
bun install

# 2. Preparar base de datos
bunx prisma db push
bunx prisma generate

# 3. Datos iniciales (Crucial para evaluación)
bunx prisma db seed

# 4. Iniciar servidor
bun run dev
```

---

##  Datos de Prueba (Seed Data)

El comando de seed crea una estructura operativa lista para usar con la contraseña configurada en `ADMIN_PASSWORD` del `.env` (**Default: AdminClock2026**).

*   **ADMIN**: `admin@clockhub.com`
*   **GERENTE (Team Alpha)**: `manager.alpha@clockhub.local`
*   **EMPLEADO (Ana)**: `ana.employee@clockhub.local`

---

##  Arquitectura del Proyecto

```text
src/
├── action/     # Server Actions (Mutaciones atómicas)
├── app/        # App Router 16.2 (Pages & API Routes)
├── components/ # UI Reutilizable (Shadcn Pattern)
├── context/    # Estado Global (Auth & Schedules)
├── hooks/      # Lógica de componentes desacoplada
├── lib/        # Utilidades core (Auth, Database, Hash)
├── types/      # Definiciones TypeScript estrictas
└── proxy.ts    # Middleware de seguridad centralizado
```

##  Auditoría y Trazabilidad

Cada acción que modifica el estado del sistema es registrada en el modelo `AuditLog`, capturando:
*   **Actor**: Quién realizó la acción.
*   **Acción**: POST, PUT, DELETE, LOGIN/LOGOUT.
*   **Timestamp**: Precisión milimétrica para reportes regulatorios.
*   **Impacto**: Qué entidad fue modificada.
