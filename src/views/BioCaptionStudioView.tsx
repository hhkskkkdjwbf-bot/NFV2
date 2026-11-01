import React, { useMemo, useRef, useState } from 'react';
import { Copy, Check, FileText, Sparkles, AlignLeft, Type, RotateCcw } from 'lucide-react';
import {
  countBioCaptionCharacters,
  countBioCaptionLines,
  DECORATIVE_SEPARATORS,
  getBioCaptionTemplates,
  insertAtTextSelection,
  BioCaptionKind,
} from '../services/bioCaptionStudio';
import { getAppSettings, subscribeToSettings } from '../services/settings';

const COPY = {
  en: {
    eyebrow: 'NAMEFORGE CREATIVE STUDIO', title: 'Bio & Caption Studio', subtitle: 'Shape your profile bio and social captions with editable templates, decorative separators and precise character counts.',
    bio: 'Bio', caption: 'Caption', templates: 'Templates', all: 'All templates', choose: 'Choose a template', editor: 'Your text', placeholder: 'Write or customize your bio or caption…',
    separators: 'Decorative separators', insertLine: 'Insert line break', characters: 'Characters', lines: 'Lines', limit: 'Your character limit', remaining: 'remaining', over: 'over the limit', unlimited: 'No limit set',
    copy: 'Copy text', copied: 'Copied to clipboard', copyError: 'Could not copy text', clear: 'Clear', reset: 'Reset editor', noTemplates: 'No templates in this category.',
    categories: { all: 'All', personal: 'Personal', creator: 'Creator', business: 'Business', minimal: 'Minimal', aesthetic: 'Aesthetic' },
  },
  fr: {
    eyebrow: 'STUDIO CRÉATIF NAMEFORGE', title: 'Studio Bio & Légendes', subtitle: 'Composez votre bio et vos légendes avec des modèles modifiables, des séparateurs décoratifs et un compteur précis.',
    bio: 'Bio', caption: 'Légende', templates: 'Modèles', all: 'Tous les modèles', choose: 'Choisir un modèle', editor: 'Votre texte', placeholder: 'Écrivez ou personnalisez votre bio ou légende…',
    separators: 'Séparateurs décoratifs', insertLine: 'Insérer un saut de ligne', characters: 'Caractères', lines: 'Lignes', limit: 'Votre limite de caractères', remaining: 'restants', over: 'au-delà de la limite', unlimited: 'Aucune limite définie',
    copy: 'Copier le texte', copied: 'Texte copié', copyError: 'Impossible de copier le texte', clear: 'Effacer', reset: 'Réinitialiser', noTemplates: 'Aucun modèle dans cette catégorie.',
    categories: { all: 'Tous', personal: 'Personnel', creator: 'Créateur', business: 'Professionnel', minimal: 'Minimaliste', aesthetic: 'Esthétique' },
  },
  ar: {
    eyebrow: 'استوديو NAMEFORGE الإبداعي', title: 'استوديو النبذة والتعليقات', subtitle: 'أنشئ نبذتك وتعليقاتك باستخدام قوالب قابلة للتعديل وفواصل زخرفية وعداد دقيق للأحرف.',
    bio: 'نبذة', caption: 'تعليق', templates: 'القوالب', all: 'كل القوالب', choose: 'اختر قالباً', editor: 'النص الخاص بك', placeholder: 'اكتب أو عدّل النبذة أو التعليق…',
    separators: 'فواصل زخرفية', insertLine: 'إدراج سطر جديد', characters: 'الأحرف', lines: 'الأسطر', limit: 'حد الأحرف الخاص بك', remaining: 'متبقية', over: 'أكثر من الحد', unlimited: 'لا يوجد حد محدد',
    copy: 'نسخ النص', copied: 'تم نسخ النص', copyError: 'تعذر نسخ النص', clear: 'مسح', reset: 'إعادة ضبط المحرر', noTemplates: 'لا توجد قوالب في هذا التصنيف.',
    categories: { all: 'الكل', personal: 'شخصي', creator: 'صانع محتوى', business: 'أعمال', minimal: 'بسيط', aesthetic: 'جمالي' },
  },
};

type Language = keyof typeof COPY;
type Category = 'all' | 'personal' | 'creator' | 'business' | 'minimal' | 'aesthetic';

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch { /* use fallback */ }
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

export const BioCaptionStudioView: React.FC = () => {
  const [language, setLanguage] = useState(getAppSettings().language);
  React.useEffect(() => subscribeToSettings((settings) => setLanguage(settings.language)), []);
  const languageKey: Language = language in COPY ? language as Language : 'en';
  const t = COPY[languageKey];
  const [kind, setKind] = useState<BioCaptionKind>('bio');
  const [category, setCategory] = useState<Category>('all');
  const [textValue, setTextValue] = useState('');
  const [limit, setLimit] = useState(150);
  const [copyStatus, setCopyStatus] = useState('');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const templates = useMemo(() => getBioCaptionTemplates(languageKey, kind).filter((template) => category === 'all' || template.category === category), [languageKey, kind, category]);
  const characterCount = countBioCaptionCharacters(textValue);
  const lineCount = countBioCaptionLines(textValue);
  const remaining = limit > 0 ? limit - characterCount : null;
  const isOverLimit = remaining !== null && remaining < 0;

  const applyTemplate = (content: string) => {
    setTextValue(content);
    setCopyStatus('');
  };

  const insertAtCursor = (insertion: string) => {
    const editor = editorRef.current;
    const start = editor?.selectionStart ?? textValue.length;
    const end = editor?.selectionEnd ?? textValue.length;
    const result = insertAtTextSelection(textValue, start, end, insertion);
    setTextValue(result.value);
    setCopyStatus('');
    requestAnimationFrame(() => {
      editor?.focus();
      editor?.setSelectionRange(result.cursor, result.cursor);
    });
  };

  const handleCopy = async () => {
    const success = await copyText(textValue);
    setCopyStatus(success ? t.copied : t.copyError);
  };

  const categories: Category[] = ['all', 'personal', 'creator', 'business', 'minimal', 'aesthetic'];

  return (
    <section className="min-h-[75vh] px-4 py-12 sm:px-8" dir={languageKey === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold tracking-[0.2em] text-cyan-300">
            <Sparkles className="h-4 w-4" /> {t.eyebrow}
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">{t.subtitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#101426] p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => { setKind('bio'); setCategory('all'); setLimit(150); }}
                  aria-pressed={kind === 'bio'} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${kind === 'bio' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                  <FileText className="me-2 inline h-4 w-4" />{t.bio}
                </button>
                <button type="button" onClick={() => { setKind('caption'); setCategory('all'); setLimit(2200); }}
                  aria-pressed={kind === 'caption'} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${kind === 'caption' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                  <AlignLeft className="me-2 inline h-4 w-4" />{t.caption}
                </button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-white">{t.templates}</h2>
                <span className="text-xs text-slate-500">{templates.length}</span>
              </div>
              <label className="mt-4 block text-xs font-semibold text-slate-400" htmlFor="bio-template-category">{t.categories.all}</label>
              <select id="bio-template-category" value={category} onChange={(event) => setCategory(event.target.value as Category)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] px-3 py-3 text-sm text-white outline-none focus:border-cyan-400">
                {categories.map((item) => <option key={item} value={item}>{t.categories[item]}</option>)}
              </select>
              <p className="mb-3 mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">{t.choose}</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {templates.length === 0 ? <p className="text-sm text-slate-400">{t.noTemplates}</p> : templates.map((template) => (
                  <button key={template.id} type="button" onClick={() => applyTemplate(template.content)}
                    className="rounded-xl border border-white/10 bg-[#0b1020] p-3 text-start transition hover:border-cyan-400/40 hover:bg-cyan-500/5">
                    <span className="block text-sm font-bold text-slate-100">{template.title}</span>
                    <span className="mt-1 block text-xs text-slate-400">{template.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#101426] p-5 shadow-2xl sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-white">{t.editor}</h2>
                <button type="button" onClick={() => { setTextValue(''); setCopyStatus(''); }}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
                  <RotateCcw className="h-4 w-4" /> {t.reset}
                </button>
              </div>
              <textarea ref={editorRef} value={textValue} onChange={(event) => { setTextValue(event.target.value); setCopyStatus(''); }}
                placeholder={t.placeholder} rows={11} aria-label={t.editor}
                className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-[#080d1c] px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-cyan-400" />

              <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1020] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Type className="h-4 w-4 text-cyan-300" /> {t.separators}
                </div>
                <div className="flex flex-wrap gap-2">
                  {DECORATIVE_SEPARATORS.map((separator) => (
                    <button key={separator} type="button" onClick={() => insertAtCursor(`\n${separator}\n`)}
                      className="rounded-lg border border-white/10 bg-[#080d1c] px-3 py-2 text-sm text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/10">{separator}</button>
                  ))}
                  <button type="button" onClick={() => insertAtCursor('\n')}
                    className="rounded-lg border border-cyan-400/30 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10">{t.insertLine}</button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b1020] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{characterCount} / {limit > 0 ? limit : '∞'} {t.characters}</p>
                    <p className="mt-1 text-xs text-slate-400">{lineCount} {t.lines} · {remaining === null ? t.unlimited : isOverLimit ? `${Math.abs(remaining)} ${t.over}` : `${remaining} ${t.remaining}`}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    {t.limit}
                    <input type="number" min="0" max="5000" value={limit} onChange={(event) => setLimit(Math.max(0, Math.min(5000, Number(event.target.value) || 0)))}
                      className="w-20 rounded-lg border border-white/10 bg-[#080d1c] px-2 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                  </label>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full transition-all ${isOverLimit ? 'bg-rose-400' : 'bg-cyan-400'}`} style={{ width: `${limit > 0 ? Math.min(100, characterCount / limit * 100) : 0}%` }} />
                </div>
              </div>

              <button type="button" onClick={() => void handleCopy()} disabled={!textValue}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-4 font-bold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
                <Copy className="h-5 w-5" /> {t.copy}
              </button>
              {copyStatus && <p className={`mt-3 text-center text-xs ${copyStatus === t.copied ? 'text-emerald-300' : 'text-rose-300'}`} role="status" aria-live="polite">{copyStatus}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
