import { render, screen } from "@testing-library/react";
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
});
