import React, { useEffect, useState } from 'react';
import { Wand2, Dices, FileText, Shapes, Type } from 'lucide-react';
import { getAppSettings, subscribeToSettings } from '../services/settings';
import { StyleStudioView } from './StyleStudioView';
import { UsernameDesignerView } from './UsernameDesignerView';
import { BioCaptionStudioView } from './BioCaptionStudioView';
import { TextArtStudioView } from './TextArtStudioView';
import { GeneratorId } from '../types';

type CreativeTool = 'text-styles' | 'username' | 'bio-caption' | 'symbols-art';

interface CreativeStudioViewProps {
  initialText?: string;
  onNavigate: (view: string, generatorId?: GeneratorId) => void;
}

const TOOLS: Array<{ id: CreativeTool; icon: React.ComponentType<{ className?: string }>; labels: Record<'en' | 'fr' | 'ar', string>; descriptions: Record<'en' | 'fr' | 'ar', string> }> = [
  { id: 'text-styles', icon: Wand2, labels: { en: 'Text Styles', fr: 'Styles de texte', ar: 'أنماط النصوص' }, descriptions: { en: 'Unicode styles, visual effects and typography', fr: 'Styles Unicode, effets visuels et typographie', ar: 'أنماط Unicode وتأثيرات بصرية وطباعة' } },
  { id: 'username', icon: Dices, labels: { en: 'Username Designer', fr: 'Créateur de pseudos', ar: 'مصمم أسماء المستخدمين' }, descriptions: { en: 'Build a username that fits your identity', fr: 'Créez un pseudo adapté à votre identité', ar: 'أنشئ اسم مستخدم يناسب هويتك' } },
  { id: 'bio-caption', icon: FileText, labels: { en: 'Bio & Captions', fr: 'Bio & légendes', ar: 'النبذة والتعليقات' }, descriptions: { en: 'Write profile bios and social captions', fr: 'Rédigez des bios et des légendes sociales', ar: 'اكتب نبذات وتعليقات لمنصات التواصل' } },
  { id: 'symbols-art', icon: Shapes, labels: { en: 'Symbols & Art', fr: 'Symboles & Art', ar: 'الرموز والفن النصي' }, descriptions: { en: 'Explore symbols and create text banners', fr: 'Explorez les symboles et créez des bannières', ar: 'اكتشف الرموز وأنشئ لافتات نصية' } },
];

function readToolFromHash(): CreativeTool {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash === 'username-designer' || hash === 'username-generator' || hash === 'pseudo-generator' || hash.endsWith('/username')) return 'username';
  if (hash === 'bio-caption-studio' || hash === 'bio-studio' || hash === 'caption-studio' || hash.endsWith('/bio-caption')) return 'bio-caption';
  if (hash === 'text-art-studio' || hash === 'symbols-text-art' || hash === 'symboles-text-art' || hash.endsWith('/symbols-art')) return 'symbols-art';
  return 'text-styles';
}

export const CreativeStudioView: React.FC<CreativeStudioViewProps> = ({ initialText, onNavigate }) => {
  const [language, setLanguage] = useState(getAppSettings().language);
  const [activeTool, setActiveTool] = useState<CreativeTool>(readToolFromHash);
  const [visitedTools, setVisitedTools] = useState<CreativeTool[]>(() => [readToolFromHash()]);
  const [designName, setDesignName] = useState(initialText || 'NameForge');
  useEffect(() => {
    const unsubscribe = subscribeToSettings((settings) => setLanguage(settings.language));
    const syncTool = () => {
      const nextTool = readToolFromHash();
      setActiveTool(nextTool);
      setVisitedTools((current) => current.includes(nextTool) ? current : [...current, nextTool]);
    };
    window.addEventListener('hashchange', syncTool);
    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', syncTool);
    };
  }, []);

  const locale: 'en' | 'fr' | 'ar' = language === 'fr' ? 'fr' : language === 'ar' ? 'ar' : 'en';
  const copy = {
    en: { eyebrow: 'NAMEFORGE CREATIVE WORKSPACE', title: 'Name Designer Studio', subtitle: 'One workspace to create, style and personalize your name and online identity.', tools: 'Design features', active: 'Selected feature', name: 'Name or nickname to personalize', nameHint: 'Enter a name once; use it across every design feature.', placeholder: 'Type your name or nickname…' },
    fr: { eyebrow: 'ESPACE CRÉATIF NAMEFORGE', title: 'Studio de personnalisation des noms', subtitle: 'Un seul espace pour créer, styliser et personnaliser votre nom et votre identité en ligne.', tools: 'Fonctionnalités de création', active: 'Fonctionnalité sélectionnée', name: 'Nom ou pseudo à personnaliser', nameHint: 'Saisissez votre nom une seule fois et réutilisez-le dans chaque fonctionnalité.', placeholder: 'Saisissez votre nom ou pseudo…' },
    ar: { eyebrow: 'مساحة NAMEFORGE الإبداعية', title: 'استوديو تصميم الأسماء', subtitle: 'مساحة واحدة لإنشاء اسمك وتنسيقه وتخصيص هويتك الرقمية.', tools: 'ميزات التصميم', active: 'الميزة المحددة', name: 'الاسم أو اللقب المراد تخصيصه', nameHint: 'أدخل اسمك مرة واحدة واستخدمه في جميع ميزات التصميم.', placeholder: 'اكتب اسمك أو لقبك…' },
  }[locale];

  const selectTool = (tool: CreativeTool) => {
    setActiveTool(tool);
    setVisitedTools((current) => current.includes(tool) ? current : [...current, tool]);
    window.location.hash = '/creative-studio/' + tool;
  };

  return (
    <section className="min-h-[75vh] px-4 py-10 sm:px-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-xs font-bold tracking-[0.16em] text-fuchsia-200">
            <Wand2 className="h-4 w-4" /> {copy.eyebrow}
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">{copy.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">{copy.subtitle}</p>
        </header>

        <section className="mb-7 rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 via-[#101426] to-indigo-500/10 p-5 shadow-xl sm:p-7">
          <label htmlFor="creative-studio-name" className="flex items-center gap-2 text-sm font-bold text-white"><Type className="h-4 w-4 text-fuchsia-300" />{copy.name}</label>
          <input id="creative-studio-name" data-testid="creative-studio-shared-name" value={designName} onChange={(event) => setDesignName(event.target.value)} placeholder={copy.placeholder} className="mt-3 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-base font-semibold text-white outline-none transition placeholder:font-normal placeholder:text-slate-500 focus:border-fuchsia-400" />
          <p className="mt-2 text-xs leading-5 text-slate-400">{copy.nameHint}</p>
        </section>

        <nav role="tablist" data-testid="creative-studio-tabs" aria-label={copy.tools} className="mb-7 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#0b1020] p-2 sm:grid-cols-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const selected = activeTool === tool.id;
            return (
              <button key={tool.id} type="button" role="tab" aria-selected={selected} aria-controls="creative-studio-panel"
                onClick={() => selectTool(tool.id)}
                className={`flex min-h-[76px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${
                  selected ? 'border-fuchsia-400/50 bg-fuchsia-500/15 text-white shadow-lg shadow-fuchsia-950/20' : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-xs font-bold sm:text-sm">{tool.labels[locale]}</span>
                <span className="hidden text-[11px] leading-4 text-slate-500 sm:block">{tool.descriptions[locale]}</span>
              </button>
            );
          })}
        </nav>

        <div id="creative-studio-panel" role="tabpanel" aria-label={TOOLS.find((tool) => tool.id === activeTool)?.labels[locale]} className="min-w-0">
          {visitedTools.includes('text-styles') && <div hidden={activeTool !== 'text-styles'}><StyleStudioView onNavigate={onNavigate} initialText={designName} /></div>}
          {visitedTools.includes('username') && <div hidden={activeTool !== 'username'}><UsernameDesignerView initialText={designName} /></div>}
          {visitedTools.includes('bio-caption') && <div hidden={activeTool !== 'bio-caption'}><BioCaptionStudioView initialText={designName} /></div>}
          {visitedTools.includes('symbols-art') && <div hidden={activeTool !== 'symbols-art'}><TextArtStudioView initialText={designName} /></div>}
        </div>
      </div>
    </section>
  );
};

export default CreativeStudioView;
