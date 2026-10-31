/**
 * Diversity-aware candidate ranking.
 *
 * The generator still scores linguistic plausibility first. This module only reorders
 * candidates with a greedy, diminishing-return penalty for repeated construction patterns.
 * It is script-safe: Unicode code points are used and Latin vowel heuristics are optional.
 */
export interface DiversityCandidate {
  name: string;
  score: number;
  strategy: string;
}

export interface NameDiversityProfile {
  onset: string;
  ending: string;
  structure: string;
  phoneticFamily: string;
}

const points = (value: string): string[] => Array.from(value.normalize('NFC'));
const key = (value: string): string =>
  value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim();

export function getNameDiversityProfile(name: string): NameDiversityProfile {
  const normalized = key(name);
  const tokens = normalized.split(/\s+/u).filter(Boolean);
  const first = points(tokens[0] || '');
  const last = points(tokens[tokens.length - 1] || '');
  const letters = points(normalized.replace(/\s/gu, ''));
  const latin = /\p{Script=Latin}/u.test(normalized);
  const vowelCount = latin ? (normalized.match(/[aeiouyà-ÿ]/giu) || []).length : 0;
  const letterCount = Math.max(1, letters.length);
  const ratio = vowelCount / letterCount;
  const phoneticFamily = !latin
    ? 'non-latin'
    : ratio < 0.28
      ? 'consonant-dense'
      : ratio > 0.55
        ? 'vowel-rich'
        : 'balanced';
  return {
    onset: first.slice(0, Math.min(2, first.length)).join(''),
    ending: last.slice(-Math.min(2, last.length)).join(''),
    structure: tokens.length === 1 ? 'single' : tokens.length === 2 ? 'double' : 'phrase',
    phoneticFamily,
  };
}

/**
 * Greedy max-marginal ranking. Repetition penalties diminish after the first use,
 * so variety is encouraged rather than enforced as a brittle hard rule.
 */
export function selectDiverseCandidates<T extends DiversityCandidate>(
  candidates: T[],
  limit = candidates.length
): T[] {
  const remaining = candidates.map((candidate) => ({ candidate }));
  const selected: T[] = [];
  const strategyCounts = new Map<string, number>();
  const onsetCounts = new Map<string, number>();
  const endingCounts = new Map<string, number>();
  const structureCounts = new Map<string, number>();
  const familyCounts = new Map<string, number>();

  const penalty = (counts: Map<string, number>, value: string, weight: number): number => {
    if (!value) return 0;
    const count = counts.get(value) || 0;
    return count === 0 ? 0 : weight / Math.sqrt(count);
  };

  while (remaining.length && selected.length < Math.max(0, limit)) {
    let bestIndex = 0;
    let bestUtility = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i].candidate;
      const profile = getNameDiversityProfile(candidate.name);
      const utility =
        candidate.score -
        penalty(strategyCounts, candidate.strategy, 5) -
        penalty(onsetCounts, profile.onset, 4) -
        penalty(endingCounts, profile.ending, 4) -
        penalty(structureCounts, profile.structure, 2) -
        penalty(familyCounts, profile.phoneticFamily, 2.5);
      if (utility > bestUtility) {
        bestUtility = utility;
        bestIndex = i;
      }
    }

    const [{ candidate }] = remaining.splice(bestIndex, 1);
    selected.push(candidate);
    const profile = getNameDiversityProfile(candidate.name);
    const increment = (counts: Map<string, number>, value: string) => {
      if (value) counts.set(value, (counts.get(value) || 0) + 1);
    };
    increment(strategyCounts, candidate.strategy);
    increment(onsetCounts, profile.onset);
    increment(endingCounts, profile.ending);
    increment(structureCounts, profile.structure);
    increment(familyCounts, profile.phoneticFamily);
  }

  return selected;
}
