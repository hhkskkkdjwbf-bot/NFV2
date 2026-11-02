/**
 * Creates a Japanese-language human-review queue from real seeded Anime output.
 * Blank ratings are intentional: automated code must never invent human approval.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { generateNames } from '../src/services/generatorEngine';
import { SUBCATEGORIES_DATA } from '../src/data/subcategories';

declare const process: { cwd(): string; exitCode?: number };

function csv(value: unknown): string {
  const text = String(value ?? '');
  return /[",\\n\\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function main() {
  const styles = Object.keys(SUBCATEGORIES_DATA.anime ?? {});
  const rows: string[][] = [];
  const perStyle = 20;

  for (const style of styles) {
    const collected = new Set<string>();
    for (let seedIndex = 0; seedIndex < 12 && collected.size < perStyle; seedIndex++) {
      const batch = generateNames({
        generator: 'anime',
        style,
        genLanguage: 'ja',
        quantity: 12,
        seed: `japanese-human-review-v1-${style}-${seedIndex}`,
      });
      for (const item of batch) {
        const name = String(item.name ?? '').trim();
        if (name) collected.add(name);
        if (collected.size >= perStyle) break;
      }
    }
    for (const name of collected) {
      rows.push([
        `JA-${String(rows.length + 1).padStart(4, '0')}`, style, name,
        '', '', '', '', '', '', '', '',
      ]);
    }
  }

  const headers = [
    'review_id', 'archetype', 'generated_katakana',
    'naturalness_1_5', 'japanese_language_fit_1_5', 'category_fit_1_5',
    'readability_1_5', 'cultural_or_unintended_association',
    'reviewer_notes', 'reviewer_qualification', 'reviewed_at',
  ];
  const dir = `${process.cwd()}/artifacts/japanese-quality`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/japanese-human-review.csv`, [headers, ...rows].map(row => row.map(csv).join(',')).join('\\n'), 'utf8');

  const summary = [
    '# Japanese Anime output — human review queue', '',
    `- Archetypes sampled: ${styles.length}`,
    `- Rows generated: ${rows.length}`,
    `- Target: ${perStyle} distinct outputs per archetype`,
    '- Ratings are deliberately blank; no human approval is inferred.',
    '', '## Review instructions', '',
    'A reviewer should be proficient in Japanese and comfortable assessing the intended character archetype. Score naturalness, Japanese-language fit, category fit and readability from 1 to 5. Record cultural or unintended associations, explain uncertain readings, and add reviewer qualification and review date.',
    '', '## Keep the three controls separate', '',
    '1. **Conversion:** whether the source romanization was rendered according to the conversion reference.',
    '2. **Diversity:** whether outputs repeat or resemble one another.',
    '3. **Naturalness:** whether a competent Japanese reviewer considers each result plausible and suitable for its archetype.',
    '', 'A Katakana-only result is not proof of an authentic Japanese name. This queue is pending until qualified reviewers complete and sign off.',
  ];
  await writeFile(`${dir}/human-review-instructions.md`, summary.join('\\n'), 'utf8');

  console.log(JSON.stringify({ archetypes: styles.length, rows: rows.length, perStyleTarget: perStyle }));
  if (!styles.length || styles.some(style => rows.filter(row => row[1] === style).length < perStyle)) {
    console.error('FAIL: one or more archetypes did not reach the review sample target');
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
