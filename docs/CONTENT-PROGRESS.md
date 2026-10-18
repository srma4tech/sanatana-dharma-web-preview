# Content Delivery Progress & Sprint Tracker

**Tracker role:** Website-side view of content readiness and integration dependencies. The content repository remains authoritative for topic, research, editorial, and publication status.  
**Snapshot date:** 2026-10-18  
**Web repository:** `srma4tech/sanatana-dharma-web-by-srma4tech`  
**Canonical content repository:** `srma4tech/sanatana-dharma-content`  
**Current phase:** Responsive UI/status dashboard in progress; content-release bridge implemented; waiting for a reviewed, approved content release.  
**UI design:** Work is limited to the website repository. Content research and article authoring remain in the canonical content repository.  
**Publication:** No real religious content release or production deployment exists.

## 1. Current verified state

### Completed platform work

- [x] Astro/TypeScript website foundation is merged into `master`.
- [x] Static content-release preparer and fail-closed foundation build are implemented.
- [x] Manual content-release-candidate workflow accepts an exact content commit SHA.
- [x] Production build validates the content release before building localized pages.
- [x] Hindi and English library routes and localized article routes are generated from the validated manifest dataset.
- [x] The release-candidate workflow uploads a review artifact only; it does not deploy.
- [x] Initial responsive layout, skip navigation, locale metadata, source rendering, and empty-state behavior exist in the current codebase.

### In progress

- [x] Homepage status dashboard implemented in PR #6; awaiting checks and review.
- [x] Responsive learning-area cards and bilingual library guidance implemented in PR #6; awaiting checks and review.
- [x] First-pass English and Hindi status copy/navigation implemented in PR #6; final review pending.
- [ ] Browser-based mobile, tablet, desktop, keyboard, and accessibility review.

### Pending / blocked

- [ ] Real bilingual article records with verified source records and independent editorial review — none approved yet.
- [ ] Content manifest and product-owner-approved immutable content release — none exists yet.
- [ ] Verify/configure the narrowly scoped `CONTENT_REPO_READ_TOKEN` secret before private-content checkout.
- [ ] Run the release-candidate workflow against an approved exact content SHA.
- [ ] Review the generated static artifact.
- [ ] Production hosting configuration, deployment, and rollback plan — not completed.
- [ ] Independent browser QA and final product-owner approval.

## 2. Content source of truth

The canonical progress and research backlog live in the content repository:

- Repository: [sanatana-dharma-content](https://github.com/srma4tech/sanatana-dharma-content)
- Progress tracker: [docs/CONTENT-PROGRESS.md](https://github.com/srma4tech/sanatana-dharma-content/blob/master/docs/CONTENT-PROGRESS.md)
- Master inventory: [content/inventory/master-inventory.json](https://github.com/srma4tech/sanatana-dharma-content/blob/master/content/inventory/master-inventory.json)

At the 2026-10-18 snapshot, the inventory has **32 provisional topics** across five collections. All 32 are planned, Hindi and English are not started for every topic, and all are marked not publishable. There are no authored entity/source records and no release manifest.

**Do not treat inventory entries, draft branches, the foundation dataset, or a passing web CI run as published religious content.**

## 3. Visible website status labels

The UI must distinguish platform readiness from content readiness.

- **Completed:** technical capability exists in the repository and is covered by the documented implementation contract.
- **In progress:** website section/layout work is actively being prepared. This does not mean that its articles are published or that religious claims have been verified.
- **Planned:** the section is in the future backlog and has not entered active content research.
- **Not published:** no approved article is available to readers yet.

For every learning-area card, show a status and explicitly avoid implying that content is available until the validated release provides it. The current UI may show all seven learning-area cards as **In progress** at the section-design level while articles remain unpublished. The canonical content inventory continues to distinguish the actual research state of each topic.

## 4. Content-to-web delivery contract

1. Content is researched and authored in the canonical content repository.
2. Work is grouped into small batches of approximately 3–5 entities.
3. Each locale receives independent language review; both locales must satisfy publication gates.
4. Source verification, editorial approval, rights checks, and restricted-practice checks are recorded explicitly.
5. Only approved records with valid paths and hashes may enter `content/manifest.json`.
6. The product owner approves the exact content release before it is used.
7. The web workflow checks out the exact immutable content commit and runs the content validator.
8. The web release preparer independently validates the manifest, hashes, status, locale approvals, source references, and restricted-content gates.
9. A successful candidate build produces an artifact for review. It does not publish or deploy automatically.
10. Any missing, empty, or invalid release must fail closed.

## 5. Sprint board — website dependencies

### Sprint W0 — Foundation and release bridge

- [x] Repository foundation and static-first stack.
- [x] Content release bridge and fail-closed build behavior.
- [x] Bilingual library and article routes generated from validated data.
- [x] Manual-only release candidate workflow and artifact review path.
- [ ] Verify/configure the narrowly scoped `CONTENT_REPO_READ_TOKEN` secret.

### Sprint W1 — Visible status and first UI iteration

- [ ] Show completed platform capabilities separately from content readiness.
- [ ] Add status labels for in-progress and planned learning areas.
- [ ] Keep the empty state explicit until a real approved content release exists.
- [ ] Verify navigation and status labels in both locales.
- [ ] Run responsive, accessibility, build, and content-contract checks.

### Sprint W2 — Full UI/UX review

- [ ] Review information architecture, responsive behavior, typography, navigation, search, and visual direction.
- [ ] Test representative mobile, tablet, and desktop viewports.
- [ ] Run keyboard, focus, contrast, and reduced-motion checks.
- [ ] Complete independent browser QA and resolve confirmed defects.

### Sprint W3 — First real content integration

- [ ] Receive an explicitly approved, pinned content commit and manifest.
- [ ] Run the content validator and web release-candidate workflow against that exact SHA.
- [ ] Review generated Hindi/English library and article routes, source references, and metadata.
- [ ] Check route integrity, missing-content behavior, and publication allow-list.

### Sprint W4 — Release and deployment readiness

- [ ] Approve UI and accessibility/performance review separately.
- [ ] Confirm hosting and deployment workflow; do not assume GitHub Pages or any production target is configured.
- [ ] Verify the reviewed artifact corresponds to the approved immutable content release.
- [ ] Document rollback and correction procedures.
- [ ] Deploy only after explicit approval.

## 6. Definition of done for a web UI iteration

- [ ] Completed capabilities are accurately described.
- [ ] Every learning-area card has a status label and does not imply unavailable content is published.
- [ ] English and Hindi status guidance is equivalent.
- [ ] Mobile layout, keyboard navigation, focus visibility, and contrast are reviewed.
- [ ] `npm run check`, `npm test`, and `npm run build` pass.
- [ ] The PR is reviewed by the product owner; merge remains a separate decision.

## 7. Known blockers and risks

- No real content records or source records exist yet.
- The content manifest does not exist; production release validation must fail until a complete approved release is created.
- The private content checkout secret needs setup/verification before the manual workflow can access the content repository.
- Full visual design and browser QA are not yet complete.
- Passing CI proves implementation checks, not the religious accuracy of future content.
- No production deployment has been performed.

## 8. Change log

| Date | Change | Evidence |
|---|---|---|
| 2026-10-18 | Website-side content delivery tracker created after merging the pinned bilingual content-release workflow. | Web repository `master` snapshot |
| 2026-10-18 | First status-dashboard UI iteration implemented in PR #6; status cards distinguish completed platform work, active section layout, planned areas, and unpublished content. | [PR #6](https://github.com/srma4tech/sanatana-dharma-web-by-srma4tech/pull/6) |
