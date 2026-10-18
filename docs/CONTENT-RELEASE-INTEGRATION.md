# Content Release Integration

**Status:** A manually triggered, pinned release-candidate workflow and bilingual static content routes are implemented. No real content release, repository secret, or deployment is configured yet.

## Source of truth and immutable pin

- `srma4tech/sanatana-dharma-content` remains canonical.
- The workflow accepts an exact 40-character lowercase commit SHA and checks out that exact content commit. It never reads the moving content `master` branch for the release build.
- The workflow runs `npm run validate:release` in the content repository before the web build.
- The web release preparer independently checks the manifest, publisher approval, allow-listed entity paths, record IDs/types/statuses, SHA-256 hashes, Hindi and English approval states, editorial approval, and verified/resolvable source references.
- Only records listed in `content/manifest.json` are included in `src/data/published-content.json`. Inventory items and unlisted entity files are never treated as publishable content.
- The site generates bilingual library pages at `/en/` and `/hi/`, and article pages at `/<locale>/<slug>/` only for records in the validated manifest. Source citations are shown from the resolved source records and claim references.

## One-time repository configuration

In the **public web repository** settings, add an Actions secret named `CONTENT_REPO_READ_TOKEN`. Use a fine-grained GitHub token scoped only to the private `sanatana-dharma-content` repository, with the minimum read-only repository contents permission required for checkout. Do not paste the token into chat, source files, workflow inputs, or logs. Avoid a broad personal access token when a narrowly scoped token is available.

If organization policy requires approval for Actions secrets or private-repository access, configure that approval before running the workflow. The workflow intentionally has no pull-request trigger and does not deploy automatically.

## Runbook

1. Confirm that the content commit has been reviewed and that the manifest explicitly records product-owner approval.
2. Copy the exact 40-character commit SHA from the content repository. Do not use `master`, a moving branch name, or an unreviewed commit.
3. Open **Actions → Content release candidate → Run workflow** in the web repository, choose `master`, and enter the exact SHA.
4. The workflow checks out the pinned content commit, runs the content repository's release validator, then runs the web production build.
5. If any check fails, no artifact is uploaded. Investigate the report; do not bypass the validation.
6. If successful, download the `sanatana-static-candidate-<sha>` artifact for review. This workflow does not publish it to a hosting provider.

## Build modes

- `npm run build` is the foundation/preview build. If `SANATANA_CONTENT_DIR` is not set, it writes an explicit `not-configured` dataset with zero records.
- `npm run build:production` requires `SANATANA_CONTENT_DIR` and fails closed if the release is missing, empty, or invalid.
- Never deploy the foundation build as a production content release.
- Private repository credentials are used only for checkout; checkout credentials are not persisted, and tokens must never enter browser code or generated assets.

## Current publication status

No religious article or record is currently approved for the website. The release workflow is only a technical delivery gate; it does not prove factual or religious accuracy. Human review and explicit product-owner approval remain mandatory. No content should be generated or approved automatically by this workflow.
