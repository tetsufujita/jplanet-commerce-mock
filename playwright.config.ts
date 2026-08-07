import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:5190";

export default defineConfig({
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  projects: [
    {
      name: "desktop",
      use: {
        channel: "chrome",
        deviceScaleFactor: 2,
        viewport: { height: 828, width: 1_511 },
      },
    },
    {
      name: "mobile",
      use: {
        channel: "chrome",
        deviceScaleFactor: 2,
        viewport: { height: 735, width: 341 },
      },
    },
  ],
  reporter: "list",
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL,
    colorScheme: "light",
    contextOptions: {
      reducedMotion: "no-preference",
    },
    locale: "ja-JP",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev --host 127.0.0.1 --port 5190 --strictPort",
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL,
  },
  workers: 1,
});
