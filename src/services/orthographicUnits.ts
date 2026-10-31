import type { GenLanguageCode } from '../types';

export type OrthographicUnitKind =
  | 'grapheme-cluster'
  | 'hangul-syllable-block'
  | 'han-character'
  | 'kana-grapheme'
  | 'indic-orthographic-cluster'
  | 'thai-orthographic-cluster';

export interface OrthographicProfile {
  language: GenLanguageCode;
  unit: OrthographicUnitKind;
  generation: 'whole-token';
  normalization: 'NFC';
  note: string;
}

/**
 * Orthographic segmentation is deliberately not phonetic transcription.
 * These profiles describe safe text units for counting/validation only.
 * Non-Latin generation remains whole-token until language-specific phoneme,
 * tone, mora and morphology inventories have been sourced and reviewed.
 */
const PROFILES: Partial<Record<GenLanguageCode, OrthographicProfile>> = {
  ja: { language: 'ja', unit: 'kana-grapheme', generation: 'whole-token', normalization: 'NFC', note: 'Kana grapheme clusters; kanji compounds stay intact' },
  ko: { language: 'ko', unit: 'hangul-syllable-block', generation: 'whole-token', normalization: 'NFC', note: 'Precomposed Hangul syllable blocks; no jamo slicing' },
  zh: { language: 'zh', unit: 'han-character', generation: 'whole-token', normalization: 'NFC', note: 'Han characters; no Pinyin-based synthesis' },
  ru: { language: 'ru', unit: 'grapheme-cluster', generation: 'whole-token', normalization: 'NFC', note: 'Cyrillic grapheme clusters; morphology is not inferred' },
  uk: { language: 'uk', unit: 'grapheme-cluster', generation: 'whole-token', normalization: 'NFC', note: 'Ukrainian Cyrillic grapheme clusters; morphology is not inferred' },
  el: { language: 'el', unit: 'grapheme-cluster', generation: 'whole-token', normalization: 'NFC', note: 'Greek grapheme clusters, including tonos and dialytika marks' },
  he: { language: 'he', unit: 'grapheme-cluster', generation: 'whole-token', normalization: 'NFC', note: 'Hebrew grapheme clusters; niqqud remains attached' },
  hi: { language: 'hi', unit: 'indic-orthographic-cluster', generation: 'whole-token', normalization: 'NFC', note: 'Devanagari orthographic clusters; no Latin phoneme slicing' },
  bn: { language: 'bn', unit: 'indic-orthographic-cluster', generation: 'whole-token', normalization: 'NFC', note: 'Bengali orthographic clusters; no Latin phoneme slicing' },
  th: { language: 'th', unit: 'thai-orthographic-cluster', generation: 'whole-token', normalization: 'NFC', note: 'Thai orthographic clusters; tone marks remain attached' },
};

export function getOrthographicProfile(language: GenLanguageCode): OrthographicProfile | undefined {
  return PROFILES[language];
}

export function requiresWholeTokenGeneration(language: GenLanguageCode): boolean {
  return PROFILES[language]?.generation === 'whole-token';
}

function fallbackGraphemeSplit(value: string): string[] {
  const result: string[] = [];
  for (const point of Array.from(value.normalize('NFC'))) {
    if (!result.length) {
      result.push(point);
      continue;
    }
    const previous = result[result.length - 1];
    // Keep combining marks, variation selectors, ZWJ sequences and virama
    // conjuncts attached when Intl.Segmenter is unavailable.
    if (/\p{M}/u.test(point) || point === '\u200d' || previous.endsWith('\u200d') || /[\u094d\u09cd\u0e3a]$/u.test(previous)) {
      result[result.length - 1] += point;
    } else {
      result.push(point);
    }
  }
  return result;
}

export function splitOrthographicUnits(value: string, language: GenLanguageCode): string[] {
  const normalized = String(value ?? '').normalize('NFC');
  if (!normalized) return [];
  const Segmenter = (Intl as unknown as {
    Segmenter?: new (locale?: string, options?: { granularity: 'grapheme' }) => {
      segment: (input: string) => Iterable<{ segment: string }>;
    };
  }).Segmenter;
  if (Segmenter) {
    const segmenter = new Segmenter(language === 'auto' ? undefined : language, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(normalized), (part) => part.segment);
  }
  return fallbackGraphemeSplit(normalized);
}

export function countOrthographicUnits(value: string, language: GenLanguageCode): number {
  return splitOrthographicUnits(value, language).length;
}
