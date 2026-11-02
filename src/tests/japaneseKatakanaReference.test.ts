import assert from 'node:assert/strict';
import { JAPANESE_KATAKANA_REFERENCE } from '../data/japaneseKatakanaReference';
import { transliterateAnimeToKatakana } from '../services/generatorEngine';

const failures: string[] = [];
const seenInputs = new Set<string>();

assert.ok(JAPANESE_KATAKANA_REFERENCE.length >= 75, 'Reference fixture corpus should contain at least 75 cases');

for (const item of JAPANESE_KATAKANA_REFERENCE) {
  assert.ok(!seenInputs.has(item.romaji.toLowerCase()), `Duplicate reference input: ${item.romaji}`);
  seenInputs.add(item.romaji.toLowerCase());

  const actual = transliterateAnimeToKatakana(item.romaji);
  if (actual !== item.katakana) {
    failures.push(`${item.romaji}: expected ${item.katakana}, received ${actual || '(rejected)'}`);
  }
  if (actual && !/^[\p{Script=Katakana}\\sー]+$/u.test(actual)) {
    failures.push(`${item.romaji}: output contains characters outside the expected Katakana fixture scope: ${actual}`);
  }
}

for (const unsupported of ['Kenz', 'Kael', 'Vex', 'Hoshino!', 'Tokyo-??', '']) {
  assert.equal(transliterateAnimeToKatakana(unsupported), '', `Unsupported input should fail closed: ${unsupported}`);
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`PASS ${JAPANESE_KATAKANA_REFERENCE.length} Japanese romaji-to-katakana reference fixtures`);
  console.log('PASS unsupported and ambiguous spellings fail closed');
}
