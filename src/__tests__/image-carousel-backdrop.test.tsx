import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { ImageCarouselBackdrop } from "../components/marketing/ImageCarouselBackdrop";

describe("ImageCarouselBackdrop", () => {
  it("pinta la primera imagen como fondo", () => {
    const { container } = render(<ImageCarouselBackdrop images={["/a.jpg", "/b.jpg"]} />);
    const capa = container.querySelector('[style*="background-image"]');
    expect(capa).toHaveStyle({ backgroundImage: "url(/a.jpg)" });
  });

  it("variant=duotone pinta el overlay de color y los círculos de glow por defecto", () => {
    const { container } = render(<ImageCarouselBackdrop images={["/a.jpg"]} variant="duotone" />);
    expect(container.querySelector(".bg-primary\\/45")).toBeInTheDocument();
  });

  it("variant=hero no pinta el overlay duotone ni los círculos de glow por defecto", () => {
    const { container } = render(<ImageCarouselBackdrop images={["/a.jpg"]} variant="hero" />);
    expect(container.querySelector(".bg-primary\\/45")).not.toBeInTheDocument();
  });

  it("con una sola imagen, no crea un temporizador de rotación", () => {
    const spy = vi.spyOn(globalThis, "setInterval");
    render(<ImageCarouselBackdrop images={["/a.jpg"]} />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  describe("rotación con varias imágenes", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("rota a la siguiente imagen tras intervalMs y vuelve a la primera al llegar al final", () => {
      // AnimatePresence (mode="popLayout") mantiene la capa saliente en el DOM
      // mientras se desvanece — la entrante convive con ella un instante, así
      // que se comprueba que la nueva capa aparece, no que sea la única.
      const { container } = render(
        <ImageCarouselBackdrop images={["/a.jpg", "/b.jpg"]} intervalMs={1000} />,
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(container.querySelector('[style*="/b.jpg"]')).not.toBeNull();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(container.querySelector('[style*="/a.jpg"]')).not.toBeNull();
    });
  });
});
