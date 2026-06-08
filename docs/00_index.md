---
title: 00 docs インデックス
updated: 2026-06-04
note: docs/ 全体の目次。Codex / Claude はまずここを見て該当 doc に飛ぶ
---

# 00 docs インデックス

> Andes コーポレートサイトの設計 SSOT（`docs/`）の目次。**迷ったらまずここ。**
> Codex は read-only。設計変更は Claude が docs/ を先に更新してから実装に渡す。

## ⚠ RESET + STACK 固定 2026-06-04

- **デザイン白紙**: 過去探索（dark/light/globe/rail/cosmos）と旧 Next.js 実装は **全て `_old/` に退避**（参照のみ・不採用）。
- **★技術スタック固定**: **React 19 + Vite 6 + Tailwind CSS 4 + Motion(`motion/react`) + TypeScript**。**Next.js は不採用**。アニメは **Motion 一本**（GSAP/Lenis/Three/Remotion は廃）。詳細は AGENTS.md `## Stack`。
  - → 旧 Next.js `src/` は `_old/` 行き・**Vite で作り直し**（Codex の最初のタスク）。
  - → docs/04・07・08・design/motion-kit の motion 記述で **GSAP/Lenis/Three を挙げている箇所は Motion 等価に読み替え**（IA・視覚・色・anti-slop はそのまま有効）。
- 事実 SSOT（docs 01–08・10）と process は有効。「規定」は `project_build-from-zero-rule`（memory）。

## SSOT 一覧（現行・有効）

| # | doc | 内容 | 主な参照者 |
|---|---|---|---|
| 01 | [company-info](01_company-info.md) | 法人情報 SSOT（住所 / CNPJ / 代表 / 連絡先 / ドメイン） | 全員 |
| 02 | [business-model](02_business-model.md) | ビジョン / 2 層構造 / Phase / 翻案ガイド | 全員 |
| 03 | [services](03_services.md) | 事業内容 | copy / page |
| 04 | [brand](04_brand.md) | ブランド / 色 lock（Crimson #C8102E は pin-point） | デザイン / 実装 |
| 05 | [pages-spec](05_pages-spec.md) | 各 page 要件 + i18n key | 実装 |
| 06 | [team](06_team.md) | チーム情報 | copy / page |
| 07 | [homepage](07_homepage.md) | **★homepage 構成 決定版**。8 section IA / 視覚システム / motion / 参考マッピング | デザイン / 実装 |
| 08 | [requirements](08_requirements.md) | **★要件定義（確定）**。目的/読者/成功指標/トーン(dark推奨)/参照役割/motion方針/進め方/PASS。Codex 発注書 | デザイン / 実装 |
| 09 | [homepage-handoff](09_homepage-handoff.md) | **★Codex 発注書（cinematic 版・2026-06-04）**。mockup を正に hero+§2+§3 を実装。使う画像/モデル/トークン/数値/PASS。**§7 で 04/07/08 との相違（sir 確認事項）** | デザイン / 実装 |
| 10 | [agentic-workflow](10_agentic-workflow.md) | 二刀流 BP（Codex × Claude）。役割 / ハンドオフ / Codex タスクテンプレ / 失敗パターン | デザイン / 実装 |

> ⚠ **09 は cinematic 方向の最新 Codex 発注書**。homepage の **visual は 09 が 07/08 を上書き**（sir mockup 2026-06-04）。07/08 の IA/要件は土台として有効だが、cinematic との相違は 09 §7 参照。11 / 12（旧 design 探索）は `_old/`。

## よく使う引き出し

- **法人情報 / 連絡先 / CNPJ / ドメイン** → [01_company-info](01_company-info.md)
- **ビジョン / 事業 / 翻案ガイド（public NG 表現）** → [02_business-model](02_business-model.md)
- **色 / Crimson の使い方** → [04_brand](04_brand.md)
- **各 page 要件 / i18n key** → [05_pages-spec](05_pages-spec.md)
- **★homepage を実装する（Codex 発注書・cinematic・使う画像/モデル）** → [09_homepage-handoff](09_homepage-handoff.md)
- **★homepage 構成 / 何を作るか（IA の土台）** → [07_homepage](07_homepage.md)（IA・視覚システム。cinematic 相違は 09 §7）
- **要件定義（発注書）** → [08_requirements](08_requirements.md)
- **効果の処方箋（motion の付け方・付ける場所）** → [`design/motion-kit/`](../design/motion-kit/README.md)（00_tokens / s1 hero / s2 数字 / s3 2層 / s5 群構造 / _rejected）
- **作り方（AI/Codex で綺麗に作る）/ 参考サイト** → [`design/research/ai-homepage-build-playbook.md`](../design/research/ai-homepage-build-playbook.md) / [`design/research/reference-sites.md`](../design/research/reference-sites.md)
- **Codex への渡し方 / done の定義** → [10_agentic-workflow](10_agentic-workflow.md)
- **過去の探索を見たい** → `_old/reset-2026-06-04/`（research / prototypes / specs 等。参考であり採用済みではない）

## 再利用できる「知識」（退避済みだが事実は有効）
新デザインでも効く事実（採用済み visual ではなく、素材・事実）:
- 4 マクロ数字 [verified]: 6.6億人(World Bank) / US$7,690億(LatAm EC・PCMI) / 2.1億人(IBGE) / 1.7億人(PIX・中銀)
- Brazil cliché 回避リスト（国旗緑黄 / Christ / carnival / soccer / tourism）＝ `_old/.../design/research/brazil-visual-language.md`
- アニメ素材のライセンス監査（GSAP/Lenis/cobe=可、paper.design/LYGIA/whatamesh=NG）＝ `_old/.../design/research/`
- 既導入の依存（gsap/lenis/three/drei/framer-motion/cobe 等）は package.json のまま

## 関連（read-only 親 SSOT）
- `~/Desktop/Andes-New/Company.md`（法人詳細の上流）
