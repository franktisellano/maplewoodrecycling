// Watercolor SVGs, painted the same way as the SOMA Labs site (somalabs-site/tools/paint.mjs):
// translucent shapes run through turbulence filters so edges bleed and the paper shows through.
// Everything is seeded, so the same input always gives the same picture.

// ---------- seeded randomness ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => Math.round(n * 10) / 10;

// ---------- shared filters ----------
// wc:    pigment wash with bleeding edges and paper granulation
// wcs:   very soft wash for skies
// wcd:   tighter wash for small details (windows, bins)
const filters = (p) => `
<filter id="${p}wc" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="4" seed="7" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="1.1" result="b"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="3" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0 0 0 0.42" result="ga"/>
  <feComposite in="b" in2="ga" operator="in"/>
</filter>
<filter id="${p}wcs" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="3" seed="11" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="90" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="16" result="b"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="5" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.7 0 0 0 0.6" result="ga"/>
  <feComposite in="b" in2="ga" operator="in"/>
</filter>
<filter id="${p}wcd" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="9" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="0.6"/>
</filter>
<filter id="${p}edge" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="3" seed="2" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="7"/>
</filter>
<mask id="${p}vig" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="400"><rect x="34" y="30" width="452" height="340" rx="60" fill="#fff" filter="url(#${p}edge)"/></mask>`;

// ---------- motifs ----------

// A tree: a trunk and a canopy of overlapping translucent dabs. Overlaps darken,
// the way layered washes do.
function tree(r, { x, y, s = 1, hue = "summer", trunk = true, round = false }) {
  const pal = {
    summer: { body: "#7f9f78", shade: "#4f6f52", light: "#b9c98f" },
    sage: { body: "#93aa92", shade: "#62806a", light: "#c9d3a5" },
    blue: { body: "#8ea7a3", shade: "#5f7d80", light: "#bcccc0" },
    deep: { body: "#6f8f6c", shade: "#3f5c46", light: "#a6bb83" },
    autumn: { body: "#c99b62", shade: "#a0683f", light: "#e2c48b" },
  }[hue];
  const w = 95 * s;
  const h = (round ? 105 : 130) * s;
  const cy = y - h * 0.55 - 40 * s;
  let out = "";
  // Pre-pick the main canopy so trees in front can first lay down a paper-colored
  // underpaint: a painter leaves the paper bare where a tree will go.
  const body = [];
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    const px = x + Math.cos(a) * d * w * 0.5;
    const py = cy + Math.sin(a) * d * h * 0.42;
    const rr = 38 * s * (0.65 + r() * 0.55);
    body.push(`<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(rr * 1.08)}" ry="${f(rr)}"/>`);
  }
  if (trunk) out += `<g fill="#f6f0e3" fill-opacity=".92">${body.join("")}</g>`;
  if (trunk) {
    const tx = x + (r() - 0.5) * 6 * s;
    out += `<path d="M${f(x - 5 * s)} ${f(y)} C${f(x - 3 * s)} ${f(y - 40 * s)} ${f(tx - 4 * s)} ${f(cy + 10 * s)} ${f(tx - 2 * s)} ${f(cy - 10 * s)} L${f(tx + 3 * s)} ${f(cy - 10 * s)} C${f(tx + 4 * s)} ${f(cy + 10 * s)} ${f(x + 4 * s)} ${f(y - 40 * s)} ${f(x + 6 * s)} ${f(y)}Z" fill="#6e5b4b" fill-opacity=".55"/>`;
    out += `<path d="M${f(tx)} ${f(cy + 25 * s)} q${f(-18 * s)} ${f(-12 * s)} ${f(-30 * s)} ${f(-30 * s)} M${f(tx + 1)} ${f(cy + 15 * s)} q${f(16 * s)} ${f(-10 * s)} ${f(26 * s)} ${f(-30 * s)}" stroke="#6e5b4b" stroke-opacity=".45" stroke-width="${f(2.4 * s)}" fill="none" stroke-linecap="round"/>`;
  }
  const dabs = (n, color, op, rad, dx, dy, spread) => {
    let g = "";
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * spread;
      const px = x + dx * s + Math.cos(a) * d * w * 0.5;
      const py = cy + dy * s + Math.sin(a) * d * h * 0.42;
      const rr = rad * s * (0.65 + r() * 0.55);
      g += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(rr * 1.08)}" ry="${f(rr)}"/>`;
    }
    return `<g fill="${color}" fill-opacity="${op}">${g}</g>`;
  };
  out += `<g fill="${pal.body}" fill-opacity=".45">${body.join("")}</g>`;
  out += dabs(6, pal.shade, 0.3, 26, 14, 22, 0.8);
  out += dabs(5, pal.light, 0.38, 20, -18, -24, 0.7);
  return out;
}

// A house with a front porch. Walls, roof, porch roof and posts, windows, a door.
function house(r, { x, y, w, h, wall, roof, trim = "#f6efe2", porch = true, dormer = false }) {
  const roofH = h * 0.62;
  const over = w * 0.07;
  let o = "";
  o += `<path d="M${x} ${y} L${x} ${y - h} L${x + w} ${y - h} L${x + w} ${y}Z" fill="${wall}" fill-opacity=".72"/>`;
  o += `<path d="M${x + w * 0.72} ${y} L${x + w * 0.72} ${y - h} L${x + w} ${y - h} L${x + w} ${y}Z" fill="#7d7468" fill-opacity=".12"/>`;
  o += `<path d="M${x - over} ${y - h + 4} L${x + w / 2} ${y - h - roofH} L${x + w + over} ${y - h + 4}Z" fill="${roof}" fill-opacity=".62"/>`;
  o += `<path d="M${x - over} ${y - h + 4} L${x + w / 2} ${y - h - roofH} L${x + w + over} ${y - h + 4}" fill="none" stroke="${roof}" stroke-opacity=".5" stroke-width="3"/>`;
  if (dormer) {
    const dw = w * 0.2;
    const dx = x + w / 2 - dw / 2;
    const dy = y - h - roofH * 0.32;
    o += `<path d="M${dx} ${dy + 18} L${dx} ${dy} L${dx + dw / 2} ${dy - 14} L${dx + dw} ${dy} L${dx + dw} ${dy + 18}Z" fill="${wall}" fill-opacity=".8"/>`;
    o += `<rect x="${dx + dw * 0.28}" y="${dy + 1}" width="${dw * 0.44}" height="13" fill="#6f8798" fill-opacity=".5"/>`;
  }
  const win = (wx, wy, ww, wh) =>
    `<rect x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${f(wh)}" fill="#6f8798" fill-opacity=".45"/>` +
    `<rect x="${f(wx - 2)}" y="${f(wy - 2)}" width="${f(ww + 4)}" height="${f(wh + 4)}" fill="none" stroke="${trim}" stroke-opacity=".9" stroke-width="2"/>`;
  const ww = w * 0.13;
  const wh = h * 0.2;
  o += win(x + w * 0.17, y - h * 0.86, ww, wh);
  o += win(x + w * 0.7, y - h * 0.86, ww, wh);
  if (porch) {
    const py = y - h * 0.45;
    o += `<path d="M${x - 8} ${py} L${x + w + 8} ${py} L${x + w + 2} ${py - 10} L${x - 2} ${py - 10}Z" fill="${roof}" fill-opacity=".55"/>`;
    o += `<rect x="${x}" y="${py}" width="${w}" height="${y - py - 6}" fill="#5f5a52" fill-opacity=".1"/>`;
    for (let i = 0; i <= 4; i++) {
      const px = x - 2 + (i * (w + 4)) / 4;
      o += `<rect x="${f(px - 2)}" y="${py}" width="4" height="${f(y - py)}" fill="${trim}" fill-opacity=".95"/>`;
    }
    o += `<rect x="${x - 2}" y="${f(y - (y - py) * 0.38)}" width="${w + 4}" height="2.5" fill="${trim}" fill-opacity=".9"/>`;
    o += `<rect x="${f(x + w * 0.44)}" y="${f(py + 8)}" width="${f(w * 0.12)}" height="${f(y - py - 8)}" fill="#7a5b4b" fill-opacity=".45"/>`;
    o += `<rect x="${f(x + w * 0.16)}" y="${f(py + 10)}" width="${f(w * 0.17)}" height="${f(h * 0.2)}" fill="#6f8798" fill-opacity=".38"/>`;
    o += `<rect x="${f(x + w * 0.68)}" y="${f(py + 10)}" width="${f(w * 0.17)}" height="${f(h * 0.2)}" fill="#6f8798" fill-opacity=".38"/>`;
    o += `<rect x="${f(x + w * 0.4)}" y="${y - 6}" width="${f(w * 0.2)}" height="8" fill="#bfae95" fill-opacity=".6"/>`;
  }
  return o;
}

// A recycling bin at the curb, standing on y. The town's bins are blue.
function bin(x, y, s = 1) {
  const w = 40 * s, h = 52 * s, lid = 7 * s;
  return `<path d="M${f(x - w / 2)} ${f(y - h)} L${f(x + w / 2)} ${f(y - h)} L${f(x + w / 2 - 4 * s)} ${f(y)} L${f(x - w / 2 + 4 * s)} ${f(y)}Z" fill="#6f93ad" fill-opacity=".75"/>` +
    `<path d="M${f(x - w / 2 - 3 * s)} ${f(y - h - lid)} L${f(x + w / 2 + 3 * s)} ${f(y - h - lid)} L${f(x + w / 2 + 3 * s)} ${f(y - h + 1)} L${f(x - w / 2 - 3 * s)} ${f(y - h + 1)}Z" fill="#557a95" fill-opacity=".75"/>` +
    `<path d="M${f(x - w * 0.2)} ${f(y - h * 0.8)} L${f(x - w * 0.18)} ${f(y - h * 0.15)} M${f(x + w * 0.2)} ${f(y - h * 0.8)} L${f(x + w * 0.18)} ${f(y - h * 0.15)}" stroke="#4d6d85" stroke-opacity=".35" stroke-width="${f(2 * s)}"/>`;
}

// A bundle of flattened cardboard, tied with twine, standing on y.
function bundle(x, y, s = 1) {
  const w = 58 * s, h = 34 * s;
  let o = "";
  for (let i = 0; i < 4; i++) {
    const yy = y - (i + 1) * (h / 4);
    const dx = (i % 2 ? 3 : -2) * s;
    o += `<rect x="${f(x - w / 2 + dx)}" y="${f(yy)}" width="${f(w)}" height="${f(h / 4 - 1)}" fill="${i % 2 ? "#c9a274" : "#b98f61"}" fill-opacity=".7"/>`;
  }
  o += `<path d="M${f(x - w * 0.15)} ${f(y - h - 2)} L${f(x - w * 0.15)} ${f(y)} M${f(x + w * 0.22)} ${f(y - h - 2)} L${f(x + w * 0.22)} ${f(y)}" stroke="#8a6a48" stroke-opacity=".55" stroke-width="${f(2 * s)}"/>`;
  return o;
}

// A soft cloud from a few overlapping puffs.
function cloud(r, { x, y, s = 1, color = "#ffffff", op = 0.75 }) {
  let g = "";
  const n = 6;
  for (let i = 0; i < n; i++) {
    const px = x + (i - n / 2) * 34 * s + (r() - 0.5) * 20 * s;
    const py = y - Math.sin((i / (n - 1)) * Math.PI) * 26 * s + (r() - 0.5) * 8 * s;
    const rr = (30 + r() * 26) * s;
    g += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(rr * 1.3)}" ry="${f(rr * 0.8)}"/>`;
  }
  return `<g fill="${color}" fill-opacity="${op}">${g}</g>`;
}

// A wavy horizon band from 0..w around baseline y.
function band(r, { y, amp = 14, step = 70, w = 1440, bottom = 420, color, op }) {
  let d = `M0 ${f(y + (r() - 0.5) * amp)}`;
  for (let x = step; x <= w + step; x += step) {
    const yy = y + (r() - 0.5) * amp * 2;
    const cx = x - step / 2;
    const cyy = y + (r() - 0.5) * amp * 2.4;
    d += ` Q${f(cx)} ${f(cyy)} ${f(x)} ${f(yy)}`;
  }
  d += ` L${w + step} ${bottom} L0 ${bottom}Z`;
  return `<path d="${d}" fill="${color}" fill-opacity="${op}"/>`;
}

// ---------- pictures ----------

const art = {};

// The sky behind every page heading.
art.sky = (() => {
  const r = rng(4);
  return `<svg viewBox="0 0 1440 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">
<defs>${filters("sk-")}
<linearGradient id="sk-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="sk-m"><rect width="1440" height="1000" fill="url(#sk-fade)"/></mask></defs>
<g mask="url(#sk-m)"><g filter="url(#sk-wcs)">
<ellipse cx="1080" cy="140" rx="760" ry="330" fill="#a6c2d2" fill-opacity=".5"/>
<ellipse cx="260" cy="90" rx="640" ry="260" fill="#b4cdd9" fill-opacity=".42"/>
<ellipse cx="720" cy="330" rx="520" ry="160" fill="#c4d7df" fill-opacity=".35"/>
<ellipse cx="760" cy="720" rx="980" ry="210" fill="#f2dcc0" fill-opacity=".5"/>
<ellipse cx="1180" cy="610" rx="300" ry="160" fill="#f3d8b8" fill-opacity=".38"/>
<circle cx="1190" cy="540" r="95" fill="#f6e2ac" fill-opacity=".6"/>
</g>
<g filter="url(#sk-wcs)">${cloud(r, { x: 380, y: 300, s: 2.2, color: "#fbf8f0", op: 0.7 })}${cloud(r, { x: 1180, y: 250, s: 1.6, color: "#fbf8f0", op: 0.6 })}</g></g>
</svg>`;
})();

// Schedule: a Maplewood street on pickup morning, bins and cardboard out at the curb.
art.street = (() => {
  const r = rng(12);
  const W = 1440, H = 440, G = 372;
  let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" role="img" aria-label="A watercolor of a quiet street with porch houses, recycling bins out at the curb.">
<defs>${filters("st-")}
<linearGradient id="st-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".78" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="st-m"><rect width="${W}" height="${H}" fill="url(#st-fade)"/></mask></defs>
<g mask="url(#st-m)">`;
  s += `<g filter="url(#st-wc)">`;
  s += band(r, { y: 214, amp: 18, step: 110, bottom: H, color: "#b5c6c8", op: 0.42 });
  s += band(r, { y: 250, amp: 14, step: 60, bottom: H, color: "#a2b7a6", op: 0.45 });
  s += `</g>`;
  s += `<g filter="url(#st-wc)">`;
  for (let x = 20; x < W; x += 70 + r() * 60) {
    s += tree(r, { x, y: 300, s: 0.42 + r() * 0.2, hue: r() < 0.5 ? "blue" : "sage", trunk: false, round: true });
  }
  s += `</g>`;
  s += `<g filter="url(#st-wc)">${band(r, { y: 318, amp: 6, step: 120, bottom: H, color: "#b9c693", op: 0.42 })}</g>`;
  s += `<g filter="url(#st-wcd)">`;
  s += house(r, { x: 430, y: G - 18, w: 190, h: 112, wall: "#ecdcc0", roof: "#a97a66", dormer: true });
  s += house(r, { x: 780, y: G - 22, w: 160, h: 100, wall: "#cbd6d6", roof: "#6f8392" });
  s += house(r, { x: 1060, y: G - 26, w: 140, h: 92, wall: "#ecdca8", roof: "#7f8a74" });
  s += house(r, { x: 140, y: G - 26, w: 130, h: 88, wall: "#e2cbbd", roof: "#8a7f8a" });
  s += `</g>`;
  s += `<g filter="url(#st-wc)">`;
  s += tree(r, { x: 700, y: G - 14, s: 1.05, hue: "summer" });
  s += tree(r, { x: 990, y: G - 18, s: 0.85, hue: "sage" });
  s += tree(r, { x: 340, y: G - 16, s: 0.9, hue: "sage" });
  s += tree(r, { x: 1330, y: G - 12, s: 1.0, hue: "summer" });
  s += tree(r, { x: 40, y: G - 16, s: 0.8, hue: "sage" });
  s += `</g>`;
  s += `<g filter="url(#st-wc)">`;
  s += `<path d="M0 ${G - 8} Q720 ${G - 16} 1440 ${G - 6} L1440 ${G + 16} Q720 ${G + 10} 0 ${G + 18}Z" fill="#d9c9ab" fill-opacity=".55"/>`;
  s += `<path d="M0 ${G + 20} Q720 ${G + 13} 1440 ${G + 18} L1440 ${G + 26} Q720 ${G + 20} 0 ${G + 28}Z" fill="#a9a093" fill-opacity=".35"/>`;
  s += `<path d="M0 ${G + 30} Q720 ${G + 24} 1440 ${G + 28} L1440 ${H} L0 ${H}Z" fill="#c8c3b8" fill-opacity=".38"/>`;
  s += `</g>`;
  // out at the curb: bins in front of most houses, a cardboard bundle by one
  s += `<g filter="url(#st-wcd)">`;
  s += bin(232, G + 14, 0.9) + bin(270, G + 15, 0.9);
  s += bin(560, G + 12) + bundle(612, G + 12, 0.9);
  s += bin(905, G + 12, 0.95);
  s += bin(1175, G + 13, 0.9) + bin(1212, G + 14, 0.9);
  s += `</g>`;
  s += `<g filter="url(#st-wc)">`;
  s += tree(r, { x: 330, y: G + 6, s: 1.6, hue: "summer" });
  s += tree(r, { x: 1290, y: G + 6, s: 1.5, hue: "deep" });
  s += tree(r, { x: 740, y: G + 4, s: 1.1, hue: "autumn" });
  s += `</g>`;
  s += `</g></svg>`;
  return s;
})();

// Under headings on the other pages: a low line of trees.
art.treeline = (() => {
  const r = rng(77);
  const W = 1440, H = 200;
  let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
<defs>${filters("tl-")}
<linearGradient id="tl-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="tl-m"><rect width="${W}" height="${H}" fill="url(#tl-fade)"/></mask></defs><g mask="url(#tl-m)">`;
  s += `<g filter="url(#tl-wc)">${band(r, { y: 120, amp: 12, step: 90, bottom: H, color: "#b3c3c2", op: 0.4 })}`;
  for (let x = 0; x < W + 40; x += 55 + r() * 70) {
    s += tree(r, { x, y: 170, s: 0.45 + r() * 0.35, hue: ["sage", "blue", "summer"][Math.floor(r() * 3)], trunk: r() < 0.5, round: true });
  }
  s += band(r, { y: 168, amp: 4, step: 120, bottom: H, color: "#b9c693", op: 0.4 });
  s += `</g></g></svg>`;
  return s;
})();

// Footer: a strip of lawn.
art.grass = (() => {
  const r = rng(88);
  const W = 1440, H = 70;
  let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>${filters("fg-")}</defs><g filter="url(#fg-wc)">`;
  s += band(r, { y: 40, amp: 6, step: 120, w: W, bottom: H, color: "#b9c693", op: 0.4 });
  s += band(r, { y: 50, amp: 4, step: 80, w: W, bottom: H, color: "#9fb58a", op: 0.3 });
  s += `</g></svg>`;
  return s;
})();

// Commingled week: the blue bin under a tree, a bottle and a can beside it.
art.commingled = (() => {
  const r = rng(47);
  return `<svg viewBox="0 0 520 400" role="img" aria-label="A watercolor of a blue recycling bin at the curb with a bottle and a can.">
<defs>${filters("cm-")}</defs>
<g mask="url(#cm-vig)">
<g filter="url(#cm-wcs)"><ellipse cx="240" cy="140" rx="250" ry="150" fill="#bcd2dc" fill-opacity=".55"/><ellipse cx="320" cy="250" rx="220" ry="90" fill="#efdcc0" fill-opacity=".5"/></g>
<g filter="url(#cm-wc)">${band(r, { y: 258, amp: 10, step: 60, w: 520, bottom: 400, color: "#b3c391", op: 0.5 })}
${tree(r, { x: 390, y: 300, s: 1.45, hue: "summer" })}
${house(r, { x: 60, y: 262, w: 120, h: 76, wall: "#ecdcc0", roof: "#a97a66" })}
</g>
<g filter="url(#cm-wc)">
<path d="M0 312 Q260 306 520 312 L520 330 Q260 324 0 332Z" fill="#d9c9ab" fill-opacity=".7"/>
<path d="M0 336 Q260 330 520 336 L520 400 L0 400Z" fill="#c8c3b8" fill-opacity=".45"/>
</g>
<g filter="url(#cm-wcd)">
${bin(253, 322, 1.95)}
<path d="M312 322 L312 290 Q312 280 318 276 L318 262 L326 262 L326 276 Q332 280 332 290 L332 322Z" fill="#7fa58c" fill-opacity=".7"/>
<rect x="340" y="298" width="20" height="26" rx="3" fill="#b4b9bd" fill-opacity=".8"/>
<rect x="340" y="304" width="20" height="9" fill="#c0705a" fill-opacity=".55"/>
</g>
</g>
</svg>`;
})();

// Fiber week: flattened cardboard and a tied stack of newspapers at the curb.
art.fibers = (() => {
  const r = rng(52);
  return `<svg viewBox="0 0 520 400" role="img" aria-label="A watercolor of flattened cardboard and a stack of newspapers tied with twine at the curb.">
<defs>${filters("fb-")}</defs>
<g mask="url(#fb-vig)">
<g filter="url(#fb-wcs)"><ellipse cx="280" cy="130" rx="260" ry="150" fill="#c4d7df" fill-opacity=".5"/><ellipse cx="200" cy="250" rx="240" ry="100" fill="#f2d8bc" fill-opacity=".55"/><circle cx="380" cy="170" r="50" fill="#f6e2ac" fill-opacity=".55"/></g>
<g filter="url(#fb-wc)">${band(r, { y: 258, amp: 10, step: 60, w: 520, bottom: 400, color: "#b3c391", op: 0.5 })}
${tree(r, { x: 110, y: 300, s: 1.35, hue: "autumn" })}
${house(r, { x: 330, y: 262, w: 120, h: 76, wall: "#cbd6d6", roof: "#6f8392" })}
</g>
<g filter="url(#fb-wc)">
<path d="M0 312 Q260 306 520 312 L520 330 Q260 324 0 332Z" fill="#d9c9ab" fill-opacity=".7"/>
<path d="M0 336 Q260 330 520 336 L520 400 L0 400Z" fill="#c8c3b8" fill-opacity=".45"/>
</g>
<g filter="url(#fb-wcd)">
<path d="M200 322 L214 236 L270 230 L262 322Z" fill="#c29a6b" fill-opacity=".72"/>
<path d="M226 322 L246 248 L300 252 L286 322Z" fill="#b38858" fill-opacity=".7"/>
<path d="M236 290 L292 292" stroke="#8a6a48" stroke-opacity=".4" stroke-width="2.5"/>
${bundle(338, 322, 1.25)}
<path d="M312 280 q12 -8 24 0 q-12 6 -24 0z M168 318 q10 -8 20 0 q-10 6 -20 0z" fill="#c99b62" fill-opacity=".65"/>
</g>
</g>
</svg>`;
})();

// Keep-out list: a small trash can, for things that go in the garbage instead.
art.trash = (() => `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false"><defs>${filters("tr-")}</defs>
<g filter="url(#tr-wcs)"><circle cx="60" cy="62" r="48" fill="#ecd5c4" fill-opacity=".6"/></g>
<g filter="url(#tr-wcd)">
<path d="M38 44 L82 44 L77 98 L43 98Z" fill="#7d837d" fill-opacity=".62"/>
<path d="M33 36 L87 36 L87 45 L33 45Z" fill="#5f665f" fill-opacity=".7"/>
<rect x="52" y="29" width="16" height="7" rx="2" fill="#5f665f" fill-opacity=".6"/>
<path d="M50 54 L51 90 M60 54 L60 90 M70 54 L69 90" stroke="#4f564f" stroke-opacity=".35" stroke-width="2.5"/>
</g></svg>`)();

// A brush stroke used as a divider.
art.brush = `<svg viewBox="0 0 420 18" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>${filters("br-")}</defs><g filter="url(#br-wc)"><path d="M8 10 Q110 4 210 9 T412 8 L410 12 Q300 15 210 13 T10 14Z" fill="#8fa58a" fill-opacity=".55"/></g></svg>`;

// The mark: a blue bin on a little hill, in a wash of sky.
export const mark = (p, size) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true" focusable="false"><defs>
<filter id="${p}m" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="0.35"/></filter></defs>
<g filter="url(#${p}m)"><circle cx="32" cy="32" r="29" fill="#cfe0e6"/><circle cx="32" cy="32" r="29" fill="none" stroke="#a9c3cf" stroke-width="1.5"/><path d="M3.5 40 Q32 34 60.5 40 A29 29 0 0 1 3.5 40Z" fill="#b8c792"/><circle cx="45" cy="18" r="6" fill="#f3d99a"/>
<path d="M22 24 L42 24 L40 46 L24 46Z" fill="#6f93ad" fill-opacity=".9"/><path d="M20 19 L44 19 L44 25 L20 25Z" fill="#557a95"/><path d="M28 29 L28.5 41 M36 29 L35.5 41" stroke="#4d6d85" stroke-opacity=".5" stroke-width="1.6"/></g></svg>`;
art.mark = mark("hd", 32);

export default art;
