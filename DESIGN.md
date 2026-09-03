# Reglas de diseño

Este documento fija las decisiones que hacen que dos aplicaciones distintas de
Piensa IT se parezcan entre sí sin ponerse de acuerdo. La regla se decide una
vez, aquí, y viaja a los productos como tokens y componentes.

`DESIGN_SYSTEM.md` explica los principios y el gobierno del sistema. Este
documento es más estrecho y más operativo: qué usar, cuándo, y por qué.

> Regla general: si estás eligiendo un gris, un espaciado o un armazón, la
> respuesta ya está en la librería. Si no está, falta aquí, y ese es un motivo
> para abrir un issue, no para resolverlo en la aplicación.

---

## Superficies

### Los tres niveles

Toda la interfaz se apoya en tres planos. Se distinguen por luminosidad, y la
dirección es la misma en tema claro y en oscuro: **cada nivel es más claro que
el anterior**, como si la luz viniera de arriba.

| Nivel | Qué es | Token | Clase |
|---|---|---|---|
| `ground` | La página. Nada se dibuja por debajo. | `--ground` | `bg-ground` |
| `surface` | Paneles, barras, cabeceras de tabla, controles de formulario. | `--surface` | `bg-surface` |
| `raised` | Lo que flota sobre la página: tarjetas, diálogos, menús, popovers, toasts. | `--raised` | `bg-raised` |

Cada nivel trae su borde (`--surface-border`, `--raised-border`) y su sombra
(`shadow-surface`, `shadow-raised`). `ground` no lleva sombra: es el fondo.

### Por qué

Antes `--background` y `--card` eran los dos blanco puro en tema claro. Una
tarjeta sobre la página no se distinguía de la página, la interfaz quedaba
plana, y cada aplicación terminaba inventándose un gris propio para separar las
cosas: tres productos, tres grises distintos, ninguno documentado.

La escala convierte esa decisión en una que ya está tomada. Un componente no
elige un color: elige un nivel.

### Cómo se usa

- El `body` de la aplicación es `ground`. Lo pone la hoja de estilos de la
  librería, no hace falta escribirlo.
- Una tarjeta, un diálogo o un menú son `raised`. Ya lo son: `Card`, `Dialog`,
  `AlertDialog`, `Popover`, `Menu`, `Select`, `Sheet` y `Toast` los toman
  solos.
- Una barra superior, una cabecera de tabla o un panel embebido son `surface`.
- `bg-background` y `bg-card` siguen funcionando como alias de `ground` y
  `raised`. Son compatibilidad, no la forma recomendada.

### Lo que se rompe al mover el fondo

Bajar la página a un gris deja sin contraste a lo que se dibuja **sobre** ella.
Por eso `--muted`, `--secondary`, `--border` y `--input` bajaron con ella. Si
redefines `--ground` en tu producto, revisa esos cuatro: hay una prueba
(`src/__tests__/design-tokens.test.ts`) que comprueba que se distinguen del
fondo, y otra que verifica contraste AA en los pares más usados.

---

## Espaciado

### La escala

Siete pasos, en `rem`, con nombre:

| Token | Valor | |
|---|---|---|
| `--space-2xs` | 0.25rem | 4 px |
| `--space-xs` | 0.5rem | 8 px |
| `--space-sm` | 0.75rem | 12 px |
| `--space-md` | 1rem | 16 px |
| `--space-lg` | 1.5rem | 24 px |
| `--space-xl` | 2rem | 32 px |
| `--space-2xl` | 3rem | 48 px |

Alimentan `p-*`, `m-*`, `gap-*` y `space-y-*`: `gap-sm`, `p-lg`, `space-y-md`.

### Los cuatro roles

Encima de la escala hay cuatro nombres por rol. **Son los que deben usar los
componentes**, porque son los que se pueden cambiar de una vez para toda la
interfaz:

| Rol | Para qué | Valor |
|---|---|---|
| `p-inset` | Relleno interior de un contenedor: tarjeta, diálogo, panel. | 24 px |
| `p-inset-compact` | Lo mismo en pantallas de captura. | 16 px |
| `space-y-stack` | Ritmo vertical entre bloques de primer nivel de una página. | 24 px |
| `gap-field` | Separación entre una etiqueta y su control. | 8 px |

### Ritmo vertical

**24 px entre bloques de primer nivel de una página.** No hace falta escribirlo:
`PageContainer` lo aplica a sus hijos directos. Cada hijo directo es un bloque;
agrupa en un mismo hijo lo que deba ir junto.

### Densidad

La densidad **no es una prop por componente**: se elige para toda la aplicación,
o para una sección, con `<UiProvider density>`. Baja sola a todos los controles
porque todos usan los mismos tokens de altura y relleno.

| Densidad | Cuándo |
|---|---|
| `compact` | Pantallas de **captura**: registro de movimientos, arqueo, conciliación. Donde importa cuántas filas caben a la vez y quien las usa está mirando la pantalla todo el turno. |
| `default` | Todo lo demás. |
| `comfortable` | Pantallas de **consulta** en pantalla grande: tableros, informes, pantallas que se miran un momento y de lejos. |

```tsx
<UiProvider density="compact">
  <RegistroDeMovimientos />
</UiProvider>
```

---

## Formularios

**`Field` es la forma de poner un control en un formulario.** No es una opción
entre varias: es el camino por defecto.

```tsx
<Field label="Monto" description="En pesos colombianos." error={errores.monto}>
  <Input value={monto} onChange={…} />
</Field>
```

`Field` resuelve, para cualquier control: la asociación entre etiqueta y control
(genera el `id` si hace falta), `aria-describedby` hacia la descripción y el
error, `aria-invalid` cuando hay error, el `role="alert"` del mensaje, la marca
de obligatorio y el espaciado. Armar eso a mano en cada pantalla es cómo tres
aplicaciones terminan con tres espaciados y dos de ellas sin `aria-describedby`.

Funciona con `Input`, `Select`, `Textarea`, `DatePicker` y `MultiSelect` sin
ajustes.

- `orientation="horizontal"` para formularios de configuración, donde la
  etiqueta va al lado y la lectura es en columna.
- `variant` (`outline`, `surface`, `subtle`) cuando el campo necesita su propia
  superficie, por ejemplo dentro de una lista de campos editables.
- El error **reemplaza** a la descripción, no se apilan: cuando algo está mal, el
  mensaje que importa es uno.

---

## Armazón de aplicación

Estos componentes existen porque MiDivisa y Corelink los tenían escritos dos
veces, iguales.

| Componente | Qué resuelve |
|---|---|
| `AppShell` | Menú lateral, barra superior y contenido. Plegado con la preferencia recordada por dispositivo, animación de ancho, panel móvil y carácter cromático del menú. |
| `SidebarBrand` | Identidad de la organización, distintivo de entorno y un único menú con lo que se puede cambiar ahí. |
| `PageContainer` | Ancho de lectura, relleno y ritmo vertical, con la entrada escalonada ya puesta. |
| `PageHeader` | Título, descripción y acciones de una pantalla. |
| `SidebarNav`, `SidebarNavItem`, `SidebarNavGroup` | Los enlaces del menú: estado activo, foco, modo plegado y cierre del panel móvil al navegar. |
| `AppVersion` | Versión de la aplicación, de la librería y fecha de compilación. |

### El menú es oscuro en ambos temas

El menú lateral no es una superficie más de la página: es un plano distinto.
Mantenerlo estable evita que la navegación cambie de identidad al alternar claro
y oscuro. Por eso sus tokens (`--sidebar-*`) no se redefinen bajo `.dark`.

Su carácter se elige con `variant`, que escribe un atributo `data-sidebar`:

| Variante | Carácter |
|---|---|
| `graphite` | Gris neutro frío. El predeterminado; no compite con la marca. |
| `ink` | Verde muy oscuro, para marcas de identidad verde. |
| `smoke` | Translúcido con desenfoque; deja ver el fondo. |

Para afinar una variante, redefine los tokens bajo tu propio selector:

```css
[data-sidebar="graphite"] {
  --sidebar: 210 20% 12%;
  --sidebar-active: 210 22% 26%;
}
```

### Un control por fila

En la cabecera del menú va **un solo control**. Es un aprendizaje caro: teníamos
el selector de empresa y un interruptor UAT/PRD diminuto peleando por dos
centímetros, y era fácil activar el interruptor sin querer y no enterarse.

Ahora la fila entera abre un menú, y el entorno son opciones con su marca de
selección y una frase que dice qué hacen ("datos de ensayo, sin efecto real").
Un interruptor no dice qué pasa al activarlo; una opción descrita, sí.

`SidebarBrand` acepta grupos arbitrarios, no solo empresas: sucursal, periodo,
lo que la aplicación necesite cambiar desde ahí.

### El menú conoce su propio estado

Los enlaces necesitan saber si el menú está plegado para dibujarse como iconos.
Ese estado **no se pasa como prop desde la aplicación**: viaja por contexto y se
lee con `useSidebar()`. Si la aplicación tuviera que levantarlo, `AppShell`
dejaría de leer la preferencia guardada al montar y `storageKey` no serviría de
nada.

Por eso `SidebarNavItem` y `SidebarBrand` saben plegarse solos, y al pulsar un
enlace desde el panel móvil el panel se cierra sin que nadie lo conecte.

### La entrada de página viene del contenedor

`PageContainer` escalona la entrada de los bloques de primer nivel. Va activado
por defecto **a propósito**: si cada pantalla tuviera que decidir si se anima,
solo unas pocas lo harían y la aplicación se sentiría irregular.

`Stagger`, que es quien lo implementa, respeta `prefers-reduced-motion` sin
configuración: con esa preferencia activa el contenido aparece de golpe, sin
desplazamiento ni retraso. No hay que hacer nada para que sea accesible, y no se
puede desactivar por descuido.

Una advertencia que cuesta ver: la entrada se dispara **al montar**. Dos rutas
que comparten componente de página no lo remontan —React lo reutiliza— así que
la segunda entraría sin animar, y unas pantallas se sentirían distintas de
otras. Para esos casos, `animateKey`:

```tsx
<PageContainer animateKey={pathname}>
```

---

## Datos y cifras

- **Una columna numérica se declara con `align="right"`**, no con clases. Trae
  las cifras de ancho fijo (`tabular-nums`) incluidas: sin ellas los dígitos
  bailan entre filas y las magnitudes dejan de compararse de un vistazo.
- **Una fila de totales se declara con `footer` en la columna.** Recibe todas
  las filas que quedan tras filtrar, no las de la página visible: un total de
  página no es un total.
- **Una cifra suelta es un `Stat`**, no una tarjeta con un título. `Stat` usa
  `<dl>`/`<dt>`/`<dd>`, porque un encabezado cuyo texto es una cantidad ensucia
  el esquema de la página para quien navega por encabezados.
- En un `Stat` con variación, el sentido se anuncia además de pintarse. Y
  cuando subir es malo —gastos, mora, incidencias— hay que decirlo con
  `goodWhenUp={false}`, o el verde dirá lo contrario de lo que pasa.
- Anota el tipo de la fila (`<Column<Movimiento> field="valor" />`) para que un
  campo mal escrito sea un error de compilación y no una columna vacía.

---

## Composición

| Pieza | Para qué |
|---|---|
| `FormGrid` | Rejilla de campos. Un campo ancho se declara con `span="full"` en el `Field`, sin escribir clases de rejilla. |
| `Toolbar`, `ToolbarSeparator` | Fila de controles con el espaciado del sistema. El separador empuja a la derecha lo que venga después. |
| `StatGroup` | Fila de indicadores. |

Un `Select` dentro de una barra de herramientas necesita `width="auto"`: por
defecto ocupa el ancho disponible, que es lo que quiere un formulario y no una
barra.

---

## Color y contraste

- Ningún componente lleva un color literal. Todo sale de tokens, para que una
  marca cambie su identidad sin tocar el código de la librería.
- `--primary` es identidad configurable. `--destructive`, `--success` y
  `--warning` conservan significado universal: no se derivan de la marca.
- Los pares de texto sobre fondo más usados cumplen **WCAG AA (4.5:1)** en los
  dos temas, y hay una prueba que lo verifica en cada cambio de token.
- Si tu producto redefine tokens, comprueba tus propios pares con las utilidades
  que exporta la librería:

```ts
import { contrastRatio, parseHsl } from "@piensa-it/ui-library";

contrastRatio(parseHsl("0 0% 10%"), parseHsl("0 0% 96%")); // 14.7
```

---

## Iconos

El catálogo de la librería es el set oficial: 167 iconos de Lucide
re-exportados con nombre semántico. Una aplicación **no** debería declarar
`lucide-react` por su cuenta. Ver [`docs/ICONS.md`](docs/ICONS.md) para la tabla
de equivalencias y cómo migrar.

---

## Cómo cambiar estas reglas

Un cambio aquí afecta a tres aplicaciones a la vez. El procedimiento es el
mismo que para el código: un PR que explique el problema, con la prueba que lo
fija y la entrada de migración en `CHANGELOG.md`. Si el cambio mueve un token,
las pruebas de `design-tokens`, `surfaces` y `spacing` deben seguir en verde o
cambiar a propósito, con su porqué en la descripción del PR.
