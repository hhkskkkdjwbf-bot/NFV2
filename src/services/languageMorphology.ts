export type TurkishSuffixTemplate = string;

/**
 * Applies standard Turkish vowel harmony to suffix templates:
 * A = a/e, I = ı/i/u/ü, D = d/t, C = c/ç.
 * This is a morphology helper, not a general string concatenator. Callers must
 * supply a Turkish stem and an explicitly annotated suffix template.
 */
export function applyTurkishSuffix(stem: string, template: TurkishSuffixTemplate): string {
  const base = String(stem ?? '').normalize('NFC');
  const suffix = String(template ?? '');
  if (!base || !suffix) return base + suffix;

  const lowerStem = base.toLocaleLowerCase('tr-TR');
  const vowels = Array.from(lowerStem).filter((char) => 'aeıioöuü'.includes(char));
  const lastVowel = vowels[vowels.length - 1] || 'e';
  const back = 'aıou'.includes(lastVowel);
  const rounded = 'ouöü'.includes(lastVowel);
  const highVowel = back ? (rounded ? 'u' : 'ı') : (rounded ? 'ü' : 'i');
  const lowVowel = back ? 'a' : 'e';
  const lastLetter = Array.from(lowerStem).pop() || '';
  const voiceless = 'çfhkpsşt'.includes(lastLetter);

  const realized = suffix.replace(/[AIDC]/g, (marker) => {
    if (marker === 'A') return lowVowel;
    if (marker === 'I') return highVowel;
    if (marker === 'D') return voiceless ? 't' : 'd';
    return voiceless ? 'ç' : 'c';
  });
  return (base + realized).normalize('NFC');
}

/**
 * Inflects only explicitly marked regular Spanish -o adjectives.
 * Irregular, invariant and lexically exceptional adjectives must remain data-driven.
 */
export function inflectRegularSpanishOAdjective(
  adjective: string,
  gender: 'masculine' | 'feminine',
  number: 'singular' | 'plural' = 'singular'
): string {
  const word = String(adjective ?? '');
  if (!word) return word;
  const lower = word.toLocaleLowerCase('es');
  if (!lower.endsWith('o')) return word;
  let result = gender === 'feminine' ? word.slice(0, -1) + 'a' : word;
  if (number === 'plural') result += /[aeiouáéíóú]$/i.test(result) ? 's' : 'es';
  return result;
}
