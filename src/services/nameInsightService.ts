import { NameInsightInput, NameInsightResult, NameInsightCategory, NameInsightMetrics } from '../types/nameInsight';
import {
  isNameInsightSupported,
  NAME_INSIGHT_ALTERNATIVE_SUFFIXES,
  NAME_INSIGHT_CATEGORY_LABELS,
  NAME_INSIGHT_PALETTES,
  NAME_INSIGHT_SLOGAN_TEMPLATES,
  NAME_INSIGHT_READING_TEMPLATES,
  NAME_INSIGHT_CATEGORY_READING_TEMPLATES,
  resolveNameInsightCategory
} from '../data/nameInsightData';

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getGraphemeClusters(value: string): string[] {
  type GraphemeSegmenterConstructor = new (
    locales?: string | string[],
    options?: { granularity: 'grapheme' }
  ) => { segment(input: string): Iterable<{ segment: string }> };

  const Segmenter = (Intl as unknown as { Segmenter?: GraphemeSegmenterConstructor }).Segmenter;
  if (!Segmenter) return Array.from(value);
  return Array.from(new Segmenter(undefined, { granularity: 'grapheme' }).segment(value), (part) => part.segment);
}

function countWords(value: string, language: string): number | null {
  if (!value) return 0;

  type WordSegmenterConstructor = new (
    locales?: string | string[],
    options?: { granularity: 'word' }
  ) => { segment(input: string): Iterable<{ segment: string; isWordLike?: boolean }> };

  const Segmenter = (Intl as unknown as { Segmenter?: WordSegmenterConstructor }).Segmenter;
  if (!Segmenter) {
    // Whitespace splitting is not a valid word-boundary fallback for scripts
    // commonly written without spaces. Mark the metric unavailable instead
    // of presenting a misleading count in older runtimes.
    const baseLanguage = language.toLowerCase().split('-')[0];
    if (['ja', 'zh', 'th'].includes(baseLanguage)) return null;
    return value.split(/\s+/u).filter(Boolean).length;
  }

  return Array.from(
    new Segmenter(language, { granularity: 'word' }).segment(value)
  ).filter((part) => part.isWordLike).length;
}

function countRepeatedCharacters(name: string, language: string): number {
  const characters = getGraphemeClusters(name);
  let repeated = 0;
  for (let index = 1; index < characters.length; index += 1) {
    const current = characters[index];
    const previous = characters[index - 1];
    if (/\p{L}/u.test(current) && /\p{L}/u.test(previous)
      && current.toLocaleLowerCase(language) === previous.toLocaleLowerCase(language)) {
      repeated += 1;
    }
  }
  return repeated;
}

function getWritingSystem(character: string): string {
  if (/\p{Script=Latin}/u.test(character)) return 'latin';
  if (/\p{Script=Arabic}/u.test(character)) return 'arabic';
  if (/\p{Script=Cyrillic}/u.test(character)) return 'cyrillic';
  if (/\p{Script=Greek}/u.test(character)) return 'greek';
  if (/\p{Script=Hebrew}/u.test(character)) return 'hebrew';
  if (/\p{Script=Devanagari}/u.test(character)) return 'devanagari';
  if (/\p{Script=Han}/u.test(character)) return 'han';
  if (/\p{Script=Hiragana}/u.test(character)) return 'hiragana';
  if (/\p{Script=Katakana}/u.test(character)) return 'katakana';
  if (/\p{Script=Hangul}/u.test(character)) return 'hangul';
  if (/\p{Script=Thai}/u.test(character)) return 'thai';
  if (/\p{Script=Bengali}/u.test(character)) return 'bengali';
  if (/\p{Script=Armenian}/u.test(character)) return 'armenian';
  if (/\p{Script=Georgian}/u.test(character)) return 'georgian';
  if (/\p{Script=Ethiopic}/u.test(character)) return 'ethiopic';
  if (/\p{Script=Tamil}/u.test(character)) return 'tamil';
  if (/\p{Script=Telugu}/u.test(character)) return 'telugu';
  if (/\p{Script=Gurmukhi}/u.test(character)) return 'gurmukhi';
  if (/\p{Script=Gujarati}/u.test(character)) return 'gujarati';
  if (/\p{Script=Kannada}/u.test(character)) return 'kannada';
  if (/\p{Script=Malayalam}/u.test(character)) return 'malayalam';
  if (/\p{Script=Sinhala}/u.test(character)) return 'sinhala';
  if (/\p{Script=Lao}/u.test(character)) return 'lao';
  if (/\p{Script=Myanmar}/u.test(character)) return 'myanmar';
  if (/\p{Script=Khmer}/u.test(character)) return 'khmer';
  return 'other';
}

function hasMixedWritingSystems(writingSystems: string[], language: string): boolean {
  if (writingSystems.length <= 1) return false;

  // Japanese conventionally combines kanji (Han), hiragana, and katakana.
  // Treat that expected combination as one language writing system rather
  // than flagging an ordinary Japanese name as an unusual script mixture.
  if (language.toLowerCase().startsWith('ja')) {
    const japaneseScripts = new Set(['han', 'hiragana', 'katakana']);
    return writingSystems.some((script) => !japaneseScripts.has(script));
  }

  return true;
}

function analyzeStructure(name: string, language: string): NameInsightMetrics {
  const normalized = name.normalize('NFC').trim().replace(/\s+/g, ' ');
  const codePoints = Array.from(normalized);
  // Count user-perceived letter clusters, not individual code points. This keeps
  // combining marks and Indic conjuncts from inflating the displayed name length.
  const characters = getGraphemeClusters(normalized).filter((character) => /\p{L}/u.test(character));
  const latinLetters = characters.filter((character) => getWritingSystem(character) === 'latin');
  const vowels = latinLetters.filter((character) => {
    const baseLetter = character.normalize('NFD').replace(/\p{M}/gu, '');
    return /^[aeiouy]$/i.test(baseLetter);
  }).length;
  const writingSystems = Array.from(new Set(characters.map(getWritingSystem)));
  return {
    characterCount: characters.length,
    wordCount: countWords(normalized, language),
    repeatedCharacterCount: countRepeatedCharacters(normalized, language),
    // A vowel ratio is only meaningful for names written entirely with Latin letters.
    latinVowelShare: characters.length > 0 && latinLetters.length === characters.length
      ? Math.round((vowels / characters.length) * 100)
      : null,
    digitCount: codePoints.filter((character) => /\p{N}/u.test(character)).length,
    symbolCount: codePoints.filter((character) => !/[\p{L}\p{N}\s]/u.test(character)).length,
    uppercaseCount: characters.filter((character) => /\p{Lu}/u.test(character)).length,
    hasMixedScripts: hasMixedWritingSystems(writingSystems, language),
    writingSystems
  };
}

function uniqueAlternatives(name: string, category: NameInsightCategory): string[] {
  const base = name.trim().replace(/\s+/g, ' ');
  if (!base) return [];
  const suffixes = NAME_INSIGHT_ALTERNATIVE_SUFFIXES[category];
  return suffixes.map((suffix) => `${base} ${suffix}`);
}

function choosePalette(hash: number, category: NameInsightCategory): [string, string, string] {
  const categoryOrder: NameInsightCategory[] = [
    'brand', 'character', 'rpg', 'game', 'science-fiction', 'science', 'project', 'place', 'general'
  ];
  const categoryOffset = categoryOrder.indexOf(category) * 3;
  return NAME_INSIGHT_PALETTES[(hash + categoryOffset) % NAME_INSIGHT_PALETTES.length];
}

/**
 * Creates a reproducible creative reading from the name's visible structure and
 * generator metadata. Structural measurements are descriptive heuristics, not
 * linguistic, historical, or etymological claims.
 */
export function createNameInsight(input: NameInsightInput): NameInsightResult | null {
  if (!isNameInsightSupported(input.generatorId) || !input.name.trim()) return null;

  const category = resolveNameInsightCategory(input.generatorId);
  const normalizedName = input.name.normalize('NFC').trim().replace(/\s+/g, ' ');
  const hash = stableHash(`${input.generatorId}|${normalizedName}|${input.style}`);
  const metrics = analyzeStructure(normalizedName, input.language ?? 'en');
  const palette = choosePalette(hash, category);
  const sloganTone = category === 'brand' ? 'identity' : ['character', 'rpg', 'place'].includes(category) ? 'world' : 'innovation';
  const languageTemplates = NAME_INSIGHT_SLOGAN_TEMPLATES[input.language ?? 'en'] ?? NAME_INSIGHT_SLOGAN_TEMPLATES.en;
  const slogan = languageTemplates[sloganTone].replace('{name}', normalizedName);
  const language = input.language ?? 'en';
  const readingTemplates = NAME_INSIGHT_READING_TEMPLATES[language] ?? NAME_INSIGHT_READING_TEMPLATES.en;
  const readingBand = metrics.characterCount <= 8 ? 'compact' : metrics.characterCount <= 15 ? 'balanced' : 'extended';
  const categoryTemplate = NAME_INSIGHT_CATEGORY_READING_TEMPLATES[language]?.[category];
  const readingTemplate = categoryTemplate ?? readingTemplates[readingBand];
  const creativeReading = readingTemplate
    .replace('{context}', input.generatorLabel ?? NAME_INSIGHT_CATEGORY_LABELS[category])
    .replace('{name}', normalizedName)
    .replace('{count}', String(metrics.characterCount));

  return {
    category,
    categoryLabel: NAME_INSIGHT_CATEGORY_LABELS[category],
    creativeReading,
    contextDescription: input.description,
    slogan,
    palette,
    alternatives: uniqueAlternatives(normalizedName, category),
    metrics,
    isCreativeOnly: true
  };
}

export { isNameInsightSupported };
