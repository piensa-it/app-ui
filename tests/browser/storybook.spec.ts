import { expect, test, type Page } from "@playwright/test";

const storyUrl = (id: string, globals = "theme:light;palette:indigo;fontFamily:geist") => {
  const query = new URLSearchParams({ id, viewMode: "story", globals });
  return `/iframe.html?${query.toString()}`;
};

const stabilize = async (page: Page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        caret-color: transparent !important;
        transition: none !important;
      }
    `,
  });
  await page.evaluate(() => document.fonts.ready);
};

test.describe("Storybook browser gate", () => {
  test("keeps all button variants visually stable", async ({ page }) => {
    await page.goto(storyUrl("ui-button--todas-las-variantes"));
    await stabilize(page);

    const story = page.locator("#storybook-root");
    await expect(story.getByRole("button", { name: "Solid" })).toBeVisible();
    await expect(story).toHaveScreenshot("button-variants.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    });
  });

  test("opens, focuses and closes the Ark UI dialog", async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", (error) => errors.push(error));
    await page.goto(storyUrl("ui-dialog--default"));

    await page.getByRole("button", { name: "Abrir diálogo" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "¿Confirmar acción?" })).toBeVisible();
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Abrir diálogo" })).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("disables shared motion when reduced motion is preferred", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(storyUrl("primitivas-motion--basico"));

    const motion = page.locator('[data-ui-motion="float"]');
    await expect(motion).toBeVisible();
    expect(
      await page.evaluate(() =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    ).toBe(true);
    await expect(motion).toHaveCSS("animation-name", "none");
  });

  test("keeps the animated banner visually stable", async ({ page }) => {
    await page.goto(storyUrl("contenedores-animatedbanner--exito"));
    await stabilize(page);

    const story = page.locator("#storybook-root");
    await expect(page.getByText("La configuración quedó lista")).toBeVisible();
    await expect(story).toHaveScreenshot("animated-banner-success.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    });
  });
});
