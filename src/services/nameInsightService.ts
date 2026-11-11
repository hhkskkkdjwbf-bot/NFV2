import { NameInsightInput, NameInsightResult } from '../types/nameInsight';
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

function uniqueAlternatives(name: string, category: NameInsightResult['category']): string[] {
  const base = name.trim().replace(/\s+/g, ' ');
  if (!base) return [];
  const suffixes = NAME_INSIGHT_ALTERNATIVE_SUFFIXES[category];
  return suffixes.map((suffix) => `${base} ${suffix}`);
}

/**
 * Creates a reproducible creative reading from existing generator metadata.
 * It does not infer or claim historical, linguistic, or etymological meaning.
 */
export function createNameInsight(input: NameInsightInput): NameInsightResult | null {
  if (!isNameInsightSupported(input.generatorId) || !input.name.trim()) return null;

  const category = resolveNameInsightCategory(input.generatorId);
  const hash = stableHash(`${input.generatorId}| ${input.name}| ${input.style}`);
  const palette = NAME_INSIGHT_PALETTES[hash % NAME_INSIGHT_PALETTES.length];
  const length = input.name.trim().length;
  const strengths = [
    length <= 7 ? 'Compact visual footprint' : length <= 14 ? 'Balanced name length' : 'Distinctive, expressive length',
    input.name.trim().split(/\s+/).length > 1 ? 'Clear multi-word structure' : 'Easy to scan as a single name'
  ];
  const watchouts = [
    length > 18 ? 'Check readability at small sizes' : 'Check readability in the final layout',
    'Test pronunciation and audience associations before choosing'
  ];

  return {
    category,
    categoryLabel: NAME_INSIGHT_CATEGORY_LABELS[category],
    creativeReading: input.description,
    strengths,
    watchouts,
    palette,
    alternatives: uniqueAlternatives(input.name, category),
    isCreativeOnly: true
  };
}

export { isNameInsightSupported };
