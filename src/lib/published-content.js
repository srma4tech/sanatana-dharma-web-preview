const SUPPORTED_LOCALES = new Set(['en', 'hi']);

function localeApproved(record, locale) {
  const data = record.locales?.[locale];
  return Boolean(
    data &&
    ['approved', 'published'].includes(data.localeStatus) &&
    data.review?.languageStatus === 'approved' &&
    data.review?.subjectStatus === 'approved'
  );
}

/**
 * Read only records produced by the validated release pipeline.
 * Draft review JSON is intentionally not imported by this module.
 * Both locales must have passed their review gates before either locale is returned.
 */
export function getPublishedContent(dataset, locale) {
  if (!SUPPORTED_LOCALES.has(locale)) return [];
  if (!dataset || dataset.releaseStatus !== 'validated' || !Array.isArray(dataset.items)) return [];

  return dataset.items.filter((record) => {
    if (!record || record.status !== 'published' || typeof record.id !== 'string') return false;
    return localeApproved(record, 'en') && localeApproved(record, 'hi') && localeApproved(record, locale);
  });
}

export function getPublishedContentBySlug(dataset, locale, slug) {
  if (typeof slug !== 'string' || !slug.trim()) return undefined;
  return getPublishedContent(dataset, locale).find((record) => record.slug === slug);
}
