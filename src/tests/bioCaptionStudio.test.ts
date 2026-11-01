import {
  countBioCaptionCharacters,
  countBioCaptionLines,
  DECORATIVE_SEPARATORS,
  getBioCaptionTemplates,
  insertAtTextSelection,
} from '../services/bioCaptionStudio';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

assert(countBioCaptionCharacters('Hello') === 5, 'Counts basic characters');
assert(countBioCaptionCharacters('e\u0301') === 1, 'Normalizes combining accents before counting');
assert(countBioCaptionCharacters('👨‍👩‍👧‍👦') === 1, 'Counts a joined family emoji as one visible character');
assert(countBioCaptionCharacters('🇩🇿') === 1, 'Counts a flag as one visible character');
assert(countBioCaptionCharacters('A\nB') === 3, 'Includes line breaks in the character count');
assert(countBioCaptionLines('') === 0, 'Empty editor has zero lines');
assert(countBioCaptionLines('one\ntwo\r\nthree') === 3, 'Counts LF and CRLF line endings');
assert(DECORATIVE_SEPARATORS.length >= 6, 'Provides a useful set of decorative separators');

for (const language of ['en', 'fr', 'ar']) {
  const templates = getBioCaptionTemplates(language);
  assert(templates.length >= 8, `${language} catalogue contains bio and caption templates`);
  assert(new Set(templates.map((template) => template.id)).size === templates.length, `${language} template IDs are unique`);
  assert(getBioCaptionTemplates(language, 'bio').every((template) => template.kind === 'bio'), `${language} bio filter returns only bios`);
  assert(getBioCaptionTemplates(language, 'caption').every((template) => template.kind === 'caption'), `${language} caption filter returns only captions`);
}
assert(getBioCaptionTemplates('unsupported').length === getBioCaptionTemplates('en').length, 'Unknown locale falls back to English');

const inserted = insertAtTextSelection('Hello world', 6, 11, 'NameForge');
assert(inserted.value === 'Hello NameForge' && inserted.cursor === 15, 'Replaces selected text and returns cursor position');
const appended = insertAtTextSelection('Bio', 3, 3, '\n✦');
assert(appended.value === 'Bio\n✦' && appended.cursor === 5, 'Inserts a separator at the end of the text');

console.log('\nPhase 4 Bio & Caption Studio tests: all checks passed.');
