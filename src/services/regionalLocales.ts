import type { GenLanguageCode } from '../types';

export type RegionalLocaleTag =
  | 'en-US' | 'en-GB'
  | 'fr-FR' | 'fr-CA'
  | 'pt-BR' | 'pt-PT'
  | 'es-ES' | 'es-MX'
  | 'zh-Hans' | 'zh-Hant';

export interface RegionalLocaleProfile {
  tag: RegionalLocaleTag;
  language: GenLanguageCode;
  region: string;
  script?: 'Hans' | 'Hant';
  /** Parent language used when a regional resource is not yet available. */
  fallback: GenLanguageCode;
  /** Explicitly lists dimensions that still need region-specific data. */
  regionalDataStatus: 'metadata-only';
  pendingDimensions: readonly ('lexicon' | 'spelling' | 'grammar' | 'names' | 'cultural-review')[];
}

const PENDING = ['lexicon', 'spelling', 'grammar', 'names', 'cultural-review'] as const;

/**
 * Locale registry foundation. These tags identify real regional variants but
 * deliberately do not claim that regional vocabularies or generation rules
 * have already been authored. The parent language is an explicit fallback.
 */
export const REGIONAL_LOCALES: Record<RegionalLocaleTag, RegionalLocaleProfile> = {
  'en-US': { tag: 'en-US', language: 'en', region: 'US', fallback: 'en', regionalDataStatus: 'metadata-only', pendingDimensions: PENDING },
  'en-GB': { tag: 'en-GB', language: 'en', region: 'GB', fallback: 'en', regionalDataStatus: 'metadata-only', pendingDimensions: PENDING },
  'fr-FR': { tag: 'fr-FR', language: 'fr', region: 'FR', fallback: 'fr', regionalDataStatus: 'metadata-only', pendingDimensions: PENDING },
  'fr-CA': { tag: 'fr-CA', language: 'fr', region: 'CA', fallback: 'fr', regionalDataStatus: 'metadata-only', pendingDimensions: PENDING },
  'pt-BR': { tag: 'pt-BR', language: 'pt', region: 'BR', fallback: 'pt', regionalDataStatus: 'metadata-only', pendingDimensions: PENDING },
  'pt-PT': { tag: 'pt-PT', language: 'pt', region: 'PT', fallback: 'pt', regionalDataStatus: 'metadata-only', pendingDimensions: PENDING },
  'es-ES': { tag: 'es-ES', language: 'es', region: 'ES', fallback: 'es', regionalDataStatus: 'metadata-only', pendingDimensions: PENDING },
  'es-MX': { tag: 'es-MX', language: 'es', region: 'MX', fallback: 'es', regionalDataStatus: 'metadata-only', pendingDimensions: PENDING },
  'zh-Hans': { tag: 'zh-Hans', language: 'zh', region: 'CN', script: 'Hans', fallback: 'zh', regionalDataStatus: 'metadata-only', pendingDimensions: PENDING },
  'zh-Hant': { tag: 'zh-Hant', language: 'zh', region: 'TW', script: 'Hant', fallback: 'zh', regionalDataStatus: 'metadata-only', pendingDimensions: PENDING },
};

function normalizeTag(input: string): string {
  const parts = String(input ?? '').trim().replace(/_/g, '-').split('-').filter(Boolean);
  if (!parts.length) return '';
  return [parts[0].toLowerCase(), ...parts.slice(1).map((part) => part.length === 4
    ? part[0].toUpperCase() + part.slice(1).toLowerCase()
    : part.toUpperCase())].join('-');
}

export function getRegionalLocaleProfile(input: string): RegionalLocaleProfile | undefined {
  const normalized = normalizeTag(input);
  return Object.prototype.hasOwnProperty.call(REGIONAL_LOCALES, normalized)
    ? REGIONAL_LOCALES[normalized as RegionalLocaleTag]
    : undefined;
}

/** Returns the base generation language without silently inventing a region. */
export function resolveGenerationLanguage(input: string): GenLanguageCode | undefined {
  const regional = getRegionalLocaleProfile(input);
  if (regional) return regional.language;
  const normalized = normalizeTag(input);
  if (/^[a-z]{2,3}$/.test(normalized)) return normalized as GenLanguageCode;
  return undefined;
}
