import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

const distDir = resolve('dist');
const shivaSlugs = [
  'shiva-overview',
  'rudra-shiva-terminology',
  'shiva-iconography-symbols',
  'shiva-shakti-relationship',
  'selected-shiva-forms',
  'shaiva-traditions-introduction',
  'shiva-scripture-guide',
  'beginner-shiva-learning-path'
];

test('build emits an English default document with basic metadata and skip navigation', async () => {
  const html = await readFile(resolve(distDir, 'index.html'), 'utf8');
  assert.match(html, /<html[^>]*lang="en"/i);
  assert.match(html, /<meta[^>]*name="description"/i);
  assert.match(html, /<title>Sanātana Dharma/i);
  assert.match(html, /class="skip-link"/i);
  assert.match(html, /id="main"/i);
  assert.match(html, /Owner review preview/);
});

test('build exposes all eight bilingual Shiva review routes with explicit draft status before publication approval', async () => {
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name);
      if (entry.isDirectory()) files.push(...await walk(fullPath));
      else files.push(relative(distDir, fullPath).split(sep).join('/'));
    }
    return files;
  }

  const files = await walk(distDir);
  const htmlRoutes = files.filter((path) => path.endsWith('.html')).sort();
  const expectedRoutes = [
    'index.html',
    ...['en', 'hi'].flatMap((locale) => [
      `${locale}/index.html`,
      ...shivaSlugs.map((slug) => `${locale}/${slug}/index.html`)
    ])
  ].sort();
  assert.deepEqual(htmlRoutes, expectedRoutes);

  for (const locale of ['en', 'hi']) {
    for (const slug of shivaSlugs) {
      const html = await readFile(resolve(distDir, locale, slug, 'index.html'), 'utf8');
      assert.match(html, /review-banner/i);
      assert.match(html, /Review draft|समीक्षा प्रारूप/);
      assert.match(html, /Sources &amp; verification status|स्रोत और सत्यापन स्थिति/);
      assert.match(html, /not as publication approval|प्रकाशन की स्वीकृति नहीं/);
      if (slug === 'shiva-iconography-symbols') {
        assert.match(html, /collectionapi\.metmuseum\.org\/api\/collection\/v1\/iiif\/39328\/154124\/main-image/);
        assert.match(html, /metmuseum\.org\/art\/collection\/search\/39328/);
      }
    }
  }
});
