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
   `AppShell` lo importan 14 archivos distintos es una señal real de que
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
  verificó en CI que su comportamiento sea correcto.
- **Falta story**: el componente se exporta desde `src/index.ts` y tiene
  pruebas, pero no tiene `<componente>.stories.tsx` propio — no aparece en la
  documentación pública. Por la propia regla de este repo
  (`.claude/CLAUDE.md`: "sin story, el componente no aparece en la
  documentación pública — no lo consideres terminado"), esto no es un matiz:
  es incumplimiento del Definition of Done del proyecto, aunque el
  componente tenga pruebas sólidas por detrás.
- **Deprecated** (no usado hoy): se reserva para un componente que se
  mantiene temporalmente con una ruta de reemplazo ya publicada. Ningún
  componente exportado está en este estado ahora mismo.

## Inventario

| Área | Componente | Story | Prueba | Captura visual | En uso (otros archivos) | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| Provider | UiProvider | Sí | Sí (3) | No | 10 | Documentado y probado |
| Primitiva | Button | Sí | Sí (4) | Sí | 13 | Estable |
| Primitiva | Badge | Sí | Sí (1) | No | 5 | Documentado y probado |
| Primitiva | Card | Sí | Sí (3) | No | 6 | Documentado y probado |
| Primitiva | Separator | Sí | Sí (1) | No | 2 | Documentado y probado |
| Primitiva | Icon | Sí | Sí (2) | No | 4 | Documentado y probado |
| Primitiva | Surface | Sí | Sí (1) | Sí | 0 | Estable |
| Primitiva | Motion | Sí | Sí (1) | Sí | 3 | Estable |
| Primitiva | Illustration | Sí | Sí (2) | No | 1 | Documentado y probado |
| Primitiva | AnimatedBanner | Sí | Sí (2) | Sí | 0 | Estable |
| Primitiva | Stagger | Sí | Sí (1) | Sí | 4 | Estable |
| Primitiva | Reveal | Sí | Sí (1) | No | 2 | Documentado y probado |
| Primitiva | AnimatedNumber | Sí | Sí (1) | No | 1 | Documentado y probado |
| Formulario | Input | Sí | Sí (6) | No | 12 | Documentado y probado |
| Formulario | Textarea | Sí | Sí (1) | No | 2 | Documentado y probado |
| Formulario | Label | Sí | Sí (2) | No | 4 | Documentado y probado |
| Formulario | FormGrid | Sí | Sí (2) | No | 5 | Documentado y probado |
| Formulario | Field | Sí | Sí (6) | Sí | 12 | Estable |
| Formulario | Select | Sí | Sí (5) | No | 12 | Documentado y probado |
| Formulario | MultiSelect | Sí | Sí (4) | No | 1 | Documentado y probado |
| Formulario | AutoComplete | Sí | Sí (2) | No | 1 | Documentado y probado |
| Formulario | Checkbox | Sí | Sí (1) | Sí | 5 | Estable |
| Formulario | RadioGroup | Sí | Sí (1) | No | 2 | Documentado y probado |
| Formulario | Switch | Sí | Sí (2) | No | 4 | Documentado y probado |
| Formulario | Slider | Sí | Sí (1) | No | 2 | Documentado y probado |
| Formulario | DatePicker | Sí | Sí (3) | No | 2 | Documentado y probado |
| Formulario | FileUpload | Sí | No | No | 0 | Documentado sin prueba |
| Formulario | InputGroup | Sí | Sí (1) | No | 0 | Documentado y probado |
| Feedback | Alert | Sí | Sí (1) | No | 2 | Documentado y probado |
| Feedback | Skeleton | Sí | Sí (2) | No | 1 | Documentado y probado |
| Feedback | EmptyState | Sí | Sí (1) | No | 2 | Documentado y probado |
| Feedback | Toaster | Sí | Sí (1) | No | 1 | Documentado y probado |
| Feedback | Progress | Sí | No | No | 2 | Documentado sin prueba |
| Overlay | Dialog | Sí | Sí (5) | Sí | 8 | Estable |
| Overlay | AlertDialogHost | Sí | Sí (3) | No | 1 | Documentado y probado |
| Overlay | Sheet | Sí | Sí (3) | Sí | 3 | Estable |
| Overlay | Popover | Sí | Sí (2) | No | 4 | Documentado y probado |
| Overlay | Menu | Sí | Sí (3) | No | 7 | Documentado y probado |
| Overlay | Tooltip | Sí | No | No | 1 | Documentado sin prueba |
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
| Datos | Chart | Sí | Sí (1) | No | 3 | Documentado y probado |
| Datos | Stat | Sí | Sí (1) | No | 3 | Documentado y probado |
| Layout | AppShell | Sí | Sí (10) | Sí | 14 | Estable |
| Layout | SidebarIdentity | Sí | Sí (1) | Sí | 2 | Estable |
| Layout | NotificationsMenu | Sí | Sí (1) | Sí | 2 | Estable |
| Layout | SidebarSearch | Sí | Sí (1) | Sí | 0 | Estable |
| Layout | ScreenSearch | Sí | Sí (1) | Sí | 2 | Estable |
| Layout | SidebarBrand | No | Sí (10) | No | 4 | Falta story |
| Layout | SidebarNav | No | Sí (9) | No | 7 | Falta story |
| Layout | Toolbar | No | Sí (1) | No | 1 | Falta story |
| Layout | PageContainer | Sí | Sí (2) | Sí | 7 | Estable |
| Layout | PageHeader | No | Sí (2) | No | 5 | Falta story |
| Layout | AppVersion | No | Sí (3) | No | 3 | Falta story |
| Layout | UserMenu | Sí | Sí (3) | Sí | 8 | Estable |
| Layout | SettingsPage | Sí | Sí (2) | Sí | 3 | Estable |
| Layout | GlobalErrorBoundary | Sí | No | No | 0 | Documentado sin prueba |
| Marketing | PublicHeader | Sí | No | No | 1 | Documentado sin prueba |
| Marketing | PublicFooter | Sí | No | No | 0 | Documentado sin prueba |
| Marketing | ImageCarouselBackdrop | Sí | No | No | 0 | Documentado sin prueba |

## Reparto

De 68 componentes exportados (no cuenta utilidades, hooks, tokens ni el
catálogo de iconos — ver "Fuera de este inventario"):

- **Estable**: 21
- **Documentado y probado**: 34
- **Documentado sin prueba**: 8
- **Falta story**: 5
- **Deprecated**: 0

Es decir: **31 de 68 (46 %) no llegan al nivel "Estable"** tal como se define
arriba, y 13 de esos 31 (19 % del total) ni siquiera cumplen el Definition of
Done básico del repo (story + prueba de humo). Ninguno está marcado
"Estable" por opinión — los 21 lo están porque las tres señales
independientes coinciden.

## Qué hacer con cada estado antes de consumirlo

- **Estable**: seguro para construir encima. Un cambio que lo rompa
  visualmente falla el Browser Gate antes de llegar a `main`.
- **Documentado y probado**: seguro para el contrato de props (las pruebas lo
  cubren), pero un cambio de estilos o de versión de Ark UI podría alterar su
  apariencia sin que ninguna prueba lo detecte. Antes de depender de su
  apariencia exacta en producción, revísalo en Storybook tras cada bump de
  versión.
- **Documentado sin prueba**: se ve en Storybook, pero nada en CI verifica
  que funcione. Trátalo como si pudiera tener bugs de interacción no
  detectados.
- **Falta story**: no aparece en `ui.piensait.com`. Si lo estás usando, lo
  descubriste leyendo `src/index.ts` o el código, no la documentación
  pública — dile al equipo, porque el proyecto lo considera "no terminado"
  aunque funcione.

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

Menos de un tercio del catálogo (21 de 68) cumple el criterio más estricto.
Eso no es necesariamente un bloqueo para `1.0.0` — "Estable" aquí exige
captura de regresión visual, y el equipo, con razón, no la ha puesto en todo
el catálogo porque es cara de mantener y la reserva para lo que ya causó
regresiones reales (ver los comentarios de `tests/browser/storybook.spec.ts`).
Pero si `1.0.0` promete un contrato estable, esa promesa no puede apoyarse en
"story + prueba" como si fuera el techo: 13 componentes (19 % del catálogo)
no llegan ni a eso, y 5 de ellos (`SidebarBrand`, `SidebarNav`, `Toolbar`,
`PageHeader`, `AppVersion`) llevan pruebas sólidas por dentro pero son
invisibles en la documentación pública — quien los adopte lo hace leyendo
código, no Storybook. Cerrar esos 13 antes de la 1.0.0 es barato (agregar
story o un test de humo, no reescribir el componente); decidir qué hacer con
el otro 46 % que no tiene captura visual es una decisión de producto, no de
documentación, y este inventario no la toma por nadie.
