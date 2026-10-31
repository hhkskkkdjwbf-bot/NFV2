#!/usr/bin/env node
/**
 * Paired before/after comparison for NameForge generator quality reports.
 * Operational/structural score only; never a naturalness score.
 * Usage: node scripts/compare-generator-quality.mjs before.json after.json output-dir
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [beforePath, afterPath, outputDir = 'artifacts/generator-quality-comparison'] = process.argv.slice(2);
if (!beforePath || !afterPath) {
  console.error('Usage: node scripts/compare-generator-quality.mjs before.json after.json output-dir');
  process.exit(2);
}
const [before, after] = await Promise.all([
  readFile(beforePath, 'utf8').then(JSON.parse),
  readFile(afterPath, 'utf8').then(JSON.parse),
]);
const keyOf = s => `${s.generatorId}::${s.language}`;
const beforeMap = new Map(before.scenarios.map(s => [keyOf(s), s]));
const afterMap = new Map(after.scenarios.map(s => [keyOf(s), s]));
const WEIGHTS = { availability: 0.25, uniqueness: 0.35, scriptCompatibility: 0.25, structuralDiversity: 0.15 };

function normalizedName(name) {
  return String(name ?? '').normalize('NFKC').toLocaleLowerCase()
    .replace(/[\\p{P}\\p{S}\\s]+/gu, ' ').trim().replace(/\\s+/g, ' ');
}
function repeatedAcrossSeeds(s) {
  const seen = new Map();
  for (const batch of s.perSeed || []) {
    for (const name of batch.names || []) {
      const key = normalizedName(name);
      if (!key) continue;
      if (!seen.has(key)) seen.set(key, { name, seeds: new Set() });
      seen.get(key).seeds.add(batch.seed);
    }
  }
  return [...seen.values()].filter(item => item.seeds.size > 1)
    .map(item => ({ name: item.name, seedCount: item.seeds.size }));
}

function metrics(s) {
  const total = s.generated + (s.empty || 0);
  const availability = total ? 100 * s.generated / total : 0;
  // A visible generation is one batch. Seeded audits deliberately bypass recent-name history.
  const uniqueness = 100 * (s.withinBatchUniqueRate ?? s.uniqueRate ?? (1 - (s.duplicateRate || 0)));
  const crossSeedOverlap = s.crossSeedOverlapRate == null ? null : 100 * s.crossSeedOverlapRate;
  const scriptCompatibility = s.scriptMismatchRate == null ? null : 100 * (1 - s.scriptMismatchRate);
  const batchParts = Array.isArray(s.perSeed) && s.perSeed.length
    ? s.perSeed.map(batch => ({
        prefix: batch.topPrefixes?.[0]?.share ?? null,
        suffix: batch.topSuffixes?.[0]?.share ?? null,
      }))
    : [{ prefix: s.topPrefixes?.[0]?.share ?? null, suffix: s.topSuffixes?.[0]?.share ?? null }];
  const concentrations = batchParts
    .filter(part => part.prefix != null && part.suffix != null)
    .map(part => (part.prefix + part.suffix) / 2);
  const concentration = concentrations.length
    ? concentrations.reduce((sum, value) => sum + value, 0) / concentrations.length
    : null;
  const structuralDiversity = concentration == null ? null : 100 * (1 - concentration);
  const parts = { availability, uniqueness, scriptCompatibility, structuralDiversity };
  let weighted = 0, weight = 0;
  for (const [name, w] of Object.entries(WEIGHTS)) {
    if (parts[name] != null && Number.isFinite(parts[name])) {
      weighted += parts[name] * w;
      weight += w;
    }
  }
  return { ...parts, crossSeedOverlap, operationalScore: weight ? weighted / weight : null, scoreCoverage: weight };
}

const rows = [];
for (const [key, oldScenario] of beforeMap) {
  const newScenario = afterMap.get(key);
  if (!newScenario) continue;
  const oldMetrics = metrics(oldScenario);
  const newMetrics = metrics(newScenario);
  const delta = {};
  for (const field of [...Object.keys(WEIGHTS), 'operationalScore']) {
    delta[field] = oldMetrics[field] == null || newMetrics[field] == null
      ? null : Number((newMetrics[field] - oldMetrics[field]).toFixed(3));
  }
  rows.push({
    generatorId: oldScenario.generatorId,
    category: newScenario.category || oldScenario.category || 'unknown',
    language: oldScenario.language,
    before: oldMetrics,
    after: newMetrics,
    delta,
    generatedBefore: oldScenario.generated,
    generatedAfter: newScenario.generated,
    emptyBefore: oldScenario.empty || 0,
    emptyAfter: newScenario.empty || 0,
    repeatedNamesBefore: repeatedAcrossSeeds(oldScenario),
    repeatedNamesAfter: repeatedAcrossSeeds(newScenario),
    crossSeedOverlapDelta: oldMetrics.crossSeedOverlap == null || newMetrics.crossSeedOverlap == null
      ? null : Number((newMetrics.crossSeedOverlap - oldMetrics.crossSeedOverlap).toFixed(3)),
  });
}
if (!rows.length) throw new Error('No matching generator/language scenarios were found.');

function averageFrom(items, fn) {
  const values = items.map(fn).filter(v => v != null && Number.isFinite(v));
  return values.length ? values.reduce((a,b)=>a+b,0)/values.length : null;
}
const metricNames = [...Object.keys(WEIGHTS), 'operationalScore'];
const diagnosticNames = ['crossSeedOverlap'];
const summary = Object.fromEntries(metricNames.concat(diagnosticNames).map(name => [name, {
  before: averageFrom(rows, r => r.before[name]),
  after: averageFrom(rows, r => r.after[name]),
  delta: averageFrom(rows, r => r.before[name] == null || r.after[name] == null ? null : r.after[name] - r.before[name]),
  measuredScenarios: rows.filter(r => r.before[name] != null && r.after[name] != null).length,
}]));
const deltas = rows.map(r => r.delta.operationalScore).filter(v => v != null);
const wins = deltas.filter(v => v > 0.001).length;
const losses = deltas.filter(v => v < -0.001).length;
const ties = deltas.length - wins - losses;
const byLanguage = [...new Set(rows.map(r=>r.language))].sort().map(language => {
  const subset = rows.filter(r=>r.language===language);
  return { language, scenarios: subset.length,
    before: Number(averageFrom(subset,r=>r.before.operationalScore).toFixed(2)),
    after: Number(averageFrom(subset,r=>r.after.operationalScore).toFixed(2)),
    delta: Number(averageFrom(subset,r=>r.delta.operationalScore).toFixed(2)) };
});
const byCategory = [...new Set(rows.map(r=>r.category))].sort().map(category => {
  const subset = rows.filter(r=>r.category===category);
  return { category, scenarios: subset.length,
    before: Number(averageFrom(subset,r=>r.before.operationalScore).toFixed(2)),
    after: Number(averageFrom(subset,r=>r.after.operationalScore).toFixed(2)),
    delta: Number(averageFrom(subset,r=>r.delta.operationalScore).toFixed(2)) };
});
const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  before: { generatedAt: before.generatedAt, generatorCount: before.generatorCount, languageCount: before.languageCount, scenarioCount: before.scenarioCount },
  after: { generatedAt: after.generatedAt, generatorCount: after.generatorCount, languageCount: after.languageCount, scenarioCount: after.scenarioCount },
  matchedScenarios: rows.length,
  unmatchedBefore: before.scenarios.length - rows.length,
  unmatchedAfter: after.scenarios.length - rows.length,
  scoring: {
    name: 'Operational/structural score (not naturalness)',
    range: '0–100',
    weights: WEIGHTS,
    formulas: {
      availability: '100 × generated / (generated + empty)',
      uniqueness: '100 × withinBatchUniqueRate, averaged across independent 12-name seeded batches',
      scriptCompatibility: '100 × (1 − scriptMismatchRate); omitted when script family is not assessed',
      structuralDiversity: '100 × (1 − mean per-batch top-prefix and top-suffix concentration); structural proxy only',
      operationalScore: 'Weighted mean of available components; weights are renormalized when a component is unavailable',
    },
    diagnostics: {
      crossSeedOverlap: 'Share of within-batch-unique names that recur in another independent seed batch. Excluded from score because seeded audits intentionally disable recent-name history.',
    },
    exclusions: ['Semantic relevance', 'Idiomatic naturalness', 'Grammar and morphology', 'Cultural suitability', 'Trademark/legal conflicts'],
    warning: 'This score measures observable technical and structural signals. It must not be described as a linguistic or human quality score.',
  },
  summary,
  scoreMovement: { improved: wins, regressed: losses, unchanged: ties, compared: deltas.length },
  byLanguage,
  byCategory,
  largestImprovements: [...rows].sort((a,b)=>(b.delta.operationalScore ?? -Infinity)-(a.delta.operationalScore ?? -Infinity)).slice(0,30),
  largestRegressions: [...rows].sort((a,b)=>(a.delta.operationalScore ?? Infinity)-(b.delta.operationalScore ?? Infinity)).slice(0,30),
  largestCrossSeedOverlapIncreases: [...rows]
    .sort((a,b)=>(b.crossSeedOverlapDelta ?? -Infinity)-(a.crossSeedOverlapDelta ?? -Infinity)).slice(0,30),
  scenarios: rows,
};
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir,'comparison.json'), JSON.stringify(report,null,2));
const fmt = n => n == null ? 'n/a' : n.toFixed(2);
const lines = [
  '# NameForge — paired before/after quality comparison','',
  `- Matched scenarios: **${rows.length}**`,
  `- Improved / regressed / unchanged: **${wins} / ${losses} / ${ties}**`,
  `- Before commit: **${before.gitCommit || 'recorded in workflow metadata'}**`,
  `- After commit: **${after.gitCommit || 'recorded in workflow metadata'}**`,'',
  '> The operational score is not a naturalness score. It excludes semantics, idiom, grammar, morphology and cultural suitability. Human review remains necessary.','',
  '| Metric | Before | After | Δ | Scenarios |',
  '|---|---:|---:|---:|---:|',
  ...metricNames.map(name => `| ${name} | ${fmt(summary[name].before)} | ${fmt(summary[name].after)} | ${fmt(summary[name].delta)} | ${summary[name].measuredScenarios} |`),
  '',
  '## Cross-seed overlap diagnostic (excluded from score)','',
  `- Before: **${fmt(summary.crossSeedOverlap.before)}%**`,
  `- After: **${fmt(summary.crossSeedOverlap.after)}%**`,
  `- Change: **${fmt(summary.crossSeedOverlap.delta)} percentage points**`,
  '',
  '## Largest cross-seed overlap increases (diagnostic only)','',
  '| Generator | Language | Before | After | Δ points | Repeated-name examples |',
  '|---|---|---:|---:|---:|---|',
  ...report.largestCrossSeedOverlapIncreases.slice(0,15).map(x =>
    `| ${x.generatorId} | ${x.language} | ${fmt(x.before.crossSeedOverlap)}% | ${fmt(x.after.crossSeedOverlap)}% | ${fmt(x.crossSeedOverlapDelta)} | ${x.repeatedNamesAfter.slice(0,4).map(n=>n.name).join('; ') || '—'} |`),
  '',
  '## Scoring formula','',
  '- Availability (25%): generated / requested outputs.',
  '- Uniqueness (35%): mean unique normalized names within each 12-name batch / generated names.',
  '- Cross-seed overlap is shown separately and excluded: seeded runs deliberately bypass recent-name history, so it is not a proxy for repeats in a normal user session.',
  '- Script compatibility (25%): inverse of conservative script-mismatch rate; unavailable for unassessed scripts.',
  '- Structural diversity (15%): inverse of mean per-batch top-two-character prefix/suffix concentration. This is a proxy, not morphology.',
  '- Missing components are excluded and remaining weights are renormalized.',
  '',
  '## By language','',
  '| Language | Scenarios | Before | After | Δ |','|---|---:|---:|---:|---:|',
  ...byLanguage.map(x=>`| ${x.language} | ${x.scenarios} | ${fmt(x.before)} | ${fmt(x.after)} | ${fmt(x.delta)} |`),
  '',
  '## By category','',
  '| Category | Scenarios | Before | After | Δ |','|---|---:|---:|---:|---:|',
  ...byCategory.map(x=>`| ${x.category} | ${x.scenarios} | ${fmt(x.before)} | ${fmt(x.after)} | ${fmt(x.delta)} |`),
  '',
  '## Largest regressions','',
  ...report.largestRegressions.slice(0,15).map(x=>`- ${x.generatorId} / ${x.language}: ${fmt(x.delta.operationalScore)} points`),
  '',
  '## Limits','',
  'A higher operational score does not prove that generated names sound natural or make sense. The 840-name human-review queue and qualified language reviewers are still required for those judgments.',
];
await writeFile(path.join(outputDir,'comparison.md'), lines.join('\n'));
console.log(JSON.stringify({matchedScenarios:rows.length,scoreMovement:report.scoreMovement,summary,files:[path.join(outputDir,'comparison.json'),path.join(outputDir,'comparison.md')]},null,2));
