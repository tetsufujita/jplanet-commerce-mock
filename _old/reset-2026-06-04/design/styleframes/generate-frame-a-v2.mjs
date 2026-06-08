import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { geoInterpolate, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { noise2D } from "@remotion/noise";
import { makeCircle, makeRect } from "@remotion/shapes";

const width = 1920;
const height = 1080;

const topo = JSON.parse(readFileSync(resolve("node_modules/world-atlas/countries-110m.json"), "utf8"));
const countries = feature(topo, topo.objects.countries).features;
const land = feature(topo, topo.objects.land);

const projection = geoNaturalEarth1()
  .rotate([58, 0])
  .fitExtent(
    [
      [710, 100],
      [1850, 940],
    ],
    { type: "Sphere" },
  );

const path = geoPath(projection);

const ids = new Set(["076", "392", "410"]);
const regionPaths = countries
  .filter((country) => ids.has(String(country.id).padStart(3, "0")))
  .map((country) => `<path d="${path(country)}" class="country country-focus" data-name="${country.properties.name}" />`)
  .join("\n");

const landPath = path(land);

const tokyo = [139.6917, 35.6895];
const seoul = [126.978, 37.5665];
const saoPaulo = [-46.6333, -23.5505];
const tokyoPt = projection(tokyo);
const seoulPt = projection(seoul);
const saoPt = projection(saoPaulo);

const routePath = (from, to, lift = -190) => {
  const [x1, y1] = projection(from);
  const [x2, y2] = projection(to);
  const cx = (x1 + x2) / 2;
  const cy = Math.min(y1, y2) + lift;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

const routeA = routePath(tokyo, saoPaulo, -250);
const routeB = routePath(seoul, saoPaulo, -190);

const interpolator = geoInterpolate(tokyo, saoPaulo);
const fragments = [
  { t: 0.16, label: "SKU", body: "JP beauty metadata" },
  { t: 0.29, label: "EMS", body: "postal bridge" },
  { t: 0.42, label: "PRC", body: "customs regime" },
  { t: 0.58, label: "NF-e", body: "fiscal document" },
  { t: 0.73, label: "PIX", body: "local payment rail" },
  { t: 0.87, label: "CNPJ", body: "Sao Paulo entity" },
].map((item, index) => {
  const [lng, lat] = interpolator(item.t);
  const [x, y] = projection([lng, lat]);
  const side = index % 2 === 0 ? -1 : 1;
  const dx = side * (64 + index * 8);
  const dy = index % 2 === 0 ? -74 : 54;
  const rect = makeRect({ width: 168, height: 72, cornerRadius: 14 });
  return `
    <g class="fragment" transform="translate(${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)})">
      <path d="${rect.path}" />
      <text x="18" y="28" class="fragment-label">${item.label}</text>
      <text x="18" y="50" class="fragment-body">${item.body}</text>
    </g>
  `;
});

const particles = Array.from({ length: 260 }, (_, index) => {
  const t = index / 259;
  const [lng, lat] = interpolator(t);
  const [x, y] = projection([lng, lat]);
  const n1 = noise2D("andes-corridor", index * 0.07, t * 2.3);
  const n2 = noise2D("andes-depth", index * 0.11, t * 3.1);
  const px = x + n1 * 150;
  const py = y + n2 * 95;
  const opacity = 0.05 + Math.max(0, noise2D("andes-alpha", index * 0.04, t)) * 0.22;
  const radius = 0.8 + Math.abs(noise2D("andes-size", index * 0.09, t)) * 2.6;
  return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${radius.toFixed(2)}" opacity="${opacity.toFixed(3)}" />`;
}).join("\n");

const circle = makeCircle({ radius: 8 });
const anchor = ([x, y], label, sub, className = "") => `
  <g class="anchor ${className}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
    <path d="${circle.path}" transform="translate(-8 -8)" />
    <text x="22" y="-2">${label}</text>
    <text x="22" y="20" class="anchor-sub">${sub}</text>
  </g>
`;

const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Andes Frame A v2</title>
    <style>
      :root {
        --navy: #0f1b3d;
        --paper: #fafaf7;
        --ink: #0a0a0a;
        --crimson: #c8102e;
        --glow: #e83e5c;
        --deep: #060b1f;
        --muted: #9ea6ba;
      }

      * { box-sizing: border-box; }
      html, body { margin: 0; background: #101010; }
      body {
        width: ${width}px;
        height: ${height}px;
        overflow: hidden;
        font-family: Inter, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif;
      }

      .frame {
        position: relative;
        width: ${width}px;
        height: ${height}px;
        overflow: hidden;
        color: var(--paper);
        background:
          radial-gradient(circle at 70% 44%, rgba(200, 16, 46, 0.16), transparent 18%),
          radial-gradient(circle at 76% 48%, rgba(250, 250, 247, 0.09), transparent 34%),
          linear-gradient(105deg, #081128 0%, #0f1b3d 48%, #061020 100%);
      }

      .frame::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.18;
        background-image:
          linear-gradient(rgba(250, 250, 247, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(250, 250, 247, 0.045) 1px, transparent 1px);
        background-size: 72px 72px;
        mask-image: radial-gradient(circle at 68% 48%, black 0 48%, transparent 78%);
      }

      .grain {
        position: absolute;
        inset: 0;
        z-index: 8;
        pointer-events: none;
        opacity: 0.12;
        mix-blend-mode: overlay;
        background-image:
          repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 5px),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 7px);
      }

      .copy {
        position: absolute;
        left: 118px;
        top: 164px;
        z-index: 12;
        width: 805px;
      }

      .eyebrow {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 28px;
        color: rgba(250, 250, 247, 0.66);
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .eyebrow::before {
        content: "";
        width: 9px;
        height: 9px;
        border-radius: 999px;
        background: var(--crimson);
        box-shadow: 0 0 28px rgba(232, 62, 92, 0.72);
      }

      h1 {
        margin: 0;
        font-size: 116px;
        font-weight: 820;
        letter-spacing: -0.065em;
        line-height: 0.96;
      }

      .lede {
        width: 660px;
        margin-top: 34px;
        color: rgba(250, 250, 247, 0.72);
        font-size: 24px;
        font-weight: 560;
        line-height: 1.48;
        letter-spacing: -0.025em;
      }

      .system-note {
        position: absolute;
        left: 122px;
        bottom: 90px;
        z-index: 12;
        width: 660px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }

      .system-note span {
        border: 1px solid rgba(250, 250, 247, 0.13);
        border-radius: 999px;
        padding: 14px 16px;
        color: rgba(250, 250, 247, 0.64);
        font-size: 12px;
        font-weight: 780;
        letter-spacing: 0.12em;
        text-align: center;
        text-transform: uppercase;
        background: rgba(250, 250, 247, 0.04);
      }

      svg {
        position: absolute;
        inset: 0;
        z-index: 4;
      }

      .sphere {
        fill: rgba(250, 250, 247, 0.018);
        stroke: rgba(250, 250, 247, 0.09);
      }

      .land {
        fill: rgba(250, 250, 247, 0.045);
        stroke: rgba(250, 250, 247, 0.05);
        stroke-width: 0.6;
      }

      .country-focus {
        fill: rgba(250, 250, 247, 0.1);
        stroke: rgba(250, 250, 247, 0.2);
        stroke-width: 0.8;
      }

      .corridor {
        fill: none;
        stroke-linecap: round;
      }

      .corridor-core {
        stroke: url(#route);
        stroke-width: 3.5;
        filter: drop-shadow(0 0 28px rgba(200, 16, 46, 0.42));
      }

      .corridor-ghost {
        stroke: rgba(250, 250, 247, 0.13);
        stroke-width: 1.5;
      }

      .corridor-band {
        fill: none;
        stroke: rgba(200, 16, 46, 0.1);
        stroke-width: 60;
        stroke-linecap: round;
        filter: blur(6px);
      }

      .particle-field {
        fill: var(--paper);
      }

      .fragment path {
        fill: rgba(250, 250, 247, 0.075);
        stroke: rgba(250, 250, 247, 0.16);
        stroke-width: 1;
      }

      .fragment text {
        font-family: "SF Mono", "JetBrains Mono", "Roboto Mono", monospace;
      }

      .fragment-label {
        fill: rgba(250, 250, 247, 0.86);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 1.7px;
      }

      .fragment-body {
        fill: rgba(250, 250, 247, 0.54);
        font-size: 11px;
        letter-spacing: 0.3px;
      }

      .anchor path {
        fill: var(--crimson);
        filter: drop-shadow(0 0 16px rgba(232, 62, 92, 0.8));
      }

      .anchor text {
        fill: rgba(250, 250, 247, 0.86);
        font-size: 14px;
        font-weight: 840;
        letter-spacing: 1.6px;
        text-transform: uppercase;
      }

      .anchor .anchor-sub {
        fill: rgba(250, 250, 247, 0.42);
        font-size: 11px;
        font-weight: 720;
      }

      .platform-ghost {
        position: absolute;
        right: 88px;
        bottom: 86px;
        z-index: 6;
        width: 640px;
        height: 150px;
        border-radius: 34px;
        border: 1px solid rgba(250, 250, 247, 0.12);
        background:
          linear-gradient(90deg, rgba(200, 16, 46, 0.16), transparent 32%),
          rgba(250, 250, 247, 0.04);
        box-shadow: 0 28px 90px rgba(0, 0, 0, 0.12);
      }

      .platform-ghost::before {
        content: "ANDES PLATFORM";
        position: absolute;
        left: 26px;
        top: 22px;
        color: rgba(250, 250, 247, 0.5);
        font-size: 12px;
        font-weight: 820;
        letter-spacing: 0.16em;
      }

      .platform-ghost::after {
        content: "tax / customs / logistics / payments / agent rails";
        position: absolute;
        left: 26px;
        bottom: 22px;
        color: rgba(250, 250, 247, 0.76);
        font-size: 24px;
        font-weight: 720;
        letter-spacing: -0.03em;
      }
    </style>
  </head>
  <body>
    <main class="frame">
      <div class="copy">
        <div class="eyebrow">The corridor becomes infrastructure</div>
        <h1>中南米に、<br />新しい経済の<br />基盤を建てる。</h1>
        <p class="lede">日本・韓国からブラジルへ流れる商取引を、AIエージェントが扱える現地インフラへ変換する。</p>
      </div>
      <div class="system-note">
        <span>Japan / Korea origin</span>
        <span>Brazil operating rails</span>
        <span>Agent-readable layer</span>
      </div>
      <div class="platform-ghost"></div>
      <svg viewBox="0 0 ${width} ${height}" aria-hidden="true">
        <defs>
          <linearGradient id="route" x1="0" x2="1">
            <stop offset="0%" stop-color="#fafaf7" stop-opacity="0.16" />
            <stop offset="42%" stop-color="#fafaf7" stop-opacity="0.32" />
            <stop offset="72%" stop-color="#c8102e" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#e83e5c" stop-opacity="1" />
          </linearGradient>
        </defs>
        <path d="${path({ type: "Sphere" })}" class="sphere" />
        <path d="${landPath}" class="land" />
        ${regionPaths}
        <g class="particle-field">
          ${particles}
        </g>
        <path d="${routeA}" class="corridor-band" />
        <path d="${routeA}" class="corridor corridor-core" />
        <path d="${routeB}" class="corridor corridor-ghost" />
        ${fragments.join("\n")}
        ${anchor(tokyoPt, "Tokyo", "origin")}
        ${anchor(seoulPt, "Seoul", "origin", "seoul")}
        ${anchor(saoPt, "Sao Paulo", "operating base")}
      </svg>
      <div class="grain"></div>
    </main>
  </body>
</html>`;

writeFileSync(resolve("design/styleframes/frame-a-v2-corridor.html"), html);
console.log("Generated design/styleframes/frame-a-v2-corridor.html");
