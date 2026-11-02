declare const process: { exitCode?: number };
import { generateNames } from '../services/generatorEngine';
import { getScriptsInText } from '../services/linguisticRules';

type Case = { id: string; language: 'ar' | 'ja' | 'ru' | 'zh'; allowed: string[]; format?: 'title' | 'group' };
const cases: Case[] = [
  { id: 'fantasy', language: 'ar', allowed: ['Arabic'] },
  { id: 'brand', language: 'ja', allowed: ['Han', 'Hiragana', 'Katakana'], format: 'group' },
  { id: 'startup', language: 'ru', allowed: ['Cyrillic'] },
  { id: 'dragon', language: 'zh', allowed: ['Han'] },
  { id: 'book', language: 'ja', allowed: ['Han', 'Hiragana', 'Katakana'] },
];
const failures: string[] = [];

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
