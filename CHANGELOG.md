# Changelog

Todos los cambios relevantes de `@piensa-it/ui-library` se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y
el versionado, [SemVer](https://semver.org/lang/es/).

## [0.2.1] - 2026-09-03

### Fixed

- **DataTable** — `paginator={false}` lanzaba `TypeError: Cannot read properties of undefined (reading 'pageSize')` en `table.getPageCount`: se omitía el estado de paginación y el row model, pero el pie llamaba a `getPageCount()` igual. Ahora se registra siempre el row model con una sola página que abarca todas las filas, y el pie no se renderiza. Cubierto con pruebas de render y de ausencia de pie.
- **DataTable** — Los encabezados ordenables perdían las mayúsculas: el `<th>` lleva `uppercase`, pero el `<button>` de ordenar heredaba el reset de Preflight (`button { text-transform: none }`). El botón ahora aplica `uppercase`; la prueba compila el CSS real de Tailwind y compara el `text-transform` computado de ambos encabezados.
- **DataTable** — `className` de `Column` solo se aplicaba a las `<td>`; ahora también al `<th>`, de modo que `className="text-right"` alinea cifra y título. Nueva prop opcional `headerClassName` para cuando el encabezado necesita clases distintas.

### Added

- **Chart** — Prop `yAxis?: { domain?: [min, max]; tickCount?: number }` que se pasa al `YAxis` de Recharts (`number | "auto" | "dataMin" | "dataMax"` o expresiones como `"dataMax + 100"`). Las gráficas `type="line"` usan `["auto", "auto"]` por defecto, así una serie de precios (p. ej. la TRM entre $2.700 y $3.600) ocupa toda la altura en vez de quedar aplastada sobre un eje desde 0. El resto de tipos conserva `[0, "auto"]`. Tipos nuevos exportados: `ChartYAxis`, `ChartAxisDomainValue`.
- **DataTable** — `paginator="auto"`, ahora el valor por defecto: el pie de paginación solo aparece cuando hay más filas que `rows`. Tablas de 3 a 10 filas dejan de mostrar "Filas por página 50 · 1-3 de 3". `paginator={true}` fuerza el pie como antes y `paginator={false}` lo omite. Para conservar el comportamiento anterior en todas las tablas, pasa `paginator` explícitamente.
- **Tabs** — `defaultValue` documentado y tipado como prop propia: elige la pestaña inicial en modo no controlado sin llevar el estado desde el consumidor. Si llega `undefined` explícito, se abre la primera pestaña en vez de quedar sin pestaña activa. Cubierto con pruebas de RTL del panel activo al montar.

### Docs

- Stories nuevas: `DataTable` (columna numérica alineada a la derecha, sin paginador, paginador forzado), `Chart` (serie de precios con eje automático, dominio del eje Y controlado) y `Tabs` (pestaña inicial con `defaultValue`).

## [0.2.0] - 2026-09-01

- Migración a TanStack Table v9 y Vite 8; primitivas de motion (stagger, reveal, animated-number, presets de skeleton).

[0.2.1]: https://github.com/piensa-it/app-ui/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/piensa-it/app-ui/releases/tag/v0.2.0
