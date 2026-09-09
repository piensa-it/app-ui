import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PublicFooter } from "../components/marketing/PublicFooter";
import type { LinkComponent } from "../components/marketing/PublicHeader";

const LinkDeMentira: LinkComponent = ({ to, children, ...rest }) => (
  <a href={to} data-router="propio" {...rest}>
    {children}
  </a>
);

describe("PublicFooter", () => {
  it("renderiza marca, descripción y el copyright con el año actual", () => {
    render(<PublicFooter logoSrc="/logo.svg" brandName="Piensa IT" description="Software a medida." />);
    expect(screen.getByText("Piensa IT")).toBeInTheDocument();
    expect(screen.getByText("Software a medida.")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
  });

  it("columns, legalLinks y socialLinks son opcionales — no aparecen si se omiten", () => {
    render(<PublicFooter logoSrc="/logo.svg" brandName="Piensa IT" description="Software a medida." />);
    expect(screen.queryByText("Legal")).not.toBeInTheDocument();
    expect(screen.queryByText("Síguenos")).not.toBeInTheDocument();
  });

  it("pinta columnas de producto con sus links", () => {
    render(
      <PublicFooter
        logoSrc="/logo.svg"
        brandName="Piensa IT"
        description="Software a medida."
        columns={[{ title: "Producto", links: [{ to: "/precios", label: "Precios" }] }]}
      />,
    );
    expect(screen.getByText("Producto")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Precios" })).toHaveAttribute("href", "/precios");
  });

  it("un legalLink con onClick renderiza un botón, no un link — para abrir modales (ej. cookies)", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <PublicFooter
        logoSrc="/logo.svg"
        brandName="Piensa IT"
        description="Software a medida."
        legalLinks={[{ label: "Preferencias de cookies", onClick }]}
      />,
    );
    const boton = screen.getByRole("button", { name: "Preferencias de cookies" });
    await user.click(boton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("linkComponent inyectado se usa para las columnas — sin acoplar a un router", () => {
    render(
      <PublicFooter
        logoSrc="/logo.svg"
        brandName="Piensa IT"
        description="Software a medida."
        columns={[{ title: "Producto", links: [{ to: "/precios", label: "Precios" }] }]}
        linkComponent={LinkDeMentira}
      />,
    );
    expect(screen.getByRole("link", { name: "Precios" })).toHaveAttribute("data-router", "propio");
  });

  it("socialLinks se renderizan como links accesibles con su aria-label", () => {
    render(
      <PublicFooter
        logoSrc="/logo.svg"
        brandName="Piensa IT"
        description="Software a medida."
        socialLinks={[{ href: "https://x.com/piensait", label: "X (Twitter)", icon: <span>x</span> }]}
      />,
    );
    expect(screen.getByRole("link", { name: "X (Twitter)" })).toHaveAttribute("href", "https://x.com/piensait");
  });
});
