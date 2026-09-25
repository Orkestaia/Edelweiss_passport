import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", testMatch: "*.spec.ts", timeout: 45000, workers: 1,
  use: { baseURL: "http://localhost:3100", screenshot: "only-on-failure", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Pixel 7"], browserName: "chromium" } }, { name: "webkit", use: { ...devices["iPhone 13"], browserName: "webkit" } }],
  webServer: [
    { command: "node tests/api-fixture.mjs", url: "http://127.0.0.1:3199/health", reuseExistingServer: false },
    { command: "node node_modules/next/dist/bin/next start --port 3100 --hostname 127.0.0.1", url: "http://127.0.0.1:3100", env: { PASSPORT_API_BASE_URL: "http://127.0.0.1:3199", PASSPORT_READ_SECRET: "fixture-read-secret" }, reuseExistingServer: false }
  ]
});
