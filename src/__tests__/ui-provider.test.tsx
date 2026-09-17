import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { UiProvider } from "../components/providers/ui-provider";

describe("UiProvider — densidad", () => {
  it("no marca densidad cuando no se pide", () => {
    const { container } = render(<UiProvider><p>Hola</p></UiProvider>);
    expect(container.querySelector("[data-ui-density]")).toBeNull();
    expect(screen.getByText("Hola")).toBeInTheDocument();
  });

  it("marca la densidad elegida para toda la aplicación", () => {
    const { container } = render(
      <UiProvider density="compact">
        <p>Hola</p>
      </UiProvider>,
    );
    expect(container.querySelector("[data-ui-density]")).toHaveAttribute("data-ui-density", "compact");
    expect(screen.getByText("Hola")).toBeInTheDocument();
  });

  it("la densidad se puede acotar a una parte de la interfaz", () => {
    const { container } = render(
      <UiProvider>
        <p>Cabecera</p>
        <UiProvider density="compact">
          <p>Tabla</p>
        </UiProvider>
      </UiProvider>,
    );
    const marked = container.querySelectorAll("[data-ui-density]");
    expect(marked).toHaveLength(1);
    expect(marked[0]).toHaveTextContent("Tabla");
    expect(marked[0]).not.toHaveTextContent("Cabecera");
  });
});

describe("tokens de densidad", () => {
  it("compact reduce la altura de los controles y el relleno", async () => {
    const { readFileSync } = await import("node:fs");
    const path = await import("node:path");
    const css = readFileSync(path.resolve(process.cwd(), "src/styles/globals.css"), "utf8");
    const block = css.slice(css.indexOf('[data-ui-density="compact"]'));
    expect(block).toMatch(/--control-default:/);
    expect(block).toMatch(/--space-inset:/);
    expect(css).toContain('[data-ui-density="comfortable"]');
  });
});

describe("UiProvider — hidratación", () => {
  it("hidrata el HTML del servidor sin avisos (#183)", async () => {
    const { renderToString } = await import("react-dom/server");
    const { hydrateRoot } = await import("react-dom/client");
    const { act } = await import("react");
    const { vi } = await import("vitest");
    const app = (
      <UiProvider density="compact">
        <p>hola</p>
      </UiProvider>
    );
    const container = document.createElement("div");
    // React 18 avisa por `useLayoutEffect` al renderizar en servidor dentro de
    // jsdom (Ark ve un `document`); en Node no pasa, y eso lo cubre
    // `ui-provider-ssr.test.tsx`. Aquí solo se vigila la hidratación.
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});
    container.innerHTML = renderToString(app);
    silencio.mockRestore();
    document.body.appendChild(container);

    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const root = await act(async () => hydrateRoot(container, app));

    expect(error).not.toHaveBeenCalled();
    expect(container).toHaveTextContent("hola");
    act(() => root.unmount());
    container.remove();
    error.mockRestore();
  });
});
