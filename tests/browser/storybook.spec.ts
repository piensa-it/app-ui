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

  test("keeps the settings page shell visually stable", async ({ page }) => {
    await page.goto(storyUrl("layout-settingspage--default"));
    await stabilize(page);

    const story = page.locator("#storybook-root");
    await expect(story.getByRole("tab", { name: "Cuenta" })).toBeVisible();
    await expect(story).toHaveScreenshot("settings-page.png", {
      animations: "disabled",
      maxDiffPixels: MAX_DIFF_PIXELS,
    });
  });

  // El pie «Guardando…» imita el estado deshabilitado con una clase en vez de
  // `disabled` nativo (ver el JSDoc de `Guardando` en settings-page.stories.tsx):
  // un cambio de clase que se equivoque de tono no lo vería ninguna otra prueba.
  test("keeps the settings page saving footer visually stable", async ({ page }) => {
    await page.goto(storyUrl("layout-settingspage--guardando"));
    await stabilize(page);

    const story = page.locator("#storybook-root");
    await expect(story.getByRole("button", { name: "Guardando…" })).toBeVisible();
    await expect(story).toHaveScreenshot("settings-page-saving.png", {
      animations: "disabled",
      maxDiffPixels: MAX_DIFF_PIXELS,
    });
  });

  // Ninguna de las stories de SettingsPage/ProfileForm (#124) tenía captura en
  // oscuro; el precedente es UserMenu/AppearanceSettings, que resuelven el
  // tema con el global `theme` en vez de una story dedicada. Esta reutiliza
  // la misma story "default" —trae `ProfileForm` en la pestaña «Cuenta»,
  // activa de entrada— así que una sola captura cubre los dos archivos.
  test("keeps the settings page shell visually stable in dark theme", async ({ page }) => {
    await page.goto(storyUrl("layout-settingspage--default", "theme:dark;palette:indigo;fontFamily:geist"));
    await stabilize(page);

    const story = page.locator("#storybook-root");
    await expect(story.getByRole("tab", { name: "Cuenta" })).toBeVisible();
    await expect(story).toHaveScreenshot("settings-page-dark.png", {
      animations: "disabled",
      maxDiffPixels: MAX_DIFF_PIXELS,
    });
  });

  // #132: la incidencia medía 959 px fijos de contenido de 1280 a 1920 px de
  // ventana, y ensanchar `PageContainer` a `wide` solo estiraba el control de
  // ~470 a ~780 px —peor, no mejor—. Esta story es `width="default"` a
  // propósito (`wide` es para secciones con tablas o rejillas anchas, no para
  // un formulario de campos, ver su JSDoc), así que la ventana de 1920 no
  // ensancha el contenedor —lo acota `PageContainer`—; lo que prueba es que
  // ensanchar la ventana no vuelve a estirar el control aunque el contenedor
  // se quede corto. Medido con la mutación real (quitar `max-w-md` del
  // control): 632 px, muy por encima del tope de 468 que afirma esta prueba
  // —sigue matando la mutación aunque el contenedor no sea `wide`—. Medir el
  // DOM en vez de comparar solo capturas es a propósito (ver el criterio de
  // aceptación de la incidencia): una captura no falla de forma legible
  // cuando algo se estira un poco, un `toBeLessThanOrEqual` sí.
  test("el control de un campo horizontal no crece más allá de su tope aunque la ventana sea de 1920 px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto(storyUrl("layout-settingspage--horizontal-con-descripciones"));
    await stabilize(page);

    const story = page.locator("#storybook-root");
    const nombre = story.getByLabel(/^Nombre/);
    await expect(nombre).toBeVisible();
    const caja = await nombre.boundingBox();
    expect(caja).not.toBeNull();
    // Tope real: 28rem (`max-w-md`, 448 px a 16 px de raíz). Un margen de
    // 20 px cubre el borde y cualquier redondeo del navegador sin dejar
    // pasar el bug (que estiraba el control a ~780 px a 1920 px de ventana
    // con `PageContainer` `wide`, y a 632 px incluso con `default`).
    expect(caja!.width).toBeLessThanOrEqual(468);
    // Cota inferior de cordura: que el tope no haya colapsado el control.
    expect(caja!.width).toBeGreaterThan(300);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`keeps the horizontal-with-descriptions settings page stable in ${theme} theme`, async ({ page }) => {
      await page.goto(
        storyUrl("layout-settingspage--horizontal-con-descripciones", `theme:${theme};palette:indigo;fontFamily:geist`),
      );
      await stabilize(page);

      const story = page.locator("#storybook-root");
      await expect(story.getByRole("tab", { name: "Cuenta" })).toBeVisible();
      await expect(story).toHaveScreenshot(`settings-page-horizontal-descriptions-${theme}.png`, {
        animations: "disabled",
        maxDiffPixels: MAX_DIFF_PIXELS,
      });
    });
  }

  // El tope de ancho de `Field` horizontal es una garantía del componente,
  // no de una página en particular: se comprueba aquí sobre
  // `ui-field--tope-de-ancho` (sin ningún `PageContainer` de por medio, ver
  // su JSDoc) para no mezclarlo con qué `width` conviene en una pantalla
  // real —eso es harina de otro costal (la prueba de arriba, sobre
  // `SettingsPage`)—. Cubre las dos columnas: medido con cada mutación por
  // separado, sin `max-w-md` el control mide 1398 px y sin el tope de la
  // columna del rótulo (volver a `0.4fr`) esa columna mide ~491 px — las dos
  // muy por encima de sus topes.
  test("Field mantiene los dos topes horizontales sin importar cuánto ancho le sobre al contenedor", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 900 });
    await page.goto(storyUrl("ui-field--tope-de-ancho"));
    await stabilize(page);

    const story = page.locator("#storybook-root");
    const control = story.locator("input");
    await expect(control).toBeVisible();
    const cajaControl = await control.boundingBox();
    expect(cajaControl).not.toBeNull();
    expect(cajaControl!.width).toBeLessThanOrEqual(468);
    expect(cajaControl!.width).toBeGreaterThan(300);

    const columnaDelRotulo = await control.evaluate((input) => {
      // `input` → el `div` que envuelve el control (columna 2) → la raíz de
      // `Field` (la rejilla de dos columnas) → su primer hijo, la columna
      // del rótulo (columna 1).
      const raizDelField = input.parentElement!.parentElement as HTMLElement;
      const columna = raizDelField.firstElementChild as HTMLElement;
      return columna.getBoundingClientRect().width;
    });
    // Tope real: 20rem = 320 px. Cota inferior subida a 280: a 160 px
    // (10rem, el mínimo de `minmax`) esta prueba tiene que fallar, no dejar
    // pasar un tope mucho más bajo que el que se documenta.
    expect(columnaDelRotulo).toBeLessThanOrEqual(340);
    expect(columnaDelRotulo).toBeGreaterThan(280);
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

test.describe("Checkbox — indeterminado (#144)", () => {
  // Ark expone el marcado visual del tercer estado (`data-state=indeterminate`,
  // el icono `Minus`) desde antes de esta incidencia — lo que faltaba, y lo
  // que un navegador real prueba mejor que jsdom, es la propiedad IDL
  // `.indeterminate` del input nativo: es la que el árbol de accesibilidad
  // traduce a `mixed` (comprobado con `element.evaluate` en el cuerpo de la
  // incidencia). Sin captura comparada: nada cambia en píxeles, el icono ya
  // se veía bien: lo que cambia es una propiedad del DOM, invisible a una
  // captura.
  test("el input nativo queda .indeterminate === true, no solo pintado", async ({ page }) => {
    await page.goto(storyUrl("ui-checkbox--indeterminado"));
    await stabilize(page);

    const checkbox = page.getByRole("checkbox", { name: "Seleccionar todo" });
    await expect(checkbox).toBeVisible();
    expect(await checkbox.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(true);

    // No hay `aria-checked="mixed"` como atributo: el navegador lo deriva
    // de `.indeterminate` para el árbol de accesibilidad (ver JSDoc de
    // `checked` en checkbox.tsx) — se comprueba en el snapshot de
    // accesibilidad, no en el DOM.
    await expect(checkbox).toMatchAriaSnapshot(`- checkbox "Seleccionar todo" [checked=mixed]`);
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

test.describe("Estilos visuales", () => {
  // Un estilo (`data-ui-look`) mueve solo neutros, radio, sombra y el activo
  // del menú. La prueba de tokens comprueba los números; esta captura fija
  // cómo se ven los cuatro, uno al lado del otro, en los dos temas (#109).
  for (const theme of ["light", "dark"] as const) {
    test(`los cuatro estilos se mantienen estables en tema ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("tokens-superficies--estilos", `theme:${theme};palette:indigo;fontFamily:geist`));
      await stabilize(page);
      await expect(page.locator("#storybook-root")).toHaveScreenshot(`looks-${theme}.png`, {
        animations: "disabled",
        maxDiffPixels: MAX_DIFF_PIXELS,
      });
    });
  }
});

test.describe("Laboratorio de movimiento", () => {
  // Con menos movimiento el laboratorio tiene que anunciarlo: los controles
  // siguen, nada se anima y la página lo dice arriba (#110). Se emula aquí
  // igual que en las pruebas de Motion: la preferencia del proyecto no llega
  // a `matchMedia`.
  test("con menos movimiento lo avisa y las cuatro secciones siguen ahí", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(storyUrl("guías-laboratorio-de-movimiento--laboratorio"));
    await stabilize(page);
    await expect(page.getByText("Tu sistema pide menos movimiento")).toBeVisible();
    for (const nombre of ["Entrada de página", "Énfasis", "Cifras", "Aparición al desplazar"]) {
      await expect(page.getByRole("region", { name: nombre })).toBeVisible();
    }
    await expect(page.getByText(/staggerGap=\{60\}/)).toBeVisible();
  });
});

test.describe("Armazón", () => {
  // Los fallos de tipografía y de `asChild` de la 0.4.0 eran de bulto y se
  // veían a simple vista, pero ninguna prueba de tipos los detecta. Estas
  // capturas los habrían frenado antes de publicar.
  const shellStories = [
    ["armazon-completo", "layout-appshell--default"],
    // La forma del armazón es elegible (#113): flotante, riel y tono claro
    // se fijan en claro; el resto de combinaciones son las mismas clases.
    ["armazon-flotante", "layout-appshell--menu-flotante"],
    ["armazon-riel", "layout-appshell--riel"],
    ["armazon-claro", "layout-appshell--menu-claro"],
    ["armazon-riel-panel", "layout-appshell--riel-con-panel"],
    ["armazon-enmarcado", "layout-appshell--enmarcado"],
    ["sidebar-identity", "layout-sidebaridentity--completo"],
    ["notifications-menu", "layout-notificationsmenu--abierto"],
    ["sidebar-search", "layout-sidebarsearch--filtrando"],
    ["screen-search", "layout-screensearch--en-la-barra"],
    ["armazon-plegado", "layout-appshell--plegado"],
    ["armazon-router", "layout-appshell--con-router"],
    ["armazon-secciones", "layout-appshell--secciones-plegables"],
    // Seis secciones: es donde se ve si el menú agrupa o se lee como una lista.
    ["armazon-menu-largo", "layout-appshell--menu-largo"],
  ] as const;

  // En oscuro el menú quedaba en un gris azulado al 13% junto a una página
  // neutra al 7%: más claro que ella y de otro tono. Estas dos capturas fijan
  // cómo se ven las tres variantes contra el tema oscuro.
  for (const [name, id] of [
    ["armazon-oscuro", "layout-appshell--default"],
    ["armazon-variantes-oscuro", "layout-appshell--variantes"],
  ] as const) {
    test(`${name} se mantiene visualmente estable`, async ({ page }) => {
      await page.goto(storyUrl(id, "theme:dark;palette:indigo;fontFamily:geist"));
      await stabilize(page);
      await expect(page.locator("#storybook-root")).toHaveScreenshot(`${name}.png`, {
        animations: "disabled",
        maxDiffPixels: MAX_DIFF_PIXELS,
      });
    });
  }

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

test.describe("PageContainer · bloque vacío", () => {
  // Medido en MiDivisa: cabecera y tabla a 48 px en vez de 24, por un modal
  // cerrado montado entre las dos. jsdom no aplica `:empty`; esto sí lo mide.
  test("un modal cerrado entre dos bloques no separa más de un paso de ritmo", async ({ page }) => {
    await page.goto(storyUrl("layout-pagecontainer--bloque-vacio"));
    await stabilize(page);
    const cabecera = await page.getByRole("heading", { name: "Transacciones" }).locator("xpath=ancestor::*[@data-ui-stagger-item]").boundingBox();
    const tarjeta = await page.getByText(/un solo paso de ritmo/).locator("xpath=ancestor::*[@data-ui-stagger-item]").boundingBox();
    expect(cabecera && tarjeta).toBeTruthy();
    const separacion = tarjeta!.y - (cabecera!.y + cabecera!.height);
    expect(separacion).toBeGreaterThanOrEqual(23);
    expect(separacion).toBeLessThanOrEqual(25);
  });
});

test.describe("UserMenu", () => {
  // Cada aplicación se escribía su desplegable de usuario y cada uno se
  // desviaba de los otros. Estas capturas fijan el estándar abierto, en los
  // dos temas: cabecera, perfil, configuración, cerrar sesión.
  for (const tema of ["light", "dark"] as const) {
    test(`abierto en tema ${tema} se mantiene visualmente estable`, async ({ page }) => {
      await page.goto(storyUrl("layout-usermenu--con-acciones-propias", `theme:${tema};palette:indigo;fontFamily:geist`));
      await stabilize(page);
      await page.getByRole("button", { name: "Andrés Montoya" }).click();
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await expect(menu.getByRole("menuitem", { name: "Cerrar sesión" })).toBeVisible();
      await expect(page.locator("#storybook-root")).toHaveScreenshot(`user-menu-${tema}.png`, {
        animations: "disabled",
        maxDiffPixels: MAX_DIFF_PIXELS,
      });
    });
  }
});

test.describe("AvatarPicker", () => {
  // Foto o iniciales sobre color, una sola elección. La captura fija los ocho
  // colores por defecto y la vista previa, que es el mismo Avatar de UserMenu.
  //
  // Los dos temas, no solo claro (#125): la elegida se marca con un visto en
  // un disco blanco, no con el anillo de foco, así que hace falta ver el
  // disco sobre los ocho colores en los dos temas — es lo único que cambia
  // con el tema, porque el disco ya no depende de `--raised` ni de `--ground`.
  for (const tema of ["light", "dark"] as const) {
    test(`con iniciales se mantiene visualmente estable en tema ${tema}`, async ({ page }) => {
      await page.goto(storyUrl("ui-avatarpicker--iniciales", `theme:${tema};palette:indigo;fontFamily:geist`));
      await stabilize(page);
      await expect(page.getByRole("radiogroup", { name: "Color de las iniciales" })).toBeVisible();
      await expect(page.locator("#storybook-root")).toHaveScreenshot(`avatar-picker-${tema}.png`, {
        animations: "disabled",
        maxDiffPixels: MAX_DIFF_PIXELS,
      });
    });
  }
});

test.describe("AppearanceSettings", () => {
  // Cada opción se ve como lo que es: miniatura de tema, color real de la
  // paleta, tipografía escrita en sí misma. Las capturas lo fijan en los dos temas.
  for (const tema of ["light", "dark"] as const) {
    test(`el panel en tema ${tema} se mantiene visualmente estable`, async ({ page }) => {
      await page.goto(storyUrl("ui-appearancesettings--completo", `theme:${tema};palette:indigo;fontFamily:geist`));
      await stabilize(page);
      await expect(page.getByRole("radiogroup", { name: "Color" })).toBeVisible();
      await expect(page.locator("#storybook-root")).toHaveScreenshot(`appearance-settings-${tema}.png`, {
        animations: "disabled",
        maxDiffPixels: MAX_DIFF_PIXELS,
      });
    });
  }
});

test.describe("DataTable — Jerarquía", () => {
  // #135: la sangría por nivel, el control de expandir de "Edificio Norte" y
  // el botón de orden de "Nombre" son lo que esta captura fija — es la story
  // que combina búsqueda, orden y paginación sobre un árbol de tres niveles.
  test("el árbol de tres niveles se mantiene visualmente estable", async ({ page }) => {
    await page.goto(storyUrl("ui-datatable-jerarquía--arbol-completo"));
    await stabilize(page);
    const story = page.locator("#storybook-root");
    await expect(story.getByText("Edificio Norte")).toBeVisible();
    await expect(story.getByRole("button", { name: "Colapsar Edificio Norte" })).toBeVisible();
    await expect(story).toHaveScreenshot("data-table-tree.png", {
      animations: "disabled",
      maxDiffPixels: MAX_DIFF_PIXELS,
    });
  });
});

test.describe("DataTable — Selección (#137)", () => {
  // Lo nuevo de #137 solo existe CON selección activa: sin ella la tabla es
  // pixel a pixel la de antes (verificado aparte comparando HTML contra
  // main, no con esta captura). Dos capturas, no una: cada una fija algo que
  // la otra no puede mostrar a la vez.

  // Plana: marcar la cabecera selecciona la página (5 de 20) y dispara el
  // aviso para extender a todo lo filtrado — la barra transformada (cuenta +
  // "Exportar"/"Borrar") y el aviso son los dos elementos nuevos que fija
  // esta captura.
  test("con selección activa, la barra transformada y el aviso de extender se mantienen estables", async ({
    page,
  }) => {
    await page.goto(storyUrl("ui-datatable--seleccionable"));
    await stabilize(page);
    const story = page.locator("#storybook-root");

    await story.getByRole("checkbox", { name: "Seleccionar todas las filas de esta página" }).click();
    await expect(story.getByText("5 seleccionadas")).toBeVisible();
    await expect(story.getByText(/Seleccionadas las 5 de esta página/)).toBeVisible();

    await expect(story).toHaveScreenshot("data-table-selection.png", {
      animations: "disabled",
      maxDiffPixels: MAX_DIFF_PIXELS,
    });
  });

  // Jerárquica: marcar un local deja a su edificio a medias — el estado
  // indeterminado de la casilla del padre es lo único que esta captura
  // puede fijar y la anterior no.
  test("en modo jerárquico, un padre a medias queda indeterminado de forma estable", async ({ page }) => {
    await page.goto(storyUrl("ui-datatable-jerarquía--seleccionable"));
    await stabilize(page);
    const story = page.locator("#storybook-root");

    // "Local A" es hoja (sin hijas) — a diferencia de "Local B", que tiene una
    // bodega y arrastraría una segunda fila a la selección sin que se viera
    // en pantalla (bodegas quedan colapsadas con `defaultExpandedDepth={1}`).
    await story.locator('tr[data-row-id="edificio-1-local-a"]').getByRole("checkbox").click();
    await expect(story.getByText("1 seleccionada")).toBeVisible();

    await expect(story).toHaveScreenshot("data-table-selection-tree.png", {
      animations: "disabled",
      maxDiffPixels: MAX_DIFF_PIXELS,
    });
  });
});

test.describe("Anillo de foco (#139)", () => {
  // El hueco del offset (`ring-offset-2`) no llevaba color en varias copias
  // escritas a mano de la recipe `focusRingOutside` — en tema oscuro se veía
  // un aro blanco de 2 px alrededor del control (el valor por defecto de
  // `--tw-ring-offset-color` en Tailwind 4). Un solo documento solo puede
  // tener un elemento con foco real a la vez, así que para juntar varios
  // controles enfocados en una misma captura se fuerza `:focus-visible` vía
  // CDP (`CSS.forcePseudoState`) — el mecanismo que usan las devtools del
  // navegador para lo mismo. El `Switch` es la excepción: su anillo depende
  // de `data-focus-visible`, un estado que pone Ark UI (no el pseudo-elemento
  // nativo), así que ese atributo se fija a mano.
  test("ningún control deja el hueco del offset sin color en tema oscuro", async ({ page }) => {
    await page.goto(storyUrl("guías-anillo-de-foco--galeria", "theme:dark;palette:indigo;fontFamily:geist"));
    await stabilize(page);

    const story = page.locator("#storybook-root");
    await expect(story.getByRole("button", { name: "Guardar cambios" })).toBeVisible();

    const client = await page.context().newCDPSession(page);
    await client.send("DOM.enable");
    await client.send("CSS.enable");
    // Un solo `DOM.getDocument` para toda la prueba: pedirlo de nuevo en
    // cada llamada (una por control) reemplaza el árbol que CDP tiene en
    // memoria y con él los `nodeId` ya forzados — comprobado, así es como el
    // anillo de Tabs/Pagination/Accordion (los primeros de la lista)
    // desaparecía de la captura aunque `getComputedStyle` siguiera
    // reportando el `box-shadow` correcto justo después de forzarlo.
    const { root } = await client.send("DOM.getDocument", { depth: -1, pierce: true });

    const forceFocusVisible = async (selector: string) => {
      const { nodeId } = await client.send("DOM.querySelector", { nodeId: root.nodeId, selector });
      if (!nodeId) throw new Error(`No se encontró "${selector}" para forzar :focus-visible`);
      await client.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: ["focus-visible", "focus"] });
    };

    // Button, Tabs, Pagination y Accordion usan `focus-visible:` directo —
    // forzar el pseudo-elemento nativo alcanza.
    await forceFocusVisible('[data-testid="focus-ring-button"] button');
    await forceFocusVisible('[data-testid="focus-ring-tabs"] [role="tab"]');
    await forceFocusVisible('[data-testid="focus-ring-pagination"] button');
    await forceFocusVisible('[data-testid="focus-ring-accordion"] button');
    // Slider: el thumb es el propio elemento con `role="slider"` y foco real.
    await forceFocusVisible('[data-testid="focus-ring-slider"] [role="slider"]');
    // RadioGroup: el anillo vive en `peer-focus-visible:`, una selección CSS
    // nativa sobre el `<input type="radio">` sr-only que precede al círculo
    // visual (ver el JSDoc de `RadioGroupItem`) — forzar `:focus-visible` en
    // el input basta para que la clase `peer-focus-visible:` del hermano se
    // aplique, sin tocar el DOM a mano.
    await forceFocusVisible('[data-testid="focus-ring-radio-group"] input[type="radio"]');
    // Switch: `data-[focus-visible]:` es un estado que expone Ark UI/Zag, no
    // el pseudo-elemento `:focus-visible` — no hay nada que forzar por CDP,
    // así que se fija el atributo directamente sobre la parte "control"
    // (anatomía verificada arriba, en `switch.ts`: `data-part="control"`).
    await story.locator('[data-testid="focus-ring-switch"] [data-part="control"]').evaluate((el) => {
      el.setAttribute("data-focus-visible", "");
    });

    // `CSS.forcePseudoState` actualiza el estilo calculado de inmediato (se
    // puede leer con `getComputedStyle` justo después), pero el frame
    // pintado que captura `toHaveScreenshot` puede quedarse atrás si no se
    // le da un giro al bucle de render — comprobado: sin este doble
    // `requestAnimationFrame`, el anillo de Tabs/Pagination/Accordion no
    // aparece en la captura aunque `getComputedStyle` ya reporte el
    // box-shadow correcto.
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );

    await expect(story).toHaveScreenshot("focus-ring-gallery-dark.png", {
      animations: "disabled",
      maxDiffPixels: MAX_DIFF_PIXELS,
    });
  });
});
