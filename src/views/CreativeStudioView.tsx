import React, { useEffect, useState } from 'react';
import { Wand2, Dices, FileText, Shapes } from 'lucide-react';
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
  useEffect(() => {
    const unsubscribe = subscribeToSettings((settings) => setLanguage(settings.language));
    const syncTool = () => setActiveTool(readToolFromHash());
    window.addEventListener('hashchange', syncTool);
    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', syncTool);
    };
  }, []);

  const locale = language === 'fr' || language === 'ar' ? language : 'en';
  const copy = {
    en: { eyebrow: 'NAMEFORGE CREATIVE WORKSPACE', title: 'Creative Studio', subtitle: 'One place to shape your name, profile and visual identity.', tools: 'Creative tools', active: 'Selected tool' },
    fr: { eyebrow: 'ESPACE CRÉATIF NAMEFORGE', title: 'Studio créatif', subtitle: 'Un seul espace pour façonner votre pseudo, votre profil et votre identité visuelle.', tools: 'Outils créatifs', active: 'Outil sélectionné' },
    ar: { eyebrow: 'مساحة NAMEFORGE الإبداعية', title: 'الاستوديو الإبداعي', subtitle: 'مساحة واحدة لتصميم اسمك وملفك الشخصي وهويتك البصرية.', tools: 'الأدوات الإبداعية', active: 'الأداة المحددة' },
  }[locale];

  const selectTool = (tool: CreativeTool) => {
    setActiveTool(tool);
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

        <nav role="tablist" aria-label={copy.tools} className="mb-7 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#0b1020] p-2 sm:grid-cols-4">
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
          <div hidden={activeTool !== 'text-styles'}><StyleStudioView onNavigate={onNavigate} initialText={initialText} /></div>
          <div hidden={activeTool !== 'username'}><UsernameDesignerView /></div>
          <div hidden={activeTool !== 'bio-caption'}><BioCaptionStudioView /></div>
          <div hidden={activeTool !== 'symbols-art'}><TextArtStudioView /></div>
        </div>
      </div>
    </section>
  );
};

export default CreativeStudioView;
