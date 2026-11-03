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
}

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
    '}',
  ].join('\n');
}
