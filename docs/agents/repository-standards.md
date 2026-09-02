# Repository Standards

These rules apply to the active repository unless a directory is explicitly
marked as a historical snapshot. The originating issue or PR describes the
scope of one change; this file records conventions that should remain true
across changes.

## Sources of truth

- `CONTEXT-MAP.md` defines product contexts, canonical names, and boundaries.
- Each context's `CONTEXT.md` is its glossary. It defines domain language only;
  it is not a PRD, implementation plan, or scratch pad.
- `PRODUCT-EVOLUTION.md` defines the current product-evolution blueprint and
  the evidence gates between its levels.
- Product decisions, PRDs, and User Stories define behavior within one product
  context. They do not automatically apply to another context.
- The issue or PR description is the spec for a particular repository change.
- `pages-prototypes.txt` is the allowlist and route map for public prototypes.

When these sources disagree, do not silently choose one. Surface the conflict
and resolve it in the appropriate source.

## Product directories and names

Active top-level product directories use an English kebab-case slug with a
numeric ordering prefix. The canonical set is:

| Number | Chinese name | English name | Directory |
|---|---|---|---|
| 1 | 近邻闲置 | Neighborhood Exchange | `1-neighborhood-exchange/` |
| 3 | 近邻互助组 | Neighborhood Mutual Aid Team | `3-neighborhood-mutual-aid-team/` |
| 9 | 牛马互助平台 | Niuma Mutual Aid Platform | `9-niuma-mutual-aid-platform/` |
| 3.1 | 街坊味 | Kith Inn | `3.1-kith-inn/` |
| 3.2 | 楼道收一收 | Hallway Harmony | `3.2-hallway-harmony/` |
| 3.3 | 排好菜 | Meal Mind | `3.3-meal-mind/` |
| 4.1 | 赛博数学 | Cyber Math | `4.1-cyber-math/` |

The following naming rules are normative:

- `1`, `3`, and `9` are non-contiguous levels in a product-evolution
  blueprint, not release numbers. Do not close their intentional gaps.
- `3.1`, `3.2`, and `3.3` identify explorations related to level 3. They remain
  separate top-level product contexts rather than subdirectories of level 3.
- Assigning a new number requires a real product-boundary decision. An unused
  number is not, by itself, a reason to fill the gap.
- **Mutual Aid Team** is the fixed English expression for the product term
  “互助组”; do not replace it with “Mutual Aid Group”.
- **Niuma** is a brand transliteration; do not translate it as “Cattle”.
- `4.1-cyber-math/` is independent of the `1 → 3 → 9` evolution chain.

## Scope and historical material

- `1-neighborhood-exchange/` is the current product exploration.
- `3-neighborhood-mutual-aid-team/` is the previous product baseline and is
  retained without implying that its full scope is currently being built.
- `9-niuma-mutual-aid-platform/` is the long-term vision; platform-level
  implementation remains deferred until its evidence gates are met.
- Reusing research or an interaction pattern across contexts does not transfer
  feature scope, roles, permissions, promises, or data rights. Record a new
  decision in the receiving context first.
- Unique exploration records are historical evidence. Place cross-product
  records under `exploration-records/` and context-specific superseded material
  under that context's `history/` directory.
- A historical package must identify its date or period, source when known,
  and historical status. Language such as “current” inside a snapshot refers
  to its original date, not the repository's present direction.
- Historical prototypes demonstrate what was explored; they are not current
  requirements and must not become public entry points accidentally.
- Delete material only when the change explicitly calls for deletion, or when
  it is a reproducible generated artifact or an exact duplicate whose source is
  retained. Do not rewrite old records to make them appear consistent with a
  later decision.

## Documentation responsibilities

- A product `README.md` states the product's role and current status, then
  points to its authoritative context, decisions, requirements, and prototypes.
- `CONTEXT.md` contains only canonical domain terms and distinctions.
- PRDs and User Stories describe intended behavior. Mark proposals, hypotheses,
  targets, completed work, and abandoned ideas distinctly.
- Use an ADR under `docs/adr/` for a hard-to-reverse, non-obvious decision made
  between meaningful alternatives. Link it from affected guidance when useful.
- Use relative links for repository files, and keep all links valid after moves.
- Contact with a street office, community, property manager, owners' committee,
  or resident is not official approval or endorsement. Preserve the actual
  status of each interaction and do not present proposed metrics as results.

## GitHub Pages and public routes

- Numeric prefixes organize source directories and never enter public URLs.
- Public route segments must be lowercase English kebab-case ASCII. Do not add
  numbered or Chinese route aliases as new canonical URLs.
- Every published product prototype must have one explicit
  `source-directory public-route` entry in `pages-prototypes.txt`.
- Do not infer publication from the presence of an `index.html`. Only allowlisted
  sources belong in the generated Pages site.
- Historical records, research, outreach logs, and internal working documents
  are not published unless a change explicitly adds a reviewed public artifact.
- Public material must not expose private contact details or turn unverified
  statements into official facts.

The separation between repository prefixes and public routes is recorded in
[`docs/adr/0001-separate-product-ordering-from-public-routes.md`](../adr/0001-separate-product-ordering-from-public-routes.md).

## Automation layout

- `.github/workflows/` contains GitHub Actions workflow YAML only.
- Repository-specific helper programs called by workflows live in
  `.github/scripts/` and are invoked explicitly from the workflow.
- General-purpose development scripts belong in a top-level `scripts/`
  directory only when they are not specific to GitHub automation.
- Do not edit generated `gh-pages` contents by hand. `main` and the Pages build
  process are authoritative.

## Change and verification discipline

- Keep repository restructuring separate from new product behavior or prototype
  implementation unless the issue explicitly combines them.
- Preserve file history during moves where practical, and update inbound links,
  build paths, package paths, and publication mappings in the same change.
- Do not use a cleanup as an opportunity to alter the meaning of historical
  evidence or to expand an active product's scope.
- Before merging a structural or publishing change, verify at minimum:
  - repository-relative Markdown links resolve;
  - the Pages build completes from its documented entry point;
  - generated public top-level routes contain neither numeric prefixes nor
    Chinese path segments;
  - tests for every affected runnable prototype pass.
