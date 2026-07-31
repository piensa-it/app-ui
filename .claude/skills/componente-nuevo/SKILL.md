---
name: componente-nuevo
description: Guía para agregar un componente nuevo a @piensa-it/ui-library, o para terminar uno que quedó a medias. Cubre el orden correcto — verificar la anatomía real de Ark UI antes de tematizar, reutilizar las recipes compartidas en vez de reescribir clases, nombrar las props como el componente hermano, y cerrar con story, test y export. Úsala siempre que se vaya a crear, portar o completar un componente de esta librería, incluso si el pedido suena trivial ("agrega un Rating", "falta un Breadcrumb", "necesito un Sheet", "portemos el X de PrimeReact"), y también cuando alguien pregunte por qué un componente nuevo se ve distinto al resto o no aparece en Storybook.
---

# Componente nuevo

Esta librería la consumen varios repos de la compañía. Un componente que se ve
bien en aislamiento pero usa un hex propio, nombra sus props distinto a su
hermano, o no aparece en Storybook, genera deuda que se paga en todos esos repos
a la vez. El orden de abajo existe para que eso no pase — no es burocracia, cada
paso previene un error que ya ocurrió antes en este repo.

## 0. Antes de escribir código: ¿qué tipo de componente es?

Tres caminos distintos, y elegir mal cuesta reescrituras:

- **Primitiva simple** (Badge, Card, Separator, Skeleton): Tailwind puro, sin
  dependencias. Un `forwardRef` + `cn()` y listo.
- **Componente con comportamiento** (Select, Popover, Tabs, Slider): usa Ark UI.
  Nunca escribas a mano el manejo de teclado, foco o posicionamiento — Ark ya lo
  resolvió y su versión es la accesible. Verifica primero que exista:
  `ls node_modules/@ark-ui/react/dist/components/`
- **Componente de datos** (tabla, gráfica): Ark no los cubre. `DataTable` va
  sobre TanStack Table y `Chart` sobre Recharts. Si necesitas algo de esta
  familia, extiende esos dos antes de meter una librería nueva.

Si ninguno encaja, dilo antes de improvisar: agregar una dependencia a esta
librería la agrega a todos los consumidores.

## 1. Verificar la anatomía real de Ark UI (solo componentes Ark)

Este es el paso que más bugs previene. Cada componente de Ark expone sus propios
atributos `data-*`, y **no son consistentes entre componentes** — Tabs marca la
selección con `data-selected`, Select con `data-state="checked"`. Adivinar el
nombre fue la causa de varios bugs visuales durante la migración desde
PrimeReact: el tema compilaba, pasaba los tests, y simplemente no se veía.

```bash
# Qué partes existen y qué props recibe cada una
cat node_modules/@ark-ui/react/dist/components/<componente>/<componente>.d.ts

# Qué atributos se renderizan de verdad en el DOM
grep -rho "data-[a-z-]*" node_modules/@zag-js/<componente>/dist/*.js | sort -u
```

Escribe el tema contra lo que salga de ahí, no contra lo que recuerdes de otro
componente.

## 2. Reutilizar antes de escribir clases

Casi todo el vocabulario visual ya está en [src/lib/recipes/](../../../src/lib/recipes/).
Revísalo antes de escribir una sola clase de Tailwind:

| Necesitas | Usa |
|---|---|
| Anillo de foco en botón/trigger | `focusRingOutside` |
| Anillo de foco en campo de texto | `focusRingInside` |
| Transición y estado disabled | `interactiveTransition`, `disabledStyles` |
| Base visual de un campo o trigger de selección | `fieldControlVariants` |
| Panel flotante (dropdown, calendario, popover) | `floatingPanelStyles` |
| Opción dentro de una lista | `optionStyles` |
| Botón de ícono | `iconButtonStyles` |
| Animación de overlay | `popoverAnimation`, `dialogContentAnimation`, `drawerContentAnimation()` de [style-helpers.ts](../../../src/lib/style-helpers.ts) |

Si el componente tiene variantes o tamaños, crea una recipe `cva` en
`src/lib/recipes/<componente>.ts` y expórtala desde el `index.ts` de esa carpeta,
igual que [button.ts](../../../src/lib/recipes/button.ts). Que las variantes
vivan fuera del componente es lo que permite auditarlas después.

**Alinéate con la matriz canónica** en vez de inventar nombres:

- Variantes semánticas: `solid`, `subtle`, `surface`, `outline`, `plain`
  (más `destructive` y `link` donde tengan sentido).
- Tamaños: `sm`, `md`, `lg` — con `xs` solo si de verdad hace falta.
- Alturas: siempre los tokens `h-control-compact | h-control-default |
  h-control-comfortable`, nunca un `h-10` suelto. Eso es lo que mantiene
  alineados un Button y un Input puestos lado a lado.
- `defaultVariants` explícito. Sin él, el consumidor recibe un componente sin
  estilo cuando omite la prop.

## 3. Nombrar las props

La regla no es estética, responde a una pregunta: **¿el valor es un sí/no, o es
una selección entre opciones?**

- **Binario** (Checkbox, Switch) → `checked` / `onCheckedChange`. Paridad con el
  `<input type="checkbox">` nativo.
- **Selección** (RadioGroup, Slider, Select, MultiSelect, DatePicker,
  AutoComplete) → `value` / `onChange` u `onValueChange`, según el shape del
  evento que Ark exponga para ese componente.

Antes de inventar un nombre, abre el componente hermano más parecido y cópialo.
No "normalices" Checkbox/Switch a `value` — sería un breaking change para todos
los consumidores sin beneficio real.

Además, toda primitiva:
- usa `forwardRef` y pasa el `ref` al elemento real;
- acepta `className` y lo combina con `cn()` **al final**, para que el consumidor
  pueda sobreescribir;
- extiende los props HTML del elemento que renderiza
  (`React.ButtonHTMLAttributes<HTMLButtonElement>`);
- define `displayName`.

## 4. Colores y estados

Cero hex, cero `rgb()`, cero `bg-[#...]`. Todo color sale de una clase mapeada a
CSS variables en [globals.css](../../../src/styles/globals.css) — así una app
cambia de marca sin tocar la librería. Si te falta un color, probablemente el
token ya existe con otro nombre (`--surface`, `--subtle`, `--muted`, `--accent`);
inventar un token nuevo es una decisión de diseño, coméntala en vez de asumirla.

Un control interactivo no está terminado hasta que resuelve los cinco estados:
`hover`, `active`, `disabled`, `focus-visible` y — si es un campo —
`aria-invalid`. Y todos deben verse bien en claro **y** oscuro.

Si animas algo, incluye el escape de `motion-reduce:` como hacen los helpers de
overlay. Es una preferencia de accesibilidad del sistema operativo, no un extra.

## 5. Story

Sin story el componente no existe en la documentación pública, y no lo
consideramos terminado. Va junto al componente, como
`<componente>.stories.tsx`:

```tsx
const meta = {
  title: "UI/<Componente>",          // categoría real: UI, Layout, Marketing…
  component: Componente,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Una línea sobre para qué sirve." } },
  },
} satisfies Meta<typeof Componente>;
```

Cubre por lo menos: el caso por defecto, todas las variantes, todos los tamaños,
y los estados relevantes (disabled, error, cargando, vacío). Para un componente
controlado, envuelve el estado en un `Demo` interno como hace
[switch.stories.tsx](../../../src/components/ui/switch.stories.tsx) — un story sin
estado se ve congelado y no comunica nada.

## 6. Test de humo

Uno mínimo en `src/__tests__/<componente>.test.tsx`: que renderice, que responda
a la interacción principal, y que exponga el rol accesible correcto. Si es un
control de formulario o entra en un patrón de UX ya cubierto, agrégalo también a
[accessibility.test.tsx](../../../src/__tests__/accessibility.test.tsx) o
[patterns.test.tsx](../../../src/__tests__/patterns.test.tsx) en vez de duplicar
la infraestructura.

## 7. Export público

Agrégalo a [src/index.ts](../../../src/index.ts) en la sección que le
corresponda, exportando el componente, **su tipo de props**, y la recipe `cva` si
tiene una — así:

```ts
export { Button, buttonVariants, type ButtonProps } from "./components/ui/button";
```

Sin el tipo exportado, el consumidor no puede escribir un wrapper tipado. Los
consumidores importan solo desde la raíz del paquete, nunca de rutas internas.

## 8. Cerrar

```bash
npm run test:run
npm run lint
npm run build          # confirma que los .d.ts se generan
```

Y revisa el componente en `npm run storybook`, en claro y en oscuro. Los tests no
detectan contraste ni alineación — para eso están los ojos.

## Checklist final

- [ ] Anatomía de Ark verificada contra `@zag-js` (no adivinada)
- [ ] Recipes compartidas reutilizadas; variantes en `src/lib/recipes/`
- [ ] Nombres de variantes/tamaños alineados con la matriz canónica
- [ ] Alturas con tokens `control-*`
- [ ] Props nombradas como el hermano; `forwardRef`, `className`, `displayName`
- [ ] Cero colores hardcodeados
- [ ] Cinco estados resueltos, en claro y oscuro
- [ ] `motion-reduce` si hay animación
- [ ] Story con `autodocs`, variantes, tamaños y estados
- [ ] Test de humo
- [ ] Exportado en `src/index.ts` con su tipo
- [ ] `test:run`, `lint` y `build` en verde
