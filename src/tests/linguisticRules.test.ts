declare const process: { exitCode?: number };
import { getFamilyLinguisticPolicy, getLanguageScriptProfile, getScriptsInText, isKeywordCompatibleWithLanguage } from '../services/linguisticRules';
import { countOrthographicUnits, getOrthographicProfile, requiresWholeTokenGeneration, splitOrthographicUnits } from '../services/orthographicUnits';
import { applyTurkishSuffix, inflectRegularSpanishOAdjective } from '../services/languageMorphology';
import { decomposeHangulSyllable, getPhoneticModelProfile, splitJapaneseMora } from '../services/phoneticUnits';
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

checks.push(['Turkish back-vowel harmony selects a', applyTurkishSuffix('okul', 'A') === 'okula']);
checks.push(['Turkish front-vowel harmony selects e', applyTurkishSuffix('ev', 'A') === 'eve']);
checks.push(['Turkish high-vowel harmony selects ü', applyTurkishSuffix('göz', 'I') === 'gözü']);
checks.push(['Turkish consonant harmony devoices after p', applyTurkishSuffix('kitap', 'DAn') === 'kitaptan']);
checks.push(['Turkish consonant harmony remains voiced after vowel', applyTurkishSuffix('ev', 'DA') === 'evde']);
checks.push(['Spanish regular adjective agrees in feminine singular', inflectRegularSpanishOAdjective('alto', 'feminine') === 'alta']);
checks.push(['Spanish regular adjective agrees in masculine plural', inflectRegularSpanishOAdjective('alto', 'masculine', 'plural') === 'altos']);
checks.push(['Spanish regular adjective agrees in feminine plural', inflectRegularSpanishOAdjective('alto', 'feminine', 'plural') === 'altas']);

checks.push(['Japanese small kana attach to the preceding mora', splitJapaneseMora('きゃく').join('|') === 'きゃ|く']);
checks.push(['Japanese long-vowel mark remains a separate mora', splitJapaneseMora('スーパー').join('|') === 'ス|ー|パ|ー']);
const hangul = decomposeHangulSyllable('한');
checks.push(['Hangul syllable decomposes into onset, nucleus and coda', hangul?.onset === 'ᄒ' && hangul?.nucleus === 'ᅡ' && hangul?.coda === 'ᆫ']);
checks.push(['Non-precomposed Hangul input is not misread as a syllable block', decomposeHangulSyllable('한') === null]);
checks.push(['Chinese phonetic generation stays disabled without a tone lexicon', getPhoneticModelProfile('zh')?.generationEnabled === false && getPhoneticModelProfile('zh')?.status === 'reference-data-required']);
checks.push(['All ten native-script phonetic profiles state their implementation status', nativeScriptLanguages.every((language) => Boolean(getPhoneticModelProfile(language)))]);

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
console.log(`${checks.length - failed.length}/${checks.length} linguistic rule checks passed`);
if (failed.length) process.exitCode = 1;
