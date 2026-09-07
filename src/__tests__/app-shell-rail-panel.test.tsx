import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppShell } from "../components/layout/app-shell";
import { SidebarBrand } from "../components/layout/sidebar-brand";
import { SidebarNav, SidebarNavGroup, SidebarNavItem } from "../components/layout/sidebar-nav";

beforeEach(() => window.localStorage.clear());

/**
 * Dos niveles (#114): el riel lleva los módulos y el panel de sección, el
 * árbol del módulo activo. Plegar oculta solo el panel; el riel nunca se
 * oculta. Sin `rail`, `rail-panel` es un riel a secas.
 */
const Modulos = () => (
  <SidebarNav>
    <SidebarNavItem icon={<span />} active>
      Tesorería
    </SidebarNavItem>
    <SidebarNavItem icon={<span />}>Cartera</SidebarNavItem>
  </SidebarNav>
);

const Arbol = () => (
  <SidebarNav>
    <SidebarNavGroup label="Operación">
      <SidebarNavItem icon={<span />} active>
        Movimientos
      </SidebarNavItem>
      <SidebarNavItem icon={<span />}>Arqueo</SidebarNavItem>
    </SidebarNavGroup>
  </SidebarNav>
);

const shell = (props: Partial<React.ComponentProps<typeof AppShell>> = {}) => (
  <AppShell layout="rail-panel" rail={<Modulos />} panelTitle="Tesorería" brand={<SidebarBrand name="Acme" />} sidebar={<Arbol />} {...props}>
    <p>Contenido</p>
  </AppShell>
);

describe("AppShell · rail-panel", () => {
  it("pinta riel y panel como dos landmarks con nombre distinto", () => {
    render(shell());
    const modulos = screen.getByRole("navigation", { name: "Módulos" });
    const seccion = screen.getByRole("navigation", { name: "Navegación de Tesorería" });
    expect(within(modulos).getByRole("link", { name: "Tesorería" })).toHaveAttribute("aria-current", "page");
    expect(within(modulos).getByRole("link", { name: "Tesorería" }).className).toMatch(/\bflex-col\b/);
    expect(within(seccion).getByRole("link", { name: "Movimientos" })).toHaveAttribute("aria-current", "page");
    // En el panel el árbol se lee como siempre: etiqueta al lado, grupos con título.
    expect(within(seccion).getByRole("link", { name: "Movimientos" }).className).not.toMatch(/\bflex-col\b/);
    expect(within(seccion).getByText("Operación")).toBeInTheDocument();
    expect(screen.getByText("Tesorería", { selector: "p" })).toBeInTheDocument();
  });

  it("el panel es claro por defecto y el riel sigue oscuro; `sidebarTone` manda", () => {
    const { container, rerender } = render(shell());
    const panel = screen.getByRole("navigation", { name: "Navegación de Tesorería" }).closest("[data-sidebar]");
    expect(panel).toHaveAttribute("data-sidebar-tone", "light");
    expect(container.querySelector("aside")).not.toHaveAttribute("data-sidebar-tone");
    rerender(shell({ sidebarTone: "dark" }));
    expect(screen.getByRole("navigation", { name: "Navegación de Tesorería" }).closest("[data-sidebar]")).not.toHaveAttribute("data-sidebar-tone");
  });

  it("plegar oculta el panel y deja el riel; se recuerda con `storageKey`", async () => {
    const user = userEvent.setup();
    const { unmount } = render(shell({ storageKey: "acme" }));
    const toggle = screen.getByRole("button", { name: "Ocultar el panel" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.click(toggle);
    expect(screen.queryByRole("navigation", { name: "Navegación de Tesorería" })).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Módulos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mostrar el panel" })).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(window.localStorage.getItem("ui-shell:acme:collapsed")).toBe("true"));
    unmount();

    render(shell({ storageKey: "acme" }));
    expect(screen.queryByRole("navigation", { name: "Navegación de Tesorería" })).not.toBeInTheDocument();
  });

  it("en móvil, un solo panel con los módulos arriba y el árbol debajo", async () => {
    const user = userEvent.setup();
    render(shell());
    await user.click(screen.getByRole("button", { name: "Abrir el menú" }));
    const panel = await screen.findByRole("dialog");
    const modulos = within(panel).getByRole("navigation", { name: "Módulos (panel)" });
    const seccion = within(panel).getByRole("navigation", { name: "Navegación de Tesorería (panel)" });
    // Con sitio, los módulos se leen con la etiqueta al lado.
    expect(within(modulos).getByRole("link", { name: "Cartera" }).className).not.toMatch(/\bflex-col\b/);
    expect(within(seccion).getByRole("link", { name: "Arqueo" })).toBeInTheDocument();
    // Navegar desde el panel lo cierra, como siempre.
    await user.click(within(seccion).getByRole("link", { name: "Arqueo" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("sin `rail`, `rail-panel` es un riel a secas", () => {
    render(shell({ rail: undefined, panelTitle: undefined }));
    expect(screen.queryByRole("button", { name: /Ocultar el panel|Mostrar el panel|Plegar el menú|Desplegar el menú/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Módulos" })).not.toBeInTheDocument();
    const link = screen.getAllByRole("link", { name: "Movimientos" })[0];
    expect(link.className).toMatch(/\bflex-col\b/);
  });

  it("los cuatro landmarks de navegación tienen nombres distintos", async () => {
    const user = userEvent.setup();
    const { container } = render(shell());
    // Solo los de este armazón: el panel móvil de otra prueba puede seguir
    // en el DOM mientras termina su animación de cierre.
    const fijos = within(container).getAllByRole("navigation").map((nav) => nav.getAttribute("aria-label"));
    await user.click(screen.getByRole("button", { name: "Abrir el menú" }));
    const panel = await screen.findByRole("dialog");
    const moviles = within(panel).getAllByRole("navigation").map((nav) => nav.getAttribute("aria-label"));
    const nombres = [...fijos, ...moviles];
    expect(nombres).toHaveLength(4);
    expect(new Set(nombres).size).toBe(4);
  });
});
