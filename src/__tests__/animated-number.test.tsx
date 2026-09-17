import { StrictMode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AnimatedNumber } from "@/components/ui/animated-number";

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
}

describe("AnimatedNumber", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("con prefers-reduced-motion muestra el valor final de inmediato", () => {
    stubReducedMotion(true);
    render(<AnimatedNumber value={1234567} data-testid="cifra" />);
    expect(screen.getByTestId("cifra")).toHaveTextContent((1234567).toLocaleString());
  });

  it("respeta un formato propio y usa cifras tabulares", () => {
    stubReducedMotion(true);
    render(<AnimatedNumber value={92} format={(v) => `${Math.round(v)}%`} data-testid="cifra" />);
    const el = screen.getByTestId("cifra");
    expect(el).toHaveTextContent("92%");
    expect(el).toHaveClass("tabular-nums");
  });

  it("con animateOnMount desactivado arranca en el valor final", () => {
    stubReducedMotion(false);
    render(<AnimatedNumber value={500} animateOnMount={false} data-testid="cifra" />);
    expect(screen.getByTestId("cifra")).toHaveTextContent("500");
  });

  it("bajo StrictMode termina en el valor final, no se queda en 0 (#180)", async () => {
    stubReducedMotion(false);
    // StrictMode monta, limpia y remonta el efecto. El bug: la limpieza
    // cancelaba la animación con el estado aún en 0, y el remonte veía el
    // destino ya marcado y no volvía a animar. `duration={0}` usa la rama
    // inmediata, así se reproduce sin depender del reloj de la animación.
    render(
      <StrictMode>
        <AnimatedNumber value={3072} duration={0} data-testid="cifra" />
      </StrictMode>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("cifra")).toHaveTextContent((3072).toLocaleString());
    });
  });
});
