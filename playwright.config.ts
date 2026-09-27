import { defineConfig, devices } from '@playwright/test'

// End-to-end tests run against the production build, the same bundle GitHub Pages serves.
export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry everywhere: locally the preview server on Windows now and then refuses a single connection when four
  // browsers load at once (a trace showed ERR_CONNECTION_REFUSED on an asset). Retried tests are still reported as flaky.
  retries: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4173', locale: 'en-US', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
