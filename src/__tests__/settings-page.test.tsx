import * as React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UiProvider } from "../components/providers/ui-provider";
import { SettingsPage, type SettingsSection } from "../components/layout/settings-page";
import { ProfileForm } from "../components/ui/profile-form";

const DEFAULT_SECTIONS: SettingsSection[] = [
  { id: "account", content: <p>Datos de la cuenta</p> },
  { id: "appearance", content: <p>Tema y color</p> },
];

const montar = (props: Partial<React.ComponentProps<typeof SettingsPage>> = {}) => {
  const secciones: SettingsSection[] = props.sections ?? DEFAULT_SECTIONS;
  return render(
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

  it("un identificador propio sin `label` cae en el identificador", () => {
    // Comportamiento pensado, no accidental: mejor una pestaña fea que una en
    // blanco (ver el comentario junto a `label` en la implementación).
    montar({ sections: [{ id: "facturacion", content: <p>Plan</p> }] });
    expect(screen.getByRole("tab", { name: "facturacion" })).toBeInTheDocument();
  });

  it("sin `section`, abre la primera", () => {
    montar();
    expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Datos de la cuenta")).toBeVisible();
  });

  it("la sección inactiva no se ve", () => {
    montar();
    expect(screen.getByText("Tema y color")).not.toBeVisible();
  });

  it("sin `section`, la pestaña la lleva el armazón", async () => {
    const user = userEvent.setup();
    montar();
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    expect(await screen.findByText("Tema y color")).toBeVisible();
  });

  it("con `section`, manda la aplicación: el clic avisa pero no cambia solo", async () => {
    const user = userEvent.setup();
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

  it("un clic en una pestaña deshabilitada no cambia de sección", async () => {
    const user = userEvent.setup();
    const onSectionChange = vi.fn();
    montar({
      sections: [{ id: "account", content: <p>A</p> }, { id: "appearance", content: <p>B</p>, disabled: true }],
      onSectionChange,
    });
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("A")).toBeVisible();
    // El `disabled` nativo del botón ya impide la navegación en jsdom; lo que
    // prueba el comportamiento del armazón es que tampoco avisa del cambio.
    expect(onSectionChange).not.toHaveBeenCalled();
  });

  it("con todas las secciones deshabilitadas, ninguna pestaña queda activa", () => {
    montar({ sections: [{ id: "account", content: <p>A</p>, disabled: true }, { id: "appearance", content: <p>B</p>, disabled: true }] });
    expect(screen.getAllByRole("tab").every((tab) => tab.getAttribute("aria-selected") === "false")).toBe(true);
    expect(screen.getByText("A")).not.toBeVisible();
    expect(screen.getByText("B")).not.toBeVisible();
  });
});

/**
 * Bugs reales de la revisión de calidad: la pestaña activa no puede quedar
 * huérfana cuando `sections` cambia por debajo —carga diferida, permisos que
 * llegan tarde— ni abrirse sobre una sección deshabilitada al montar.
 */
describe("SettingsPage · `sections` que cambia por debajo", () => {
  it("con la primera sección deshabilitada, abre la primera habilitada", () => {
    montar({
      sections: [
        { id: "account", content: <p>A</p>, disabled: true },
        { id: "appearance", content: <p>B</p> },
      ],
    });
    expect(screen.getByRole("tab", { name: "Apariencia" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("B")).toBeVisible();
  });

  it("de `sections` vacío a con contenido, activa la primera al llegar", () => {
    const { rerender } = render(
      <UiProvider>
        <SettingsPage title="Mi perfil" sections={[]} />
      </UiProvider>,
    );
    expect(screen.queryAllByRole("tab")).toHaveLength(0);

    rerender(
      <UiProvider>
        <SettingsPage title="Mi perfil" sections={DEFAULT_SECTIONS} />
      </UiProvider>,
    );
    expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Datos de la cuenta")).toBeVisible();
  });

  it("si la sección activa desaparece de `sections`, cae en la primera", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <UiProvider>
        <SettingsPage title="Mi perfil" sections={DEFAULT_SECTIONS} />
      </UiProvider>,
    );
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    expect(screen.getByRole("tab", { name: "Apariencia" })).toHaveAttribute("aria-selected", "true");

    rerender(
      <UiProvider>
        <SettingsPage title="Mi perfil" sections={[{ id: "account", content: <p>Datos de la cuenta</p> }]} />
      </UiProvider>,
    );
    expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute("aria-selected", "true");
    // `@zag-js/presence` conmuta el `hidden` del panel por `raf`, no en el
    // mismo commit que `aria-selected`: sin `waitFor` esto es intermitente
    // bajo carga (mismo origen que el `waitFor` de «el pie es solo de la
    // sección abierta», más abajo).
    await waitFor(() => expect(screen.getByText("Datos de la cuenta")).toBeVisible());
  });
});

/**
 * El repliegue de `active` a la primera sección habilitada no puede quedar
 * mudo: en modo controlado, la aplicación se queda creyendo que sigue
 * mostrando una `section` que el armazón ya abandonó; en modo propio, el
 * estado interno obsoleto puede resucitar una pestaña que ya no debería
 * volver sola.
 */
describe("SettingsPage · avisa del repliegue", () => {
  it("con `section` apuntando a algo inexistente, avisa a qué se repliega", async () => {
    const onSectionChange = vi.fn();
    montar({ section: "security", onSectionChange });
    expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(onSectionChange).toHaveBeenCalledWith("account"));
  });

  it("con `section` apuntando a una sección deshabilitada, avisa a qué se repliega", async () => {
    const onSectionChange = vi.fn();
    montar({
      sections: [{ id: "account", content: <p>A</p> }, { id: "appearance", content: <p>B</p>, disabled: true }],
      section: "appearance",
      onSectionChange,
    });
    expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(onSectionChange).toHaveBeenCalledWith("account"));
  });

  it("sin `section`, el estado interno obsoleto no resucita una pestaña que ya no está", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <UiProvider>
        <SettingsPage title="Mi perfil" sections={DEFAULT_SECTIONS} />
      </UiProvider>,
    );
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    expect(screen.getByRole("tab", { name: "Apariencia" })).toHaveAttribute("aria-selected", "true");

    // "appearance" desaparece: el armazón repliega a "account" y reconcilia
    // el estado interno (no solo la vista).
    rerender(
      <UiProvider>
        <SettingsPage title="Mi perfil" sections={[{ id: "account", content: <p>Datos de la cuenta</p> }]} />
      </UiProvider>,
    );
    await waitFor(() => expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute("aria-selected", "true"));

    // "appearance" reaparece: si el estado interno no se hubiera reconciliado
    // arriba, seguiría apuntando a "appearance" y la pestaña saltaría sola.
    rerender(
      <UiProvider>
        <SettingsPage title="Mi perfil" sections={DEFAULT_SECTIONS} />
      </UiProvider>,
    );
    expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Datos de la cuenta")).toBeVisible();
  });

  it("con un `onSectionChange` en línea que re-renderiza al padre, avisa una sola vez", async () => {
    // La causa real del bucle: casi ninguna aplicación envuelve su manejador
    // en `useCallback`, así que su identidad cambia en cada render del
    // padre. Un `vi.fn()` estable en un padre que nunca se re-renderiza no
    // lo habría detectado — hace falta reproducir las dos condiciones a la
    // vez: identidad nueva en cada llamada, y un padre que de verdad vuelva
    // a renderizar cuando la recibe.
    const llamadas: string[] = [];
    const Padre = () => {
      const [, forzar] = React.useReducer((n: number) => n + 1, 0);
      return (
        <SettingsPage
          title="Mi perfil"
          section="security"
          sections={DEFAULT_SECTIONS}
          onSectionChange={(id) => {
            llamadas.push(id);
            forzar();
          }}
        />
      );
    };
    render(
      <UiProvider>
        <Padre />
      </UiProvider>,
    );
    await waitFor(() => expect(llamadas).toEqual(["account"]));
    // Un margen para confirmar que no sigue creciendo, no solo que llegó una vez.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(llamadas).toEqual(["account"]);
  });
});

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
    const user = userEvent.setup();
    const onSave = vi.fn();
    montar({ sections: [{ id: "account", content: <p>A</p>, dirty: true, onSave }] });
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("Cancelar solo aparece con `onCancel`, y devuelve el control a la aplicación", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    montar({ sections: [{ id: "account", content: <p>A</p>, dirty: true, onSave: vi.fn(), onCancel }] });
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("mientras guarda, lo dice y no admite otro clic", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    montar({ sections: [{ id: "account", content: <p>A</p>, dirty: true, saving: true, onSave }] });
    const button = screen.getByRole("button", { name: "Guardando…" });
    // No es `disabled` nativo: perdería el foco al pulsarlo (ver el JSDoc de
    // `SectionFooter`). Es `aria-disabled`, y el clic se descarta a mano.
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("con `saving` pero sin `dirty` —la aplicación limpia `dirty` al empezar a guardar—, sigue diciendo «Guardando…»", () => {
    montar({ sections: [{ id: "account", content: <p>A</p>, dirty: false, saving: true, onSave: vi.fn() }] });
    expect(screen.getByRole("button", { name: "Guardando…" })).toBeInTheDocument();
  });

  it("un `onSave` que rechaza no escapa como `unhandledrejection`", async () => {
    const user = userEvent.setup();
    const onUnhandledRejection = vi.fn();
    process.on("unhandledRejection", onUnhandledRejection);
    let called = false;
    // A propósito, no un `vi.fn()`: el `spy` de vitest engancha su propio
    // `.then(onFulfilled, onRejected)` a lo que devuelve para llevar
    // `mock.resolves` — eso ya vuelve "manejado" cualquier rechazo aunque
    // `SectionFooter` no le pusiera ningún `catch`, y la prueba no probaría
    // nada (se comprobó por mutación: con `vi.fn().mockRejectedValue`, esta
    // prueba pasaba igual con el `catch` de la implementación quitado).
    const onSave = () => {
      called = true;
      return Promise.reject(new Error("network"));
    };
    try {
      montar({ sections: [{ id: "account", content: <p>A</p>, dirty: true, onSave }] });
      await user.click(screen.getByRole("button", { name: "Guardar" }));
      // Margen de sobra: si el rechazo no se hubiera absorbido, es en algún
      // punto de aquí cuando Node dispara el evento.
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(called).toBe(true);
      expect(onUnhandledRejection).not.toHaveBeenCalled();
    } finally {
      process.off("unhandledRejection", onUnhandledRejection);
    }
  });

  it("Cancelar está deshabilitado sin `dirty`", () => {
    montar({ sections: [{ id: "account", content: <p>A</p>, onSave: vi.fn(), onCancel: vi.fn() }] });
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
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
    const user = userEvent.setup();
    montar({
      // Sin `dirty`: lo que se prueba aquí es que el pie no se filtra a otra
      // sección, no el aviso de cambios sin guardar (esa es la tarea de
      // abajo) — con `dirty: true` el cambio de pestaña abriría el diálogo
      // de confirmación y nunca llegaría a "Apariencia".
      sections: [
        { id: "account", content: <p>Datos de la cuenta</p>, onSave: vi.fn() },
        { id: "appearance", content: <p>Tema y color</p> },
      ],
    });
    // Sin esta aserción, la prueba pasaría igual aunque el pie nunca se
    // hubiera pintado en la sección de origen.
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    await screen.findByText("Tema y color");
    await waitFor(() => expect(screen.queryByRole("button", { name: "Guardar" })).not.toBeInTheDocument());
  });
});

// Sección fresca en cada llamada: los `vi.fn()` de `onSave` no deben
// acumular llamadas de una prueba a otra.
const seccionesSucias = (): SettingsSection[] => [
  { id: "account", content: <p>Datos de la cuenta</p>, dirty: true, onSave: vi.fn() },
  { id: "appearance", content: <p>Tema y color</p> },
];

const conCambios = (props: Partial<React.ComponentProps<typeof SettingsPage>> = {}) =>
  montar({ ...props, sections: seccionesSucias() });

describe("SettingsPage · salir de una sección con cambios", () => {
  it("pide confirmación antes de cambiar de pestaña", async () => {
    const user = userEvent.setup();
    conCambios();
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    const dialogo = await screen.findByRole("alertdialog");
    expect(dialogo).toHaveTextContent("Hay cambios sin guardar");
    // Es el AlertDialogHost de UiProvider, no una capa modal propia.
    expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
  });

  it("al cancelar, la pestaña no cambia y el foco vuelve a la pestaña activa", async () => {
    const user = userEvent.setup();
    conCambios();
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    const dialogo = await screen.findByRole("alertdialog");
    await user.click(within(dialogo).getByRole("button", { name: "Seguir aquí" }));
    await waitFor(() => expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute("aria-selected", "true"));
    expect(screen.getByText("Datos de la cuenta")).toBeVisible();
    // El foco no puede quedar en la pestaña clicada —la que se decidió no
    // abrir—: ahí queda un anillo de foco mintiendo sobre cuál es la sección
    // activa, y pulsar Enter la reabriría en un bucle para quien navega con
    // teclado. Sonda real de DOM, no solo del atributo `aria-selected`.
    await waitFor(() => expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveFocus());
  });

  it("al confirmar, se pierde el cambio y se abre la otra sección", async () => {
    const user = userEvent.setup();
    conCambios();
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    const dialogo = await screen.findByRole("alertdialog");
    await user.click(within(dialogo).getByRole("button", { name: "Descartar" }));
    expect(await screen.findByText("Tema y color")).toBeVisible();
  });

  it("con `section` controlado, solo avisa a la aplicación tras confirmar", async () => {
    const user = userEvent.setup();
    const onSectionChange = vi.fn();
    conCambios({ onSectionChange });
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    expect(onSectionChange).not.toHaveBeenCalled();
    const dialogo = await screen.findByRole("alertdialog");
    await user.click(within(dialogo).getByRole("button", { name: "Descartar" }));
    await waitFor(() => expect(onSectionChange).toHaveBeenCalledWith("appearance"));
  });

  it("`guardUnsaved={false}` lo desactiva", async () => {
    const user = userEvent.setup();
    conCambios({ guardUnsaved: false });
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    expect(await screen.findByText("Tema y color")).toBeVisible();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("sin cambios, no pregunta nada", async () => {
    const user = userEvent.setup();
    montar();
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    expect(await screen.findByText("Tema y color")).toBeVisible();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("los textos del aviso se pueden sustituir", async () => {
    const user = userEvent.setup();
    conCambios({
      labels: {
        unsavedTitle: "Unsaved changes",
        unsavedDescription: "Changes will be lost.",
        unsavedConfirmLabel: "Discard",
        unsavedCancelLabel: "Stay",
      },
    });
    await user.click(screen.getByRole("tab", { name: "Apariencia" }));
    const dialogo = await screen.findByRole("alertdialog");
    expect(dialogo).toHaveTextContent("Unsaved changes");
    expect(dialogo).toHaveTextContent("Changes will be lost.");
    expect(within(dialogo).getByRole("button", { name: "Discard" })).toBeInTheDocument();
    expect(within(dialogo).getByRole("button", { name: "Stay" })).toBeInTheDocument();
  });
});

/**
 * `SettingsPage` y `ProfileForm` (#124) son componentes exportados: tienen
 * que salir por la raíz del paquete (ver `.claude/CLAUDE.md` > "Export
 * único"), no solo estar disponibles vía su ruta interna.
 */
describe("SettingsPage · contrato público", () => {
  it("se importa desde la raíz del paquete, con ProfileForm", async () => {
    const barrel = await import("../index");
    expect(barrel.SettingsPage).toBe(SettingsPage);
    expect(barrel.ProfileForm).toBe(ProfileForm);
  });
});
