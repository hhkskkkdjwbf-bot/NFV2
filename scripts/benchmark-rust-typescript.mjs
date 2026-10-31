
import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sizes = [10_000, 100_000, 1_000_000];
const alphabet = ['Élodie','E\\u0301lodie','محمد','مُحَمَّد','東京','京都','A+B','Name Forge','नाम','김민준','Zoë','Zoë-2','Δημήτρης','Иван'];
const inputPath = path.join(root, 'artifacts/rust-benchmark/input.json');
const reportPath = path.join(root, 'artifacts/rust-benchmark/report.json');
const rustBin = path.join(root, 'rust/target/release/nameforge-bench');

function key(value) {
  return Array.from(value.normalize('NFC'), ch => ch.toLowerCase()).join('')
    .replace(/[^\\p{L}\\p{M}\\p{N}\\p{S}]+/gu, ' ').trim().replace(/\\s+/g, ' ');
}
function distance(a, b) {
  const left = Array.from(key(a)), right = Array.from(key(b));
  let x = left, y = right;
  if (x.length > y.length) [x, y] = [y, x];
  let row = Array.from({ length: x.length + 1 }, (_, i) => i);
  for (let i = 0; i < y.length; i++) {
    let diagonal = row[0]; row[0] = i + 1;
    for (let j = 0; j < x.length; j++) {
      const above = row[j + 1];
      row[j + 1] = Math.min(row[j + 1] + 1, row[j] + 1, diagonal + (x[j] === y[i] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[x.length];
}
function hashStrings(items) {
  let hash = 0xcbf29ce484222325n;
  for (const item of items) {
    for (const byte of [...Buffer.from(item, 'utf8'), 255]) {
      hash ^= BigInt(byte);
      hash = BigInt.asUintN(64, hash * 0x100000001b3n);
    }
  }
  return hash.toString(16).padStart(16, '0');
}
function calculate(values) {
  const normalized = values.map(key);
  const seen = new Set(), unique = [];
  for (let i = 0; i < values.length; i++) {
    if (normalized[i] && !seen.has(normalized[i])) {
      seen.add(normalized[i]); unique.push(values[i]);
    }
  }
  let distanceChecksum = 0;
  for (let i = 0; i + 1 < values.length; i += 2) distanceChecksum += distance(values[i], values[i + 1]);
  return {
    input_count: values.length,
    normalized_count: normalized.length,
    unique_count: unique.length,
    normalized_hash: hashStrings(normalized),
    deduplicated_hash: hashStrings(unique),
    distance_checksum: distanceChecksum,
  };
}
function runTimed(command, args, label) {
  const start = performance.now();
  const result = spawnSync('/usr/bin/time', ['-f', '%M', command, ...args], {
    cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  });
  const elapsedMs = performance.now() - start;
  if (result.status !== 0) throw new Error(`${label} failed: ${result.stderr} ${result.stdout}`);
  const rssLine = result.stderr.trim().split('\\n').at(-1);
  const maxRssKb = Number(rssLine);
  return { elapsedMs: Number(elapsedMs.toFixed(2)), maxRssKb: Number.isFinite(maxRssKb) ? maxRssKb : null, stdout: result.stdout.trim() };
}
if (process.argv[2] === '--typescript-worker') {
  const values = JSON.parse(await readFile(process.argv[3], 'utf8'));
  process.stdout.write(JSON.stringify(calculate(values)));
} else {
  await mkdir(path.dirname(inputPath), { recursive: true });
  const report = {
    schema_version: 1,
    methodology: 'Same deterministic UTF-8 JSON input file per runtime. RSS is GNU time maximum resident set size in KiB. Timing includes process startup and input parsing. No speedup is asserted unless parity passes.',
    runs: [],
  };
  for (const size of sizes) {
    const values = Array.from({ length: size }, (_, i) => alphabet[(i * 17 + Math.floor(i / 7)) % alphabet.length] + (i % 19 === 0 ? String(i) : ''));
    await writeFile(inputPath, JSON.stringify(values), 'utf8');
    const ts = runTimed(process.execPath, [fileURLToPath(import.meta.url), '--typescript-worker', inputPath], 'TypeScript');
    const rust = runTimed(rustBin, [inputPath], 'Rust');
    const tsResult = JSON.parse(ts.stdout), rustResult = JSON.parse(rust.stdout);
    const parity = JSON.stringify(tsResult) === JSON.stringify(rustResult);
    report.runs.push({
      input_count: size, parity,
      typescript: { elapsed_ms: ts.elapsedMs, max_rss_kb: ts.maxRssKb },
      rust: { elapsed_ms: rust.elapsedMs, max_rss_kb: rust.maxRssKb },
      results: { typescript: tsResult, rust },
    });
    console.log(JSON.stringify(report.runs.at(-1)));
    if (!parity) throw new Error(`Rust/TypeScript parity failure for ${size} names`);
  }
  await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Benchmark report: ${path.relative(root, reportPath)}`);
}
