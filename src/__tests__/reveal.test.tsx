import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Reveal } from "@/components/ui/reveal";

type IOCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

let lastCallback: IOCallback | null = null;
const disconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: IOCallback) {
    lastCallback = callback;
  }
  observe() {}
  disconnect = disconnect;
}

describe("Reveal", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    lastCallback = null;
    disconnect.mockClear();
  });

  it("queda pendiente hasta entrar al viewport y entonces anima con `enter`", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    render(<Reveal data-testid="bloque">Contenido</Reveal>);

    const el = screen.getByTestId("bloque");
    expect(el).toHaveAttribute("data-ui-reveal", "pending");
    expect(el).not.toHaveAttribute("data-ui-motion");

    act(() => lastCallback?.([{ isIntersecting: true }]));
    expect(el).toHaveAttribute("data-ui-reveal", "visible");
    expect(el).toHaveAttribute("data-ui-motion", "enter");
    // once=true por defecto: al revelarse deja de observar.
    expect(disconnect).toHaveBeenCalled();
  });

  it("sin IntersectionObserver muestra el contenido directamente", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Reveal data-testid="bloque">Contenido</Reveal>);
    expect(screen.getByTestId("bloque")).toHaveAttribute("data-ui-reveal", "visible");
  });
});
