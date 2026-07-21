# App Base Template 🚀

Este repositorio sirve como **Línea Base (Boilerplate) Institucional** para la creación de nuevos proyectos (ej. Lynx, MisFin v2, etc.). Su objetivo principal es optimizar el desarrollo, facilitar el mantenimiento y estandarizar la implementación de patrones de diseño, calidad y seguridad, permitiendo una escalabilidad eficiente bajo una estructura de referencia compartida.

> [!IMPORTANT]
> **Gestión de Componentes Visuales (UI)**
> Este boilerplate **NO incluye** configuraciones de UI (Tailwind CSS, shadcn/ui, iconos, etc.). Toda la capa de presentación y componentes reutilizables se delegan a un **Repositorio Paralelo de Librería de Componentes**. De esta manera, aseguramos la consistencia visual en toda la empresa desde una única fuente de verdad.

---

## 🛠️ Stack Tecnológico

La arquitectura base está construida sobre tecnologías robustas enfocadas en la lógica y escalabilidad:

- **Core:** React 18 + TypeScript 5 (Strict Mode) + Vite (SWC).
- **Estado y Data Fetching:** TanStack React Query 5 (Manejo de estado asíncrono y caché).
- **Enrutamiento:** React Router DOM 6.
- **Formularios y Validación:** React Hook Form + Zod (Validación tipada en frontend y variables de entorno).
- **Autenticación & Backend:** Supabase (Auth, PostgreSQL, RLS).

---

## 🛡️ CI/CD y Quality Gates (Validación de Seguridad y Calidad)

Para asegurar que todos los proyectos mantengan los más altos estándares al hacer *push* sobre las ramas de `uat` (User Acceptance Testing) y `prd` (Producción), este repositorio incluye flujos automatizados de **GitHub Actions** en `.github/workflows/quality-gate.yml`.

Cada PR o Push ejecutará los siguientes *Quality Gates*:
1. **Auditoría de Seguridad:** Ejecuta `npm audit` para bloquear vulnerabilidades conocidas en dependencias de terceros.
2. **Quality Score (Linting):** Ejecuta `npm run lint` validando que no existan errores de código, variables huérfanas, o anti-patrones.
3. **TypeScript Strict Check:** Corre `npx tsc --noEmit` para garantizar la limpieza total de tipos de datos.
4. **Tests & Coverage:** Ejecuta `npm run test:coverage` garantizando que la cobertura del código cumpla con los umbrales mínimos establecidos.

---

## 🏗️ Arquitectura: Feature-Sliced Design (FSD)

Hemos abandonado las estructuras planas en favor de una arquitectura modular y escalable. El código en `src/` se divide en tres capas principales:

### 1. `core/` (Capa de Infraestructura)
Contiene la inicialización de la aplicación y configuraciones globales que afectan a todo el proyecto.
- `core/config/env.ts`: Validación estricta de variables de entorno usando Zod. *(Fail-Fast approach)*.
- `core/providers/`: Encapsulación de contextos globales (QueryClient, AuthProvider, etc.).
- `core/errors/`: Manejo global de excepciones (`GlobalErrorBoundary`).

### 2. `shared/` (Capa Compartida)
Utilidades genéricas que pueden ser usadas en cualquier parte sin acoplamiento a la lógica de negocio.
- `shared/utils/`: Funciones utilitarias comunes.
- `shared/hooks/`: Hooks genéricos de lógica.

### 3. `features/` (Capa de Dominio / Negocio)
Agrupa el código por **funcionalidad o dominio**, en lugar de por tipo de archivo. Cada feature es independiente.
- `features/auth/`: Contiene todo lo relacionado a la sesión (`useAuth`, `ProtectedRoute`).
- *(Tus nuevos dominios irán aquí, ej: `features/transactions`, `features/analytics`)*.

---

## 🛡️ Buenas Prácticas y Reglas de Código

Cualquier proyecto derivado de este _boilerplate_ debe adherirse a los siguientes estándares:

1. **TypeScript Estricto:**
   - `"strict": true` y `"noImplicitAny": true` están forzados en `tsconfig.json`.
   - **Prohibido el uso de `any`**. Si el tipo es desconocido, usar `unknown` y hacer las aserciones correspondientes.

2. **Validación de Entorno (Fail-Fast):**
   - Nunca usar `import.meta.env` directamente en los componentes. Las variables se importan desde `src/core/config/env.ts` donde son validadas por Zod.

3. **Manejo de Errores Global:**
   - Todo el árbol de React está envuelto en un `GlobalErrorBoundary` para ofrecer una vista de contingencia evitando pantallas en blanco.

## 🚀 Inicio Rápido (Desarrollo Local)

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar el entorno:**
   Copia el archivo de ejemplo y completa las credenciales de tu proyecto Supabase.
   ```bash
   cp .env.example .env.local
   ```

3. **Levantar el servidor:**
   ```bash
   npm run dev
   ```

---
*Este boilerplate valida exhaustivamente la calidad de software. Asegúrate de corregir cualquier error del compilador o del linter localmente antes de intentar fusionar código a ramas principales.*
