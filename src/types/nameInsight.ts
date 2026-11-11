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
}

export interface NameInsightResult {
  category: NameInsightCategory;
  categoryLabel: string;
  creativeReading: string;
  strengths: string[];
  watchouts: string[];
  palette: [string, string, string];
  alternatives: string[];
  isCreativeOnly: true;
}
