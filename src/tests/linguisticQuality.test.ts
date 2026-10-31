declare const process: { exitCode?: number };
import { evaluateGeneratedName } from '../services/linguisticQuality';

const cases: Array<[string, boolean]> = [
  ['Arabic native script', evaluateGeneratedName({ name: 'ليان', language: 'ar' }).dimensions.scriptIntegrity.score === 100],
  ['Japanese mixed scripts allowed', evaluateGeneratedName({ name: '東京タワー', language: 'ja' }).dimensions.scriptIntegrity.score === 100],
  ['Latin transliteration is review signal, not rejection', evaluateGeneratedName({ name: 'Nour', language: 'ar' }).dimensions.scriptIntegrity.score === 75],
  ['Cyrillic for Russian', evaluateGeneratedName({ name: 'Ирина', language: 'ru' }).dimensions.scriptIntegrity.score === 100],
  ['Control characters flagged', evaluateGeneratedName({ name: 'Bad\u0000Name', language: 'en' }).findings.some(f => f.code === 'CONTROL_CHARACTER')],
  ['No invented naturalness score', evaluateGeneratedName({ name: 'Aurelia', language: 'fr' }).dimensions.naturalness.score === null],
  ['No invented category score', evaluateGeneratedName({ name: 'Aurelia', language: 'fr', category: 'brand' }).dimensions.categoryFit.score === null],
  ['Human scores included', evaluateGeneratedName({ name: 'Aurelia', language: 'fr', humanNaturalness: 4, humanCategoryFit: 5 }).dimensions.naturalness.score === 80],
  ['Batch duplicate detected', evaluateGeneratedName({ name: 'Aurelia', language: 'fr', batchNames: ['Aurelia', 'Aurelia'] }).findings.some(f => f.code === 'BATCH_DUPLICATE')],
  ['Score coverage disclosed', evaluateGeneratedName({ name: 'Aurelia', language: 'fr' }).coverage === 50],
];
const failed = cases.filter(([, ok]) => !ok);
for (const [label, ok] of cases) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
console.log(`${cases.length - failed.length}/${cases.length} linguistic quality checks passed`);
if (failed.length) process.exitCode = 1;
