import React, { useMemo, useState } from 'react';
import { Check, Copy, Sparkles, X } from 'lucide-react';
import { GeneratedName, GeneratorMeta } from '../types';
import { getAppSettings } from '../services/settings';
import { getNameDetailsLabels } from '../i18n/nameDetails';
import { getLocalizedGeneratorDescription } from '../i18n/generatorContent';
import { createNameInsight } from '../services/nameInsightService';

interface NameInsightProps {
  item: GeneratedName;
  meta: GeneratorMeta;
  onClose: () => void;
}

export const NameInsight: React.FC<NameInsightProps> = ({ item, meta, onClose }) => {
  const language = getAppSettings().language;
  const labels = getNameDetailsLabels(language);
  const insight = useMemo(() => createNameInsight({
    name: item.name,
    generatorId: item.generatorId,
    style: item.style,
    description: getLocalizedGeneratorDescription(meta, language),
    strengths: [labels.fallbackStrength],
    watchouts: [labels.fallbackWatchout]
  }), [item.name, item.generatorId, item.style, meta, language, labels]);
  const [copied, setCopied] = useState<string | null>(null);

  if (!insight) return null;

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      setCopied(null);
    }
  };

  const sectionTitle = labels.whyFits;
  const dir = language === 'ar' || language === 'he' ? 'rtl' : 'ltr';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="name-insight-title" dir={dir}
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-sky-300/30 bg-white text-slate-900 shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 p-5 backdrop-blur">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-sky-700">
              <Sparkles className="h-4 w-4" />
              <span>{labels.header.replace(/[•·]\s*$/, '').trim()} · {meta.shortTitle}</span>
            </div>
            <h2 id="name-insight-title" className="break-words text-2xl font-black">{item.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{meta.shortTitle} · {item.style}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">{labels.length}: {Array.from(item.name).length} {labels.letters}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100" aria-label={labels.close}>
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">{sectionTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{insight.creativeReading}</p>
            <p className="mt-3 text-xs leading-5 text-slate-500">{labels.adviceText}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <h3 className="font-bold text-emerald-900">{labels.strengths}</h3>
              <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-emerald-950">
                {insight.strengths.map((strength) => <li key={strength}>{strength}</li>)}
              </ul>
            </section>
            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <h3 className="font-bold text-amber-900">{labels.watchouts}</h3>
              <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-amber-950">
                {insight.watchouts.map((watchout) => <li key={watchout}>{watchout}</li>)}
              </ul>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold">{labels.tone}</h3>
              <span className="text-xs text-slate-500">{labels.variants}</span>
            </div>
            <div className="mt-3 flex gap-2">
              {insight.palette.map((color) => (
                <div key={color} className="min-w-0 flex-1">
                  <div className="h-12 rounded-xl border border-black/10" style={{ backgroundColor: color }} />
                  <p className="mt-1 text-center font-mono text-[11px] text-slate-600">{color}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4">
            <h3 className="font-bold">{labels.variants}</h3>
            <ul className="mt-2 space-y-2">
              {insight.alternatives.map((alternative) => (
                <li key={alternative} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                  <span className="min-w-0 break-words text-sm font-medium">{alternative}</span>
                  <button type="button" onClick={() => copyText(alternative)} className="shrink-0 rounded-lg p-2 text-sky-700 hover:bg-sky-100" aria-label={labels.copy}>
                    {copied === alternative ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-950">
            <p>{labels.transparency}</p>
          </div>

          <button type="button" onClick={() => copyText(item.name)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 font-bold text-white transition hover:bg-sky-700">
            {copied === item.name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied === item.name ? labels.copied : labels.copy}
          </button>
        </div>
      </section>
    </div>
  );
};
