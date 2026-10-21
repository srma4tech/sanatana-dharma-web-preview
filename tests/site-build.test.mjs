import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

const distDir = resolve('dist');

test('build emits an English default document with basic metadata and skip navigation', async () => {
  const html = await readFile(resolve(distDir, 'index.html'), 'utf8');
  assert.match(html, /<html[^>]*lang="en"/i);
  assert.match(html, /<meta[^>]*name="description"/i);
  assert.match(html, /<title>Sanātana Dharma/i);
  assert.match(html, /class="skip-link"/i);
  assert.match(html, /id="main"/i);
});

test('build exposes bilingual review routes with explicit draft status before publication approval', async () => {
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
  assert.deepEqual(htmlRoutes, [
    'en/index.html',
    'en/rudra-shiva-terminology/index.html',
    'en/shiva-iconography-symbols/index.html',
    'en/shiva-overview/index.html',
    'hi/index.html',
    'hi/rudra-shiva-terminology/index.html',
    'hi/shiva-iconography-symbols/index.html',
    'hi/shiva-overview/index.html',
    'index.html'
  ]);

  for (const locale of ['en', 'hi']) {
    for (const slug of ['shiva-overview', 'rudra-shiva-terminology', 'shiva-iconography-symbols']) {
      const html = await readFile(resolve(distDir, locale, slug, 'index.html'), 'utf8');
      assert.match(html, /review-banner/i);
      assert.match(html, /Review draft|समीक्षा प्रारूप/);
      assert.match(html, /Sources &amp; verification status|स्रोत और सत्यापन स्थिति/);
    }
  }
});
