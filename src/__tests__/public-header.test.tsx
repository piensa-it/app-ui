import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PublicHeader, type LinkComponent } from "../components/marketing/PublicHeader";

const LinkDeMentira: LinkComponent = ({ to, children, ...rest }) => (
  <a href={to} data-router="propio" {...rest}>
    {children}
  </a>
);

describe("PublicHeader", () => {
  it("renderiza logo, marca y nav de escritorio", () => {
    const { container } = render(
      <PublicHeader
        logoSrc="/logo.svg"
        brandName="Piensa IT"
        desktopNav={<a href="/precios">Precios</a>}
        mobileNav={<a href="/precios">Precios</a>}
      />,
    );
    expect(screen.getByText("Piensa IT")).toBeInTheDocument();
    // alt="" es intencional (logo decorativo junto al nombre de marca en texto):
    // role "img" no aplica, así que se verifica el <img> directamente.
    expect(container.querySelector("img")).toHaveAttribute("src", "/logo.svg");
    expect(screen.getByRole("link", { name: "Precios" })).toBeInTheDocument();
  });

  it("sin linkComponent, el logo usa un <a> nativo apuntando a homeHref", () => {
    render(
      <PublicHeader
        logoSrc="/logo.svg"
        brandName="Piensa IT"
        homeHref="/inicio"
        desktopNav={null}
        mobileNav={null}
      />,
    );
    const enlaces = screen.getAllByRole("link");
    expect(enlaces[0]).toHaveAttribute("href", "/inicio");
  });

  it("linkComponent inyectado se usa en vez del <a> por defecto — sin acoplar a un router", () => {
    render(
      <PublicHeader
        logoSrc="/logo.svg"
        brandName="Piensa IT"
        linkComponent={LinkDeMentira}
        desktopNav={null}
        mobileNav={null}
      />,
    );
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("data-router", "propio");
  });

  it("el botón móvil abre y cierra el nav móvil", async () => {
    const user = userEvent.setup();
    render(
      <PublicHeader
        logoSrc="/logo.svg"
        brandName="Piensa IT"
        desktopNav={null}
        mobileNav={<a href="/precios">Precios móvil</a>}
      />,
    );

    expect(screen.queryByText("Precios móvil")).not.toBeInTheDocument();

    const boton = screen.getByRole("button", { name: "Abrir menú" });
    await user.click(boton);
    expect(screen.getByText("Precios móvil")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar menú" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar menú" }));
    expect(screen.queryByText("Precios móvil")).not.toBeInTheDocument();
  });

  it("badge y crossLink son opcionales y solo aparecen si se pasan", () => {
    const { rerender } = render(
      <PublicHeader logoSrc="/logo.svg" brandName="Piensa IT" desktopNav={null} mobileNav={null} />,
    );
    expect(screen.queryByText("Personas")).not.toBeInTheDocument();

    rerender(
      <PublicHeader
        logoSrc="/logo.svg"
        brandName="Piensa IT"
        badge="Personas"
        crossLink={{ to: "/empresas", label: "Empresas" }}
        desktopNav={null}
        mobileNav={null}
      />,
    );
    expect(screen.getByText("Personas")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Empresas" }).length).toBeGreaterThan(0);
  });
});
