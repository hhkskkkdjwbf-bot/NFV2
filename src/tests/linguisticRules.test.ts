declare const process: { exitCode?: number };
import { getFamilyLinguisticPolicy, getLanguageScriptProfile, getScriptsInText, isKeywordCompatibleWithLanguage } from '../services/linguisticRules';
import { countOrthographicUnits, getOrthographicProfile, requiresWholeTokenGeneration, splitOrthographicUnits } from '../services/orthographicUnits';
const checks: Array<[string, boolean]> = [
 ['Arabic uses native script and whole tokens', getLanguageScriptProfile('ar').scripts.includes('Arabic') && getLanguageScriptProfile('ar').requiresWholeTokens],
 ['Japanese supports Han/Hiragana/Katakana', ['Han','Hiragana','Katakana'].every((s) => getLanguageScriptProfile('ja').scripts.includes(s as never))],
 ['Russian is Cyrillic', getLanguageScriptProfile('ru').scripts[0] === 'Cyrillic' && getLanguageScriptProfile('ru').requiresWholeTokens],
 ['Vietnamese is Latin', getLanguageScriptProfile('vi').scripts[0] === 'Latin' && !getLanguageScriptProfile('vi').requiresWholeTokens],
 ['Script detector sees Arabic', getScriptsInText('نور').includes('Arabic')],
 ['Script detector detects mixed text', getScriptsInText('نورStar').length === 2],
 ['Arabic keyword accepts Arabic', isKeywordCompatibleWithLanguage('نور','ar')],
 ['Arabic transliteration is accepted as input', isKeywordCompatibleWithLanguage('Nour','ar')],
 ['Mixed Arabic/Latin keyword rejected', !isKeywordCompatibleWithLanguage('نورStar','ar')],
 ['Business family excludes epic compound', !getFamilyLinguisticPolicy('business','brand','fr').strategies.includes('epic_compound')],
 ['Fantasy retains epic compound', getFamilyLinguisticPolicy('fantasy','fantasy','fr').strategies.includes('epic_compound')],
 ['Writing family disables gender morphology', !getFamilyLinguisticPolicy('writing','book','fr').allowGenderMorphology],
 ['Arabic disables Latin-oriented blend', !getFamilyLinguisticPolicy('fantasy','fantasy','ar').strategies.includes('portmanteau_blend')],
 ['Arabic disables Latin gender suffixes', !getFamilyLinguisticPolicy('characters','anime_hero','ar').allowGenderMorphology],
];
const nativeScriptLanguages = ['ja','ko','zh','ru','hi','th','el','he','uk','bn'] as const;
for (const language of nativeScriptLanguages) {
  checks.push([`${language} has an explicit orthographic profile`, Boolean(getOrthographicProfile(language))]);
  checks.push([`${language} preserves whole-token generation`, requiresWholeTokenGeneration(language)]);
}
checks.push(['NFC normalization keeps Greek tonos as one grapheme', countOrthographicUnits('ά', 'el') === 1]);
checks.push(['Hangul syllable block is not split into jamo', splitOrthographicUnits('한', 'ko').length === 1]);
checks.push(['Devanagari vowel mark stays attached to its consonant', splitOrthographicUnits('कि', 'hi').length === 1]);
checks.push(['Bengali vowel mark stays attached to its consonant', splitOrthographicUnits('কি', 'bn').length === 1]);
checks.push(['Thai tone/ vowel marks remain attached to the base grapheme', splitOrthographicUnits('กิ', 'th').length === 1]);
checks.push(['Kana text is counted by grapheme rather than UTF-16 code unit', countOrthographicUnits('が', 'ja') === 1]);
checks.push(['Orthographic profiles do not claim phonetic transcription', nativeScriptLanguages.every((language) => getOrthographicProfile(language)?.generation === 'whole-token')]);

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
console.log(`${checks.length - failed.length}/${checks.length} linguistic rule checks passed`);
if (failed.length) process.exitCode = 1;
