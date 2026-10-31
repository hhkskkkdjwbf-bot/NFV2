/**
 * Reproducible empirical baseline for every generator × supported generation language.
 * This is diagnostic only: it does not change generator behavior or score semantic quality.
 * Run: npm run audit:generators
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { ALL_GENERATORS_LIST } from '../src/data/generators';
import { generateNames } from '../src/services/generatorEngine';

declare const process: { cwd(): string; exitCode?: number };

const LANGUAGES = [
  'fr','en','ar','tr','es','de','it','pt','ja','ko','zh','ru','hi','nl',
  'pl','sv','vi','id','th','el','he','cs','ro','da','fi','uk','bn','nb',
] as const;
const SEEDS = ['nf-baseline-01','nf-baseline-02','nf-baseline-03'] as const;
const BATCH_SIZE = 12;

type Sample = { name: string; normalized: string };
type Scenario = {
  generatorId: string;
  category: string;
  language: string;
  generated: number;
  empty: number;
  duplicateRate: number;
  uniqueRate: number;
  meanLength: number;
  minLength: number;
  maxLength: number;
  topPrefixes: Array<{ value: string; count: number; share: number }>;
  topSuffixes: Array<{ value: string; count: number; share: number }>;
  scriptMismatchRate: number | null;
  samples: string[];
  signals: string[];
  withinBatchUniqueRate: number;
  crossSeedOverlapRate: number;
  perSeed: Array<{ seed: string; generated: number; empty: number; unique: number; uniqueRate: number; duplicateRate: number; names: string[]; topPrefixes: Array<{ value: string; count: number; share: number }>; topSuffixes: Array<{ value: string; count: number; share: number }> }>;
};

const SCRIPT_PATTERNS: Record<string, RegExp> = {
  ar: /\p{Script=Arabic}/u,
  he: /\p{Script=Hebrew}/u,
  ru: /\p{Script=Cyrillic}/u,
  uk: /\p{Script=Cyrillic}/u,
  el: /\p{Script=Greek}/u,
  hi: /\p{Script=Devanagari}/u,
  bn: /\p{Script=Bengali}/u,
  th: /\p{Script=Thai}/u,
  ko: /\p{Script=Hangul}/u,
  ja: /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u,
  zh: /\p{Script=Han}/u,
};
const LATIN_LANGS = new Set([
  'fr','en','tr','es','de','it','pt','nl','pl','sv','vi','id','cs','ro','da','fi','nb',
]);

function normalizeName(name: string): string {
  return name.normalize('NFKC').toLocaleLowerCase()
    .replace(/[\p{P}\p{S}\s]+/gu, ' ').trim().replace(/\s+/g, ' ');
}
function chars(value: string): string[] { return Array.from(value.normalize('NFC')); }
function topParts(values: string[], fromStart: boolean) {
  const counts = new Map<string, number>();
  for (const value of values) {
    const units = chars(value.replace(/\s+/g, ''));
    if (!units.length) continue;
    const key = fromStart ? units.slice(0, 2).join('') : units.slice(-2).join('');
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a,b) => b[1]-a[1]).slice(0,5)
    .map(([value,count]) => ({ value, count, share: Number((count / Math.max(1, values.length)).toFixed(4)) }));
}
function mismatch(name: string, lang: string): boolean | null {
  const hasLetters = /\p{L}/u.test(name);
  if (!hasLetters) return true;
  const pattern = SCRIPT_PATTERNS[lang];
  if (pattern) {
    const letters = chars(name).filter(c => /\p{L}/u.test(c));
    if (!letters.length) return true;
    const allowed = lang === 'ja'
      ? /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u
      : pattern;
    return letters.some(c => !allowed.test(c) && !/[\p{Script=Common}\p{Script=Inherited}]/u.test(c));
  }
  if (LATIN_LANGS.has(lang)) {
    const letters = chars(name).filter(c => /\p{L}/u.test(c));
    return letters.some(c => !/\p{Script=Latin}/u.test(c));
  }
  return null;
}

async function main() {
  // Keep the audit isolated from browser persistence and prior interactive sessions.
  const memory = new Map<string,string>();
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => { memory.set(key, value); },
    removeItem: (key: string) => { memory.delete(key); },
    clear: () => memory.clear(),
  };
  (globalThis as any).localStorage = storage;
  (globalThis as any).window = { localStorage: storage, dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} };
  (globalThis as any).CustomEvent = class { type: string; constructor(type: string) { this.type = type; } };

  const scenarios: Scenario[] = [];
  const generators = [...ALL_GENERATORS_LIST];
  for (const generator of generators) {
    for (const language of LANGUAGES) {
      const names: string[] = [];
      let empty = 0;
      const perSeed: Scenario['perSeed'] = [];
      for (const seed of SEEDS) {
        storage.clear();
        const batch = generateNames({
          generatorId: generator.id,
          genLanguage: language,
          quantity: BATCH_SIZE,
          seed: `${seed}:${generator.id}:${language}`,
        });
        const batchNames: string[] = [];
        let batchEmpty = 0;
        for (const item of batch) {
          const value = String(item?.name ?? '').trim();
          if (!value) { empty++; batchEmpty++; }
          else { names.push(value); batchNames.push(value); }
        }
        const batchUnique = new Set(batchNames.map(normalizeName));
        perSeed.push({
          seed,
          generated: batchNames.length,
          empty: batchEmpty,
          unique: batchUnique.size,
          uniqueRate: batchNames.length ? batchUnique.size / batchNames.length : 0,
          duplicateRate: batchNames.length ? 1 - batchUnique.size / batchNames.length : 0,
          names: batchNames,
          topPrefixes: topParts(batchNames, true),
          topSuffixes: topParts(batchNames, false),
        });
      }
      const normalized = names.map(normalizeName);
      const unique = new Set(normalized);
      const lengths = names.map(n => chars(n).length);
      const mismatchCount = names.filter(n => mismatch(n, language) === true).length;
      const scriptChecks = names.filter(n => mismatch(n, language) !== null).length;
      const duplicateRate = names.length ? 1 - unique.size / names.length : 0;
      const uniqueRate = names.length ? unique.size / names.length : 0;
      const perBatchUniqueCount = perSeed.reduce((sum, batch) => sum + batch.unique, 0);
      const withinBatchUniqueRate = names.length ? perBatchUniqueCount / names.length : 0;
      const crossSeedOverlapRate = perBatchUniqueCount ? 1 - unique.size / perBatchUniqueCount : 0;
      const signals: string[] = [];
      if (empty) signals.push('empty_output');
      if (names.length > 0 && 1 - withinBatchUniqueRate >= 0.15) signals.push('high_within_batch_duplicate_rate');
      if (names.length && withinBatchUniqueRate < 0.65) signals.push('low_within_batch_diversity');
      if (scriptChecks && mismatchCount / scriptChecks >= 0.2) signals.push('possible_script_mismatch');
      const category = (generator as any).category || 'unknown';
      scenarios.push({
        generatorId: generator.id,
        category,
        language,
        generated: names.length,
        empty,
        duplicateRate: Number(duplicateRate.toFixed(4)),
        uniqueRate: Number(uniqueRate.toFixed(4)),
        withinBatchUniqueRate: Number(withinBatchUniqueRate.toFixed(4)),
        crossSeedOverlapRate: Number(crossSeedOverlapRate.toFixed(4)),
        perSeed,
        meanLength: lengths.length ? Number((lengths.reduce((a,b)=>a+b,0)/lengths.length).toFixed(2)) : 0,
        minLength: lengths.length ? Math.min(...lengths) : 0,
        maxLength: lengths.length ? Math.max(...lengths) : 0,
        topPrefixes: topParts(names, true),
        topSuffixes: topParts(names, false),
        scriptMismatchRate: scriptChecks ? Number((mismatchCount/scriptChecks).toFixed(4)) : null,
        samples: [...new Set(names)].slice(0,8),
        signals,
      });
    }
  }

  const totals = scenarios.reduce((acc, s) => {
    acc.generated += s.generated; acc.empty += s.empty;
    acc.scenariosWithSignals += s.signals.length ? 1 : 0;
    return acc;
  }, { generated: 0, empty: 0, scenariosWithSignals: 0 });
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    baseline: true,
    generatorCount: generators.length,
    languageCount: LANGUAGES.length,
    seeds: [...SEEDS],
    batchSize: BATCH_SIZE,
    scenarioCount: scenarios.length,
    totals,
    methodology: {
      duplicateNormalization: 'NFKC + lowercase + punctuation/symbol/whitespace normalization',
      scriptChecks: 'Conservative script-family heuristics; unknown script families are not scored',
      limitations: [
        'Semantic relevance and naturalness require human review or language-specific reference data.',
        'Script mismatch is a warning signal, not a definitive language-quality judgment.',
        'Seeded runs improve reproducibility but do not guarantee a statistically exhaustive sample.',
      ],
    },
    scenarios,
  };

  const outputDir = `${process.cwd()}/artifacts/generator-quality-audit`;
  await mkdir(outputDir, { recursive: true });
  await writeFile(`${outputDir}/baseline.json`, JSON.stringify(report, null, 2), 'utf8');

  const flagged = scenarios.filter(s => s.signals.length);
  const lines = [
    '# NameForge — generator quality baseline',
    '',
    `- Generators: **${generators.length}**`,
    `- Languages: **${LANGUAGES.length}**`,
    `- Scenarios: **${scenarios.length}**`,
    `- Generated names: **${totals.generated}**`,
    `- Empty outputs: **${totals.empty}**`,
    `- Scenarios with heuristic signals: **${totals.scenariosWithSignals}**`,
    '',
    '> Heuristic report only. Signals identify cases for review; they are not a subjective naturalness score.',
    '',
    '| Generator | Category | Language | Names | Within-batch duplicates | Cross-seed overlap | Script mismatch | Signals |',
    '|---|---|---:|---:|---:|---:|---:|---|',
    ...scenarios.map(s => `| ${s.generatorId} | ${s.category} | ${s.language} | ${s.generated} | ${((1-s.withinBatchUniqueRate)*100).toFixed(1)}% | ${(s.crossSeedOverlapRate*100).toFixed(1)}% | ${s.scriptMismatchRate === null ? 'n/a' : (s.scriptMismatchRate*100).toFixed(1)+'%'} | ${s.signals.join(', ') || '—'} |`),
    '',
    '## Highest within-batch duplicate rates',
    '',
    ...[...scenarios].sort((a,b)=>(1-a.withinBatchUniqueRate)-(1-b.withinBatchUniqueRate)).slice(0,30)
      .map(s=>`- ${s.generatorId} / ${s.language}: ${((1-s.withinBatchUniqueRate)*100).toFixed(1)}% within batches; cross-seed overlap ${(s.crossSeedOverlapRate*100).toFixed(1)}%`),
  ];
  await writeFile(`${outputDir}/baseline.md`, lines.join('\n'), 'utf8');
  console.log(JSON.stringify({
    generatorCount: generators.length,
    languageCount: LANGUAGES.length,
    scenarioCount: scenarios.length,
    generatedNames: totals.generated,
    emptyOutputs: totals.empty,
    scenariosWithSignals: totals.scenariosWithSignals,
    reportFiles: ['artifacts/generator-quality-audit/baseline.json','artifacts/generator-quality-audit/baseline.md'],
  }, null, 2));
  if (generators.length !== 234) {
    console.error(`Expected 234 generators, found ${generators.length}`);
    process.exitCode = 1;
  }
  if (scenarios.length !== 234 * 28) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
