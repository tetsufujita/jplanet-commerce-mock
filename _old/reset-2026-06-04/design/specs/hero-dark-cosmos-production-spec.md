---
title: Hero (dark cosmos / cobe) — Production Handoff Spec
updated: 2026-06-04
owner: Claude（設計）→ 実装: Codex
status: 実装可（cobe Hero 採用確定）
prototype: design/prototypes/hero-dark-cosmos/index-cobe.html（+ cobe.js / cobe-global.js）
screenshots: design/prototypes/hero-dark-cosmos/cobe-desktop-p00.png / -p45.png / -p86.png / cobe-mobile-p86.png
---

# Hero「dark cosmos」本番実装仕様

> ビジョン: 闇の宇宙の地球。Tokyo と São Paulo が灯り、scroll で宇宙→南米へ降下し São Paulo が静かに明るくなる ＝「ブラジルの現場へ降りていく予感」まで（docs/12）。
> **Hero は予感まで。商取引インフラの説明はしない（§7 厳守）。**
> プロトタイプ（`index-cobe.html`）が視覚・ロジックの ground truth。本 spec はそれを Next.js 15 / React 19 / TS strict に移植するための仕様。

---

## 0. 移植の前提（Codex 向け）
- **配置**: `src/components/home/Hero*.tsx`（`'use client'`。WebGL/scroll/イベントのみ client 化）。
- **依存追加**: `pnpm add cobe`（MIT）。bundler 経由の通常 import で OK（プロトの file:// CORS 回避＝同梱は本番では不要）。既導入の lenis / gsap / @gsap/react / split-type を使う。
- **色**: ハードコード hex 禁止（AGENTS.md）。Crimson 等は docs/04 / tailwind トークンから。cobe は正規化 RGB 配列が要るので、トークン hex → `[r,g,b]/255` の util を 1 つ作る。
- **文言**: `messages/{ja,en,pt-BR}.json` に i18n key で（ハードコード禁止・3 locale 全更新）。固有名詞（TOKYO / SÃO PAULO）と座標リテラルは locale 共通で可。
- **色は 2 つだけ**: 近黒 + Crimson #C8102E（pin-point）。白系は dot/text のみ。増やさない（§7）。

---

## 1. Visual target（= 受け入れ基準の画）
| 状態 | スクショ | 何が映るか |
|---|---|---|
| desktop p=0 | cobe-desktop-p00.png | アジア/豪州前面、**Tokyo が Crimson 点灯**。São Paulo は裏（非表示）。コピー左 |
| desktop p=0.45 | cobe-desktop-p45.png | アフリカ前面、Tokyo（右 limb）と São Paulo（左下 limb）が両方見え、São Paulo が回り込む途中 |
| desktop p=0.86 | cobe-desktop-p86.png | **南米前面、São Paulo が Crimson glow で点灯**＋座標 `-23.56, -46.65 / SÃO PAULO · AV. PAULISTA` |
| mobile p=0.86 | cobe-mobile-p86.png | globe 上・コピー下、São Paルo 点灯＋座標 |

`p` = Hero の scroll 進行度 0→1。

---

## 2. Layout values（プロト実測）
```
色: bg #07070A / ink #F2F1EC / muted #8A8A93 / crimson #C8102E   ※本番はトークン参照
globeBox（正方形 G×G）:
  desktop: G = min(H*0.94, W*0.54);  left = W - G - W*0.04;  top = (H - G)/2     // 右寄せ
  mobile : G = min(W*0.96, H*0.52);  left = (W - G)/2;       top = H*0.075       // 上中央
copy:
  desktop: 左 7vw / top 50% translateY(-54%) / max-width 30ch
  mobile : 下 11vh / padding 0 24px（globe の下）
  eyebrow: "● TOKYO ⇄ SÃO PAULO"（dot = Crimson, mono, letter-spacing .22em）
  h1     : 「中南米に、新しい」「経済の基盤を建てる。」（2 行・weight 800・tracking -0.025em・clamp(30,4.6vw,56)px）
  sub    : 「その現場へ、静かに降りていく。」（muted・reveal で fade-in）
coord ラベル（mono 11px）: globeBox 内、São Paulo 投影点の右下（left = sx + G*0.03, top = sy + G*0.05）
```
レイヤー z: stars(0) < cobe canvas(1) < overlay canvas(2, pointer-events none) < vignette(3) < copy/coord(4)。
vignette: `radial-gradient(130% 100% at 62% 50%, transparent 52%, rgba(0,0,0,.6))`。

---

## 3. Motion timeline（scroll = カメラ）
Hero を **pin** して、その中の scroll 進行度 `p` で駆動（GSAP ScrollTrigger scrub + Lenis 推奨。pin 区間 ≈ 高さ 280vh 相当）。

```
front-center 経度 = -π/2 - phi   ∴ phi_front(L) = -π/2 - L_rad
phiTK = -π/2 - (139.69°→rad) ≈ -4.009 (≡ 2.274)   // Tokyo front
phiSP = -π/2 - (-46.65°→rad) ≈ -0.757             // São Paulo front
theta: -0.10 (Tokyo) → 0.26 (São Paulo)

毎フレーム:
  phi    = lerp(phiTK, phiSP, p)
  theta  = lerp(-0.10, 0.26, p)
  spB    = smoothstep(0.34, 0.92, p)   // São Paulo 明度（glow / marker size）
  reveal = smoothstep(0.42, 0.82, p)   // coord / hairline / sub の出現
```
| 局面 | p | 起きること |
|---|---|---|
| opening | 0 | アジア前面、Tokyo 点灯、コピー rise（GSAP SplitText で行マスク）。São Paulo 裏 |
| Tokyo front | 0–0.2 | Tokyo が前面中央付近、globe ゆっくり回り始める |
| rotation | 0.2–0.7 | アフリカ→大西洋へ回転、São Paulo が左 limb から回り込む |
| São Paulo front | 0.7–0.9 | 南米前面、São Paulo 点灯（spB 上昇）、座標/hairline/cluster が reveal |
| São Paulo bloom | ~0.80 | **前面を横切る一瞬だけ bloom を足す（§5-1）** |

reduced-motion: 上記アニメ無効、**p≈0.86 の完成形を静止表示**（§6）。

---

## 4. cobe implementation notes（重要・プロトのロジック）
cobe 2.0.1: **`onRender` は無い。`createGlobe(canvas, opts)` → `{ update, destroy }`。自前 rAF で `update()` を毎フレーム呼ぶ。**

```js
// 生成（layout 確定時。resize で destroy → 再生成）
const globe = createGlobe(canvasEl, {
  devicePixelRatio: Math.min(dpr, 2),
  width: G, height: G,            // 正方形（CSS px）。内部で *dpr
  phi: phiTK, theta: -0.10,
  dark: 1, diffuse: 1.1, mapSamples: 16000 /* mobile は 10000-12000 */, mapBrightness: 3.4, mapBaseBrightness: 0,
  baseColor: [0.16,0.17,0.24], glowColor: [0.06,0.07,0.12],
  markerColor: crimsonRGB,        // = Crimson トークン /255（例 [0.85,0.10,0.18]）
  opacity: 1, scale: 1, offset: [0,0],
  markers: [{ location: TK, size: 0.05 }, { location: SP, size: 0.05 }],
});

// 毎フレーム（marker は per-frame 更新可。São Paulo の size を spB で増やす）
globe.update({
  phi: f, theta: l,
  markers: [{ location: TK, size: 0.05 }, { location: SP, size: 0.045 + spB*0.05 }],
});
```
- TK = [35.68, 139.69], SP = [-23.56, -46.65]（[lat, lng]）。
- markerColor は global（両 marker 同色）。São Paulo の「点灯」は marker size 増 ＋ overlay glow（§4 overlay）で表現。
- unmount/resize で `globe.destroy()` ＋ rAF cancel（メモリリーク防止）。
- arcs API も存在（corridor section で再利用予定。Hero では未使用）。

### overlay 投影式（cobe と同一に再現 — São Paulo の glow/cluster/hairline/座標を marker にピクセル一致で重ねる）
cobe の内部投影を実ソースから抽出済。**同じ式で overlay（別の 2D canvas）に描く。** scale=1 / offset=[0,0] / ee=0.8 / markerElevation=0.05 → r=0.85。
```js
const D2R = Math.PI/180;
function U([lat, lng]) {            // location → unit vector（cobe と同一）
  const r = lat*D2R, a = lng*D2R - Math.PI, o = Math.cos(r);
  return [-o*Math.cos(a), Math.sin(r), o*Math.sin(a)];
}
function project(loc, phi, theta) { // → { x, y (0..1 of box), front }
  const v = U(loc), r = 0.85, t0=v[0]*r, t1=v[1]*r, t2=v[2]*r;
  const rr=Math.cos(theta), a=Math.cos(phi), o=Math.sin(theta), i=Math.sin(phi);
  const c = a*t0 + i*t2;
  const s = i*o*t0 + rr*t1 - a*o*t2;
  const front = -i*rr*t0 + o*t1 + a*rr*t2;          // >=0 → 前面
  return { x:(c+1)/2, y:(-s+1)/2, front };           // screen = x*G, y*G（box 内）
}
```
overlay 描画（box の 2D canvas、`globalCompositeOperation='lighter'`）:
- **São Paulo glow**: 半径 `G*(0.05 + spB*0.065)` の radial、crimson alpha `0.66*spB`（中心）→0。
- **city cluster**: SP 周囲 36 点（lat±3.75° / lng±4.5° の固定 scatter）を project。前面のみ、alpha `spB*c.b*0.66`。`c.b>0.78` は crimson、他は近白。
- **Av. Paulista hairline**: SP 投影点を貫く 1 本（長さ `G*0.085`、角度 -0.62rad）、crimson alpha `reveal*0.62`、lineWidth 1.1。
- **coordinate（DOM）**: `front>=-0.02 && spB>0.02` の時のみ表示。opacity `reveal*0.95`。
- São Paルo が裏（front<-0.02）の間は overlay 全部非表示。

---

## 5. Production improvements（本番で足す）
1. **São Paulo bloom を一瞬だけ強める** — São Paulo が前面を横切る瞬間の "灯る感" を出す。glow に transient を加算:
   `bloom = exp(-((p-0.80)/0.05)^2)` を `spB` の glow 半径/alpha に 0.3〜0.4 だけ上乗せ（p≈0.80 で peak、前後で減衰）。連続的な spB に短いピークを重ねる。**やり過ぎ厳禁**（pin-point の品を保つ）。
2. **city cluster / Av. Paulista presence** — プロトは procedural 比 +20%。本番は据え置き、ただし bloom の瞬間だけ cluster alpha を +10% 連動でも可。
3. **Black Marble luminance remap（optional future）** — city cluster を NASA Black Marble（南米 crop・public domain）の **luminance だけ抽出 → 近黒→Crimson 単色ランプに再マップ**した emissive に置換すると更にリアル。**生 RGB（黄橙）は貼らない。2 色厳守。** 今回 spec では optional（cluster ＋ glow で代用、prototype レベルで十分）。

---

## 6. Fallback
- **reduced-motion（`prefers-reduced-motion: reduce`）**: rAF アニメを止め、**p≈0.86 の完成形を 1 枚静止表示**（南米前面・São Paルo 点灯・座標表示・コピー全出し）。globe は静止 1 フレーム描画のみ。SplitText の rise も無効（即表示）。
- **mobile**: `devicePixelRatio` を **≤2 に clamp**。`mapSamples` を 10000–12000 に下げる。WebGL canvas は **1 枚のみ**（複数 R3F/canvas 並走禁止）。Hero が viewport 外なら IntersectionObserver で rAF 停止。
- **no WebGL**: cobe は WebGL 不可だと no-op（globe 描かれず）。検出して、**静止ポスター画像（lit globe の事前 render）＋ コピー＋座標**の静的 Hero に差し替え。アクセシブルな代替テキストを置く。

---

## 7. Strict exclusions（厳守）
- **Hero に入れない**: SISCOMEX / PIX / NF-e / CNPJ / compliance strata / インフラ名の大量表示。→ これらは Platform / Portfolio section（design/research/brazil-visual-language.md）。
- **色を増やさない**: 近黒 + 白系 dot/text + Crimson のみ。PIX teal 等のシステム色は borrow 禁止。
- **public NG**: 「北極星」「中南米の王」「$1T」生表現、PRC 唯一/24ヶ月先行の moat 機密、Series A 機密数値は出さない（docs/02）。
- **Claude は src/ を触らない**（実装は Codex）。CNPJ 等を Hero に書かない（Hero では不要）。

---

## 8. Out of scope（この Hero spec の範囲外）
- corridor の弧増殖（three-globe・別 section / 別 spec）
- Platform の SISCOMEX gate / PIX パルス / strata（別 section）
- Black Marble 実装（§5-3 は optional future）
- 多言語コピーの確定文（messages 側で別途）

## 9. PASS 条件（done の定義・e2e 検証）
- [ ] desktop: 冒頭で Tokyo がアジア前面で点灯 → scroll で南米へ回転 → 降下末で São Paulo が点灯＋`SÃO PAULO · AV. PAULISTA` 座標。p=0/0.45/0.86 が cobe-desktop-p00/p45/p86 と概ね一致。
- [ ] mobile 375×812: globe 上・コピー下、p=0.86 で São Paulo 点灯（cobe-mobile-p86 一致）。
- [ ] overlay（glow/cluster/hairline/座標）が São Paulo に**ズレなく**重なる（投影式一致）。
- [ ] reduced-motion で静止完成形、no-WebGL でポスター fallback、mobile で DPR clamp。
- [ ] Hero に §7 の除外項目が**一切無い**。色は 2 つだけ。
- [ ] 文言は messages/{ja,en,pt-BR}、色はトークン参照（ハードコード hex/copy 無し）。
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 緑。

---

## Codex タスクテンプレ（そのまま渡せる）
```
Goal:       Hero「dark cosmos」を本番実装（cobe の闇地球 + Tokyo/São Paulo 2点 + scroll 降下で São Paulo 点灯）
Context:    本 spec（design/specs/hero-dark-cosmos-production-spec.md）/ プロト index-cobe.html /
            スクショ cobe-desktop-p00,p45,p86 + cobe-mobile-p86 / docs/12（vision）/ docs/04（色）/ docs/09(scroll stack)
Constraints: AGENTS.md（'use client' 最小・any 禁止・next/image・文言は messages 3 locale・ハードコード hex 禁止）/
            §7 strict exclusions（infra 名・色追加・src 以外触らない）/ reduced-motion・mobile・no-WebGL fallback 必須
Done when:  §9 PASS 条件を全て満たし、lint && typecheck && test && build 緑
```

## 関連
docs/12（site vision）/ docs/09（scroll/anim 確定スタック）/ docs/04（色 lock）/ docs/02（翻案・public NG）/
design/research/animation-stack-recommendation.md（Hero 行）/ design/research/brazil-visual-language.md（São Paulo 都市光・Av. Paulista）
