# Engineering Prototype Instructions

Run and verify the local prototype in the browser before handoff. The default entry is the runnable mini-program, not the page map or engineering documentation.

## Product direction

- Treat this as an executable engineering reference for the team: previous/next week, the four bottom navigation entries, generation, dish replacement, manual library selection, confirmation, saving, history detail, and copy-to-next-week must remain operable.
- Reuse the customer prototype's phone UI, warm off-white surface, brick-red primary action, deep-green success state, typography, spacing, and existing device assets.
- Keep `page-map.html` as the only secondary view linked from the runnable prototype. Preserve `engineering-model.html` as an unpublished draft, but do not link or deploy it until the user explicitly restores implementation documentation.
- Organize `page-map.html` as four independent functional swimlanes matching the first-level navigation: schedule, dish library, history, and profile/rules. Cross-feature behavior is a labeled handoff, not duplicated workflow logic.
- The schedule lane owns all WeekPlan editing; the library returns a selected dish, history returns a copied draft, and profile/rules supplies generation preferences. Keep library maintenance and editable household rules visibly marked as product gaps until implemented.
- Use deterministic local mock state. Do not add login, cloud sync, a real backend, a real recommendation engine, or a production settings system unless the user explicitly expands the scope.
- Interactions across pages must share one `WeekPlan`; a changed and saved dish must appear in history and remain changed when the week is copied.

## Build and verification

- Keep the Vite multi-page inputs limited to `index.html` and `page-map.html` so only the runnable prototype and page map deploy under the same GitHub Pages path.
- Run `npm test`, `npm run build`, and the repository-level `scripts/build-pages-site.sh` after changes to state behavior or deployment structure.
