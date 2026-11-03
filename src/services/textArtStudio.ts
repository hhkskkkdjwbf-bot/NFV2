export type SymbolCategory = 'stars' | 'arrows' | 'hearts' | 'decorative' | 'nature' | 'kaomoji' | 'emoji' | 'gaming' | 'music' | 'weather' | 'food' | 'travel';

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
    ['smile','😀','Grinning face'],['grin','😁','Beaming face'],['joy','😂','Face with tears of joy'],['rofl','🤣','Rolling laughter'],['smile-eyes','😊','Smiling face'],['blush','😳','Blushing face'],['wink','😉','Winking face'],['cool','😎','Cool face'],['think','🤔','Thinking face'],['shush','🤫','Shushing face'],['mind-blown','🤯','Mind blown'],['party','🥳','Party face'],['star-eyes','🤩','Star-struck'],['nerd','🤓','Nerd face'],['robot','🤖','Robot face'],['alien','👽','Alien'],['ghost','👻','Ghost'],['skull-emoji','💀','Skull emoji'],['clap','👏','Clapping hands'],['raised-hands','🙌','Celebration hands'],['pray','🙏','Folded hands'],['thumbs-up','👍','Thumbs up'],['fire-heart','❤️‍🔥','Heart on fire'],['white-heart','🤍','White heart'],['black-heart','🖤','Black heart'],['blue-heart','💙','Blue heart'],['purple-heart','💜','Purple heart'],['green-heart','💚','Green heart'],['yellow-heart','💛','Yellow heart'],['orange-heart','🧡','Orange heart'],['sparkling-heart','💖','Sparkling heart'],['gift-heart','💝','Heart with ribbon'],
  ].map(([id,value,label])=>({id,value,label,category:'emoji' as const,keywords:['emoji','face','expression','reaction']})),
  ...[
    ['controller','🎮','Game controller'],['joystick','🕹️','Joystick'],['trophy','🏆','Trophy'],['medal','🏅','Sports medal'],['crossed-swords','⚔️','Crossed swords'],['shield','🛡️','Shield'],['target','🎯','Bullseye'],['game-die','🎲','Game die'],['chess','♟️','Chess pawn'],['puzzle','🧩','Puzzle piece'],['magic-wand','🪄','Magic wand'],['crystal-ball','🔮','Crystal ball'],['rocket','🚀','Rocket'],['satellite','🛰️','Satellite'],['computer','💻','Laptop'],['keyboard','⌨️','Keyboard'],['pixel-heart','♡','Pixel heart'],['level-up','⬆️','Level up'],['power','⏻','Power symbol'],['infinity-game','♾️','Infinite play'],
  ].map(([id,value,label])=>({id,value,label,category:'gaming' as const,keywords:['gaming','game','esports','technology','play']})),
  ...[
    ['note','♪','Eighth note'],['notes','♫','Beamed notes'],['double-notes','♬','Double notes'],['treble-clef','𝄞','Treble clef'],['microphone','🎤','Microphone'],['headphones','🎧','Headphones'],['guitar','🎸','Guitar'],['piano','🎹','Musical keyboard'],['drum','🥁','Drum'],['saxophone','🎷','Saxophone'],['violin','🎻','Violin'],['trumpet','🎺','Trumpet'],['music-score','🎼','Musical score'],['disco','🪩','Disco ball'],['vinyl','💿','Disc'],['cassette','📼','Cassette'],
  ].map(([id,value,label])=>({id,value,label,category:'music' as const,keywords:['music','sound','instrument','song']})),
  ...[
    ['sunny','🌞','Sun with face'],['sun-behind-cloud','🌤️','Sun behind small cloud'],['partly-cloudy','⛅','Partly cloudy'],['cloud-rain','🌧️','Rain cloud'],['thunder','⛈️','Thunderstorm'],['lightning','⚡','Lightning'],['snow','❄️','Snowflake'],['snowman','☃️','Snowman'],['wind','🌬️','Wind face'],['tornado','🌪️','Tornado'],['fog','🌫️','Fog'],['umbrella','☂️','Umbrella'],['droplet','💧','Droplet'],['ocean-wave','🌊','Ocean wave'],['thermometer','🌡️','Thermometer'],['rainbow-emoji','🌈','Rainbow emoji'],
  ].map(([id,value,label])=>({id,value,label,category:'weather' as const,keywords:['weather','climate','sky','nature']})),
  ...[
    ['pizza','🍕','Pizza'],['burger','🍔','Burger'],['fries','🍟','French fries'],['taco','🌮','Taco'],['sushi','🍣','Sushi'],['ramen','🍜','Ramen'],['rice','🍚','Rice'],['bread','🍞','Bread'],['croissant','🥐','Croissant'],['cheese','🧀','Cheese'],['cake','🍰','Cake'],['cupcake','🧁','Cupcake'],['donut','🍩','Doughnut'],['cookie','🍪','Cookie'],['chocolate','🍫','Chocolate'],['ice-cream','🍦','Ice cream'],['coffee','☕','Coffee'],['tea','🍵','Tea'],['bubble-tea','🧋','Bubble tea'],['strawberry','🍓','Strawberry'],['watermelon','🍉','Watermelon'],['apple','🍎','Red apple'],['avocado','🥑','Avocado'],['banana','🍌','Banana'],['grapes','🍇','Grapes'],['lemon','🍋','Lemon'],['peach','🍑','Peach'],['mango','🥭','Mango'],
  ].map(([id,value,label])=>({id,value,label,category:'food' as const,keywords:['food','drink','fruit','meal','emoji']})),
  ...[
    ['globe','🌍','Globe Europe Africa'],['globe-americas','🌎','Globe Americas'],['globe-asia','🌏','Globe Asia'],['compass','🧭','Compass'],['map','🗺️','World map'],['location','📍','Location pin'],['airplane','✈️','Airplane'],['departures','🛫','Departures'],['arrivals','🛬','Arrivals'],['train','🚆','Train'],['car','🚗','Car'],['bus','🚌','Bus'],['ship','🚢','Ship'],['sailboat','⛵','Sailboat'],['mountain','⛰️','Mountain'],['camping','🏕️','Camping'],['beach','🏖️','Beach'],['tent','⛺','Tent'],['hotel','🏨','Hotel'],['luggage','🧳','Luggage'],['ticket','🎟️','Admission ticket'],['camera','📸','Camera'],
  ].map(([id,value,label])=>({id,value,label,category:'travel' as const,keywords:['travel','trip','journey','holiday','place']})),
  ...[
    ['shrug','¯\\_(ツ)_/¯','Shrug'],['happy','(＾▽＾)','Happy'],['excited','(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧','Excited'],['cute','(｡♥‿♥｡)','Cute'],['wave-face','(・ω・)ノ','Waving'],['table-flip','(╯°□°）╯︵ ┻━┻','Table flip'],['calm','(￣▽￣)','Calm'],['cry','(ಥ﹏ಥ)','Crying'],['look','(¬‿¬)','Mischievous'],['sleep','(－ω－) zzZ','Sleepy'],['dance','♪┏(・o･)┛♪','Dancing'],['cat','(=^･ω･^=)','Cat'],['bear','ʕ•ᴥ•ʔ','Bear'],['lenny','( ͡° ͜ʖ ͡°)','Lenny face'],['cheer','٩(◕‿◕｡)۶','Cheering'],['love-face','(づ￣ ³￣)づ','Affection'],
  ].map(([id,value,label])=>({id,value,label,category:'kaomoji' as const,keywords:['kaomoji','face','emoticon']})),
];

export const SYMBOL_FAVORITES_KEY = 'nameforge.text-art.favorites.v1';

export function filterTextArtItems(items: TextArtItem[], query: string, category: SymbolCategory | 'all' = 'all', favorites: string[] = [], favoritesOnly = false): TextArtItem[] {
  const normalized = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  return items.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const matchesFavorite = !favoritesOnly || favorites.includes(item.id);
    const searchable = [item.label, item.id, item.value, ...item.keywords].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
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
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
}


export interface TextArtPreset {
  id: string;
  name: string;
  group: 'Minimal' | 'Elegant' | 'Gaming' | 'Creative' | 'Classic';
  description: string;
  style: TextArtStyle;
}

const preset = (id:string,name:string,group:TextArtPreset['group'],description:string,overrides:Partial<TextArtStyle>):TextArtPreset => ({
  id,name,group,description,
  style:{fontFamily:'Arial',fontSize:48,fontWeight:700,color:'#ffffff',letterSpacing:1,textAlign:'center',lineHeight:1.3,textTransform:'none',textShadow:false,strokeColor:'#000000',strokeWidth:0,backgroundColor:'#080d1c',borderColor:'#334155',borderWidth:0,borderRadius:16,padding:20,...overrides}
});

export const TEXT_ART_PRESETS: TextArtPreset[] = [
  preset('clean-minimal','Clean Minimal','Minimal','Simple and readable',{fontFamily:'Arial',fontSize:48,fontWeight:500,color:'#f8fafc',letterSpacing:0,backgroundColor:'#111827'}),
  preset('soft-elegance','Soft Elegance','Elegant','Refined serif typography',{fontFamily:'Georgia',fontSize:54,fontWeight:400,color:'#f5e6c8',letterSpacing:2,textTransform:'capitalize',backgroundColor:'#211a24',textShadow:true}),
  preset('royal-gold','Royal Gold','Elegant','Classic luxury gold tones',{fontFamily:'Palatino Linotype',fontSize:56,fontWeight:700,color:'#f6d98b',letterSpacing:3,textTransform:'uppercase',backgroundColor:'#17130d',borderColor:'#a8792a',borderWidth:2,borderRadius:8,padding:28}),
  preset('cyber-neon','Cyber Neon','Gaming','Futuristic neon display',{fontFamily:'Arial Black',fontSize:52,fontWeight:900,color:'#67f7ff',letterSpacing:3,textTransform:'uppercase',textShadow:true,strokeColor:'#1741a5',strokeWidth:1,backgroundColor:'#050714',borderColor:'#06b6d4',borderWidth:2}),
  preset('esports-bold','Esports Bold','Gaming','Heavy competitive typography',{fontFamily:'Impact',fontSize:60,fontWeight:900,color:'#ffffff',letterSpacing:1,textTransform:'uppercase',textShadow:true,strokeColor:'#7c3aed',strokeWidth:2,backgroundColor:'#17102c',borderColor:'#8b5cf6',borderWidth:2}),
  preset('arcade-retro','Arcade Retro','Creative','Retro arcade atmosphere',{fontFamily:'Courier New',fontSize:46,fontWeight:700,color:'#facc15',letterSpacing:2,textTransform:'uppercase',textShadow:true,backgroundColor:'#201044',borderColor:'#ec4899',borderWidth:3,borderRadius:4}),
  preset('pastel-cute','Pastel Cute','Creative','Soft pastel styling',{fontFamily:'Trebuchet MS',fontSize:48,fontWeight:700,color:'#fbcfe8',letterSpacing:1,textTransform:'capitalize',backgroundColor:'#35243d',borderColor:'#f9a8d4',borderWidth:1,borderRadius:28,padding:24}),
  preset('editorial-serif','Editorial','Classic','Magazine-inspired serif hierarchy',{fontFamily:'Georgia',fontSize:52,fontWeight:700,color:'#f1f5f9',letterSpacing:-1,backgroundColor:'#17202b',borderColor:'#64748b',borderWidth:1,borderRadius:2,padding:30}),
  preset('terminal-green','Terminal','Gaming','Monospace command-line aesthetic',{fontFamily:'Lucida Console',fontSize:42,fontWeight:700,color:'#86efac',letterSpacing:1,textShadow:true,backgroundColor:'#03140d',borderColor:'#166534',borderWidth:1,borderRadius:6}),
  preset('nature-calm','Nature Calm','Minimal','Quiet natural tones',{fontFamily:'Verdana',fontSize:44,fontWeight:500,color:'#d9f99d',letterSpacing:1,textTransform:'capitalize',backgroundColor:'#17251b',borderColor:'#4d7c0f',borderWidth:1,borderRadius:20}),
  preset('vaporwave','Vaporwave','Creative','Retro futuristic purple and pink',{fontFamily:'Arial Black',fontSize:50,fontWeight:900,color:'#f0abfc',letterSpacing:4,textTransform:'uppercase',textShadow:true,strokeColor:'#7e22ce',strokeWidth:1,backgroundColor:'#1e103d',borderColor:'#22d3ee',borderWidth:2,borderRadius:10}),
  preset('modern-tech','Modern Tech','Classic','Precise modern interface typography',{fontFamily:'Segoe UI',fontSize:46,fontWeight:700,color:'#bfdbfe',backgroundColor:'#0f172a',borderColor:'#3b82f6',borderWidth:1,borderRadius:12}),
];

function cssString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n\0]/g, ' ');
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
    `  text-transform: ${style.textTransform || 'none'};`,
    `  text-shadow: ${style.textShadow ? '0 0 12px currentColor, 0 2px 5px rgba(0,0,0,.45)' : 'none'};`,
    `  -webkit-text-stroke: ${Math.max(0,Math.min(6,style.strokeWidth || 0))}px ${/^#[0-9a-f]{3,8}$/i.test(style.strokeColor || '') ? style.strokeColor : '#000000'};`,
    `  background: ${/^#[0-9a-f]{3,8}$/i.test(style.backgroundColor || '') ? style.backgroundColor : 'transparent'};`,
    `  border: ${Math.max(0,Math.min(8,style.borderWidth || 0))}px solid ${/^#[0-9a-f]{3,8}$/i.test(style.borderColor || '') ? style.borderColor : '#334155'};`,
    `  border-radius: ${Math.max(0,Math.min(64,style.borderRadius ?? 0))}px;`,
    `  padding: ${Math.max(0,Math.min(80,style.padding ?? 0))}px;`,
    '}',
  ].join('\n');
}
