---
title: 07 ホームページ構成（決定版・post-reset 2026-06-04）
updated: 2026-06-04
status: ★決定（構成・視覚システム確定。トーン light/dark のみ [sir-decide]）
basis: design/research/ai-homepage-build-playbook.md + reference-sites.md（5 専門家 + scout・fetch 検証）
---

# 07 ホームページ構成（決定版）

> 2026-06-04 reset 後の **唯一の homepage 正典**。cinematic globe/rail 路線は廃。
> 方向: **Stripe（骨格）× Anthropic（声）× dLocal（越境 infra の数字/地理）× MELI IR（長期投資家章）× Linear（anti-slop premium 品質）** から抽出した、**editorial・restrained・type-led・Crimson pin-point の corporate infra サイト**。
> 役割分担: Claude=本 doc を確定 → Codex=実装。

## 0. 一行の決定
**白基調（ivory）の編集的レイアウトに、宣言型 hero ＋ 数字章 ＋ 2 層構造 ＋ 持株グループ ＋ 事業（EC 隔離）を、Crimson を面積 1–2% だけ使って静かに積む。** 派手な演出でなく「型・余白・数字・制度的事実」で投資家を信頼させる。

## 1. 視覚システム（docs/04 と整合・トークンで実装）
| token | 値（推奨） | 用途 |
|---|---|---|
| `paper`（base） | ivory `#FAF9F5`（純白 #FFF は避ける） | 背景の面 |
| `ink`（本文） | near-black `#141413`（純黒でない） | テキスト |
| `muted` | `#6B6B66` 系 | 補助テキスト |
| `crimson`（accent） | **#C8102E（docs/04 lock）／面積 1–2% のみ** | CTA・1 本の線・1 数字・1 語・node |
| `line` | rgba(ink,.10) | hairline |
- **タイポ**: 見出し=大きく confident な grotesque sans（tight tracking −0.02em）。**Inter 禁止**（AI slop の代名詞）。Geist 系 + 日本語 Noto Sans JP（字間調整）。**数字・出典・法令名（PIX/NF-e/ICMS 等）は monospace ラベル**＝infra の信頼感。
- **レイアウト**: 編集的・非対称グリッド + 広大な余白（restraint が prestige）。bento は使っても主役にしない。「3 box + アイコン」禁止。
- **質感**: 全面に微 film-grain（5–8%）のみ。glass は実プロダクト UI モック内の一瞬だけ。**gradient は understated（深み付け）、紫/青/レインボー/Stripe-mesh 全面は禁止**。3D 抽象人間・glowing orb 禁止。
- **モーション**: hero の staggered reveal **1 つ** ＋ 理解させる機能的 motion のみ（§4）。award 的演出過多は排す。

## 2. IA（決定）— 8 section
```
§1 HERO（宣言型・数字なし）
   「中南米に、新しい経済の基盤を建てる。」 + sub「AI エージェントが動かす越境・決済・物流の
   インフラを、日本とブラジルから。」 + group 一行 + CTA[事業を見る(Crimson)] [投資家の方へ]
§2 数字 proof（4 マクロ数字・出典付き）
   6.6億人(World Bank) / US$7,690億(LatAm EC・PCMI) / 2.1億人(IBGE) / 1.7億人(PIX・中銀)
   静かな数字 row。hero でなくここに集約（Stripe/dLocal/Adyen 型）
§3 WHAT WE BUILD（2 層構造＝差別化）
   ①購入エージェント（ブランディング層） ②現地プラットフォーム（物流/税/法/通関） →③protocol へ
   Adyen の value card 型、3–4 枚
§4 WHY NOW / WHY US（moat thesis）
   2026=Agentic Commerce 立ち上がり。LATAM の物理・法・税は外部調達不能、Andes は一体運営できる稀有な position
§5 GROUP STRUCTURE（持株の見せ方）
   Andes Inc.(JP・資金/IP/統括) → Andes BR → J-Planet → J-Vita を堂々と図示。CNPJ 等は制度的事実として静かに
§6 BUSINESSES（事業＝証拠・EC 隔離）
   J-Planet(Phase1 2026-06 稼働) / J-Vita / Protocol roadmap。EC の生々しさ(SKU/WhatsApp)はここに隔離
§7 MISSION / 長期ビジョン
   100 年スパン・数兆円規模（「北極星」「$1T」生表現 NG → 翻案: 「2028 年までに LATAM AC Protocol」）
§8 CTA（4 窓口）
   投資家 ir@ / パートナー partners@ / 採用 careers@ / プレス press@
```
**設計判断**: 数字は §1 でなく §2／規制・CNPJ は §5＋footer に制度的事実として（誇張 NG、PRC 唯一・24ヶ月先行は public NG）／EC は §6 に隔離（コーポレートを「化粧品 EC」に見せない）。

## 3. Hero（5 秒で伝える）
```
line1（宣言）: 中南米に、新しい経済の基盤を建てる。
line2（何を/どこで）: AI エージェントが動かす越境・決済・物流のインフラを、日本とブラジルから。
line3（group・任意）: Andes Group — Andes Inc. / Andes BR / J-Planet
CTA: [事業を見る]（Crimson pin-point） [投資家の方へ]（outline）
```
5 秒テスト合格条件: ①業種が分かる（越境/決済/物流インフラ・×化粧品EC）②地理（中南米/日本とブラジル）③持株会社と分かる ④数字は入れない ⑤Crimson は CTA 1 点のみ。
- 視覚: 編集的 hero（左テキスト・右に抽象 or 余白）。背景は paper + 微 grain。動く要素を入れるなら **agent フロー（巨人 LLM → Andes agent → LATAM infra）の機能的 motion 1 つ**まで（globe/cosmos はやらない）。

## 4. モーション計画（★Motion 一本・規律つき）
- **アニメは Motion（`motion/react`）のみ**（GSAP/Lenis/Three/CSS scroll-driven は不使用）。
- hero 文字: `motion.div`+variants+`whileInView`(once) の staggered reveal（行/ブロック単位＝i18n 安全）。
- scroll 連動: `useScroll`+`useTransform`（once 原則）。線描画: `motion.path` の `pathLength`。数字: `useSpring` か `@number-flow/react`。
- 背景の動く gradient は**入れない**（IA は Navy/paper 基調・grain のみ）。
- 規律: `useReducedMotion()` で reduced-motion 必須 / hero を LCP にしない / `transform`・`opacity` 限定 / **1 画面 1 主役**。詳細=design/motion-kit。

## 5. 作り方（AI/Codex・anti-slop）
1. 本 doc（07）＋ docs/04 を SSOT に、`tailwind.config` に Andes token（paper/ink/crimson/font/animation）を override。
2. **hallmark skill（MIT・anti-slop ゲート）** を実装フローに。
3. **shadcn(MIT)** を UI 素体に、Andes token で restyle。**shadcn MCP** で install。**Aceternity・v0 生出力・Inter は不使用。**
4. motion は §4 のライブラリで「1 画面 1 主役」。
5. 品質ゲート: hallmark audit / Playwright 視覚 diff（参照=Linear/Stripe）/ a11y WCAG2.2 AA / i18n 3 locale / lint・typecheck・test・build 緑。
（詳細: design/research/ai-homepage-build-playbook.md）

## 6. 参考マッピング（section → 手本）
| section | 手本 |
|---|---|
| §1 Hero | Stripe / Anthropic（宣言・声） |
| §2 数字 | dLocal / Adyen（数字章＋出典） |
| §3 2 層 | Adyen value card / Stripe 機能カード |
| §4 why now | dLocal「markets of the future」 |
| §5 group | CloudWalk（複数ブランド章分け） |
| §6 事業 | Sierra（results 隔離）/ MELI ecosystem |
| §7 mission | Anthropic（射程長・謙虚） |
| 全体の質 | **Linear**（anti-slop premium 基準） |

## 7. 残る決定 `[sir-decide]`（1 つだけ）
- **トーン**: ① **light / ivory（推奨）** = Anthropic/Stripe/Mercury の investor-credible ／ ② dark = Linear/Adyen の premium。**構成・IA・モーションは同一**、base と ink を反転するだけ。まず light で進める前提。

## 8. やらないこと（厳守）
- Inter / 純白 #FFF べた / 紫・青・レインボー gradient / Stripe-mesh 全面 / 3 box+アイコン / glassmorphism 全面 / 3D 人間・orb / Aceternity aurora / v0 生出力本番 / Crimson 大面積・グラデ / cinematic globe・rail（廃案）。
- public NG: 「北極星」「中南米の王」「$1T」生表現 / PRC 唯一・24ヶ月先行 / Series A 機密。
- Claude は src/ を触らない（実装は Codex）。

## PASS（この構成の実装 done）
- [ ] §1–§8 が本 IA 順で存在。hero は宣言＋数字なし、数字は §2、EC は §6 隔離、持株は §5 図示。
- [ ] 色は paper + ink + Crimson のみ（面積 1–2%）。Inter 不使用、数字/法令は monospace。
- [ ] motion は 1 画面 1 主役＋reduced-motion。§8 の禁止が一切ない。
- [ ] 文言 messages 3 locale・色トークン・hex ハードコードなし。lint && typecheck && test && build 緑。
