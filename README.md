# Maplewood Recycling Helper ♻️

A modern, mobile-friendly web application to help Maplewood, NJ residents track their 2026 recycling schedule.

## Features

- **📅 Interactive Schedule**: View the complete 2026 pickup schedule tailored to your zone.
    - **Smart Highlighting**: Automatically highlights the next upcoming pickup.
    - **Clean History**: Hides past pickups to keep the view focused.
- **✅ Recycling Guidelines**: Visual guide for "Fiber" vs "Commingled" weeks, ensuring you know exactly what goes in the bin.
- **🔔 Google Calendar Import**: Generate a custom CSV file to import your specific zone's schedule (with optional reminders) directly into Google Calendar.

## Technology

Built with:
- **React** & **Vite**: For a fast, responsive Single Page Application (SPA) experience.
- **CSS3**: Custom responsive styling with a clean, nature-inspired theme (no heavy frameworks).
- **Netlify Ready**: Pre-configured for seamless deployment.

## Running Locally

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd recycling
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:5173` in your browser.

## Tests

```bash
npx playwright install chromium   # once
npm test
```

Playwright builds the site and runs each test on an emulated phone (with taps) and on desktop Chrome.

## Paintings

The watercolors are written as SVG in `src/art/paint.js`, but the site shows pre-rendered WebP images
from `src/art/rendered/`. The SVGs' turbulence filters take phones seconds to draw, which made the site
slow to load and to respond to taps. After changing a painting, run `npm run art` and commit the images.

## Deployment

This project is configured for **Netlify**.
- Build Command: `npm run build`
- Publish Directory: `dist`
- Redirects are handled automatically via `netlify.toml`.
