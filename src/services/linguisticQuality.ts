/**
 * Explainable, conservative quality signals for generated names.
 * This module deliberately does not claim to judge idiomaticity or semantics.
 */
export type FindingSeverity = 'info' | 'warning' | 'error';
export type QualityFinding = { code: string; severity: FindingSeverity; message: string };
export type Dimension = { score: number | null; weight: number; status: 'measured' | 'pending' };
export type NameQualityInput = {
  name: string;
  language: string;
  category?: string;
  batchNames?: string[];
  humanNaturalness?: number;
  humanCategoryFit?: number;
};
export type NameQualityResult = {
  score: number | null;
  coverage: number;
  dimensions: {
    scriptIntegrity: Dimension;
    textHygiene: Dimension;
    readability: Dimension;
    distinctiveness: Dimension;
    naturalness: Dimension;
    categoryFit: Dimension;
  };
  findings: QualityFinding[];
  interpretation: string;
};

const PRIMARY_SCRIPTS: Record<string, string[]> = {
  ar: ['Arabic'], he: ['Hebrew'], ru: ['Cyrillic'], uk: ['Cyrillic'],
  el: ['Greek'], hi: ['Devanagari'], bn: ['Bengali'], th: ['Thai'],
  ko: ['Hangul'], ja: ['Han', 'Hiragana', 'Katakana'], zh: ['Han'],
  fr: ['Latin'], en: ['Latin'], tr: ['Latin'], es: ['Latin'], de: ['Latin'],
  it: ['Latin'], pt: ['Latin'], nl: ['Latin'], pl: ['Latin'], sv: ['Latin'],
  vi: ['Latin'], id: ['Latin'], cs: ['Latin'], ro: ['Latin'], da: ['Latin'],
  fi: ['Latin'], nb: ['Latin'],
};
const SCRIPT_TESTS: Array<[string, RegExp]> = [
  ['Latin', /\p{Script=Latin}/u], ['Arabic', /\p{Script=Arabic}/u],
  ['Hebrew', /\p{Script=Hebrew}/u], ['Cyrillic', /\p{Script=Cyrillic}/u],
  ['Greek', /\p{Script=Greek}/u], ['Devanagari', /\p{Script=Devanagari}/u],
  ['Bengali', /\p{Script=Bengali}/u], ['Thai', /\p{Script=Thai}/u],
  ['Hangul', /\p{Script=Hangul}/u], ['Han', /\p{Script=Han}/u],
  ['Hiragana', /\p{Script=Hiragana}/u], ['Katakana', /\p{Script=Katakana}/u],
];
const WEIGHTS = { scriptIntegrity: 25, textHygiene: 15, readability: 10, distinctiveness: 15, naturalness: 15, categoryFit: 20 };

function dimension(score: number | null, weight: number): Dimension {
  return { score, weight, status: score === null ? 'pending' : 'measured' };
}
function scriptsIn(value: string): string[] {
  const found = new Set<string>();
  for (const char of Array.from(value.normalize('NFC'))) {
    if (!/\p{L}/u.test(char)) continue;
    for (const [name, pattern] of SCRIPT_TESTS) if (pattern.test(char)) found.add(name);
  }
  return [...found].sort();
}
function rating(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null;
  return Math.max(1, Math.min(5, value)) * 20;
}
function normalized(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/[\p{P}\p{S}\s]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

export function evaluateGeneratedName(input: NameQualityInput): NameQualityResult {
  const name = String(input.name ?? '');
  const findings: QualityFinding[] = [];
  const lang = input.language.toLowerCase();
  const observedScripts = scriptsIn(name);
  const expected = PRIMARY_SCRIPTS[lang];
  let scriptScore: number | null = null;

  if (!name.trim() || !/\p{L}/u.test(name)) {
    scriptScore = 0;
    findings.push({ code: 'NO_LETTERS', severity: 'error', message: 'Le résultat ne contient aucune lettre exploitable.' });
  } else if (!expected) {
    findings.push({ code: 'SCRIPT_UNMAPPED', severity: 'info', message: 'Aucune famille de script de référence n’est définie pour cette langue.' });
  } else {
    const unexpected = observedScripts.filter(script => !expected.includes(script));
    const missingExpected = !observedScripts.some(script => expected.includes(script));
    if (missingExpected && unexpected.length) {
      // A fully transliterated or borrowed name can be legitimate; request review, do not reject.
      scriptScore = 75;
      findings.push({ code: 'SCRIPT_TRANSLITERATION_REVIEW', severity: 'warning', message: `Le script principal (${expected.join(', ')}) est absent ; vérifier si cette graphie translittérée est intentionnelle.` });
    } else if (missingExpected) {
      scriptScore = 35;
      findings.push({ code: 'EXPECTED_SCRIPT_ABSENT', severity: 'warning', message: `Aucun script principal attendu (${expected.join(', ')}) n’a été détecté.` });
    } else if (unexpected.length) {
      scriptScore = 75;
      findings.push({ code: 'MIXED_SCRIPT_REVIEW', severity: 'warning', message: `Scripts supplémentaires détectés : ${unexpected.join(', ')}. Vérifier qu’il s’agit d’un choix intentionnel.` });
    } else {
      scriptScore = 100;
      findings.push({ code: 'SCRIPT_MATCH', severity: 'info', message: `Script(s) compatible(s) avec la langue : ${observedScripts.join(', ')}.` });
    }
  }

  let hygieneScore = 100;
  if (!name.trim()) hygieneScore = 0;
  if (/[\u0000-\u001F\u007F-\u009F]/u.test(name)) {
    hygieneScore -= 50;
    findings.push({ code: 'CONTROL_CHARACTER', severity: 'error', message: 'Caractère de contrôle présent.' });
  }
  if (name.includes('\uFFFD') || /[\uE000-\uF8FF]/u.test(name)) {
    hygieneScore -= 35;
    findings.push({ code: 'INVALID_OR_PRIVATE_USE_CHARACTER', severity: 'warning', message: 'Caractère de remplacement ou zone Unicode privée détecté.' });
  }
  if (/(.)\1{3,}/u.test(name)) {
    hygieneScore -= 20;
    findings.push({ code: 'REPEATED_CHARACTER_RUN', severity: 'warning', message: 'Séquence de quatre caractères identiques ou plus.' });
  }
  hygieneScore = Math.max(0, hygieneScore);
  if (hygieneScore === 100) findings.push({ code: 'TEXT_HYGIENE_OK', severity: 'info', message: 'Aucun défaut technique de texte détecté par les contrôles disponibles.' });

  const count = Array.from(name.normalize('NFC').trim()).length;
  const readabilityScore = count === 0 ? 0 : count < 2 ? 30 : count <= 24 ? 100 : count <= 32 ? 75 : count <= 48 ? 50 : 25;
  if (count > 32) findings.push({ code: 'LONG_NAME', severity: 'warning', message: `Nom long (${count} points de code) : vérifier sa mémorisation et son affichage.` });
  if (count > 0 && count < 2) findings.push({ code: 'VERY_SHORT_NAME', severity: 'warning', message: 'Nom très court : vérifier qu’il est distinctif et prononçable.' });

  let distinctivenessScore: number | null = null;
  if (input.batchNames && input.batchNames.length > 0) {
    const key = normalized(name);
    const collisions = input.batchNames.filter(candidate => normalized(candidate) === key).length;
    distinctivenessScore = collisions <= 1 ? 100 : Math.max(0, 100 - (collisions - 1) * 25);
    if (collisions > 1) findings.push({ code: 'BATCH_DUPLICATE', severity: 'warning', message: `Le nom apparaît ${collisions} fois dans le lot comparé.` });
  } else {
    findings.push({ code: 'DISTINCTIVENESS_PENDING', severity: 'info', message: 'La diversité nécessite une comparaison avec les autres noms du même lot ou historique.' });
  }

  const naturalness = rating(input.humanNaturalness);
  const categoryFit = rating(input.humanCategoryFit);
  if (naturalness === null) findings.push({ code: 'HUMAN_NATURALNESS_PENDING', severity: 'info', message: 'La naturalité doit être évaluée par une personne compétente dans la langue.' });
  if (categoryFit === null) findings.push({ code: 'CATEGORY_FIT_PENDING', severity: 'info', message: `La pertinence pour la catégorie ${input.category || 'demandée'} nécessite une évaluation humaine ou un validateur spécialisé.` });

  const dimensions = {
    scriptIntegrity: dimension(scriptScore, WEIGHTS.scriptIntegrity),
    textHygiene: dimension(hygieneScore, WEIGHTS.textHygiene),
    readability: dimension(readabilityScore, WEIGHTS.readability),
    distinctiveness: dimension(distinctivenessScore, WEIGHTS.distinctiveness),
    naturalness: dimension(naturalness, WEIGHTS.naturalness),
    categoryFit: dimension(categoryFit, WEIGHTS.categoryFit),
  };
  const measured = Object.values(dimensions).filter(item => item.score !== null);
  const availableWeight = measured.reduce((sum, item) => sum + item.weight, 0);
  const weighted = measured.reduce((sum, item) => sum + (item.score! * item.weight), 0);
  return {
    score: availableWeight ? Math.round(weighted / availableWeight) : null,
    coverage: Math.round(availableWeight),
    dimensions,
    findings,
    interpretation: 'Score partiel et explicable : les dimensions non mesurées restent en attente. Ce résultat ne certifie ni la naturalité, ni la pertinence sémantique, ni la disponibilité juridique.',
  };
}
