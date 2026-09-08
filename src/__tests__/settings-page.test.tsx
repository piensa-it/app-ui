import { render, screen } from "@testing-library/react";
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
    expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute("data-selected");
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
    expect(screen.getByRole("tab", { name: "Apariencia" })).toHaveAttribute("data-selected");
    await user.click(screen.getByRole("tab", { name: "Cuenta" }));
    expect(onSectionChange).toHaveBeenCalledWith("account");
    expect(screen.getByRole("tab", { name: "Apariencia" })).toHaveAttribute("data-selected");
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
