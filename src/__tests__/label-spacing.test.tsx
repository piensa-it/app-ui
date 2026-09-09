import { beforeAll, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { compilarTailwind } from "../test/compilar-tailwind";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";

/**
 * Compila el CSS real de `Label` e `Input`: lo que se comprueba aquí es un
 * `display` calculado, y eso solo lo da el CSS de verdad, no la lista de
 * clases del componente.
 */
beforeAll(async () => {
  const css = await compilarTailwind({
    fuentes: ["src/components/ui/label.tsx", "src/components/ui/input.tsx"],
  });
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
});

describe("Label dentro de `space-y-*` (#123)", () => {
  it("no es inline: un margen vertical en un elemento inline no le abre hueco", () => {
    const { container } = render(
      <div className="space-y-1.5">
        <Label htmlFor="idioma">Idioma</Label>
        <Input id="idioma" />
      </div>,
    );
    const label = container.querySelector("label") as HTMLElement;
    // `<label>` es `inline` de fábrica (es su valor inicial de `display`, sin
    // ninguna hoja de la librería encima). Tailwind 4 pone `space-y-*` como
    // margen entre hermanos, y un margen vertical en un elemento inline no
    // cuenta: por eso el bug era justamente que quedara en `inline`.
    expect(getComputedStyle(label).display).not.toBe("inline");
  });
});
