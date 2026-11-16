import art from './paint';

// The watercolors run on SVG turbulence filters, which are expensive to draw. Inline, the browser
// re-runs them whenever anything on top repaints (on phones, tapping a zone could stall for seconds).
// Shown as an <img>, each one is rasterized once and then only composited.
const urls = {};

/** A data: URL for one of the paintings in art/paint.js, for use as an <img> src. */
export const paintingUrl = (name) =>
    (urls[name] ??= 'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(art[name].replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')));
