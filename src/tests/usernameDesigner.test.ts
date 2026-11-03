import {
  countUsernameCharacters,
  generateUsernameSuggestions,
  validateUsername,
} from '../services/usernameDesigner';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

assert(countUsernameCharacters('éclair') === 6, 'NFC normalization counts accented letters consistently');
assert(validateUsername('Player_01', 3, 16).valid, 'Letters, digits and underscores are accepted');
assert(validateUsername('Étoile-7', 3, 16).valid, 'Unicode letters and hyphens are accepted');
assert(validateUsername('two words', 3, 16).errors.includes('whitespace'), 'Spaces are rejected');
assert(validateUsername('bad!name', 3, 16).errors.includes('invalid-characters'), 'Unsupported symbols are rejected');
assert(validateUsername('ab', 3, 16).errors.includes('too-short'), 'Minimum length is enforced');
assert(validateUsername('thisusernameistoolong', 3, 16).errors.includes('too-long'), 'Maximum length is enforced');
assert(validateUsername('', 3, 16).errors.includes('empty'), 'Empty values are reported');
assert(validateUsername('okay', 8, 3).errors.includes('invalid-limits'), 'Invalid length bounds are reported');

for (const style of ['gaming', 'fantasy', 'minimal', 'elegant'] as const) {
  const names = generateUsernameSuggestions({ baseName: 'Nova', style, minLength: 3, maxLength: 18, quantity: 16 });
  assert(names.length === 16, `${style} style returns the requested 16 unique suggestions`);
  assert(new Set(names.map((name) => name.toLowerCase())).size === names.length, `${style} style avoids duplicates`);
  assert(names.every((name) => validateUsername(name, 3, 18).valid), `${style} style respects character and length rules`);
}

const prefixed = generateUsernameSuggestions({
  baseName: 'Nova', style: 'gaming', prefix: 'Neo', suffix: 'GG', minLength: 3, maxLength: 20, quantity: 4,
});
assert(prefixed.every((name) => name.startsWith('Neo') && name.endsWith('GG')), 'Custom prefixes and suffixes are applied');
assert(generateUsernameSuggestions({ style: 'minimal', minLength: 3, maxLength: 4, quantity: 10 }).every((name) => name.length <= 4), 'Short maximum length is respected');\nconst minimalNames = generateUsernameSuggestions({ baseName: 'Nova', style: 'minimal', minLength: 3, maxLength: 24, quantity: 16 });\nassert(minimalNames.length === 16, 'Minimal style with a base name reaches the requested quantity');\nassert(minimalNames.some((name) => name.toLowerCase().includes('axis')), 'Minimal style uses its style-specific root vocabulary');
assert(generateUsernameSuggestions({ style: 'gaming', minLength: 20, maxLength: 4 }).length === 0, 'Invalid generation limits return no results');

console.log('\nPhase 3 username designer tests: all checks passed.');
