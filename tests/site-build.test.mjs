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

test('build does not publish content routes before a validated content release exists', async () => {
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
  assert.deepEqual(htmlRoutes, ['en/index.html', 'hi/index.html', 'index.html']);
  assert.equal(htmlRoutes.some((route) => /^(?:en|hi)\/[^/]+\/index\.html$/.test(route)), false);
});
