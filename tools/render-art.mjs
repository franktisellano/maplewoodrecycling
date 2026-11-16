// Renders the watercolors in src/art/paint.js to WebP images in src/art/rendered/.
//
// Drawn live, the paintings' turbulence filters cost a phone seconds of CPU on every page load.
// Pre-rendered, they're small images that just decode. The one part left out is the paper
// granulation (fine per-pixel noise): it barely compresses, so the page adds it back with a tiny
// tiled noise mask instead (see .painting in index.css).
//
// Run `npm run art` after changing a painting, and commit the images.
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import art from '../src/art/paint.js';

// Pixels per SVG unit. The sky is a soft, blurred wash, so half resolution loses nothing.
const SCALE = { sky: 0.5, mark: 2, default: 1 };
const out = new URL('../src/art/rendered/', import.meta.url);

// The granulation step at the end of the wash filters: a second turbulence, used as an alpha mask.
const GRANULATION = /<feTurbulence[^>]*result="g"\/>\s*<feColorMatrix[^>]*result="ga"\/>\s*<feComposite in="b" in2="ga" operator="in"\/>/g;

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, painting] of Object.entries(art)) {
    const svg = painting.replace(GRANULATION, '').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    const [w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/).slice(1).map(Number);
    const scale = SCALE[name] ?? SCALE.default;
    const png = await page.evaluate(async ({ src, width, height }) => {
        const img = new Image();
        img.src = src;
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        return canvas.toDataURL('image/png').split(',')[1];
    }, { src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), width: Math.round(w * scale), height: Math.round(h * scale) });

    const info = await sharp(Buffer.from(png, 'base64'))
        .webp({ quality: 80, alphaQuality: 70, effort: 6 })
        .toFile(new URL(`${name}.webp`, out).pathname);
    console.log(`${name}.webp  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
}
await browser.close();
