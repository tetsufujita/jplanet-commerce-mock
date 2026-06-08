---
title: 12 サイトビジョン（globe / Japan⇄Brazil / agentic commerce）
updated: 2026-06-04
status: 方向確定（トーンのみ [sir-decide]）
note: 投資家向けサイトの全面リニューアル。docs/07 の「宣言型+数字」土台を壮大に昇華
---

# 12 サイトビジョン

> 一行で: **闇の宇宙に浮かぶ地球。日本とブラジルが灯り、その間をエージェンティックコマースの光の弧が一本から無数へ増殖する。** スクロールで宇宙から南米へ降り、事業に着地する一本のシネマ。
> 表現は翻案済みのみ（「北極星」「中南米の王」「$1T」生表現は public NG → docs/02 翻案ガイド）。

## 中核の比喩
- **場所**: 日本（Andes Inc・資本/IP）と ブラジル（J-Planet・現場）の 2 点だけを Crimson で灯す。他の地名は出さない＝pin-point。
- **エージェンティックコマース**: 2 点を結ぶ great-circle の弧が**増殖して流れる**＝自律エージェントが経済を動かす、を説明ゼロで伝える。
- **壮大さの作り方**: 惑星のスケール × 増殖する光の数 × **色は 2 つだけ（近黒 + Crimson #C8102E）** の引き算。派手さでなく restraint で畏れを作る。

## スクロール構成（カメラ＝スクロール）
```
[宇宙俯瞰] → [地球+2光点] → [弧が増殖] → [南米へ降下/数字] → [2層インフラ] → [事業] → [長期/CTA]
   Hero ──────────────── corridor ──── Market ──── Platform ──── Portfolio ── Closing
```
| section | 絵 |
|---|---|
| Hero | 闇の宇宙・星野。地球に日本/ブラジルが灯る。宣言一行が行マスクで立ち上がる |
| Market | 南米へ降下しながら 4 マクロ数字（6.6億/US$7,690億/2.1億/1.7億）がカウントアップ |
| Platform | 弧が「表層=購入エージェント／深層=物流・税・法のインフラ」の 2 層に解像 |
| corridor | 日⇄伯の弧が一本→無数に増殖、dash が流れる（agentic commerce の見せ場） |
| Portfolio | 実事業（J-Planet 等）へ着地。EC 証拠はここに隔離 |
| Closing | 引いて惑星が静かに光る。対句「今日の一歩。世代の基盤。」 ＋ ir 窓口 |

## 視覚言語
- 色 2 つ厳守: 近黒 + Crimson #C8102E（点・弧・キーワード・CTA だけ）。
- 型と余白で支配（color でなく scale）。宣言型 hero・特大の数字・大量の空白。
- モーション＝カメラ移動（効果でなく移動）。沈黙と遅さ。
- reduced-motion / mobile を必ず fallback（静止フレーム・DPR clamp・count 削減）。

## 実装スタック（リサーチ確定）
- 土台: Lenis + GSAP ScrollTrigger + @gsap/react（既導入）
- Hero 地球: **cobe**（5KB・MIT） / 文字: GSAP SplitText / 星野: drei Stars+Sparkles（既導入）
- corridor: **three-globe**（arc 増殖・MIT・three 共有）、fallback d3-geo（2D）
- 数字: @number-flow/react / 大気: @shadergradient/react / 動く図: Rive or SVG+GSAP
- ❌ Remotion runtime（会社規模で有償）/ react-globe.gl（three 二重化）/ Spline（透かし課金）
- 詳細: `design/research/`（matrix / shortlist / stack-recommendation）

## Brazil 要素（cliché ゼロで上品に）
方向修正 2026-06-04: Hero/early に Brazil/São Paulo をもう少し。ただし観光・国旗・サッカー・カーニバル禁止。**商取引インフラを visual grammar に**。
- Hero: 闇 globe に São Paulo+東京の 2 点だけ Crimson、降下で São Paulo が灯る（Black Marble luminance を近黒→Crimson 単色 re-map・生RGB不可）、Av. Paulista hairline 1 本、座標 `-23.56,-46.65`。
- Platform（主戦場）: **SISCOMEX 通関 gate motion（moat の唯一の可視化）** + PIX 即時パルス（teal 不使用）+ NF-e 発行ノード + compliance 薄板 strata（LGPD·ANPD/CNPJ）。
- Portfolio: J-Planet を CNPJ `63.097.119/0001-44` + Av. Paulista 2300 + pt-BR 法人名で接地。
- 色・ロゴは各システムから一切 borrow しない（近黒+Crimson のみ）。詳細・採用10/回避10 = `design/research/brazil-visual-language.md`。
- ⚠ public NG: 「PRC 唯一」「24ヶ月先行」等の moat 機密 framing は出さない（docs/02）。

## `[sir-decide]` 残り 1 件
- **トーン**: ダーク宇宙（推奨・最も epic）⇄ 闇→光に抜ける hybrid。※本リサーチは全てダーク宇宙前提で実施。

## 実装の入口
1. Hero プロトタイプ（cobe + 星野 + SplitText + scroll 降下）を独立 demo で検証 → 質感を sir 確認
2. corridor（three-globe 弧増殖）を独立 demo で検証
3. OK → docs/ に section spec 確定 → Codex 実装（done=lint/typecheck/test/build 緑、fallback 必須）

## 関連
docs/02（翻案ガイド）/ docs/04（色 lock）/ docs/07（旧 IA 土台）/ docs/09（確定スタック）/ docs/11（参考サイト）/ design/research/（template リサーチ）
