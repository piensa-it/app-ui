# Backlog

Lo que queda por hacer en `@piensa-it/ui-library`, con su porqué y su evidencia.
Estado a 0.4.2, con MiDivisa y Corelink en producción y TuDivisa por llegar.

**Cómo leer esto.** Los bloques van por urgencia, no por tamaño. Dentro de cada
bloque, lo primero es lo que más daño hace. Cada entrada dice qué se hace, por
qué importa y dónde está la evidencia, para que se pueda discutir sin volver a
investigar. Lo que ya está verificado se marca como tal; lo que es una hipótesis,
también.

Un cambio aquí afecta a tres aplicaciones a la vez. Esa es la razón de que este
documento exista.

---

## Ahora — rompe algo hoy

### 1. `w-control-*` no existe: los botones de icono salen a media anchura (#48)

`tailwind-preset.js` declara `height`, `minWidth` y `minHeight` con la escala de
controles, pero **no `width`**. La clase `w-control-default` nunca se genera, así
que todo botón de icono queda con la anchura de su contenido en vez de sus 40 px.

Verificado compilando el preset: el CSS emite `h-control-default` y
`min-w-control-default`, y de `w-control-default` no sale nada.

Afecta a cuatro sitios, no solo al botón:

| Archivo | Línea |
|---|---|
| `src/lib/recipes/button.ts` | 45 (`size="icon"`) |
| `src/components/ui/pagination.tsx` | 91 y 110 |
| `src/components/ui/data-table.tsx` | 351 |

La corrección es añadir el bloque `width` al preset, con las mismas tres claves.
Conviene acompañarla de una prueba que compile el preset y afirme que las clases
de la escala de controles se generan, porque este fallo es invisible en revisión:
la clase se escribe, simplemente no existe.

**Tamaño:** una tarde corta. Toca API pública (el preset) pero solo añade.

---

## Siguiente — deuda que ya duele

### 2. Un tercio de lo que exportamos no tiene ninguna prueba

De 101 exports, **35 no aparecen en ningún test**, y 15 archivos de componente no
los importa ninguna prueba: `card`, `slider`, `progress`, `accordion`, `tooltip`,
`radio-group`, `avatar`, `file-upload`, `badge`, `separator`, `Layout`,
`GlobalErrorBoundary` y las tres piezas de `marketing/`.

Duele por dos cosas concretas. `GlobalErrorBoundary` es el componente que atrapa
los fallos en producción y nadie lo prueba. Y `confirmAlert`, que es API
imperativa pública, no se llama en ninguna prueba: `alert-dialog.tsx` está al
47 % y solo se ejercita de rebote.

Contradice `CONTRIBUTING.md`, que exige al menos una prueba de humo por
componente. La regla existe; lo que falta es cumplirla y que algo lo verifique.

**Tamaño:** repartible. Una prueba de humo por componente es mecánica; lo valioso
es añadir después el gate que impida que vuelva a pasar (ver 4).

### 3. La cobertura que reportamos no significa nada

El global dice 86,62 %, pero `vite.config.ts` no configura `coverage`, así que
sin `all: true` solo se instrumenta lo que algún test importa. El denominador son
927 sentencias cuando `src/components/**` tiene 6.688 líneas: **los componentes
sin prueba no entran en la cuenta**, que es justo lo que habría que medir.

Además `test:coverage` existe como script pero **no lo corre ningún workflow**, y
no hay umbral mínimo.

Arreglarlo es configurar `coverage.all`, medir de verdad —el número va a bajar
bastante— y fijar un umbral que no se pueda bajar sin querer.

### 4. Nada verifica las reglas que nos dimos

Las dos reglas más repetidas del repo son "todo componente exportado tiene story"
y "tiene prueba". Las dos se incumplen hoy, y nada lo detecta:

- Sin story propia: `Toolbar`, `SidebarBrand`, `SidebarNav`, `PageHeader`,
  `AppVersion`. Los cinco son públicos, y sin story sus props no salen en el
  sitio de documentación.
- Sin prueba: los 35 del punto 2.
- Los 10 avisos de lint no bloquean nada: falta `--max-warnings=0` o una decisión
  explícita de convivir con ellos.

Una comprobación que cruce `src/index.ts` con `src/__tests__/` y con los
`*.stories.tsx` cierra el hueco y vale para siempre.

### 5. Ningún overlay pasa por la prueba de accesibilidad

`accessibility.test.tsx` cubre 9 componentes. Fuera quedan **todos** los overlays:
Dialog, Sheet, Popover, Menu, Tooltip, AlertDialog y Toast. Son precisamente
donde se rompen el foco y los nombres accesibles, y donde ya hemos tenido tres
fallos reales (el `aria-label` de MultiSelect, los aria de Select y DatePicker,
los dos landmarks con el mismo nombre).

Además la regla `color-contrast` está desactivada en esa prueba, delegada a
"Storybook o regresión visual", y **ahí tampoco existe**. Nadie comprueba
contraste en componentes; solo hay una prueba de tokens.

### 6. `Layout` y `AppShell` resuelven lo mismo, y el README enseña el viejo

`Layout` es la solución anterior al problema que `AppShell` resuelve desde 0.3.0.
Los dos siguen exportados, sin `@deprecated` ni nota de migración, y el "Quick
start" del README enseña `Layout`. Un consumidor nuevo llega directo al
componente obsoleto.

Decidir: marcar `Layout` como deprecado con fecha de retirada y actualizar el
README, o justificar por qué conviven.

Lo mismo con los cuatro alias deprecados de `src/lib/recipes/button.ts` (líneas
29, 31, 33 y 43): no tienen versión de retirada anotada, y `DESIGN_SYSTEM.md`
dice mantenerlos "al menos una versión menor". Ya pasaron 0.3.0 y 0.4.0.

---

## Migraciones

El orden importa: cada paso deja el siguiente más barato, y mezclarlos hace
imposible saber qué rompió qué.

### 7. Ola de mantenimiento

Todo lo que ya cae dentro de los rangos declarados: Ark UI 5.39.1, framer-motion
13.2.0, lucide-react 1.40.0, `@internationalized/date` 3.12.4, Storybook 10.6.0 y
los plugins de lint. Un `npm update` y la batería completa.

**Riesgo:** bajo. **Es el arranque natural.**

### 8. React 19

**Es barato, y esa es la conclusión importante.** El repo no usa ninguna de las
APIs que React 19 elimina: cero `propTypes`, cero `defaultProps`, cero
`React.FC`, cero `useRef()` sin argumento, cero `element.ref`, cero
`ReactDOM.render`.

Los 66 `forwardRef` repartidos en 37 archivos funcionan igual en 19; solo quedan
deprecados. Convertirlos es opcional y va aparte, porque cambiaría el tipo
público de casi toda la librería.

Y **ninguna dependencia bloquea**: Ark UI, las tres de Radix, TanStack Table,
Recharts, framer-motion, lucide y Testing Library ya declaran compatibilidad con
19 en las versiones instaladas.

Lo que hay que tocar es pequeño y está localizado: `tooltip.tsx:11` declara
`children: React.ReactElement` sin genérico, y en `@types/react` 19 el genérico
por defecto pasa de `any` a `unknown`; y `field.tsx:75` usa `cloneElement`, cuya
firma es más estricta. Además, dos usos de `React.ElementRef` (`label.tsx:12`,
`separator.tsx:7`) conviene pasarlos a `ComponentRef`.

Sale como **minor**, ampliando `peerDependencies` a `^18.3.1 || ^19.0.0`. Si
soportamos las dos, hay que probar contra las dos: o matriz en CI, o el soporte
es solo nominal.

**Tamaño:** un PR. Hacerlo **antes** de Tailwind 4.

### 9. Herramental de pruebas y lint

ESLint 10, Vitest 5, jsdom 30, `@testing-library/jest-dom` 7, `@types/node` 26.
Verificado que todos los plugins de lint del repo ya admiten ESLint 10, y que
Vitest 5 pide Node ≥22.12, que CI cumple. No toca `dist/`, así que puede ir en
paralelo con React 19.

Aparte y en su propio PR: `vite-plugin-dts` 5, porque es lo único que genera el
`.d.ts` publicado y conviene poder revertirlo solo.

### 10. Tailwind 4 — proyecto, no actualización

**Aquí está el trabajo de verdad, y no por las clases.**

Los renames son acotados y en parte ya neutralizados: el preset sobrescribe las
escalas de sombra y radio con tokens propios, así que esos cambios no nos tocan.
Lo que sí hay que revisar son 42 `outline-none` y los defaults de `ring` y de
color de borde.

El costo real es que **`tailwind-preset.js` es API pública** consumida por tres
aplicaciones, y en v4 el modelo cambia: la forma idiomática es publicar un CSS
con `@theme` en vez de un preset JS, y el `content` que hoy exportamos deja de
existir como concepto. Eso cambia el `exports` del paquete y lo que cada app
escribe en su configuración, así que el release hay que coordinarlo con un PR en
cada una. Es **major** de la librería.

También sube el piso de navegadores a Safari 16.4 y Chrome 111. Es una decisión
de producto, no técnica.

**Antes de comprometerse, un spike que responda dos preguntas:** si `presets`
sigue funcionando con `@config` en v4, y si `tailwindcss-animate` funciona o hay
que pasar a `tw-animate-css`. Ninguna de las dos está confirmada.

### 11. Decidir el desajuste de `tailwind-merge`

`tailwind-merge` 3.6.0 declara soportar Tailwind 4.0 a 4.3, y nosotros corremos
Tailwind 3.4.19. La combinación no está soportada por el propio paquete.

Es coherente con los síntomas que ya vimos en 0.4.1, cuando `cn` descartaba
clases de tamaño. No está probado que sea la causa, pero conviene decidirlo a
propósito: o se documenta como deuda consciente hasta Tailwind 4, o se baja a
`tailwind-merge` 2.6.0, que es la línea para Tailwind 3.

### 12. TypeScript 7 — esperar

TypeScript 7 es estable y mucho más rápido, pero **está bloqueado para nosotros**:
salió sin API programática estable, y por eso `typescript-eslint` todavía declara
`typescript <6.1.0`. Como usamos `typescript-eslint` y `vite-plugin-dts` con
`rollupTypes`, que depende de `api-extractor`, no hay ruta viable hoy.

Revisar cuando salga 7.1. Mientras tanto, 5.9.3 está bien.

---

## Cuando toque

### 13. Componentes que faltan

De la lista de patrones priorizados de `COMPONENT_STATUS.md` ya se construyeron
nueve. Siguen faltando cuatro: **SearchInput**, **TableToolbar**, **NumberInput**
(entrada monetaria) y **Breadcrumb**.

De ellos, el que más falta hace es la entrada monetaria: las tres aplicaciones
son financieras y hoy cada una formatea pesos a mano.

### 14. El botón de icono está escrito tres veces a mano

La misma caja de 40×40 con borde se repite en `pagination.tsx` (líneas 91 y 110,
idénticas) y en `data-table.tsx:351`, ninguna usando la recipe del botón. Los
tres arrastran el fallo del punto 1.

En general, solo 14 de 60 componentes usan las recipes compartidas: todo
`layout/`, `marketing/` y los de datos escriben sus clases a mano.

### 15. Nombres de props inconsistentes entre hermanos

Cuatro controles de selección usan `onChange` (`select`, `multi-select`,
`autocomplete`, `date-picker`) y dos usan `onValueChange` (`slider`,
`radio-group`), sin criterio que los distinga. `CLAUDE.md` fija la regla para
`checked`/`value`, pero no resuelve esta división.

Unificar es breaking; decidirlo y documentarlo, no.

### 16. Nombres de archivo y `Sheet` en `sidebar.tsx`

Seis archivos siguen en PascalCase contra la convención kebab-case, y son
exactamente los mismos seis que no tienen prueba. Y `Sheet` vive dentro de
`sidebar.tsx`, cosa que `COMPONENT_STATUS.md` ya marcaba en julio.

### 17. `framer-motion` la pagan todos y la usan dos archivos

Es dependencia de producción y solo la usan `PublicHeader.tsx` e
`ImageCarouselBackdrop.tsx`, los dos de marketing. Todo el resto del sistema de
movimiento es CSS. Cualquier aplicación que instale la librería carga ese peer
aunque nunca toque marketing.

Con `preserveModules` la poda ya evita el coste de bundle, pero sigue siendo una
dependencia de producción por dos archivos. Valorar moverla a peer opcional.

Lo mismo con los dos linajes de headless: Ark UI para casi todo y Radix para tres
primitivas (`label`, `separator`, `slot`).

### 18. `data-table.tsx` concentra la deuda

604 líneas, cobertura del 77 %, el único aviso de `exhaustive-deps` del repo
(línea 308, un `useMemo` con dependencias de más que puede recalcular sin
motivo) y uno de los dos `any`. Es el componente con más superficie y el que más
usan las tres aplicaciones.

---

## Documentación

### 19. `COMPONENT_STATUS.md` está a más de un mes de la realidad

Es del 22 de julio. No menciona 24 componentes que hoy existen y exporta la
librería, declara faltantes nueve patrones que ya se construyeron, y da 33 de 34
componentes como no terminados. El README lo señala como la fuente de verdad de
madurez, así que hoy engaña a quien llega.

### 20. Otras piezas desactualizadas

- **`AUTOMATION.md`** afirma que hay un workflow de Dependency Review. No existe:
  solo hay `ci.yml`, `publish.yml` y `security.yml`.
- **`README.md`** compara costes de "0.2.1 vs 0.3.0" cuando vamos por 0.4.2, y
  describe el despliegue de la documentación como lo hacía Netlify por Git, que
  se cambió a un job de CI precisamente porque dejó de dispararse.
- **`PUBLIC_RELEASE_CHECKLIST.md`** está superado: el repo ya es público y la
  lista sigue con "publicar 0.1.0" pendiente.
- **`DESIGN.md` y `DESIGN_SYSTEM.md`** son dos documentos de reglas con títulos
  casi iguales y sin referencia cruzada. El README solo enlaza el segundo, así
  que el primero —el más reciente y específico— no está enlazado desde ningún
  índice.
- **`netlify.toml`** conserva Node 20 y el comando de build de Storybook. Si la
  integración por Git reviviera, habría dos despliegues compitiendo con distinto
  Node.

### 21. Issues viejos que confunden

`#27` y `#28` son backlog de scaffolding de agosto, ya resuelto. `#33` (motion
fase 2) está construido salvo dos decisiones sueltas. Cerrarlos o actualizarlos
evita que el tablero mienta.

---

## Automatización que falta

Resumen de los gates ausentes, que en su mayoría ya salen mencionados arriba:

| Gate | Estado |
|---|---|
| Cobertura mínima | No existe. `test:coverage` no lo corre ningún workflow |
| Accesibilidad sobre Storybook | No existe, pese a que el sitio ya se construye en CI |
| `--max-warnings=0` en lint | No existe: los 10 avisos no bloquean |
| Presupuesto de `style.css` y del ESM total | Se imprimen, no se validan |
| Export sin story o sin prueba | No existe, y es la regla más incumplida |
| Sincronía de versión en tres sitios | Manual: `package.json`, `src/version.ts` y `CHANGELOG.md` se cambian a mano. Solo se valida el primero contra el tag |

La regresión visual sí existe, con nueve capturas sobre unos sesenta
componentes.

---

## Lo que no está verificado

Para no confundir lo comprobado con lo supuesto:

- El análisis de React 19 y Tailwind 4 es estático: lectura de código y de las
  dependencias declaradas por cada paquete. **No se instaló ni ejecutó nada** con
  las versiones nuevas, así que los errores de tipos previstos son la superficie
  encontrada leyendo, no un conteo del compilador.
- No se revisaron los repositorios de las aplicaciones consumidoras. El impacto
  de cambiar `tailwind-preset.js` está inferido de cómo lo documentamos, no de
  leer sus configuraciones.
- Que `tailwindcss-animate` funcione con Tailwind 4 no está probado.
- Que el desajuste de `tailwind-merge` esté causando fallos hoy es una hipótesis
  coherente con lo que vimos en 0.4.1, no una reproducción.
