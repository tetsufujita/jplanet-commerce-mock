# Task 1 Report — Register the agent hub and route fixed navigation

## 変更概要

- `SazoView` と QA view allowlist に `"agent-hub"` を登録した。
- 固定モバイルの「エージェント」を `ControlButton` から `NavigationButton` に変更し、`{ type: "navigate", view: "agent-hub" }` を dispatch するようにした。
- ホーム上部ランチャー、`open-agent` action、AgentComposerSheet renderer は変更していない。
- reducer/QA ルートと固定ナビの遷移・選択状態・dialog 非表示を検証するテストを追加した。

## RED

Command:

```bash
pnpm exec vitest run tests/unit/sazo-commerce-model.test.ts tests/unit/sazo-commerce-shell.test.tsx --reporter=dot
```

Output summary: 2 tests failed as expected. `?qa=1&view=agent-hub` resolved to `home`, and clicking the mobile agent button left `data-view` as `home`; these failures demonstrated that the QA allowlist and fixed navigation had not yet been implemented.

## GREEN

Command:

```bash
pnpm exec vitest run tests/unit/sazo-commerce-model.test.ts tests/unit/sazo-commerce-shell.test.tsx --reporter=dot
```

Output summary: 2 test files passed; 54 tests passed. `git diff --check` also passed.

## Self-review

- The new state is accepted by both reducer navigation and `qa=1` initialization.
- The fixed navigation uses the existing `NavigationButton`, so its selected state is exposed through `aria-pressed="true"`.
- The change does not remove or alter the separate agent overlay entry points required to remain intact.
- Only the four assigned code/test files were included in the commit; this report remains intentionally unstaged.

## Commit

`5baa1a53e9fedc243df2ef1ab7adfeddde191cd9` — `feat: route mobile agent navigation to hub`

## 懸念

Task 1 registers and routes `agent-hub` only. Rendering the dedicated hub view is intentionally deferred to subsequent tasks; until then, the shell state changes correctly but the hub content is not yet supplied by this task.

## Fix round 1

### 変更概要

- 旧仕様の固定下部「エージェント」から catalog を開く helper を、ホーム上の既存「URL・画像・商品名をAIに相談」ランチャーから composer を開いて送信する経路へ変更した。
- モバイルの固定ナビ契約は、`agent-hub` への遷移、`aria-pressed="true"`、Agent Composer dialog 非表示を確認するよう更新した。
- ホームAI導線を操作するケースだけ、モバイル media query を明示して描画した。

### RED

```bash
pnpm exec vitest run tests/unit/sazo-commerce-views.test.tsx --reporter=dot
```

Output summary: 3 tests failed under the obsolete contract because the fixed agent item now navigates to `agent-hub`, so the composer dialog was not present.

### GREEN

```bash
pnpm exec vitest run tests/unit/sazo-commerce-model.test.ts tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-views.test.tsx --reporter=dot
```

Output summary: 3 test files passed; 88 tests passed.

```bash
pnpm test -- --reporter=dot
```

Output summary: 18 test files passed; 224 tests passed.

### Self-review

- Catalog journey coverage retains the home launcher → composer → submit behavior instead of conflating it with fixed navigation.
- The navigation contract directly asserts the new state, selected accessibility state, and absence of the obsolete overlay.
- This fix-round commit contains only this test file and this report.
