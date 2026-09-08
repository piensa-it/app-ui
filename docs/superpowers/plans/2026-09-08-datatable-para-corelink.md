# DataTable: las seis capacidades que CoreLink necesita — Plan de implementación

> **Para agentes:** SUB-SKILL OBLIGATORIA: usa `superpowers:subagent-driven-development` (recomendada) o `superpowers:executing-plans` para ejecutar tarea por tarea. Los pasos llevan casilla (`- [ ]`) para ir marcándolos.

**Objetivo:** dar al `DataTable` de `@piensa-it/ui-library` las seis capacidades sin las cuales CoreLink no puede retirar su tabla local, y publicarlas en la 0.10.0.

**Arquitectura:** todo ocurre en `src/components/ui/data-table.tsx`, que ya envuelve TanStack Table. Cinco de las seis son props nuevas con valor por defecto que preserva el comportamiento actual; la sexta amplía lo que se persiste en `localStorage` bajo una clave nueva, dejando la vieja como sólo-lectura para no tirar lo que la gente ya tiene guardado. Ninguna cambia la API existente: la 0.10.0 es aditiva.

**Stack:** React 18/19, TanStack Table (`@tanstack/react-table` en modo `features`), Vitest + Testing Library, Storybook.

**Contexto de por qué:** CoreLink tiene 55 pantallas con una tabla local propia y 544 columnas que traducir. La medición del piloto está en `piensa-it/app-corelink#68`. De esas 55, **17 no pueden migrarse** hasta que existan `onRowClick` y las filas expandibles.

---

## Estructura de archivos

| Archivo | Responsabilidad | Tareas |
|---|---|---|
| `src/components/ui/data-table.tsx` | El componente. Todas las capacidades nuevas. | 1–6 |
| `src/__tests__/data-table.test.tsx` | Pruebas de comportamiento (ya existe, se amplía). | 1–6 |
| `src/components/ui/data-table.stories.tsx` | Historias de Storybook para lo nuevo. | 4, 5 |
| `CHANGELOG.md` | La entrada de la 0.10.0. | 7 |
| `package.json` | El número de versión. | 7 |

Se trabaja en la rama `feat/datatable-para-corelink`, salida de `main`, y se commitea al
final de cada tarea. `app-ui` usa ramas con PR —no como CoreLink, que va directo a
`main`—; la 0.10.0 se publica desde `main` una vez fusionada.

---

## Tarea 1: `getRowId` — identidad estable de fila

Hoy la fila se identifica por el índice que le pone TanStack. CoreLink pasa `rowKey={(c) => c.id}` en 54 pantallas: sin esto, reordenar o filtrar reconcilia mal y el estado interno de una fila (una casilla, un menú abierto) salta a otra.

**Archivos:**
- Modificar: `src/components/ui/data-table.tsx`
- Probar: `src/__tests__/data-table.test.tsx`

- [ ] **Paso 1: escribir la prueba que falla**

Añade al final de `src/__tests__/data-table.test.tsx`, dentro del `describe("DataTable", …)`:

```tsx
  it("usa getRowId para identificar las filas", () => {
    interface Canal { id: string; nombre: string }
    const value: Canal[] = [
      { id: "ch_web", nombre: "Web" },
      { id: "ch_mostrador", nombre: "Mostrador" },
    ];
    const { container } = render(
      <DataTable value={value} getRowId={(c) => c.id}>
        <Column<Canal> field="nombre" header="Nombre" />
      </DataTable>,
    );
    const filas = container.querySelectorAll("tbody tr");
    expect(filas[0].getAttribute("data-row-id")).toBe("ch_web");
    expect(filas[1].getAttribute("data-row-id")).toBe("ch_mostrador");
  });
```

- [ ] **Paso 2: correrla y ver que falla**

```bash
cd /Users/andres.montoya/Documents/source/app-ui
npx vitest run src/__tests__/data-table.test.tsx -t "getRowId"
```

Esperado: FAIL — `expected null to be "ch_web"` (el atributo no existe todavía).

- [ ] **Paso 3: implementarlo**

En `src/components/ui/data-table.tsx`, en `interface DataTableProps`, junto a `onColumnVisibilityChange`:

```tsx
  /**
   * Identidad estable de cada fila. Sin ella TanStack usa el índice, y al
   * reordenar o filtrar el estado interno de una fila salta a otra.
   */
  getRowId?: (row: TValue, index: number) => string;
```

En la desestructuración de props (junto a `onColumnVisibilityChange`):

```tsx
  getRowId,
```

En `useTable({ … })`, junto a `columns: columnDefs`:

```tsx
    getRowId,
```

Y en el `<tr>` del `tbody` (el que hoy sólo lleva `key={row.id}`), añade el atributo.

Va **condicionado a que haya `getRowId`**: sin él, `row.id` es el índice
posicional de TanStack, y un atributo que se llama «row-id» con un número de
fila dentro es una invitación a que alguien escriba `[data-row-id="3"]` y le
funcione hasta el día que se ordena la tabla. Que el atributo exista o no
exista es la señal de si se puede confiar en él.

```tsx
                <tr
                  key={row.id}
                  data-row-id={getRowId ? row.id : undefined}
                  className={cn(
```

- [ ] **Paso 4: correrla y ver que pasa**

```bash
npx vitest run src/__tests__/data-table.test.tsx -t "getRowId"
```

Esperado: PASS.

- [ ] **Paso 5: la suite entera del componente, para no romper nada**

```bash
npx vitest run src/__tests__/data-table.test.tsx src/__tests__/data-table-styles.test.tsx
```

Esperado: todos en verde.

- [ ] **Paso 6: commit**

```bash
cd /Users/andres.montoya/Documents/source/app-ui
git add src/components/ui/data-table.tsx src/__tests__/data-table.test.tsx
git commit -m "feat(data-table): getRowId para identidad estable de fila"
```

---

## Tarea 2: `searchLabel` — el buscador se puede nombrar

Hoy el `aria-label` del buscador está fijo a «Buscar en la tabla». Ocho pantallas de CoreLink lo personalizan y varias pruebas de extremo a extremo localizan el campo por ese nombre.

**Archivos:**
- Modificar: `src/components/ui/data-table.tsx`
- Probar: `src/__tests__/data-table.test.tsx`

- [ ] **Paso 1: escribir la prueba que falla**

```tsx
  it("permite nombrar el buscador y mantiene el nombre por defecto", () => {
    interface Fila { nombre: string }
    const value: Fila[] = [{ nombre: "Ana" }];

    const { unmount } = render(
      <DataTable value={value} searchable searchLabel="Buscar canal por nombre">
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.getByLabelText("Buscar canal por nombre")).toBeInTheDocument();
    unmount();

    render(
      <DataTable value={value} searchable>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.getByLabelText("Buscar en la tabla")).toBeInTheDocument();
  });
```

- [ ] **Paso 2: correrla y ver que falla**

```bash
npx vitest run src/__tests__/data-table.test.tsx -t "nombrar el buscador"
```

Esperado: FAIL — `Unable to find a label with the text of: Buscar canal por nombre`.

- [ ] **Paso 3: implementarlo**

En `interface DataTableProps`, justo debajo de `searchPlaceholder`:

```tsx
  /**
   * Nombre accesible del buscador. Por defecto «Buscar en la tabla»; se
   * cambia cuando la pantalla tiene un nombre mejor —y cuando una prueba lo
   * localiza por él—.
   */
  searchLabel?: string;
```

En la desestructuración, debajo de `searchPlaceholder = "Buscar en la tabla…"`:

```tsx
  searchLabel = "Buscar en la tabla",
```

Y en el `<Input>` del buscador, sustituye la línea `aria-label="Buscar en la tabla"` por:

```tsx
                  aria-label={searchLabel}
```

- [ ] **Paso 4: correrla y ver que pasa**

```bash
npx vitest run src/__tests__/data-table.test.tsx -t "nombrar el buscador"
```

Esperado: PASS.

- [ ] **Paso 5: commit**

```bash
git add src/components/ui/data-table.tsx src/__tests__/data-table.test.tsx
git commit -m "feat(data-table): searchLabel para nombrar el buscador"
```

---

## Tarea 3: `titleAs` — el título vuelve a ser un encabezado

Hoy `title` se pinta en un `<div>`. Las pantallas de CoreLink usan un `<h3>` real, y perderlo deja la página sin estructura para un lector de pantalla. El valor por defecto sigue siendo `"div"` para no cambiar nada de lo ya publicado.

**Archivos:**
- Modificar: `src/components/ui/data-table.tsx`
- Probar: `src/__tests__/data-table.test.tsx`

- [ ] **Paso 1: escribir la prueba que falla**

```tsx
  it("puede pintar el título como encabezado real", () => {
    interface Fila { nombre: string }
    const value: Fila[] = [{ nombre: "Ana" }];

    const { unmount } = render(
      <DataTable value={value} title="Canales registrados" titleAs="h3">
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.getByRole("heading", { name: "Canales registrados", level: 3 })).toBeInTheDocument();
    unmount();

    // Por defecto NO es encabezado: no se cambia lo ya publicado.
    render(
      <DataTable value={value} title="Canales registrados">
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.queryByRole("heading", { name: "Canales registrados" })).toBeNull();
  });
```

- [ ] **Paso 2: correrla y ver que falla**

```bash
npx vitest run src/__tests__/data-table.test.tsx -t "encabezado real"
```

Esperado: FAIL — `Unable to find an accessible element with the role "heading"`.

- [ ] **Paso 3: implementarlo**

En `interface DataTableProps`, debajo de `title`:

```tsx
  /**
   * Etiqueta con la que se pinta `title`. `"div"` por defecto para no
   * inventar estructura donde la pantalla no la pidió; una pantalla que
   * encabeza una sección con la tabla pasa el nivel que le toca.
   */
  titleAs?: "h2" | "h3" | "h4" | "div";
```

En la desestructuración, debajo de `title,`:

```tsx
  titleAs = "div",
```

Antes del `return (`, junto a los demás cálculos:

```tsx
  const TitleTag = titleAs;
```

Y sustituye la línea que pinta el título por:

```tsx
            {title ? <TitleTag className="font-heading text-base font-semibold text-foreground">{title}</TitleTag> : null}
```

- [ ] **Paso 4: correrla y ver que pasa**

```bash
npx vitest run src/__tests__/data-table.test.tsx -t "encabezado real"
```

Esperado: PASS.

- [ ] **Paso 5: commit**

```bash
git add src/components/ui/data-table.tsx src/__tests__/data-table.test.tsx
git commit -m "feat(data-table): titleAs para que el título sea un encabezado"
```

---

## Tarea 4: `onRowClick` — la fila abre el documento

Doce pantallas de CoreLink abren un panel al pulsar la fila. La trampa está en la columna de acciones: pulsar «Eliminar» no puede abrir además el detalle, así que el manejador ignora los clics que nacen dentro de un control.

**Archivos:**
- Modificar: `src/components/ui/data-table.tsx`, `src/components/ui/data-table.stories.tsx`
- Probar: `src/__tests__/data-table.test.tsx`

- [ ] **Paso 1: escribir las pruebas que fallan**

```tsx
  it("onRowClick abre la fila con ratón y con teclado", async () => {
    interface Fila { id: string; nombre: string }
    const value: Fila[] = [{ id: "a", nombre: "Ana" }];
    const abrir = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable value={value} onRowClick={abrir}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );

    await user.click(screen.getByText("Ana"));
    expect(abrir).toHaveBeenCalledWith(value[0]);

    abrir.mockClear();
    const fila = screen.getByText("Ana").closest("tr")!;
    fila.focus();
    await user.keyboard("{Enter}");
    expect(abrir).toHaveBeenCalledWith(value[0]);
  });

  it("onRowClick NO se dispara desde un botón de la fila", async () => {
    interface Fila { id: string; nombre: string }
    const value: Fila[] = [{ id: "a", nombre: "Ana" }];
    const abrir = vi.fn();
    const borrar = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable value={value} onRowClick={abrir}>
        <Column<Fila> field="nombre" header="Nombre" />
        <Column<Fila>
          id="acciones"
          header="Acciones"
          body={() => <button type="button" onClick={borrar}>Eliminar</button>}
        />
      </DataTable>,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(borrar).toHaveBeenCalledTimes(1);
    expect(abrir).not.toHaveBeenCalled();
  });

  it("sin onRowClick la fila no es interactiva", () => {
    interface Fila { nombre: string }
    render(
      <DataTable value={[{ nombre: "Ana" }] as Fila[]}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    const fila = screen.getByText("Ana").closest("tr")!;
    expect(fila).not.toHaveAttribute("tabindex");
  });
```

- [ ] **Paso 2: correrlas y ver que fallan**

```bash
npx vitest run src/__tests__/data-table.test.tsx -t "onRowClick"
```

Esperado: FAIL — `abrir` no se llama (la prop no existe).

- [ ] **Paso 3: implementarlo**

En `interface DataTableProps`, debajo de `getRowId`:

```tsx
  /**
   * Qué hacer al activar una fila. Con ella la fila se vuelve enfocable y
   * responde a Enter y Espacio, no sólo al ratón.
   *
   * Los clics nacidos dentro de un control de la fila —un botón de acciones,
   * un enlace, una casilla— NO la disparan: pulsar «Eliminar» no puede abrir
   * además el detalle.
   */
  onRowClick?: (row: TValue) => void;
```

En la desestructuración, debajo de `getRowId,`:

```tsx
  onRowClick,
```

Antes del `return (`:

```tsx
  /* Un clic que nace en un control es del control, no de la fila.
   *
   * `closest` NO basta: el menú de acciones de fila pinta sus opciones en un
   * `<Portal>`, así que en el DOM cuelgan de `document.body` mientras el
   * evento sintético de React sigue burbujeando hasta el `<tr>`. Pulsar
   * «Eliminar» en el kebab borraba Y abría el detalle. Por eso el guardián
   * estructural va ANTES, en los dos manejadores: lo que no está dentro de la
   * fila no pasó en la fila. Y `label` entra en la lista por DOS mecanismos
   * distintos: `RadioGroupItem` recorta su `<input>` a 1px (`peer sr-only`),
   * así que en producción el clic aterriza siempre en la etiqueta; `Switch` y
   * `Checkbox` hacen lo contrario —`hidden-input.ts` estira el input al 100%
   * para tapar el control— y sólo se escapan bajo Testing Library, que
   * dispara el clic sobre el `<span>` sin calcular superposiciones. */
  const naceEnUnControl = (target: EventTarget | null) =>
    target instanceof globalThis.Element
    && Boolean(target.closest("button, a, input, select, textarea, label, [role='button'], [role='checkbox']"));
```

Y sustituye el `<tr>` del `tbody` por:

```tsx
                <tr
                  key={row.id}
                  data-row-id={getRowId ? row.id : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={
                    onRowClick
                      ? (event) => {
                          if (!event.currentTarget.contains(event.target as Node)) return;
                          if (naceEnUnControl(event.target)) return;
                          onRowClick(row.original);
                        }
                      : undefined
                  }
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key !== "Enter" && event.key !== " ") return;
                          if (!event.currentTarget.contains(event.target as Node)) return;
                          if (naceEnUnControl(event.target)) return;
                          // El Espacio desplaza la página si se le deja.
                          event.preventDefault();
                          onRowClick(row.original);
                        }
                      : undefined
                  }
                  className={cn(
                    "border-b border-border last:border-0 transition-colors duration-fast hover:bg-accent/50",
                    striped && "even:bg-muted/30",
                    onRowClick && "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  )}
                >
```

- [ ] **Paso 4: correrlas y ver que pasan**

```bash
npx vitest run src/__tests__/data-table.test.tsx -t "onRowClick"
npx vitest run src/__tests__/data-table.test.tsx -t "no es interactiva"
```

Esperado: PASS en las tres.

- [ ] **Paso 5: la historia de Storybook**

Añade al final de `src/components/ui/data-table.stories.tsx`:

```tsx
export const FilaPulsable: Story = {
  args: {
    value: MOVIMIENTOS,
    onRowClick: (row: Movimiento) => globalThis.alert(`Abrir ${row.id}`),
  },
  render: (args) => (
    <DataTable {...args} aria-label="Movimientos, fila pulsable">
      <Column<Movimiento> field="id" header="Consecutivo" sortable />
      <Column<Movimiento> field="concepto" header="Concepto" sortable />
      <Column<Movimiento>
        id="acciones"
        header="Acciones"
        align="right"
        body={() => <Button size="sm" variant="ghost">Editar</Button>}
      />
    </DataTable>
  ),
};
```

> Si los nombres `MOVIMIENTOS`, `Movimiento`, `Story` o `Button` no coinciden con los que ya usa el archivo, usa los suyos: la historia sólo tiene que enseñar una tabla con `onRowClick` y una columna de acciones.

- [ ] **Paso 6: la suite y el tipado**

```bash
npx vitest run src/__tests__/data-table.test.tsx && npm run typecheck && npm run lint
```

Esperado: verde, sin errores.

- [ ] **Paso 7: commit**

```bash
git add src/components/ui/data-table.tsx src/__tests__/data-table.test.tsx src/components/ui/data-table.stories.tsx
git commit -m "feat(data-table): onRowClick, con teclado y sin robarle el clic a los botones"
```

---

## Tarea 5: `renderExpanded` — el detalle bajo la fila

Cinco pantallas de CoreLink despliegan un detalle en línea. Se pinta como un `<tr>` extra que ocupa todas las columnas, con un botón de apertura en una columna propia al principio.

**Archivos:**
- Modificar: `src/components/ui/data-table.tsx`, `src/components/ui/data-table.stories.tsx`
- Probar: `src/__tests__/data-table.test.tsx`

- [ ] **Paso 1: escribir las pruebas que fallan**

```tsx
  it("renderExpanded despliega y repliega el detalle de una fila", async () => {
    interface Fila { id: string; nombre: string }
    const value: Fila[] = [
      { id: "a", nombre: "Ana" },
      { id: "b", nombre: "Luis" },
    ];
    const user = userEvent.setup();

    render(
      <DataTable value={value} getRowId={(f) => f.id} renderExpanded={(f) => <p>Detalle de {f.nombre}</p>}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );

    // Cerrado de entrada.
    expect(screen.queryByText("Detalle de Ana")).toBeNull();

    const abrir = screen.getAllByRole("button", { name: /desplegar/i })[0];
    await user.click(abrir);
    expect(screen.getByText("Detalle de Ana")).toBeInTheDocument();
    // Sólo la que se abrió.
    expect(screen.queryByText("Detalle de Luis")).toBeNull();

    await user.click(screen.getByRole("button", { name: /replegar/i }));
    expect(screen.queryByText("Detalle de Ana")).toBeNull();
  });

  it("sin renderExpanded no aparece la columna de despliegue", () => {
    interface Fila { nombre: string }
    render(
      <DataTable value={[{ nombre: "Ana" }] as Fila[]}>
        <Column<Fila> field="nombre" header="Nombre" />
      </DataTable>,
    );
    expect(screen.queryByRole("button", { name: /desplegar/i })).toBeNull();
  });
```

- [ ] **Paso 2: correrlas y ver que fallan**

```bash
npx vitest run src/__tests__/data-table.test.tsx -t "renderExpanded"
```

Esperado: FAIL — no hay ningún botón «Desplegar».

- [ ] **Paso 3: implementarlo**

En `interface DataTableProps`, debajo de `onRowClick`:

```tsx
  /**
   * Detalle en línea bajo la fila. Cuando se pasa, la tabla añade al
   * principio una columna estrecha con el botón que lo abre y lo cierra.
   *
   * Se despliega una fila cada vez: dos detalles abiertos a la vez convierten
   * la tabla en una lista y se pierde la comparación entre filas, que es para
   * lo que existe una tabla.
   */
  renderExpanded?: (row: TValue) => React.ReactNode;
```

En la desestructuración, debajo de `onRowClick,`:

```tsx
  renderExpanded,
```

Junto a los demás `useState` del componente:

```tsx
  const [filaAbierta, setFilaAbierta] = React.useState<string | null>(null);
```

Añade el import del icono en la cabecera del archivo (junto a `ArrowUpDown, ArrowUp, …`):

```tsx
import { ChevronDown, ChevronRight } from "lucide-react";
```

> Si el archivo ya importa de `lucide-react`, añade los dos nombres a esa línea en vez de crear otra.

En el `<thead>`, antes del `map` de encabezados, añade la celda vacía de la columna de despliegue:

```tsx
                {renderExpanded ? <th className="w-10" aria-hidden="true" /> : null}
```

En el `<tbody>`, sustituye el `map` de filas para que cada fila pueda ir acompañada de su detalle. El `<tr>` de datos se mantiene tal cual quedó en la Tarea 4; lo que cambia es que ahora se devuelve un fragmento con dos filas y una celda más al principio:

```tsx
              table.getRowModel().rows.map((row) => {
                const abierta = filaAbierta === row.id;
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      data-row-id={getRowId ? row.id : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      onClick={
                        onRowClick
                          ? (event) => {
                              if (!event.currentTarget.contains(event.target as Node)) return;
                              if (naceEnUnControl(event.target)) return;
                              onRowClick(row.original);
                            }
                          : undefined
                      }
                      onKeyDown={
                        onRowClick
                          ? (event) => {
                              if (event.key !== "Enter" && event.key !== " ") return;
                              if (!event.currentTarget.contains(event.target as Node)) return;
                              if (naceEnUnControl(event.target)) return;
                              event.preventDefault();
                              onRowClick(row.original);
                            }
                          : undefined
                      }
                      className={cn(
                        "border-b border-border last:border-0 transition-colors duration-fast hover:bg-accent/50",
                        striped && "even:bg-muted/30",
                        onRowClick && "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                      )}
                    >
                      {renderExpanded ? (
                        <td className={cellPadding}>
                          <button
                            type="button"
                            aria-expanded={abierta}
                            aria-label={abierta ? "Replegar el detalle" : "Desplegar el detalle"}
                            className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                            onClick={() => setFilaAbierta(abierta ? null : row.id)}
                          >
                            {abierta ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </button>
                        </td>
                      ) : null}
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={cn(
                            cellPadding,
                            (cell.column.columnDef.meta as { className?: string } | undefined)?.className,
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {renderExpanded && abierta ? (
                      <tr className="border-b border-border bg-muted/20">
                        <td colSpan={table.getVisibleLeafColumns().length + 1} className={cellPadding}>
                          {renderExpanded(row.original)}
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })
```

Quedan dos sitios donde el número de columnas ya no cuadra. En la fila de «no hay datos»:

```tsx
                <td colSpan={table.getVisibleLeafColumns().length + (renderExpanded ? 1 : 0)} className="px-4 py-8 text-center text-muted-foreground">
```

Y en el `<tfoot>`, antes del `map` de columnas:

```tsx
                {renderExpanded ? <td className={cellPadding} /> : null}
```

- [ ] **Paso 4: correrlas y ver que pasan**

```bash
npx vitest run src/__tests__/data-table.test.tsx -t "renderExpanded"
npx vitest run src/__tests__/data-table.test.tsx -t "columna de despliegue"
```

Esperado: PASS en las dos.

- [ ] **Paso 5: la historia de Storybook**

```tsx
export const ConDetalle: Story = {
  args: { value: MOVIMIENTOS },
  render: (args) => (
    <DataTable
      {...args}
      aria-label="Movimientos con detalle"
      renderExpanded={(row: Movimiento) => (
        <div className="text-sm text-muted-foreground">
          Centro de costo: {row.centro} · Estado: {row.estado}
        </div>
      )}
    >
      <Column<Movimiento> field="id" header="Consecutivo" sortable />
      <Column<Movimiento> field="concepto" header="Concepto" sortable />
    </DataTable>
  ),
};
```

> Igual que antes: si los campos de `Movimiento` en ese archivo no se llaman `centro` y `estado`, usa los que existan.

- [ ] **Paso 6: la suite entera, el tipado y el lint**

```bash
npx vitest run && npm run typecheck && npm run lint
```

Esperado: todo verde. Si `data-table-styles.test.tsx` falla por el número de `<td>`, ajusta ese test: la columna de despliegue sólo existe cuando hay `renderExpanded`.

- [ ] **Paso 7: commit**

```bash
git add src/components/ui/data-table.tsx src/__tests__/ src/components/ui/data-table.stories.tsx
git commit -m "feat(data-table): renderExpanded, el detalle en línea bajo la fila"
```

---

## Tarea 6: persistir también el tamaño de página y el orden

Hoy `preferencesKey` guarda **sólo** qué columnas se ven. La tabla local de CoreLink guarda cuatro cosas, y dos de ellas —cuántas filas por página y por qué columna se ordena— son las que la gente nota si desaparecen.

Se guarda todo junto bajo una clave nueva (`ui-table:<key>:prefs`) y se sigue **leyendo** la vieja (`ui-table:<key>:columns`) cuando la nueva no existe, para que nadie pierda lo que ya tenía.

**Archivos:**
- Modificar: `src/components/ui/data-table.tsx`
- Probar: `src/__tests__/data-table.test.tsx`

- [ ] **Paso 1: escribir las pruebas que fallan**

```tsx
  it("recuerda tamaño de página y orden, y lee la clave antigua de columnas", async () => {
    interface Fila { nombre: string }
    const value: Fila[] = Array.from({ length: 30 }, (_, i) => ({ nombre: `Fila ${i}` }));

    // Lo que dejó una versión anterior: sólo columnas.
    window.localStorage.clear();
    window.localStorage.setItem("ui-table:demo:columns", JSON.stringify({ nombre: true }));

    const { unmount } = render(
      <DataTable value={value} rows={10} preferencesKey="demo">
        <Column<Fila> field="nombre" header="Nombre" sortable />
      </DataTable>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /ordenar por nombre/i }));

    await waitFor(() => {
      const guardado = window.localStorage.getItem("ui-table:demo:prefs");
      expect(guardado).not.toBeNull();
      expect(JSON.parse(guardado!).sort).toEqual([{ id: "nombre", desc: false }]);
    });
    unmount();

    // Al volver, el orden sigue puesto.
    render(
      <DataTable value={value} rows={10} preferencesKey="demo">
        <Column<Fila> field="nombre" header="Nombre" sortable />
      </DataTable>,
    );
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /ordenar por nombre/i })).toHaveAttribute("aria-label");
    });
    expect(JSON.parse(window.localStorage.getItem("ui-table:demo:prefs")!).sort).toEqual([
      { id: "nombre", desc: false },
    ]);
  });
```

- [ ] **Paso 2: correrla y ver que falla**

```bash
npx vitest run src/__tests__/data-table.test.tsx -t "recuerda tamaño de página"
```

Esperado: FAIL — `ui-table:demo:prefs` es `null`.

- [ ] **Paso 3: implementarlo**

Sustituye el bloque de `columnVisibility` (el `useState` con `localStorage` y su `useEffect`) por lo siguiente. Va **antes** de los `useState` de `sorting` y `pagination`, así que mueve también esas dos declaraciones si hace falta:

```tsx
  /**
   * Lo que se recuerda de una tabla entre visitas.
   *
   * Antes se guardaba sólo la visibilidad de columnas, en
   * `ui-table:<key>:columns`. Esa clave se sigue LEYENDO cuando no existe la
   * nueva: quien ya tenía columnas escondidas no las recupera visibles de
   * golpe. No se escribe nunca más.
   */
  interface PrefsTabla {
    columns?: ColumnVisibilityState;
    pageSize?: number;
    sort?: SortingState;
  }

  const leerPrefs = React.useCallback((): PrefsTabla => {
    if (!preferencesKey || typeof window === "undefined") return {};
    try {
      const nuevas = window.localStorage.getItem(`ui-table:${preferencesKey}:prefs`);
      if (nuevas) return JSON.parse(nuevas) as PrefsTabla;
      const viejas = window.localStorage.getItem(`ui-table:${preferencesKey}:columns`);
      return viejas ? { columns: JSON.parse(viejas) as ColumnVisibilityState } : {};
    } catch {
      return {};
    }
  }, [preferencesKey]);

  const [prefsIniciales] = React.useState(leerPrefs);

  const [sorting, setSorting] = React.useState<SortingState>(prefsIniciales.sort ?? []);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: prefsIniciales.pageSize ?? rows,
  });
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>(() => ({
    ...defaultVisibility,
    ...(prefsIniciales.columns ?? {}),
  }));

  React.useEffect(() => {
    if (!preferencesKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        `ui-table:${preferencesKey}:prefs`,
        JSON.stringify({ columns: columnVisibility, pageSize: pagination.pageSize, sort: sorting }),
      );
    } catch {
      // La tabla sigue funcionando cuando el navegador bloquea almacenamiento.
    }
  }, [columnVisibility, pagination.pageSize, sorting, preferencesKey]);
```

Borra los `useState` de `sorting` y `pagination` que había antes, y el `useEffect` que escribía `…:columns`, para no dejarlos duplicados.

- [ ] **Paso 4: correrla y ver que pasa**

```bash
npx vitest run src/__tests__/data-table.test.tsx -t "recuerda tamaño de página"
```

Esperado: PASS.

- [ ] **Paso 5: la suite entera**

```bash
npx vitest run && npm run typecheck && npm run lint
```

Esperado: verde. Ojo con las pruebas existentes de columnas: si alguna escribía `ui-table:<key>:columns` a mano, ahora tiene que leer `…:prefs`.

- [ ] **Paso 6: commit**

```bash
git add src/components/ui/data-table.tsx src/__tests__/data-table.test.tsx
git commit -m "feat(data-table): recordar tamaño de página y orden, leyendo la clave antigua"
```

---

## Tarea 7: `accessor` — la columna que se ordena por lo que muestra

**Esta tarea no estaba en el plan original, y su ausencia lo invalidaba.** La
revisión final midió el `DataTable` local de CoreLink: de sus **501 accessors,
320 son lecturas de propiedad** que mapean a `field` sin más, pero **207 son
calculados** y no tienen ningún campo que nombrar. Sin esta capacidad, el 41%
de las columnas pierde ordenación y búsqueda al migrar, y las pantallas que las
tienen se quedarían con la tabla local — que es exactamente lo que este plan
existe para evitar.

Las formas reales, contadas en el repositorio: 78 con `??` (`r.created_at ?? ""`),
19 booleanos como número (`p.is_active ? 1 : 0`), 16 `.length`, 14 búsquedas en
mapas de etiquetas (`ETIQUETA_CANAL[p.canal]` — la gente ordena por la etiqueta
en español, no por el enum), 5 concatenaciones, y el resto lecturas anidadas,
aritmética derivada y búsquedas cruzadas.

TanStack ya lo soporta: es `accessorFn`. Aquí sólo hay que exponerlo.

**Archivos:**
- Modificar: `src/components/ui/data-table.tsx`
- Probar: `src/__tests__/data-table.test.tsx`

- [ ] **Paso 1: la prueba que falla**

Una columna sin `field`, con `accessor`, tiene que poder ordenarse Y encontrarse
por el buscador con el valor que el accessor devuelve, no con el que hay en la
fila.

```tsx
  it("una columna con accessor se ordena y se busca por el valor calculado", async () => {
    interface Doc { id: string; estado: "draft" | "sent" }
    const ETIQUETA = { draft: "Borrador", sent: "Enviado" } as const;
    const value: Doc[] = [
      { id: "1", estado: "sent" },
      { id: "2", estado: "draft" },
    ];
    const user = userEvent.setup();

    render(
      <DataTable value={value} searchable>
        <Column<Doc> id="estado" header="Estado" sortable
          accessor={(d) => ETIQUETA[d.estado]}
          body={(d) => <span>{ETIQUETA[d.estado]}</span>} />
      </DataTable>,
    );

    // Se ordena por «Borrador»/«Enviado», no por «draft»/«sent».
    await user.click(screen.getByRole("button", { name: /ordenar por estado/i }));
    const celdas = () => screen.getAllByRole("cell").map((c) => c.textContent);
    expect(celdas()).toEqual(["Borrador", "Enviado"]);

    // Y se busca por lo mismo.
    await user.type(screen.getByLabelText("Buscar en la tabla"), "Envi");
    expect(celdas()).toEqual(["Enviado"]);
  });
```

- [ ] **Paso 2: correrla y ver que falla**

```bash
npx vitest run src/__tests__/data-table.test.tsx -t "accessor"
```

Esperado: FAIL — hoy una columna sin `field` no es ordenable ni buscable, así
que no hay ni botón de ordenar.

- [ ] **Paso 3: el tipo**

`ColumnProps` es hoy una unión de dos variantes: de campo (`field`) o de
presentación (`id` + `body`). Se añade una tercera: **calculada** — `id`,
`accessor`, y `body` opcional (sin `body` se pinta lo que devuelva el
accessor). En `ColumnBase`, documentado:

```tsx
  /**
   * De dónde sale el valor por el que se ordena y se busca, cuando no es un
   * campo de la fila: una etiqueta traducida, dos campos concatenados, una
   * longitud, un booleano como número.
   *
   * Es lo que hace ordenable una columna que no tiene `field`. Ordenar por
   * `estado` cuando en la fila pone `"sent"` y en pantalla «Enviado» ordena
   * por la palabra que el usuario ve, que es la que espera.
   */
  accessor?: (row: TValue) => unknown;
```

- [ ] **Paso 4: la construcción de la columna**

En `columnDefs`, sustituir la línea de `accessorKey` y la de `enableSorting`:

```tsx
      // `accessor` gana a `field`: si la pantalla se molestó en calcular un
      // valor, es ése el que se ordena y se busca.
      ...(spec.props.accessor
        ? { accessorFn: (row: TValue) => spec.props.accessor!(row) }
        : spec.props.field
          ? { accessorKey: spec.props.field }
          : {}),
      enableSorting: Boolean(spec.props.field || spec.props.accessor) && (spec.props.sortable ?? false),
```

- [ ] **Paso 5: correrla y ver que pasa**, y la suite entera

```bash
npx vitest run && npm run typecheck && npm run lint
```

- [ ] **Paso 6: una historia de Storybook** con una columna calculada, reusando
      los datos que ya haya en el archivo.

- [ ] **Paso 7: commit**

```bash
git add src/components/ui/data-table.tsx src/__tests__/data-table.test.tsx src/components/ui/data-table.stories.tsx
git commit -m "feat(data-table): accessor, para ordenar y buscar por el valor calculado"
```

---

## Tarea 8: publicar la 0.10.0

**Archivos:**
- Modificar: `package.json`, `CHANGELOG.md`

- [ ] **Paso 1: la verificación completa antes de tocar la versión**

```bash
cd /Users/andres.montoya/Documents/source/app-ui
npx vitest run && npm run typecheck && npm run lint && npm run verify:package
```

Esperado: todo en verde. Si `verify:package` se queja, arréglalo **antes** de seguir: publicar un paquete que no resuelve sus propios tipos deja a CoreLink sin poder instalarlo.

- [ ] **Paso 2: subir la versión**

```bash
npm version 0.10.0 --no-git-tag-version
```

- [ ] **Paso 3: la entrada del CHANGELOG**

Añade al principio de `CHANGELOG.md`, bajo el encabezado del archivo:

```markdown
## 0.10.0

Seis capacidades del `DataTable`, todas aditivas: nada de lo que ya usaba la
0.9.0 cambia de comportamiento.

Salen de medir qué le faltaba al componente para que CoreLink pudiera retirar
su tabla local (piensa-it/app-corelink#68): de sus 55 pantallas, 17 no podían
migrarse sin las dos primeras de esta lista.

- **`onRowClick`**: la fila abre el documento. Enfocable, responde a Enter y
  Espacio, y NO se dispara cuando el clic nace en un botón o un enlace de la
  propia fila.
- **`renderExpanded`**: detalle en línea bajo la fila, con su columna de
  despliegue. Una fila abierta cada vez.
- **`getRowId`**: identidad estable de fila. Sin ella el estado interno de una
  fila salta a otra al reordenar o filtrar.
- **`searchLabel`**: nombre accesible del buscador, que estaba fijo a «Buscar
  en la tabla».
- **`titleAs`**: `title` puede pintarse como `h2`/`h3`/`h4` en vez de un
  `div`. Por defecto sigue siendo `div`.
- **`preferencesKey` recuerda más**: además de las columnas visibles, ahora el
  tamaño de página y el orden, bajo `ui-table:<key>:prefs`. La clave anterior
  (`ui-table:<key>:columns`) se sigue leyendo cuando la nueva no existe, así
  que nadie pierde lo que tenía.
```

- [ ] **Paso 4: commit y empujar**

```bash
git add package.json CHANGELOG.md
git commit -m "chore: 0.10.0 — las seis capacidades del DataTable que CoreLink necesita"
git push origin main
```

- [ ] **Paso 5: crear el Release**

El bump fusionado **no publica nada por sí solo**: hay que crear el Release en GitHub sobre `main`.

```bash
gh release create v0.10.0 --title "0.10.0" --notes "Seis capacidades del DataTable: onRowClick, renderExpanded, getRowId, searchLabel, titleAs y preferencias ampliadas. Ver CHANGELOG.md."
```

> Si el clasificador de permisos bloquea `gh release create` en este repositorio, créalo desde la web. Para probarlo en CoreLink **sin** Release: `npm pack ../app-ui --pack-destination <scratchpad>` y `npm install <tgz> --no-save` desde app-corelink; el `dist` local tiene que ser más nuevo que el último commit.

- [ ] **Paso 6: comprobar que se publicó**

```bash
npm view @piensa-it/ui-library@0.10.0 version
```

Esperado: `0.10.0`.

---

## Autorrevisión

**Cobertura:** las seis casillas de la lista de `app-corelink#68` tienen tarea — `onRowClick` (4), filas expandibles (5), `getRowId` (1), `searchLabel` (2), persistencia ampliada (6), `title` como encabezado (3). La séptima tarea publica.

**Sin marcadores:** cada paso lleva el código o el comando exacto. Las dos historias de Storybook llevan una nota porque dependen de nombres del archivo que este plan no fija; el resto es literal.

**Consistencia de tipos:** `getRowId(row, index)`, `onRowClick(row)` y `renderExpanded(row)` reciben `TValue` (la fila original, no la de TanStack) en la interfaz y en el uso. `PrefsTabla` usa `ColumnVisibilityState` y `SortingState`, los dos ya importados en el archivo.

**Lo que este plan NO hace, a propósito:** migrar las 55 pantallas de CoreLink. Eso es un segundo plan en `app-corelink`, que sólo puede empezar cuando la 0.10.0 esté instalada. Incluye traducir 544 columnas, migrar las claves `core.table.*` a `ui-table:*`, y arreglar `e2e/helpers.ts#openColumnPicker`, que hoy busca un botón llamado «Columnas» y en la librería se llama «Configurar columnas».
