import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, '..');
const outputPath = path.join(webRoot, 'src', 'data', 'published-content.json');
const allowedTypes = new Set([
  'deity-profile', 'concept-article', 'scripture-profile', 'narrative',
  'temple-profile', 'festival-profile', 'practice-guide', 'mantra-or-stotra',
  'learning-path', 'puja-procedure', 'siddhi-claim'
]);

function fail(message) {
  throw new Error(`Content release rejected: ${message}`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`cannot read valid JSON at ${filePath}: ${error.message}`);
  }
}

function safeRepoPath(root, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath.startsWith('content/entities/') || !relativePath.endsWith('.json')) {
    fail(`manifest path is not an entity JSON path: ${relativePath}`);
  }
  if (relativePath.includes('\\') || relativePath.split('/').some(part => part === '..' || part === '.' || part === '')) {
    fail(`manifest path contains unsafe segments: ${relativePath}`);
  }
  const absolute = path.resolve(root, relativePath);
  if (!absolute.startsWith(path.resolve(root) + path.sep)) fail(`manifest path escapes release root: ${relativePath}`);
  return absolute;
}

function collectJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectJsonFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.json') ? [fullPath] : [];
  });
}

function validateRestrictedContent(record) {
  if (record.type === 'mantra-or-stotra' && record.mantraDetails?.accessTier === 'initiation-required') {
    const forbidden = ['mantraText', 'transliteration', 'pronunciation', 'translation', 'meaning', 'recitationInstructions'];
    for (const key of forbidden) {
      if (Object.hasOwn(record.mantraDetails, key)) fail(`initiation-required mantra ${record.id} contains forbidden field ${key}`);
    }
    for (const [locale, data] of Object.entries(record.locales ?? {})) {
      for (const [sectionIndex, section] of (data.body ?? []).entries()) {
        for (const [blockIndex, block] of (section.blocks ?? []).entries()) {
          if (['quote', 'verse'].includes(block.kind)) {
            fail(`initiation-required mantra ${record.id} contains a quote/verse block at ${locale}:${sectionIndex}:${blockIndex}`);
          }
        }
      }
    }
  }
  if (['practice-guide', 'puja-procedure'].includes(record.type)) {
    const details = record.practiceDetails ?? record.pujaDetails;
    if (details?.accessTier === 'initiation-required' &&
        (Object.hasOwn(details, 'steps') || Object.hasOwn(details, 'materials'))) {
      fail(`initiation-required practice ${record.id} exposes steps or materials`);
    }
  }
}

function validateLocale(record, locale) {
  const data = record.locales?.[locale];
  if (!data || !['approved', 'published'].includes(data.localeStatus)) {
    fail(`record ${record.id} does not have an approved ${locale} locale`);
  }
  for (const gate of ['languageStatus', 'subjectStatus']) {
    if (data.review?.[gate] !== 'approved') fail(`record ${record.id} has no approved ${gate} for ${locale}`);
  }
}

export function loadAndValidateRelease(releaseRoot) {
  const root = path.resolve(releaseRoot);
  const manifestPath = path.join(root, 'content', 'manifest.json');
  if (!fs.existsSync(manifestPath)) fail('content/manifest.json is missing');
  const manifest = readJson(manifestPath);

  if (!/^\d+\.\d+\.\d+$/.test(manifest.manifestVersion ?? '')) fail('manifestVersion must be semantic version x.y.z');
  if (!/^\d+\.\d+\.\d+$/.test(manifest.releaseVersion ?? '')) fail('releaseVersion must be semantic version x.y.z');
  if (manifest.publisherApproval?.approved !== true ||
      typeof manifest.publisherApproval?.approvedBy !== 'string' ||
      !manifest.publisherApproval.approvedBy.trim() ||
      !Number.isFinite(Date.parse(manifest.publisherApproval.approvedOn ?? ''))) {
    fail('manifest publisher approval is missing or invalid');
  }
  if (!Array.isArray(manifest.contentItems) || manifest.contentItems.length === 0) {
    fail('manifest must contain at least one approved content item');
  }

  const sourceRoot = path.join(root, 'content', 'sources');
  const sourceMap = new Map();
  for (const sourcePath of collectJsonFiles(sourceRoot)) {
    const source = readJson(sourcePath);
    if (typeof source.id !== 'string' || sourceMap.has(source.id)) fail(`invalid or duplicate source ID in ${sourcePath}`);
    if (source.verificationStatus === 'verified' &&
        (typeof source.title !== 'string' || !Array.isArray(source.creators) ||
         !Array.isArray(source.language) || !source.rights?.status)) {
      fail(`verified source ${source.id} is missing required citation metadata`);
    }
    if (source.url !== undefined) {
      let parsedUrl;
      try { parsedUrl = new URL(source.url); } catch { fail(`source ${source.id} has an invalid URL`); }
      if (!['https:', 'http:'].includes(parsedUrl.protocol)) fail(`source ${source.id} URL must use HTTP or HTTPS`);
    }
    sourceMap.set(source.id, source);
  }

  const ids = new Set();
  const slugs = new Set();
  const items = [];
  for (const entry of manifest.contentItems) {
    if (!entry || typeof entry.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) fail('manifest contains an invalid ID');
    if (ids.has(entry.id)) fail(`duplicate manifest ID ${entry.id}`);
    ids.add(entry.id);
    if (!allowedTypes.has(entry.type)) fail(`unsupported content type for ${entry.id}: ${entry.type}`);
    if (entry.status !== 'published') fail(`manifest item ${entry.id} is not published`);
    if (!Array.isArray(entry.locales) || entry.locales.length !== 2 ||
        new Set(entry.locales).size !== 2 || !entry.locales.includes('hi') || !entry.locales.includes('en')) {
      fail(`manifest item ${entry.id} must include exactly hi and en`);
    }
    if (!/^[a-f0-9]{64}$/.test(entry.sha256 ?? '')) fail(`manifest item ${entry.id} has an invalid SHA-256`);

    const recordPath = safeRepoPath(root, entry.path);
    if (!fs.existsSync(recordPath)) fail(`manifest record is missing: ${entry.path}`);
    const raw = fs.readFileSync(recordPath);
    const digest = crypto.createHash('sha256').update(raw).digest('hex');
    if (digest !== entry.sha256) fail(`SHA-256 mismatch for ${entry.id}`);
    const record = readJson(recordPath);
    validateRestrictedContent(record);
    if (record.id !== entry.id || record.type !== entry.type || record.status !== 'published') {
      fail(`manifest metadata does not match record ${entry.id}`);
    }
    if (record.editorial?.reviewStatus !== 'approved-for-publication' ||
        record.editorial?.publisherApproval?.approved !== true) {
      fail(`record ${entry.id} has not passed editorial/publisher approval`);
    }
    validateLocale(record, 'hi');
    validateLocale(record, 'en');
    if (!Array.isArray(record.sources) || record.sources.length === 0 ||
        record.sources.some(source => source.verificationStatus !== 'verified' || typeof source.sourceId !== 'string' || !sourceMap.has(source.sourceId) || sourceMap.get(source.sourceId)?.verificationStatus !== 'verified')) {
      fail(`record ${entry.id} lacks verified claim-level sources`);
    }
    if (record.slug) {
      if (slugs.has(record.slug)) fail(`duplicate slug ${record.slug}`);
      slugs.add(record.slug);
    }
    const sourceReferences = record.sources.map(reference => ({
      ...reference,
      source: sourceMap.get(reference.sourceId)
    }));
    items.push({ ...record, sourceReferences });
  }

  return {
    releaseStatus: 'validated',
    releaseVersion: manifest.releaseVersion,
    manifestVersion: manifest.manifestVersion,
    items
  };
}

export function prepareContentRelease({
  releaseDir = process.env.SANATANA_CONTENT_DIR,
  required = process.argv.includes('--required')
} = {}) {
  let dataset;
  if (!releaseDir) {
    if (required) fail('SANATANA_CONTENT_DIR is required for a production release build');
    dataset = { releaseStatus: 'not-configured', releaseVersion: null, manifestVersion: null, items: [] };
  } else {
    dataset = loadAndValidateRelease(releaseDir);
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
  console.log(`Content release state: ${dataset.releaseStatus}; approved records: ${dataset.items.length}`);
  return dataset;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    prepareContentRelease();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
