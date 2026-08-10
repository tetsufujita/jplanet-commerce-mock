# J-Planet Mobile Home: unified shortcuts, coupon, and categories

## Goal

Simplify the mobile home first fold while making the catalog feel more like a Brazilian marketplace. Remove the duplicated top navigation row, keep the fixed bottom navigation as the page-level navigation, and move discoverability into a single horizontally scrollable shortcut rail.

## Approved visual hierarchy

1. Existing mobile brand header and hero remain unchanged.
2. One horizontal shortcut rail follows the hero/search area. Its order is:
   `J-Planet特集 → 限定 → フリマ → サービス紹介 → 人気ブランド → カテゴリー → レビュー → ヘルプ → お知らせ`.
3. The rail is native touch-scrollable, has no visible scrollbar, and does not create page-level horizontal overflow. `コスメ` and `K-POP` are removed. The top secondary navigation row, including `ホーム`, is removed from the home view. The fixed bottom navigation keeps `ホーム`.
4. A prominent coupon banner follows the shortcut rail. It uses the existing J-Planet coupon visual language and has a clear redeem action that routes to the existing coupons view.
5. The former “ブラジル最大級 日本直輸入ショップ” explanatory block is removed from the home flow. The coupon banner occupies that promotional slot above the interested-items rail.
6. The existing J-Planet GRAM content remains. A photo-led `カテゴリー` rail is inserted directly below it, using existing category/product imagery and horizontal touch scrolling on mobile.

## Interaction model

- Shortcut buttons dispatch the same existing view actions used by the former secondary navigation. `お知らせ` remains an inert informational item until an existing destination is available.
- The coupon banner is a presentation card with an accessible button; activation dispatches `navigate` to `coupons`.
- Category cards are buttons with an accessible category label. They route to the existing category directory when a direct category mapping exists; otherwise they remain selectable/inert without changing the page.
- Bottom navigation remains the primary page navigation and is not duplicated in the shortcut rail.

## Component boundaries

- `SazoShell`: remove the home-only mobile secondary navigation render path. Do not change product, cart, checkout, or desktop navigation.
- `HomeView`: own the unified shortcut rail, coupon slot, and category rail placement. Reuse existing `shortcuts`, `gramCategories`, product fixtures, and dispatch actions.
- `fixtures`/small home fixture module: define the nine shortcut entries and category presentation data if existing fixtures do not provide the required shape. No external network data is introduced.
- `sazo.css`: mobile-first layout rules for the rail, coupon, and category cards. Preserve J-Planet white/navy/sakura tokens and safe-area spacing.
- Locale files: add labels and accessible descriptions in Japanese, English, and Portuguese without hard-coding user-facing copy in JSX.

## Responsive behavior

- At 341px, 390px, and 440px viewport widths, `documentElement.scrollWidth` equals `clientWidth` on the home page.
- Only the shortcut and category rails may have intentional internal horizontal overflow.
- Coupon artwork uses a fixed aspect ratio, `object-fit: cover`, and rounded corners so it remains legible without increasing the first fold unexpectedly.
- Category cards use compact circular or rounded image tiles with two-line labels, matching the Shopee reference without importing Shopee branding.
- Reduced-motion users receive instant rail/anchor movement; normal users retain the existing gentle scroll behavior.

## Accessibility and states

- Rails expose navigation/group labels and keyboard-focusable buttons.
- Coupon action has a descriptive accessible name and visible focus ring.
- Missing category image data falls back to a neutral J-Planet tile rather than a broken image.
- The shortcut rail preserves keyboard reachability even though its scrollbar is hidden.

## Verification contract

- Unit tests assert the nine shortcut labels/order, absence of `ホーム` in the rail, absence of `コスメ`/`K-POP`, coupon presence/action, and category section placement after GRAM.
- E2E tests assert mobile home rail count/order, internal horizontal scrolling with page scroll unchanged, coupon CTA routing, category rail visibility, and no page-level overflow at 341/390/440px.
- Existing desktop/product/cart/checkout tests must remain unchanged and green.
- Visual QA captures the mobile first fold and the post-GRAM category section at 341px, 390px, and 440px.

## Out of scope

- Checkout/payment copy or PRC-dependent purchase behavior.
- Changes to desktop product/detail/cart/checkout layouts.
- New backend/catalog APIs or remote image fetching.
- Rebranding the existing J-Planet logo or bottom navigation.
