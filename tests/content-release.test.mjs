import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadAndValidateRelease, prepareContentRelease } from '../scripts/prepare-content-release.mjs';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sanatana-release-'));
  const record = {
    id: 'deity-shiva',
    type: 'deity-profile',
    slug: 'shiva',
    status: 'published',
    editorial: {
      reviewStatus: 'approved-for-publication',
      publisherApproval: { approved: true }
    },
    sources: [{ sourceId: 'source-1', claimClass: 'traditional-belief', locator: 'Chapter 1', verificationStatus: 'verified', claimSummary: 'Test claim', verifiedBy: 'reviewer-1', verifiedOn: '2026-10-18' }],
    locales: {
      hi: { localeStatus: 'approved', review: { languageStatus: 'approved', subjectStatus: 'approved' } },
      en: { localeStatus: 'approved', review: { languageStatus: 'approved', subjectStatus: 'approved' } }
    }
  };
  const relativePath = 'content/entities/deity-profile/deity-shiva.json';
  const recordPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(recordPath), { recursive: true });
  const bytes = JSON.stringify(record);
  fs.writeFileSync(recordPath, bytes);
  const manifest = {
    manifestVersion: '1.0.0',
    releaseVersion: '1.0.0',
    generatedAt: '2026-10-18T00:00:00.000Z',
    publisherApproval: { approved: true, approvedBy: 'product-owner', approvedOn: '2026-10-18T00:00:00.000Z' },
    contentItems: [{
      id: record.id, type: record.type, path: relativePath, status: 'published',
      locales: ['hi', 'en'],
      sha256: crypto.createHash('sha256').update(bytes).digest('hex')
    }]
  };
  const sourcePath = path.join(root, 'content', 'sources', 'source-1.json');
  fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
  fs.writeFileSync(sourcePath, JSON.stringify({ id: 'source-1', sourceKind: 'institutional-source', title: 'Example source', creators: ['Test author'], language: ['en'], rights: { status: 'not-applicable' }, verificationStatus: 'verified', url: 'https://example.org/source', accessDate: '2026-10-18' }));
  const manifestPath = path.join(root, 'content', 'manifest.json');
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  return { root, recordPath, sourcePath, manifestPath, manifest };
}

test('accepts a pinned-manifest item with bilingual approval, publisher approval and matching hash', () => {
  const f = fixture();
  try {
    const result = loadAndValidateRelease(f.root);
    assert.equal(result.releaseStatus, 'validated');
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].id, 'deity-shiva');
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('rejects a checksum mismatch', () => {
  const f = fixture();
  try {
    fs.appendFileSync(f.recordPath, ' ');
    assert.throws(() => loadAndValidateRelease(f.root), /SHA-256 mismatch/);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('rejects missing English locale approval', () => {
  const f = fixture();
  try {
    const record = JSON.parse(fs.readFileSync(f.recordPath, 'utf8'));
    record.locales.en.localeStatus = 'draft';
    const bytes = JSON.stringify(record);
    fs.writeFileSync(f.recordPath, bytes);
    f.manifest.contentItems[0].sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
    fs.writeFileSync(f.manifestPath, JSON.stringify(f.manifest));
    assert.throws(() => loadAndValidateRelease(f.root), /approved en locale/);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('rejects a path outside the entity content directory', () => {
  const f = fixture();
  try {
    f.manifest.contentItems[0].path = '../secret.json';
    fs.writeFileSync(f.manifestPath, JSON.stringify(f.manifest));
    assert.throws(() => loadAndValidateRelease(f.root), /not an entity JSON path/);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('rejects empty manifests and unverified sources', () => {
  const f = fixture();
  try {
    f.manifest.contentItems = [];
    fs.writeFileSync(f.manifestPath, JSON.stringify(f.manifest));
    assert.throws(() => loadAndValidateRelease(f.root), /at least one approved content item/);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});

test('production mode fails when no immutable release directory is supplied', () => {
  assert.throws(() => prepareContentRelease({ releaseDir: undefined, required: true }), /SANATANA_CONTENT_DIR is required/);
});


test('rejects source URLs that are not HTTP or HTTPS', () => {
  const f = fixture();
  try {
    const source = JSON.parse(fs.readFileSync(f.sourcePath, 'utf8'));
    source.url = 'javascript:alert(1)';
    fs.writeFileSync(f.sourcePath, JSON.stringify(source));
    assert.throws(() => loadAndValidateRelease(f.root), /URL must use HTTP or HTTPS/);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});
