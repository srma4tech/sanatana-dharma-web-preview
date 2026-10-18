# Web Repository Branching

**Current default branch:** `master`. Use it consistently until a default-branch change is made and verified in GitHub settings.

## Naming

- `chore/<scope>` — repository, documentation, tooling, and CI foundations.
- `feat/<scope>` — user-visible features.
- `fix/<scope>` — focused defect fixes.
- `test/<scope>` — test infrastructure or coverage work.
- `release/<version>` — release candidate stabilization when needed.

Use lowercase kebab-case and one coherent change per branch.

## Review policy

- Work on topic branches, not directly on `master`.
- Open pull requests with scope, evidence, tests run, limitations, and any unresolved decisions.
- Do not merge or deploy without checks passing and the appropriate approval.
- Content-model changes must be coordinated with the content repository's release contract.
- Do not embed draft content or source claims directly in components when the canonical content repository should own them.

## Current state

The `chore/web-architecture` branch contains architecture documentation only. There is no framework setup, CI workflow, or application code yet.
