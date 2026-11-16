// The watercolors from art/paint.js, pre-rendered to WebP by `npm run art` (tools/render-art.mjs).
// Drawn live, their turbulence filters took phones seconds; as images they just decode.
const rendered = import.meta.glob('./rendered/*.webp', { eager: true, query: '?url', import: 'default' });

/** The image URL for one of the paintings, for use as an <img> src. */
export const paintingUrl = (name) => rendered[`./rendered/${name}.webp`];
