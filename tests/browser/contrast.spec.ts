import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";

/**
 * `color-contrast` está desactivada en `accessibility-overlays.test.tsx` y
 * en `accessibility.test.tsx` (Vitest + jsdom): jsdom no tiene motor de
 * layout ni rasterizador — `getComputedStyle` no resuelve la composición
 * final de colores (herencia, capas superpuestas, gradientes), así que axe
 * no puede calcular una relación de contraste real ahí. Este archivo es
 * donde SÍ se puede: Playwright renderiza con Chromium de verdad, con el
 * mismo motor que ve una persona usuaria. Cubre el segundo criterio de
 * aceptación de #53 ("existe una comprobación de contraste sobre
 * componentes renderizados, no solo sobre tokens" — antes solo existía
 * `design-tokens.test.ts`, que compara valores declarados, no lo que
 * termina pintado en pantalla).
 *
 * Restringido a `color-contrast` (vía `runOnly`): las demás reglas de axe ya
 * se comprueban en Vitest, más rápido y sin depender de un navegador.
 */
const AXE_SOURCE = fs.readFileSync(
  fileURLToPath(new URL("../../node_modules/axe-core/axe.min.js", import.meta.url)),
  "utf-8",
);

const storyUrl = (id: string, globals = "theme:light;palette:indigo;fontFamily:geist") => {
  const query = new URLSearchParams({ id, viewMode: "story", globals });
  return `/iframe.html?${query.toString()}`;
};

/**
 * Mismo problema que `stabilize()` en `storybook.spec.ts`, pero para color en
 * vez de posición: Dialog, Sheet, Popover y Menu entran con
 * `fade-in`/`zoom-in` (`dialogContentAnimation`, `popoverAnimation`...). Si
 * axe mide contraste mientras esa animación sigue interpolando la opacidad,
 * `getComputedStyle`/el muestreo de píxeles de axe capturan un color a medio
 * camino entre el texto y el fondo — un gris lavado que no es ni el color de
 * reposo ni uno real que alguien vea. Comprobado en este mismo archivo: sin
 * esto, "Popover abierto" y "Menu abierto" fallaban con colores que no
 * coinciden con ningún token de `globals.css` (`#787878`/`#e0574e` sobre
 * fondos ~blancos); con las transiciones apagadas, esos mismos overlays
 * miden negro-sobre-blanco real y pasan. Es un falso positivo del entorno de
 * prueba (el momento exacto del scan, no el navegador ni axe), documentado
 * aquí en vez de silenciado con `rules: { "color-contrast": { enabled:
 * false } }` — apagar la regla habría ocultado tanto el falso positivo como
 * un contraste real roto.
 */
const stabilize = (page: Page) =>
  page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    `,
  });

async function expectNoContrastViolations(page: Page) {
  await page.addScriptTag({ content: AXE_SOURCE });
  const violations = await page.evaluate(async () => {
    // @ts-expect-error — axe se inyecta como global vía el script tag de arriba.
    const result = await window.axe.run(document.body, { runOnly: ["color-contrast"] });
    return result.violations.map((violation: { id: string; nodes: { target: string[] }[] }) => ({
      id: violation.id,
      targets: violation.nodes.map((node) => node.target.join(" ")),
    }));
  });
  expect(violations).toEqual([]);
}

test.describe("Contraste de color sobre componentes renderizados", () => {
  test("botones (todas las variantes)", async ({ page }) => {
    await page.goto(storyUrl("ui-button--todas-las-variantes"));
    await stabilize(page);
    await expectNoContrastViolations(page);
  });

  test("Dialog abierto", async ({ page }) => {
    await page.goto(storyUrl("ui-dialog--default"));
    await stabilize(page);
    await page.getByRole("button", { name: "Abrir diálogo" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectNoContrastViolations(page);
  });

  test("Sheet abierto", async ({ page }) => {
    await page.goto(storyUrl("ui-sheet--default"));
    await stabilize(page);
    await page.getByRole("button", { name: "Abrir panel" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectNoContrastViolations(page);
  });

  test("Popover abierto", async ({ page }) => {
    await page.goto(storyUrl("ui-popover--default"));
    await stabilize(page);
    await page.getByRole("button", { name: "Ver detalles" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectNoContrastViolations(page);
  });

  test("Menu abierto", async ({ page }) => {
    await page.goto(storyUrl("ui-menu--default"));
    await stabilize(page);
    await page.getByRole("button", { name: "Más opciones" }).click();
    await expect(page.getByRole("menuitem", { name: "Editar" })).toBeVisible();
    await expectNoContrastViolations(page);
  });

  test("Tooltip visible", async ({ page }) => {
    await page.goto(storyUrl("ui-tooltip--default"));
    await stabilize(page);
    await page.getByRole("button", { name: "Guardar" }).hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await expectNoContrastViolations(page);
  });

  test("AlertDialog abierto", async ({ page }) => {
    await page.goto(storyUrl("ui-alertdialog--default"));
    await stabilize(page);
    await page.getByRole("button", { name: "Eliminar" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expectNoContrastViolations(page);
  });

  test("Toast visible", async ({ page }) => {
    await page.goto(storyUrl("ui-toast--default"));
    await stabilize(page);
    await page.getByRole("button", { name: "Error" }).click();
    await expect(page.getByRole("status")).toBeVisible();
    await expectNoContrastViolations(page);
  });

  test("Dialog abierto en modo oscuro", async ({ page }) => {
    await page.goto(storyUrl("ui-dialog--default", "theme:dark;palette:indigo;fontFamily:geist"));
    await stabilize(page);
    await page.getByRole("button", { name: "Abrir diálogo" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectNoContrastViolations(page);
  });
});
