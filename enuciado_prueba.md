# **Simulacro de Prueba de Desempeño**
## **TypeScript + React.js + Next.js + JWT Seguro**

---

## **1. Caso de Uso**

**ClockHub**, una plataforma de gestión de horarios y calendarios para equipos pequeños, gestiona actualmente sus datos en archivos dispersos y spreadsheets. Esto ha generado múltiples problemas:

- **Conflictos de horario**: Sin forma centralizada de verificar disponibilidad.  
- **Falta de rastreo**: Cambios en turnos no se documentan; imposible auditar quién modificó qué y cuándo.  
- **Permisos descontrolados**: Todos pueden editar horarios de todos; sin roles ni restricciones.  
- **Pérdida de datos**: Archivos corruptos, falta de backups, sin historial de cambios.  
- **Ineficiencia operativa**: No hay integración con notificaciones; sin confirmaciones de disponibilidad.  

La gerencia decidió desarrollar una **plataforma web interna** con Next.js, React, TypeScript y **PostgreSQL + Prisma** que centralice horarios, usuarios con roles y permisos granulares, autenticación segura con JWT y Refresh Tokens, y un dashboard moderno.

---

## **2. Objetivo General**

Construir una aplicación full-stack con **Next.js + TypeScript + PostgreSQL (Prisma)** que implemente:

- ✅ Autenticación segura con JWT, Refresh Tokens y HttpOnly Cookies  
- ✅ Control de acceso basado en roles (Admin, Manager, Employee)  
- ✅ CRUD de horarios con validaciones y conflictos  
- ✅ Gestión de usuarios con auditoría de cambios  
- ✅ API RESTful tipada y con validaciones  
- ✅ Dashboard responsivo con estado global (Context API + Hooks)  
- ✅ Manejo robusto de errores y mensajes al usuario  
- ✅ Documentación completa con README e instrucciones  

---

## **3. Funcionalidades Principales**

### **3.1 Autenticación y Seguridad (OBLIGATORIO)**
- Login y Registro con validaciones  
- Hasheo de contraseñas con **bcryptjs**  
- Tokens JWT + Refresh Tokens en HttpOnly Cookies  
- Middleware de autenticación en Next.js  
- Redirección automática si token expira  

### **3.2 Control de Acceso Basado en Roles (RBAC)**
| Permiso | Admin | Manager | Employee |
|---------|-------|---------|----------|
| Ver todos los horarios | ✅ | ✅ (equipo) | ❌ (solo suyos) |
| Crear horarios | ✅ | ✅ (equipo) | ❌ |
| Editar horarios | ✅ | ✅ (equipo) | ❌ |
| Eliminar horarios | ✅ | ✅ (equipo) | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Ver auditoría | ✅ | ✅ (limitado) | ❌ |
| Cambiar roles | ✅ | ❌ | ❌ |

### **3.3 Gestión de Horarios**
- Modelo tipado en TypeScript  
- CRUD completo con validación de conflictos  
- Soft delete (CANCELLED)  
- Auditoría de cambios  

### **3.4 Gestión de Usuarios**
- CRUD solo para Admin  
- Roles asignables y estados (ACTIVE/INACTIVE/SUSPENDED)  
- Auditoría de cambios  

### **3.5 Auditoría y Trazabilidad**
- Modelo `AuditLog`  
- Registro automático de CRUD, login/logout y cambios de rol  
- Vista accesible para Admin y Manager  

### **3.6 UI Reutilizable**
Componentes obligatorios: **Button, Badge, Card, Modal/Dialog** con props tipadas en TypeScript.  

### **3.7 API RESTful en Next.js**
Endpoints obligatorios para **Auth, Users, Schedules, AuditLogs**.  

### **3.8 Validaciones Tipadas**
Uso de NextResponse en el servidor.  

### **3.9 Manejo de Errores**
Respuestas uniformes con `success: true/false`, códigos HTTP correctos y mensajes claros.  

### **3.10 Estado Global**
Context API + Hooks para **AuthContext** y **ScheduleContext**.  

---

## **4. Criterios de Aceptación**
Checklist detallado para cada módulo: autenticación, RBAC, CRUD, auditoría, UI, validaciones, API, errores y documentación.  

---

## **5. Stack Técnico Recomendado**

- **Frontend**: Next.js 14+, React 18+, TypeScript strict, Tailwind CSS  
- **Backend**: Next.js API Routes, **PostgreSQL + Prisma**, bcryptjs, jsonwebtoken  
- **DevOps**: dotenv, ESLint + Prettier, PostgreSQL local o en la nube  

---

## **6. Estructura de Carpetas Recomendada "La que hemos venido trabajando"**
Incluye `src/app`, `components`, `context`, `hooks`, `services`, `types`, `lib`, `middleware`, `utils`.  

---

## **7. Fases de Implementación**
Plan de trabajo en 6 fases: Setup, Autenticación, CRUD, RBAC + Auditoría, UI, Documentación.  

---

## **8. Entregables Obligatorios**
Repositorio GitHub