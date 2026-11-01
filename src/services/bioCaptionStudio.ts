export type BioCaptionKind = 'bio' | 'caption';
export type BioCaptionLanguage = 'en' | 'fr' | 'ar';

export interface BioCaptionTemplate {
  id: string;
  kind: BioCaptionKind;
  category: string;
  title: string;
  description: string;
  content: string;
}

const TEMPLATE_CATALOG: Record<BioCaptionLanguage, BioCaptionTemplate[]> = {
  en: [
    { id: 'bio-personal', kind: 'bio', category: 'personal', title: 'Personal intro', description: 'A friendly profile introduction', content: '✦ A little about me\n☀ Sharing what I love\n✉ Say hello anytime' },
    { id: 'bio-creator', kind: 'bio', category: 'creator', title: 'Content creator', description: 'For creators and communities', content: '🎬 Creating • Inspiring • Connecting\nNew posts every week\n↓ Explore my latest work' },
    { id: 'bio-business', kind: 'bio', category: 'business', title: 'Small business', description: 'A clear business profile', content: '✧ [Brand name]\n[What you offer]\n📩 Orders & enquiries: [contact]' },
    { id: 'bio-minimal', kind: 'bio', category: 'minimal', title: 'Minimal profile', description: 'Short and clean', content: 'Less noise. More meaning.\nCreating my own path.' },
    { id: 'bio-aesthetic', kind: 'bio', category: 'aesthetic', title: 'Aesthetic', description: 'A soft, expressive profile', content: '☾ collecting little moments\n♡ made of dreams & details\n✧ stay curious' },
    { id: 'caption-story', kind: 'caption', category: 'personal', title: 'A little story', description: 'A caption with a personal touch', content: 'Some moments deserve a place in the memory. ✨\n\nWhat is one moment you would keep forever?' },
    { id: 'caption-launch', kind: 'caption', category: 'business', title: 'Product launch', description: 'Introduce something new', content: 'It is finally here! ✨\n\nMeet [product name] — made for [benefit].\n\nDiscover more: [link]' },
    { id: 'caption-engagement', kind: 'caption', category: 'creator', title: 'Start a conversation', description: 'Invite your audience to respond', content: 'Your turn! 💬\n\nWhich one would you choose — A or B?\nTell me in the comments.' },
    { id: 'caption-announcement', kind: 'caption', category: 'business', title: 'Announcement', description: 'Share an update or event', content: '📣 A quick update!\n\n[Your announcement]\n\nSave this post so you do not miss the details.' },
  ],
  fr: [
    { id: 'bio-personal', kind: 'bio', category: 'personal', title: 'Présentation personnelle', description: 'Une présentation conviviale', content: '✦ Quelques mots sur moi\n☀ Je partage ce que j’aime\n✉ Faisons connaissance' },
    { id: 'bio-creator', kind: 'bio', category: 'creator', title: 'Créateur de contenu', description: 'Pour les créateurs et communautés', content: '🎬 Créer • Inspirer • Échanger\nNouvelles publications chaque semaine\n↓ Découvrir mes projets' },
    { id: 'bio-business', kind: 'bio', category: 'business', title: 'Petite entreprise', description: 'Une présentation professionnelle', content: '✧ [Nom de la marque]\n[Votre activité ou offre]\n📩 Commandes et infos : [contact]' },
    { id: 'bio-minimal', kind: 'bio', category: 'minimal', title: 'Profil minimaliste', description: 'Court et épuré', content: 'Moins de bruit. Plus de sens.\nJe trace mon chemin.' },
    { id: 'bio-aesthetic', kind: 'bio', category: 'aesthetic', title: 'Esthétique', description: 'Une bio douce et expressive', content: '☾ collectionner les petits instants\n♡ rêves et détails\n✧ rester curieux' },
    { id: 'caption-story', kind: 'caption', category: 'personal', title: 'Une petite histoire', description: 'Une légende personnelle', content: 'Certains moments méritent de rester en mémoire. ✨\n\nQuel souvenir garderiez-vous pour toujours ?' },
    { id: 'caption-launch', kind: 'caption', category: 'business', title: 'Lancement de produit', description: 'Présenter une nouveauté', content: 'Il est enfin arrivé ! ✨\n\nDécouvrez [nom du produit] — pensé pour [avantage].\n\nEn savoir plus : [lien]' },
    { id: 'caption-engagement', kind: 'caption', category: 'creator', title: 'Lancer la discussion', description: 'Inviter votre audience à répondre', content: 'À vous de choisir ! 💬\n\nVous préférez A ou B ?\nDites-le en commentaire.' },
    { id: 'caption-announcement', kind: 'caption', category: 'business', title: 'Annonce', description: 'Partager une actualité', content: '📣 Petite annonce !\n\n[Votre message]\n\nEnregistrez cette publication pour garder les informations.' },
  ],
  ar: [
    { id: 'bio-personal', kind: 'bio', category: 'personal', title: 'تعريف شخصي', description: 'نبذة ودية عنك', content: '✦ بعض الكلمات عني\n☀ أشارك ما أحب\n✉ يسعدني التواصل' },
    { id: 'bio-creator', kind: 'bio', category: 'creator', title: 'صانع محتوى', description: 'لصناع المحتوى والمجتمعات', content: '🎬 إبداع • إلهام • تواصل\nمنشورات جديدة كل أسبوع\n↓ اكتشف أعمالي' },
    { id: 'bio-business', kind: 'bio', category: 'business', title: 'مشروع تجاري', description: 'نبذة واضحة عن نشاطك', content: '✧ [اسم العلامة]\n[الخدمة أو المنتج]\n📩 للطلبات والاستفسار: [التواصل]' },
    { id: 'bio-minimal', kind: 'bio', category: 'minimal', title: 'نبذة بسيطة', description: 'قصيرة وواضحة', content: 'ضجيج أقل. معنى أكثر.\nأرسم طريقي بنفسي.' },
    { id: 'bio-aesthetic', kind: 'bio', category: 'aesthetic', title: 'نبذة جمالية', description: 'أسلوب هادئ ومعبر', content: '☾ أجمع اللحظات الجميلة\n♡ أحلام وتفاصيل\n✧ ابق فضولياً' },
    { id: 'caption-story', kind: 'caption', category: 'personal', title: 'قصة قصيرة', description: 'تعليق بطابع شخصي', content: 'هناك لحظات تستحق أن تبقى في الذاكرة. ✨\n\nما الذكرى التي تود الاحتفاظ بها دائماً؟' },
    { id: 'caption-launch', kind: 'caption', category: 'business', title: 'إطلاق منتج', description: 'التعريف بشيء جديد', content: 'أصبح متاحاً أخيراً! ✨\n\nتعرفوا على [اسم المنتج] — صُمم من أجل [الفائدة].\n\nاكتشف المزيد: [الرابط]' },
    { id: 'caption-engagement', kind: 'caption', category: 'creator', title: 'ابدأ النقاش', description: 'دعوة المتابعين للتفاعل', content: 'حان دوركم! 💬\n\nماذا تختارون: A أم B؟\nشاركونا في التعليقات.' },
    { id: 'caption-announcement', kind: 'caption', category: 'business', title: 'إعلان', description: 'مشاركة خبر أو تحديث', content: '📣 لدينا خبر جديد!\n\n[اكتب إعلانك هنا]\n\nاحفظ المنشور حتى لا تفوتك التفاصيل.' },
  ],
};

export const DECORATIVE_SEPARATORS = ['• • •', '✦ ─ ✦', '━━━━━━━━', '♡ ┈ ♡', '✧･ﾟ: *✧･ﾟ:*', '➳ ───', '⋆｡°✩', '│ • │'];

export function getBioCaptionTemplates(language: string, kind?: BioCaptionKind): BioCaptionTemplate[] {
  const selectedLanguage: BioCaptionLanguage = language in TEMPLATE_CATALOG ? language as BioCaptionLanguage : 'en';
  return TEMPLATE_CATALOG[selectedLanguage].filter((template) => !kind || template.kind === kind);
}

export function countBioCaptionCharacters(value: string): number {
  const normalized = value.normalize('NFC');
  const Segmenter = (Intl as unknown as {
    Segmenter?: new (locales?: string | string[], options?: { granularity: 'grapheme' }) => {
      segment: (input: string) => Iterable<unknown>;
    };
  }).Segmenter;
  if (typeof Segmenter === 'function') {
    return Array.from(new Segmenter(undefined, { granularity: 'grapheme' }).segment(normalized)).length;
  }
  return Array.from(normalized).length;
}

export function countBioCaptionLines(value: string): number {
  return value.length === 0 ? 0 : value.split(/\r\n|\r|\n/).length;
}

export function insertAtTextSelection(value: string, start: number, end: number, insertion: string): { value: string; cursor: number } {
  const safeStart = Math.max(0, Math.min(start, value.length));
  const safeEnd = Math.max(safeStart, Math.min(end, value.length));
  const nextValue = value.slice(0, safeStart) + insertion + value.slice(safeEnd);
  return { value: nextValue, cursor: safeStart + insertion.length };
}
