export type SymbolCategory = 'stars' | 'arrows' | 'hearts' | 'decorative' | 'nature' | 'kaomoji';

export interface TextArtItem {
  id: string;
  value: string;
  label: string;
  category: SymbolCategory;
  keywords: string[];
}

export const TEXT_ART_ITEMS: TextArtItem[] = [
  ...[
    ['sparkle','✦','Sparkle'],['star','★','Star'],['white-star','☆','Outline star'],['four-stars','✧','Four-point star'],['eight-star','✴','Eight-point star'],['sun','☀','Sun'],['moon','☾','Moon'],['comet','☄','Comet'],['flower-star','❋','Flower star'],['asterisk','⁂','Asterism'],
  ].map(([id,value,label])=>({id,value,label,category:'stars' as const,keywords:['star','sparkle','celestial']})),
  ...[
    ['right','➜','Right arrow'],['left','⬅','Left arrow'],['up','⬆','Up arrow'],['down','⬇','Down arrow'],['double','⇢','Double arrow'],['loop','↻','Refresh'],['curved','➥','Curved arrow'],['chevron','›','Chevron'],['triangle','▸','Triangle'],['pointer','➤','Pointer'],
  ].map(([id,value,label])=>({id,value,label,category:'arrows' as const,keywords:['arrow','direction']})),
  ...[
    ['heart','♥','Heart'],['outline-heart','♡','Outline heart'],['spark-heart','ღ','Heart flourish'],['broken-heart','💔','Broken heart'],['two-hearts','💕','Two hearts'],['heart-exclamation','❣','Heart mark'],['flower-heart','დ','Heart ornament'],['love','ლ','Love symbol'],
  ].map(([id,value,label])=>({id,value,label,category:'hearts' as const,keywords:['heart','love']})),
  ...[
    ['line','─','Horizontal line'],['double-line','═','Double line'],['wave','〜','Wave'],['diamond','◆','Diamond'],['outline-diamond','◇','Outline diamond'],['bracket-left','『','Ornamental bracket'],['bracket-right','』','Ornamental bracket'],['bullet','•','Bullet'],['circle','●','Circle'],['outline-circle','○','Outline circle'],['cross','✝','Cross'],['infinity','∞','Infinity'],['music','♫','Music'],['peace','☮','Peace'],['crown','♛','Crown'],['skull','☠','Skull'],
  ].map(([id,value,label])=>({id,value,label,category:'decorative' as const,keywords:['ornament','decoration','symbol']})),
  ...[
    ['leaf','❧','Leaf'],['clover','☘','Clover'],['four-leaf','🍀','Four-leaf clover'],['cherry','🍒','Cherries'],['butterfly','🦋','Butterfly'],['sparkles','✨','Sparkles'],['fire','🔥','Fire'],['cloud','☁','Cloud'],['rainbow','🌈','Rainbow'],['planet','🪐','Planet'],
  ].map(([id,value,label])=>({id,value,label,category:'nature' as const,keywords:['nature','emoji']})),
  ...[
    ['shrug','¯\\_(ツ)_/¯','Shrug'],['happy','(＾▽＾)','Happy'],['excited','(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧','Excited'],['cute','(｡♥‿♥｡)','Cute'],['wave-face','(・ω・)ノ','Waving'],['table-flip','(╯°□°）╯︵ ┻━┻','Table flip'],['calm','(￣▽￣)','Calm'],['cry','(ಥ﹏ಥ)','Crying'],['look','(¬‿¬)','Mischievous'],['sleep','(－ω－) zzZ','Sleepy'],['dance','♪┏(・o･)┛♪','Dancing'],['cat','(=^･ω･^=)','Cat'],['bear','ʕ•ᴥ•ʔ','Bear'],['lenny','( ͡° ͜ʖ ͡°)','Lenny face'],['cheer','٩(◕‿◕｡)۶','Cheering'],['love-face','(づ￣ ³￣)づ','Affection'],
  ].map(([id,value,label])=>({id,value,label,category:'kaomoji' as const,keywords:['kaomoji','face','emoticon']})),
];

export const SYMBOL_FAVORITES_KEY = 'nameforge.text-art.favorites.v1';

export function filterTextArtItems(items: TextArtItem[], query: string, category: SymbolCategory | 'all' = 'all', favorites: string[] = [], favoritesOnly = false): TextArtItem[] {
  const normalized = query.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLocaleLowerCase();
  return items.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const matchesFavorite = !favoritesOnly || favorites.includes(item.id);
    const searchable = [item.label, item.id, item.value, ...item.keywords].join(' ').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLocaleLowerCase();
    return matchesCategory && matchesFavorite && (!normalized || searchable.includes(normalized));
  });
}

export function readTextArtFavorites(storage?: Pick<Storage, 'getItem'>): string[] {
  try {
    const raw = (storage || (typeof localStorage !== 'undefined' ? localStorage : undefined))?.getItem(SYMBOL_FAVORITES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string' && TEXT_ART_ITEMS.some((item) => item.id === value)) : [];
  } catch { return []; }
}

export function saveTextArtFavorites(favorites: string[], storage?: Pick<Storage, 'setItem'>): boolean {
  try {
    (storage || (typeof localStorage !== 'undefined' ? localStorage : undefined))?.setItem(SYMBOL_FAVORITES_KEY, JSON.stringify([...new Set(favorites)]));
    return true;
  } catch { return false; }
}

export interface TextArtStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
}

function cssString(value: string): string {
  return value.replace(/\\\\/g, '\\\\\\\\').replace(/"/g, '\\\\"').replace(/[\\r\\n\\0]/g, ' ');
}

export function generateTextArtCss(style: TextArtStyle): string {
  return [
    '.nameforge-text-art {',
    `  font-family: "${cssString(style.fontFamily)}", sans-serif;`,
    `  font-size: ${Math.max(8, Math.min(160, style.fontSize))}px;`,
    `  font-weight: ${Math.max(100, Math.min(900, style.fontWeight))};`,
    `  color: ${/^#[0-9a-f]{3,8}$/i.test(style.color) ? style.color : '#ffffff'};`,
    `  letter-spacing: ${Math.max(-5, Math.min(30, style.letterSpacing))}px;`,
    `  line-height: ${Math.max(0.8, Math.min(3, style.lineHeight))};`,
    `  text-align: ${style.textAlign};`,
    '}',
  ].join('\\n');
}
