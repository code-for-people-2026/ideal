# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Product direction

- The primary customer is the household menu planner, not a community caterer.
- Reuse Kith Inn's customer-prototype presentation pattern and menu-generation interaction: story on the left, interactive phone on the right, shareable steps, five weekdays with lunch and dinner, three-day comparison, single-dish replacement, and a confirmed overview.
- Differentiate Paihaocai mainly through persona, value copy, standalone-miniapp boundaries, and the absence of catering orders, delivery, payment, and reconciliation.
- Do not add assumption-heavy household constraint flows unless the user explicitly asks for them; keep customer and engineering prototypes aligned on `5 days × 2 meals` and the current `2 meat + 2 vegetable + 1 soup` meal structure.
