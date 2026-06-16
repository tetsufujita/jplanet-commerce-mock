import { useEffect, useRef, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GLOBE_DOTS } from "@/shopify-jp/sections/globeDots";
import { SpContainer } from "@/shopify-jp/ui/SpContainer";
import { SpGlowEllipse } from "@/shopify-jp/ui/SpGlowEllipse";
import { SpSection } from "@/shopify-jp/ui/SpSection";
import { useStageTimeline } from "@/shopify-jp/ui/hooks";

/**
 * 12-speed — 「圧倒的な安定性。驚異的なスピード。」
 * spec: design/reproductions/shopify-jp/recordings/spec-s12-globe.md（録画 f2 実測）
 * hand-rolled canvas 2D + motion/react のみ（Three.js / cobe 禁止 — AGENTS.md Stack 固定）。
 * 描画順: 星空 → 球地 → 陸ドット → 都市光 → 弧 → 着地burst/花火 → rim light。
 * 回転: idle 1.75°/s（表面 左→右）+ drag trackball + 慣性。tooltip は world-anchored ×3 巡回。
 */

// ---------------------------------------------------------------------------
// COPY（学習用 sandbox のため i18n と分離。site 移植時は locales JSON へ）
// ---------------------------------------------------------------------------

const HEADING = "圧倒的な安定性。驚異的なスピード。";
const BODY = "アクセスが集中する大型セールのさなかでも、あなたのストアは落ちずに動き続けます。";
const GLOBE_ARIA = "店舗から世界中の顧客への注文の流れを示す線が付いた、回転する地球のアニメーション";

// ---------------------------------------------------------------------------
// 定数 — 幾何 / 回転 / 弧 / counter（spec §2–§4 観測値）
// ---------------------------------------------------------------------------

const DEG = Math.PI / 180;
const GLOBE_R_RATIO = 600 / 1368; // 本家 #globe-container 1368px 中の球半径 600px
const IDLE_DEG_S = 1.75; // idle 自転 °/s（表面 左→右 = yaw 増加）
const VELOCITY_DECAY = 2.4; // 慣性の指数減衰 1/s（~1.7s で idle へ収束）
const DRAG_V_CLAMP = 130; // release 直後の momentum 上限 °/s（観測ピーク ~100–125）
const PITCH_MAX = 85 * DEG;
const MAX_ARCS = 8; // 同時可視 4–8 本
const SPAWN_MIN_MS = 250; // 発生 cadence 0.25–0.5s
const SPAWN_JITTER_MS = 250;
const COUNTER_START = 1_634_927_584_310; // tooltip② $1,6xx,xxx,xxx,xxx
const COUNTER_RATE = 41_000; // $/s（live counter の桁が回って見える増分）
const STATIC_T = 4_000; // reduced-motion 静止 frame の擬似時刻

// 都市光 ~56 都市 [lat, lon, weight]。東アジア / 北米 / 欧州 weighted（spec §3 起点分布）
const CITY_LIGHTS: readonly (readonly [number, number, number])[] = [
  // 東アジア
  [35.7, 139.7, 3], // 東京
  [34.7, 135.5, 2], // 大阪
  [35.2, 136.9, 1.5], // 名古屋
  [43.1, 141.3, 1], // 札幌
  [33.6, 130.4, 1.5], // 福岡
  [37.6, 127.0, 2.5], // ソウル
  [35.2, 129.1, 1.5], // 釜山
  [39.9, 116.4, 2], // 北京
  [31.2, 121.5, 2.5], // 上海
  [22.5, 114.1, 2], // 深圳
  [22.3, 114.2, 2], // 香港
  [25.0, 121.6, 1.5], // 台北
  // 東南アジア / インド
  [14.6, 121.0, 1], // マニラ
  [13.8, 100.5, 1.5], // バンコク
  [1.35, 103.8, 2], // シンガポール
  [-6.2, 106.8, 1.5], // ジャカルタ
  [3.1, 101.7, 1], // クアラルンプール
  [10.8, 106.7, 1], // ホーチミン
  [19.1, 72.9, 1.5], // ムンバイ
  [28.6, 77.2, 1.5], // デリー
  [13.0, 77.6, 1], // バンガロール
  // オセアニア
  [-33.9, 151.2, 2], // シドニー
  [-37.8, 145.0, 1.5], // メルボルン
  [-27.5, 153.0, 1], // ブリスベン
  [-32.0, 115.9, 0.8], // パース
  [-36.8, 174.8, 0.8], // オークランド
  // 欧州
  [51.5, -0.1, 2.5], // ロンドン
  [48.9, 2.35, 2], // パリ
  [52.5, 13.4, 1.5], // ベルリン
  [40.4, -3.7, 1.2], // マドリード
  [45.5, 9.2, 1.2], // ミラノ
  [52.4, 4.9, 1.2], // アムステルダム
  [59.3, 18.1, 0.8], // ストックホルム
  [38.7, -9.1, 0.8], // リスボン
  [53.3, -6.3, 0.8], // ダブリン
  [52.2, 21.0, 0.8], // ワルシャワ
  [41.0, 28.9, 1], // イスタンブール
  // 北米
  [40.7, -74.0, 3], // NY
  [34.1, -118.2, 2.5], // LA
  [41.9, -87.6, 2], // シカゴ
  [43.7, -79.4, 2], // トロント
  [37.8, -122.4, 2], // SF
  [47.6, -122.3, 1.5], // シアトル
  [49.3, -123.1, 1.2], // バンクーバー
  [25.8, -80.2, 1.5], // マイアミ
  [32.8, -96.8, 1.2], // ダラス
  [33.7, -84.4, 1.2], // アトランタ
  [39.7, -105.0, 1], // デンバー
  [19.4, -99.1, 1.5], // メキシコシティ
  // 中南米
  [-23.55, -46.6, 1.5], // サンパウロ
  [-34.6, -58.4, 1], // ブエノスアイレス
  [4.7, -74.1, 0.8], // ボゴタ
  [-12.0, -77.0, 0.8], // リマ
  [-33.4, -70.7, 0.8], // サンティアゴ
  // 中東 / アフリカ
  [25.2, 55.3, 1], // ドバイ
  [32.1, 34.8, 0.8], // テルアビブ
  [30.0, 31.2, 0.8], // カイロ
  [6.5, 3.4, 0.8], // ラゴス
  [-26.2, 28.0, 0.8], // ヨハネスブルク
];

// ---------------------------------------------------------------------------
// tooltip 3 種（spec §4）。lat / dLon = 表示開始時の正面経度からの offset（world-anchored）
// ---------------------------------------------------------------------------

interface TooltipDef {
  id: string;
  icon: "store" | "coin" | "popper";
  big: string;
  small: string;
  lat: number;
  dLon: number;
}

// 本家ブランド名は架空ブランド konoha に置換（再現規約）
const TOOLTIPS: readonly TooltipDef[] = [
  {
    id: "merchants",
    icon: "store",
    big: "数百万社",
    small: "konohaを利用するマーチャントの数",
    lat: 36,
    dLon: 22,
  },
  {
    id: "sales",
    icon: "coin",
    big: "$1,634,927,584,310",
    small: "販売合計（現在も増加中）",
    lat: 38,
    dLon: -24,
  },
  {
    id: "first-sale",
    icon: "popper",
    big: "26秒に1回",
    small: "konohaで起業家が初めての売上を達成している頻度",
    lat: 52,
    dLon: 6,
  },
];

// ①→②→③ を 5–6s 周期で巡回（表示 3.6–4.4s + 休止 1.8s、spec §4 サイクル）
const TOOLTIP_STAGES = [
  { key: "t0", ms: 3600 },
  { key: "g0", ms: 1800 },
  { key: "t1", ms: 4400 },
  { key: "g1", ms: 1800 },
  { key: "t2", ms: 3600 },
  { key: "g2", ms: 1800 },
] as const;

// ---------------------------------------------------------------------------
// 内部 helper
// ---------------------------------------------------------------------------

type Vec3 = readonly [number, number, number];

interface City {
  v: Vec3;
  w: number;
}

interface Arc {
  a: Vec3;
  b: Vec3;
  omega: number;
  sinO: number;
  h: number; // 高度バンプ 0.08–0.18R
  spawn: number;
  flight: number; // head が 0→1 する時間 ms
  tail: number; // tail の遅延 ms（grow → fade-tail）
  landed: boolean;
}

interface BurstParticle {
  ang: number;
  dist: number;
  r: number;
  color: string;
}

interface Burst {
  v: Vec3;
  start: number;
  dur: number;
  firework: boolean;
  parts: BurstParticle[];
}

const FIREWORK_COLORS = ["#E879F9", "#F472B6", "#A78BFA", "#7DF5C2"];

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

const latLonToVec = (latDeg: number, lonDeg: number): Vec3 => {
  const phi = latDeg * DEG;
  const lam = lonDeg * DEG;
  return [Math.cos(phi) * Math.sin(lam), Math.sin(phi), Math.cos(phi) * Math.cos(lam)];
};

const dot3 = (p: Vec3, q: Vec3): number => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];

/** 発光 sprite（shadowBlur 不使用 — spec §6 パフォーマンス） */
const makeSprite = (inner: string, mid: string): HTMLCanvasElement => {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.35, mid);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  }
  return c;
};

// ---------------------------------------------------------------------------
// <GlobeCanvas> — canvas ×1 + rAF（全描画 + 回転 / drag / 弧 / burst / tooltip 投影）
// ---------------------------------------------------------------------------

interface GlobeCanvasProps {
  reduced: boolean;
  /** 表示中 tooltip index（-1 = 非表示） */
  activeTooltip: number;
  tooltipBoxRef: RefObject<HTMLDivElement | null>;
  counterRef: RefObject<HTMLSpanElement | null>;
}

function GlobeCanvas({ reduced, activeTooltip, tooltipBoxRef, counterRef }: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef(activeTooltip);

  useEffect(() => {
    activeRef.current = activeTooltip;
  }, [activeTooltip]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // -- 決定論 RNG（speckle / 弧抽選を再現可能に）
    let seed = 0x2f6e2b1;
    const rnd = (): number => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    // -- 陸ドット: GLOBE_DOTS + jitter 衛星 ×2 で speckle 密度を補う（事前 Float32Array 化）
    const baseN = GLOBE_DOTS.length;
    const n = baseN * 3;
    const unit = new Float32Array(n * 3);
    const dotR = new Float32Array(n);
    for (let i = 0; i < baseN; i++) {
      const d = GLOBE_DOTS[i];
      if (!d) continue;
      for (let s = 0; s < 3; s++) {
        const j = i * 3 + s;
        const lat = s === 0 ? d[0] : clamp(d[0] + (rnd() - 0.5) * 2.4, -88, 88);
        const lon = s === 0 ? d[1] : d[1] + (rnd() - 0.5) * 2.4;
        const v = latLonToVec(lat, lon);
        unit[j * 3] = v[0];
        unit[j * 3 + 1] = v[1];
        unit[j * 3 + 2] = v[2];
        dotR[j] = s === 0 ? 2.1 + rnd() * 0.9 : 1.1 + rnd() * 0.9;
      }
    }

    // -- 都市光
    const cities: City[] = CITY_LIGHTS.map(([lat, lon, w]) => ({ v: latLonToVec(lat, lon), w }));
    const totalW = cities.reduce((acc, c) => acc + c.w, 0);
    const pickCity = (): City => {
      let r = rnd() * totalW;
      for (const c of cities) {
        r -= c.w;
        if (r <= 0) return c;
      }
      return cities[0] ?? { v: [0, 0, 1], w: 1 };
    };

    // -- sprite
    const citySprite = makeSprite("rgba(255,236,190,0.95)", "rgba(255,170,70,0.45)");
    const headSprite = makeSprite("rgba(255,255,255,1)", "rgba(255,214,140,0.55)");
    const pinkSprite = makeSprite("rgba(255,214,238,0.95)", "rgba(240,90,180,0.5)");

    // -- 星空（固定座標 ~80 点、sin 明滅・位相ばらし）
    const stars = Array.from({ length: 80 }, () => ({
      fx: rnd(),
      fy: rnd(),
      ph: rnd() * Math.PI * 2,
      sp: 0.4 + rnd() * 0.8,
      r: 0.6 + rnd() * 0.9,
    }));

    // -- 回転状態（ref 相当、re-render しない）。初期正面 = 東アジア（lon 140°E、観測 f2 の陸量に合わせる）
    const rot = { yaw: -140 * DEG, pitch: 18 * DEG, vYaw: IDLE_DEG_S, vPitch: 0 };

    // -- canvas 寸法（dpr cap 2）
    let W = 0;
    let H = 0;
    let cx = 0;
    let cy = 0;
    let R = 1;
    let oceanGrad: CanvasGradient | null = null;
    let rimGrad: CanvasGradient | null = null;
    const resize = (): void => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
      R = W * GLOBE_R_RATIO;
      oceanGrad = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.1, cx, cy, R);
      oceanGrad.addColorStop(0, "#0E2840");
      oceanGrad.addColorStop(0.55, "#081A2C");
      oceanGrad.addColorStop(1, "#03090F");
      rimGrad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      rimGrad.addColorStop(0, "rgba(125,195,255,0.55)");
      rimGrad.addColorStop(0.45, "rgba(125,195,255,0.08)");
      rimGrad.addColorStop(1, "rgba(125,195,255,0)");
    };
    resize();

    // -- frame ごとの回転係数
    let cosY = 1;
    let sinY = 0;
    let cosP = 1;
    let sinP = 0;
    const setFrameRot = (): void => {
      cosY = Math.cos(rot.yaw);
      sinY = Math.sin(rot.yaw);
      cosP = Math.cos(rot.pitch);
      sinP = Math.sin(rot.pitch);
    };

    // -- 弧
    const arcs: Arc[] = [];
    /** 現在の回転での前面深度 z（>0 = 可視半球） */
    const frontZ = (v: Vec3): number => {
      const z1 = -v[0] * Math.sin(rot.yaw) + v[2] * Math.cos(rot.yaw);
      return v[1] * Math.sin(rot.pitch) + z1 * Math.cos(rot.pitch);
    };
    const makeArc = (now: number, preAged: boolean): void => {
      if (arcs.length >= MAX_ARCS) return;
      // 起点は都市 weighted ＋ 可視半球 bias（裏側だけで飛んで見えないのを防ぐ）
      let a = pickCity();
      for (let k = 0; k < 8 && frontZ(a.v) < 0.05; k++) a = pickCity();
      let b: City | null = null;
      for (let k = 0; k < 10; k++) {
        const cand = pickCity();
        if (cand !== a && dot3(a.v, cand.v) < 0.94 && (frontZ(cand.v) > -0.2 || k >= 6)) {
          b = cand;
          break;
        }
      }
      if (!b) return;
      const omega = Math.acos(clamp(dot3(a.v, b.v), -1, 1));
      const sinO = Math.sin(omega);
      if (sinO < 1e-4) return;
      const flight = 700 + rnd() * 800;
      arcs.push({
        a: a.v,
        b: b.v,
        omega,
        sinO,
        h: 0.08 + rnd() * 0.1,
        spawn: preAged ? now - flight * (0.2 + rnd() * 0.6) : now,
        flight,
        tail: flight * (0.45 + rnd() * 0.3),
        landed: false,
      });
    };

    // -- 着地 burst / 花火
    const bursts: Burst[] = [];
    const spawnBurst = (v: Vec3, now: number): void => {
      const firework = rnd() < 0.2; // 確率 ~20% で花火へ昇格
      const count = firework ? 26 : 8;
      const parts: BurstParticle[] = Array.from({ length: count }, () => ({
        ang: rnd() * Math.PI * 2,
        dist: firework ? 26 + rnd() * 30 : 8 + rnd() * 10,
        r: firework ? 1.2 + rnd() * 1.6 : 1 + rnd() * 1.2,
        color: firework
          ? (FIREWORK_COLORS[Math.floor(rnd() * FIREWORK_COLORS.length)] ?? "#F472B6")
          : "#F472B6",
      }));
      bursts.push({ v, start: now, dur: firework ? 1200 : 420, firework, parts });
    };

    // -- tooltip world-anchor（表示開始時に正面経度 + dLon で係留 → 以後回転に追従）
    let anchorVec: Vec3 | null = null;
    let lastTooltip = -2;
    let counterVal = COUNTER_START + Math.floor(rnd() * 4_000_000);
    const updateTooltip = (): void => {
      const idx = activeRef.current;
      if (idx !== lastTooltip) {
        lastTooltip = idx;
        const def = idx >= 0 ? TOOLTIPS[idx] : undefined;
        if (def) anchorVec = latLonToVec(def.lat, -rot.yaw / DEG + def.dLon);
      }
      const box = tooltipBoxRef.current;
      if (!box || !anchorVec) return;
      const x1 = anchorVec[0] * cosY + anchorVec[2] * sinY;
      const z1 = -anchorVec[0] * sinY + anchorVec[2] * cosY;
      const y1 = anchorVec[1] * cosP - z1 * sinP;
      const z2 = anchorVec[1] * sinP + z1 * cosP;
      const sx = cx + x1 * R;
      const sy = cy - y1 * R;
      box.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
      // 裏側へ回ったら強制 fade-out（z<0.12）
      box.style.opacity = z2 > 0.12 ? "1" : "0";
    };

    // -- 全描画（spec §6 描画レイヤ詳細）
    const draw = (now: number): void => {
      ctx.clearRect(0, 0, W, H);
      setFrameRot();
      const sc = R / 600;

      // 1. 星空
      ctx.fillStyle = "#CFE7DC";
      for (const s of stars) {
        ctx.globalAlpha = 0.18 + 0.4 * (0.5 + 0.5 * Math.sin((now / 1000) * s.sp + s.ph));
        ctx.fillRect(s.fx * W, s.fy * H, s.r, s.r);
      }
      ctx.globalAlpha = 1;

      // 2. 球地（dark navy 海）
      if (oceanGrad) {
        ctx.fillStyle = oceanGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. 陸ドット（teal-green speckle、z でサイズ / alpha 減衰）
      ctx.fillStyle = "#35D695";
      for (let i = 0; i < n; i++) {
        const ux = unit[i * 3] ?? 0;
        const uy = unit[i * 3 + 1] ?? 0;
        const uz = unit[i * 3 + 2] ?? 0;
        const x1 = ux * cosY + uz * sinY;
        const z1 = -ux * sinY + uz * cosY;
        const y1 = uy * cosP - z1 * sinP;
        const z2 = uy * sinP + z1 * cosP;
        if (z2 < 0.02) continue;
        const r = Math.max(0.8, (dotR[i] ?? 1.5) * sc) * (0.6 + 0.4 * z2);
        ctx.globalAlpha = 0.24 + 0.66 * z2;
        ctx.fillRect(cx + x1 * R - r / 2, cy - y1 * R - r / 2, r, r);
      }
      ctx.globalAlpha = 1;

      // 4. 都市光（暖色金 sprite、加算発光）
      ctx.globalCompositeOperation = "lighter";
      for (const c of cities) {
        const x1 = c.v[0] * cosY + c.v[2] * sinY;
        const z1 = -c.v[0] * sinY + c.v[2] * cosY;
        const y1 = c.v[1] * cosP - z1 * sinP;
        const z2 = c.v[1] * sinP + z1 * cosP;
        if (z2 < 0.05) continue;
        const size = (9 + c.w * 6) * sc * (0.55 + 0.45 * z2);
        ctx.globalAlpha = Math.min(1, 0.25 + z2 * 0.75);
        ctx.drawImage(citySprite, cx + x1 * R - size / 2, cy - y1 * R - size / 2, size, size);
      }

      // 5. 弧（彗星: head 輝点 + 減衰 tail、grow → fade-tail）
      const SAMPLES = 22;
      for (let ai = arcs.length - 1; ai >= 0; ai--) {
        const arc = arcs[ai];
        if (!arc) continue;
        const t = now - arc.spawn;
        const headP = Math.min(1, t / arc.flight);
        const tailP = Math.max(0, (t - arc.tail) / arc.flight);
        if (tailP >= 1) {
          arcs.splice(ai, 1);
          continue;
        }
        if (headP >= 1 && !arc.landed) {
          arc.landed = true;
          spawnBurst(arc.b, now);
        }
        const chain = t < arc.flight * 0.22; // 発射直後は粒子の鎖として立ち上がる
        let px = 0;
        let py = 0;
        let pVisible = false;
        for (let i = 0; i <= SAMPLES; i++) {
          const u = tailP + (headP - tailP) * (i / SAMPLES);
          const w1 = Math.sin((1 - u) * arc.omega) / arc.sinO;
          const w2 = Math.sin(u * arc.omega) / arc.sinO;
          const lift = 1 + arc.h * Math.sin(Math.PI * u);
          const vx = (arc.a[0] * w1 + arc.b[0] * w2) * lift;
          const vy = (arc.a[1] * w1 + arc.b[1] * w2) * lift;
          const vz = (arc.a[2] * w1 + arc.b[2] * w2) * lift;
          const x1 = vx * cosY + vz * sinY;
          const z1 = -vx * sinY + vz * cosY;
          const y1 = vy * cosP - z1 * sinP;
          const z2 = vy * sinP + z1 * cosP;
          const sx = cx + x1 * R;
          const sy = cy - y1 * R;
          // 高度があるので limb 外は z<0 でも可視
          const visible = z2 > 0.01 || (sx - cx) ** 2 + (sy - cy) ** 2 > R * R;
          const frac = i / SAMPLES;
          if (visible) {
            const alpha = Math.pow(frac, 1.4) * 0.95;
            if (chain) {
              ctx.globalAlpha = alpha;
              ctx.fillStyle = "rgba(255,228,178,1)";
              ctx.beginPath();
              ctx.arc(sx, sy, Math.max(0.7, 1.1 * sc), 0, Math.PI * 2);
              ctx.fill();
            } else if (pVisible) {
              ctx.globalAlpha = alpha;
              ctx.strokeStyle = "rgba(255,228,178,1)";
              ctx.lineWidth = Math.max(1, 2 * sc) * (0.5 + 0.5 * frac);
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(sx, sy);
              ctx.stroke();
            }
          }
          if (i === SAMPLES && headP < 1 && visible) {
            const hs = 12 * sc;
            ctx.globalAlpha = 1;
            ctx.drawImage(headSprite, sx - hs / 2, sy - hs / 2, hs, hs);
          }
          px = sx;
          py = sy;
          pVisible = visible;
        }
      }
      ctx.globalAlpha = 1;

      // 6. 着地 burst / 花火（ピンク → 紫 / ピンク / 緑 particle）
      for (let bi = bursts.length - 1; bi >= 0; bi--) {
        const burst = bursts[bi];
        if (!burst) continue;
        const t = (now - burst.start) / burst.dur;
        if (t >= 1) {
          bursts.splice(bi, 1);
          continue;
        }
        const x1 = burst.v[0] * cosY + burst.v[2] * sinY;
        const z1 = -burst.v[0] * sinY + burst.v[2] * cosY;
        const y1 = burst.v[1] * cosP - z1 * sinP;
        const z2 = burst.v[1] * sinP + z1 * cosP;
        if (z2 < 0.03) continue;
        const sx = cx + x1 * R;
        const sy = cy - y1 * R;
        const ease = 1 - Math.pow(1 - t, 3);
        const fade = 1 - t;
        const gs = (burst.firework ? 18 : 13) * sc * (1 - t * 0.5);
        ctx.globalAlpha = fade;
        ctx.drawImage(pinkSprite, sx - gs / 2, sy - gs / 2, gs, gs);
        for (const p of burst.parts) {
          const d = p.dist * ease * sc;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = fade;
          ctx.beginPath();
          ctx.arc(sx + Math.cos(p.ang) * d, sy + Math.sin(p.ang) * d, p.r * sc, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // 7. rim light（デイサイド側の青、静的）
      if (rimGrad) {
        ctx.strokeStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
        ctx.globalAlpha = 0.25;
        ctx.lineWidth = 6 * sc;
        ctx.stroke();
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 1.6 * sc;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // 8. tooltip（world-anchored、DOM transform 直更新）
      updateTooltip();
    };

    // ------------------------------------------------------------------
    // reduced-motion: 静止 1 frame + 静的弧 4 本 + drag 無効 + counter 固定
    // ------------------------------------------------------------------
    if (reduced) {
      for (let i = 0; i < 4; i++) makeArc(STATIC_T, true);
      draw(STATIC_T);
      const ro = new ResizeObserver(() => {
        resize();
        draw(STATIC_T);
      });
      ro.observe(canvas);
      return () => {
        ro.disconnect();
      };
    }

    // ------------------------------------------------------------------
    // 通常: rAF ループ + drag + 慣性 + off-screen 停止（再開時は弧が既に飛んでいる）
    // ------------------------------------------------------------------
    canvas.style.cursor = "default";

    const drag = { active: false, id: -1, lastX: 0, lastY: 0, lastT: 0, vx: 0, vy: 0 };
    const inGlobe = (e: PointerEvent): boolean => {
      const rect = canvas.getBoundingClientRect();
      const dx = e.clientX - rect.left - cx;
      const dy = e.clientY - rect.top - cy;
      return dx * dx + dy * dy <= R * R;
    };
    const onDown = (e: PointerEvent): void => {
      if (!inGlobe(e)) return;
      drag.active = true;
      drag.id = e.pointerId;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      drag.lastT = performance.now();
      drag.vx = 0;
      drag.vy = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent): void => {
      if (!drag.active || e.pointerId !== drag.id) {
        canvas.style.cursor = inGlobe(e) ? "grab" : "default";
        return;
      }
      const nowT = performance.now();
      const dtm = Math.max(8, nowT - drag.lastT);
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;
      const kDeg = 70 / R; // px → deg（trackball）
      rot.yaw += dx * kDeg * DEG;
      rot.pitch = clamp(rot.pitch + dy * kDeg * DEG, -PITCH_MAX, PITCH_MAX);
      // 直近数 frame で速度を平滑化
      drag.vx = drag.vx * 0.6 + ((dx * kDeg) / (dtm / 1000)) * 0.4;
      drag.vy = drag.vy * 0.6 + ((dy * kDeg) / (dtm / 1000)) * 0.4;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      drag.lastT = nowT;
    };
    const endDrag = (e: PointerEvent): void => {
      if (!drag.active || e.pointerId !== drag.id) return;
      drag.active = false;
      rot.vYaw = clamp(drag.vx, -DRAG_V_CLAMP, DRAG_V_CLAMP);
      rot.vPitch = clamp(drag.vy, -DRAG_V_CLAMP, DRAG_V_CLAMP);
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    let raf = 0;
    let running = false;
    let last = 0;
    let nextSpawn = 0;
    const loop = (ts: number): void => {
      const dt = clamp((ts - last) / 1000, 0, 0.05);
      last = ts;
      if (!drag.active) {
        rot.yaw += rot.vYaw * DEG * dt;
        rot.pitch = clamp(rot.pitch + rot.vPitch * DEG * dt, -PITCH_MAX, PITCH_MAX);
        // release 後 momentum → ease-out で idle 自転へ復帰
        const k = Math.exp(-VELOCITY_DECAY * dt);
        rot.vYaw = IDLE_DEG_S + (rot.vYaw - IDLE_DEG_S) * k;
        rot.vPitch *= k;
      }
      if (ts >= nextSpawn) {
        makeArc(ts, false);
        nextSpawn = ts + SPAWN_MIN_MS + rnd() * SPAWN_JITTER_MS;
      }
      if (arcs.length < 4) makeArc(ts, false); // 同時可視 4–8 本の下限を維持
      counterVal += COUNTER_RATE * dt;
      if (activeRef.current === 1) {
        const el = counterRef.current;
        if (el) el.textContent = `$${Math.floor(counterVal).toLocaleString("en-US")}`;
      }
      draw(ts);
      if (running) raf = requestAnimationFrame(loop);
    };
    const start = (): void => {
      if (running) return;
      running = true;
      last = performance.now();
      // 「常時稼働に見える」要件: 進入 / 再開の瞬間に弧が既に飛んでいる
      while (arcs.length < 5) makeArc(last, true);
      nextSpawn = last + 150;
      raf = requestAnimationFrame(loop);
    };
    const stop = (): void => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
        else stop();
      },
      { rootMargin: "120px" },
    );
    io.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
    };
  }, [reduced, tooltipBoxRef, counterRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ touchAction: "pan-y" }}
    />
  );
}

// ---------------------------------------------------------------------------
// <GlobeTooltip> — 濃色半透明ピル + 緑モノスペース（位置 / 隠面は canvas 側が直更新）
// ---------------------------------------------------------------------------

function TooltipIcon({ kind }: { kind: TooltipDef["icon"] }) {
  if (kind === "store") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 9l2-5h14l2 5" />
        <path d="M4 9v11h16V9" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }
  if (kind === "coin") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10" />
        <path d="M15 9.2c-.6-.9-1.7-1.4-3-1.4-1.7 0-3 .9-3 2.1 0 2.8 6 1.4 6 4.2 0 1.2-1.3 2.1-3 2.1-1.3 0-2.4-.5-3-1.4" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 19l4-11 7 7-11 4z" />
      <path d="M13 5l1-2" />
      <path d="M17 8l2-1" />
      <path d="M19 12l2 1" />
    </svg>
  );
}

interface GlobeTooltipProps {
  index: number;
  boxRef: RefObject<HTMLDivElement | null>;
  counterRef: RefObject<HTMLSpanElement | null>;
}

function GlobeTooltip({ index, boxRef, counterRef }: GlobeTooltipProps) {
  const reduced = useReducedMotion();
  const def = index >= 0 ? TOOLTIPS[index] : undefined;
  return (
    <div
      ref={boxRef}
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-20 transition-opacity duration-300"
      style={{ opacity: 0 }}
    >
      <div style={{ transform: "translate(-50%, -130%)" }}>
        <AnimatePresence>
          {def ? (
            <motion.div
              key={def.id}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex w-max items-center gap-3 rounded-2xl border border-[#36F4A4]/25 bg-[#04140F]/85 px-4 py-3 backdrop-blur-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#36F4A4]/15 text-[#36F4A4]">
                <TooltipIcon kind={def.icon} />
              </span>
              <span className="flex flex-col">
                <span className="font-mono text-[17px] leading-tight font-medium text-[#7DF5C2]">
                  {def.id === "sales" ? <span ref={counterRef}>{def.big}</span> : def.big}
                </span>
                <span className="mt-0.5 max-w-[230px] font-mono text-[10.5px] leading-snug text-[#8FB8A8]">
                  {def.small}
                </span>
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// globe stage — GlobeCanvas + GlobeTooltip の配線（tooltip ①→②→③ 巡回）
// ---------------------------------------------------------------------------

function GlobeStage() {
  const reduced = useReducedMotion() ?? false;
  const { ref, stageKey, running } = useStageTimeline<HTMLDivElement>(TOOLTIP_STAGES);
  const tooltipBoxRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);

  const cycleIdx = stageKey === "t0" ? 0 : stageKey === "t1" ? 1 : stageKey === "t2" ? 2 : -1;
  const shown = reduced ? 0 : running ? cycleIdx : -1;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={GLOBE_ARIA}
      className="absolute -top-[18%] -left-[28%] aspect-square w-[150%] lg:-top-[220px] lg:-left-[336px] lg:h-[1368px] lg:w-[1368px]"
    >
      <GlobeCanvas
        reduced={reduced}
        activeTooltip={shown}
        tooltipBoxRef={tooltipBoxRef}
        counterRef={counterRef}
      />
      <GlobeTooltip index={shown} boxRef={tooltipBoxRef} counterRef={counterRef} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// section 本体
// ---------------------------------------------------------------------------

export function SpSpeed() {
  return (
    // 本家は overflow-x-clip + 次 section の rounded card が下端を被覆（実質露出 777px）。
    // 単体再現では overflow-hidden で section 境界に clip し、行高 778px で固定。
    <SpSection id="12-speed" bg="pine" className="z-10 overflow-hidden pt-[90px] md:pt-0">
      {/* deco glow ×2 — 本家は CSS background-image（capture 不可視）→ radial glow で代替 */}
      <SpGlowEllipse
        color="rgba(20,90,66,0.12)"
        className="-top-[4%] -left-[15%] h-[620px] w-[920px]"
      />
      <SpGlowEllipse
        color="rgba(13,64,50,0.16)"
        className="top-[8%] left-1/2 h-[700px] w-[1100px] -translate-x-[46%]"
      />

      <SpContainer className="relative z-10">
        <div className="grid gap-y-12 md:grid-cols-12 md:gap-x-6">
          {/* 左カラム — globe（section 左上に bleed） */}
          <div className="relative z-10 h-[54vw] md:col-span-6 lg:h-[778px]">
            <GlobeStage />
          </div>

          {/* 右カラム — 見出し + 短文（縦中央）。globe と独立して完全固定（spec §1） */}
          <div className="z-20 flex flex-col justify-center pb-[90px] md:col-span-5 md:col-start-8 md:pb-0 lg:col-span-4 lg:col-start-9">
            <h3 className="mb-6 max-w-[6.2em] text-[45px] leading-[55px] font-[350] text-white md:max-w-[5.4em]">
              {HEADING}
            </h3>
            <p className="max-w-[300px] text-[18px] leading-[29px] text-balance text-[#99B3AD]">
              {BODY}
            </p>
          </div>
        </div>
      </SpContainer>
    </SpSection>
  );
}
