# ADR 0001: Static-First Frontend

- **Status:** Proposed pending a minimal implementation spike.
- **Date:** 2026-10-18

## Context

The platform is content-heavy, must be discoverable through search, and should remain fast and usable on mobile. Most pages are reading experiences; only a subset need rich interaction.

## Decision proposal

Evaluate Astro with TypeScript as the primary framework. Prefer build-time/static rendering for content pages and limited interactive islands for features that require client-side state. Keep PWA installation/offline behavior as a later phase after the core site is reliable.

## Required integration boundary

The website must build from an immutable, approved content release, not a moving branch or unreviewed content. The build should verify the release manifest and content hashes, then render only approved records in both supported locales.

## Acceptance checks for the spike

- Production build emits HTML for sample Hindi and English routes.
- Localized metadata and canonical URL strategy are explicit.
- Keyboard navigation, focus visibility, semantic landmarks, and contrast are reviewed.
- Build fails when the content release pin or manifest is invalid.
- The output can be deployed to the intended hosting target without breaking nested routes or localized URLs.

## Consequences and open items

- Static-first output supports SEO and reduces runtime complexity.
- Framework choice is not final until the spike passes.
- Hosting target, public domain, visual design tokens, and exact CSS approach remain open.
- No third-party analytics or mandatory authentication is assumed.
