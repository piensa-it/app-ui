import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedBanner } from "@/components/ui/animated-banner";
import { Illustration } from "@/components/ui/illustration";

describe("contenedores de movimiento", () => {
  it("aplica movimiento y tamaño a una ilustración", () => {
    render(
      <Illustration size="lg" motion="float">
        <svg aria-label="Ilustración" />
      </Illustration>,
    );

    const container = screen.getByLabelText("Ilustración").parentElement;
    expect(container).toHaveAttribute("data-ui-motion", "float");
    expect(container).toHaveClass("w-64");
  });

  it("renderiza un banner destructivo como alerta", () => {
    render(
      <AnimatedBanner title="No se pudo guardar" variant="destructive" motion="none">
        Inténtalo nuevamente.
      </AnimatedBanner>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar");
  });
});
