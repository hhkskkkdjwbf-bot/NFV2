declare const process: { exitCode?: number };
import { getFamilyLinguisticPolicy, getLanguageScriptProfile, getScriptsInText, isKeywordCompatibleWithLanguage } from '../services/linguisticRules';
import { countOrthographicUnits, getOrthographicProfile, requiresWholeTokenGeneration, splitOrthographicUnits } from '../services/orthographicUnits';
import { applyTurkishSuffix, inflectRegularSpanishOAdjective } from '../services/languageMorphology';

import { getLanguagePhoneticReadiness, getPhoneticReadinessSummary, LANGUAGE_PHONETIC_READINESS } from '../services/phoneticReadiness';
import { screenNameSemantics } from '../services/semanticSafety';
import { getRegionalLocaleProfile, resolveGenerationLanguage } from '../services/regionalLocales';
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
checks.push(['Non-precomposed Hangul input is not misread as a syllable block', decomposeHangulSyllable('한')?.coda === 'ᆫ']);
checks.push(['Chinese phonetic generation stays disabled without a tone lexicon', getPhoneticModelProfile('zh')?.generationEnabled === false && getPhoneticModelProfile('zh')?.status === 'reference-data-required']);
checks.push(['All ten native-script phonetic profiles state their implementation status', nativeScriptLanguages.every((language) => Boolean(getPhoneticModelProfile(language)))]);


checks.push(['en-GB resolves to English with explicit regional metadata', getRegionalLocaleProfile('en-gb')?.language === 'en' && getRegionalLocaleProfile('en-gb')?.region === 'GB']);
checks.push(['French Canadian locale resolves without pretending regional rules exist', getRegionalLocaleProfile('fr_CA')?.fallback === 'fr' && getRegionalLocaleProfile('fr_CA')?.regionalDataStatus === 'metadata-only']);
checks.push(['Brazilian and European Portuguese remain distinct locale tags', getRegionalLocaleProfile('pt-BR')?.tag !== getRegionalLocaleProfile('pt-PT')?.tag]);
checks.push(['Simplified and Traditional Chinese script tags remain distinct', getRegionalLocaleProfile('zh-Hans')?.script === 'Hans' && getRegionalLocaleProfile('zh-Hant')?.script === 'Hant']);
checks.push(['Regional locale maps to its base generation language', resolveGenerationLanguage('es-MX') === 'es']);
checks.push(['Unknown region is not silently accepted as a supported locale', getRegionalLocaleProfile('en-AU') === undefined]);

checks.push(['BCP 47 script and region casing resolves French Canadian', getRegionalLocaleProfile('FR-latn-ca')?.tag === 'fr-CA']);
checks.push(['BCP 47 Unicode extensions do not break locale resolution', getRegionalLocaleProfile('en-GB-u-ca-gregory')?.tag === 'en-GB']);
checks.push(['Chinese region infers Simplified script for Singapore', getRegionalLocaleProfile('zh-SG')?.script === 'Hans']);
checks.push(['Chinese region infers Traditional script for Hong Kong', getRegionalLocaleProfile('zh-HK')?.script === 'Hant']);
checks.push(['Explicit Chinese script takes precedence over region', getRegionalLocaleProfile('zh-Hant-CN')?.script === 'Hant']);
checks.push(['BCP 47 private-use suffix does not change the base language', resolveGenerationLanguage('pt-BR-x-local') === 'pt']);
checks.push(['Malformed empty BCP 47 subtags are rejected', resolveGenerationLanguage('en--GB') === undefined]);
checks.push(['Malformed language subtags are rejected', resolveGenerationLanguage('english-US') === undefined]);



const sampleRiskLexicon = [{
  id: 'test-risk-1', language: 'en' as const, term: 'badword', level: 'high' as const,
  meaning: 'Test-only placeholder term', sourceUrl: 'https://example.org/test-lexicon',
  sourceLicense: 'CC0 test fixture', reviewer: 'Automated test fixture',
  reviewedAt: '2026-10-31', humanVerified: true,
}];
checks.push(['Semantic screening never claims safety when a language lexicon is absent', screenNameSemantics('Example', 'ja', []).status === 'not-screened']);
checks.push(['Semantic screening blocks an exact reviewed high-risk match', screenNameSemantics('Badword', 'en', sampleRiskLexicon).status === 'blocked']);
checks.push(['Semantic screening does not match a term inside a longer word', screenNameSemantics('badwording', 'en', sampleRiskLexicon).status === 'no-match']);
checks.push(['Unreviewed semantic terms are ignored', screenNameSemantics('badword', 'en', [{ ...sampleRiskLexicon[0], humanVerified: false }]).status === 'not-screened']);
checks.push(['Empty semantic terms cannot block every candidate', screenNameSemantics('Example', 'en', [{ ...sampleRiskLexicon[0], term: '' }]).status === 'not-screened']);
checks.push(['Invalid review dates are excluded from semantic screening', screenNameSemantics('badword', 'en', [{ ...sampleRiskLexicon[0], reviewedAt: 'not-a-date' }]).status === 'not-screened']);
checks.push(['Chinese risk terms are detected without whitespace boundaries', screenNameSemantics('前缀风险词后缀', 'zh', [{ ...sampleRiskLexicon[0], language: 'zh', term: '风险词' }]).status === 'blocked']);
checks.push(['A punctuation-delimited Latin risk term still matches', screenNameSemantics('name-badword!', 'en', sampleRiskLexicon).status === 'blocked']);



const phoneticReadiness = getPhoneticReadinessSummary();
checks.push(['Phonetic readiness inventory covers exactly 28 natural languages', phoneticReadiness.totalLanguages === 28]);
checks.push(['No language is falsely marked phonetic-generation-ready', phoneticReadiness.generationEnabled === 0]);
checks.push(['Japanese and Korean are explicitly partial rather than complete', getLanguagePhoneticReadiness('ja')?.readiness === 'partial-segmentation' && getLanguagePhoneticReadiness('ko')?.readiness === 'partial-segmentation']);
checks.push(['Remaining 26 languages explicitly require pronunciation references', phoneticReadiness.referenceDataRequired === 26]);
checks.push(['All language profiles explain missing phonetic evidence', Object.values(LANGUAGE_PHONETIC_READINESS).every(profile => profile.limitation.length > 20 && profile.requiredEvidence.length > 0)]);

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
console.log(`${checks.length - failed.length}/${checks.length} linguistic rule checks passed`);
if (failed.length) process.exitCode = 1;
