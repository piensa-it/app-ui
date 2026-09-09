# Estado del catálogo de componentes

Este inventario responde una sola pregunta por cada componente exportado por
`@piensa-it/ui-library`: **¿puedo construir sobre esto sin que me cambie
debajo?** No sustituye los issues ni es una promesa de API congelada — la
librería sigue en `0.x` — pero le dice a quien la consume qué tan verificado
está cada componente hoy, con evidencia que cualquiera puede reproducir.

Este documento se desactualiza solo con el tiempo: regenéralo (o al menos
recuenta las columnas) antes de cada release que toque componentes, y
obligatoriamente antes de `1.0.0`.

## Método

Cada fila se midió, no se opinó, contra el estado real del repositorio en la
rama `main` al momento de escribir esto. Cuatro señales, todas
reproducibles:

1. **Story** — ¿existe `<componente>.stories.tsx` junto al componente? Sin
   story el componente no aparece en `ui.piensait.com`: no cuenta como
   documentado, sin importar cuánto código tenga detrás. Comando:
   `find src -name "*.stories.tsx"`.
2. **Prueba** — ¿algún archivo en `src/__tests__/` importa o referencia el
   nombre exportado del componente? Se cuenta cuántos (un número más alto no
   es "mejor calidad" per se, pero sí más superficie cubierta: props,
   variantes, casos límite). Comando: `grep -rl -w "<Componente>" src/__tests__`.
   Desde `npm run verify:contract` (#153, en el `quality-gate` de CI) estas
   dos primeras señales ya no dependen de que alguien las mida a mano: el
   script falla el build si algún export de valor de `src/index.ts` no tiene
   prueba, o si algún componente no tiene story propia. Por eso este
   inventario ya no puede encontrar un "Falta story" ni un "Documentado sin
   prueba" — no es que nadie los haya mirado, es que una puerta de CI impide
   que existan.
3. **Captura de regresión visual** — ¿alguna prueba en
   `tests/browser/storybook.spec.ts` navega a una story de este componente y
   la compara contra una captura de referencia (`*-linux.png`, la que mira
   CI)? Esta es la señal más fuerte: significa que un cambio visual
   accidental rompe el build antes de llegar a `main`, no que "se ve bien
   hoy". La mayoría de componentes no la tiene — la captura visual es cara de
   mantener y el equipo la reserva para lo que ya ha causado regresiones
   reales (ver los comentarios en ese archivo).
4. **En uso** — cuántos otros archivos de `src/` (fuera de la propia
   implementación, su story y su prueba) importan el componente por su
   nombre. Es información de contexto, no un criterio que decida el estado:
   un componente hoja (`Surface`, `AnimatedBanner`, `PivotTable`,
   `SidebarSearch`, `PublicFooter`...) puede tener cero reutilización interna
   y ser perfectamente sano — nadie más en la librería necesita componerlo. Se
   deja en la tabla para que quien lea note el patrón (por ejemplo, que
   `AppShell` lo importan 10 archivos distintos es una señal real de que
   cualquier cambio ahí es de alto impacto), pero no mueve el estado por sí
   solo.

## Estados

Los estados salen mecánicamente de combinar story y prueba (la captura visual
distingue el nivel más alto). No hay una categoría "a ojo": si un componente
no tiene prueba, dice "sin prueba", así de feo se vea.

- **Estable**: tiene story, tiene al menos una prueba, y aparece en las
  capturas de regresión visual de `tests/browser/storybook.spec.ts`. Las tres
  señales están triaguladas: documentado, con comportamiento verificado en
  CI, y con su apariencia vigilada contra cambios accidentales.
- **Documentado y probado**: tiene story y al menos una prueba, pero ningún
  test de `tests/browser/` lo cubre. Es el caso normal: funciona y está
  documentado, pero un cambio de CSS o de anatomía de Ark UI no lo frenaría
  solo — hace falta revisión manual o Storybook local.
- **Documentado sin prueba**: tiene story (aparece en `ui.piensait.com`) pero
  ningún archivo en `src/__tests__/` lo ejercita. Se puede ver y usar, nadie
  verificó en CI que su comportamiento sea correcto. **Estado imposible desde
  #153**: `verify:contract` no deja pasar un export de valor sin prueba, así
  que ningún componente exportado puede caer aquí — se deja documentado por
  si el gate se relaja alguna vez, no porque haya filas en este estado hoy.
- **Falta story**: el componente se exporta desde `src/index.ts` y tiene
  pruebas, pero no tiene `<componente>.stories.tsx` propio — no aparece en la
  documentación pública. Por la propia regla de este repo
  (`.claude/CLAUDE.md`: "sin story, el componente no aparece en la
  documentación pública — no lo consideres terminado"), esto no es un matiz:
  es incumplimiento del Definition of Done del proyecto, aunque el
  componente tenga pruebas sólidas por detrás. **Estado imposible desde
  #153**: `verify:contract` no deja pasar un componente sin story propia, por
  la misma razón que el estado anterior.
- **Deprecated** (no usado hoy): se reserva para un componente que se
  mantiene temporalmente con una ruta de reemplazo ya publicada. Ningún
  componente exportado está en este estado ahora mismo.

## Inventario

| Área | Componente | Story | Prueba | Captura visual | En uso (otros archivos) | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| Provider | UiProvider | Sí | Sí (3) | No | 8 | Documentado y probado |
| Primitiva | Button | Sí | Sí (5) | Sí | 12 | Estable |
| Primitiva | Badge | Sí | Sí (1) | No | 5 | Documentado y probado |
| Primitiva | Card | Sí | Sí (3) | No | 5 | Documentado y probado |
| Primitiva | Separator | Sí | Sí (1) | No | 2 | Documentado y probado |
| Primitiva | Icon | Sí | Sí (2) | No | 4 | Documentado y probado |
| Primitiva | Surface | Sí | Sí (1) | Sí | 0 | Estable |
| Primitiva | Motion | Sí | Sí (1) | Sí | 3 | Estable |
| Primitiva | Illustration | Sí | Sí (2) | No | 1 | Documentado y probado |
| Primitiva | AnimatedBanner | Sí | Sí (2) | Sí | 0 | Estable |
| Primitiva | Stagger | Sí | Sí (1) | Sí | 3 | Estable |
| Primitiva | Reveal | Sí | Sí (1) | No | 1 | Documentado y probado |
| Primitiva | AnimatedNumber | Sí | Sí (1) | No | 1 | Documentado y probado |
| Formulario | Input | Sí | Sí (7) | No | 11 | Documentado y probado |
| Formulario | Textarea | Sí | Sí (2) | No | 2 | Documentado y probado |
| Formulario | Label | Sí | Sí (2) | No | 4 | Documentado y probado |
| Formulario | FormGrid | Sí | Sí (2) | No | 5 | Documentado y probado |
| Formulario | Field | Sí | Sí (6) | Sí | 11 | Estable |
| Formulario | Select | Sí | Sí (5) | No | 12 | Documentado y probado |
| Formulario | MultiSelect | Sí | Sí (4) | No | 1 | Documentado y probado |
| Formulario | AutoComplete | Sí | Sí (2) | No | 1 | Documentado y probado |
| Formulario | Checkbox | Sí | Sí (1) | Sí | 5 | Estable |
| Formulario | RadioGroup | Sí | Sí (1) | No | 2 | Documentado y probado |
| Formulario | Switch | Sí | Sí (2) | No | 4 | Documentado y probado |
| Formulario | Slider | Sí | Sí (1) | No | 2 | Documentado y probado |
| Formulario | DatePicker | Sí | Sí (3) | No | 2 | Documentado y probado |
| Formulario | FileUpload | Sí | Sí (1) | No | 0 | Documentado y probado |
| Formulario | InputGroup | Sí | Sí (2) | No | 0 | Documentado y probado |
| Feedback | Alert | Sí | Sí (2) | No | 1 | Documentado y probado |
| Feedback | Skeleton | Sí | Sí (2) | No | 0 | Documentado y probado |
| Feedback | EmptyState | Sí | Sí (1) | No | 1 | Documentado y probado |
| Feedback | Toaster | Sí | Sí (1) | No | 1 | Documentado y probado |
| Feedback | Progress | Sí | Sí (1) | No | 1 | Documentado y probado |
| Overlay | Dialog | Sí | Sí (5) | Sí | 8 | Estable |
| Overlay | AlertDialogHost | Sí | Sí (3) | No | 1 | Documentado y probado |
| Overlay | Sheet | Sí | Sí (3) | Sí | 3 | Estable |
| Overlay | Popover | Sí | Sí (2) | No | 4 | Documentado y probado |
| Overlay | Menu | Sí | Sí (3) | No | 7 | Documentado y probado |
| Overlay | Tooltip | Sí | Sí (1) | No | 1 | Documentado y probado |
| Navegación | Tabs | Sí | Sí (1) | No | 3 | Documentado y probado |
| Navegación | Accordion | Sí | Sí (1) | No | 1 | Documentado y probado |
| Navegación | AppSwitcher | Sí | Sí (2) | Sí | 3 | Estable |
| Datos | Avatar | Sí | Sí (1) | No | 3 | Documentado y probado |
| Datos | AvatarPicker | Sí | Sí (3) | Sí | 3 | Estable |
| Datos | AppearanceSettings | Sí | Sí (1) | Sí | 2 | Estable |
| Datos | ProfileForm | Sí | Sí (2) | No | 2 | Documentado y probado |
| Datos | DataTable | Sí | Sí (5) | Sí | 10 | Estable |
| Datos | Pagination | Sí | Sí (1) | No | 1 | Documentado y probado |
| Datos | PivotTable | Sí | Sí (1) | No | 0 | Documentado y probado |
| Datos | Chart | Sí | Sí (1) | No | 2 | Documentado y probado |
| Datos | Stat | Sí | Sí (1) | No | 3 | Documentado y probado |
| Layout | AppShell | Sí | Sí (11) | Sí | 10 | Estable |
| Layout | SidebarIdentity | Sí | Sí (1) | Sí | 2 | Estable |
| Layout | NotificationsMenu | Sí | Sí (1) | Sí | 2 | Estable |
| Layout | SidebarSearch | Sí | Sí (1) | Sí | 0 | Estable |
| Layout | ScreenSearch | Sí | Sí (1) | Sí | 2 | Estable |
| Layout | SidebarBrand | Sí | Sí (10) | No | 4 | Documentado y probado |
| Layout | SidebarNav | Sí | Sí (9) | No | 5 | Documentado y probado |
| Layout | Toolbar | Sí | Sí (1) | No | 1 | Documentado y probado |
| Layout | PageContainer | Sí | Sí (2) | Sí | 7 | Estable |
| Layout | PageHeader | Sí | Sí (2) | No | 5 | Documentado y probado |
| Layout | AppVersion | Sí | Sí (3) | No | 3 | Documentado y probado |
| Layout | UserMenu | Sí | Sí (3) | Sí | 8 | Estable |
| Layout | SettingsPage | Sí | Sí (2) | Sí | 3 | Estable |
| Layout | GlobalErrorBoundary | Sí | Sí (1) | No | 0 | Documentado y probado |
| Marketing | PublicHeader | Sí | Sí (2) | No | 1 | Documentado y probado |
| Marketing | PublicFooter | Sí | Sí (1) | No | 0 | Documentado y probado |
| Marketing | ImageCarouselBackdrop | Sí | Sí (1) | No | 0 | Documentado y probado |

## Reparto

De 68 componentes exportados (no cuenta utilidades, hooks, tokens ni el
catálogo de iconos — ver "Fuera de este inventario"):

- **Estable**: 21
- **Documentado y probado**: 47
- **Documentado sin prueba**: 0 (estado imposible desde #153, ver "Estados")
- **Falta story**: 0 (estado imposible desde #153, ver "Estados")
- **Deprecated**: 0

Es decir: **47 de 68 (69 %) no llegan al nivel "Estable"** tal como se define
arriba, pero los 68 cumplen el Definition of Done básico del repo (story +
prueba de humo) — eso ya no es una medición, es una garantía: `verify:contract`
corre en el `quality-gate` de CI y bloquea el merge de cualquier PR que baje
alguna de las dos señales. Ninguno está marcado "Estable" por opinión — los 21
lo están porque las tres señales independientes coinciden.

Esto es un cambio real desde la medición anterior de este documento (369dc42,
previa a #153): los 13 componentes que entonces estaban "Falta story" o
"Documentado sin prueba" (`SidebarBrand`, `SidebarNav`, `Toolbar`,
`PageHeader`, `AppVersion`, `FileUpload`, `Progress`, `Tooltip`,
`GlobalErrorBoundary`, `PublicHeader`, `PublicFooter`,
`ImageCarouselBackdrop`) ya tienen ambas señales y pasaron a "Documentado y
probado". Ninguno subió a "Estable" — eso exige además la captura de
regresión visual, que #153 no tocó.

## Qué hacer con cada estado antes de consumirlo

- **Estable**: seguro para construir encima. Un cambio que lo rompa
  visualmente falla el Browser Gate antes de llegar a `main`.
- **Documentado y probado**: seguro para el contrato de props (las pruebas lo
  cubren, y `verify:contract` garantiza que siempre las tendrá), pero un
  cambio de estilos o de versión de Ark UI podría alterar su apariencia sin
  que ninguna prueba lo detecte. Antes de depender de su apariencia exacta en
  producción, revísalo en Storybook tras cada bump de versión.
- **Documentado sin prueba** / **Falta story**: no deberían aparecer nunca en
  la tabla de arriba — si alguna vez ves una fila en uno de estos dos
  estados, `verify:contract` está roto o se saltó en CI; repórtalo antes de
  confiar en el resto del inventario.

## Fuera de este inventario

- **Catálogo de iconos** (`export * from "./icons"`, `src/icons.ts`): son
  más de 200 reexports curados de `lucide-react` con un alias semántico
  (`AlertCircle as AlertCircleIcon`). No son componentes con contrato propio
  — no tiene sentido darles una fila individual con story/prueba/estado. Se
  documentan como galería en Storybook (`icon.stories.tsx`) y tienen una
  prueba de catálogo (`src/__tests__/icons.test.ts`) que verifica que cada
  export resuelve a un componente válido.
- **Utilidades, hooks y tokens** (`cn`, `buildTree`, `normalizeSearch`,
  `useSidebar`, `initialsFrom`, `createPalette`, `paletteDeclarations`,
  `THEMABLE_TOKENS`, `iconConfig`, `contrastRatio`, `relativeLuminance`,
  `parseHsl`, `buttonVariants`/`badgeVariants`/`inputVariants`/`textareaVariants`/`alertVariants`,
  `DEFAULT_AVATAR_COLORS`, `BUNDLED_PALETTES`, `FONT_PRESETS`, `BUNDLED_LOOKS`,
  `UI_LIBRARY_VERSION`, `UI_LIBRARY_RELEASES`, `confirmAlert`, `toast`,
  `Column`): son funciones, constantes o el helper imperativo de un
  componente ya listado (`toast` de `Toaster`, `confirmAlert` de
  `AlertDialogHost`, `Column` de `DataTable`). No tienen story porque no son
  UI renderizable de forma independiente; su cobertura se mide por prueba
  unitaria, no por los criterios de este documento. Ver `DESIGN.md` para las
  reglas de tokens.

## Lectura honesta antes de `1.0.0`

Menos de un tercio del catálogo (21 de 68, 31 %) cumple el criterio más
estricto. Eso no es necesariamente un bloqueo para `1.0.0` — "Estable" aquí
exige captura de regresión visual, y el equipo, con razón, no la ha puesto en
todo el catálogo porque es cara de mantener y la reserva para lo que ya causó
regresiones reales (ver los comentarios de `tests/browser/storybook.spec.ts`).
No maquillamos ese número: publicar la 1.0.0 con dos tercios del catálogo sin
captura visual es una decisión de producto que hay que tomar con los ojos
abiertos, no algo que este documento pueda resolver por nadie.

Lo que sí cambió, y es lo que hace defendible publicar: el otro piso — story
y prueba de humo, el Definition of Done básico del repo — ya no es una
medición que pueda desactualizarse ni una promesa que dependa de que alguien
se acuerde de escribir el test. Antes de #153 había 13 componentes (19 % del
catálogo) que ni siquiera llegaban ahí; hoy `verify:contract` lo garantiza en
CI para los 68, así que ese piso no puede volver a agrietarse sin que el
build falle primero. Eso es lo que una 1.0.0 puede prometer sin mentir: no
que todo esté verificado visualmente (no lo está, y decirlo sería la mentira
que este documento existe para evitar), sino que nada exportado carece de
documentación pública ni de una prueba que lo ejercite — y que esa garantía
es estructural, no un estado de ánimo del equipo en la fecha de este commit.
