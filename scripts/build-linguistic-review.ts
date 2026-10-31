/**
 * Builds a balanced human linguistic-review queue from the raw deep-dive.
 * Run after audit:generators:deep. Heuristics prioritize review; they are NOT
 * linguistic verdicts. The queue covers every supported language.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

declare const process: { cwd(): string; exitCode?: number };

const LANGUAGES = ['fr','en','ar','tr','es','de','it','pt','ja','ko','zh','ru','hi','nl','pl','sv','vi','id','th','el','he','cs','ro','da','fi','uk','bn','nb'] as const;
const PER_LANGUAGE = 30;
type Output = { seed: string; ordinal: number; name: string; normalized: string; scriptProfile: string[] };
type Scenario = { generatorId: string; category: string; language: string; pipeline: string; outputs: Output[] };
function csv(value: unknown): string {
  const s = String(value ?? '');
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function stableScore(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
function reviewSignals(name: string, profile: string[], lang: string): string[] {
  const signals: string[] = [];
  if (!name.trim()) signals.push('empty_name');
  if (/[\u0000-\u001f]/u.test(name)) signals.push('control_character');
  if (/[\p{Script=Latin}]/u.test(name) && profile.some(s => s !== 'Latin') && lang !== 'ja') {
    signals.push('mixed_script_review');
  }
  if (/(.)\1{3,}/u.test(name)) signals.push('repeated_character_review');
  if (lang !== 'fr' && name === name.normalize('NFC') && /[A-Za-zÀ-ÖØ-öø-ÿ]/u.test(name) && profile.length === 1 && profile[0] === 'Latin') {
    signals.push('attested_name_locale_review');
  }
  return signals;
}
async function main() {
  const root = process.cwd();
  const source = `${root}/artifacts/generator-quality-audit/deep-dive.json`;
  const report = JSON.parse(await readFile(source, 'utf8')) as { scenarios: Scenario[] };
  const scenarios = report.scenarios ?? [];
  const rows: string[][] = [];
  const coverage: Record<string, number> = {};
  for (const lang of LANGUAGES) {
    const candidates = scenarios.filter(s => s.language === lang)
      .flatMap(s => s.outputs.map(o => ({ scenario: s, output: o })))
      .sort((a,b) => {
        const as = reviewSignals(a.output.name, a.output.scriptProfile ?? [], lang).length;
        const bs = reviewSignals(b.output.name, b.output.scriptProfile ?? [], lang).length;
        return bs-as || stableScore(`${lang}:${a.scenario.generatorId}:${a.output.name}`).localeCompare(stableScore(`${lang}:${b.scenario.generatorId}:${b.output.name}`));
      });
    const seenGenerators = new Set<string>();
    const selected: typeof candidates = [];
    // First pass maximizes generator diversity; second pass fills remaining slots.
    for (const item of candidates) {
      if (selected.length >= PER_LANGUAGE) break;
      if (seenGenerators.has(item.scenario.generatorId)) continue;
      selected.push(item); seenGenerators.add(item.scenario.generatorId);
    }
    for (const item of candidates) {
      if (selected.length >= PER_LANGUAGE) break;
      if (selected.some(x => x.scenario.generatorId === item.scenario.generatorId && x.output.name === item.output.name)) continue;
      selected.push(item);
    }
    coverage[lang] = selected.length;
    for (const {scenario, output} of selected) {
      rows.push([
        lang, scenario.generatorId, scenario.category, scenario.pipeline,
        output.seed, output.ordinal, output.name,
        (output.scriptProfile ?? []).join('+'),
        reviewSignals(output.name, output.scriptProfile ?? [], lang).join(';'),
        '', '', '', '', '', ''
      ]);
    }
  }
  const headers = ['language','generatorId','category','pipeline','seed','ordinal','generated_name','unicode_scripts','automatic_review_signals','naturalness_1_5','category_fit_1_5','language_fit_1_5','readability_1_5','offensive_or_cultural_issue','reviewer_notes'];
  const dir = `${root}/artifacts/linguistic-human-review`;
  await mkdir(dir,{recursive:true});
  await writeFile(`${dir}/review-queue-28-languages.csv`,[headers,...rows].map(r=>r.map(csv).join(',')).join('\n'),'utf8');
  const summary = [
    '# Human linguistic review queue — 28 languages','',
    `- Languages covered: ${Object.keys(coverage).length}/28`,
    `- Review samples: ${rows.length}`,
    `- Target: ${PER_LANGUAGE} samples per language`,
    '- Selection: deterministic, prioritizes generator diversity and then reproducible sampling.',
    '- Automatic signals are review prompts only; they do not establish that a name is wrong.',
    '- No human ratings are prefilled. A language is not marked validated until a competent reviewer completes and signs off its rows.',
    '',
    '| Language | Samples |','|---|---:|',
    ...LANGUAGES.map(l=>`| ${l} | ${coverage[l] ?? 0} |`),
    '',
    '## Reviewer rules','',
    'Only review languages you can competently assess. Score naturalness, category fit, language fit and readability from 1 to 5. Explain errors and cultural concerns. Do not penalize legitimate mixed scripts (notably Japanese) or borrowed words without context. Record reviewer identity/qualification and date in the final sign-off maintained by the project owner.',
    '',
    '## Completion status','',
    '**Pending human review.** Generating this queue is not a linguistic validation. Automated checks cannot certify idiomatic usage, morphology, cultural suitability or offensive meanings.'
  ];
  await writeFile(`${dir}/README.md`,summary.join('\n'),'utf8');
  console.log(JSON.stringify({languages:Object.keys(coverage).length,samples:rows.length,coverage,files:[`${dir}/review-queue-28-languages.csv`,`${dir}/README.md`]},null,2));
  if (Object.keys(coverage).length !== 28 || LANGUAGES.some(l=>(coverage[l]??0)!==PER_LANGUAGE)) process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
