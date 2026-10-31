import assert from 'node:assert/strict';
import { getNameDiversityProfile, selectDiverseCandidates } from '../services/diversity';

const profile = getNameDiversityProfile('Étoile du Nord');
assert.equal(profile.structure, 'phrase');
assert.equal(profile.onset, 'ét');
assert.equal(profile.ending, 'rd');

const arabic = getNameDiversityProfile('نور القمر');
assert.equal(arabic.structure, 'double');
assert.ok(arabic.onset.length > 0);

const candidates = [
  { name: 'Starforge', score: 100, strategy: 'epic_compound' },
  { name: 'Starfield', score: 99, strategy: 'epic_compound' },
  { name: 'Moonvale', score: 98, strategy: 'phonetic_harmony' },
  { name: 'Oakridge', score: 96, strategy: 'symbolic_evocative' },
];
const selected = selectDiverseCandidates(candidates, 3);
assert.equal(selected.length, 3);
assert.equal(selected[0].name, 'Starforge');
assert.equal(selected[1].name, 'Moonvale');
assert.ok(!selected.some((candidate) => candidate.name === 'Oakridge'));
assert.deepEqual(
  selectDiverseCandidates(candidates, 0),
  [],
);
assert.equal(selectDiverseCandidates(candidates, 20).length, candidates.length);

// Complex scripts must be inspected safely without altering their original spelling.
for (const name of ['العربية', 'עברית', '日本語', '한국어', 'हिन्दी', 'ภาษาไทย', 'বাংলা']) {
  const result = getNameDiversityProfile(name);
  assert.ok(result.onset.length > 0, `Missing onset for ${name}`);
  assert.ok(result.ending.length > 0, `Missing ending for ${name}`);
}

console.log('Diversity selector tests passed.');
