import type { GenLanguageCode, GeneratorFamily, GeneratorId } from '../types';

export type LinguisticStrategy = 'phonetic_harmony' | 'neologism' | 'portmanteau_blend' | 'symbolic_evocative' | 'punchy_minimal' | 'epic_compound';
export type ScriptFamily = 'Latin' | 'Arabic' | 'Hebrew' | 'Cyrillic' | 'Greek' | 'Devanagari' | 'Bengali' | 'Thai' | 'Hangul' | 'Han' | 'Hiragana' | 'Katakana' | 'Unknown';
export interface LanguageScriptProfile { language: GenLanguageCode; scripts: ScriptFamily[]; requiresWholeTokens: boolean; allowLatinTransliteration: boolean; }
export interface FamilyLinguisticPolicy { strategies: LinguisticStrategy[]; allowLocalizedTitles: boolean; allowGenderMorphology: boolean; preferWholeWords: boolean; }

const LATIN: ScriptFamily[] = ['Latin'];
const SCRIPT_PROFILES: Record<string, LanguageScriptProfile> = {
  auto: { language: 'auto', scripts: [], requiresWholeTokens: false, allowLatinTransliteration: true },
  fr: { language: 'fr', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  en: { language: 'en', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  es: { language: 'es', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  de: { language: 'de', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  it: { language: 'it', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  pt: { language: 'pt', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  tr: { language: 'tr', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  nl: { language: 'nl', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  pl: { language: 'pl', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  sv: { language: 'sv', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  vi: { language: 'vi', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  id: { language: 'id', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  cs: { language: 'cs', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  ro: { language: 'ro', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  da: { language: 'da', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  fi: { language: 'fi', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  nb: { language: 'nb', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  ar: { language: 'ar', scripts: ['Arabic'], requiresWholeTokens: true, allowLatinTransliteration: true },
  he: { language: 'he', scripts: ['Hebrew'], requiresWholeTokens: true, allowLatinTransliteration: true },
  ru: { language: 'ru', scripts: ['Cyrillic'], requiresWholeTokens: true, allowLatinTransliteration: true },
  uk: { language: 'uk', scripts: ['Cyrillic'], requiresWholeTokens: true, allowLatinTransliteration: true },
  el: { language: 'el', scripts: ['Greek'], requiresWholeTokens: true, allowLatinTransliteration: true },
  hi: { language: 'hi', scripts: ['Devanagari'], requiresWholeTokens: true, allowLatinTransliteration: true },
  bn: { language: 'bn', scripts: ['Bengali'], requiresWholeTokens: true, allowLatinTransliteration: true },
  th: { language: 'th', scripts: ['Thai'], requiresWholeTokens: true, allowLatinTransliteration: true },
  ko: { language: 'ko', scripts: ['Hangul'], requiresWholeTokens: true, allowLatinTransliteration: true },
  ja: { language: 'ja', scripts: ['Han', 'Hiragana', 'Katakana'], requiresWholeTokens: true, allowLatinTransliteration: true },
  zh: { language: 'zh', scripts: ['Han'], requiresWholeTokens: true, allowLatinTransliteration: true },
  latin: { language: 'latin', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  nordic: { language: 'nordic', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
  tech: { language: 'tech', scripts: LATIN, requiresWholeTokens: false, allowLatinTransliteration: false },
};
const ALL: LinguisticStrategy[] = ['phonetic_harmony', 'neologism', 'portmanteau_blend', 'symbolic_evocative', 'punchy_minimal', 'epic_compound'];
const BRAND: LinguisticStrategy[] = ['phonetic_harmony', 'neologism', 'portmanteau_blend', 'symbolic_evocative', 'punchy_minimal'];
const STORY: LinguisticStrategy[] = ['phonetic_harmony', 'symbolic_evocative', 'epic_compound'];
const SENTENCE_OR_SERVICE_GENERATORS = new Set<GeneratorId>([
  'slogan', 'book', 'novel_series', 'song_title', 'album_title', 'blog_name', 'newsletter', 'podcast',
  'tactical_operation', 'restaurant', 'coffee_shop', 'tavern', 'band_name', 'videogame', 'youtube',
  'shop', 'guild', 'bakery', 'hotel_name', 'food_truck', 'festival_event', 'webradio_station',
]);

export function getLanguageScriptProfile(language: GenLanguageCode): LanguageScriptProfile {
  return SCRIPT_PROFILES[language] || { language, scripts: [], requiresWholeTokens: true, allowLatinTransliteration: true };
}
export function getFamilyLinguisticPolicy(family: GeneratorFamily, generatorId: GeneratorId, language: GenLanguageCode): FamilyLinguisticPolicy {
  const script = getLanguageScriptProfile(language);
  const sentenceLike = SENTENCE_OR_SERVICE_GENERATORS.has(generatorId);
  let strategies = ALL;
  switch (family) {
    case 'business':
    case 'innovation':
    case 'tech': strategies = BRAND; break;
    case 'writing':
    case 'culture':
    case 'lifestyle':
    case 'places': strategies = STORY; break;
    case 'creatures':
    case 'characters':
    case 'fantasy':
    case 'scifi': strategies = ALL; break;
    default: strategies = sentenceLike ? STORY : ALL;
  }
  if (script.requiresWholeTokens) {
    strategies = strategies.filter((strategy) => strategy === 'phonetic_harmony' || strategy === 'symbolic_evocative' || strategy === 'epic_compound');
  }
  return {
    strategies,
    allowLocalizedTitles: !sentenceLike && ['fantasy', 'characters', 'creatures', 'places', 'scifi'].includes(family),
    allowGenderMorphology: !script.requiresWholeTokens && ['fantasy', 'characters', 'creatures'].includes(family),
    preferWholeWords: script.requiresWholeTokens || sentenceLike || ['writing', 'culture', 'lifestyle'].includes(family),
  };
}
export function getScriptsInText(value: string): ScriptFamily[] {
  const checks: Array<[ScriptFamily, RegExp]> = [
    ['Latin', /\p{Script=Latin}/u], ['Arabic', /\p{Script=Arabic}/u], ['Hebrew', /\p{Script=Hebrew}/u],
    ['Cyrillic', /\p{Script=Cyrillic}/u], ['Greek', /\p{Script=Greek}/u], ['Devanagari', /\p{Script=Devanagari}/u],
    ['Bengali', /\p{Script=Bengali}/u], ['Thai', /\p{Script=Thai}/u], ['Hangul', /\p{Script=Hangul}/u],
    ['Han', /\p{Script=Han}/u], ['Hiragana', /\p{Script=Hiragana}/u], ['Katakana', /\p{Script=Katakana}/u],
  ];
  const found = new Set<ScriptFamily>();
  for (const char of Array.from(value.normalize('NFC'))) {
    if (!/\p{L}/u.test(char)) continue;
    for (const [script, regex] of checks) if (regex.test(char)) found.add(script);
  }
  return [...found];
}
export function isKeywordCompatibleWithLanguage(keyword: string, language: GenLanguageCode): boolean {
  if (language === 'auto' || !keyword.trim()) return true;
  const expected = getLanguageScriptProfile(language);
  const observed = getScriptsInText(keyword);
  if (!observed.length || !expected.scripts.length) return true;
  if (observed.every((script) => expected.scripts.includes(script))) return true;
  return expected.allowLatinTransliteration && observed.length === 1 && observed[0] === 'Latin';
}
