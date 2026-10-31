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

const NO_SPACE_SEGMENTATION_LANGUAGES = new Set<GenLanguageCode>(['ja', 'zh', 'th']);

function normalizeForLookup(value: string, language: GenLanguageCode): string {
  let normalized = String(value ?? '').normalize('NFKC').trim();
  try {
    normalized = normalized.toLocaleLowerCase(language === 'auto' ? undefined : language);
  } catch {
    normalized = normalized.toLowerCase();
  }
  return normalized.replace(/[’‘]/g, "'").replace(/\s+/g, ' ');
}

function isValidReviewedEntry(entry: ReviewedRiskTerm): boolean {
  if (!entry || typeof entry !== 'object') return false;
  const term = normalizeForLookup(entry.term, entry.language);
  const reviewedAt = String(entry.reviewedAt ?? '');
  const dateIsValid = /^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)
    && Number.isFinite(Date.parse(reviewedAt))
    && new Date(reviewedAt).toISOString().slice(0, 10) === reviewedAt;

  return Boolean(
    String(entry.id ?? '').trim()
    && term
    && /\p{L}/u.test(term)
    && (entry.level === 'review' || entry.level === 'high')
    && String(entry.meaning ?? '').trim()
    && /^https:\/\//.test(String(entry.sourceUrl ?? ''))
    && String(entry.sourceLicense ?? '').trim()
    && String(entry.reviewer ?? '').trim()
    && dateIsValid
    && entry.humanVerified === true
  );
}

function containsWholeTerm(name: string, term: string, language: GenLanguageCode): boolean {
  if (!name || !term) return false;

  // Japanese, Chinese and Thai do not consistently separate words with spaces.
  // A substring match is intentionally conservative: it requests review rather
  // than claiming that the whole candidate has the matched meaning.
  if (NO_SPACE_SEGMENTATION_LANGUAGES.has(language)) return name.includes(term);

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp('(^|[^\\p{L}\\p{M}\\p{N}])' + escaped + '($|[^\\p{L}\\p{M}\\p{N}])', 'u');
  return expression.test(name);
}

/**
 * Screens against a reviewed, licensed lexicon supplied by the caller.
 * Invalid or incomplete entries are ignored. An empty/unavailable lexicon
 * returns not-screened, never "safe". A match in scripts without reliable
 * whitespace segmentation is a review signal, not a semantic conclusion.
 */
export function screenNameSemantics(
  name: string,
  language: GenLanguageCode,
  lexicon: readonly ReviewedRiskTerm[]
): SemanticScreenResult {
  const candidate = normalizeForLookup(name, language);
  if (!candidate) {
    return { status: 'not-screened', matchedTermIds: [], explanation: 'Empty input cannot be screened.' };
  }

  const eligible = lexicon.filter((entry) =>
    isValidReviewedEntry(entry) && entry.language === language
  );
  if (!eligible.length) {
    return {
      status: 'not-screened',
      matchedTermIds: [],
      explanation: 'No complete, human-verified, licensed semantic-risk entry is available for this language.',
    };
  }

  const matches = eligible.filter((entry) =>
    containsWholeTerm(candidate, normalizeForLookup(entry.term, language), language)
  );
  if (!matches.length) {
    return {
      status: 'no-match',
      matchedTermIds: [],
      explanation: 'No match in the available reviewed lexicon; this is not a guarantee of cultural safety.',
    };
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
