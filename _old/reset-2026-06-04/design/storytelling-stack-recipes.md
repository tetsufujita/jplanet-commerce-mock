---
title: storytelling stack recipes
purpose: Codex 実装用 cinematic site recipe 集
stack: Next.js 15.5 (App Router) / React 19.1 / TypeScript strict / Tailwind v4
updated: 2026-05-22
---

# storytelling stack recipes

cinematic ピボット用の Lenis / GSAP / Three.js 雛形集。Codex はこの recipe を `src/components/cinematic/` 配下に展開して実装する。

---

## 0. 全体方針

| 層 | 担当 | client / server |
|---|---|---|
| Lenis | smooth scroll の発生源、`scroll` 値を GSAP に流す | `'use client'`（root 直下に 1 個だけ） |
| GSAP + ScrollTrigger | chapter reveal / pinning / parallax / text split | `'use client'`（section ごと） |
| react-three-fiber | カーソル反応 paint、background WebGL layer | `'use client'`（dynamic import） |
| next-intl | 文言は全て `messages/{locale}.json` | server / client 両対応のまま |

> 原則：cinematic component は全て `'use client'`。server component で wrap して i18n message を props で流す（後述 §4）。

---

## 1. Lenis smooth scroll

### 1.1 install

```bash
pnpm add lenis
```

### 1.2 最小動く snippet

`src/components/cinematic/SmoothScrollProvider.tsx`

```tsx
'use client';

import Lenis from 'lenis';
import { useEffect, useRef, type ReactNode } from 'react';

type Props = { children: ReactNode };

// Lenis を root に 1 個だけ生やす。複数生やすと scroll event が衝突する。
export function SmoothScrollProvider({ children }: Props) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 1) prefers-reduced-motion を尊重して即 return（DOM scroll に戻す）
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // 2) Lenis 本体
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // ease-out-expo
      smoothWheel: true,
      // touch device は OS の慣性 scroll に任せる（Lenis の touch 補間は jank の元）
      syncTouch: false,
    });
    lenisRef.current = lenis;

    // 3) rAF loop（Lenis 自身が ScrollTrigger.update を呼ぶわけではない、§2.4 参照）
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
```

`src/app/[locale]/layout.tsx` で root を wrap：

```tsx
import { SmoothScrollProvider } from '@/components/cinematic/SmoothScrollProvider';

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
```

### 1.3 gotcha

| # | 罠 | 対処 |
|---|---|---|
| 1 | `body` に `overflow: hidden` をかけると Lenis が scroll source を失う | CSS は `html, body { height: auto; overflow: visible }` のまま |
| 2 | `next/link` でページ遷移後に scroll 位置が残る | `usePathname` を購読して `lenis.scrollTo(0, { immediate: true })` |
| 3 | Lenis を component 単位で複数生やす | 必ず root 1 個。section ごとに作らない |
| 4 | iOS Safari で `syncTouch: true` にすると慣性 scroll と二重で jank | mobile は OS scroll に委譲（上 snippet の通り） |
| 5 | dev で Strict Mode の二重 mount により Lenis が 2 個生まれる | `destroy()` cleanup を必ず書く（上記の通り） |

---

## 2. GSAP ScrollTrigger による chapter reveal

### 2.1 install

```bash
pnpm add gsap @gsap/react split-type
```

> SplitText は GSAP 有償。OSS 代替として `split-type` を使う。
> `@gsap/react` は React 19 互換 hook（`useGSAP`）を提供。

### 2.2 GSAP plugin 登録（client 専用 module）

`src/lib/gsap.ts`

```ts
'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// SSR で window 参照を踏まないよう client guard
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
```

### 2.3 chapter reveal（fade + scale）

`src/components/cinematic/ChapterReveal.tsx`

```tsx
'use client';

import { useGSAP } from '@gsap/react';
import { useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

type Props = { children: ReactNode; bg?: string };

export function ChapterReveal({ children, bg = '#0a0a0a' }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // 1) chapter 入場 fade + scale
      gsap.from(root.current!.querySelectorAll('[data-reveal]'), {
        scrollTrigger: {
          trigger: root.current,
          start: 'top 70%',
          end: 'top 20%',
          scrub: 1,
        },
        opacity: 0,
        y: 60,
        scale: 0.96,
        stagger: 0.08,
      });

      // 2) chapter ごとに body 背景色を fluid に変える
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => gsap.to(document.body, { backgroundColor: bg, duration: 0.8 }),
        onEnterBack: () => gsap.to(document.body, { backgroundColor: bg, duration: 0.8 }),
      });
    },
    { scope: root }, // scope 指定で unmount 時に自動 cleanup
  );

  return <section ref={root}>{children}</section>;
}
```

### 2.4 Lenis ↔ ScrollTrigger 同期（必須）

`SmoothScrollProvider` の `useEffect` 内に追加：

```ts
import { ScrollTrigger } from '@/lib/gsap';

// Lenis の scroll event を ScrollTrigger に流す
lenis.on('scroll', ScrollTrigger.update);

// GSAP の rAF と Lenis の rAF を統合（GSAP 側に時間を委ねる）
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

> ↑ これをやらないと scrub アニメが Lenis の補間と数 frame ズレて gummy になる。

### 2.5 pinning（section 固定中に内側だけ animate）

```tsx
useGSAP(() => {
  gsap.timeline({
    scrollTrigger: {
      trigger: pinSection.current,
      start: 'top top',
      end: '+=200%', // section の高さ x 2 分 pin
      pin: true,
      scrub: 1,
      anticipatePin: 1, // jank 防止
    },
  })
    .to('.layer-1', { yPercent: -50 })
    .to('.layer-2', { yPercent: -100 }, '<');
}, { scope: pinSection });
```

### 2.6 horizontal scroll into vertical

```ts
gsap.to(track.current, {
  xPercent: -100 * (panels - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: container.current,
    start: 'top top',
    end: () => `+=${container.current!.offsetWidth}`,
    pin: true,
    scrub: 1,
    invalidateOnRefresh: true, // resize で end 値再計算
  },
});
```

### 2.7 text split letter animation（split-type）

```tsx
import SplitType from 'split-type';

useGSAP(() => {
  const split = new SplitType(headline.current!, { types: 'chars' });
  gsap.from(split.chars, {
    scrollTrigger: { trigger: headline.current, start: 'top 80%' },
    opacity: 0,
    y: 40,
    stagger: 0.02,
    duration: 0.6,
  });
  return () => split.revert(); // 多言語切替で再 split するため必須
}, { scope: container });
```

### 2.8 gotcha

| # | 罠 | 対処 |
|---|---|---|
| 1 | `useEffect` で `gsap.from` を直書きすると React 19 Strict Mode で二重実行 | `useGSAP({ scope })` で自動 cleanup |
| 2 | Lenis と ScrollTrigger を繋がない | `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add` 必須（§2.4） |
| 3 | image / font load 後に layout が伸びて `start` がズレる | `ScrollTrigger.refresh()` を `load` event と font ready 後に呼ぶ |
| 4 | `split-type` を locale 切替で revert しない | `split.revert()` を cleanup で必ず（§2.7） |
| 5 | `pin: true` + `position: sticky` の併用は破綻 | どちらか一方。Lenis 環境では GSAP `pin` 推奨 |

---

## 3. Three.js + react-three-fiber カーソル反応 paint

### 3.1 install

```bash
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three
```

> R3F 9 系は React 19 native 対応。`'use client'` 必須。

### 3.2 最小動く snippet（cursor uniform を shader に流す）

`src/components/cinematic/PaintCanvas.tsx`

```tsx
'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// 円形 paint stroke を cursor 位置に滲ませる fragment
const fragment = /* glsl */ `
  precision highp float;
  uniform vec2 uMouse;       // 0..1
  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;

  // 簡易 noise（実装時は curl noise などに差し替え）
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = vUv * aspect;
    vec2 m = uMouse * aspect;

    float d = distance(uv, m);
    float stroke = smoothstep(0.25, 0.0, d);
    stroke *= 0.6 + 0.4 * noise(uv * 8.0 + uTime * 0.1);

    vec3 col = mix(uColorA, uColorB, stroke);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function PaintPlane({ colorA, colorB }: { colorA: string; colorB: string }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
    }),
    [], // 初回のみ。色更新は useFrame 経由
  );

  useFrame(({ pointer, clock }) => {
    if (!mat.current) return;
    // pointer は -1..1。0..1 に正規化（y 反転）
    const u = mat.current.uniforms;
    u.uMouse.value.set(pointer.x * 0.5 + 0.5, pointer.y * 0.5 + 0.5);
    u.uTime.value = clock.elapsedTime;
    u.uResolution.value.set(size.width, size.height);
    (u.uColorA.value as THREE.Color).set(colorA);
    (u.uColorB.value as THREE.Color).set(colorB);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} />
    </mesh>
  );
}

export function PaintCanvas({ colorA = '#1a0f2e', colorB = '#e8d5a8' }: { colorA?: string; colorB?: string }) {
  return (
    <Canvas
      dpr={[1, 1.5]} // 高 DPI で重くなるので上限を絞る
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, zIndex: -1 }}
    >
      <PaintPlane colorA={colorA} colorB={colorB} />
    </Canvas>
  );
}
```

### 3.3 chapter ごとに色を変える

ChapterReveal の `onEnter` で global state（zustand 等）か CSS variable を更新し、`PaintCanvas` の props を購読：

```tsx
// 例：chapter store
const useChapter = create<{ a: string; b: string; set: (a: string, b: string) => void }>((s) => ({
  a: '#1a0f2e', b: '#e8d5a8', set: (a, b) => s({ a, b }),
}));
```

### 3.4 mobile fallback

```tsx
'use client';
import { useEffect, useState } from 'react';

function useShouldRenderWebGL() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const lowMem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    setOk(!reduced && !(mobile && lowMem !== undefined && lowMem < 4));
  }, []);
  return ok;
}
```

`!ok` の時は WebGL を出さず、Tailwind の gradient で静的背景に degrade。

### 3.5 dynamic import で bundle を切る

```tsx
import dynamic from 'next/dynamic';

const PaintCanvas = dynamic(
  () => import('@/components/cinematic/PaintCanvas').then((m) => m.PaintCanvas),
  { ssr: false }, // three は SSR 不可
);
```

### 3.6 gotcha

| # | 罠 | 対処 |
|---|---|---|
| 1 | SSR で `window` / `WebGLRenderingContext` 参照 → build error | 必ず `dynamic(..., { ssr: false })` |
| 2 | `dpr={2}` で iPhone Pro が GPU 焼ける | `dpr={[1, 1.5]}` で頭打ち |
| 3 | `Canvas` を section ごとに複数 mount | 1 page 1 Canvas、`fixed inset-0 z-[-1]` で全 chapter 共有 |
| 4 | uniform を毎 frame `new Vector2()` する → GC pressure | `.set()` で in-place 更新（snippet 通り） |
| 5 | resize event で uniform `uResolution` を更新し忘れて aspect が歪む | R3F の `size` を `useFrame` 内で常時注入 |

---

## 4. 全体 architecture

### 4.1 component tree

```
app/[locale]/layout.tsx       (server, next-intl provider)
└── SmoothScrollProvider       'use client'  ← Lenis 1 個
    ├── PaintCanvas (dynamic)  'use client'  ← Three 1 Canvas
    └── page.tsx               (server)
        └── <CinematicStory messages={t(...)}/>   server → client 境界
            ├── ChapterReveal  'use client'  ← GSAP scoped
            ├── ChapterReveal
            └── ChapterReveal
```

### 4.2 server → client 境界（next-intl）

```tsx
// app/[locale]/page.tsx  ← server
import { getTranslations } from 'next-intl/server';
import { CinematicStory } from '@/components/cinematic/CinematicStory';

export default async function Page() {
  const t = await getTranslations('top');
  return (
    <CinematicStory
      chapters={[
        { id: 'ch1', title: t('ch1.title'), body: t('ch1.body') },
        { id: 'ch2', title: t('ch2.title'), body: t('ch2.body') },
      ]}
    />
  );
}
```

> 文言は server で解決して props で client に流す。client 側で `useTranslations` を呼んでも良いが、cinematic ロジックを純粋にしたいので props 注入推奨。

### 4.3 accessibility 戦略

| 観点 | 対応 |
|---|---|
| prefers-reduced-motion | Lenis を起動しない / GSAP は `gsap.from` の代わりに即 final state / `PaintCanvas` 非 mount |
| keyboard navigation | Lenis 起動中も `tab` focus で `scrollIntoView` が効くよう `lenis.scrollTo` を `focusin` で呼ぶ |
| screen reader | 各 chapter に `<section aria-label>` と通常の DOM text を残す（WebGL は装飾扱い、`aria-hidden` 付与） |
| skip link | `<a href="#main">` を `sr-only` で先頭に置き、Lenis を bypass |

`'use client'` の Reduced Motion gate を集中管理：

```tsx
'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const Ctx = createContext(false);
export const useReducedMotion = () => useContext(Ctx);

export function MotionGate({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return <Ctx.Provider value={reduced}>{children}</Ctx.Provider>;
}
```

`SmoothScrollProvider` / `PaintCanvas` / `ChapterReveal` 全てが `useReducedMotion()` を見て早期 return。

### 4.4 bundle size 対策

| 対象 | 手法 |
|---|---|
| three / r3f | `dynamic(..., { ssr: false })` で initial bundle から除外 |
| GSAP | 必要 plugin だけ `gsap/ScrollTrigger` で named import（tree shake） |
| split-type | section 単位で dynamic import も可（多言語切替時は再 import） |
| Lenis | 軽量（~10kb）なので root 同梱で OK |

`next.config.ts` で transpile：

```ts
const nextConfig: NextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};
```

### 4.5 描画順序の優先度

```
z-index   layer
 -1       PaintCanvas（WebGL 背景）
  0       通常 DOM（chapter text）
 10       UI（nav / lang switcher）
 50       modal / toast
```

`PaintCanvas` は `position: fixed; inset: 0; z-index: -1`、`html, body { background: transparent }`。

### 4.6 gotcha

| # | 罠 | 対処 |
|---|---|---|
| 1 | server component から `gsap` を import → build 失敗 | 全 cinematic module を `'use client'` 直下に隔離、server は props 経由のみ |
| 2 | `next-intl` の `useTranslations` を cinematic component で呼ぶと Hydration mismatch のリスク | server で `getTranslations` → props 注入 |
| 3 | Lenis + ScrollTrigger + R3F の rAF が 3 つ走る | GSAP `ticker` に統合（§2.4）。R3F は内部 rAF を持つので独立で OK |
| 4 | Turbopack で `three` の ESM が解決できない | `transpilePackages` 指定（§4.4） |
| 5 | 言語切替（next-intl locale 変更）で GSAP の `start` 座標がズレる | `usePathname` 変化を購読し `ScrollTrigger.refresh()` を呼ぶ |

---

## 5. 依存パッケージまとめ

```bash
# core
pnpm add lenis gsap @gsap/react split-type
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three
```

| package | 用途 | 概算 size |
|---|---|---|
| lenis | smooth scroll | ~10 kb |
| gsap | timeline / tween | ~50 kb |
| @gsap/react | useGSAP hook | ~1 kb |
| split-type | text split（SplitText OSS 代替）| ~5 kb |
| three | WebGL core | ~150 kb |
| @react-three/fiber | React renderer for three | ~50 kb |
| @react-three/drei | helper 群（必要分のみ） | tree shake 後 ~30 kb |

> Three.js 系は dynamic import で initial route から除外。実 initial JS は Lenis + GSAP + ScrollTrigger 合計 60-70 kb 程度に収まる。

---

## 6. Codex への申し送り

1. `src/components/cinematic/` を新設、本 recipe の snippet をそのまま展開
2. `src/lib/gsap.ts` を作成（client guard 付き plugin register）
3. `src/app/[locale]/layout.tsx` に `SmoothScrollProvider` + `MotionGate` を追加
4. `next.config.ts` に `transpilePackages` 追加
5. 文言は `messages/{ja,en,pt-BR}.json` の `top.chapters[].title / body` に集約、ハードコード禁止
6. PR 前に `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 通す
7. mobile 実機（iOS Safari / Android Chrome）で `PaintCanvas` 描画と Lenis touch 挙動を必ず確認
