import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SidebarBrand } from "../components/layout/sidebar-brand";

/**
 * `SidebarBrand` solo sabía abrir su propio menú, y elegir no siempre es
 * cambiar de pestaña: cambiar de empresa cambia los datos, los permisos y quién
 * emite lo que se factura, así que necesita una ventana con sitio para el NIT,
 * el rol y una confirmación.
 *
 * Sin poder desviar el disparador, la aplicación tiene que dejar de usar el
 * componente y duplicar el bloque de marca para que la cabecera se siga viendo
 * igual. Es lo que pasó en CoreLink, y esa copia se desvía del original en
 * cuanto la librería lo retoca (#75).
 */
describe("SidebarBrand · el disparador se puede desviar", () => {
  it("con `onSelect` el botón llama a la aplicación", async () => {
    const abrir = vi.fn();
    render(<SidebarBrand name="Acme S.A." onSelect={abrir} />);
    await userEvent.click(screen.getByRole("button", { name: /Acme/ }));
    expect(abrir).toHaveBeenCalledTimes(1);
  });

  it("anuncia que abre una ventana, no un menú", async () => {
    render(<SidebarBrand name="Acme S.A." onSelect={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Acme/ })).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("conserva el aspecto: marca, nombre y distintivo", () => {
    render(
      <SidebarBrand
        name="Acme S.A."
        environment={{ label: "UAT", tone: "warning" }}
        onSelect={vi.fn()}
      />,
    );
    const boton = screen.getByRole("button", { name: /Acme/ });
    // Las iniciales y el distintivo viven dentro del mismo control, que es lo
    // que la aplicación estaba reproduciendo a mano.
    expect(boton).toHaveTextContent("AC");
    expect(boton).toHaveTextContent("Acme S.A.");
    expect(boton).toHaveTextContent("UAT");
  });

  it("sin nada que elegir no pinta ningún control", () => {
    // La regla que ya mandaba sin `groups` sigue mandando: un selector de un
    // elemento es ruido. La aplicación lo expresa pasando `onSelect` undefined.
    render(<SidebarBrand name="Acme S.A." onSelect={undefined} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Acme S.A.")).toBeInTheDocument();
  });

  it("manda sobre `groups`: no se monta el menú propio", async () => {
    const abrir = vi.fn();
    const cambiar = vi.fn();
    render(
      <SidebarBrand
        name="Acme S.A."
        onSelect={abrir}
        groups={[
          {
            id: "empresa",
            label: "Empresa",
            value: "a",
            onChange: cambiar,
            options: [
              { value: "a", label: "Acme S.A." },
              { value: "b", label: "Otra S.A.S." },
            ],
          },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Acme/ }));
    expect(abrir).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("sin `onSelect` el menú propio sigue funcionando", async () => {
    render(
      <SidebarBrand
        name="Acme S.A."
        groups={[
          {
            id: "empresa",
            label: "Empresa",
            value: "a",
            options: [
              { value: "a", label: "Acme S.A." },
              { value: "b", label: "Otra S.A.S." },
            ],
          },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Acme/ }));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });
});
