import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AppShell } from "../components/layout/app-shell";
import { SidebarNav, SidebarNavItem } from "../components/layout/sidebar-nav";

/**
 * La barra de acento del enlace activo es un token de anchura
 * (`--sidebar-active-bar`), no una prop: el enlace siempre la pinta y de
 * fábrica mide cero. Así un estilo (`data-ui-look="soft"`) o la aplicación la
 * activan sin que `SidebarNavItem` sepa en qué estilo está (#109).
 */
describe("SidebarNavItem · barra de acento del activo", () => {
  const montar = () =>
    render(
      <AppShell
        sidebar={
          <SidebarNav>
            <SidebarNavItem href="/inicio" active icon={<span />}>
              Inicio
            </SidebarNavItem>
            <SidebarNavItem href="/otra" icon={<span />}>
              Otra
            </SidebarNavItem>
          </SidebarNav>
        }
      >
        <p>Contenido</p>
      </AppShell>,
    );

  it("el activo pinta la barra con la anchura del token y el color del anillo", () => {
    montar();
    const activo = screen.getByRole("link", { name: "Inicio" });
    expect(activo).toHaveAttribute("aria-current", "page");
    expect(activo.className).toContain("inset-shadow-[var(--sidebar-active-bar)_0_0_0_hsl(var(--sidebar-ring))]");
  });

  it("los enlaces en reposo no la llevan", () => {
    montar();
    expect(screen.getByRole("link", { name: "Otra" }).className).not.toContain("--sidebar-active-bar");
  });
});
