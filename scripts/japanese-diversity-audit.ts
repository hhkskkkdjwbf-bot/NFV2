/**
 * Empirical Japanese Anime-output diversity audit.
 *
 * It collects seeded real engine outputs and reports exact duplicates plus
 * a bounded nearest-neighbour spelling-similarity signal. Similarity is a
 * diagnostic proxy, not a phonological or native-speaker judgement.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { generateNames } from '../src/services/generatorEngine';
import { SUBCATEGORIES_DATA } from '../src/data/subcategories';

declare const process: { cwd(): string; exitCode?: number };

const TARGETS = [100, 500, 1000, 5000] as const;
const BATCH_SIZE = 12;
const NEIGHBOUR_WINDOW = 25;
const SIMILARITY_THRESHOLD = 0.78;

function normalizeName(value: string): string {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase()
    .replace(/[^\\p{L}\\p{M}\\p{N}]+/gu, '');
}

function codePoints(value: string): string[] {
  return Array.from(value.normalize('NFC'));
}

function levenshtein(a: string[], b: string[]): number {
  if (a.length > b.length) return levenshtein(b, a);
  let row = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let i = 1; i <= b.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= a.length; j++) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[j - 1] === b[i - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[a.length];
}

function similarity(a: string, b: string): number {
  const left = codePoints(a);
  const right = codePoints(b);
  const longest = Math.max(left.length, right.length);
  if (!longest) return 1;
  return 1 - levenshtein(left, right) / longest;
}

function metrics(names: string[]) {
  const normalized = names.map(normalizeName);
  const unique = new Set(normalized);
  const frequencies = new Map<string, number>();
  for (const name of normalized) frequencies.set(name, (frequencies.get(name) ?? 0) + 1);
  const duplicateEntries = names.length - unique.size;
  const duplicateGroups = [...frequencies.values()].filter(count => count > 1).length;

  let comparedPairs = 0;
  let similarPairs = 0;
  let nearestSimilarityTotal = 0;
  let nearestSimilarityCount = 0;
  const onset = new Set<string>();
  const endings = new Set<string>();
  const lengths = new Set<number>();

  for (let i = 0; i < names.length; i++) {
    const current = codePoints(names[i]);
    if (current.length) {
      onset.add(current[0]);
      endings.add(current[current.length - 1]);
      lengths.add(current.length);
    }
    let nearest = 0;
    const start = Math.max(0, i - NEIGHBOUR_WINDOW);
    for (let j = start; j < i; j++) {
      const score = similarity(names[i], names[j]);
      comparedPairs++;
      if (score >= SIMILARITY_THRESHOLD && normalized[i] !== normalized[j]) similarPairs++;
      if (score > nearest) nearest = score;
    }
    if (i > start) {
      nearestSimilarityTotal += nearest;
      nearestSimilarityCount++;
    }
  }

  return {
    requested: names.length,
    actual: names.length,
    uniqueNormalized: unique.size,
    duplicateEntries,
    duplicateGroups,
    duplicateRate: names.length ? Number((duplicateEntries / names.length).toFixed(4)) : 0,
    comparedPairs,
    similarPairs,
    similarityThreshold: SIMILARITY_THRESHOLD,
    similarityMethod: `Normalized Unicode code-point Levenshtein similarity against the previous ${NEIGHBOUR_WINDOW} outputs; bounded, not exhaustive.`,
    meanNearestSimilarity: nearestSimilarityCount
      ? Number((nearestSimilarityTotal / nearestSimilarityCount).toFixed(4)) : 0,
    uniqueInitialCharacters: onset.size,
    uniqueFinalCharacters: endings.size,
    uniqueNameLengths: lengths.size,
  };
}

async function main() {
  const styles = Object.keys(SUBCATEGORIES_DATA.anime ?? {});
  if (!styles.length) throw new Error('No Anime style banks were found');

  const allNames: string[] = [];
  const sourceStyles: string[] = [];
  const maxAttempts = Math.ceil(TARGETS[TARGETS.length - 1] / BATCH_SIZE) * 4;
  let attempts = 0;

  while (allNames.length < TARGETS[TARGETS.length - 1] && attempts < maxAttempts) {
    const style = styles[attempts % styles.length];
    const batch = generateNames({
      generator: 'anime',
      style,
      genLanguage: 'ja',
      quantity: BATCH_SIZE,
      seed: `japanese-diversity-v1-${attempts}-${style}`,
    });
    for (const item of batch) {
      if (allNames.length >= TARGETS[TARGETS.length - 1]) break;
      const name = String(item.name ?? '').trim();
      if (!name) continue;
      allNames.push(name);
      sourceStyles.push(style);
    }
    attempts++;
  }

  const reports = TARGETS.map(target => ({
    target,
    metrics: metrics(allNames.slice(0, target)),
  }));
  const payload = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    generator: 'anime',
    generationLanguage: 'ja',
    styles,
    batchSize: BATCH_SIZE,
    attempts,
    totalCollected: allNames.length,
    requestedTargets: [...TARGETS],
    reports,
    limitations: [
      'This is a measurement of current deterministic engine output, not a naturalness assessment.',
      'Similarity checks compare each result with only the previous 25 results; they are not exhaustive pairwise comparisons.',
      'Repeated names across seeded batches are retained because cross-batch repetition is part of the measurement.',
      'Katakana-only script compliance is tested separately from linguistic naturalness.',
    ],
  };

  const outputDir = `${process.cwd()}/artifacts/japanese-quality`;
  await mkdir(outputDir, { recursive: true });
  await writeFile(`${outputDir}/diversity-report.json`, JSON.stringify(payload, null, 2), 'utf8');
  await writeFile(
    `${outputDir}/diversity-sample.csv`,
    ['ordinal,style,name', ...allNames.map((name, i) => `${i + 1},${sourceStyles[i]},"${name.replace(/"/g, '""')}"`)].join('\\n'),
    'utf8',
  );

  for (const report of reports) {
    console.log(JSON.stringify({ target: report.target, ...report.metrics }));
  }
  if (allNames.length < TARGETS[TARGETS.length - 1]) {
    console.error(`FAIL: collected ${allNames.length}/5000 names after ${attempts} attempts`);
    process.exitCode = 1;
  } else {
    console.log('PASS: diversity samples measured at 100, 500, 1,000 and 5,000 outputs');
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
