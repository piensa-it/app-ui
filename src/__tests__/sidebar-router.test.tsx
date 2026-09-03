import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, NavLink, Route, Routes } from "react-router-dom";

import { AppShell } from "../components/layout/app-shell";
import { SidebarBrand } from "../components/layout/sidebar-brand";
import { SidebarNav, SidebarNavItem } from "../components/layout/sidebar-nav";

/**
 * `asChild` es la vía documentada para integrar el router de cada aplicación,
 * así que se prueba con un router de verdad y no con un `<a>` de mentira: el
 * fallo que motivó esta versión —el enlace del consumidor sin ninguna clase—
 * solo se ve al pasar por aquí.
 */
function App() {
  return (
    <MemoryRouter initialEntries={["/inicio"]}>
      <AppShell
        brand={<SidebarBrand name="Acme" />}
        sidebar={
          <SidebarNav>
            {[
              { to: "/inicio", label: "Inicio" },
              { to: "/movimientos", label: "Movimientos" },
            ].map((item) => (
              <SidebarNavItem key={item.to} asChild icon={<span />}>
                <NavLink to={item.to}>
                  <span>{item.label}</span>
                </NavLink>
              </SidebarNavItem>
            ))}
          </SidebarNav>
        }
      >
        <Routes>
          <Route path="/inicio" element={<h1>Página de inicio</h1>} />
          <Route path="/movimientos" element={<h1>Página de movimientos</h1>} />
        </Routes>
      </AppShell>
    </MemoryRouter>
  );
}

describe("SidebarNavItem con React Router", () => {
  it("el NavLink recibe el estilo del menú", () => {
    render(<App />);
    const link = screen.getAllByRole("link", { name: "Inicio" })[0];
    expect(link).toHaveClass("flex", "items-center", "rounded-md");
    // Y conserva lo suyo: NavLink marca el destino actual con `.active`.
    expect(link.className).toContain("active");
  });

  it("navega y cambia el contenido", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("heading", { name: "Página de inicio" })).toBeInTheDocument();

    await user.click(screen.getAllByRole("link", { name: "Movimientos" })[0]);
    expect(screen.getByRole("heading", { name: "Página de movimientos" })).toBeInTheDocument();
  });

  it("el estado activo se puede tomar del propio router", () => {
    render(
      <MemoryRouter initialEntries={["/movimientos"]}>
        <AppShell
          brand={<SidebarBrand name="Acme" />}
          sidebar={
            <SidebarNav>
              <SidebarNavItem asChild icon={<span />}>
                <NavLink to="/movimientos">
                  <span>Movimientos</span>
                </NavLink>
              </SidebarNavItem>
            </SidebarNav>
          }
        >
          <p>Contenido</p>
        </AppShell>
      </MemoryRouter>,
    );
    // `NavLink` ya pone aria-current cuando la ruta coincide.
    expect(screen.getAllByRole("link", { name: "Movimientos" })[0]).toHaveAttribute("aria-current", "page");
  });
});
