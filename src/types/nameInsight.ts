import { GeneratorId } from './index';

export type NameInsightCategory =
  | 'brand'
  | 'character'
  | 'rpg'
  | 'game'
  | 'science-fiction'
  | 'science'
  | 'project'
  | 'place'
  | 'general';

export interface NameInsightInput {
  name: string;
  generatorId: GeneratorId;
  style: string;
  description: string;
  strengths?: string[];
  watchouts?: string[];
}

export interface NameInsightMetrics {
  characterCount: number;
  wordCount: number;
  repeatedCharacterCount: number;
  latinVowelShare: number | null;
}

export interface NameInsightResult {
  category: NameInsightCategory;
  categoryLabel: string;
  creativeReading: string;
  strengths: string[];
  watchouts: string[];
  palette: [string, string, string];
  alternatives: string[];
  metrics: NameInsightMetrics;
  isCreativeOnly: true;
}
