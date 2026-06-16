# QA hover-2 — 原本 vs クローン frame 差分

録画対応: 原本 f-hover/041–201（201f 総数）、クローン cf-hover/034–067（167f 総数）  
比較対応は「開いている megamenu / 操作フェーズ」で揃えた。  
panel 高さ +60px・open/close timing 差は**既知差分のため除外**。

---

## フレーム対応マップ（megamenu）

| フェーズ | 原本 | クローン |
|---|---|---|
| サービス megamenu 開 | f-018〜024 | cf-013〜019 |
| ソリューション megamenu 開 | f-025〜029 | cf-020〜024 |
| 開発者 megamenu 開 | f-030〜034 | cf-025〜029 |
| リソース megamenu 開 | f-035〜041 | cf-030〜033 |
| megamenu 閉・hero hover | f-042〜074 | cf-034〜062 |
| feature cards section | f-075〜201 | cf-063〜067（section 入口のみ） |

---

## 差分表

### HIGH（修正必須）

| # | 分類 | 原本状態 | クローン状態 | 原本 frame | クローン frame |
|---|---|---|---|---|---|
| H-1 | サービス megamenu — veil | 背景に **半透明白 veil** がかかりコンテンツがはっきり退色。hero 背景グラデが白みがかる | veil なし。hero background がほぼ変わらず鮮やか。退色効果がない | f-018 | cf-013 |
| H-2 | サービス megamenu — Sessions 画像カード | 右端「さらに表示」列に **Stripe Sessions 2026 サムネ画像** ＋テキストブロック表示（紫グラデ画像） | Sessions 画像カード**なし**。「さらに表示」列は製品ロードマップ/Atlas/Climate/Identity のテキストリンクのみ | f-018 | cf-013 |
| H-3 | サービス megamenu — Identity リンク | 「さらに表示」列に **Identity（オンライン本人確認）** リンクが存在する | Identity **なし** | f-021 | cf-016 |
| H-4 | クローン録画打ち切り — feature cards hover | 原本 f-075〜201：feature cards（オンライン決済・サブスク・エージェンティック等）への hover 巡回が 127f 分存在。cards の ⤢ アイコン点灯・card lift・下段 3 サブカード hover が全て確認できる | クローン cf-066 でカード section が初めて画面内に入るが cf-067 で録画終了。hover 動作の検証フレームが**ゼロ** | f-075〜201 | cf-066〜067 のみ |
| H-5 | feature card ⤢ アイコン — hover 点灯 | hover 中のカードの右上 ⤢ アイコンが**青（#635BFF 相当）に点灯**（f-125: 右カード「あらゆるサブスク」で確認、f-140: 左カードでも同様） | クローン側に同区間の frame なし。実装未確認 | f-125, f-140 | — |

---

### MID（要確認・要修正候補）

| # | 分類 | 原本状態 | クローン状態 | 原本 frame | クローン frame |
|---|---|---|---|---|---|
| M-1 | ソリューション megamenu — 列幅・行間 | col1「成長段階別」2項目、col2「ユースケース別」9項目が均等余白でレンダリング。Panel 高さは行数に応じた自然な高さ | 列内容は一致するが、各リンクの**行間が原本より詰まっている**（line-height が小さく見える）。panel 自体は既知差分の +60px を除いても圧縮気味 | f-025 | cf-020 |
| M-2 | 開発者 megamenu — リンク色 hover | panel 内リンクにカーソルが乗ると**青紫（#635BFF）にテキスト色が変わる**のが複数フレームで観察 | panel 内リンクは**静止色のまま**変化なし（青味がほぼ見えない） | f-030〜034 | cf-025〜029 |
| M-3 | nav アクティブ項目の下矢印方向 | hover 中の nav 項目（例「サービス ∧」）は **∧（上向き）** に変わりパネル開状態を示す | クローンも **∧** に変化している。ただし変化タイミングが原本より**約 1f 遅い**（panel 先行・chevron 後） | f-018 | cf-013 |
| M-4 | サービス megamenu — サイドカード「こちらからご覧ください」arrow | Sessions カード内のリンクに **→ arrow** が付き hover で移動する | Sessions カード自体がない（H-2）ため arrow 動作も未実装 | f-019 | — |
| M-5 | リソース megamenu — 「採用情報」リンク色 | 「会社情報」列の「採用情報」が**赤みがかった紫**でハイライト（hover 中） | 同列が存在するが hover 色変化が確認できない（色変化なし or 差が微小） | f-038 | cf-030 |
| M-6 | hero section — 「始める →」ボタン hover | ボタン hover で **arrow が右へ約 4px スライド**するアニメが観察できる（f-050 付近） | クローンの同区間（cf-035〜050）で arrow 移動**なし**。arrow は静止のまま | f-050 | cf-040 |
| M-7 | サインイン button hover | 原本では「サインイン」テキストボタン hover 時に**下線が出現** | クローンでは下線**なし**（hover 前後で変化が視覚的に見えない） | f-016 | cf-013 |

---

### LOW（軽微・目視レベル）

| # | 分類 | 原本状態 | クローン状態 | 原本 frame | クローン frame |
|---|---|---|---|---|---|
| L-1 | サービス megamenu — カラム見出し font-weight | 「Payments」「収益」等の列ヘッダが **600–700** 相当のウェイト | クローンは同ヘッダが若干細く見える（500 相当？）。フォント読み込み差の可能性あり | f-018 | cf-013 |
| L-2 | megamenu panel 角丸 | panel 下端の border-radius が**8px** 程度でシャープ | クローンは border-radius が**やや大きく（12px 相当）**見える | f-025 | cf-020 |
| L-3 | logo 「stripe」 hover | logo 上 hover 時に原本では**opacity が微妙に下がる**（0.8 相当） | クローンでは opacity 変化**なし** | f-016 | cf-013 |
| L-4 | ロゴマーキー退色（veil 連動） | megamenu 開時、ロゴマーキー行が veil で退色し薄くなる | veil がない（H-1）ためロゴも退色せず鮮明なまま | f-018 | cf-013 |
| L-5 | feature cards — card 内テキストリンク hover underline | 原本では feature card 内の詳細説明テキストリンク hover で**underline が付く** | クローン側のフレーム不足で確認不可（H-4 と同根） | f-185〜201 | — |

---

## サマリー

- **HIGH 5件・MID 7件**
- 最重要: **H-1 veil 欠落**（megamenu 開時の背景退色が全くない）・**H-2 Sessions 画像カード未実装**・**H-4/H-5 feature cards hover が録画範囲外で未検証**
- MID の中では **M-6「始める→」arrow 不動** と **M-2 panel 内リンク色変化なし** が体感影響大
- feature cards 区間（原本 f-075〜201 相当）は**クローン側の録画が打ち切られており hover 動作が未検証**。次回 QA では cf-hover スクリプトの body scroll range を延長して再収録が必要
