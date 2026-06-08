# Ch.2 (Why now) Claude 実装 progress log

## Goal
src/components/chapters/Chapter2WhyNowClaude.tsx + preview route + 4 screenshot + self review。

## Steps
- [done] step 1: spec / Ch.1 pattern / messages keys / tokens を読む
- [done] step 2: Chapter2WhyNowClaude.tsx 実装
- [done] step 3: preview/ch2-claude/page.tsx 作成
        ※ 元 spec の `_preview` は Next.js 私的 folder 規約で route 化されないため
          `preview` (underscore 無し) に rename。URL は /ja/preview/ch2-claude
- [done] step 4: pnpm lint + typecheck + test + build all pass、build 出力に route 表示確認
- [done] step 5: playwright で desktop 1440x900 と mobile 375x812、scroll 0% / 80% で 4 screenshot 取得
        ./audit-ch2-claude-{desktop,mobile}-{0,80}.png
- [done] step 6: CH2_SELF_REVIEW_CLAUDE.md 書き込み、3 軸 7+ / Hallmark 6 軸 4+ 合格

## 合格判定
done when 条件すべて満たす ✓

## file 一覧（新規 / 変更）
new:
  src/components/chapters/Chapter2WhyNowClaude.tsx
  src/app/[locale]/preview/ch2-claude/page.tsx
  audit-ch2-claude-desktop-0.png
  audit-ch2-claude-desktop-80.png
  audit-ch2-claude-mobile-0.png
  audit-ch2-claude-mobile-80.png
  CH2_PROGRESS_CLAUDE.md
  CH2_SELF_REVIEW_CLAUDE.md
existing 触らず:
  src/components/chapters/Chapter1Overture.tsx
  src/components/cinematic/PaintCanvas.tsx
  src/components/cinematic/SmoothScrollProvider.tsx
  src/components/cinematic/MotionGate.tsx
  src/app/[locale]/page.tsx
  src/components/chapters/Chapter2WhyNow.tsx (Codex 版)
  messages/{ja,en,pt-BR}.json
