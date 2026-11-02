import React, { useEffect, useState } from 'react';
import { Wand2, Dices, FileText, Shapes, Type, Sparkles } from 'lucide-react';
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

const TOOL_IDS: CreativeTool[] = ['text-styles', 'username', 'bio-caption', 'symbols-art'];

function readToolFromHash(): CreativeTool {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash === 'username-designer' || hash === 'username-generator' || hash === 'pseudo-generator' || hash.endsWith('/username')) return 'username';
  if (hash === 'bio-caption-studio' || hash === 'bio-studio' || hash === 'caption-studio' || hash.endsWith('/bio-caption')) return 'bio-caption';
  if (hash === 'text-art-studio' || hash === 'symbols-text-art' || hash === 'symboles-text-art' || hash.endsWith('/symbols-art')) return 'symbols-art';
  return 'text-styles';
}

export const CreativeStudioView: React.FC<CreativeStudioViewProps> = ({ initialText, onNavigate }) => {
  const [language, setLanguage] = useState(getAppSettings().language);
  const [designName, setDesignName] = useState(initialText ?? 'NameForge');
  useEffect(() => {
    const unsubscribe = subscribeToSettings((settings) => setLanguage(settings.language));
    return unsubscribe;
  }, []);

  const locale: 'en' | 'fr' | 'ar' = language === 'fr' ? 'fr' : language === 'ar' ? 'ar' : 'en';
  const copy = {
    en: {
      eyebrow: 'NAMEFORGE CREATIVE WORKSPACE',
      title: 'Ultimate Name Designer Studio',
      subtitle: 'One continuous workspace for styling names, building usernames, writing bios and creating text art.',
      name: 'Your shared name or starting text',
      hint: 'Change this once to refresh the starting text in every creative tool. Each editor keeps its own detailed controls.',
      placeholder: 'Type a name or nickname…',
      workspace: 'Your creative workspace',
      style: '01 · Text styling',
      styleHint: 'Unicode lettering, visual effects, typography and exports',
      username: '02 · Username design',
      usernameHint: 'Create and validate usernames with prefixes, suffixes and styles',
      bio: '03 · Bio and captions',
      bioHint: 'Use templates, separators and character limits',
      art: '04 · Symbols and text art',
      artHint: 'Browse symbols, save favorites and design banners',
      jump: 'Jump to section',
    },
    fr: {
      eyebrow: 'ESPACE CRÉATIF NAMEFORGE',
      title: 'Studio ultime de création de noms',
      subtitle: 'Un espace continu pour styliser des noms, créer des pseudos, rédiger des bios et composer du text art.',
      name: 'Votre nom ou texte de départ partagé',
      hint: 'Modifiez ce champ pour actualiser le texte de départ dans chaque outil. Chaque éditeur conserve ses commandes détaillées.',
      placeholder: 'Saisissez un nom ou un pseudo…',
      workspace: 'Votre espace de création',
      style: '01 · Styles de texte',
      styleHint: 'Lettres Unicode, effets visuels, typographie et exports',
      username: '02 · Création de pseudos',
      usernameHint: 'Créez et vérifiez des pseudos avec préfixes, suffixes et styles',
      bio: '03 · Bios et légendes',
      bioHint: 'Modèles, séparateurs décoratifs et limites de caractères',
      art: '04 · Symboles et art textuel',
      artHint: 'Explorez les symboles, gérez vos favoris et créez des bannières',
      jump: 'Accéder à une section',
    },
    ar: {
      eyebrow: 'مساحة NAMEFORGE الإبداعية',
      title: 'استوديو تصميم الأسماء المتكامل',
      subtitle: 'مساحة عمل واحدة لتنسيق الأسماء وإنشاء أسماء المستخدمين وكتابة النبذات وتصميم الفن النصي.',
      name: 'الاسم أو النص الأساسي المشترك',
      hint: 'غيّر هذا الحقل لتحديث النص الأولي في جميع الأدوات. يحتفظ كل محرر بعناصر التحكم الخاصة به.',
      placeholder: 'اكتب اسمًا أو لقبًا…',
      workspace: 'مساحة التصميم',
      style: '01 · تنسيق النصوص',
      styleHint: 'حروف Unicode وتأثيرات بصرية وخطوط وتصدير',
      username: '02 · تصميم أسماء المستخدمين',
      usernameHint: 'أنشئ أسماء المستخدمين وتحقق منها باستخدام البادئات واللواحق والأنماط',
      bio: '03 · النبذات والتعليقات',
      bioHint: 'قوالب وفواصل زخرفية وحدود لعدد الأحرف',
      art: '04 · الرموز والفن النصي',
      artHint: 'تصفح الرموز واحفظ المفضلة وصمم اللافتات',
      jump: 'انتقل إلى قسم',
    },
  }[locale];

  const sections = [
    { id: 'text-styles' as const, title: copy.style, hint: copy.styleHint, icon: Wand2, color: 'fuchsia' },
    { id: 'username' as const, title: copy.username, hint: copy.usernameHint, icon: Dices, color: 'purple' },
    { id: 'bio-caption' as const, title: copy.bio, hint: copy.bioHint, icon: FileText, color: 'cyan' },
    { id: 'symbols-art' as const, title: copy.art, hint: copy.artHint, icon: Shapes, color: 'pink' },
  ];

  const jumpTo = (id: CreativeTool) => {
    document.getElementById('creative-section-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', '#/creative-studio/' + id);
  };

  useEffect(() => {
    const syncLegacyRoute = () => {
      const target = readToolFromHash();
      if (window.location.hash.includes('creative-studio') || window.location.hash.includes('studio')) {
        document.getElementById('creative-section-' + target)?.scrollIntoView({ block: 'start' });
      }
    };
    window.addEventListener('hashchange', syncLegacyRoute);
    return () => window.removeEventListener('hashchange', syncLegacyRoute);
  }, []);

  return (
    <section className="min-h-[75vh] px-4 py-10 sm:px-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-xs font-bold tracking-[0.16em] text-fuchsia-200">
            <Sparkles className="h-4 w-4" /> {copy.eyebrow}
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">{copy.title}</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">{copy.subtitle}</p>
        </header>

        <section className="mb-7 rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 via-[#101426] to-indigo-500/10 p-5 shadow-xl sm:p-7">
          <label htmlFor="creative-studio-name" className="flex items-center gap-2 text-sm font-bold text-white">
            <Type className="h-4 w-4 text-fuchsia-300" />{copy.name}
          </label>
          <input id="creative-studio-name" data-testid="creative-studio-shared-name" value={designName}
            onChange={(event) => setDesignName(event.target.value)} placeholder={copy.placeholder}
            className="mt-3 w-full rounded-xl border border-white/10 bg-[#080d1c] px-4 py-3 text-base font-semibold text-white outline-none transition placeholder:font-normal placeholder:text-slate-500 focus:border-fuchsia-400" />
          <p className="mt-2 text-xs leading-5 text-slate-400">{copy.hint}</p>
        </section>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-white sm:text-2xl">{copy.workspace}</h2>
            <p className="mt-1 text-sm text-slate-400">{copy.jump}</p>
          </div>
          <nav aria-label={copy.jump} className="flex flex-wrap gap-2">
            {sections.map(({ id, title, icon: Icon }) => (
              <button key={id} type="button" onClick={() => jumpTo(id)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#101426] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-fuchsia-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">
                <Icon className="h-4 w-4" />{title}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-8">
          {sections.map(({ id, title, hint, icon: Icon }) => (
            <section id={'creative-section-' + id} key={id} data-testid={'creative-section-' + id}
              className="scroll-mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020]/70 shadow-2xl">
              <header className="flex flex-col gap-2 border-b border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200"><Icon className="h-5 w-5" /></span>
                  <div><h2 className="text-lg font-black text-white sm:text-xl">{title}</h2><p className="mt-1 text-xs text-slate-400">{hint}</p></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Creative Studio</span>
              </header>
              <div className="min-w-0 [&>section]:!min-h-0 [&>section]:!px-0 [&>section]:!py-5">
                {id === 'text-styles' && <StyleStudioView onNavigate={onNavigate} initialText={designName} />}
                {id === 'username' && <UsernameDesignerView initialText={designName} />}
                {id === 'bio-caption' && <BioCaptionStudioView initialText={designName} />}
                {id === 'symbols-art' && <TextArtStudioView initialText={designName} />}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CreativeStudioView;
