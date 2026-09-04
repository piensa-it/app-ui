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
  // —las que mira CI— se regeneran en local con `npm run test:browser:docker:update`,
  // que corre la misma imagen de Playwright que el runner.
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFilePath}/{arg}-{platform}{ext}",
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

