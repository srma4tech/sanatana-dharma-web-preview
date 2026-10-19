import test from 'node:test';
import assert from 'node:assert/strict';
import { getPublishedContent, getPublishedContentBySlug } from '../src/lib/published-content.js';

const approvedRecord = {
  id: 'deity-shiva', slug: 'shiva-overview', status: 'published',
  locales: {
    en: { localeStatus: 'approved', review: { languageStatus: 'approved', subjectStatus: 'approved' } },
    hi: { localeStatus: 'approved', review: { languageStatus: 'approved', subjectStatus: 'approved' } }
  }
};
const validatedDataset = { releaseStatus: 'validated', items: [approvedRecord] };

test('returns records only after both locales pass review', () => {
  assert.deepEqual(getPublishedContent(validatedDataset, 'en'), [approvedRecord]);
  assert.deepEqual(getPublishedContent(validatedDataset, 'hi'), [approvedRecord]);
});

test('fails closed for missing, unvalidated, malformed, or unsupported input', () => {
  assert.deepEqual(getPublishedContent(undefined, 'en'), []);
  assert.deepEqual(getPublishedContent({ releaseStatus: 'not-configured', items: [approvedRecord] }, 'en'), []);
  assert.deepEqual(getPublishedContent({ releaseStatus: 'validated', items: 'bad' }, 'en'), []);
  assert.deepEqual(getPublishedContent(validatedDataset, 'fr'), []);
});

test('excludes drafts and any record with a pending gate in either locale', () => {
  const pendingEnglish = { ...approvedRecord, id: 'pending-en', locales: { ...approvedRecord.locales, en: { localeStatus: 'approved', review: { languageStatus: 'pending', subjectStatus: 'approved' } } } };
  const pendingHindi = { ...approvedRecord, id: 'pending-hi', locales: { ...approvedRecord.locales, hi: { localeStatus: 'approved', review: { languageStatus: 'approved', subjectStatus: 'pending' } } } };
  const dataset = { releaseStatus: 'validated', items: [approvedRecord, { ...approvedRecord, id: 'draft', status: 'draft' }, pendingEnglish, pendingHindi] };
  assert.deepEqual(getPublishedContent(dataset, 'en').map((record) => record.id), ['deity-shiva']);
  assert.deepEqual(getPublishedContent(dataset, 'hi').map((record) => record.id), ['deity-shiva']);
});

test('looks up a slug only among approved records', () => {
  assert.equal(getPublishedContentBySlug(validatedDataset, 'en', 'shiva-overview'), approvedRecord);
  assert.equal(getPublishedContentBySlug({ releaseStatus: 'not-configured', items: [approvedRecord] }, 'en', 'shiva-overview'), undefined);
  assert.equal(getPublishedContentBySlug(validatedDataset, 'en', ' '), undefined);
});
