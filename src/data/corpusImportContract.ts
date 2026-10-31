export type CorpusSourceId = 'insee-prenoms-2025' | 'ssa-baby-names-national' | (string & {});
export type CorpusRecordKind =
  | 'civil-registration-name'
  | 'ssa-card-application-name'
  | 'native-name-attestation'
  | 'transliteration'
  | 'common-word'
  | 'pronunciation-only';

export interface CorpusObservation {
  year: number;
  sourceSex: 'male' | 'female';
  count?: number;
}

export interface StagedCorpusRecord {
  id: string;
  sourceId: CorpusSourceId;
  sourceRecordId: string;
  displayName: string;
  recordKind: CorpusRecordKind;
  languageContext: string;
  script: string;
  observation?: CorpusObservation;
  sourceUrl: string;
  release: string;
  sourceFileSha256: string;
  attribution: string;
  transliterationOf?: string;
  nativeScriptAttested: boolean;
}

export interface CorpusValidationResult {
  valid: boolean;
  errors: string[];
  runtimeEligible: boolean;
}

const NATIVE_SCRIPT_PATTERNS: Record<string, RegExp> = {
  Jpan: /^[\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\p{M}\\p{N}\\p{Zs}'’・ー-]+$/u,
  Hang: /^[\\p{Script=Hangul}\\p{M}\\p{N}\\p{Zs}'’.-]+$/u,
  Hani: /^[\\p{Script=Han}\\p{M}\\p{N}\\p{Zs}'’·-]+$/u,
  Cyrl: /^[\\p{Script=Cyrillic}\\p{M}\\p{N}\\p{Zs}'’.-]+$/u,
  Deva: /^[\\p{Script=Devanagari}\\p{M}\\p{N}\\p{Zs}'’.-]+$/u,
  Thai: /^[\\p{Script=Thai}\\p{M}\\p{N}\\p{Zs}'’.-]+$/u,
  Grek: /^[\\p{Script=Greek}\\p{M}\\p{N}\\p{Zs}'’.-]+$/u,
  Hebr: /^[\\p{Script=Hebrew}\\p{M}\\p{N}\\p{Zs}'’.-]+$/u,
  Beng: /^[\\p{Script=Bengali}\\p{M}\\p{N}\\p{Zs}'’.-]+$/u,
};

const SHA256 = /^[a-f0-9]{64}$/i;
const SCRIPT_TAG = /^[A-Z][a-z]{3}$/;

export function validateStagedCorpusRecord(record: StagedCorpusRecord): CorpusValidationResult {
  const errors: string[] = [];
  const fail = (message: string) => errors.push(message);

  if (!record.id.trim()) fail('id is required');
  if (!record.sourceRecordId.trim()) fail('sourceRecordId is required');
  if (!record.displayName.trim()) fail('displayName is required');
  if (!SCRIPT_TAG.test(record.script)) fail('script must be a four-letter ISO 15924 code');
  if (!/^https:\/\//.test(record.sourceUrl)) fail('sourceUrl must use HTTPS');
  if (!record.release.trim()) fail('release must be pinned');
  if (!SHA256.test(record.sourceFileSha256)) fail('sourceFileSha256 must be a SHA-256 checksum');
  if (!record.attribution.trim()) fail('attribution is required');

  const expectedContext = record.sourceId === 'insee-prenoms-2025' ? 'fr-FR'
    : record.sourceId === 'ssa-baby-names-national' ? 'en-US' : undefined;
  if (expectedContext && record.languageContext !== expectedContext) {
    fail(`source context must be ${expectedContext}; do not infer name origin from birth location`);
  }

  const nativeScriptByLanguage: Record<string, string> = {
    ja: 'Jpan', ko: 'Hang', zh: 'Hani', ru: 'Cyrl', hi: 'Deva',
    th: 'Thai', el: 'Grek', he: 'Hebr', uk: 'Cyrl', bn: 'Beng',
  };
  if (record.recordKind === 'native-name-attestation') {
    const language = record.languageContext.split('-')[0].toLowerCase();
    const expectedScript = nativeScriptByLanguage[language];
    if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(record.languageContext)) {
      fail('native-name languageContext must be a valid base or regional language tag');
    }
    if (!expectedScript) fail('native-name language is not in the controlled native-bank scope');
    else if (record.script !== expectedScript) fail(`native-name script must be ${expectedScript} for ${language}`);
    if (!record.nativeScriptAttested) fail('native-name attestation must preserve an observed native-script form');
    const scriptPattern = expectedScript ? NATIVE_SCRIPT_PATTERNS[expectedScript] : undefined;
    if (scriptPattern && (!scriptPattern.test(record.displayName) || !/\\p{L}/u.test(record.displayName))) {
      fail('displayName contains characters outside the declared native script or has no letters in that script');
    }
    if (record.observation) fail('native-name attestation cannot carry birth statistics without a source-specific observation contract');
  }

  if (record.recordKind === 'civil-registration-name') {
    if (record.sourceId !== 'insee-prenoms-2025') fail('civil-registration-name is reserved for the INSEE source');
    if (!record.nativeScriptAttested) fail('civil-registration records must preserve their observed spelling');
    if (!record.observation) fail('civil-registration records require year and source sex');
    if (record.observation && (record.observation.year < 1900 || record.observation.year > 2025)) fail('INSEE year must be 1900–2025');
    if (record.observation?.count !== undefined &&
        (!Number.isInteger(record.observation.count) || record.observation.count < 0 || record.observation.count % 5 !== 0)) {
      fail('INSEE count must be a non-negative multiple of five, matching published rounding');
    }
  }

  if (record.recordKind === 'ssa-card-application-name') {
    if (record.sourceId !== 'ssa-baby-names-national') fail('ssa-card-application-name is reserved for the SSA source');
    if (!record.nativeScriptAttested) fail('SSA record must preserve the source spelling; it does not establish etymological origin');
    if (!record.observation) fail('SSA records require year and source sex');
    if (record.observation && (record.observation.year < 1880 || record.observation.year > 2025)) fail('SSA year must be 1880–2025');
    if (record.observation?.count !== undefined &&
        (!Number.isInteger(record.observation.count) || record.observation.count < 5)) {
      fail('SSA counts below five must not be imported because of the source privacy threshold');
    }
  }

  if (record.recordKind === 'transliteration') {
    if (!record.transliterationOf?.trim()) fail('transliteration requires an explicit link to its source name');
    if (record.nativeScriptAttested) fail('a transliteration must never be labelled as native-script attested');
  } else if (record.transliterationOf) {
    fail('transliterationOf is only valid for transliteration records');
  }

  if (record.recordKind === 'common-word' || record.recordKind === 'pronunciation-only') {
    if (record.nativeScriptAttested) fail('common words and pronunciation entries are not attested given names');
  }

  const attestedName = record.recordKind === 'civil-registration-name' ||
    record.recordKind === 'ssa-card-application-name';
  return {
    valid: errors.length === 0,
    errors,
    runtimeEligible: errors.length === 0 && attestedName && record.nativeScriptAttested,
  };
}
