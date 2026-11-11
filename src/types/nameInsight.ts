import { GeneratorId, LanguageCode } from './index';

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
  generatorLabel?: string;
  language?: LanguageCode;
}

export interface NameInsightMetrics {
  characterCount: number;
  wordCount: number;
  repeatedCharacterCount: number;
  latinVowelShare: number | null;
  digitCount: number;
  symbolCount: number;
  uppercaseCount: number;
  hasMixedScripts: boolean;
  writingSystems: string[];
}

export interface NameInsightResult {
  category: NameInsightCategory;
  categoryLabel: string;
  creativeReading: string;
  contextDescription: string;
  slogan: string;
  palette: [string, string, string];
  alternatives: string[];
  metrics: NameInsightMetrics;
  isCreativeOnly: true;
}
