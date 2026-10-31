declare const process: { exitCode?: number };
import { getFamilyLinguisticPolicy, getLanguageScriptProfile, getScriptsInText, isKeywordCompatibleWithLanguage } from '../services/linguisticRules';
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
const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
console.log(`${checks.length - failed.length}/${checks.length} linguistic rule checks passed`);
if (failed.length) process.exitCode = 1;
