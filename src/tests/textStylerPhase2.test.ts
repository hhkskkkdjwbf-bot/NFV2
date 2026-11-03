import { filterUnicodeStyles, splitGraphemes, UNICODE_STYLES } from '../services/textStyler';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

const uniqueIds = new Set(UNICODE_STYLES.map((style) => style.id));
assert(uniqueIds.size === UNICODE_STYLES.length, 'Every Unicode style has a unique id');
assert(UNICODE_STYLES.length === 27, 'The studio exposes 27 copyable Unicode transformations');

const italicSerif = UNICODE_STYLES.find((style) => style.id === 'italic-serif');
const boldSansItalic = UNICODE_STYLES.find((style) => style.id === 'bold-sans-italic');
const superscript = UNICODE_STYLES.find((style) => style.id === 'superscript');
const subscript = UNICODE_STYLES.find((style) => style.id === 'subscript');
const thinSpaced = UNICODE_STYLES.find((style) => style.id === 'thin-spaced');\nconst strikethrough = UNICODE_STYLES.find((style) => style.id === 'strikethrough');\nconst underline = UNICODE_STYLES.find((style) => style.id === 'underline');\nconst boldSans = UNICODE_STYLES.find((style) => style.id === 'bold-sans');

assert(italicSerif?.transform('Name') === '𝑁𝑎𝑚𝑒', 'Italic serif maps Latin letters correctly');
assert(boldSansItalic?.transform('Name') === '𝙉𝙖𝙢𝙚', 'Bold italic sans maps Latin letters correctly');
assert(superscript?.transform('H2O') === 'ᴴ²ᴼ', 'Superscript maps supported letters and digits');
assert(subscript?.transform('H2O') === 'H₂O', 'Subscript maps supported digits without changing unsupported letters');
assert(thinSpaced?.transform('A👨‍👩‍👧‍👦B') === 'A 👨‍👩‍👧‍👦 B', 'Thin spacing preserves joined emoji grapheme clusters');
assert(splitGraphemes('🇩🇿👨‍👩‍👧‍👦é').length === 3, 'Grapheme splitting keeps flags, family emoji and combining accents intact');\nassert(strikethrough?.transform('👨‍👩‍👧‍👦') === '👨‍👩‍👧‍👦̶', 'Strikethrough preserves a joined family emoji as one grapheme');\nassert(underline?.transform('🇩🇿') === '🇩🇿̲', 'Underline preserves a flag grapheme');\nassert(boldSans?.transform('Élodie العربية') === '𝗘́𝗹𝗼𝗱𝗶𝗲 العربية', 'Latin accents remain visible and Arabic is not corrupted');\nassert(UNICODE_STYLES.every((style) => style.transform('') === ''), 'Every style keeps empty input empty');

assert(filterUnicodeStyles(UNICODE_STYLES, 'italic serif').some((style) => style.id === 'italic-serif'), 'Instant search finds a style by its display name');
assert(filterUnicodeStyles(UNICODE_STYLES, 'BOLD-SANS-ITALIC').some((style) => style.id === 'bold-sans-italic'), 'Search is case-insensitive and matches style ids');
assert(filterUnicodeStyles(UNICODE_STYLES, '', 'gothic').every((style) => style.category === 'gothic'), 'Category filter returns only Gothic styles');
assert(filterUnicodeStyles(UNICODE_STYLES, 'superscript', 'symbols').some((style) => style.id === 'superscript'), 'Search and category filters combine correctly');
assert(filterUnicodeStyles(UNICODE_STYLES, 'not-a-style').length === 0, 'Search returns an empty result when no style matches');

console.log(`\nPhase 2 text styler tests: all checks passed (${UNICODE_STYLES.length} styles).`);
