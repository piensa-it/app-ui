# Changelog

Todos los cambios relevantes de `@piensa-it/ui-library` se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y
el versionado, [SemVer](https://semver.org/lang/es/).

## [Unreleased]

## [0.3.0] - 2026-09-03

Dos frentes en la misma versión: los ajustes que pidió la adopción de
`app-corelink`, y el lineamiento visual y las piezas de armazón que faltaban
para que MiDivisa, Corelink y TuDivisa no puedan verse distintas sin quererlo.

Hay cambios de comportamiento visual. La guía de qué tocar al subir está en
`UI_LIBRARY_RELEASES` y se muestra en la página «Versiones» de la documentación.

### Added — fundamentos

- **Escala de superficies de tres niveles**: `ground` (la página), `surface` (paneles y barras) y `raised` (tarjetas, diálogos, menús), cada uno con su borde y su sombra (`shadow-surface`, `shadow-raised`), en tema claro y oscuro. Antes `--background` y `--card` eran los dos blanco puro en claro: una tarjeta sobre la página no se distinguía y cada aplicación se inventaba su gris. `Card`, `Dialog`, `AlertDialog`, `Popover`, `Menu`, `Select`, `Sheet` y `Toast` toman `raised`; el `body`, `ground`.
- **Escala de espaciado publicada**: siete pasos (`--space-2xs` … `--space-2xl`) más cuatro nombres por rol —`p-inset`, `p-inset-compact`, `space-y-stack`, `gap-field`— disponibles como utilidades de Tailwind. Aplicada en `Card`, `Dialog`, `Field` y `PageHeader`. El ritmo vertical entre bloques de una página es de 24 px y lo pone `PageContainer`.
- **Densidad configurable en `UiProvider`**: `density="compact" | "default" | "comfortable"`. Baja sola a todos los controles porque todos usan los mismos tokens de altura y relleno, así que deja de decidirse componente por componente. Se puede acotar a una sección anidando otro proveedor.
- **Utilidades de contraste exportadas** (`contrastRatio`, `relativeLuminance`, `parseHsl`), para que una aplicación que redefina tokens compruebe sus propios pares.

### Added — armazón

- **`AppShell`**: menú lateral, barra superior y contenido. Trae el plegado con la preferencia recordada por dispositivo (`storageKey`), la animación de ancho, el panel móvil y el carácter cromático del menú. El menú es oscuro en tema claro y en oscuro: es un plano distinto de la interfaz, con sus propios tokens `--sidebar-*` y tres variantes (`graphite`, `ink`, `smoke`) que se eligen con `variant`.
- **`SidebarBrand`**: logo o iniciales, nombre de la organización, distintivo de entorno y un único menú con lo que se puede cambiar ahí. La fila entera es **un solo control**: dos controles compartiendo esos dos centímetros se activan sin querer, y un interruptor no dice qué pasa al activarlo. El entorno es una opción más, con marca de selección y una frase que explica su efecto. Acepta grupos arbitrarios, no solo empresas.
- **`PageContainer`** y **`PageHeader`**: ancho de lectura, relleno y ritmo vertical, con la entrada escalonada activada por defecto. Viene del contenedor a propósito: si cada pantalla decidiera si se anima, solo unas pocas lo harían. `Stagger` respeta `prefers-reduced-motion` sin configuración.
- **`AppVersion`**: versión de la aplicación, versión de la librería y fecha de compilación, con el detalle completo en el `title` para pegarlo en un reporte. Lo primero al recibir uno es saber contra qué compilado se estaba mirando, y eso son dos versiones.

### Changed

- **`--background` deja de ser blanco** y pasa a ser el nivel `ground`; `--card` y `--popover` pasan a ser `raised`. Ambos siguen existiendo como alias, así que `bg-background` y `bg-card` no rompen, pero `bg-background` ahora significa "el fondo de la página".
- **`--muted`, `--secondary`, `--border` e `--input` bajaron de luminosidad** para seguir leyéndose sobre el fondo nuevo. Una prueba comprueba que se distinguen de `ground` en ambos temas.
- **`--accent`, `--surface`, `--surface-hover` y `--surface-border`** se recolocaron dentro de la escala.
- `Dialog` unifica su relleno (`p-inset`) en vez de `p-5` con `sm:p-6`.
- `Stagger` acepta `ref`.

### Fixed

- **`Sheet` ya deja cambiar su superficie**: nueva prop `surface={false}` que quita fondo, borde, sombra y anillo, y hace que el botón de cerrar herede el color del panel en vez de fijar `text-muted-foreground`. Antes, un panel lateral oscuro había que taparlo con un `div` interno y colorear el cierre desde fuera.

### Docs

- **`DESIGN.md`**: las reglas de superficies, espaciado, densidad, formularios y armazón, con su porqué. La regla se decide una vez, aquí, y no en cada aplicación.
- **`docs/ICONS.md`**: el catálogo de 167 iconos de la librería es el set oficial, con la tabla de equivalencias completa para que las aplicaciones retiren su dependencia directa de `lucide-react` y dejen de tener dos copias en `node_modules`.
- **`Field` documentado como el camino por defecto** para poner un control en un formulario, con stories de descripción, error, orientación horizontal y un formulario completo.
- **Guía de migración por versión**: cada entrada de `UI_LIBRARY_RELEASES` dice ahora qué hay que cambiar al subir, no solo qué cambió, y se muestra en la página «Versiones».
- **Aplicación de ejemplo** en Storybook, con `AppShell`, una tabla y un formulario: la referencia contra la que discutir.
- **Prueba visual de la escala de superficies** en tema claro y oscuro, porque un cambio de token afecta a tres aplicaciones a la vez.
- README: coste medido del paquete, cascada de dos hojas de Tailwind y capas de terceros dentro de un diálogo.

### Ajustes de la adopción en `app-corelink`

Ajustes surgidos de la adopción completa de la librería en `app-corelink`
(217 pruebas de extremo a extremo). Cada punto eliminaba un rodeo del
consumidor: un parche sobre `node_modules`, reglas CSS correctivas o adapters.

### Fixed

- **Select** — El `<select>` nativo oculto solo se renderiza cuando llega `name`. Se pintaba siempre, así que cada opción existía dos veces en el DOM y cualquier consulta por texto encontraba antes la copia invisible. Sin `name` ese elemento no aporta nada: solo sirve para enviar el valor dentro de un `<form>`.
- **Checkbox y Switch** — El input nativo ahora cubre todo el control (`inset-0`, `opacity-0`, `clip: auto`) en vez de ser el punto de 1 px recortado que pinta Ark. Una herramienta de automatización que intenta pulsarlo ya no lo desplaza al centro ni entra en el bucle «element is not stable». Para una persona no cambia nada: pulsar en cualquier punto de la etiqueta ya conmutaba.
- **Checkbox y Switch** — `aria-label` se reenvía al input, no al `<label>` raíz, y no se emite `aria-labelledby` cuando no hay prop `label` (Ark lo apuntaba a un Label que no se renderiza). `getByRole("checkbox", { name })` y `getByRole("switch", { name })` resuelven con `aria-label`.
- **Checkbox y Switch** — `id` se traduce a `ids.hiddenInput`, así un `<label htmlFor>` externo asocia con el input. Antes iba al machine de Zag y el input salía como `checkbox:<id>:input`.
- **Dialog y Sheet** — No se cierran por la cascada de Zag ni por el foco. Al retirarse una capa, Zag cierra las que quedan encima (`layer:request-dismiss`), y trata como «fuera» el foco que otra capa devuelve al cerrarse: un panel abierto justo cuando su diálogo de origen terminaba de cerrarse desaparecía solo. `onRequestDismiss` y `onFocusOutside` hacen `preventDefault` por defecto, después de llamar al handler del consumidor. Escape y el clic en el backdrop siguen cerrando.
- **Sheet** — `className`, `style` y `data-*` van al panel (`role="dialog"`). Todo lo que no era `className` acababa en el Root de Ark, así que un `style={{ "--ancho": … }}` o un `data-mobile` se perdían. Las props del Root de Ark (`open`, `position`, `modal`, `on*`, `ids`…) siguen yendo al Root.
- **Tabs** — `listClassName` se aplica a la lista y `className`/`contentClassName` de cada `TabPanel` a su pestaña y a su panel. Antes se ignoraban.

### Added

- **Chart** — `axisFormatter` y `tooltipFormatter` separan el formato del eje del del tooltip: con moneda completa el eje de 60 px recortaba las cifras. `valueFormatter` sigue siendo el respaldo de ambos. `yAxisWidth` ensancha el eje cuando de verdad hace falta la cifra entera.
- **Chart** — `colorKey?: string` toma el color de cada fila para pintar barras y porciones por categoría, en vez del color de la serie o la paleta por índice.
- **Chart** — `allowDecimals?: boolean` se pasa al eje Y; con conteos pequeños evita marcas como 0,5.
- **Select** — `SelectOption.label` admite un `ReactNode` (icono + texto). El texto plano que usan el `<select>` nativo, la búsqueda por teclado y el trigger sale de `textValue`, opcional cuando `label` ya es texto.
- **Toast** — Duración por defecto de 4000 ms para todos los tipos, alineada con sonner y documentada en `ToastOptions`. Zag traía 2 s para `success` y 5 s para el resto; los toasts largos se acumulan y colisionan con consultas por nombre no exactas.
- **Empaquetado** — El paquete se publica con un módulo por archivo fuente (`preserveModules`) en vez de un único bundle, así el bundler del consumidor poda a nivel de módulo. Un consumidor que solo importa `Button` se lleva 2,8 KB de librería en vez de los ~140 KB del paquete entero. La importación pública sigue siendo desde la raíz. Cierra #38.
- **Empaquetado** — Las tres fuentes variables salen de `style.css` (que baja de 211 KB a 58 KB) y se publican aparte como `@piensa-it/ui-library/fonts.css` más los `.woff2` referenciados. Un consumidor con su propia tipografía deja de pagarlas.
- **Empaquetado** — `verify:package` construye dos consumidores mínimos contra `dist/` y comprueba que importar `Button` no arrastra `@zag-js/date-picker`, `recharts` ni `@tanstack/react-table`, con `DatePicker` como control de que la prueba mide algo.
- **tailwind-preset** — Exporta también `content` con las rutas de los módulos publicados. Tailwind 3 no hereda `content` de un preset, así que hay que extenderlo (`content: [...uiLibraryContent, "./src/**/*.{ts,tsx}"]`), pero ya no hay que escribir la ruta a `node_modules` a mano.

### Changed

- **Dialog y Sheet** — Cambio de comportamiento: la cascada y el foco fuera ya no cierran la capa. Un consumidor que dependiera de ese cierre automático debe cerrarla desde su propio estado.
- **Toast** — Cambio de comportamiento: `success` pasa de 2 s a 4 s y el resto de 5 s a 4 s.
- **DataTable** — `paginator="auto"` sigue siendo el valor por defecto desde 0.2.1.

### Docs

- README: sección «Overlays and third-party layers» con el veto de cascada y foco, y por qué `persistentElements` no sirve para capas que aún no existen (Zag las espera un segundo y rechaza la promesa, con error en consola en cada apertura). El camino para poppers de terceros dentro de un diálogo es vetar en `onInteractOutside` cuando el objetivo está dentro de la capa.
- README: la cascada de dos hojas de Tailwind explicada en «Theming», y el coste medido antes y después en «Installation».
- Stories nuevas: Select (dentro de formulario, opciones con icono), Checkbox y Switch (label externo, solo `aria-label`), Dialog (abre un Sheet y se cierra), Sheet (ancho por variable CSS y `data-*`), Toast (duración), Tabs (clases de lista y pestañas) y Chart (formateadores separados, eje ancho, color por categoría, donut por categoría, sin decimales).


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

[0.3.0]: https://github.com/piensa-it/app-ui/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/piensa-it/app-ui/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/piensa-it/app-ui/releases/tag/v0.2.0
