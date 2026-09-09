import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthLayout } from "../components/layout/auth-layout";

/**
 * El armazón de la pantalla de entrada (#130). Lo estructural se prueba
 * aquí; que el panel de la derecha desaparezca de verdad por debajo de `md`
 * se comprueba en el navegador (`tests/browser/storybook.spec.ts`), porque
 * jsdom no aplica media queries y aquí solo se vería la clase.
 */
describe("AuthLayout", () => {
  it("coloca marca, formulario, pie y panel", () => {
    render(
      <AuthLayout brand={<span>Marca</span>} aside={<span>Panel</span>} footer={<span>Pie</span>}>
        <form aria-label="Entrar" />
      </AuthLayout>,
    );

    expect(screen.getByText("Marca")).toBeInTheDocument();
    expect(screen.getByText("Panel")).toBeInTheDocument();
    expect(screen.getByText("Pie")).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Entrar" })).toBeInTheDocument();
  });

  it("el formulario vive en un <main>, y la marca y el pie fuera de él", () => {
    render(
      <AuthLayout brand={<span>Marca</span>} footer={<span>Pie</span>}>
        <span>Formulario</span>
      </AuthLayout>,
    );

    const main = screen.getByRole("main");
    expect(main).toContainElement(screen.getByText("Formulario"));
    expect(main).not.toContainElement(screen.getByText("Marca"));
    expect(main).not.toContainElement(screen.getByText("Pie"));
  });

  it("marca, pie y panel son opcionales, y sin ellos no queda hueco", () => {
    const { container } = render(
      <AuthLayout>
        <span>Formulario</span>
      </AuthLayout>,
    );

    // Solo la columna izquierda: sin `aside` no se pinta la segunda columna,
    // que si no dejaría media pantalla en blanco.
    expect(container.firstElementChild!.children).toHaveLength(1);
    expect(screen.getByRole("main")).toContainElement(screen.getByText("Formulario"));
  });

  it("el panel no se esconde de los lectores de pantalla: puede llevar contenido con sentido", () => {
    render(
      <AuthLayout aside={<a href="/ayuda">Ayuda</a>}>
        <span>Formulario</span>
      </AuthLayout>,
    );

    // En pantalla estrecha el panel *no existe* (media query), que es
    // distinto de existir escondido con `aria-hidden`.
    expect(screen.getByRole("link", { name: "Ayuda" })).toBeInTheDocument();
  });

  it("acepta className y atributos propios del contenedor", () => {
    const { container } = render(
      <AuthLayout className="bg-brand" data-testid="entrada">
        <span>Formulario</span>
      </AuthLayout>,
    );

    expect(container.firstElementChild).toHaveClass("bg-brand");
    expect(screen.getByTestId("entrada")).toBe(container.firstElementChild);
  });
});
