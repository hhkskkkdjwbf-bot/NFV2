import type { GenLanguageCode } from '../types';

export type SemanticRiskLevel = 'review' | 'high';
export interface ReviewedRiskTerm {
  id: string;
  language: GenLanguageCode;
  term: string;
  level: SemanticRiskLevel;
  meaning: string;
  sourceUrl: string;
  sourceLicense: string;
  reviewer: string;
  reviewedAt: string;
  /** Must be true before a term can affect generated output. */
  humanVerified: boolean;
}
export type SemanticScreenStatus = 'blocked' | 'needs-review' | 'not-screened' | 'no-match';
export interface SemanticScreenResult {
  status: SemanticScreenStatus;
  matchedTermIds: string[];
  explanation: string;
}

function normalizeForLookup(value: string, language: GenLanguageCode): string {
  let normalized = String(value ?? '').normalize('NFKC').trim();
  try {
    normalized = normalized.toLocaleLowerCase(language === 'auto' ? undefined : language);
  } catch {
    normalized = normalized.toLowerCase();
  }
  return normalized.replace(/[’‘]/g, "'").replace(/\s+/g, ' ');
}

function containsWholeTerm(name: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, 'u');
  return expression.test(name);
}

/**
 * Screens against a reviewed, licensed lexicon supplied by the caller.
 * No bundled profanity list is claimed: an empty/unavailable lexicon returns
 * not-screened, never "safe". Only high-risk human-verified entries block.
 */
export function screenNameSemantics(
  name: string,
  language: GenLanguageCode,
  lexicon: readonly ReviewedRiskTerm[]
): SemanticScreenResult {
  const candidate = normalizeForLookup(name, language);
  if (!candidate) return { status: 'not-screened', matchedTermIds: [], explanation: 'Empty input cannot be screened.' };

  const eligible = lexicon.filter((entry) =>
    entry.language === language &&
    entry.humanVerified &&
    /^https:\/\//.test(entry.sourceUrl) &&
    Boolean(entry.sourceLicense.trim() && entry.reviewer.trim() && entry.reviewedAt.trim())
  );
  if (!eligible.length) {
    return { status: 'not-screened', matchedTermIds: [], explanation: 'No reviewed, licensed semantic-risk lexicon is available for this language.' };
  }

  const matches = eligible.filter((entry) =>
    containsWholeTerm(candidate, normalizeForLookup(entry.term, language))
  );
  if (!matches.length) {
    return { status: 'no-match', matchedTermIds: [], explanation: 'No match in the available reviewed lexicon; this is not a guarantee of cultural safety.' };
  }

  const high = matches.some((entry) => entry.level === 'high');
  return {
    status: high ? 'blocked' : 'needs-review',
    matchedTermIds: matches.map((entry) => entry.id),
    explanation: high
      ? 'A human-verified high-risk term matched; suppress this candidate pending moderation.'
      : 'A reviewed term matched; request contextual human review before use.',
  };
}
