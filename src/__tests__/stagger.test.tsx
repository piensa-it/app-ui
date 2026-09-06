import fs from "node:fs";
import path from "node:path";
import { Dialog } from "../components/ui/dialog";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Stagger } from "@/components/ui/stagger";

describe("Stagger", () => {
  it("asigna retrasos incrementales a cada hijo", () => {
    render(
      <Stagger gap={80} data-testid="grupo">
        <span>Uno</span>
        <span>Dos</span>
        <span>Tres</span>
      </Stagger>,
    );

    const items = screen.getByTestId("grupo").querySelectorAll("[data-ui-stagger-item]");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveStyle({ "--ui-stagger-delay": "0ms" });
    expect(items[1]).toHaveStyle({ "--ui-stagger-delay": "80ms" });
    expect(items[2]).toHaveStyle({ "--ui-stagger-delay": "160ms" });
  });

  it("aplica itemClassName al envoltorio y omite hijos nulos", () => {
    render(
      <Stagger data-testid="grupo" itemClassName="h-full">
        <span>Uno</span>
        {null}
        {false}
        <span>Dos</span>
      </Stagger>,
    );

    const items = screen.getByTestId("grupo").querySelectorAll("[data-ui-stagger-item]");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveClass("h-full");
    expect(items[1]).toHaveStyle({ "--ui-stagger-delay": "60ms" });
  });
});

/**
 * Un hijo que no pinta nada dejaba un envoltorio vacío que igual cobraba el
 * ritmo vertical de `space-y`: huecos de 24 px entre bloques que sí se ven.
 * En MiDivisa, cabecera y tabla a 48 px en todas las pantallas que montan su
 * modal entre las dos (#91). La hoja oculta el envoltorio `:empty`; aquí se
 * comprueba que el envoltorio queda vacío de verdad en los tres casos y que la
 * regla existe, porque jsdom no aplica `:empty`.
 */
describe("Stagger · un hijo que no pinta nada no deja hueco", () => {
  const envoltorios = (container: HTMLElement) =>
    Array.from(container.querySelectorAll("[data-ui-stagger-item]")) as HTMLElement[];

  it("un modal cerrado deja su envoltorio vacío, sin nodos", () => {
    const { container } = render(
      <Stagger>
        <h1>Cabecera</h1>
        <Dialog open={false} onOpenChange={() => {}}>
          <p>Detalle</p>
        </Dialog>
        <p>Tabla</p>
      </Stagger>,
    );
    const [, modal] = envoltorios(container);
    // Ni texto ni comentario: solo así `:empty` lo alcanza.
    expect(modal.childNodes.length).toBe(0);
  });

  it("un `null` y un Fragment vacío también", () => {
    const { container } = render(
      <Stagger>
        <h1>Cabecera</h1>
        {null}
        <></>
        <p>Tabla</p>
      </Stagger>,
    );
    const items = envoltorios(container);
    // `null` ni siquiera cuenta como hijo; el Fragment vacío sí, y queda vacío.
    expect(items).toHaveLength(3);
    expect(items[1].childNodes.length).toBe(0);
  });

  it("la hoja de Stagger oculta el envoltorio vacío", () => {
    const css = fs.readFileSync(path.join(process.cwd(), "src/components/ui/motion.css"), "utf8");
    expect(css).toMatch(/\[data-ui-stagger\] > \[data-ui-stagger-item\]:empty\s*\{\s*display: none;/);
  });
});
