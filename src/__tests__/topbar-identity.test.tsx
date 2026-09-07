import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TopbarIdentity } from "../components/layout/topbar-identity";

const empresas = [
  { value: "acme", label: "Acme S.A.", badge: { label: "UAT", tone: "warning" as const } },
  { value: "globex", label: "Globex Ltda.", description: "Sucursal norte" },
];

/**
 * Sistema · empresa · módulo en la barra superior (#119). Lo que se fija:
 * tres segmentos con nombre accesible que lleva el rótulo, el módulo
 * opcional sin hueco, el cambio que notifica con el valor, y el desvío por
 * `onSelect` sin montar menú.
 */
describe("TopbarIdentity", () => {
  it("muestra sistema, empresa y módulo; el rótulo forma parte del nombre del control", () => {
    render(
      <TopbarIdentity
        system={{ name: "MiDivisa" }}
        company={{ caption: "Empresa", value: "acme", options: empresas, onChange: () => {} }}
        module={{ caption: "Módulo", value: "tesoreria", label: "Tesorería" }}
      />,
    );
    expect(screen.getByText("MiDivisa")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Empresa.*Acme S\.A\./ })).toBeInTheDocument();
    // Sin opciones ni desvío, el módulo es una etiqueta, no un control.
    expect(screen.getByText("Tesorería")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    // El distintivo sale de la opción elegida.
    expect(screen.getByText("UAT")).toBeInTheDocument();
  });

  it("el módulo es opcional y sin él no queda ningún hueco", () => {
    const { container } = render(<TopbarIdentity system={{ name: "Lynx" }} company={{ caption: "Empresa", value: "acme", options: empresas }} />);
    expect(screen.queryByText(/Módulo/)).not.toBeInTheDocument();
    // Un separador por segmento presente: uno.
    expect(container.querySelectorAll("svg.lucide-chevron-right")).toHaveLength(1);
  });

  it("cambiar de empresa abre el menú con las opciones y notifica con el valor", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TopbarIdentity system={{ name: "MiDivisa" }} company={{ caption: "Empresa", value: "acme", options: empresas, onChange }} />);
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
    render(<TopbarIdentity system={{ name: "CoreLink" }} module={{ caption: "Módulo", value: "ventas", label: "Ventas", onSelect }} />);
    const boton = screen.getByRole("button", { name: /Módulo.*Ventas/ });
    expect(boton).toHaveAttribute("aria-haspopup", "dialog");
    await user.click(boton);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
