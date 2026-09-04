import { expect, test, type Page } from "@playwright/test";

const storyUrl = (id: string, globals = "theme:light;palette:indigo;fontFamily:geist") => {
  const query = new URLSearchParams({ id, viewMode: "story", globals });
  return `/iframe.html?${query.toString()}`;
};

/**
 * Tolerancia de las capturas comparadas, en píxeles.
 *
 * El problema no era la cota sino la unidad y la plataforma. Medido sobre este
 * repositorio, con el comparador de Playwright:
 *
 * - Señal: los dos fallos de la marca plegada —descentrada respecto de los
 *   iconos, y la versión desbordando el componente— movieron **518 px** de una
 *   captura de 1.280×900.
 * - Ruido: la misma tira de botones renderizada en macOS y en el Linux de CI
 *   difiere en **963 px**, todos en el contorno de las letras.
 *
 * O sea que comparando una plataforma contra otra el ruido casi duplica la
 * señal, y ninguna cota las separa: 0,01 dejaba pasar los fallos y 0,001
 * tampoco los habría visto (son 1.150 px, más que los 518 que cambiaron), pero
 * sí tropezaba con las fuentes. Por eso cada plataforma compara ahora contra su
 * propia referencia (`{platform}` en `snapshotPathTemplate`): sin ruido de
 * rasterizado, un margen pequeño basta y vuelve a detectar lo que debe.
 */
const MAX_DIFF_PIXELS = 120;

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
      maxDiffPixels: MAX_DIFF_PIXELS,
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

  test("opens and selects an Ark Select nested inside the dialog", async ({ page }) => {
    const errors: Error[] = [];
    // El runtime de Storybook instrumenta `HTMLElement.prototype.focus` con un getter y
    // Zag (`@zag-js/focus-visible`) lo dispara al abrir cualquier Select — también fuera
    // de un diálogo. Es ruido del entorno, no de la librería: se ignora solo ese caso.
    page.on("pageerror", (error) => {
      if (error.message.includes("Illegal invocation")) return;
      errors.push(error);
    });
    await page.goto(storyUrl("ui-dialog--con-select-dentro"));

    await page.getByRole("button", { name: "Abrir formulario" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("combobox", { name: "Ciudad" }).click();
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    await listbox.getByRole("option", { name: "Medellín" }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId("ciudad-elegida")).toHaveText("Elegida: medellin");
    await expect(listbox).toBeHidden();
    expect(errors).toEqual([]);
  });

  test("staggers children and stands still under reduced motion", async ({ page }) => {
    await page.goto(storyUrl("ui-stagger--default"));
    const items = page.locator("[data-ui-stagger-item]");
    await expect(items).toHaveCount(4);
    expect(await items.nth(0).evaluate((el) => getComputedStyle(el).animationDelay)).toBe("0s");
    expect(await items.nth(2).evaluate((el) => getComputedStyle(el).animationDelay)).toBe("0.16s");
    await expect(items.nth(3)).toBeVisible();

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(storyUrl("ui-stagger--default"));
    expect(
      await page.locator("[data-ui-stagger-item]").first().evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
    await expect(page.locator("[data-ui-stagger-item]").first()).toBeVisible();
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
      maxDiffPixels: MAX_DIFF_PIXELS,
    });
  });
});

test.describe("Tokens", () => {
  // Un cambio de token afecta a tres aplicaciones a la vez. Esta captura es la
  // red que evita enterarse en producción: cubre los tres niveles de la escala
  // de superficies, sus bordes y sombras, y controles reales encima.
  for (const theme of ["light", "dark"] as const) {
    test(`la escala de superficies se mantiene estable en tema ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("tokens-superficies--escala", `theme:${theme};palette:indigo;fontFamily:geist`));
      await stabilize(page);
      await expect(page.locator("#storybook-root")).toHaveScreenshot(`surfaces-${theme}.png`, {
        animations: "disabled",
        maxDiffPixels: MAX_DIFF_PIXELS,
      });
    });
  }
});

test.describe("Armazón", () => {
  // Los fallos de tipografía y de `asChild` de la 0.4.0 eran de bulto y se
  // veían a simple vista, pero ninguna prueba de tipos los detecta. Estas
  // capturas los habrían frenado antes de publicar.
  const shellStories = [
    ["armazon-completo", "layout-appshell--default"],
    ["armazon-plegado", "layout-appshell--plegado"],
    ["armazon-router", "layout-appshell--con-router"],
    ["armazon-secciones", "layout-appshell--secciones-plegables"],
    // Seis secciones: es donde se ve si el menú agrupa o se lee como una lista.
    ["armazon-menu-largo", "layout-appshell--menu-largo"],
  ] as const;

  for (const [name, id] of shellStories) {
    test(`${name} se mantiene visualmente estable`, async ({ page }) => {
      await page.goto(storyUrl(id));
      await stabilize(page);
      await expect(page.locator("#storybook-root")).toHaveScreenshot(`${name}.png`, {
        animations: "disabled",
        maxDiffPixels: MAX_DIFF_PIXELS,
      });
    });
  }
});

test.describe("Capas encadenadas (Dialog → Sheet)", () => {
  test("el panel abierto desde un diálogo que se cierra sigue abierto y el foco no lo cierra", async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", (error) => errors.push(error));
    await page.goto(storyUrl("ui-dialog--abre-un-sheet"));

    await page.getByRole("button", { name: "Radicar documento" }).click();
    const dialog = page.getByRole("dialog", { name: "Radicar documento" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Confirmar y ver radicado" }).click();

    const sheet = page.getByRole("dialog", { name: "Radicado 2026-0917" });
    await expect(sheet).toBeVisible();
    await expect(dialog).toBeHidden();
    // Da tiempo a la animación de salida del diálogo y a su devolución de foco.
    await page.waitForTimeout(600);
    await expect(sheet).toBeVisible();

    // El foco fuera del panel tampoco lo cierra. El botón de origen queda
    // aria-hidden bajo el panel modal (`hideOthers`), así que se busca
    // incluyendo elementos ocultos para el árbol de accesibilidad.
    await page.getByRole("button", { name: "Radicar documento", includeHidden: true }).focus();
    await page.waitForTimeout(400);
    await expect(sheet).toBeVisible();

    // Escape sí cierra.
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    expect(errors).toEqual([]);
  });
});

test.describe("AppSwitcher", () => {
  // El fallo original: un desplegable de 921 px en una ventana de 800, con
  // las últimas opciones inalcanzables. La ventana no debe crecer con el
  // contenido; es la lista la que se desplaza. Se prueba a 700 px de alto.
  test("con quince opciones y 700 px de alto se llega a todas", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 700 });
    await page.goto(storyUrl("ui-appswitcher--quince-opciones"));
    await stabilize(page);

    const dialogo = page.getByRole("dialog");
    await expect(dialogo).toBeVisible();
    const caja = await dialogo.boundingBox();
    expect(caja).not.toBeNull();
    expect(caja!.y + caja!.height).toBeLessThanOrEqual(700);

    // 15 opciones más 2 recientes: de los tres recientes, la activa se excluye.
    await expect(page.getByRole("option")).toHaveCount(17);
  });

  test("se escribe, se navega con las flechas y se confirma con Enter sin soltar el buscador", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 700 });
    await page.goto(storyUrl("ui-appswitcher--quince-opciones"));
    await stabilize(page);

    const buscador = page.getByRole("combobox");
    await expect(buscador).toBeFocused();
    await buscador.fill("cuentas");
    await buscador.press("ArrowDown");
    await expect(buscador).toBeFocused();
    await buscador.press("Enter");
    await expect(page.getByText("Módulo activo: cxp")).toBeVisible();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("la última opción se alcanza con el teclado y queda a la vista", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 700 });
    await page.goto(storyUrl("ui-appswitcher--quince-opciones"));
    await stabilize(page);

    // Ark enfoca el buscador después de montar: pulsar antes de que llegue el
    // foco deja la tecla en el vacío, y en el runner de CI llega más tarde.
    const buscador = page.getByRole("combobox");
    await expect(buscador).toBeFocused();
    await buscador.press("End");
    const ultima = page.getByRole("option", { name: /Ajustes/ }).last();
    await expect(ultima).toBeInViewport();
    await expect(ultima).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("AppSwitcher · confirmación", () => {
  test("el segundo paso vive en la misma ventana y se puede volver", async ({ page }) => {
    await page.goto(storyUrl("ui-appswitcher--empresas"));
    await stabilize(page);

    await page.getByRole("option", { name: /Beta/ }).click();
    await expect(page.getByRole("heading", { name: "Cambiar a Beta S.A.S." })).toBeVisible();
    await expect(page.getByText("800.000.000-2")).toBeVisible();
    // No hay segunda capa modal: es el mismo diálogo en su segundo paso.
    await expect(page.getByRole("dialog")).toHaveCount(1);

    await page.getByRole("button", { name: /Volver/ }).click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByText("Empresa activa: acme")).toBeVisible();

    await page.getByRole("option", { name: /Beta/ }).click();
    await page.getByRole("button", { name: "Cambiar de empresa" }).click();
    await expect(page.getByText("Empresa activa: beta")).toBeVisible();
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
