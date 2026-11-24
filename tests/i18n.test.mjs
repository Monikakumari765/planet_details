import test from 'node:test';
import assert from 'node:assert/strict';
import { LANG } from '../src/config.js';
import { t } from '../src/ui/i18n.js';
import { readFile } from 'node:fs/promises';

test('English is the default application locale and key UI strings resolve', async () => {
  assert.equal(LANG, 'en');
  for (const [key, expected] of [
    ['start.sub', '1:1 real-time solar system'],
    ['start.enter', 'Enter Simulation'],
    ['start.hint', 'Click to lock the pointer'],
    ['dir.title', '🪐 Directory'],
    ['grp.planet', '🪐 Planets'],
  ]) {
    assert.ok(t(key).startsWith(expected), `${key} should resolve to readable English`);
    assert.notEqual(t(key), key, `${key} must not appear as a raw translation key`);
  }

  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<html lang="en" data-base="\/">/);
});
