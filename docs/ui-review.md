# Revisión de UI y responsive design

Fecha: 2026-07-18 · Alcance: **auditoría estática del código** (clases Tailwind, patrones de layout, componentes). La validación visual en dispositivos reales requiere la app corriendo contra la BD migrada y queda como P4-11 del backlog con el checklist de abajo.

## Fortalezas actuales

- **Design system con tokens**: 135 variables CSS en HSL (`index.css`), modo claro/oscuro (`next-themes`) y selector de tema de color (`ThemeSelector`). Ninguna pantalla usa colores hardcodeados relevantes.
- **Iconografía consistente**: 100% `lucide-react`, con `IconWrapper` y mapa de iconos configurable para categorías y cuentas.
- **Componentes**: base shadcn-ui uniforme (Card, Dialog, Select, Progress, etc.); formularios con inputs `min-h-[44px] touch-manipulation` en las pantallas de uso frecuente (objetivo táctil ≥44px, cumple pauta iOS/Android).
- **Patrones responsive correctos** en las pantallas núcleo: grids `grid-cols-1 md:grid-cols-2/3`, `flex-wrap` en cabeceras, sidebar colapsable a iconos (shadcn Sidebar) con trigger móvil, diálogos con `max-h-[90vh] overflow-y-auto`.
- **Gráficas**: Recharts siempre dentro de `ResponsiveContainer`.
- **Centro de ayuda**: patrón lista→detalle en móvil con botón "volver" (implementado en esta rama).

## Hallazgos y recomendaciones

### R1 — Tipografía sin fuente definida (recomendado)
No hay `fontFamily` en `tailwind.config.ts` ni `@import` de fuentes: la app usa la fuente del sistema. Para una app financiera se recomienda una sans con números tabulares: **Inter** (con `font-feature-settings: "tnum"` en cifras) o **IBM Plex Sans**. Beneficio: las columnas de montos alinean dígitos y mejora la lectura de tablas. Implementación: 1 import en `index.css` + `fontFamily.sans` en Tailwind + clase utilitaria `tabular-nums` en montos.

### R2 — Montos largos en móvil (menor)
Cifras COP con millones (ej. `$12.345.678`) pueden desbordar tarjetas de 2 columnas en pantallas <360px. Ya existe `break-words` en Recurrentes; falta aplicarlo o usar `text-base sm:text-2xl` adaptativo en BalanceCard y tarjetas del dashboard. El formato "miles" (`formatCurrency` ya lo soporta) debería ser el default en móvil.

### R3 — Listas largas sin virtualización (aceptable por ahora)
`TransactionList` renderiza tarjetas apiladas (bien para móvil, no usa `<table>`, no hay scroll horizontal). Con el tope de 5.000 filas el DOM puede crecer; cuando llegue la paginación por rangos (P1-9) esto se resuelve solo.

### R4 — Páginas legales/estáticas con ancho completo (menor)
`Terminos`, `TratamientoDatos`, `FAQ` leen mejor con `max-w-prose mx-auto` para limitar el largo de línea (~70 caracteres).

### R5 — Accesibilidad (media)
Lo bueno: labels asociados (`htmlFor`), `aria-label` en botones de icono de las pantallas nuevas, contraste del primario verde sobre blanco correcto. Pendiente: revisar `aria-label` en botones de icono de pantallas legadas (TransactionList, Categories), foco visible al navegar con teclado en las tarjetas-botón, y `prefers-reduced-motion` para las transiciones de framer-motion.

### R6 — Breakpoints por pantalla (verificado)
Dashboard, Transacciones, Medios de Pago, Recurrentes, EmailStaging, Ayuda y Reportes usan grids adaptativos correctos. `Budgets` es de una sola columna con `flex-wrap` (correcto para su contenido). `NotFound`/`ResetPassword` son centradas simples (correcto).

## Checklist para la validación en dispositivos reales (P4-11)

1. iPhone SE/12 mini (375px): dashboard con 2+ tarjetas de cuenta, montos de 8 dígitos.
2. Android gama media (360px): formulario de transacción con teclado abierto (inputs no tapados).
3. Tablet (768px): sidebar expandida vs colapsada; grids de 2→3 columnas.
4. Desktop 1440px: máximos anchos (`max-w-*`) evitan líneas kilométricas.
5. Modo oscuro en todas las anteriores.
6. Zoom del navegador 200% (WCAG 1.4.4) y navegación completa por teclado.
7. Lighthouse móvil: objetivo ≥90 en Accesibilidad.

## Priorización sugerida

R1 y R2 son de bajo esfuerzo y alto impacto visual → candidatas a la próxima ronda. R5 se aborda junto con la validación en dispositivos. R3 se resuelve con P1-9.
