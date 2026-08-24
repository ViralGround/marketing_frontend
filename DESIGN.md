# Brand and Creator Workspace Design

## Release-environment boundary

Production-mode frontend builds fail closed at build time. The sanitized candidate is allowed
only with the exact `https://staging.viralground.kr` and
`https://api.staging.viralground.kr` pair, disabled payment/Instagram/upload flags, and no
browser storage origin. Unknown, local production-mode, and preview builds are rejected.

The currently running legacy origins (`viralground.kr`, `www.viralground.kr`,
`api.viralground.kr`, and `storage.viralground.kr`) are an unconditional denylist for this
release candidate. A future new-production build needs all of the following in a protected
production-only environment: exact `APP_ENV=production`, the confirmation phrase defined by
`NEW_PRODUCTION_DEPLOY_CONFIRMATION`, and separately approved exact site/API/storage origins.
Vercel Preview and Development builds remain rejected even if approval values are copied by
mistake. Reusing a legacy origin after cutover requires a separate reviewed code change; no
environment variable can bypass the current denylist.

## Scope and thesis

This document is the source of truth for the authenticated brand and creator workspaces. The workspace is a compact editorial campaign desk: warm paper, near-black ink, electric violet, ruled hierarchy, dense factual rows, and one clearly owned scroll region at a time. It is not a generic card dashboard and it never fills empty space with invented analytics.

Public landing pages and the standalone `/profile/setup` onboarding route keep their own composition. `/creator/profile` uses the authenticated workspace shell while sharing the same creator profile form and API payload with onboarding.

## Public sub-landing canon

The root `/` is excluded and remains unchanged. `/creators`, `/campaigns`, `/business`, and the aligned `/creator` now share one **live production call sheet** canon: a visitor understands the offer, inspects real workflow or workspace evidence, verifies terms and data scope, then acts. The system refuses generic SaaS card grids. Detailed rules live in `docs/design-system.md` §10.7 and must remain consistent with this section.

### Live call sheet — `/creators`, `/campaigns`, `/business`, `/creator`

- **World and form:** warm paper `#f6f5f1`, ink `#0a090b`, and electric violet `#7331e0`; ruled documents, film contact strips, and hard paper/violet/ink scene seams. Archivo Black owns short English display; Pretendard owns Korean and interface copy. The shipped form is candidate 5/7, seed `69640d99`: approved B live-call-sheet structure with C film-contact-cut typography and scroll rhythm.
- **Single source:** `/creators` and `/campaigns` use `src/components/landing/callsheet/{CallSheetFrame,CallSheet.module.css,ProductProof,CreatorsIndexCallSheetPage,CampaignsCallSheetPage}`; `/creator` uses `src/components/landing/apply/CreatorApplyPage`; `/business` uses the approved operations-console surface at `src/components/landing/console/BusinessConsolePage`. The retired `landing/viral` implementation is not part of the public routes and must not be reintroduced.
- **First viewport and desktop lanes:** call-sheet pages place page-specific giant type left, a persistent vertical take strip center, and a tilted factual sheet right. `/business` is the intentional exception: its dark operations rail, WATCH IT RUN offer, and SAMPLE signal-chain monitor establish the same evidence-first story without the call-sheet film. Content never slides beneath fixed chrome in either system.
- **Mobile composition:** the centered logo top bar remains visible, the hero film reduces to two frames, and one safe-area-aware fixed primary dock matches the route's first task. Duplicated hero actions disappear. The page must not overflow horizontally.
- **Route stories:** `/creators` is offer → opt-in public roster API/search → brand workspace proof → record-reading criteria → brand CTA. `/campaigns` is offer → curated public feed API/search/details → the two-desk handover demo (apply → select → submit → review → record → settle `OFF`) → what each handover records and what is not available yet → CTA. `/business` is offer → brand workspace proof → four operating decisions → evidence/boundary → consultation. `/creator` is creator offer → creator workspace proof → example content craft → terms/boundaries → application.
- **Product truth:** response counts and search scope describe only currently returned public records, never marketplace totals. Remote regions expose loading, empty, error, and retry states. Campaign/company details and business consultation remain real and accessible, with existing routes, APIs, analytics, validation, consent/version fields, and request payloads unchanged.
- **Proof boundary:** dashboard evidence is visibly `SAMPLE` on desktop and mobile. KPI values are em dashes and payment/settlement is `OFF`; no sample preview implies authenticated live data. Film and contact-sheet media say `CONTENT EXAMPLE`, never performance data. Do not invent activity, trends, reach, revenue, reviews, or marketplace size.
- **Motion and access:** reveal, hero, film, and document motion are allowed; `prefers-reduced-motion` disables them. Touch targets are at least `44px`, mobile inputs at least `16px`, and focus-visible remains explicit. Menus and modals trap focus, close with Escape, and return focus to their trigger.
- **Reference boundary and QA:** reconstruct references in semantic React/CSS; never slice reference images into the UI. Verify `1440×900`, `1280×720`, `1024×768`, `390×844`, `360×800`, `320×568`, and `844×390` for readable hierarchy, contained film, fixed dock clearance, and no horizontal overflow.

### Existing public detail tier — `/creators/[id]`

`/creators/[id]` has not migrated to the call-sheet frame. Preserve its existing `PublicGround` detail composition: profile → recorded metrics → completed work → brand reviews → collaborate, with real portfolio/review API data, independent failure handling, numbered navigation, and its docked campaign inquiry. Do not infer public profile data from private applicant records.

## Reference-derived component language

All references are pattern sources, never cropped UI assets.

- **Call-sheet tier:** approved B live-call-sheet structure and C film-contact-cut rhythm were reconstructed through the candidate 5/7 exploration (seed `69640d99`) and shipped through `src/components/landing/callsheet/`. Reference imagery supplies composition and rhythm only; the interface itself is semantic React/CSS.
- **Existing creator detail tier:** the four HTML files under `../시안` remain pattern sources for `/creators/[id]` and authenticated workspace vocabulary. Reference 1 supplies hairline KPI strips, numbered steps, and process rows; Reference 2 the compact module density; Reference 3 numbered navigation and full-screen transitions; Reference 4 the paper/ink/violet tokens, centered mark, selected rows, and docked controls.
- `hero-smoke`, `ground-mist`, and `smoke-wisp` are optimized WebP decorations under `public/workspace-art`. They remain workspace-only, low-opacity, non-semantic decoration for search, account, and empty states; call-sheet pages do not use them.
- Marketing video and sample lifestyle/poster media do not appear in authenticated workspaces because they can be mistaken for operational data and cost unnecessary bandwidth.

## Tokens and typography

| Purpose | Value | Usage |
| --- | --- | --- |
| Paper | `#f6f5f1` | Shell and work canvas |
| Ink | `#0a090b` | Top bar, rail, primary type |
| Violet | `#7331e0` | Active state, focus, primary actions |
| Violet soft | `#eee7fb` / `#d9ccff` | Selected and instructional surfaces |
| Panel | `#fffefa` | Work panels and ruled lists |
| Rule | ink at `15%` / `28%` | Row, panel, and hierarchy separation |

Pretendard Variable is the interface typeface. Archivo Black is restricted to short English display marks. Korean headings, body copy, controls, tables, and metrics stay in Pretendard. Workspace values are scoped locally and intentionally stay light even if the public site uses its dark theme.

## Fixed viewport and scroll ownership

- `WorkspaceShell` is exactly `100dvh` and clips document overflow.
- The black top bar is `3.75rem` on desktop and `3.5rem` below `1024px`.
- Desktop content never owns body scroll. A route supplies a `WorkspaceStage` with fixed header/footer slots and a `minmax(0, 1fr)` work body.
- Long tables use `WorkspaceRecordList`; its header is fixed and only `recordBody` scrolls.
- Long detail, form, or settings content uses one named `WorkspaceScrollArea` or active `WorkspaceTabPanel`.
- On mobile, only the active content region scrolls. Bottom navigation and docked actions remain outside it.
- Use `min-height: 0`, `overscroll-behavior: contain`, and stable scrollbar gutters whenever a grid/flex child owns scrolling.

## Shell anatomy

- At `1024px` and above, the left rail is `224px` expanded and `68px` collapsed. The state persists under `vg-workspace-sidebar-collapsed`.
- Below `1024px`, the rail is removed and role-specific bottom navigation appears with safe-area padding. Brand uses four destinations; creator uses five.
- The top bar keeps the centered Viral Ground mark. Desktop search stays inline; mobile search opens a full-screen numbered panel.
- Language, managed-beta truth, profile/account navigation, and logout live in an accessible account sheet.
- Search and account surfaces use dialog semantics, initial focus, focus trapping, Escape close, backdrop close, and focus return.
- All coarse-pointer controls are at least `44px`; mobile inputs, textareas, and selects render at `16px` or larger.

## Shared primitives

Use `WorkspacePrimitives` before making route-local scaffolding:

- `WorkspaceStage`: fixed header, one work body, optional docked footer.
- `WorkspaceScrollArea`: the explicit owner of long content scrolling.
- `WorkspaceTabs` and `WorkspaceTabPanel`: ARIA tabs with Arrow Left/Right, Home, and End navigation.
- `MetricStrip`: open hairline metrics; it horizontally snaps on mobile.
- `ResponsiveSheet`: right drawer on desktop and bottom sheet on mobile, with fixed title/actions and scrolling body.
- `SectionProgress`: numbered steps. Mobile keeps a single horizontal snap row.
- `WorkspaceRecordList`: fixed header plus internally scrolling ruled rows; mobile preserves a compact primary-information row instead of stacking cards.

## Role information architecture

### Brand

- Dashboard: `운영 / 지원·파이프라인 / 일정`. The default view prioritizes next actions and the payment warning.
- Campaign list: fixed search/count toolbar, fixed header, internal rows.
- Campaign detail: campaign information and applicant queue form a master–detail surface. Applicant message, submission history, and review actions open in a drawer.
- New campaign: four preserved-value steps—basics, deliverables, tone, reward/recruiting—with fixed summary and docked previous/next/create controls.
- Edit campaign: three steps—basics, content, recruiting. Client or server errors move to the relevant step and focus the first affected field.
- Brand settings: `공개 정보 / 마케팅 동의 / 계정`.

### Creator

- Dashboard: `할 일 / 성과 / 탐색 / 정산`. Default content puts revision and active work first.
- Discover, applications, and performance use ruled record rows and internal scrolling.
- My Work: `지원·콘텐츠 / Instagram / 계정`. Video upload and review use `ResponsiveSheet`.
- Campaign detail: `개요 / 요구사항` with a docked apply/status action. The optional application message opens in a sheet.
- `/creator/profile` and `/profile/setup` share `CreatorProfileForm`; the protected workspace route and public-onboarding chrome remain distinct.
- Compatibility redirects for `/creator/applications` and `/creator/campaigns` remain in place.

## Loading, failure, and empty states

- Independent dashboard requests fail independently. A failed KPI/application/performance/campaign region gets its own retry while successful tabs remain usable.
- Loading, empty, error, disabled, selected, hover, and keyboard-focus states must remain explicit in Korean and English.
- Empty states explain the real next action and may use only the low-opacity decorative mist asset.
- Do not render illustrative counts, trends, reach, revenue, financial accounts, sample campaigns, or sample media.

## Payment and truthful-data constraints

- Backend REST paths, statuses, campaign payloads, and policy guards are authoritative and unchanged by layout work.
- Payment and settlement remain visibly `OFF`. Never show an account number, transfer-complete action, payment guarantee, automatic launch promise, or implied PG completion.
- Legacy deposit/funded/refund statuses are historical records only and must keep their qualifying copy.
- Company metrics derive only from `/company/dashboard` and `/company/campaigns`.
- Creator metrics derive only from `/me/stats`, `/me/applications`, `/campaigns?sort=recent`, and `/me/performance`.
- Public creator links are never inferred from private applicant data.

## Responsive and accessibility checks

Verify `1440×900`, `1280×720`, `1024×768`, `390×844`, `360×800`, `320×568`, and mobile landscape. At every size confirm:

- no body scroll or horizontal overflow;
- one clearly named scrolling work region;
- safe-area bottom navigation and docked actions;
- keyboard tab switching, focus trap, Escape, and focus return;
- readable layout at 200% zoom;
- real long Korean/English labels and large values do not overlap;
- reduced motion removes panel reveal, sheet motion, bar growth, and loading sweeps.
