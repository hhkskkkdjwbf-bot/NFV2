import assert from 'node:assert/strict';
import { createNameInsight, isNameInsightSupported } from '../services/nameInsightService';

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

assert.equal(createNameInsight({ ...base, name: '   ' }), null);
assert.equal(isNameInsightSupported('weapon' as never), false);
assert.equal(isNameInsightSupported('plasma_weapon' as never), false);
assert.equal(isNameInsightSupported('tactical_operation' as never), false);
assert.equal(isNameInsightSupported('special_attack' as never), false);

const character = createNameInsight({ ...base, generatorId: 'anime_hero', description: 'A fictional hero concept.' });
assert.equal(character?.category, 'character');
const science = createNameInsight({ ...base, generatorId: 'quantum_particle', description: 'A science concept.' });
assert.equal(science?.category, 'science');

console.log('Name Insight tests passed.');
