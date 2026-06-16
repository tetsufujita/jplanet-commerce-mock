import { useEffect, useRef } from "react";

/* ================================================================
 * Andes §2「数字 proof」dataviz — 試作（/preview/stats）
 *
 * Stripe JP 再現で構築した依存ゼロ canvas 2D 粒子システム
 * （src/stripe-jp/sections/SjGlobalDataviz.tsx）の Andes 翻案。
 *
 * 4 formation（stat 連動・click 切替、index は AndesStats 側で割当）:
 *   0 burst   放射（市場の拡大）  1 globe 回転粒子球（人口/地理）
 *   2 wave    進行波（決済フロー）3 strands 収束流線（日本⇄ブラジル接続）
 *
 * docs/04・07 準拠:
 *   - paper 地 + Navy 系の粒子。Crimson #C8102E は warm mix の
 *     ごく小面積（burst 核・strands 腰の淡い差し色）のみ = pin-point 規律
 *   - time-of-day テーマ機構は持ち込まない（Stripe の意匠のため）
 * - 形態内: 常時流動 / 形態間: 粒子モーフ（~1.6s・strand stagger）
 * - pointer 反応: カーソル/指の周囲で粒子が滑らかに反発、離れると弾性で戻る
 * - prefers-reduced-motion: 静止 1 フレームを描画して停止
 * ================================================================ */

type RGB = readonly [number, number, number];

interface Palette {
  line: RGB;
  warm: RGB;
  glow: RGB;
  skyTop: RGB;
  skyHorizon: RGB;
}

/* Andes 単一パレット: paper / Navy(#0F1B3D 系) / Crimson(#C8102E) pin-point */
const ANDES_PALETTE: Palette = {
  line: [38, 60, 118],
  warm: [200, 16, 46],
  glow: [150, 165, 195],
  skyTop: [251, 251, 250],
  skyHorizon: [240, 243, 247],
};

/* 論理キャンバス（本家 dataviz の aspect 2468:1038 に一致） */
const W = 1234;
const H = 519;
const S = 260; // strand 本数
const P = 10; // strand あたりの点数
const MORPH_S = 1.6;

/* pointer repel field（録画実測: 影響半径はカーソル周辺 ~2 行分、最大変位は線 2-3 本分） */
const PTR_RADIUS = 150;
const PTR_PUSH = 46;

const TAU = Math.PI * 2;

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function easeInOutCubic(v: number): number {
  return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
}

interface Pt {
  x: number;
  y: number;
  /** 線の不透明度 0..1 */
  a: number;
  /** warm 色の混合率 0..1 */
  w: number;
}

/** formation f における strand s・点 p の位置（t 秒時点） */
function formationPoint(f: number, s: number, p: number, t: number, out: Pt): void {
  const u = s / (S - 1);
  const v = p / (P - 1);

  if (f === 0) {
    /* burst: 底辺中央からの放射。長さは strand ごとに散らし、ゆっくり呼吸。
       線は青、warm は中心ごく近傍のみ（録画 f001: 青い光線 + 橙の核） */
    const cx = W * 0.5;
    const cy = H * 0.97;
    const ang = Math.PI * 0.92 + u * Math.PI * 1.16 + (hash(s) - 0.5) * 0.05;
    const len = H * (0.52 + 0.55 * hash(s + 7)) * (1 + 0.045 * Math.sin(t * 0.9 + s * 1.7));
    const r = len * (0.16 + 0.84 * v);
    out.x = cx + Math.cos(ang) * r * 1.18;
    out.y = cy + Math.sin(ang) * r;
    /* 実測: 原本は中心側も濃い（core [147,194,241]）→ 基底 alpha を上げる */
    out.a = 0.35 + 0.5 * v;
    out.w = clamp01(1 - r / (H * 0.26));
    return;
  }

  if (f === 1) {
    /* globe: 粒子球（中心は画面下外・上半球の dome が見える）。
       可視 cap（cos φ ∈ [0.1, 1]）にランダム分布（等間隔だと螺旋腕の
       格子が出る）。各 strand は回転方向の arc trail（録画 f020） */
    const phi = Math.acos(1 - 0.9 * hash(s + 57));
    /* trail 0.5 rad: 弧が球面に沿って曲がって見える長さ（f020 実測 ~50-200px） */
    const lam = hash(s + 211) * TAU + t * 0.13 - (P - 1 - p) * 0.055;
    const R = H * 0.95;
    const sinPhi = Math.sin(phi);
    const x3 = sinPhi * Math.cos(lam);
    const z3 = sinPhi * Math.sin(lam);
    const y3 = Math.cos(phi);
    out.x = W * 0.5 + R * x3;
    out.y = H * 1.05 - R * y3;
    out.a = z3 > 0 ? 0.26 + 0.58 * z3 : 0.04;
    out.w = 0; // globe は Navy 単色（Crimson は pin-point 規律）
    return;
  }

  if (f === 2) {
    /* wave: 進行する正弦波。縦線が baseline から波頂へ伸びる */
    const x = u * W;
    const yTop = H * 0.5 - H * 0.27 * Math.sin(u * TAU * 1.15 - t * 1.05);
    const yBase = H * 0.94;
    out.x = x;
    out.y = yBase + (yTop - yBase) * v;
    out.a = 0.34 + 0.55 * v;
    out.w = 0;
    return;
  }

  /* strands: 左右の縁の全高から中央の縦の腰へ収束する砂時計型
     （rec-pointer f025 実測: 上半分は下りながら・下半分は上りながら
     waist へ funnel、waist は縦に長い柱で dot が密集、線は腰を少し抜ける） */
  const left = s % 2 === 0;
  const wing = Math.floor(s / 2) / (S / 2 - 1); // 0(上端)..1(下端)
  const x0 = left ? -24 : W + 24;
  const y0 = H * (0.02 + 0.96 * wing);
  /* waist: 縦の柱（0.13H..0.87H）に末端を散布、反対側へ少し抜ける */
  const xe = W * 0.5 + (left ? 1 : -1) * (6 + 34 * hash(s + 13));
  const ye = H * (0.5 + (wing - 0.5) * 0.74);
  const xc = left ? W * 0.32 : W * 0.68;
  const yc = y0 + (ye - y0) * 0.55;
  const iv = 1 - v;
  out.x = iv * iv * x0 + 2 * iv * v * xc + v * v * xe;
  out.y =
    iv * iv * y0 +
    2 * iv * v * yc +
    v * v * ye +
    Math.sin(t * 0.85 + wing * 7 + v * 5.2) * 7 * iv;
  out.a = 0.22 + 0.45 * v;
  /* Crimson は腰の淡い差し色のみ（×0.18 = pin-point 規律） */
  out.w = clamp01((wing - 0.5) * 1.8) * (0.4 + 0.6 * v) * 0.18;
}

/** formation 別の warm glow 背景（録画: burst 中心 / globe 地平 / strands 中央下） */
function drawGlow(
  ctx: CanvasRenderingContext2D,
  f: number,
  alpha: number,
  glow: RGB,
): void {
  if (alpha <= 0.01 || f === 2) return;
  const cx = W * 0.5;
  /* strands(f3) の glow は waist 柱の中心（f025: 腰に沿って濃い） */
  const cy = f === 0 ? H * 0.97 : f === 1 ? H * 1.05 : H * 0.52;
  const r = f === 0 ? H * 0.5 : f === 1 ? H * 0.85 : H * 0.5;
  /* globe は地平の warm glow が球面を透けて強く出る（f020） */
  const peak = f === 0 ? 0.42 : f === 1 ? 0.4 : 0.28;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  const [gr, gg, gb] = glow;
  g.addColorStop(0, `rgba(${String(gr)},${String(gg)},${String(gb)},${String(peak * alpha)})`);
  g.addColorStop(1, `rgba(${String(gr)},${String(gg)},${String(gb)},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export interface AndesDatavizProps {
  /** active stat = formation index 0..3 */
  formation: number;
  ariaLabel: string;
}

export function AndesDataviz({ formation, ariaLabel }: AndesDatavizProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef({ formation });

  useEffect(() => {
    propsRef.current.formation = formation;
  }, [formation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    /* reduced-motion: 静止 1 フレームのみ描画（rAF 継続なし・pointer 場なし） */
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* 画面外では描画停止（本家 lazy 挙動相当） */
    let visible = true;
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
    });
    io.observe(canvas);

    /* pointer 追跡（mouse + touch 共通）。実座標へは描画側で平滑追従させ、
       速いカーソル移動でも場が流体的に遅れてついてくる */
    const ptr = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, s: 0, ts: 0 };
    const toLogical = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      ptr.tx = ((e.clientX - rect.left) / rect.width) * W;
      ptr.ty = ((e.clientY - rect.top) / rect.height) * H;
    };
    const onMove = (e: PointerEvent) => {
      toLogical(e);
      if (ptr.ts === 0) {
        /* 場の初出現はカーソル位置から（前回位置から飛ばない） */
        ptr.x = ptr.tx;
        ptr.y = ptr.ty;
      }
      ptr.ts = 1;
    };
    const onLeave = () => {
      ptr.ts = 0;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointercancel", onLeave);

    let prevF = propsRef.current.formation;
    let curF = prevF;
    let switchAt = -Infinity;

    interface MutRGB {
      r: number;
      g: number;
      b: number;
    }
    const toMut = (c: RGB): MutRGB => ({ r: c[0], g: c[1], b: c[2] });
    const pal = {
      line: toMut(ANDES_PALETTE.line),
      warm: toMut(ANDES_PALETTE.warm),
      glow: toMut(ANDES_PALETTE.glow),
      skyTop: toMut(ANDES_PALETTE.skyTop),
      skyHorizon: toMut(ANDES_PALETTE.skyHorizon),
    };

    const a: Pt = { x: 0, y: 0, a: 0, w: 0 };
    const b: Pt = { x: 0, y: 0, a: 0, w: 0 };
    const xs = new Float32Array(P);
    const ys = new Float32Array(P);

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      if (!reducedMotion) raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!visible) return;

      const t = now / 1000;

      /* formation 切替検知 → モーフ開始 */
      if (propsRef.current.formation !== curF) {
        prevF = curF;
        curF = propsRef.current.formation;
        switchAt = t;
      }
      const tau = t - switchAt;

      /* 空（paper 地） */
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(
        0,
        `rgb(${String(Math.round(pal.skyTop.r))},${String(Math.round(pal.skyTop.g))},${String(Math.round(pal.skyTop.b))})`,
      );
      sky.addColorStop(
        1,
        `rgb(${String(Math.round(pal.skyHorizon.r))},${String(Math.round(pal.skyHorizon.g))},${String(Math.round(pal.skyHorizon.b))})`,
      );
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      /* glow（モーフ中は新旧をクロスフェード） */
      const gMix = easeInOutCubic(clamp01(tau / 1.4));
      const glowRGB: RGB = [pal.glow.r, pal.glow.g, pal.glow.b];
      drawGlow(ctx, prevF, 1 - gMix, glowRGB);
      drawGlow(ctx, curF, gMix, glowRGB);

      const { r: lr, g: lg, b: lb } = pal.line;
      const { r: wr, g: wg, b: wb } = pal.warm;

      /* pointer 場の平滑追従（位置 ~8/s、強度 in 6/s・out 3/s = 弾性の戻り） */
      ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 8);
      ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 8);
      ptr.s += (ptr.ts - ptr.s) * Math.min(1, dt * (ptr.ts > ptr.s ? 6 : 3));
      const ptrActive = ptr.s > 0.01;

      for (let s = 0; s < S; s++) {
        /* strand 単位の stagger つきモーフ率 */
        const e = easeInOutCubic(clamp01((tau - hash(s + 31) * 0.25) / (MORPH_S - 0.25)));
        let alpha = 0;
        let warm = 0;
        for (let p = 0; p < P; p++) {
          formationPoint(curF, s, p, t, a);
          if (e < 1) {
            formationPoint(prevF, s, p, t, b);
            a.x = b.x + (a.x - b.x) * e;
            a.y = b.y + (a.y - b.y) * e;
            a.a = b.a + (a.a - b.a) * e;
            a.w = b.w + (a.w - b.w) * e;
          }
          /* pointer repel: smoothstep falloff で滑らかに押し出す */
          if (ptrActive) {
            const dx = a.x - ptr.x;
            const dy = a.y - ptr.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < PTR_RADIUS && d > 0.001) {
              const q = 1 - d / PTR_RADIUS;
              const push = q * q * (3 - 2 * q) * PTR_PUSH * ptr.s;
              a.x += (dx / d) * push;
              a.y += (dy / d) * push;
            }
          }
          xs[p] = a.x;
          ys[p] = a.y;
          alpha = a.a;
          warm = a.w;
        }

        const r = Math.round(lr + (wr - lr) * warm);
        const g2 = Math.round(lg + (wg - lg) * warm);
        const b2 = Math.round(lb + (wb - lb) * warm);

        ctx.strokeStyle = `rgba(${String(r)},${String(g2)},${String(b2)},${String(alpha * 0.6)})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(xs[0] ?? 0, ys[0] ?? 0);
        for (let p = 1; p < P; p++) ctx.lineTo(xs[p] ?? 0, ys[p] ?? 0);
        ctx.stroke();

        /* head dot（strand 先端の粒子） */
        ctx.fillStyle = `rgba(${String(r)},${String(g2)},${String(b2)},${String(Math.min(1, alpha * 1.5))})`;
        ctx.beginPath();
        ctx.arc(xs[P - 1] ?? 0, ys[P - 1] ?? 0, 1.4 + hash(s + 91) * 1.1, 0, TAU);
        ctx.fill();
      }

      /* globe 限定の ghost 弧（第 2 パス）: 原本 f020 の密度（数百本）に
         近づける。globe の重みに応じて fade するためモーフは破綻しない */
      const globeW = (curF === 1 ? gMix : 0) + (prevF === 1 ? 1 - gMix : 0);
      if (globeW > 0.02) {
        for (let s = 0; s < S; s++) {
          let alpha = 0;
          for (let p = 0; p < P; p++) {
            formationPoint(1, s + S, p, t, a);
            if (ptrActive) {
              const dx = a.x - ptr.x;
              const dy = a.y - ptr.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < PTR_RADIUS && d > 0.001) {
                const q = 1 - d / PTR_RADIUS;
                const push = q * q * (3 - 2 * q) * PTR_PUSH * ptr.s;
                a.x += (dx / d) * push;
                a.y += (dy / d) * push;
              }
            }
            xs[p] = a.x;
            ys[p] = a.y;
            alpha = a.a;
          }
          ctx.strokeStyle = `rgba(${String(Math.round(lr))},${String(Math.round(lg))},${String(Math.round(lb))},${String(alpha * 0.5 * globeW)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(xs[0] ?? 0, ys[0] ?? 0);
          for (let p = 1; p < P; p++) ctx.lineTo(xs[p] ?? 0, ys[p] ?? 0);
          ctx.stroke();
          ctx.fillStyle = `rgba(${String(Math.round(lr))},${String(Math.round(lg))},${String(Math.round(lb))},${String(Math.min(1, alpha * 1.2) * globeW)})`;
          ctx.beginPath();
          ctx.arc(xs[P - 1] ?? 0, ys[P - 1] ?? 0, 1.2 + hash(s + 313) * 1, 0, TAU);
          ctx.fill();
        }
      }
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      /* touch-action: pan-y = 縦スクロールは妨げず、指の横なぞりは流体反応へ */
      className="absolute inset-0 h-full w-full [touch-action:pan-y]"
      role="img"
      aria-label={ariaLabel}
    />
  );
}
