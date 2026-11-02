declare const process: { exitCode?: number };
import { generateNames, transliterateAnimeToKatakana } from '../services/generatorEngine';
import { getScriptsInText } from '../services/linguisticRules';
import { SUBCATEGORIES_DATA } from '../data/subcategories';
import { SUBCATEGORIES_BATCH_B } from '../data/generatorsBatchB';

type Case = { id: string; language: 'ar' | 'ja' | 'ru' | 'zh'; allowed: string[]; format?: 'title' | 'group' };

const cases: Case[] = [
  { id: 'fantasy', language: 'ar', allowed: ['Arabic'] },
  { id: 'brand', language: 'ja', allowed: ['Han', 'Hiragana', 'Katakana'], format: 'group' },
  { id: 'startup', language: 'ru', allowed: ['Cyrillic'] },
  { id: 'dragon', language: 'zh', allowed: ['Han'] },
  { id: 'book', language: 'ja', allowed: ['Han', 'Hiragana', 'Katakana'] },
];
const failures: string[] = [];

const animeLexicons = SUBCATEGORIES_DATA.anime;
const forbiddenCrossStyleFragments = ['Kael', 'Vex', 'nox', 'Lumi', 'Eli', 'lune', 'ael'];
for (const style of ['hero', 'ninja', 'demon', 'warrior', 'villain', 'royal', 'magic', 'default']) {
  const data = animeLexicons?.[style];
  if (!data || data.prefixes.length < 6 || data.suffixes.length < 6) {
    failures.push(`anime/${style}: missing or undersized dedicated lexical bank`);
    continue;
  }
  const tokens = [...data.prefixes, ...data.suffixes];
  if (tokens.some((token) => forbiddenCrossStyleFragments.includes(token))) {
    failures.push(`anime/${style}: contains a known cross-style or non-Japanese fragment`);
  }
}
const ninjaTokens = new Set([...(animeLexicons?.ninja?.prefixes || []), ...(animeLexicons?.ninja?.suffixes || [])]);
const demonTokens = [...(animeLexicons?.demon?.prefixes || []), ...(animeLexicons?.demon?.suffixes || [])];
if (demonTokens.every((token) => ninjaTokens.has(token))) {
  failures.push('anime/demon: lexical bank duplicates the ninja bank');
}
const academy = SUBCATEGORIES_BATCH_B.anime_school?.academy;
if (!academy || academy.suffixes.some((token) => ['High', 'Academy', 'Institute', 'Campus', 'Sanctuary'].includes(token))) {
  failures.push('anime_school/academy: non-Japanese school suffixes remain in the Japanese-inspired bank');
}
console.log('Checked Anime lexical-bank separation and school naming vocabulary');

const romajiFixtures: Array<[string, string]> = [
  ['Haruto', 'ハルト'],
  ['Shinobu', 'シノブ'],
  ['Ryu', 'リュ'],
  ['Zankoku', 'ザンコク'],
  ['Kage', 'カゲ'],
  ['Hoshi no', 'ホシ ノ'],
];
for (const [source, expected] of romajiFixtures) {
  const actual = transliterateAnimeToKatakana(source);
  if (actual !== expected) failures.push(`romaji/${source}: expected ${expected}, received ${actual || '(rejected)'}`);
}
for (const unsupported of ['Kenz', 'Kael', 'Vex', 'Hoshino!']) {
  if (transliterateAnimeToKatakana(unsupported) !== '') {
    failures.push(`romaji/${unsupported}: unsupported spelling must be rejected, not partially transliterated`);
  }
}
console.log('Checked strict romaji-to-katakana fixtures and fail-closed handling');

// Exercise every main Anime subcategory through the real generation pipeline.
// This verifies that each bank can produce Japanese-script candidates; it does
// not claim native-speaker approval or semantic naturalness.
for (const style of Object.keys(animeLexicons || {})) {
  const results = generateNames({
    generator: 'anime',
    style,
    genLanguage: 'ja',
    quantity: 4,
    seed: `anime-ja-subcategory-${style}`,
  });
  if (results.length === 0) {
    failures.push(`anime/${style}/ja: no candidates survived strict Japanese transliteration`);
    continue;
  }
  const uniqueNames = new Set(results.map((result) => result.name.normalize('NFC')));
  if (uniqueNames.size !== results.length) failures.push(`anime/${style}/ja: duplicate names in deterministic batch`);
  for (const result of results) {
    if (!result.disclaimer?.includes('not verified or attested Japanese names')) {
      failures.push(`anime/${style}/ja: experimental Japanese disclaimer missing`);
    }
    const scripts = getScriptsInText(result.name);
    if (!scripts.length || scripts.some((script) => !['Katakana', 'Hiragana', 'Han'].includes(script))) {
      failures.push(`anime/${style}/ja: unexpected script in "${result.name}" [${scripts.join(',')}]`);
    }
  }
  console.log(`PASS anime/${style}/ja: ${results.length} generated candidates; Japanese scripts only`);
}


// Category-specific Arabic output must not be replaced by generic personal-name
// roots (including religious compounds) across unrelated generators.
const arabicCategoryCases = ['anime', 'fantasy', 'dragon', 'brand', 'startup', 'gamertag'];
for (const id of arabicCategoryCases) {
  const batch = generateNames({ generator: id, genLanguage: 'ar', quantity: 8, seed: `arabic-category-${id}` });
  if (!batch.length) {
    failures.push(`${id}/ar: no category-specific Arabic output`);
    continue;
  }
  for (const item of batch) {
    const scripts = getScriptsInText(item.name);
    if (!scripts.length || scripts.some((script) => script !== 'Arabic')) {
      failures.push(`${id}/ar: mixed or non-Arabic script in "${item.name}" [${scripts.join(',')}]`);
    }
    if (/(?:الدين|الحق|النور)/u.test(item.name)) {
      failures.push(`${id}/ar: generic religious suffix leaked into category output "${item.name}"`);
    }
  }
  console.log(`PASS ${id}/ar: category roots transliterated into Arabic script`);
}

const animeJapanese = generateNames({ generator: 'anime', genLanguage: 'ja', quantity: 8, seed: 'anime-ja-category-roots' });
if (!animeJapanese.length || animeJapanese.some((item) => getScriptsInText(item.name).some((script) => !['Katakana', 'Hiragana', 'Han'].includes(script)))) {
  failures.push('anime/ja: category-specific anime roots must be rendered in Japanese script');
} else {
  console.log('PASS anime/ja: anime-specific roots rendered in Japanese script');
}
for (const item of cases) {
  const results = generateNames({
    generator: item.id,
    genLanguage: item.language,
    format: item.format || 'title',
    quantity: 6,
    seed: `phase2-${item.id}-${item.language}`,
  });
  if (!results.length) {
    failures.push(`${item.id}/${item.language}: no generated results`);
    continue;
  }
  for (const result of results) {
    const observed = getScriptsInText(result.name);
    if (!observed.length || observed.some((script) => !item.allowed.includes(script))) {
      failures.push(`${item.id}/${item.language}: unexpected script in "${result.name}" [${observed.join(',')}]`);
    }
  }
  console.log(`PASS ${item.id}/${item.language}: ${results.length} names; scripts constrained to ${item.allowed.join('/')}`);
}
const transliteration = generateNames({
  generator: 'fantasy', genLanguage: 'ar', keyword: 'Nour', quantity: 4, seed: 'phase2-ar-transliteration',
});
if (transliteration.some((item) => getScriptsInText(item.name).some((script) => script !== 'Latin'))) {
  failures.push('Arabic transliteration keyword was mixed with Arabic-script affixes or titles');
} else {
  console.log('PASS Arabic transliteration keyword remains Latin-only');
}
if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exitCode = 1;
} else {
  console.log('All generator language integration checks passed');
}
