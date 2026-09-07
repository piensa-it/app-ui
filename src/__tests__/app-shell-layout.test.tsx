import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppShell } from "../components/layout/app-shell";
import { SidebarBrand } from "../components/layout/sidebar-brand";
import { SidebarNav, SidebarNavItem } from "../components/layout/sidebar-nav";
import { SidebarProfile } from "../components/layout/sidebar-profile";

/**
 * La forma del armazón es elegible (#113): flotante, riel, tono claro,
 * perfil en el menú y buscador centrado. Todo opcional: sin las props nuevas
 * el marcado es el de siempre, y eso lo cubren los tests de `app-shell`.
 */
const Navegacion = () => (
  <SidebarNav>
    <SidebarNavItem icon={<span data-testid="icono" />} active>
      Inicio
    </SidebarNavItem>
    <SidebarNavItem icon={<span />}>Movimientos</SidebarNavItem>
  </SidebarNav>
);

const shell = (props: Partial<React.ComponentProps<typeof AppShell>> = {}) => (
  <AppShell brand={<SidebarBrand name="Acme" />} sidebar={<Navegacion />} {...props}>
    <p>Contenido</p>
  </AppShell>
);

describe("AppShell · layout", () => {
  it("sin la prop, es `docked` y no hay tono declarado", () => {
    const { container } = render(shell());
    expect(container.firstElementChild).toHaveAttribute("data-layout", "docked");
    expect(container.querySelector("aside")).not.toHaveAttribute("data-sidebar-tone");
    expect(container.querySelector("aside")!.className).toMatch(/\bborder-r\b/);
  });

  it("flotante: la columna es transparente y la tarjeta de dentro lleva fondo, borde, radio y sombra", () => {
    const { container } = render(shell({ layout: "floating" }));
    const aside = container.querySelector("aside")!;
    expect(container.firstElementChild).toHaveAttribute("data-layout", "floating");
    expect(aside.className).not.toMatch(/\bbg-sidebar\b/);
    expect(aside.className).not.toMatch(/\bborder-r\b/);
    const tarjeta = container.querySelector("aside > div")!;
    for (const clase of ["bg-sidebar", "rounded-xl", "shadow-raised", "sticky"]) {
      expect(tarjeta.className, clase).toContain(clase);
    }
  });

  it("riel: siempre plegado, sin botón de plegar, y la etiqueta se ve bajo el icono", () => {
    const { container } = render(shell({ layout: "rail" }));
    expect(screen.queryByRole("button", { name: /Plegar el menú|Desplegar el menú/ })).not.toBeInTheDocument();
    expect(container.querySelector("aside")).toHaveAttribute("data-state", "collapsed");
    const link = screen.getAllByRole("link", { name: "Inicio" })[0];
    expect(link).toHaveAttribute("aria-current", "page");
    // La etiqueta no va a `sr-only`: se ve, bajo el icono.
    expect(link.querySelector(".sr-only")).toBeNull();
    expect(link.className).toMatch(/\bflex-col\b/);
    expect(link).not.toHaveAttribute("title");
  });

  it("riel: en el panel móvil el menú se abre como siempre, con la etiqueta al lado", async () => {
    const user = userEvent.setup();
    render(shell({ layout: "rail" }));
    await user.click(screen.getByRole("button", { name: "Abrir el menú" }));
    const panel = await screen.findByRole("dialog");
    const link = within(panel).getByRole("link", { name: "Inicio" });
    expect(link.className).not.toMatch(/\bflex-col\b/);
  });

  it("el tono claro viaja en un atributo, también al panel móvil", async () => {
    const user = userEvent.setup();
    const { container } = render(shell({ sidebarTone: "light" }));
    expect(container.querySelector("aside")).toHaveAttribute("data-sidebar-tone", "light");
    await user.click(screen.getByRole("button", { name: "Abrir el menú" }));
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-sidebar-tone", "light");
  });

  it("el tono claro toma los tokens de la página y gana a las variantes en los dos temas", () => {
    const css = readFileSync(path.resolve(process.cwd(), "src/styles/globals.css"), "utf8");
    const bloque = /\[data-sidebar\]\[data-sidebar-tone="light"\],\s*\.dark \[data-sidebar\]\[data-sidebar-tone="light"\]\s*\{([^}]*)\}/.exec(css);
    expect(bloque).not.toBeNull();
    expect(bloque![1]).toContain("--sidebar: var(--raised)");
    expect(bloque![1]).toContain("--sidebar-active: var(--subtle)");
    // Después de las variantes oscuras: es lo que le da la última palabra.
    expect(css.indexOf('.dark [data-sidebar="smoke"]')).toBeLessThan(css.indexOf('[data-sidebar][data-sidebar-tone="light"]'));
  });

  it("`topbarCenter` va en la barra superior, entre el inicio y el final", () => {
    render(
      shell({
        topbarStart: <span>Inicio de barra</span>,
        topbarCenter: <input aria-label="Buscar" />,
        topbar: <button type="button">Perfil</button>,
      }),
    );
    const barra = screen.getByRole("banner");
    const orden = [
      within(barra).getByText("Inicio de barra"),
      within(barra).getByRole("textbox", { name: "Buscar" }),
      within(barra).getByRole("button", { name: "Perfil" }),
    ].map((el) => Array.from(barra.querySelectorAll("*")).indexOf(el));
    expect(orden[0]).toBeLessThan(orden[1]);
    expect(orden[1]).toBeLessThan(orden[2]);
  });
});

describe("SidebarProfile", () => {
  it("muestra avatar con iniciales, nombre y descripción, sin ningún control", () => {
    render(<SidebarProfile name="Janice Chandler" description="Contadora" />);
    expect(screen.getByText("JC")).toBeInTheDocument();
    expect(screen.getByText("Janice Chandler")).toBeInTheDocument();
    expect(screen.getByText("Contadora")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("con `onClick` es un botón que abre lo que la aplicación quiera", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SidebarProfile name="Janice Chandler" onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: /Janice Chandler/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("plegado deja el avatar con el nombre accesible", () => {
    render(<SidebarProfile name="Janice Chandler" description="Contadora" collapsed onClick={() => {}} />);
    const boton = screen.getByRole("button", { name: "Janice Chandler" });
    expect(boton.textContent).not.toContain("Janice Chandler");
    expect(screen.queryByText("Contadora")).not.toBeInTheDocument();
  });

  it("dentro de `AppShell` se pliega solo, sin que nadie le pase el estado", () => {
    render(
      <AppShell defaultCollapsed brand={<SidebarProfile name="Janice Chandler" description="Contadora" />} sidebar={<Navegacion />}>
        <p>Contenido</p>
      </AppShell>,
    );
    // El fijo va plegado; el móvil no se ha abierto.
    expect(screen.queryByText("Contadora")).not.toBeInTheDocument();
  });

  it("el color del avatar es el de la persona, o el de marca si no tiene", () => {
    const { rerender } = render(<SidebarProfile name="Ana Ruiz" />);
    expect(screen.getByText("AR").closest("[class*='bg-primary']")).not.toBeNull();
    rerender(<SidebarProfile name="Ana Ruiz" avatarColor="200 60% 40%" />);
    expect(screen.getByText("AR").closest("[style]")).toHaveStyle({ backgroundColor: "hsl(200 60% 40%)" });
  });
});
