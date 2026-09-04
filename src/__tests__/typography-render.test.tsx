import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { compilarTailwind } from "../test/compilar-tailwind";

import { AppVersion } from "../components/layout/app-version";
import { SidebarBrand } from "../components/layout/sidebar-brand";
import { SidebarNav, SidebarNavItem } from "../components/layout/sidebar-nav";

/**
 * Compila el CSS real de Tailwind sobre el fuente de la librería y lo inyecta
 * en jsdom, que sí resuelve el cascade en `getComputedStyle`.
 *
 * Comprobar la lista de clases no habría servido de nada: el fallo era que
 * `cn` descartaba la clase de tamaño antes de llegar al DOM. Lo único que lo
 * detecta es mirar el tamaño que acaba teniendo el texto.
 */
beforeAll(async () => {
  const css = await compilarTailwind({ fuentes: ["src/components/**/*.tsx"] });
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
});

/**
 * jsdom no resuelve `var()` al calcular estilos: devuelve la referencia tal
 * cual. Sirve igual para lo que se comprueba aquí, que es si la clase de tamaño
 * llegó al elemento o si `cn` se la comió por el camino.
 */
const fontSize = (element: Element) => getComputedStyle(element).fontSize;

describe("la escala tipográfica llega al DOM", () => {
  it("un enlace del menú mide lo que dice la escala, no lo que hereda del documento", () => {
    // Suelto y no dentro de `AppShell`: con el CSS real, el menú de escritorio
    // está oculto al ancho por defecto de jsdom y el enlace no sería visible.
    render(
      <SidebarNav>
        <SidebarNavItem icon={<span />}>Inicio</SidebarNavItem>
      </SidebarNav>,
    );
    // Sin la corrección no había ninguna regla de tamaño y el enlace heredaba
    // los 16 px del documento en vez de los 14 de `ui-body-sm`.
    expect(fontSize(screen.getAllByRole("link", { name: "Inicio" })[0])).toBe("var(--font-size-body-sm)");
  });

  it("el distintivo de entorno conserva su tamaño junto a su color", () => {
    render(<SidebarBrand name="Acme" environment={{ label: "Pruebas", tone: "warning" }} />);
    expect(fontSize(screen.getByText("Pruebas"))).toBe("var(--font-size-caption)");
  });

  it("la línea de versión conserva su tamaño aunque herede el color", () => {
    const { container } = render(<AppVersion version="1.0.0" />);
    expect(fontSize(container.firstElementChild!)).toBe("var(--font-size-caption)");
  });
});
