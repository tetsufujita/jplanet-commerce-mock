# s5 — 持株グループ図の draw

- **要件**: Andes Inc.(JP) → Andes BR → J-Planet → J-Vita の**親子関係**を 1 回で理解させる（持株会社の信頼の核）。
- **手本（1 サイト）**: **CloudWalk**（複数ブランドの章分け＝群構造の見せ方・**構成のみ参考**、motion は借りない）。
- **付け方**:
  - なぜ: 「線が引かれる」で親子の所有関係を一発で伝える。
  - どこで: §5 の組織図の line / node。
  - いつ: in-view で **once**。
- **抑制**: 線描画 `--dur-base`〜`--dur-count`・ease=`--ease-andes`。node は順に点灯。
- **実装**: SVG `stroke-dasharray` + `@gsap/react`（依存追加ゼロ）、once。CNPJ 等の制度的事実は monospace で静止表示。
- **反例**: 図の常時アニメ / 回転 / 自動再生ループ。
- **reduced-motion**: 図は描画済で静止。
