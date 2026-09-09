import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  // La referencia se guarda por plataforma a propósito: macOS y Linux no
  // rasterizan las letras igual, y comparar una contra la otra mete más ruido
  // que señal (ver la nota de tolerancia en storybook.spec.ts). Las de Linux
  // —las que mira CI— se versionan y se regeneran en local con
  // `npm run test:browser:docker:update`, que corre la misma imagen de
  // Playwright que el runner. Las de macOS NO se versionan (`.gitignore`):
  // son específicas de cada Mac, no de la plataforma —dos Macs distintas ya
  // difieren en miles de píxeles de contorno de letras (#141)—, así que cada
  // máquina las genera solas en su primera corrida (ver `updateSnapshots`
  // abajo) y las compara contra sí misma en las siguientes.
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFilePath}/{arg}-{platform}{ext}",
  // Por defecto (`updateSnapshots: "missing"`) Playwright, ante una
  // referencia ausente, la escribe en disco — pero esa primera corrida igual
  // se reporta como fallida ("A snapshot doesn't exist ..., writing
  // actual."): es su forma de que no pase inadvertido que se creó una
  // referencia nueva. Comprobado (#141): la corrida siguiente, ya con el
  // archivo en disco, pasa en limpio. Es el comportamiento que necesita una
  // Mac nueva — falla una vez, con un mensaje que explica por qué, nunca por
  // una diferencia de píxeles real. En CI es al revés: si a la referencia de
  // Linux le faltara un archivo, tiene que fallar fuerte y no crear nada en
  // silencio. Mismo patrón que `forbidOnly` arriba.
  updateSnapshots: process.env.CI ? "none" : "missing",
  use: {
    baseURL: "http://127.0.0.1:6106",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
        colorScheme: "light",
        reducedMotion: "reduce",
      },
    },
  ],
  webServer: {
    command:
      "npm run build-storybook -- --quiet && http-server storybook-static -p 6106 -c-1",
    url: "http://127.0.0.1:6106/index.json",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

