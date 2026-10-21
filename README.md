# Sanātana Dharma — Owner Review Preview

This repository hosts the bilingual Hindi-English **owner review preview** of the Sanātana Dharma knowledge and devotion website. It is not the production content release.

## What is available

- Knowledge-first homepage with the Shiva collection featured
- English and Hindi library routes
- Eight bilingual Shiva review articles: Shiva overview; Rudra and Shiva terminology; Shiva iconography and symbols; Shiva–Shakti relationship; selected Shiva forms; Shaiva traditions; a scripture guide; and a beginner learning path
- Article contents navigation, related reading, visible source references and source-status notes
- Responsive layouts and user-controlled light/dark themes

## Review-content safeguards

- The selected review drafts are copied into `src/data/review-preview-content.json` only to make the owner review experience navigable. They remain marked `review-draft` and `not-approved`.
- The review dataset is separate from `src/data/published-content.json` and is never accepted by the validated release pipeline.
- Each article clearly identifies itself as a review draft. Source references show pending, partial, or source-specific status; a link is not represented as blanket claim verification.
- Canonical content, schemas, source records, and publication governance remain in the private `srma4tech/sanatana-dharma-content` repository.
- This public preview is for product-owner review only. Its presence does not constitute final editorial approval or a production publication decision.

## Preview

https://srma4tech.github.io/sanatana-dharma-web-preview/

## Local development

```sh
npm install
npm run dev
npm run check
npm run build
npm test
```

The build pipeline continues to fail closed for approved release content. The review-only dataset is intentionally isolated from that pipeline.
