import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    reporter: 'list',
    use: { baseURL: 'http://localhost:4173' },
    webServer: {
        command: 'npm run build && npm run preview -- --port 4173 --strictPort',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
    projects: [
        { name: 'mobile', use: { ...devices['Pixel 7'] } },
        { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    ],
});
