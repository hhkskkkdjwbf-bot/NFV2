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
 * Registry of regional variants. It intentionally does not claim that
 * regional vocabularies or generation rules have already been authored.
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

interface ParsedLocale {
  language: string;
  script?: string;
  region?: string;
}

/**
 * Parses the language/script/region core of a BCP 47 tag. Unicode extensions
 * and private-use subtags are ignored for lookup, not copied into app data.
 * Malformed tags are rejected instead of being partially guessed.
 */
function parseLocale(input: string): ParsedLocale | undefined {
  const raw = String(input ?? '').trim().replace(/_/g, '-');
  if (!raw) return undefined;
  const parts = raw.split('-');
  if (parts.some((part) => !part)) return undefined;

  const language = parts[0].toLowerCase();
  if (!/^[a-z]{2,3}$/i.test(language)) return undefined;

  let script: string | undefined;
  let region: string | undefined;
  for (let index = 1; index < parts.length; index += 1) {
    const part = parts[index];
    // BCP 47 extension/private-use sequences do not affect the locale lookup.
    if (/^[0-9a-wy-z]$/i.test(part)) break;
    if (!script && /^[a-z]{4}$/i.test(part)) {
      script = part[0].toUpperCase() + part.slice(1).toLowerCase();
      continue;
    }
    if (!region && (/^[a-z]{2}$/i.test(part) || /^\d{3}$/.test(part))) {
      region = part.toUpperCase();
      continue;
    }
    // Variants are valid BCP 47 subtags but are irrelevant to this registry.
    if (/^(?:[a-z0-9]{5,8}|\d[a-z0-9]{3})$/i.test(part)) continue;
    return undefined;
  }
  return { language, script, region };
}

export function getRegionalLocaleProfile(input: string): RegionalLocaleProfile | undefined {
  const parsed = parseLocale(input);
  if (!parsed) return undefined;

  if (parsed.language === 'zh') {
    const script = parsed.script
      ?? (['CN', 'SG'].includes(parsed.region ?? '') ? 'Hans'
        : ['TW', 'HK', 'MO'].includes(parsed.region ?? '') ? 'Hant' : undefined);
    if (script === 'Hans' || script === 'Hant') {
      return REGIONAL_LOCALES[`zh-${script}`];
    }
  }

  if (parsed.region) {
    const tag = `${parsed.language}-${parsed.region}`;
    if (Object.prototype.hasOwnProperty.call(REGIONAL_LOCALES, tag)) {
      return REGIONAL_LOCALES[tag as RegionalLocaleTag];
    }
  }
  return undefined;
}

/**
 * Resolves a supported language from a BCP 47 locale. Regional differences
 * are retained by getRegionalLocaleProfile; this function returns only the
 * base generation language and never fabricates a regional profile.
 */
export function resolveGenerationLanguage(input: string): GenLanguageCode | undefined {
  const parsed = parseLocale(input);
  if (!parsed) return undefined;
  const regional = getRegionalLocaleProfile(input);
  if (regional) return regional.language;
  return parsed.language as GenLanguageCode;
}
