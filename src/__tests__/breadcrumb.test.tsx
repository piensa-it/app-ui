import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "../components/ui/breadcrumb";

describe("Breadcrumb", () => {
  it("es un nav con nombre accesible", () => {
    render(<Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Perfil" }]} />);
    expect(screen.getByRole("navigation", { name: "Ruta de navegación" })).toBeInTheDocument();
  });

  it("acepta un aria-label propio", () => {
    render(
      <Breadcrumb aria-label="Migas de pan" items={[{ label: "Inicio", href: "/" }, { label: "Perfil" }]} />,
    );
    expect(screen.getByRole("navigation", { name: "Migas de pan" })).toBeInTheDocument();
  });

  it("marca el último paso con aria-current=page, tenga o no href", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Clientes", href: "/clientes" },
          { label: "Factura #4021", href: "/clientes/facturas/4021" },
        ]}
      />,
    );
    const current = screen.getByText("Factura #4021");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.tagName).not.toBe("A");
  });

  it("los pasos intermedios con href se pintan como link", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Clientes", href: "/clientes" },
          { label: "Empresas ACME", href: "/clientes/acme" },
          { label: "Factura #4021" },
        ]}
      />,
    );
    const link = screen.getByRole("link", { name: "Clientes" });
    expect(link).toHaveAttribute("href", "/clientes");
  });

  it("un paso sin href se pinta como texto, nunca como link muerto", () => {
    render(<Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Perfil" }]} />);
    expect(screen.queryByRole("link", { name: "Perfil" })).not.toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
  });

  it("usa el linkComponent inyectado en vez de <a> por defecto", () => {
    const CustomLink = ({ to, children, ...rest }: { to: string; children: ReactNode }) => (
      <a href={to} data-router-link="true" {...rest}>
        {children}
      </a>
    );
    render(
      <Breadcrumb
        linkComponent={CustomLink}
        items={[{ label: "Clientes", href: "/clientes" }, { label: "ACME" }]}
      />,
    );
    expect(screen.getByRole("link", { name: "Clientes" })).toHaveAttribute("data-router-link", "true");
  });
});
