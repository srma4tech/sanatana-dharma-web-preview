# Web Application Architecture

**Status:** The static-first Astro/TypeScript foundation and fail-closed content release bridge are implemented on `master`. The first responsive UI/status-dashboard iteration is being developed on a feature branch for review. Full visual design, browser QA, and deployment are not yet approved or complete.

## Goals

- Build a free, responsive Hindi-English Sanātana Dharma knowledge and devotion website.
- Make content readable without sign-in.
- Prioritize discoverability, accessibility, fast page loads, and a useful mobile experience.
- Consume only a pinned, validated, explicitly approved release from the canonical content repository.
- Make project status visible so visitors can distinguish completed platform capabilities, work in progress, planned sections, and content that is not yet published.

## Current implementation

- Astro with TypeScript and static-first pages.
- English and Hindi library routes.
- Localized article routes generated only from the validated manifest dataset.
- Release-candidate workflow pins the content repository to an exact commit SHA, validates it before building, and uploads a review artifact without deploying.
- The foundation build fails closed: no content release means no religious article routes are rendered.
- The homepage and library UI are being updated to show project progress and learning-area status without implying that planned content is already published.
- Full UI/UX review, browser-based mobile/desktop checks, and production deployment remain pending.

## Content and trust boundaries

- Canonical content lives in `srma4tech/sanatana-dharma-content`.
- The web repository consumes an immutable, validated content commit at build time; it must never consume a moving branch or arbitrary draft.
- The manifest allow-list, record paths, IDs/types/statuses, SHA-256 hashes, locale approvals, publisher approval, and source references are checked before the production build.
- Inventory topics and work-in-progress sections are navigation/status metadata, not publishable religious claims.
- Schema validation is necessary but not sufficient; religious, historical, theological, and interpretive claims require evidence and human review.
- Hindi and English are first-class locales with independent review; both must pass before release.
- No draft, unverified, restricted, or unapproved content is rendered.

## Architecture decisions

See [ADR 0001 — Static-first web stack](decisions/0001-static-first-web-stack.md).

## Release workflow

See [Content release integration runbook](CONTENT-RELEASE-INTEGRATION.md).

## Validation

The web repository provides:
- `npm run check` for Astro/TypeScript checks.
- `npm test` for content release and built-site contract tests.
- `npm run build` for the fail-closed foundation build.
- `npm run build:production` for a build requiring a supplied validated release directory.

Do not claim a check passed unless it was executed and its result was observed. Do not merge, publish, or deploy from a feature branch without explicit product-owner approval.
