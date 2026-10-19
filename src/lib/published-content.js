const SUPPORTED_LOCALES = new Set(['en', 'hi']);

/**
 * Read only records produced by the validated release pipeline.
 * Draft review JSON is intentionally not imported by this module.
 */
export function getPublishedContent(dataset, locale) {
  if (!SUPPORTED_LOCALES.has(locale)) return [];
  if (!dataset || dataset.releaseStatus !== 'validated' || !Array.isArray(dataset.items)) return [];

  return dataset.items.filter((record) => {
    if (!record || record.status !== 'published' || typeof record.id !== 'string') return false;
    const localeRecord = record.locales?.[locale];
    return Boolean(
      localeRecord &&
      ['approved', 'published'].includes(localeRecord.localeStatus) &&
      localeRecord.review?.languageStatus === 'approved' &&
      localeRecord.review?.subjectStatus === 'approved'
    );
  });
}

export function getPublishedContentBySlug(dataset, locale, slug) {
  if (typeof slug !== 'string' || !slug.trim()) return undefined;
  return getPublishedContent(dataset, locale).find((record) => record.slug === slug);
}
