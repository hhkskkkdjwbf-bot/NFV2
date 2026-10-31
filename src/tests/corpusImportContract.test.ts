import { StagedCorpusRecord, validateStagedCorpusRecord } from '../data/corpusImportContract';
declare const process: { exitCode?: number };

const base: StagedCorpusRecord = {
  id: 'insee-fr-2025-1-gabriel',
  sourceId: 'insee-prenoms-2025',
  sourceRecordId: 'france|2025|male|Gabriel',
  displayName: 'Gabriel',
  recordKind: 'civil-registration-name',
  languageContext: 'fr-FR',
  script: 'Latn',
  observation: { year: 2025, sourceSex: 'male', count: 125 },
  sourceUrl: 'https://www.insee.fr/fr/statistiques/8595130',
  release: '2026-07',
  sourceFileSha256: 'a'.repeat(64),
  attribution: 'Source : Insee, Fichier des prénoms, édition juillet 2026.',
  nativeScriptAttested: true,
};

const cases: Array<[string, StagedCorpusRecord, boolean, boolean]> = [
  ['valid INSEE civil-registration record', base, true, true],
  ['reject INSEE non-multiple-of-five count', { ...base, observation: { ...base.observation!, count: 123 } }, false, false],
  ['reject missing source checksum', { ...base, sourceFileSha256: '' }, false, false],
  ['reject SSA record in INSEE source', { ...base, recordKind: 'ssa-card-application-name' }, false, false],
  ['reject transliteration without relation', { ...base, recordKind: 'transliteration' }, false, false],
  ['keep transliteration out of runtime corpus', { ...base, recordKind: 'transliteration', transliterationOf: 'ssa-us-1880-1-anna', nativeScriptAttested: false }, true, false],
  ['reject common word labelled as attested name', { ...base, recordKind: 'common-word' }, false, false],
  ['reject language inferred from the wrong source context', { ...base, languageContext: 'en-US' }, false, false],
];

const nativeBase: StagedCorpusRecord = {
  ...base,
  id: 'native-ja-001',
  sourceId: 'reviewed-japanese-register',
  sourceRecordId: 'source-entry-001',
  displayName: 'テスト',
  recordKind: 'native-name-attestation',
  languageContext: 'ja-JP',
  script: 'Jpan',
  observation: undefined,
  sourceUrl: 'https://example.org/dataset',
  release: '2026.1',
  sourceFileSha256: 'b'.repeat(64),
  attribution: 'Dataset attribution retained in the source manifest.',
  nativeScriptAttested: true,
};

const nativeCases: Array<[string, StagedCorpusRecord, boolean, boolean]> = [
  ['accept a Japanese native-script preproduction record without runtime approval', nativeBase, true, false],
  ['reject Latin script for Japanese native-name attestation', { ...nativeBase, script: 'Latn' }, false, false],
  ['reject romanized form marked as native-script attested', { ...nativeBase, nativeScriptAttested: false }, false, false],
  ['reject unsupported language from controlled ten-language scope', { ...nativeBase, languageContext: 'fr-FR' }, false, false],
  ['reject malformed native-name locale tag', { ...nativeBase, languageContext: 'ja--JP' }, false, false],
  ['reject birth counts without a source-specific contract', { ...nativeBase, observation: { year: 2025, sourceSex: 'female', count: 10 } }, false, false],
];

const nativeScriptCases: Array<[string, StagedCorpusRecord, boolean, boolean]> = [
  ['accept Japanese script sample', { ...nativeBase, displayName: 'あ' }, true, false],
  ['accept Korean Hangul sample', { ...nativeBase, languageContext: 'ko-KR', script: 'Hang', displayName: '가' }, true, false],
  ['accept Chinese Han sample', { ...nativeBase, languageContext: 'zh-Hans', script: 'Hani', displayName: '山' }, true, false],
  ['accept Russian Cyrillic sample', { ...nativeBase, languageContext: 'ru-RU', script: 'Cyrl', displayName: 'Я' }, true, false],
  ['accept Hindi Devanagari sample', { ...nativeBase, languageContext: 'hi-IN', script: 'Deva', displayName: 'अ' }, true, false],
  ['accept Thai script sample', { ...nativeBase, languageContext: 'th-TH', script: 'Thai', displayName: 'ก' }, true, false],
  ['accept Greek script sample', { ...nativeBase, languageContext: 'el-GR', script: 'Grek', displayName: 'Α' }, true, false],
  ['accept Hebrew script sample', { ...nativeBase, languageContext: 'he-IL', script: 'Hebr', displayName: 'א' }, true, false],
  ['accept Ukrainian Cyrillic sample', { ...nativeBase, languageContext: 'uk-UA', script: 'Cyrl', displayName: 'Ї' }, true, false],
  ['accept Bengali script sample', { ...nativeBase, languageContext: 'bn-BD', script: 'Beng', displayName: 'অ' }, true, false],
  ['reject Latin letters in Japanese native-script record', { ...nativeBase, displayName: 'Taro' }, false, false],
];

let failures = 0;
for (const [label, record, expectedValid, expectedRuntime] of [...cases, ...nativeCases, ...nativeScriptCases]) {
  const result = validateStagedCorpusRecord(record);
  const ok = result.valid === expectedValid && result.runtimeEligible === expectedRuntime;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) {
    failures++;
    console.error(result.errors);
  }
}
console.log(`${cases.length + nativeCases.length + nativeScriptCases.length - failures}/${cases.length + nativeCases.length + nativeScriptCases.length} corpus-import contract checks passed`);
if (failures) process.exitCode = 1;
