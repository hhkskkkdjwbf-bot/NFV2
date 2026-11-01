import React, { useMemo, useState } from 'react';
import { Copy, Dices, RefreshCw, Check, ShieldCheck, Sparkles } from 'lucide-react';
import {
  countUsernameCharacters,
  generateUsernameSuggestions,
  validateUsername,
  UsernameStyle,
} from '../services/usernameDesigner';
import { getAppSettings, subscribeToSettings } from '../services/settings';

const COPY = {
  en: {
    eyebrow: 'NAMEFORGE TOOLKIT', title: 'Username Designer', subtitle: 'Create a handle that fits your identity, game or online project.',
    base: 'Base word (optional)', baseHint: 'Your name, nickname or a word you like', prefix: 'Prefix', suffix: 'Suffix',
    prefixHint: 'e.g. Neo', suffixHint: 'e.g. Plays', style: 'Style', gaming: 'Gaming', fantasy: 'Fantasy', minimal: 'Minimal', elegant: 'Elegant',
    min: 'Minimum length', max: 'Maximum length', generate: 'Generate usernames', generating: 'Generating…', results: 'Suggestions',
    copy: 'Copy', copyAll: 'Copy all', copied: 'Copied', empty: 'No usernames fit these rules. Try a wider length range or shorter prefix/suffix.',
    validation: 'Character checker', valid: 'Valid username', invalid: 'Needs attention', length: 'characters',
    allowed: 'Allowed: letters, numbers, underscore (_) and hyphen (-). Spaces and symbols are not allowed.',
    invalidCharacters: 'Contains unsupported characters.', tooShort: 'Below the minimum length.', tooLong: 'Above the maximum length.',
    emptyValue: 'Enter a username to check.', invalidLimits: 'The length limits are not valid.', presets: 'Quick picks',
    gamingDesc: 'Bold, competitive and streamer-friendly', fantasyDesc: 'Mythic, magical and adventurous', minimalDesc: 'Short, clean and easy to remember', elegantDesc: 'Polished, refined and distinctive',
  },
  fr: {
    eyebrow: 'OUTILS NAMEFORGE', title: 'Créateur de pseudos', subtitle: 'Créez un identifiant adapté à votre univers, vos jeux ou votre projet en ligne.',
    base: 'Mot de base (facultatif)', baseHint: 'Votre prénom, pseudo ou un mot que vous aimez', prefix: 'Préfixe', suffix: 'Suffixe',
    prefixHint: 'ex. Neo', suffixHint: 'ex. Plays', style: 'Style', gaming: 'Gaming', fantasy: 'Fantasy', minimal: 'Minimaliste', elegant: 'Élégant',
    min: 'Longueur minimale', max: 'Longueur maximale', generate: 'Générer des pseudos', generating: 'Génération…', results: 'Suggestions',
    copy: 'Copier', copyAll: 'Tout copier', copied: 'Copié', empty: 'Aucun pseudo ne respecte ces règles. Élargissez la longueur ou raccourcissez le préfixe/suffixe.',
    validation: 'Vérificateur de caractères', valid: 'Pseudo valide', invalid: 'À corriger', length: 'caractères',
    allowed: 'Autorisés : lettres, chiffres, tiret bas (_) et tiret (-). Les espaces et symboles sont refusés.',
    invalidCharacters: 'Contient des caractères non autorisés.', tooShort: 'Plus court que la limite minimale.', tooLong: 'Dépasse la longueur maximale.',
    emptyValue: 'Saisissez un pseudo à vérifier.', invalidLimits: 'Les limites de longueur sont incorrectes.', presets: 'Suggestions rapides',
    gamingDesc: 'Audacieux, compétitif et adapté au streaming', fantasyDesc: 'Mythique, magique et aventureux', minimalDesc: 'Court, net et facile à retenir', elegantDesc: 'Soigné, raffiné et distinctif',
  },
  ar: {
    eyebrow: 'أدوات NAMEFORGE', title: 'مصمم أسماء المستخدمين', subtitle: 'أنشئ اسم مستخدم يناسب هويتك أو ألعابك أو مشروعك على الإنترنت.',
    base: 'الكلمة الأساسية (اختياري)', baseHint: 'اسمك أو لقبك أو كلمة تحبها', prefix: 'بادئة', suffix: 'لاحقة',
    prefixHint: 'مثال: Neo', suffixHint: 'مثال: Plays', style: 'النمط', gaming: 'ألعاب', fantasy: 'خيالي', minimal: 'بسيط', elegant: 'أنيق',
    min: 'الحد الأدنى للطول', max: 'الحد الأقصى للطول', generate: 'إنشاء أسماء المستخدمين', generating: 'جارٍ الإنشاء…', results: 'الاقتراحات',
    copy: 'نسخ', copyAll: 'نسخ الكل', copied: 'تم النسخ', empty: 'لا توجد أسماء توافق هذه القواعد. جرّب نطاق طول أوسع أو بادئة/لاحقة أقصر.',
    validation: 'فاحص الأحرف', valid: 'اسم صالح', invalid: 'يحتاج إلى تعديل', length: 'أحرف',
    allowed: 'المسموح: الحروف والأرقام والشرطة السفلية (_) والواصلة (-). المسافات والرموز غير مسموحة.',
    invalidCharacters: 'يحتوي على أحرف غير مسموحة.', tooShort: 'أقصر من الحد الأدنى.', tooLong: 'يتجاوز الحد الأقصى للطول.',
    emptyValue: 'أدخل اسمًا للتحقق منه.', invalidLimits: 'حدود الطول غير صحيحة.', presets: 'اختيارات سريعة',
    gamingDesc: 'قوي وتنافسي ومناسب للبث', fantasyDesc: 'أسطوري وسحري ومغامر', minimalDesc: 'قصير وواضح وسهل التذكر', elegantDesc: 'مصقول وراقٍ ومميز',
  },
};

type Language = keyof typeof COPY;
const STYLE_KEYS: UsernameStyle[] = ['gaming', 'fantasy', 'minimal', 'elegant'];
const QUICK_PREFIXES: Record<UsernameStyle, string[]> = {
  gaming: ['Neo', 'Dark', 'X'], fantasy: ['Rune', 'Aether', 'Moon'], minimal: ['Zen', 'Mono', 'N'], elegant: ['Sir', 'The', 'De'],
};
const QUICK_SUFFIXES: Record<UsernameStyle, string[]> = {
  gaming: ['GG', 'Plays', 'FPS'], fantasy: ['Born', 'Blade', 'Weaver'], minimal: ['IO', 'HQ', '01'], elegant: ['Studio', 'Noir', 'Luxe'],
};

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch { /* use the local fallback below */ }
  const area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try { return document.execCommand('copy'); }
  catch { return false; }
  finally { area.remove(); }
}

export const UsernameDesignerView: React.FC = () => {
  const [language, setLanguage] = useState(getAppSettings().language);
  React.useEffect(() => subscribeToSettings((settings) => setLanguage(settings.language)), []);
  const languageKey: Language = language in COPY ? language as Language : 'en';
  const t = COPY[languageKey];
  const [baseName, setBaseName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [style, setStyle] = useState<UsernameStyle>('gaming');
  const [minLength, setMinLength] = useState(3);
  const [maxLength, setMaxLength] = useState(16);
  const [checkValue, setCheckValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copied, setCopied] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  const validation = useMemo(() => validateUsername(checkValue, minLength, maxLength), [checkValue, minLength, maxLength]);
  const errorText = (error: string) => ({
    'invalid-characters': t.invalidCharacters, 'too-short': t.tooShort, 'too-long': t.tooLong,
    'empty': t.emptyValue, 'invalid-limits': t.invalidLimits, 'whitespace': t.invalidCharacters,
  }[error] || error);

  const generate = () => {
    setSuggestions(generateUsernameSuggestions({ baseName, prefix, suffix, style, minLength, maxLength, quantity: 16 }));
    setCopied('');
    setCopyMessage('');
  };

  const handleCopy = async (name: string) => {
    const success = await copyText(name);
    setCopied(success ? name : '');
    setCopyMessage(success ? t.copied : t.invalidCharacters);
  };

  const handleCopyAll = async () => {
    if (suggestions.length) {
      const success = await copyText(suggestions.join('\n'));
      setCopyMessage(success ? t.copied : t.invalidCharacters);
    }
  };

  const descriptions: Record<UsernameStyle, string> = {
    gaming: t.gamingDesc, fantasy: t.fantasyDesc, minimal: t.minimalDesc, elegant: t.elegantDesc,
  };

  return (
    <section className="min-h-[75vh] px-4 py-12 sm:px-8" dir={languageKey === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-bold tracking-[0.2em] text-purple-300">
            <Sparkles className="h-4 w-4" /> {t.eyebrow}
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">{t.subtitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
          <div className="rounded-3xl border border-white/10 bg-[#101426] p-5 shadow-2xl sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2 block text-sm font-semibold text-slate-200">
                {t.base}
                <input value={baseName} onChange={(event) => setBaseName(event.target.value)} placeholder={t.baseHint}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-white outline-none transition focus:border-purple-400" />
              </label>
              <label className="block text-sm font-semibold text-slate-200">
                {t.prefix}
                <input value={prefix} onChange={(event) => setPrefix(event.target.value)} placeholder={t.prefixHint}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-white outline-none focus:border-purple-400" />
              </label>
              <label className="block text-sm font-semibold text-slate-200">
                {t.suffix}
                <input value={suffix} onChange={(event) => setSuffix(event.target.value)} placeholder={t.suffixHint}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-white outline-none focus:border-purple-400" />
              </label>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-slate-200">{t.style}</p>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_KEYS.map((key) => (
                  <button key={key} type="button" onClick={() => setStyle(key)}
                    aria-pressed={style === key}
                    className={`rounded-2xl border p-4 text-start transition ${style === key ? 'border-purple-400 bg-purple-500/15 text-white' : 'border-white/10 bg-[#0b1020] text-slate-300 hover:border-white/25'}`}>
                    <span className="block font-bold">{t[key]}</span>
                    <span className="mt-1 block text-xs text-slate-400">{descriptions[key]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="username-min" className="text-sm font-semibold text-slate-200">{t.min}: {minLength}</label>
                <input id="username-min" type="range" min="1" max="20" value={minLength}
                  onChange={(event) => setMinLength(Math.min(Number(event.target.value), maxLength))}
                  className="mt-3 w-full accent-purple-400" />
              </div>
              <div>
                <label htmlFor="username-max" className="text-sm font-semibold text-slate-200">{t.max}: {maxLength}</label>
                <input id="username-max" type="range" min="3" max="30" value={maxLength}
                  onChange={(event) => setMaxLength(Math.max(Number(event.target.value), minLength))}
                  className="mt-3 w-full accent-purple-400" />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b1020] p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{t.presets}</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PREFIXES[style].map((value) => <button key={value} type="button" onClick={() => setPrefix(value)}
                  className="rounded-full border border-purple-400/30 px-3 py-1.5 text-xs text-purple-200 hover:bg-purple-500/10">+ {value}</button>)}
                {QUICK_SUFFIXES[style].map((value) => <button key={value} type="button" onClick={() => setSuffix(value)}
                  className="rounded-full border border-cyan-400/30 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/10">{value} +</button>)}
              </div>
            </div>

            <button type="button" onClick={generate}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4 font-bold text-white shadow-lg shadow-purple-900/20 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300">
              <Dices className="h-5 w-5" /> {t.generate}
            </button>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#101426] p-5 sm:p-7">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <h2 className="text-lg font-bold text-white">{t.validation}</h2>
              </div>
              <label htmlFor="username-check" className="mt-5 block text-sm font-semibold text-slate-200">{t.validation}</label>
              <input id="username-check" value={checkValue} onChange={(event) => setCheckValue(event.target.value)}
                placeholder={t.baseHint} aria-invalid={checkValue.length > 0 && !validation.valid}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-white outline-none focus:border-purple-400" />
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className={validation.valid && checkValue ? 'text-emerald-300' : 'text-amber-300'}>
                  {validation.valid && checkValue ? t.valid : t.invalid}
                </span>
                <span className="text-slate-400">{validation.length} / {maxLength} {t.length}</span>
              </div>
              {validation.errors.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-rose-300" aria-live="polite">
                  {validation.errors.map((error) => <li key={error}>• {errorText(error)}</li>)}
                </ul>
              )}
              <p className="mt-4 text-xs leading-6 text-slate-500">{t.allowed}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#101426] p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-white">{t.results}</h2>
                <button type="button" onClick={generate} className="rounded-lg p-2 text-slate-300 hover:bg-white/5" aria-label={t.generate}>
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {suggestions.length === 0 ? (
                <p className="mt-5 text-sm leading-6 text-slate-400">{t.empty}</p>
              ) : (
                <>
                  <div className="mt-4 space-y-2">
                    {suggestions.map((name) => (
                      <div key={name} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b1020] px-3 py-3">
                        <span className="min-w-0 break-all font-semibold text-slate-100">{name}</span>
                        <button type="button" onClick={() => void handleCopy(name)} aria-label={`${t.copy} ${name}`}
                          className="shrink-0 rounded-lg p-2 text-purple-300 hover:bg-purple-500/10">
                          {copied === name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => void handleCopyAll()}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/30 px-4 py-3 text-sm font-semibold text-purple-200 hover:bg-purple-500/10">
                    <Copy className="h-4 w-4" /> {t.copyAll}
                  </button>
                </>
              )}
              {copyMessage && <p className="mt-3 text-xs text-emerald-300" role="status" aria-live="polite">{copyMessage}</p>}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
