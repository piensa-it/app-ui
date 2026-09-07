import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SidebarIdentity } from "../components/layout/sidebar-identity";

const empresas = [
  { value: "acme", label: "Acme S.A.", badge: { label: "UAT", tone: "warning" as const } },
  { value: "globex", label: "Globex Ltda.", description: "Sucursal norte" },
];

/**
 * Sistema, empresa y módulo en la cabecera del menú (#119). Lo que se fija:
 * los tres, con el rótulo en el nombre del control; el módulo opcional sin
 * hueco; el cambio que notifica con el valor; el desvío por `onSelect` sin
 * montar menú; y que plegado la marca conserva el nombre y el disparador.
 */
describe("SidebarIdentity", () => {
  it("muestra sistema, empresa y módulo; el rótulo forma parte del nombre del control", () => {
    render(
      <SidebarIdentity
        system={{ name: "MiDivisa" }}
        company={{ caption: "Empresa", value: "acme", options: empresas, onChange: () => {} }}
        module={{ caption: "Módulo", value: "tesoreria", label: "Tesorería" }}
      />,
    );
    expect(screen.getByText("MiDivisa")).toBeInTheDocument();
    expect(screen.getByText("MI")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Empresa.*Acme S\.A\./ })).toBeInTheDocument();
    // Sin opciones ni desvío, el módulo es una etiqueta, no un control.
    expect(screen.getByText("Tesorería")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    // El distintivo sale de la opción elegida.
    expect(screen.getByText("UAT")).toBeInTheDocument();
  });

  it("el módulo es opcional y `environment` explícito manda sobre el derivado", () => {
    render(<SidebarIdentity system={{ name: "Lynx" }} environment={{ label: "LOCAL" }} company={{ caption: "Empresa", value: "acme", options: empresas }} />);
    expect(screen.queryByText(/Módulo/)).not.toBeInTheDocument();
    expect(screen.getByText("LOCAL")).toBeInTheDocument();
    expect(screen.queryByText("UAT")).not.toBeInTheDocument();
  });

  it("cambiar de empresa abre el menú con las opciones y notifica con el valor", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SidebarIdentity system={{ name: "MiDivisa" }} company={{ caption: "Empresa", value: "acme", options: empresas, onChange }} />);
    await user.click(screen.getByRole("button", { name: /Empresa/ }));
    const globex = await screen.findByRole("menuitemradio", { name: /Globex/ });
    expect(screen.getByRole("menuitemradio", { name: /Acme/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Sucursal norte")).toBeInTheDocument();
    await user.click(globex);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("globex"));
  });

  it("con `onSelect` el segmento desvía a la aplicación y no monta menú", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SidebarIdentity system={{ name: "CoreLink" }} module={{ caption: "Módulo", value: "ventas", label: "Ventas", onSelect }} />);
    const boton = screen.getByRole("button", { name: /Módulo.*Ventas/ });
    expect(boton).toHaveAttribute("aria-haspopup", "dialog");
    await user.click(boton);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("plegado deja la marca con sistema y empresa en el nombre, y sigue abriendo el menú de empresa", async () => {
    const user = userEvent.setup();
    render(
      <SidebarIdentity
        collapsed
        system={{ name: "MiDivisa" }}
        company={{ caption: "Empresa", value: "acme", options: empresas, onChange: () => {} }}
        module={{ caption: "Módulo", value: "tesoreria", label: "Tesorería" }}
      />,
    );
    const marca = screen.getByRole("button", { name: "MiDivisa · Acme S.A. · Tesorería" });
    expect(marca.textContent).not.toContain("Acme");
    await user.click(marca);
    expect(await screen.findByRole("menuitemradio", { name: /Globex/ })).toBeInTheDocument();
  });

  it("plegado sin nada que elegir, la marca es solo una imagen con nombre", () => {
    render(<SidebarIdentity collapsed system={{ name: "Lynx" }} company={{ caption: "Empresa", value: "acme", label: "Acme S.A." }} />);
    expect(screen.getByRole("img", { name: "Lynx · Acme S.A." })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
