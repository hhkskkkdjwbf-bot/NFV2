import assert from 'node:assert/strict';
import { getNameDiversityProfile, selectDiverseCandidates } from '../services/diversity';

const latin = getNameDiversityProfile('Aldren Storm');
assert.equal(latin.structure, 'double');
assert.equal(latin.onset, 'al');
assert.equal(latin.ending, 'rm');
assert.equal(getNameDiversityProfile('東京').phoneticFamily, 'non-latin');

const candidates = [
  { name: 'Aldren', score: 98, strategy: 'phonetic_harmony' },
  { name: 'Aldric', score: 97, strategy: 'phonetic_harmony' },
  { name: 'Aldros', score: 96, strategy: 'phonetic_harmony' },
  { name: 'Mirael', score: 91, strategy: 'neologism' },
  { name: 'Thornak', score: 90, strategy: 'epic_compound' },
  { name: 'Veloria', score: 89, strategy: 'symbolic_evocative' },
  { name: 'Kestrel', score: 88, strategy: 'portmanteau_blend' },
  { name: 'Nyx', score: 87, strategy: 'punchy_minimal' },
];
const ranked = selectDiverseCandidates(candidates, 6);
assert.equal(ranked.length, 6);
assert.equal(new Set(ranked.map((item) => item.name)).size, 6);
assert.ok(ranked.some((item) => item.name === 'Mirael'));
assert.ok(ranked.some((item) => item.name === 'Thornak'));
assert.deepEqual(selectDiverseCandidates(candidates, 6), ranked, 'ranking is deterministic');
assert.equal(selectDiverseCandidates(candidates, 0).length, 0);
console.log('Diversity tests: 10 assertions passed.');
