import assert from 'node:assert/strict';
import test from 'node:test';

import { protectMarkdown, restoreMarkdown } from '../src/translator.js';

test('restoreMarkdown accepts literal text when the placeholder token is dropped', () => {
  const source = 'Use `~/.config/gptadmin` for config.';
  const { protectedMarkdown, literals } = protectMarkdown(source);
  assert.match(protectedMarkdown, /__GPTADMIN_LITERAL_[A-Z]+__/);

  const translated = 'Используйте `~/.config/gptadmin` для конфигурации.';
  assert.equal(restoreMarkdown(translated, literals), translated);
});

test('restoreMarkdown replaces the placeholder token with the original literal', () => {
  const source = 'Use `~/.config/gptadmin` for config.';
  const { literals } = protectMarkdown(source);

  const translatedLiteral = 'Используйте __GPTADMIN_LITERAL_A__ для конфигурации.';
  assert.equal(restoreMarkdown(translatedLiteral, literals), 'Используйте `~/.config/gptadmin` для конфигурации.');
});

test('restoreMarkdown fails when neither token nor original literal is present', () => {
  const source = 'Use `~/.config/gptadmin` for config.';
  const { literals } = protectMarkdown(source);

  assert.throws(
    () => restoreMarkdown('Используйте другой путь для конфигурации.', literals),
    /translator changed protected literal/
  );
});
