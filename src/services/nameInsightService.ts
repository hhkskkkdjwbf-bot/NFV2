import { NameInsightInput, NameInsightResult, NameInsightCategory, NameInsightMetrics } from '../types/nameInsight';
import {
  isNameInsightSupported,
  NAME_INSIGHT_ALTERNATIVE_SUFFIXES,
  NAME_INSIGHT_CATEGORY_LABELS,
  NAME_INSIGHT_PALETTES,
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

function countRepeatedCharacters(characters: string[]): number {
  let repeated = 0;
  for (let index = 1; index < characters.length; index += 1) {
    if (characters[index].toLocaleLowerCase() === characters[index - 1].toLocaleLowerCase()) {
      repeated += 1;
    }
  }
  return repeated;
}

function analyzeStructure(name: string): NameInsightMetrics {
  const normalized = name.trim().replace(/\s+/g, ' ');
  const characters = Array.from(normalized).filter((character) => /\p{L}/u.test(character));
  const latinLetters = characters.filter((character) => /[a-z]/i.test(character));
  const vowels = latinLetters.filter((character) => /[aeiouy]/i.test(character)).length;
  return {
    characterCount: characters.length,
    wordCount: normalized ? normalized.split(' ').filter(Boolean).length : 0,
    repeatedCharacterCount: countRepeatedCharacters(characters),
    // A vowel ratio is only meaningful for names written entirely with Latin letters.
    latinVowelShare: characters.length > 0 && latinLetters.length === characters.length
      ? Math.round((vowels / characters.length) * 100)
      : null
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
  const normalizedName = input.name.trim().replace(/\s+/g, ' ');
  const hash = stableHash(`${input.generatorId}|${normalizedName}|${input.style}`);
  const metrics = analyzeStructure(normalizedName);
  const palette = choosePalette(hash, category);

  const providedStrengths = input.strengths?.filter(Boolean) ?? [];
  const providedWatchouts = input.watchouts?.filter(Boolean) ?? [];
  const strengths = providedStrengths.length
    ? providedStrengths
    : [metrics.wordCount === 1
      ? 'Single-word structure is easy to scan'
      : 'Multi-word structure can communicate a more specific identity'];
  const watchouts = providedWatchouts.length
    ? providedWatchouts
    : [
      metrics.characterCount > 18
        ? 'Long names may need a shortened display form'
        : 'Check legibility at small sizes',
      ...(metrics.repeatedCharacterCount > 0 ? ['Repeated adjacent letters may affect pronunciation'] : [])
    ];

  return {
    category,
    categoryLabel: NAME_INSIGHT_CATEGORY_LABELS[category],
    creativeReading: input.description,
    strengths,
    watchouts,
    palette,
    alternatives: uniqueAlternatives(normalizedName, category),
    metrics,
    isCreativeOnly: true
  };
}

export { isNameInsightSupported };
