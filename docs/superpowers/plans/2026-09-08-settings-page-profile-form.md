# SettingsPage y ProfileForm — Plan de implementación (HU #124)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar a `@piensa-it/ui-library` el destino estándar de «Mi perfil» y «Configuración» —un armazón `SettingsPage` y la sección de datos personales `ProfileForm`— para que las aplicaciones consumidoras lo hereden en vez de reimplementarlo.

**Architecture:** `SettingsPage` compone `PageHeader` + el `Tabs` que ya existe + un pie de guardado por sección + un aviso de cambios sin guardar sobre `confirmAlert`. No conoce router, sesión ni fetch: `section`/`onSectionChange` son opcionales y cada sección declara su propio `onSave`. `ProfileForm` es un formulario controlado que compone `AvatarPicker`, `FormGrid`, `Field` e `Input`. La sección «Apariencia» no estrena componente: es el `AppearanceSettings` existente, y lo único que aporta el armazón es un catálogo de identificadores conocidos (`account`, `appearance`, `security`, `notifications`) que fija rótulo e icono.

**Tech Stack:** React 19 + TypeScript 5.9, Tailwind CSS 4, Ark UI (vía el `Tabs` propio), Vitest 4 + Testing Library, Storybook 10, Playwright para las capturas.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/components/layout/settings-page.tsx` **(crear)** | El armazón: tipos `SettingsSection`/`SettingsPageProps`/`SettingsPageLabels`, catálogo de identificadores conocidos, cabecera, pestañas, pie por sección y guardia de cambios |
| `src/components/ui/profile-form.tsx` **(crear)** | La sección «Cuenta»: avatar + nombre, correo, teléfono y cargo, con hueco para campos propios |
| `src/__tests__/settings-page.test.tsx` **(crear)** | Pruebas del armazón |
| `src/__tests__/profile-form.test.tsx` **(crear)** | Pruebas del formulario |
| `src/components/layout/settings-page.stories.tsx` **(crear)** | Stories `Layout/SettingsPage` |
| `src/components/ui/profile-form.stories.tsx` **(crear)** | Stories `Formularios/ProfileForm` |
| `src/index.ts` **(modificar)** | Exports públicos de ambas piezas y sus tipos |
| `tests/browser/storybook.spec.ts` **(modificar)** | Captura comparada de la story principal |
| `CHANGELOG.md` **(modificar)** | Entrada de la versión sin publicar |

**Rama:** este trabajo sale de `main`, no de `feat/identity-dialog` (que tiene cambios sin commitear ajenos a esta HU).

- [ ] **Paso 0: Crear la rama desde `main`**

```bash
cd /Users/andres.montoya/Documents/source/app-ui
# Este plan vive sin seguir en `docs/superpowers/`: se guarda aparte para que
# el stash de la rama anterior no se lo lleve.
mv docs/superpowers /tmp/plan-124
git stash push -u -m "wip identity-dialog"   # solo si `git status --short` no está limpio
git switch main && git pull --ff-only
git switch -c feat/settings-page
mkdir -p docs && mv /tmp/plan-124 docs/superpowers
git add docs/superpowers && git commit -m "docs: plan de implementación de SettingsPage y ProfileForm

Refs #124"
```

Comprobar: `git status --short` no imprime nada y `git branch --show-current` imprime `feat/settings-page`.

---

## Task 1: El armazón — catálogo, cabecera y pestañas

**Files:**
- Create: `src/components/layout/settings-page.tsx`
- Test: `src/__tests__/settings-page.test.tsx`

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `src/__tests__/settings-page.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UiProvider } from "../components/providers/UiProvider";
import { SettingsPage, type SettingsSection } from "../components/layout/settings-page";

const user = userEvent.setup();

const montar = (props: Partial<React.ComponentProps<typeof SettingsPage>> = {}) => {
  const secciones: SettingsSection[] = props.sections ?? [
    { id: "account", content: <p>Datos de la cuenta</p> },
    { id: "appearance", content: <p>Tema y color</p> },
  ];
  render(
    <UiProvider>
      <SettingsPage title="Mi perfil" {...props} sections={secciones} />
    </UiProvider>,
  );
};

/**
 * `UserMenu` (#97) fijó las entradas «Mi perfil» y «Configuración»; el destino
 * lo escribía cada aplicación a mano y volvía a desviarse (#124). Lo que se
 * comprueba aquí es el armazón: cabecera, orden de las secciones y quién manda
 * sobre la pestaña activa.
 */
describe("SettingsPage · cabecera y pestañas", () => {
  it("pinta el título como encabezado de la pantalla", () => {
    montar({ description: "Tus datos y cómo se ve la aplicación." });
    expect(screen.getByRole("heading", { level: 1, name: "Mi perfil" })).toBeInTheDocument();
    expect(screen.getByText("Tus datos y cómo se ve la aplicación.")).toBeInTheDocument();
  });

  it("una pestaña por sección, en el orden recibido", () => {
    montar();
    expect(screen.getAllByRole("tab").map((t) => t.textContent?.trim())).toEqual(["Cuenta", "Apariencia"]);
  });

  it("un identificador conocido sin rótulo toma el del catálogo", () => {
    montar({ sections: [{ id: "security", content: <p>Contraseña</p> }, { id: "notifications", content: <p>Avisos</p> }] });
    expect(screen.getAllByRole("tab").map((t) => t.textContent?.trim())).toEqual(["Seguridad", "Notificaciones"]);
  });

  it("un identificador propio se rotula con su `label`", () => {
    montar({ sections: [{ id: "facturacion", label: "Facturación", content: <p>Plan</p> }] });
    expect(screen.getByRole("tab", { name: "Facturación" })).toBeInTheDocument();
  });

  it("sin `section`, abre la primera", () => {
    montar();
    expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Datos de la cuenta")).toBeVisible();
  });

  it("sin `section`, la pestaña la lleva el armazón", async () => {
    montar();
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    expect(await screen.findByText("Tema y color")).toBeVisible();
  });

  it("con `section`, manda la aplicación: el clic avisa pero no cambia solo", async () => {
    const onSectionChange = vi.fn();
    montar({ section: "appearance", onSectionChange });
    expect(screen.getByRole("tab", { name: "Apariencia" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: "Cuenta" }));
    expect(onSectionChange).toHaveBeenCalledWith("account");
    expect(screen.getByRole("tab", { name: "Apariencia" })).toHaveAttribute("aria-selected", "true");
  });

  it("las acciones de la cabecera van con el título", () => {
    montar({ actions: <button type="button">Ver como otro</button> });
    expect(screen.getByRole("button", { name: "Ver como otro" })).toBeInTheDocument();
  });

  it("una sección deshabilitada no se puede abrir", () => {
    montar({ sections: [{ id: "account", content: <p>A</p> }, { id: "appearance", content: <p>B</p>, disabled: true }] });
    expect(screen.getByRole("tab", { name: "Apariencia" })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Correr las pruebas y ver que fallan**

Ejecutar: `npm run test:run -- src/__tests__/settings-page.test.tsx`
Esperado: FAIL — `Failed to resolve import "../components/layout/settings-page"`.

- [ ] **Step 3: Escribir la implementación mínima**

Crear `src/components/layout/settings-page.tsx`. El borrador de abajo se quedó
corto: dos rondas de revisión de calidad encontraron bugs de conducta
—pestaña activa huérfana cuando `sections` cambia por debajo, sección
deshabilitada abierta al montar, repliegue mudo en modo controlado, estado
interno obsoleto resucitando una pestaña ya ausente, `className`/`id`/`data-*`
que el consumidor no podía pasar—. Este es el código que quedó en disco tras
resolverlos, no el primer borrador; tómalo como punto de partida real:

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { PageHeader } from "./page-header";
import { BellIcon, PaletteIcon, ShieldIcon, UserIcon } from "@/icons";

/**
 * El catálogo de secciones conocidas: lo que hace que «Cuenta» se llame igual,
 * lleve el mismo icono y esté en el mismo sitio en las tres aplicaciones. Fijar
 * estos cuatro identificadores es justo el objetivo de la HU. Una sección
 * propia trae su `label` y, si quiere, su `icon`.
 */
const KNOWN_SECTIONS = {
  account: { label: "Cuenta", icon: UserIcon },
  appearance: { label: "Apariencia", icon: PaletteIcon },
  security: { label: "Seguridad", icon: ShieldIcon },
  notifications: { label: "Notificaciones", icon: BellIcon },
} satisfies Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }>;

type KnownSection = (typeof KNOWN_SECTIONS)[keyof typeof KNOWN_SECTIONS];

/** Sentinel que no coincide con ningún `id` real: fuerza a `Tabs` a quedarse
 * sin pestaña seleccionada en vez de caer en su propio modo no controlado
 * (que elegiría la primera pestaña de la lista, deshabilitada o no). */
const NONE = "__settings-page-none__";

/** Una sección de la pantalla: una pestaña y lo que hay debajo. */
export interface SettingsSection {
  /**
   * `account`, `appearance`, `security` o `notifications` —de ellos salen el
   * rótulo y el icono, con autocompletado— o uno propio, que entonces
   * necesita `label`.
   */
  id: keyof typeof KNOWN_SECTIONS | (string & {});
  label?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface SettingsPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Acciones de la pantalla, a la derecha del título. */
  actions?: React.ReactNode;
  sections: SettingsSection[];
  /** Sección abierta. Sin ella, el armazón la lleva solo. */
  section?: string;
  onSectionChange?: (id: string) => void;
}

/**
 * El destino estándar de «Mi perfil» y «Configuración» (#124): cabecera,
 * secciones en pestañas y el guardado de cada una siempre en el mismo sitio.
 *
 * `UserMenu` (#97) ya fijaba las entradas; lo que había al otro lado lo
 * escribía cada aplicación a su manera. Este armazón fija el sitio y el orden,
 * no el contenido: la sección de apariencia es el `AppearanceSettings` que ya
 * existe, la de cuenta es `ProfileForm`, y seguridad o notificaciones las pone
 * la aplicación —su contenido es negocio puro—.
 *
 * Va dentro del `PageContainer` de la aplicación, como cualquier otra pantalla.
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <SettingsPage title="Mi perfil" sections={[
 *     { id: "account", content: <ProfileForm value={p} onChange={setP} /> },
 *     { id: "security", content: <CambioDeClave /> },
 *   ]} />
 * </PageContainer>
 * ```
 */
export const SettingsPage = React.forwardRef<HTMLDivElement, SettingsPageProps>(
  ({ title, description, actions, sections, section, onSectionChange, className, ...props }, ref) => {
    // La primera sección habilitada. Si no hay ninguna —todas deshabilitadas,
    // o la lista está vacía— no hay nada que abrir: no se cae en
    // `sections[0]` a costa de abrir una deshabilitada.
    const first = sections.find((item) => !item.disabled)?.id;
    const [internal, setInternal] = React.useState(first);
    const candidate = section ?? internal;
    // La sección candidata puede haber desaparecido de `sections` (carga
    // diferida, permisos) o haber quedado deshabilitada: en cualquiera de los
    // dos casos no puede seguir activa y se cae en la primera habilitada.
    const active = sections.some((item) => item.id === candidate && !item.disabled) ? candidate : first;

    const change = (next: string) => {
      // Con `section`, la pestaña la lleva la aplicación: aquí solo se avisa.
      if (section === undefined) setInternal(next);
      onSectionChange?.(next);
    };

    // Cuando `active` se aleja de `candidate` (repliegue por una `sections`
    // que cambió por debajo), hay que reconciliar quien manda: en modo
    // propio, el estado interno —si no, la pestaña reaparecida saltaría sola
    // de vuelta a donde ya no puede estar—; en modo controlado, avisar a la
    // aplicación con `onSectionChange`, porque si no, se queda creyendo que
    // sigue mostrando una `section` que el armazón ya abandonó en silencio.
    React.useEffect(() => {
      if (active === undefined || active === candidate) return;
      if (section === undefined) {
        setInternal(active);
      } else {
        onSectionChange?.(active);
      }
    }, [active, candidate, section, onSectionChange]);

    return (
      <div ref={ref} className={cn("flex flex-col gap-ui-lg", className)} {...props}>
        <PageHeader title={title} description={description} actions={actions} />
        <Tabs value={active ?? NONE} onValueChange={change}>
          {sections.map((item) => {
            const known: KnownSection | undefined = Object.prototype.hasOwnProperty.call(KNOWN_SECTIONS, item.id)
              ? KNOWN_SECTIONS[item.id as keyof typeof KNOWN_SECTIONS]
              : undefined;
            const Icon = item.icon ?? known?.icon;
            // Una sección propia sin rótulo cae en su identificador: es feo,
            // pero se ve, y es mejor que una pestaña en blanco.
            const label = item.label ?? known?.label ?? item.id;
            return (
              <TabPanel
                key={item.id}
                value={item.id}
                disabled={item.disabled}
                header={
                  <span className="flex items-center gap-ui-2xs">
                    {Icon ? <Icon className="size-4 shrink-0" /> : null}
                    {label}
                  </span>
                }
              >
                {item.content}
              </TabPanel>
            );
          })}
        </Tabs>
      </div>
    );
  },
);
SettingsPage.displayName = "SettingsPage";
```

- [ ] **Step 4: Correr las pruebas y ver que pasan**

Ejecutar: `npm run test:run -- src/__tests__/settings-page.test.tsx`
Esperado: PASS. Este bloque de Step 1 basta para 9, pero la Tarea 1 terminó
con 19: dos rondas de revisión de calidad encontraron bugs de conducta reales
—pestaña activa huérfana cuando `sections` cambia por debajo, sección
deshabilitada que se abría sola, repliegue mudo en modo controlado, estado
interno obsoleto que resucitaba una pestaña ya ausente— y cada uno se cerró
con su propia prueba. Ver el archivo en disco para el conjunto completo.

`Tabs` pinta `aria-selected` (no `data-selected`, que es el gancho de estilo,
no el contrato) para marcar la pestaña activa —es lo que ya usa
`src/__tests__/tabs.test.tsx`—. Si hace falta comprobar la anatomía real de
otro atributo antes de tocar una prueba, es el error que la guía del repo
señala:

```bash
grep -rho "data-[a-z-]*" node_modules/@zag-js/tabs/dist/*.js | sort -u
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/settings-page.tsx src/__tests__/settings-page.test.tsx
git commit -m "feat(layout): SettingsPage pinta la cabecera y las secciones en pestañas

Refs #124"
```

---

## Task 2: El pie de guardado por sección

**Files:**
- Modify: `src/components/layout/settings-page.tsx`
- Test: `src/__tests__/settings-page.test.tsx`

- [ ] **Step 1: Escribir las pruebas que fallan**

Añadir al final de `src/__tests__/settings-page.test.tsx`:

```tsx
describe("SettingsPage · el pie de guardado", () => {
  it("sin `onSave`, no hay pie", () => {
    montar();
    expect(screen.queryByRole("button", { name: "Guardar" })).not.toBeInTheDocument();
  });

  it("con `onSave`, pinta Guardar; sin cambios está deshabilitado", () => {
    montar({ sections: [{ id: "account", content: <p>A</p>, onSave: vi.fn() }] });
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
  });

  it("con `dirty`, Guardar se habilita y llama a `onSave`", async () => {
    const onSave = vi.fn();
    montar({ sections: [{ id: "account", content: <p>A</p>, dirty: true, onSave }] });
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("Cancelar solo aparece con `onCancel`, y devuelve el control a la aplicación", async () => {
    const onCancel = vi.fn();
    montar({ sections: [{ id: "account", content: <p>A</p>, dirty: true, onSave: vi.fn(), onCancel }] });
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("mientras guarda, lo dice y no admite otro clic", () => {
    montar({ sections: [{ id: "account", content: <p>A</p>, dirty: true, saving: true, onSave: vi.fn() }] });
    expect(screen.getByRole("button", { name: "Guardando…" })).toBeDisabled();
  });

  it("los textos del pie se pueden sustituir", () => {
    montar({
      labels: { save: "Save", cancel: "Discard" },
      sections: [{ id: "account", content: <p>A</p>, dirty: true, onSave: vi.fn(), onCancel: vi.fn() }],
    });
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Discard" })).toBeInTheDocument();
  });

  it("el pie es solo de la sección abierta", async () => {
    montar({
      sections: [
        { id: "account", content: <p>Datos de la cuenta</p>, dirty: true, onSave: vi.fn() },
        { id: "appearance", content: <p>Tema y color</p> },
      ],
    });
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    await screen.findByText("Tema y color");
    expect(screen.queryByRole("button", { name: "Guardar" })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr las pruebas y ver que fallan**

Ejecutar: `npm run test:run -- src/__tests__/settings-page.test.tsx`
Esperado: FAIL — «Unable to find role "button" with name "Guardar"».

- [ ] **Step 3: Escribir la implementación**

En `src/components/layout/settings-page.tsx`, añadir el import del botón junto a los que ya hay:

```tsx
import { Button } from "@/components/ui/button";
```

Extender `SettingsSection` con los cuatro campos del pie, justo después de `content`:

```tsx
  content: React.ReactNode;
  /**
   * Guarda lo de esta sección. Con él, el armazón pinta el pie; sin él, la
   * sección no tiene pie y la aplicación pone sus botones donde quiera.
   */
  onSave?: () => void | Promise<void>;
  /** Descarta los cambios. Sin él, no se pinta «Cancelar». */
  onCancel?: () => void;
  /** Hay cambios sin guardar: habilita «Guardar». */
  dirty?: boolean;
  /** Se está guardando: el pie lo dice y no admite otro clic. */
  saving?: boolean;
  disabled?: boolean;
```

Añadir los textos, antes de `SettingsPageProps`:

```tsx
export interface SettingsPageLabels {
  /** @default "Guardar" */
  save?: string;
  /** @default "Cancelar" */
  cancel?: string;
  /** @default "Guardando…" */
  saving?: string;
}

const DEFAULT_LABELS: Required<SettingsPageLabels> = {
  save: "Guardar",
  cancel: "Cancelar",
  saving: "Guardando…",
};
```

Añadir a `SettingsPageProps`, después de `onSectionChange` (la interfaz ya no
declara `className` como campo propio: lo trae `extends
Omit<React.HTMLAttributes<HTMLDivElement>, "title">`, junto con `id`,
`data-testid`, `aria-labelledby`... y todo lo demás que un consumidor pueda
necesitar pasar):

```tsx
  /** Textos, para otro idioma o para decirlo de otra forma. */
  labels?: SettingsPageLabels;
```

En el cuerpo del componente, aceptar `labels` en la desestructuración y
resolver los textos —sin perder el resto de atributos HTML (`...props`), que
siguen yendo al `<div>` raíz:

```tsx
  ({ title, description, actions, sections, section, onSectionChange, labels, className, ...props }, ref) => {
    const text = { ...DEFAULT_LABELS, ...labels };
```

Y dentro del `TabPanel`, tras `{item.content}`, añadir el pie:

```tsx
                {item.content}
                {item.onSave ? (
                  <div className="mt-ui-lg flex justify-end gap-ui-xs border-t border-border pt-ui-md">
                    {item.onCancel ? (
                      <Button
                        type="button"
                        variant="plain"
                        onClick={item.onCancel}
                        disabled={!item.dirty || item.saving || item.disabled}
                      >
                        {text.cancel}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      onClick={() => void item.onSave?.()}
                      disabled={!item.dirty || item.saving || item.disabled}
                    >
                      {item.saving ? text.saving : text.save}
                    </Button>
                  </div>
                ) : null}
```

- [ ] **Step 4: Correr las pruebas y ver que pasan**

Ejecutar: `npm run test:run -- src/__tests__/settings-page.test.tsx`
Esperado: PASS, 16 pruebas.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/settings-page.tsx src/__tests__/settings-page.test.tsx
git commit -m "feat(layout): SettingsPage pinta el pie de guardado de cada sección

Refs #124"
```

---

## Task 3: El aviso de cambios sin guardar

**Files:**
- Modify: `src/components/layout/settings-page.tsx`
- Test: `src/__tests__/settings-page.test.tsx`

- [ ] **Step 1: Escribir las pruebas que fallan**

Añadir al final de `src/__tests__/settings-page.test.tsx`:

```tsx
import { waitFor, within } from "@testing-library/react";

const conCambios = (onSectionChange?: (id: string) => void) => {
  montar({
    onSectionChange,
    sections: [
      { id: "account", content: <p>Datos de la cuenta</p>, dirty: true, onSave: vi.fn() },
      { id: "appearance", content: <p>Tema y color</p> },
    ],
  });
};

describe("SettingsPage · salir de una sección con cambios", () => {
  it("pide confirmación antes de cambiar de pestaña", async () => {
    conCambios();
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    const dialogo = await screen.findByRole("alertdialog");
    expect(dialogo).toHaveTextContent("Hay cambios sin guardar");
    // Es el AlertDialogHost de UiProvider, no una capa modal propia.
    expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
  });

  it("al cancelar, la pestaña no cambia", async () => {
    conCambios();
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    const dialogo = await screen.findByRole("alertdialog");
    await user.click(within(dialogo).getByRole("button", { name: "Seguir aquí" }));
    await waitFor(() => expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute("aria-selected", "true"));
    expect(screen.getByText("Datos de la cuenta")).toBeVisible();
  });

  it("al confirmar, se pierde el cambio y se abre la otra sección", async () => {
    conCambios();
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    const dialogo = await screen.findByRole("alertdialog");
    await user.click(within(dialogo).getByRole("button", { name: "Descartar" }));
    expect(await screen.findByText("Tema y color")).toBeVisible();
  });

  it("con `section` controlado, solo avisa a la aplicación tras confirmar", async () => {
    const onSectionChange = vi.fn();
    conCambios(onSectionChange);
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    expect(onSectionChange).not.toHaveBeenCalled();
    const dialogo = await screen.findByRole("alertdialog");
    await user.click(within(dialogo).getByRole("button", { name: "Descartar" }));
    await waitFor(() => expect(onSectionChange).toHaveBeenCalledWith("appearance"));
  });

  it("`guardUnsaved={false}` lo desactiva", async () => {
    montar({
      guardUnsaved: false,
      sections: [
        { id: "account", content: <p>Datos de la cuenta</p>, dirty: true, onSave: vi.fn() },
        { id: "appearance", content: <p>Tema y color</p> },
      ],
    });
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    expect(await screen.findByText("Tema y color")).toBeVisible();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("sin cambios, no pregunta nada", async () => {
    montar();
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    expect(await screen.findByText("Tema y color")).toBeVisible();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("los textos del aviso se pueden sustituir", async () => {
    montar({
      labels: { unsavedTitle: "Unsaved changes", unsavedConfirm: "Discard", unsavedCancel: "Stay" },
      sections: [
        { id: "account", content: <p>Datos de la cuenta</p>, dirty: true, onSave: vi.fn() },
        { id: "appearance", content: <p>Tema y color</p> },
      ],
    });
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    const dialogo = await screen.findByRole("alertdialog");
    expect(dialogo).toHaveTextContent("Unsaved changes");
    expect(within(dialogo).getByRole("button", { name: "Discard" })).toBeInTheDocument();
    expect(within(dialogo).getByRole("button", { name: "Stay" })).toBeInTheDocument();
  });
});
```

Ajustar la primera línea de importación del archivo para que traiga también `waitFor` y `within` en vez de repetir el import (borrar el `import { waitFor, within } …` recién añadido y dejar arriba):

```tsx
import { render, screen, waitFor, within } from "@testing-library/react";
```

- [ ] **Step 2: Correr las pruebas y ver que fallan**

Ejecutar: `npm run test:run -- src/__tests__/settings-page.test.tsx`
Esperado: FAIL — «Unable to find role "alertdialog"».

- [ ] **Step 3: Escribir la implementación**

En `src/components/layout/settings-page.tsx`, añadir el import:

```tsx
import { confirmAlert } from "@/components/ui/alert-dialog";
```

Ampliar `SettingsPageLabels` con los cuatro textos del aviso:

```tsx
  /** @default "Guardando…" */
  saving?: string;
  /** @default "Hay cambios sin guardar" */
  unsavedTitle?: string;
  /** @default "Si sales de esta sección se perderán." */
  unsavedDescription?: string;
  /** @default "Descartar" */
  unsavedConfirm?: string;
  /** @default "Seguir aquí" */
  unsavedCancel?: string;
```

Y `DEFAULT_LABELS`:

```tsx
const DEFAULT_LABELS: Required<SettingsPageLabels> = {
  save: "Guardar",
  cancel: "Cancelar",
  saving: "Guardando…",
  unsavedTitle: "Hay cambios sin guardar",
  unsavedDescription: "Si sales de esta sección se perderán.",
  unsavedConfirm: "Descartar",
  unsavedCancel: "Seguir aquí",
};
```

Añadir a `SettingsPageProps`, antes de `labels`:

```tsx
  /**
   * Pide confirmación al salir de una sección con cambios sin guardar.
   * Reutiliza `confirmAlert` —hace falta `UiProvider` montado— y no monta una
   * capa modal propia.
   * @default true
   */
  guardUnsaved?: boolean;
```

Aceptarlo en la desestructuración con su valor por defecto —sin perder
`...props`, que sigue yendo al `<div>` raíz:

```tsx
  ({ title, description, actions, sections, section, onSectionChange, guardUnsaved = true, labels, className, ...props }, ref) => {
```

Y sustituir la función `change` por esta:

```tsx
    const apply = (next: string) => {
      // Con `section`, la pestaña la lleva la aplicación: aquí solo se avisa.
      if (section === undefined) setInternal(next);
      onSectionChange?.(next);
    };

    const change = (next: string) => {
      if (next === active) return;
      const leaving = sections.find((item) => item.id === active);
      if (!guardUnsaved || !leaving?.dirty) {
        apply(next);
        return;
      }
      confirmAlert({
        title: text.unsavedTitle,
        description: text.unsavedDescription,
        confirmLabel: text.unsavedConfirm,
        cancelLabel: text.unsavedCancel,
        variant: "destructive",
        onConfirm: () => apply(next),
      });
    };
```

En modo no controlado el `Tabs` sigue mandando su propio valor, así que hay que
atarlo: `Tabs` ya recibe `value={active}`, y como `active` solo cambia cuando
`apply` corre, cancelar el aviso deja la pestaña donde estaba sin trabajo extra.

- [ ] **Step 4: Correr las pruebas y ver que pasan**

Ejecutar: `npm run test:run -- src/__tests__/settings-page.test.tsx`
Esperado: PASS, 23 pruebas.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/settings-page.tsx src/__tests__/settings-page.test.tsx
git commit -m "feat(layout): SettingsPage avisa antes de salir de una sección con cambios

Refs #124"
```

---

## Task 4: `ProfileForm`, la sección «Cuenta»

**Files:**
- Create: `src/components/ui/profile-form.tsx`
- Test: `src/__tests__/profile-form.test.tsx`

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `src/__tests__/profile-form.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { ProfileForm } from "../components/ui/profile-form";

const valor = { name: "Andrés Montoya", email: "andres@piensait.com", phone: "3001234567", jobTitle: "Cajera" };

const montar = (props: Partial<React.ComponentProps<typeof ProfileForm>> = {}) => {
  const onChange = vi.fn();
  render(<ProfileForm value={valor} onChange={onChange} {...props} />);
  return { onChange };
};

/**
 * Lo único del perfil que de verdad se repite entre aplicaciones (#124): el
 * avatar y los cuatro datos de la persona. Todo lo demás —documento, sede,
 * contraseña— es negocio y entra por `children`.
 */
describe("ProfileForm", () => {
  it("ofrece el avatar y los cuatro campos, rellenos", () => {
    montar();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Andrés Montoya");
    expect(screen.getByLabelText("Correo")).toHaveValue("andres@piensait.com");
    expect(screen.getByLabelText("Teléfono")).toHaveValue("3001234567");
    expect(screen.getByLabelText("Cargo")).toHaveValue("Cajera");
    expect(screen.getByRole("button", { name: "Subir foto" })).toBeInTheDocument();
  });

  it("las iniciales del avatar salen del nombre", () => {
    const { container } = render(<ProfileForm value={valor} onChange={vi.fn()} />);
    expect(container.querySelector("[data-scope='avatar']")).toHaveTextContent("AM");
  });

  it("escribir en un campo entrega el objeto completo, no solo el campo", async () => {
    const user = userEvent.setup();
    const { onChange } = montar();
    await user.type(screen.getByLabelText("Nombre"), "!");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      name: "Andrés Montoya!",
      email: "andres@piensait.com",
      phone: "3001234567",
      jobTitle: "Cajera",
    }));
  });

  it("elegir un color del avatar también entrega el objeto completo", async () => {
    const user = userEvent.setup();
    const { onChange } = montar();
    const colores = screen.getAllByRole("radio");
    await user.click(colores[1]);
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      name: "Andrés Montoya",
      avatar: expect.objectContaining({ color: expect.any(String) }),
    }));
  });

  it("`fields` decide qué campos se ofrecen", () => {
    montar({ fields: ["name", "email"] });
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.queryByLabelText("Teléfono")).not.toBeInTheDocument();
  });

  it("los campos propios de la aplicación van tras los estándar", () => {
    montar({
      children: (
        <Field label="Documento">
          <Input defaultValue="1020304050" />
        </Field>
      ),
    });
    const etiquetas = screen.getAllByText(/Nombre|Correo|Teléfono|Cargo|Documento/).map((n) => n.textContent);
    expect(etiquetas[etiquetas.length - 1]).toBe("Documento");
  });

  it("un error de validación se muestra en su campo", () => {
    montar({ errors: { email: "Ese correo ya está en uso." } });
    expect(screen.getByText("Ese correo ya está en uso.")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo")).toHaveAttribute("aria-invalid", "true");
  });

  it("los textos se pueden sustituir", () => {
    montar({ labels: { name: "Full name", email: "Email" } });
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr las pruebas y ver que fallan**

Ejecutar: `npm run test:run -- src/__tests__/profile-form.test.tsx`
Esperado: FAIL — `Failed to resolve import "../components/ui/profile-form"`.

- [ ] **Step 3: Escribir la implementación**

Crear `src/components/ui/profile-form.tsx`:

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";
import type { TokenColor } from "@/lib/palette";
import { AvatarPicker, type AvatarPickerValue } from "./avatar-picker";
import { Field } from "./field";
import { FormGrid } from "./form-grid";
import { Input } from "./input";

export type ProfileField = "name" | "email" | "phone" | "jobTitle";

export interface ProfileFormValue {
  name: string;
  email?: string;
  phone?: string;
  /** «Cajera», «Administrador»… El mismo que se ve en `UserMenu`. */
  jobTitle?: string;
  avatar?: AvatarPickerValue;
}

export interface ProfileFormChange extends ProfileFormValue {
  /**
   * La foto recién elegida, o `null` si se quitó, cuando el cambio vino del
   * avatar. Subirla y guardarla es de la aplicación.
   */
  avatarFile?: File | null;
}

export interface ProfileFormLabels {
  /** @default "Nombre" */
  name?: string;
  /** @default "Correo" */
  email?: string;
  /** @default "Teléfono" */
  phone?: string;
  /** @default "Cargo" */
  jobTitle?: string;
}

export interface ProfileFormProps {
  value: ProfileFormValue;
  /** Recibe el objeto completo con el cambio aplicado. No persiste nada. */
  onChange: (next: ProfileFormChange) => void;
  /**
   * Qué campos se ofrecen.
   * @default ["name", "email", "phone", "jobTitle"]
   */
  fields?: ProfileField[];
  /** Mensajes de validación por campo. La validación la hace la aplicación. */
  errors?: Partial<Record<ProfileField, React.ReactNode>>;
  /** Campos propios de la aplicación —documento, sede—, tras los estándar. */
  children?: React.ReactNode;
  /** Colores ofrecidos para las iniciales. Por defecto, los ocho del sistema. */
  avatarColors?: TokenColor[];
  /** @default 2 */
  avatarMaxSizeMb?: number;
  labels?: ProfileFormLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<ProfileFormLabels> = {
  name: "Nombre",
  email: "Correo",
  phone: "Teléfono",
  jobTitle: "Cargo",
};

const DEFAULT_FIELDS: ProfileField[] = ["name", "email", "phone", "jobTitle"];

const INPUT_TYPE: Record<ProfileField, string> = {
  name: "text",
  email: "email",
  phone: "tel",
  jobTitle: "text",
};

/**
 * Los datos de la persona en la pantalla de perfil (#124): el avatar y el
 * nombre, correo, teléfono y cargo. Es lo único que de verdad se repite entre
 * aplicaciones; lo demás —documento, sede, contraseña— es negocio y entra por
 * `children`, tras los campos estándar.
 *
 * Controlado y sin persistencia, como el resto de la librería: cualquier
 * cambio —el avatar incluido— llama a `onChange` con el objeto completo.
 * Va como contenido de la sección `account` de `SettingsPage`.
 *
 * @example
 * ```tsx
 * <ProfileForm
 *   value={perfil}
 *   onChange={(next) => setPerfil(next)}
 *   errors={{ email: errorDeCorreo }}
 * >
 *   <Field label="Documento"><Input value={doc} onChange={…} /></Field>
 * </ProfileForm>
 * ```
 */
export const ProfileForm = React.forwardRef<HTMLDivElement, ProfileFormProps>(
  (
    {
      value,
      onChange,
      fields = DEFAULT_FIELDS,
      errors,
      children,
      avatarColors,
      avatarMaxSizeMb,
      labels,
      className,
    },
    ref,
  ) => {
    const text = { ...DEFAULT_LABELS, ...labels };

    return (
      <div ref={ref} className={cn("flex flex-col gap-ui-lg", className)}>
        <AvatarPicker
          name={value.name}
          value={value.avatar}
          colors={avatarColors}
          maxSizeMb={avatarMaxSizeMb}
          // El avatar es un dato más del perfil: se entrega junto al resto,
          // para que la aplicación guarde una sola vez.
          onChange={({ file, color, src }) =>
            onChange({ ...value, avatar: { color, src: src ?? (file === null ? undefined : value.avatar?.src) }, avatarFile: file })
          }
        />
        <FormGrid>
          {fields.map((field) => (
            <Field key={field} label={text[field]} error={errors?.[field]}>
              <Input
                type={INPUT_TYPE[field]}
                value={value[field] ?? ""}
                onChange={(event) => onChange({ ...value, [field]: event.target.value })}
              />
            </Field>
          ))}
          {children}
        </FormGrid>
      </div>
    );
  },
);
ProfileForm.displayName = "ProfileForm";
```

- [ ] **Step 4: Correr las pruebas y ver que pasan**

Ejecutar: `npm run test:run -- src/__tests__/profile-form.test.tsx`
Esperado: PASS, 8 pruebas.

Si la prueba del color falla por el rol del control, comprobar cómo pinta
`AvatarPicker` sus muestras antes de cambiar el componente:

```bash
grep -nE "role=|<button|RadioGroup" src/components/ui/avatar-picker.tsx
```

y ajustar en la prueba el selector —no el componente—.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/profile-form.tsx src/__tests__/profile-form.test.tsx
git commit -m "feat(ui): ProfileForm, el avatar y los datos de la persona del perfil

Refs #124"
```

---

## Task 5: Exports públicos

**Files:**
- Modify: `src/index.ts`
- Test: `src/__tests__/settings-page.test.tsx` (nueva prueba de barrel)

- [ ] **Step 1: Escribir la prueba que falla**

Añadir al final de `src/__tests__/settings-page.test.tsx`:

```tsx
describe("SettingsPage · contrato público", () => {
  it("se importa desde la raíz del paquete, con ProfileForm", async () => {
    const barrel = await import("../index");
    expect(barrel.SettingsPage).toBe(SettingsPage);
    expect(barrel.ProfileForm).toBeTypeOf("object");
  });
});
```

- [ ] **Step 2: Correr la prueba y ver que falla**

Ejecutar: `npm run test:run -- src/__tests__/settings-page.test.tsx -t "contrato público"`
Esperado: FAIL — `expected undefined to be [Function SettingsPage]`.

- [ ] **Step 3: Añadir los exports**

En `src/index.ts`, tras el bloque de `UserMenu` (línea ~212), añadir:

```ts
export {
  SettingsPage,
  type SettingsPageProps,
  type SettingsPageLabels,
  type SettingsSection,
} from "./components/layout/settings-page";
```

Y en la zona de componentes `ui`, tras el export de `AvatarPicker` (buscarlo con `grep -n "avatar-picker" src/index.ts`), añadir:

```ts
export {
  ProfileForm,
  type ProfileFormProps,
  type ProfileFormValue,
  type ProfileFormChange,
  type ProfileFormLabels,
  type ProfileField,
} from "./components/ui/profile-form";
```

- [ ] **Step 4: Correr las pruebas y el lint**

Ejecutar: `npm run test:run && npm run lint`
Esperado: PASS en todo, sin avisos de ESLint.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts src/__tests__/settings-page.test.tsx
git commit -m "feat(api): exporta SettingsPage y ProfileForm desde la raíz del paquete

Refs #124"
```

---

## Task 6: Stories

**Files:**
- Create: `src/components/layout/settings-page.stories.tsx`
- Create: `src/components/ui/profile-form.stories.tsx`

- [ ] **Step 1: Escribir la story de `ProfileForm`**

Crear `src/components/ui/profile-form.stories.tsx`:

```tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProfileForm, type ProfileFormValue } from "./profile-form";
import { Field } from "./field";
import { Input } from "./input";

const meta = {
  title: "Formularios/ProfileForm",
  component: ProfileForm,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Los datos de la persona en la pantalla de perfil: el avatar y el nombre, correo, teléfono y cargo. Es lo único del perfil que de verdad se repite entre aplicaciones; lo demás entra por `children`. Controlado y sin persistencia.",
      },
    },
  },
  decorators: [(Story) => <div className="max-w-3xl p-ui-md"><Story /></div>],
} satisfies Meta<typeof ProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const Controlado = (props: Partial<React.ComponentProps<typeof ProfileForm>>) => {
  const [value, setValue] = React.useState<ProfileFormValue>({
    name: "Andrés Montoya",
    email: "andres@piensait.com",
    phone: "3001234567",
    jobTitle: "Cajera",
    avatar: { color: "350 75% 45%" },
  });
  return <ProfileForm {...props} value={value} onChange={setValue} />;
};

/** Los cuatro campos estándar y la elección del avatar. */
export const Default: Story = {
  name: "Completo",
  render: () => <Controlado />,
};

/** Los campos propios de la aplicación van tras los estándar. */
export const ConCamposPropios: Story = {
  name: "Con campos propios",
  render: () => (
    <Controlado>
      <Field label="Documento">
        <Input defaultValue="1020304050" />
      </Field>
      <Field label="Sede">
        <Input defaultValue="Medellín" />
      </Field>
    </Controlado>
  ),
};

/** La validación la hace la aplicación; el formulario solo muestra el mensaje. */
export const ConError: Story = {
  name: "Con error de validación",
  render: () => <Controlado errors={{ email: "Ese correo ya está en uso." }} />,
};
```

- [ ] **Step 2: Escribir la story de `SettingsPage`**

Crear `src/components/layout/settings-page.stories.tsx`:

```tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SettingsPage } from "./settings-page";
import { PageContainer } from "./page-container";
import { UiProvider } from "@/components/providers/UiProvider";
import { AppearanceSettings, type AppearanceValue } from "@/components/ui/appearance-settings";
import { ProfileForm, type ProfileFormValue } from "@/components/ui/profile-form";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldIcon } from "@/icons";

const meta = {
  title: "Layout/SettingsPage",
  component: SettingsPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "El destino estándar de «Mi perfil» y «Configuración»: cabecera, secciones en pestañas y el guardado de cada una siempre en el mismo sitio. `UserMenu` fijó las entradas; esto fija lo que hay al otro lado. Va dentro del `PageContainer` de la aplicación.",
      },
    },
  },
  decorators: [
    (Story) => (
      <UiProvider>
        <PageContainer>
          <Story />
        </PageContainer>
      </UiProvider>
    ),
  ],
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const Perfil = () => {
  const [value, setValue] = React.useState<ProfileFormValue>({
    name: "Andrés Montoya",
    email: "andres@piensait.com",
    phone: "3001234567",
    jobTitle: "Cajera",
    avatar: { color: "350 75% 45%" },
  });
  const [guardado, setGuardado] = React.useState(value);
  const dirty = JSON.stringify(value) !== JSON.stringify(guardado);

  return (
    <SettingsPage
      title="Mi perfil"
      description="Tus datos y cómo te ven los demás."
      sections={[
        {
          id: "account",
          content: <ProfileForm value={value} onChange={setValue} />,
          dirty,
          onSave: () => setGuardado(value),
          onCancel: () => setValue(guardado),
        },
        {
          id: "security",
          content: (
            <EmptyState
              icon={<ShieldIcon />}
              title="Lo pone la aplicación"
              description="La política de contraseñas y las sesiones activas son negocio: la librería solo reserva el sitio, el rótulo y el icono."
            />
          ),
        },
      ]}
    />
  );
};

/** «Mi perfil»: la sección de cuenta guarda lo suyo; seguridad la pone la aplicación. */
export const Default: Story = {
  name: "Mi perfil",
  render: () => <Perfil />,
};

const Configuracion = () => {
  const [value, setValue] = React.useState<AppearanceValue>({
    theme: "system",
    palette: "indigo",
    font: "geist",
    density: "default",
  });
  return (
    <SettingsPage
      title="Configuración"
      description="Cómo se ve y cómo te avisa la aplicación."
      sections={[
        { id: "appearance", content: <AppearanceSettings value={value} onChange={setValue} /> },
        {
          id: "notifications",
          content: (
            <EmptyState
              title="Lo pone la aplicación"
              description="El catálogo de eventos que se pueden avisar es de cada aplicación."
            />
          ),
        },
      ]}
    />
  );
};

/** «Configuración»: el mismo armazón, otras secciones. */
export const ConfiguracionStory: Story = {
  name: "Configuración",
  render: () => <Configuracion />,
};

/** Con cambios sin guardar, salir de la sección pide confirmación. */
export const ConCambiosSinGuardar: Story = {
  name: "Con cambios sin guardar",
  render: () => (
    <SettingsPage
      title="Mi perfil"
      sections={[
        { id: "account", content: <p className="text-ui-body-sm">Cambia algo y prueba a irte a Apariencia.</p>, dirty: true, onSave: () => {}, onCancel: () => {} },
        { id: "appearance", content: <p className="text-ui-body-sm">Tema, color, tipografía y densidad.</p> },
      ]}
    />
  ),
};
```

- [ ] **Step 3: Comprobar que Storybook compila y las stories se ven**

Ejecutar: `npm run build-storybook`
Esperado: termina sin errores y genera `storybook-static/`.

Si `AppearanceValue` o `EmptyState` no se exportan con esos nombres, comprobarlos —no inventarlos—:

```bash
grep -n "AppearanceValue" src/components/ui/appearance-settings.tsx | head -3
grep -n "EmptyStateProps" -A 12 src/components/ui/empty-state.tsx | head -16
```

- [ ] **Step 4: Correr lint y pruebas**

Ejecutar: `npm run lint && npm run test:run`
Esperado: PASS en todo.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/settings-page.stories.tsx src/components/ui/profile-form.stories.tsx
git commit -m "docs(storybook): stories de SettingsPage y ProfileForm

Refs #124"
```

---

## Task 7: Captura comparada y CHANGELOG

**Files:**
- Modify: `tests/browser/storybook.spec.ts`
- Modify: `CHANGELOG.md`
- Create: `tests/browser/__screenshots__/storybook.spec.ts/settings-page-linux.png` (generado)

- [ ] **Step 1: Añadir la prueba de navegador**

En `tests/browser/storybook.spec.ts`, dentro del `test.describe("Storybook browser gate", …)`, añadir:

```ts
  test("keeps the settings page shell visually stable", async ({ page }) => {
    await page.goto(storyUrl("layout-settingspage--default"));
    await stabilize(page);

    const story = page.locator("#storybook-root");
    await expect(story.getByRole("tab", { name: "Cuenta" })).toBeVisible();
    await expect(story).toHaveScreenshot("settings-page.png", {
      animations: "disabled",
      maxDiffPixels: MAX_DIFF_PIXELS,
    });
  });
```

Comprobar el identificador real de la story antes de dar por buena la ruta:

```bash
npm run build-storybook && grep -o '"layout-settingspage--[a-z-]*"' storybook-static/index.json | sort -u
```

- [ ] **Step 2: Generar la captura de referencia de Linux**

Las capturas que mira CI son las de Linux, y se regeneran con Docker, no a mano.

Ejecutar: `npm run test:browser:docker:update`
Esperado: crea `tests/browser/__screenshots__/storybook.spec.ts/settings-page-linux.png`.

- [ ] **Step 3: Comprobar que la puerta pasa con la referencia recién hecha**

Ejecutar: `npm run test:browser:docker`
Esperado: PASS, incluida `keeps the settings page shell visually stable`.

- [ ] **Step 4: Anotar el cambio en el CHANGELOG**

En `CHANGELOG.md`, bajo la sección sin publicar, añadir:

```markdown
### Añadido

- `SettingsPage`: el armazón estándar de «Mi perfil» y «Configuración» —cabecera, secciones en pestañas, pie de guardado por sección y aviso de cambios sin guardar—, con catálogo de secciones conocidas (`account`, `appearance`, `security`, `notifications`). (#124)
- `ProfileForm`: el avatar y los datos de la persona —nombre, correo, teléfono y cargo—, con hueco para los campos propios de cada aplicación. (#124)
```

- [ ] **Step 5: Commit**

```bash
git add tests/browser CHANGELOG.md
git commit -m "test(browser): captura de linux de SettingsPage, y CHANGELOG

Refs #124"
```

---

## Task 8: Cierre

- [ ] **Step 1: Correr la puerta completa**

Ejecutar: `npm run lint && npm run test:run && npm run build && npm run build-storybook`
Esperado: PASS en los cuatro, sin avisos.

- [ ] **Step 2: Revisar el contrato público**

Esta HU solo añade exports; no renombra ni quita nada, así que es un cambio menor de semver. Confirmarlo con el skill del repo:

Invocar la skill `revisar-api-publica`.
Esperado: sin hallazgos de ruptura; dictamen `minor`.

- [ ] **Step 3: Revisar la consistencia visual**

Invocar la skill `consistencia-visual`.
Esperado: sin hallazgos en `settings-page.tsx` ni `profile-form.tsx`; si los hay, corregirlos y volver a correr `npm run test:browser:docker:update`.

- [ ] **Step 4: Empujar la rama y abrir el PR**

```bash
git push -u origin feat/settings-page
gh pr create --fill --base main
```

El cuerpo del PR debe cerrar la HU: incluir `Closes #124`.

---

## Autorrevisión del plan

**Cobertura de la HU #124** — cada criterio de aceptación tiene tarea:

| Criterio | Tarea |
|---|---|
| Cabecera y pestañas; sin `section` abre la primera, con `section` manda la aplicación | 1 |
| Pie solo con `onSave`; deshabilitado sin `dirty`; estado con `saving` | 2 |
| Aviso con `confirmAlert` al salir con cambios; cancelar no cambia; `guardUnsaved={false}` lo desactiva | 3 |
| Identificador conocido toma rótulo e icono del catálogo | 1 |
| `ProfileForm` controlado, avatar incluido; campos propios por `children` | 4 |
| Textos sustituibles con `labels` en las dos piezas | 2, 3, 4 |
| Exportadas desde `src/index.ts` con sus tipos | 5 |
| Tests en `settings-page.test.tsx` y `profile-form.test.tsx` | 1–5 |
| Stories con `tags: ["autodocs"]` | 6 |
| Captura de navegador regenerada en Docker | 7 |

**Desviación anotada:** la HU dice que un identificador propio «exige `label`». En TypeScript eso no se puede exigir sin partir el tipo en dos, así que la implementación cae en el identificador como rótulo y lo documenta. Al cerrar la HU hay que decirlo en el PR.

**Fuera de este plan** (así lo decidió la HU): la sustitución del armazón de `Profile.tsx` en MiDivisa, que es trabajo del repo de esa aplicación, no de este.
