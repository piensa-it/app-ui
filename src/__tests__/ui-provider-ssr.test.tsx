// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { UiProvider } from "../components/providers/ui-provider";

// Entorno `node` a propósito: sin `window` ni `document`, como en Astro,
// `vite build --ssr` o cualquier prerenderizado (#183).
describe("UiProvider — render de servidor", () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ["sin densidad", undefined],
    ["con densidad", "compact" as const],
  ])("renderiza %s sin errores ni avisos", (_, density) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const html = renderToString(
      <UiProvider density={density}>
        <p>hola</p>
      </UiProvider>,
    );

    expect(html).toContain("<p>hola</p>");
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });
});
