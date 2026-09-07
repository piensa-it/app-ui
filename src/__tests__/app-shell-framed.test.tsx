import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AppShell } from "../components/layout/app-shell";
import { SidebarBrand } from "../components/layout/sidebar-brand";
import { SidebarNav, SidebarNavItem } from "../components/layout/sidebar-nav";

/**
 * Enmarcado (#118): el menú encierra el contenido. La raíz es del color del
 * menú y la página va dentro como un panel redondeado con margen, que es
 * quien se desplaza. En móvil no hay marco.
 */
const shell = (props: Partial<React.ComponentProps<typeof AppShell>> = {}) => (
  <AppShell
    layout="framed"
    brand={<SidebarBrand name="Acme" />}
    sidebar={
      <SidebarNav>
        <SidebarNavItem icon={<span />} active>
          Inicio
        </SidebarNavItem>
      </SidebarNav>
    }
    {...props}
  >
    <p>Contenido</p>
  </AppShell>
);

describe("AppShell · framed", () => {
  it("la raíz lleva el color y los tokens del menú; el menú pierde el borde", () => {
    const { container } = render(shell({ variant: "ink" }));
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-layout", "framed");
    expect(root).toHaveAttribute("data-sidebar", "ink");
    expect(root.className).toMatch(/\bbg-sidebar\b/);
    expect(root.className).not.toMatch(/\bbg-ground\b/);
    expect(container.querySelector("aside")!.className).not.toMatch(/\bborder-r\b/);
  });

  it("la página va dentro de un panel redondeado sobre ground que se desplaza por sí mismo, solo en escritorio", () => {
    const { container } = render(shell());
    const panel = container.querySelector("[data-ui-shell-frame]")!;
    for (const clase of ["bg-ground", "md:rounded-xl", "md:overflow-y-auto"]) {
      expect(panel.className, clase).toContain(clase);
    }
    expect(panel.className).not.toMatch(/(^|\s)rounded-xl\b/);
    expect(panel.contains(screen.getByRole("banner"))).toBe(true);
    expect(panel.contains(screen.getByRole("main"))).toBe(true);
  });

  it("la barra superior es la propia página: sin superficie ni borde", () => {
    render(shell());
    const barra = screen.getByRole("banner");
    expect(barra.className).toMatch(/\bbg-ground\b/);
    expect(barra.className).not.toMatch(/\bborder-b\b/);
  });

  it("sin la prop, no hay marco ni tokens del menú en la raíz", () => {
    const { container } = render(shell({ layout: undefined }));
    expect(container.firstElementChild).not.toHaveAttribute("data-sidebar");
    expect(container.querySelector("[data-ui-shell-frame]")).toBeNull();
  });

  it("se pliega y se combina con el tono claro como cualquier otra forma", () => {
    const { container } = render(shell({ sidebarTone: "light", defaultCollapsed: true }));
    expect(container.querySelector("aside")).toHaveAttribute("data-sidebar-tone", "light");
    expect(container.querySelector("aside")).toHaveAttribute("data-state", "collapsed");
    expect(screen.getByRole("button", { name: "Desplegar el menú" })).toBeInTheDocument();
  });
});
