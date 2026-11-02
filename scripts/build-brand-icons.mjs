/**
 * Gera os PNGs do app a partir da geometria da marca.
 *
 * Por que assim: o ambiente de build não tem rasterizador SVG (sem librsvg,
 * sem sharp) e adicionar uma dependência nativa só para três ícones não se
 * justifica. A marca é composta de polígonos e um círculo, então a conversão
 * é feita aqui por amostragem (4×4 por pixel) e o PNG é escrito com o `zlib`
 * nativo do Node. Sem dependências, resultado reproduzível.
 *
 * Uso: node scripts/build-brand-icons.mjs
 * A geometria precisa continuar igual à de public/favicon.svg e BrandMark.tsx.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const BG = [0x05, 0x07, 0x0a];
const ACCENT = [0xff, 0x4d, 0x2e];
const SPARK = [0xc6, 0xf4, 0x32];

/* Geometria no espaço 32×32, idêntica ao favicon. */
const A_BODY = [
  [16, 5.2], [26.2, 27.4], [20.7, 27.4], [16, 16.2], [11.3, 27.4], [5.8, 27.4],
];
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const CROSSBAR = rect(11.4, 19.6, 20.6, 22.7);
const PLATE_LEFT = rect(8.9, 18.1, 10.8, 24.2);
const PLATE_RIGHT = rect(21.2, 18.1, 23.1, 24.2);
const SPARK_CIRCLE = { cx: 16, cy: 7.6, r: 2.4 };

function inPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function inRoundedRect(x, y, size, radius) {
  if (x < 0 || y < 0 || x > size || y > size) return false;
  const cx = Math.min(Math.max(x, radius), size - radius);
  const cy = Math.min(Math.max(y, radius), size - radius);
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
}

/**
 * @param size lado do PNG em pixels
 * @param maskable fundo sangrado e marca dentro da zona segura de 80%
 */
function render(size, maskable) {
  const SS = 4;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  // A marca ocupa 32 unidades; no maskable reduzimos para caber no círculo seguro.
  const scale = (size / 32) * (maskable ? 0.72 : 1);
  const offset = (size - 32 * scale) / 2;
  const radius = (8 / 32) * size;

  for (let py = 0; py < size; py++) {
    const rowStart = py * (size * 4 + 1);
    raw[rowStart] = 0; // filtro PNG "none"
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = px + (sx + 0.5) / SS;
          const fy = py + (sy + 0.5) / SS;
          if (!maskable && !inRoundedRect(fx, fy, size, radius)) continue;

          const mx = (fx - offset) / scale;
          const my = (fy - offset) / scale;
          let color = BG;
          if (
            inPolygon(mx, my, A_BODY) ||
            inPolygon(mx, my, CROSSBAR) ||
            inPolygon(mx, my, PLATE_LEFT) ||
            inPolygon(mx, my, PLATE_RIGHT)
          ) {
            color = ACCENT;
          }
          if ((mx - SPARK_CIRCLE.cx) ** 2 + (my - SPARK_CIRCLE.cy) ** 2 <= SPARK_CIRCLE.r ** 2) {
            color = SPARK;
          }
          r += color[0]; g += color[1]; b += color[2]; a += 255;
        }
      }
      const n = SS * SS;
      const coverage = a / n / 255;
      const i = rowStart + 1 + px * 4;
      // Premultiplicação desfeita: PNG guarda cor reta.
      raw[i] = coverage ? Math.round(r / n / coverage) : 0;
      raw[i + 1] = coverage ? Math.round(g / n / coverage) : 0;
      raw[i + 2] = coverage ? Math.round(b / n / coverage) : 0;
      raw[i + 3] = Math.round(a / n);
    }
  }
  return raw;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function writePng(path, size, maskable) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bits por canal
  ihdr[9] = 6;  // RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(render(size, maskable), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
  console.log(`${path} — ${size}×${size}, ${png.length} bytes`);
}

writePng('public/icons/icon-192.png', 192, false);
writePng('public/icons/icon-512.png', 512, false);
writePng('public/icons/icon-512-maskable.png', 512, true);
