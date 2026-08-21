# Public Prototype Shell Design QA

## Source visual truth

- Desktop system direction: [`selected-overview.jpg`](https://github.com/code-for-people-2026/cfp-mono/blob/main/docs/design/website-system-directions/selected-overview.jpg), 1440 × 1024 px.
- Mobile and responsive direction: [`selected-mobile-320.jpg`](https://github.com/code-for-people-2026/cfp-mono/blob/main/docs/design/website-system-directions/selected-mobile-320.jpg), 1600 × 1020 px design board.
- Written contract: [`DESIGN_SYSTEM.md`](https://github.com/code-for-people-2026/cfp-mono/blob/main/docs/design/website-system-directions/DESIGN_SYSTEM.md).
- Comparison scope: the selected visual defines the shared GitHub Pages carrier. Each existing phone App remains live HTML with its original content and interactions, so page-specific copy and phone content are intentionally not pixel-matched to the reference board.

## Implementation evidence

- Desktop, 1440 × 1000 CSS px, device pixel ratio 1:
  - [`root-1440.png`](./design-qa-screenshots/root-1440.png)
  - [`neighbors-customer-1440.png`](./design-qa-screenshots/neighbors-customer-1440.png)
  - [`kith-customer-1440.png`](./design-qa-screenshots/kith-customer-1440.png)
  - [`recycle-1440.png`](./design-qa-screenshots/recycle-1440.png)
- Mobile, 390 × 844 CSS px, device pixel ratio 1:
  - [`root-390.png`](./design-qa-screenshots/root-390.png)
  - [`neighbors-customer-390.png`](./design-qa-screenshots/neighbors-customer-390.png)
  - [`kith-customer-390.png`](./design-qa-screenshots/kith-customer-390.png)
  - [`recycle-390.png`](./design-qa-screenshots/recycle-390.png)
- Narrowest checked state, 320 × 740 CSS px, device pixel ratio 1:
  - Before responsive fix: [`kith-role-customer-320-viewport.png`](./design-qa-screenshots/kith-role-customer-320-viewport.png)
  - After responsive fix: [`kith-role-customer-320-fixed.png`](./design-qa-screenshots/kith-role-customer-320-fixed.png)

The source and implementation desktop images use nearly equal pixel dimensions and density. The mobile source is a design board rather than a page-specific 320 px capture; it was used for component and breakpoint intent, while implementation screenshots and browser measurements were used for structural mobile verification.

## Full-view comparison evidence

The reference and the rendered near-neighbor customer page were opened together in one comparison pass. The implementation carries over the selected glacier background, white rounded carrier, compact white header, navy typography, restrained civic red actions, silver borders, red-tinted prototype status strip and dark phone stage. The different story copy, stage proportions and live phone contents are expected because the written contract explicitly says not to force one content canvas and not to redesign the App inside the phone.

Representative root, near-neighbor, Kith and recycle captures were then reviewed at 1440 and 390. All use the same public-shell hierarchy while keeping their own product canvas and interaction density.

## Focused comparison evidence

- **Header and status:** desktop height is 65 px. All 10 redesigned pages add a 42 px status strip, matching the 64 px compact-header and 40–48 px status specifications. Each strip now has one left-aligned content group only; root and content pages keep the data boundary there, with no separate right-side metadata label. The current object remains visible at mobile widths.
- **Typography:** the carrier uses the specified PingFang SC / Noto Sans SC / Microsoft YaHei / system stack, navy foreground, heavy Chinese display hierarchy and quieter metadata. Existing phone typography remains unchanged.
- **Spacing and surfaces:** the outer frame uses a 20 px desktop radius, 1 px silver border, white surface and E3 shadow. Buttons use 8–9 px radii and the specified red hover/active states. Product canvases retain their intentional density.
- **Color tokens:** public background `#F4F7FA`, foreground `#081628`, primary `#D20D18`, muted `#EEF2F6`, borders `#D7DFE8` / `#BBC7D3` and stage `#071321` match the selected system. Confirmation teal is not introduced as public-shell decoration.
- **Image and icon fidelity:** existing Kith images, the root relationship graphic, phone contents and recycle icon sprite were preserved; no source asset was rasterized or replaced during the shell redesign. All images loaded in the browser.
- **Copy and content:** the public brand is consistently “码成仝”; pages state that they are public interactive prototypes and do not use real business data. Content pages expose the prototype-only route hierarchy through left-aligned breadcrumbs, with no unimplemented feedback control. The formal website is a separately labelled external destination rather than a breadcrumb ancestor.

Focused captures were needed for the compact header/status boundary and the dense 320 px role navigation. No additional crop was needed for the phone App because its design was explicitly frozen; interaction and containment were checked instead.

## Findings and comparison history

1. **First pass — P2 mobile header density:** the two deep Kith role pages stacked four actions vertically at 320 px, producing a 189 px header and consuming too much of the first viewport. The shared shell gained an opt-in `is-dense` mobile action grid, and both role pages adopted it.
2. **Post-fix pass:** at the same 320 × 740 viewport the actions render as a two-column grid, header height falls to 156 px, all labels remain readable and tappable, and document width remains exactly 320 px. No actionable P0, P1 or P2 issue remains.

The shared breadcrumb removes the former route-specific action clusters, so the two role pages no longer require a taller action grid at narrow widths.

## Structural and interaction verification

- All 10 redesigned routes were rendered at 1440 × 1000, 390 × 844 and 320 × 740.
- Every route reported `documentElement.scrollWidth === innerWidth`; no page-level horizontal overflow was found.
- Every route loaded exactly one shared `prototype-shell.css`, one public shell header and one `h1`; broken image count was zero.
- Near-neighbor CTA changed the shared `step` state from the value proposition to the need state.
- Kith CTA changed the shared `step` state from generation to menu review.
- Recycle “体验住户扫码” changed the live phone from the floor panel to the detected-floor request flow.
- Every redesigned content route exposes one breadcrumb navigation with exactly one `aria-current="page"` item and no feedback control; the prototype home correctly exposes no breadcrumb.
- Browser console warnings and errors: none observed.
- Full Pages build passed against the latest `main`, including the frozen Paihaocai customer build and static implementation design board.
- The Pages artifact checker passed for 10 redesigned pages and 6 frozen pages.
- Paihaocai source files and the three legacy near-neighbor compatibility pages have no diff from `origin/main`; all six frozen public routes returned HTTP 200 from the built artifact.

## Implementation checklist

- [x] Shared compact shell, prototype boundary and breadcrumb hierarchy without dead controls.
- [x] Correct relative shared-style path at every deployed directory depth.
- [x] Root, near-neighbor, Kith and recycle carriers use the selected tokens.
- [x] Phone App content and interactions preserved.
- [x] Paihaocai and legacy compatibility pages frozen.
- [x] Desktop and mobile responsive checks completed.
- [x] First-pass mobile density finding fixed and rechecked.

## Root entry feedback iteration · 2026-08-21

This section records the earlier accepted state. Its disclosure-placement decision was superseded by the subsequent status-strip consolidation below.

### User-provided evidence

- Mobile layout issue: [`root-mobile-before.png`](./design-qa-screenshots/root-mobile-before.png).
- Duplicate disclosure issue: [`root-duplicate-disclosure-before.png`](./design-qa-screenshots/root-duplicate-disclosure-before.png).

### Post-fix evidence

- 390 × 844 CSS px, device pixel ratio 1: [`root-entry-mobile-390-after.png`](./design-qa-screenshots/root-entry-mobile-390-after.png).
- 1440 × 1000 CSS px, device pixel ratio 1: [`root-entry-desktop-1440-after.png`](./design-qa-screenshots/root-entry-desktop-1440-after.png).
- 320 × 740 CSS px was additionally measured in the live built artifact.

### Findings, fixes and verification

1. **P2 — mobile graph was too loose:** at the narrow breakpoint the graph consumed 670 px and the circles read as separate islands. The mobile graph is now 500 px high at 320–390 px, its primary circles are smaller, and neighboring circles overlap lightly around the central hub. At 390 px the measured overlap areas are non-zero for the hub with Kith, Paihaocai, recycle and both future nodes.
2. **P2 — lead copy sounded indirect:** replaced with the exact approved sentence: “近邻互助组基于真实经历搭线邻里需求；不同的小应用承接每一次具体协作，让互助逐渐成为社区日常。”
3. **P2 — root disclosure was duplicated:** removed the root status strip and retained “全部页面均为交互原型，不接入真实业务数据。” in the bottom-right footer. The artifact checker now treats this as a root-only rule while continuing to require the content-page status strip on the other nine redesigned routes.
4. **Post-fix pass:** 320, 390 and 1440 px checks all reported `documentElement.scrollWidth === innerWidth`; exact copy and footer disclosure were present; root status-strip count was zero; all four graph links retained their original destinations; browser console warnings and errors were empty. No actionable P0, P1 or P2 issue remains.

## Status-strip consolidation · 2026-08-21

### Source visual truth

- User-marked Kith status strip: [`status-strip-right-meta-before.png`](./design-qa-screenshots/status-strip-right-meta-before.png), 2976 × 424 px.
- Requested target state: keep only the strip's left content group on every redesigned page; restore that left-only strip on the root map and remove the root footer disclosure.

### Implementation evidence

- Kith content page, 1440 × 800 CSS px, device pixel ratio 1: [`kith-status-left-only-1440.png`](./design-qa-screenshots/kith-status-left-only-1440.png), 1440 × 800 px.
- Root map desktop, 1440 × 800 CSS px, device pixel ratio 1: [`root-status-restored-1440.png`](./design-qa-screenshots/root-status-restored-1440.png), 1440 × 800 px.
- Root map mobile, 390 × 844 CSS px, device pixel ratio 1: [`root-status-restored-390.png`](./design-qa-screenshots/root-status-restored-390.png), 390 × 844 px.

The source is a wide focused crop rather than a full 1440 px page. It was compared with the implementation's visible header/status region in the same image-review pass; full-page composition was judged from the 1440 and 390 browser captures.

### Findings, fixes and post-fix comparison

1. **P2 — duplicated right-side status metadata:** the source marked “场景探索” as redundant, and the same secondary slot appeared with other labels on the remaining redesigned content pages. All `public-status-meta` elements and the now-unused shared style were removed. Each of the 10 status strips now has exactly one content child.
2. **P2 — root disclosure placement no longer matched the requested hierarchy:** the root status strip was restored with “公开交互原型” and “不接真实业务数据 · 不代表服务已经上线” in its left group. The bottom-right footer disclosure was removed; the footer now contains only the organization signature.
3. **Data-boundary preservation:** pages whose former right label carried the only data warning now include “不接真实业务数据” in the retained left copy. Kith pages already contained that wording and were unchanged apart from deleting the right label.
4. **Required fidelity surfaces:** typography, tokens, red-tinted strip surface, borders and spacing continue to use the shared design system; no image assets or product content changed. The focused comparison confirms that the left group remains visually unchanged while the marked right slot is empty.
5. **Post-fix browser pass:** Kith at 1440 px reported one status child, zero right metadata elements and no horizontal overflow. Root at 1440 and 390 px reported one status strip, zero right metadata elements, zero footer-disclosure matches and no horizontal overflow. Browser console warnings and errors were empty. No actionable P0, P1 or P2 issue remains.

## Root hub color hierarchy · 2026-08-21

### Source visual truth

- Previous accepted root map: [`root-status-restored-1440.png`](./design-qa-screenshots/root-status-restored-1440.png), 1440 × 800 px at a 1440 × 800 CSS viewport and device pixel ratio 1.
- User direction: the application graph's color hierarchy should visually prioritize “近邻互助组”.

### Implementation evidence

- Desktop: [`root-hub-emphasis-1440.png`](./design-qa-screenshots/root-hub-emphasis-1440.png), 1440 × 800 px at a 1440 × 800 CSS viewport and device pixel ratio 1.
- Mobile full page: [`root-hub-emphasis-390.png`](./design-qa-screenshots/root-hub-emphasis-390.png), 390 × 1188 px at a 390 × 844 CSS viewport and device pixel ratio 1.

The previous and revised desktop images use the same route, viewport, density, content and interaction state. They were opened together in one comparison pass, so the judgment isolates color hierarchy rather than layout or scale changes.

### Findings, fix and post-fix comparison

1. **P2 — color emphasis competed with the hub:** the central “近邻互助组” circle shared navy with Paihaocai, while Kith and recycle used warmer red-family accents. Those smaller circles attracted attention before the graph's semantic center.
2. **Fix:** the hub is now the graph's only civic-red node (`#D20D18`), with a 2 px border, 4% red-tinted surface and restrained 15% red shadow. Kith, Paihaocai, recycle and all graph anchors use secondary navy (`#253B53`); future nodes keep the existing muted treatment.
3. **Post-fix browser evidence:** at 1440 and 390 px the hub heading computed to `rgb(210, 13, 24)` while all three live satellite headings computed to `rgb(37, 59, 83)`. The desktop and mobile documents remained exactly viewport-wide, so the color-only adjustment introduced no responsive regression.
4. **Required fidelity surfaces:** typography, spacing, copy, image/graphic quality, node sizes, overlap, routes and interactions are unchanged. Only semantic color tokens, hub surface tint, border weight and shadow hierarchy changed. The combined before/after view shows the eye landing on the hub first without making the satellites look disabled.
5. **Post-fix result:** no actionable P0, P1 or P2 issue remains. No additional focused crop was needed because the full-view same-size desktop comparison keeps every node label, border and surface readable.

## Root graph decorative-dot removal · 2026-08-21

### Source visual truth

- User-annotated mobile graph crop: [`root-graph-dots-before.png`](./design-qa-screenshots/root-graph-dots-before.png), 790 × 1474 px.
- Requested target state: remove the small solid decorative points from the graph background while preserving the relationship orbits and every application node.

### Implementation evidence

- Mobile full page: [`root-graph-no-dots-390.png`](./design-qa-screenshots/root-graph-no-dots-390.png), 390 × 1188 px captured at a 390 × 844 CSS viewport and device pixel ratio 1.
- Desktop: [`root-graph-no-dots-1440.png`](./design-qa-screenshots/root-graph-no-dots-1440.png), 1440 × 800 px at a 1440 × 800 CSS viewport and device pixel ratio 1.

The annotated source and mobile implementation were opened together in one comparison pass. The source is a focused crop with an annotation arrow, so comparison is limited to the graph region and the presence or absence of the marked decorative point family.

### Findings, fix and post-fix comparison

1. **P2 — decorative points looked like unexplained data:** the eight small solid SVG anchors did not connect to labels, states or interactions. On mobile, isolated visible points read as accidental artifacts rather than meaningful relationship markers.
2. **Fix:** removed all four anchor circles from the desktop SVG and all four from the mobile SVG, together with their unused styling. The two faint/dashed relationship orbits in each SVG remain, so the graph still reads as a connected system without floating markers.
3. **Post-fix browser evidence:** both responsive states reported zero `.connections circle` elements, four orbit ellipses across the two responsive SVGs, four live application links and document width equal to viewport width. The Pages checker now rejects a future reintroduction of root graph anchors.
4. **Required fidelity surfaces:** typography, color hierarchy, node borders and surfaces, spacing, copy, image/graphic quality, link destinations and interactions are unchanged. The combined source/implementation view confirms that the marked dot family is absent and the graph composition remains balanced.
5. **Post-fix result:** no actionable P0, P1 or P2 issue remains; no additional focused crop was required because the annotated source already isolates the affected detail.

## Breadcrumb navigation and recycle-header cleanup · 2026-08-21

This section records the first breadcrumb implementation. Its official-site ancestor and upper-right placement were superseded by the prototype-only, content-aligned navigation iteration below.

### Source visual truth

- User-annotated duplicate recycle header: [`recycle-duplicate-header-before.png`](./design-qa-screenshots/recycle-duplicate-header-before.png), 2940 × 1016 px.
- User-annotated unclear upper-right navigation: [`header-actions-before.png`](./design-qa-screenshots/header-actions-before.png), 2904 × 380 px.
- Requested target state: remove the recycle page's second logo/title row, omit the unavailable feedback entry and replace the mixed action cluster with a coherent breadcrumb.

### Implementation evidence

- Recycle page at the actual 595 × 908 browser viewport: [`recycle-breadcrumb-actual-595.png`](./design-qa-screenshots/recycle-breadcrumb-actual-595.png).
- Deep Kith route at the same actual viewport: [`kith-breadcrumb-actual-595.png`](./design-qa-screenshots/kith-breadcrumb-actual-595.png).
- Additional live-frame measurements covered 1440 × 800, 390 × 844 and all 10 redesigned routes at 320 × 740.

The two annotated source images and both implementation captures were opened together in the same comparison pass. The implementation evidence uses the actual in-app browser width; the wider and narrower states were verified against the same built artifact through fixed-size live frames rather than substituted static mockups.

### Findings, fixes and post-fix comparison

1. **P2 — duplicate product identity on recycle:** the page repeated “楼道收一收” in an internal topbar immediately after the public shell, together with a non-interactive “近邻互助组 · 楼道协作场景” pill and divider. That complete internal topbar and its unused styles were removed. The hero now begins directly after the prototype status strip without a compensating blank margin.
2. **P1 — navigation mixed hierarchy, destinations and an unavailable action:** “全部原型”, “返回正式网站” and “反馈” did not communicate a stable route model, while the feedback control had no real function. All 10 redesigned pages now use `正式网站 / 原型地图 / 项目 / 当前视角` breadcrumbs at desktop widths; only applicable levels render on each route, and the current level has `aria-current="page"`. The feedback control and its dormant panel were removed everywhere.
3. **Mobile hierarchy:** below 860 px the first “正式网站” level is omitted to protect space while preserving “原型地图”, project and current-view context. At 320 px every current item remained visible, all 10 documents measured `scrollWidth === clientWidth`, and no route rendered a feedback/action cluster.
4. **Post-fix browser evidence:** recycle measured zero `.topbar`/`.prototype-note` elements at 1440, 595, 390 and 320 px. The 1440 and 390 recycle documents and the deepest 320 px Kith document were exactly viewport-wide. The artifact checker now rejects a duplicate recycle header, old action classes, feedback controls or a missing/currentless breadcrumb.
5. **Required fidelity surfaces:** the shared tokens, status strip, typography, product copy, phone content, images and interactions are unchanged. The new header uses the existing navy/muted/red system, with links quieter than the dark current item. No actionable P0, P1 or P2 issue remains.

## Prototype-only content breadcrumbs · 2026-08-21

### Source visual truth

- Previous 595 × 908 implementation state: [`recycle-breadcrumb-actual-595.png`](./design-qa-screenshots/recycle-breadcrumb-actual-595.png).
- Original user-marked header action cluster: [`header-actions-before.png`](./design-qa-screenshots/header-actions-before.png), 2904 × 380 px.
- Approved design target: the company brand returns to the prototype home; “返回官网” is a standalone external destination; breadcrumbs describe only prototype hierarchy and sit at the top-left of page content rather than in the upper-right header.

### Implementation evidence

- Recycle content breadcrumb at the actual 595 × 908 browser viewport: [`recycle-content-breadcrumb-actual-595.png`](./design-qa-screenshots/recycle-content-breadcrumb-actual-595.png).
- Prototype home without a breadcrumb at the same viewport: [`root-no-breadcrumb-actual-595.png`](./design-qa-screenshots/root-no-breadcrumb-actual-595.png).
- Deep Kith breadcrumb at the same viewport: [`kith-content-breadcrumb-actual-595.png`](./design-qa-screenshots/kith-content-breadcrumb-actual-595.png).
- All 10 routes were additionally measured in live 320 × 740 frames from the same built Pages artifact.

The previous-state screenshot, the user-marked source and all three revised implementation screenshots were reviewed together in one comparison pass. The same 595 px implementation viewport isolates the navigation relocation without introducing scale or density mismatch.

### Findings, fixes and post-fix comparison

1. **P2 — the official website was incorrectly represented as a prototype ancestor:** the first breadcrumb began with “正式网站”, even though the public prototype site is a separate navigation space. The official destination is now the single low-emphasis `返回官网 ↗` link at the right of the global header and opens in a new tab. No breadcrumb contains an official-site URL or label.
2. **P2 — the upper-right breadcrumb read as an action menu:** moving the route trail below the prototype status strip and aligning it with the page content makes its hierarchy and reading order conventional. The status strip remains a dedicated data-boundary notice and is not mixed with navigation.
3. **P2 — the company logo destination was ambiguous:** every brand lockup now has the accessible label “返回原型首页” and resolves to the Pages artifact root at its own directory depth. A browser click from the recycle route reached `/`; clicking “街坊味” from the deepest customer route reached `/街坊味/`.
4. **Prototype-home behavior:** the root route does not render a redundant self-breadcrumb. It retains the standalone official link and keeps the existing graph as the primary internal navigation.
5. **Responsive pass:** at 320 px every header child remained within the 320 px viewport, every current breadcrumb item remained visible, and all 10 routes reported `scrollWidth === clientWidth`. The deepest route rendered `原型首页 / 街坊味 / 实施对照 / 顾客端` without clipping.
6. **Required fidelity surfaces:** typography, spacing rhythm, civic-red/navy/silver tokens, logo quality, product imagery, copy, status language and product interactions remain unchanged. The only layout changes are the breadcrumb's content alignment and the independent official-site link. A fresh browser tab reported no console warnings or errors.
7. **Post-fix result:** the earlier P2 hierarchy, placement and destination ambiguities are resolved; no actionable P0, P1 or P2 issue remains.

final result: passed
