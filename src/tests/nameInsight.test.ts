import assert from 'node:assert/strict';
import { createNameInsight, isNameInsightSupported } from '../services/nameInsightService';
import { resolveNameInsightCategory } from '../data/nameInsightData';
import { ALL_GENERATORS_LIST } from '../data/generators';
import { FULL_TRANSLATION_LANGUAGES } from '../i18n';
import { getNameDetailsLabels } from '../i18n/nameDetails';

const base = {
  name: 'Asterion',
  generatorId: 'brand' as const,
  style: 'modern',
  description: 'A concise creative description.'
};

const first = createNameInsight(base);
const second = createNameInsight(base);
assert.ok(first);
assert.deepEqual(first, second, 'Insight output must be deterministic');
assert.equal(first?.isCreativeOnly, true);
assert.equal(first?.category, 'brand');
assert.equal(first?.palette.length, 3);
assert.equal(first?.alternatives.length, 3);
const localized = createNameInsight({
  ...base,
  strengths: ['Localized strength'],
  watchouts: ['Localized caution']
});
assert.deepEqual(localized?.strengths, ['Localized strength']);
assert.deepEqual(localized?.watchouts, ['Localized caution']);

assert.equal(createNameInsight({ ...base, name: '   ' }), null);
assert.equal(isNameInsightSupported('weapon' as never), false);
assert.equal(isNameInsightSupported('plasma_weapon' as never), false);
assert.equal(isNameInsightSupported('tactical_operation' as never), false);
assert.equal(isNameInsightSupported('special_attack' as never), false);

const character = createNameInsight({ ...base, generatorId: 'anime_hero', description: 'A fictional hero concept.' });
assert.equal(character?.category, 'character');
const science = createNameInsight({ ...base, generatorId: 'quantum_particle', description: 'A science concept.' });
assert.equal(science?.category, 'science');

const allGeneratorIds = ALL_GENERATORS_LIST.map((generator) => generator.id);
assert.equal(allGeneratorIds.length, 234, 'Expected all 234 generator metadata entries to be represented');
for (const generator of ALL_GENERATORS_LIST) {
  const result = createNameInsight({
    name: 'SampleNova',
    generatorId: generator.id,
    style: 'test-style',
    description: generator.description
  });
  if (isNameInsightSupported(generator.id)) {
    assert.ok(result, `Insight should be available for ${generator.id}`);
    assert.notEqual(resolveNameInsightCategory(generator.id), 'general', `Generator needs a specialized category: ${generator.id}`);
  } else {
    assert.equal(result, null, `Excluded generator should not expose insight: ${generator.id}`);
  }
}

const completeLanguages = [
  'en','fr','es','de','it','pt','ar','tr','ja','ko','zh','ru','hi','nl',
  'pl','sv','vi','id','th','el','he','cs','ro','da','fi','uk','bn','nb'
] as const;
for (const language of completeLanguages) {
  assert.ok(FULL_TRANSLATION_LANGUAGES.includes(language), `Missing complete translation pack: ${language}`);
  const labels = getNameDetailsLabels(language);
  assert.ok(labels.whyFits && labels.strengths && labels.watchouts && labels.transparency, `Missing Name Insight labels: ${language}`);
}

console.log('Name Insight tests passed for 234 generator metadata entries and 28 complete UI languages.');
