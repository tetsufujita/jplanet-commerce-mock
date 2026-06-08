---
title: 08 要件定義（Andes 公式サイト）
updated: 2026-06-04
status: ★確定（sir 回答済 2026-06-04。トーンのみ最終 1 トグル）
basis: docs/07(構成) + docs/04(色/motion) + 専門家パネル + design/motion-kit
---

# 08 要件定義（requirements definition）

> Andes 公式サイトの「何を・誰に・どう作るか」の合意。Codex への発注書。実装は docs/07(構成)・本 doc・design/motion-kit を読む。

## 要件一覧
| # | 項目 | 確定内容 |
|---|---|---|
| 1 | **目的（1行）** | B2B/投資家/パートナー/採用候補に「Andes＝LATAM Agentic Commerce のインフラ企業」だと一瞬で伝え、**最先端で信頼できる**と感じさせる |
| 2 | **読者** | 投資家(Series A 文脈) / 事業パートナー / 採用候補。**消費者ではない** |
| 3 | **成功指標**（sir 決定） | ① **「最先端・かっこいい」と感じさせる**（craft で・盛りすぎでなく）② **採用/パートナーの入口**になる（careers@/partners@ 流入）。土台として③投資家が「胡散臭くない・本物」と感じる（盛らない） |
| 4 | **トーン** | editorial・restrained・**最先端＝精度と余白とよく練られた数個の動きで出す**（演出を盛らない）。Crimson は面積 1–2% のみ |
| 5 | **構成（IA）** | docs/07 の **8 section**（①宣言hero ②4マクロ数字 ③2層構造 ④why now/moat ⑤持株グループ図 ⑥事業(EC隔離) ⑦mission長期 ⑧CTA4窓口）。各 section「1画面1主役」 |
| 6 | **コンテンツ source** | 法人=docs/01 / 数値=4マクロ[verified] / 文言=messages(3 locale)。**ハードコード禁止** |
| 7 | **制約（NG集）** | public NG(北極星/中南米の王/$1T 生表現/Series A機密/PRC唯一・24ヶ月先行) / Inter禁止 / gradient抑制 / **Aceternity・v0生出力・broad template収集 不使用** |
| 8 | **参照サイト（役割固定）** | 構成=**Stripe** / 品質の天井(slop でない"正解"画像)=**Linear** / 効果=section別最小（§1=Linear, §2=dLocal, §3=Linear/Stripe, §6=Sierra）/ §5 群構造=CloudWalk 構成のみ / トーン=MELI IR・Anthropic 参考。**他サイトを勝手に真似ない** |
| 9 | **motion 方針**（sir 承認） | **Motion（`motion/react`）一本**で自作（GSAP/Lenis/Three 不使用）。主役 motion は実質4つ（§1 hero reveal+線 / §2 数字 count / §3 2層 順次+線 / §5 群構造図 draw）。**動かす section 最大3**・1画面1主役・同一 easing token・外部取得は最大1個。詳細=design/motion-kit |
| 10 | **性能 / a11y** | `transform`/`opacity` 限定・hero を LCP にしない・**LCP<2.5s / CLS≈0**・reduced-motion で静的終端へスナップ |
| 11 | **i18n × motion** | 行 reveal は**改行依存しない実装**（行/ブロック単位 stagger）・3 locale(ja/en/pt-BR)で破綻なし・数字接尾辞(億人/US$)を壊さない |
| 12 | **進め方**（sir 決定） | **8 section 一気に**実装。ただし**ガードレール**: ①motion-kit+token で動かしすぎを物理制限 ②一気でも確認は section ごとに Claude が diff レビューして slop を弾く |

## 色（docs/04 lock を正に）
- **Navy `#0F1B3D` + Crimson `#C8102E`（pin-point）**（docs/04 [sir-decided]）。
- **トーン = dark 推奨**（成功指標「最先端・かっこいい」に最適。Linear/Vercel register）:
  - base = Navy `#0F1B3D`（near-black 寄り）/ text = paper off-white / accent = Crimson 1–2%。
  - light 案（base=paper / text=Navy）に戻すのは **1 トグル**。構成・motion は同一。
  - ※ docs/07 §1 の ivory 表記は light 案の名残。**dark なら base=Navy** で読み替え。

## ガードレール（8 section 一気＋"かっこいい"＝最 slop リスクへの対策）
1. **motion budget を token で固定**（design/motion-kit/00_tokens）— 動く主役 3 section・1画面1主役・唯一 easing。
2. **section ごと diff レビュー**（Claude）— 一気に scaffold しても、§1 から順に「仕様どおり・slop でない(Linear 基準)」を確認してから次へ。
3. **_rejected.md**（design/motion-kit）に「入れない effect と理由」を持ち、盛りたくなったら却下記録を見る。

## 残る最終決定（1 トグルのみ）
- **トーン dark（推奨）⇄ light**。dark で進める前提。sir が「light」と言えば即フリップ（構成・motion 不変）。

## 次の手順
1. 本要件＋docs/07＋design/motion-kit を Codex に渡す。
2. Codex が 8 section を scaffold（messages 3 locale・色トークン・既存 motion 部品流用）。
3. Claude が §1→§8 を順に diff レビュー（Linear 基準・PASS 条件）→ sir が localhost で目視 → 直し → Vercel。

## PASS（実装 done）
- [ ] 8 section が docs/07 IA 順で存在・hero は宣言+数字なし・数字は§2・EC は§6 隔離・持株は§5 図示。
- [ ] 色 = Navy+Crimson のみ（Crimson 面積1-2%）。Inter 不使用・数字/法令 monospace。
- [ ] motion は budget 内（主役3 section・1画面1主役・唯一 easing・reduced-motion 静的終端）。§7/§11 の禁止が一切ない。
- [ ] 文言 messages 3 locale・色トークン・hex ハードコードなし。lint && typecheck && test && build 緑。
- [ ] Claude の section 別 diff レビューを全 section 通過（Linear 品質基準）。
