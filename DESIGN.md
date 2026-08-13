# Workspace Dashboard Design

## Scope and visual thesis

This document describes the implemented company and creator workspaces. The source of truth is `PRODUCT.md`, `WorkspaceShell.tsx`, `WorkspaceShell.module.css`, the shared `Dashboard.module.css`, and both dashboard pages.

The workspace extends Viral Ground's paper–ink–electric-violet identity into an operational surface. It should feel like an editorial campaign desk: oversized English display type, warm paper, dense white work panels, black operational notices, and violet used for identity and action. It is intentionally not a generic analytics dashboard. The first screen prioritizes current state and the next useful action over decorative charts.

## Tokens and typography

| Purpose | Implemented value | Usage |
| --- | --- | --- |
| Workspace paper | `#f4f1ed` | Shell background |
| Ink | `#09090b` / `#111014` | Shell and dashboard foreground |
| Electric violet | `#7331e0` | Active navigation, icons, links, bars, buttons |
| Violet hover/soft | `#f0e8ff`, `#eee5ff`, `#f2ebff` | Hover, selected, empty and beta surfaces |
| Panel | `#fff` | Metrics, lists, and action panels |
| Warm borders | `#ddd9d4`, `#e6e2dd` | Panel structure and row division |
| Black chrome | `#050506`–`#0a090b` | Top bar, brand block, operational strip, CTA |
| Status green/orange/neutral | `#087556`, `#a24a0b`, `#615c63` on pale fills | Complete/open, waiting/action-needed, inactive states |

The global interface stack is `Pretendard Variable`, Pretendard, system sans. Archivo Black (`--font-archivo`) is reserved for high-impact English display copy: dashboard titles, stamps, and CTA slogans. Korean headings and all operational copy remain in Pretendard. Do not apply Archivo to Korean text.

The authenticated workspace currently uses local, fixed light-theme values rather than the global dark-mode token set. Treat dark workspace support as a deliberate future feature, not an implicit inheritance.

## Shell anatomy

- A sticky `3.35rem` black top bar holds role context, a centered mark, the managed-beta label, and the signed-in identity.
- A fixed `13.25rem` left sidebar begins below the top bar. It contains the brand block, role-specific primary navigation, a managed-beta/payment notice, and logout.
- The content canvas offsets by the sidebar width, uses fluid `clamp(1.5rem, 3vw, 3rem)` padding, and gives each dashboard a centered maximum width of `82rem`.
- `WorkspaceShell` owns navigation state, active-route rules, user identity, logout, mobile drawer behavior, and localization. Dashboard pages should not duplicate this chrome.
- Navigation is role-specific but visually identical. Company routes focus on campaigns and company profile; creator routes focus on discovery, applications/content, performance, and creator profile.

## Dashboard anatomy and role information architecture

Both roles share one composition: editorial header and stamp → five factual metrics → primary work list plus pipeline → secondary work/next-action panels → black CTA band. Shared CSS keeps density, hierarchy, statuses, empty states, and responsive behavior consistent; page code supplies role semantics.

| Layer | Company | Creator |
| --- | --- | --- |
| Primary question | What is the campaign operation state? | What requires my attention now? |
| Metrics | Campaigns, recruiting, applications, closed records, payment off | Active work, pending applications, revisions, completed work, settled record amount |
| Main work list | Recent campaigns | Approved/submitted/revision-requested applications |
| Pipeline | Draft → recruiting → closed | Pending → active → complete |
| Secondary work | Campaign creation/review and brand readiness | New campaigns and profile/performance actions |
| Primary CTA | Create a campaign brief | Find a campaign |

Status chips communicate workflow, not decoration. Violet means selected/ready/open, green means complete, orange means waiting or attention required, and neutral means inactive, withdrawn, rejected, closed, or already applied. Keep labels explicit; color alone must never carry the state.

## Responsive rules

- Above `1100px`, metrics use five columns and the main dashboard uses asymmetric two-column grids.
- At `1100px` and below, metrics become three columns and both content grids stack to one column.
- At `900px` and below, the fixed sidebar becomes a portal-rendered modal drawer with backdrop; content loses its left offset. The top bar shows the menu button and hides role context, beta copy, and profile text while retaining the mark and avatar.
- At `640px` and below, metrics become two columns, the decorative stamp is hidden, list reward/application-count columns collapse, and the CTA stacks vertically.

Preserve readable ordering in the DOM when changing grids. New content must work in the existing single-column mobile flow without relying on hover or horizontal scrolling.

## Motion and accessibility

The motion language is brief and directional: dashboard content reveals upward, pipeline bars grow from the left, navigation shifts by `2px`, actions lift by `1px`, and the mobile drawer uses a `260ms` expo-like slide. The loading state is a warm-paper sweep. `prefers-reduced-motion` disables the major reveals, bar/loading animation, drawer transition, and navigation transition; add equivalent reduced-motion handling for any new transform or animation.

Keep the implemented accessibility contract:

- active links expose `aria-current="page"`;
- navigation, metrics, loading states, and menu controls have localized accessible labels;
- decorative Lucide icons and logo marks are hidden from assistive technology;
- the mobile drawer uses dialog semantics, focus management, Escape handling, a close backdrop, and `aria-expanded`;
- interactive elements retain a visible violet focus outline and keyboard-reachable targets;
- loading, error/retry, empty, and success states remain distinguishable without animation or color alone.

## Truthful-data constraints

Every metric must come from an existing API response or an explicitly derived count from those responses. Never invent trend percentages, revenue, reach, marketplace size, sample activity, or chart history to fill space. Zero and empty states are valid product states and must explain the next action.

- Company data comes from `/company/dashboard` and `/company/campaigns`; application totals and pipeline counts are derived from returned campaigns. The current “Recruiting” metric is bound to `summary.funded`; verify that backend meaning before changing either copy or mapping.
- Payment and settlement remain visibly `OFF`. The UI must not show placeholder accounts or imply a live transfer path before an operating contract and production payment gateway exist.
- Creator data comes from `/me/stats`, `/me/applications`, `/campaigns?sort=recent`, and `/me/performance`. Settled amounts and performance are labeled as recorded/completed history, not projected earnings or automated live settlement.
- Preserve request cancellation, loading, retryable error, and honest empty states whenever data sources change.
- Sample media or legacy financial records require explicit provenance labels and must respect role authorization boundaries.

## Reuse and maintenance

- Reuse `WorkspaceShell` for company/creator chrome and extend its `NAV` map for role navigation. Preserve the special company campaign matching rule so “Campaigns” and “Create campaign” do not appear active together.
- Reuse `Dashboard.module.css` for dashboard primitives: header, metrics, panels, lists, status chips, pipeline, empty state, actions, operational strip, CTA, loading, and error. Add a shared variant before creating role-local copies.
- Keep role pages responsible for API orchestration, truthful derivations, localized copy, links, and status mappings. Keep layout and presentation in the shared module.
- All user-facing workspace strings require Korean and English through `t(ko, en)`. Format counts and currency from real values; do not bake formatted sample numbers into markup.
- Prefer Lucide icons already used by the shell and dashboards. Icons should clarify labels, not replace them.
- When adding a metric or panel, test the five-column, three-column, two-column, and stacked states; long Korean/English labels; large values; empty arrays; request failure; keyboard navigation; and reduced motion.
- If palette values are refactored, promote the workspace colors to semantic CSS custom properties instead of proliferating new literals. Preserve the warmer authenticated paper (`#f4f1ed`) or consciously reconcile it with the public `--paper` token (`#f6f5f1`).
