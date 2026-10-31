import { splitOrthographicUnits } from './orthographicUnits';
import type { GenLanguageCode } from '../types';

export type PhoneticModelStatus = 'mora-segmentation' | 'hangul-syllable-structure' | 'reference-data-required';
export interface PhoneticModelProfile {
  language: GenLanguageCode;
  status: PhoneticModelStatus;
  generationEnabled: false;
  note: string;
}

/**
 * Readiness is explicit: segmentation helpers are not complete pronunciation
 * models and are not used to invent new names from phonemes.
 */
export const PHONETIC_MODEL_PROFILES: Partial<Record<GenLanguageCode, PhoneticModelProfile>> = {
  ja: { language: 'ja', status: 'mora-segmentation', generationEnabled: false, note: 'Kana mora segmentation; kanji readings require lexical reading data' },
  ko: { language: 'ko', status: 'hangul-syllable-structure', generationEnabled: false, note: 'Unicode Hangul onset/nucleus/coda decomposition; phonological alternations not yet modelled' },
  zh: { language: 'zh', status: 'reference-data-required', generationEnabled: false, note: 'Requires a licensed pronunciation lexicon with pinyin/tones and character readings' },
  ru: { language: 'ru', status: 'reference-data-required', generationEnabled: false, note: 'Requires stress, reduction and palatalization data' },
  uk: { language: 'uk', status: 'reference-data-required', generationEnabled: false, note: 'Requires stress and language-specific palatalization data' },
  el: { language: 'el', status: 'reference-data-required', generationEnabled: false, note: 'Requires modern Greek pronunciation and stress data' },
  he: { language: 'he', status: 'reference-data-required', generationEnabled: false, note: 'Requires vowel-pointing/reading data; unpointed text is ambiguous' },
  hi: { language: 'hi', status: 'reference-data-required', generationEnabled: false, note: 'Requires schwa deletion, aspiration and vowel-length modelling' },
  bn: { language: 'bn', status: 'reference-data-required', generationEnabled: false, note: 'Requires Bengali pronunciation and regional variation data' },
  th: { language: 'th', status: 'reference-data-required', generationEnabled: false, note: 'Requires tone, syllable class and vowel-length modelling' },
};

const SMALL_KANA = new Set(Array.from('ぁぃぅぇぉゃゅょゎァィゥェォャュョヮ'));
export function splitJapaneseMora(value: string): string[] {
  const graphemes = splitOrthographicUnits(value, 'ja');
  const morae: string[] = [];
  for (const unit of graphemes) {
    if (SMALL_KANA.has(unit) && morae.length > 0) {
      morae[morae.length - 1] += unit;
    } else {
      morae.push(unit);
    }
  }
  return morae;
}

const HANGUL_LEADS = Array.from('ᄀᄁᄂᄃᄄᄅᄆᄇᄈᄉᄊᄋᄌᄍᄎᄏᄐᄑᄒ');
const HANGUL_VOWELS = Array.from('ᅡᅢᅣᅤᅥᅦᅧᅨᅩᅪᅫᅬᅭᅮᅯᅰᅱᅲᅳᅴᅵ');
const HANGUL_TRAILS = ['', ...Array.from('ᆨᆩᆪᆫᆬᆭᆮᆯᆰᆱᆲᆳᆴᆵᆶᆷᆸᆹᆺᆻᆼᆽᆾᆿᇀᇁᇂ')];

export interface HangulSyllableParts { onset: string; nucleus: string; coda: string; }
export function decomposeHangulSyllable(value: string): HangulSyllableParts | null {
  const points = Array.from(String(value ?? '').normalize('NFC'));
  if (points.length !== 1) return null;
  const code = points[0].codePointAt(0) ?? 0;
  const index = code - 0xac00;
  if (index < 0 || index >= 11172) return null;
  const leadIndex = Math.floor(index / 588);
  const vowelIndex = Math.floor((index % 588) / 28);
  const trailIndex = index % 28;
  return {
    onset: HANGUL_LEADS[leadIndex],
    nucleus: HANGUL_VOWELS[vowelIndex],
    coda: HANGUL_TRAILS[trailIndex],
  };
}

export function getPhoneticModelProfile(language: GenLanguageCode): PhoneticModelProfile | undefined {
  return PHONETIC_MODEL_PROFILES[language];
}
