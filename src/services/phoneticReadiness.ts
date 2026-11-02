import type { GenLanguageCode } from '../types';

export type PhoneticReadiness = 'partial-segmentation' | 'reference-data-required';
export type SpecializedPhoneticPipeline = {
  status: 'experimental';
  generationEnabled: true;
  scope: 'anime-romaji-to-katakana';
  limitations: readonly string[];
};
export interface LanguagePhoneticReadiness {
  language: GenLanguageCode;
  readiness: PhoneticReadiness;
  generationEnabled: false;
  specializedPipelines?: readonly SpecializedPhoneticPipeline[];
  requiredEvidence: readonly ('pronunciation-lexicon' | 'syllabification' | 'stress' | 'tones' | 'phonological-alternations' | 'native-review')[];
  limitation: string;
}

const LATIN_REQUIREMENTS = ['pronunciation-lexicon', 'syllabification', 'stress', 'phonological-alternations', 'native-review'] as const;
const SCRIPT_REQUIREMENTS = ['pronunciation-lexicon', 'syllabification', 'phonological-alternations', 'native-review'] as const;

/**
 * Explicit inventory for the 28 supported natural-language locales.
 * This is a readiness audit, not a pronunciation engine. Existing procedural
 * letter pools must not be mistaken for phoneme inventories.
 */
export const LANGUAGE_PHONETIC_READINESS: Record<string, LanguagePhoneticReadiness> = {
  fr: { language: 'fr', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'French grapheme-to-phoneme rules, liaison, schwa and lexical exceptions are not modelled comprehensively.' },
  en: { language: 'en', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'English spelling is highly irregular; stress and lexical pronunciation references are required.' },
  es: { language: 'es', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Stress, syllable boundaries, dialectal seseo/yeísmo and lexical exceptions need validation.' },
  de: { language: 'de', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Compound boundaries, vowel length, stress and consonant alternations need modelling.' },
  it: { language: 'it', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Stress, open/closed e-o and gemination need lexical and rule coverage.' },
  pt: { language: 'pt', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: [...LATIN_REQUIREMENTS, 'tones'], limitation: 'European/Brazilian vowel reduction, stress and regional pronunciation need separate data.' },
  ar: { language: 'ar', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: ['pronunciation-lexicon', 'syllabification', 'stress', 'phonological-alternations', 'native-review'], limitation: 'Short vowels, dialect, hamza and name-specific vocalization require reliable source data.' },
  tr: { language: 'tr', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Vowel harmony helper exists, but stress, syllabification and exceptions are not fully integrated.' },
  ja: { language: 'ja', readiness: 'partial-segmentation', generationEnabled: false, specializedPipelines: [{ status: 'experimental', generationEnabled: true, scope: 'anime-romaji-to-katakana', limitations: ['Only the Anime generator uses this restricted pipeline.', 'It converts a limited curated romaji vocabulary to katakana; it is not a general Japanese phonetic engine.', 'Kanji readings, pitch accent, lexical authenticity, naturalness and category fit are not certified.', 'Unsupported spellings are rejected rather than partially converted.'] }], requiredEvidence: ['pronunciation-lexicon', 'stress', 'native-review'], limitation: 'General Japanese phonetic generation remains disabled. Mora segmentation is available; kanji readings and pitch accent remain unresolved. A restricted experimental Anime romaji-to-katakana pipeline is separately enabled and is not a general Japanese engine.' },
  ko: { language: 'ko', readiness: 'partial-segmentation', generationEnabled: false, requiredEvidence: ['pronunciation-lexicon', 'phonological-alternations', 'native-review'], limitation: 'Hangul block decomposition exists; liaison, tensification and other sound changes remain unresolved.' },
  zh: { language: 'zh', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: ['pronunciation-lexicon', 'tones', 'native-review'], limitation: 'Character readings, tones and regional Mandarin/Cantonese distinctions require lexical references.' },
  ru: { language: 'ru', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: SCRIPT_REQUIREMENTS, limitation: 'Stress, vowel reduction, palatalization and inflectional alternations need modelling.' },
  hi: { language: 'hi', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: SCRIPT_REQUIREMENTS, limitation: 'Schwa deletion, aspiration, vowel length and lexical readings require references.' },
  nl: { language: 'nl', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Vowel quality, diphthongs and regional pronunciation need references.' },
  pl: { language: 'pl', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Consonant clusters, palatalization and stress exceptions need modelling.' },
  sv: { language: 'sv', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Pitch accent and regional vowel/consonant variation are not modelled.' },
  vi: { language: 'vi', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: ['pronunciation-lexicon', 'tones', 'native-review'], limitation: 'Tone, vowel quality and regional pronunciation require reference data.' },
  id: { language: 'id', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Stress, loanword adaptation and regional pronunciation need validation.' },
  th: { language: 'th', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: ['pronunciation-lexicon', 'syllabification', 'tones', 'native-review'], limitation: 'Tone class, tone rules, vowel length and syllable structure require references.' },
  el: { language: 'el', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: SCRIPT_REQUIREMENTS, limitation: 'Stress, digraphs and modern Greek pronunciation need references.' },
  he: { language: 'he', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: ['pronunciation-lexicon', 'stress', 'native-review'], limitation: 'Unpointed spelling is ambiguous; niqqud and name readings require lexical evidence.' },
  cs: { language: 'cs', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Stress, vowel length and consonant palatalization need validation.' },
  ro: { language: 'ro', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Stress and language-specific values of ă, â, î and ș/ț need modelling.' },
  da: { language: 'da', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Stød and vowel reduction require lexical and phonetic references.' },
  fi: { language: 'fi', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Quantity, gradation and stress rules need integration and exceptions.' },
  uk: { language: 'uk', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: SCRIPT_REQUIREMENTS, limitation: 'Stress and palatalization require Ukrainian-specific references.' },
  bn: { language: 'bn', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: SCRIPT_REQUIREMENTS, limitation: 'Vowel realization, conjuncts and regional pronunciation need references.' },
  nb: { language: 'nb', readiness: 'reference-data-required', generationEnabled: false, requiredEvidence: LATIN_REQUIREMENTS, limitation: 'Written standard variation, pitch accent and dialect pronunciation need references.' },
};

export function getLanguagePhoneticReadiness(language: GenLanguageCode): LanguagePhoneticReadiness | undefined {
  return LANGUAGE_PHONETIC_READINESS[language];
}

export const getPhoneticReadinessSummary = () => {
  const profiles = Object.values(LANGUAGE_PHONETIC_READINESS);
  return {
    totalLanguages: profiles.length,
    partialSegmentation: profiles.filter((profile) => profile.readiness === 'partial-segmentation').length,
    referenceDataRequired: profiles.filter((profile) => profile.readiness === 'reference-data-required').length,
    generationEnabled: profiles.filter((profile) => profile.generationEnabled).length,
  };
};
