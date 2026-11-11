import { GeneratorId } from '../types';
import { NameInsightCategory } from '../types/nameInsight';

const BRAND_IDS = new Set<GeneratorId>([
  'brand','business','product','startup','shop','domain','app','feature','service','slogan',
  'clothing_brand','jewelry_brand','cosmetics_brand','coffee_shop','bakery',
  'food_truck','fitness_studio','travel_agency','real_estate','architecture_studio',
  'interior_decor','photo_studio','wedding_planner','marketing_agency','ecommerce_store',
  'specialty_coffee','artisanal_bakery','luxury_perfume','architect_firm','eco_fashion',
  'cocktail_lounge','green_energy_corp','microbrewery_craft','fintech_app','wellness_spa',
  'ai_megacorp','crypto_token','handle'
]);

const CHARACTER_IDS = new Set<GeneratorId>([
  'character','anime','anime_hero','anime_rival','fictional_mentor','magical_girl','mecha_pilot','anime_school','bio_chimera','anime_faction',
  'baby_name','pet_name','detective_noir','steampunk_inventor','space_pirate','alchemist_healer',
  'court_diplomat','gladiator_champion','wandering_bard','cyber_medic','smuggler_pilot',
  'mystic_oracle','cyber_hacker','cyborg_bounty_hunter','bounty_hunter_guild','nordic_valkyrie',
  'celtic_druid','vampire','vampire_coven','griffin_rider','desert_djinn','gargoyle_sentinel',
  'undead_lich','elemental_golem','predatory_raptor','pet_name'
]);

const RPG_IDS = new Set<GeneratorId>([
  'rpg','fantasy','elf','dragon','kingdom','warrior','wizard','vampire','boss','spell','tavern',
  'dungeon','guild','clan_name','secret_order','sky_citadel','mythic_creature','monster_beast',
  'magic_relic','spirit_guardian','griffin_rider','abyssal_leviathan','phoenix_flame',
  'enchanted_forest','sacred_artifact','shadow_assassin_guild','elemental_golem','royal_knight_order',
  'dwarven_citadel','elven_sanctuary','magical_academy','epic_quest_name','magic_potion',
  'raid_dungeon_boss','legendary_armor','tcg_card_spell','elemental_power'
]);

const GAME_IDS = new Set<GeneratorId>([
  'gaming','gamertag','videogame','indie_game_studio','game_dev_studio','esport_team_pro',
  'moba_champion','survival_server','mmorpg_server_realm','retro_arcade_cabinet','board_game',
  'boardgame_title','speedrun_marathon','loot_box_tier','sports_team','server_cluster'
]);

const SCIFI_IDS = new Set<GeneratorId>([
  'sci-fi','starship','mecha','cyberpunk','steampunk','alien_species','planet','starship',
  'orbital_station','quantum_reactor','terraformed_colony','interstellar_corridor','exoplanet_biodome',
  'deep_space_probe','nanotech_swarm','neural_interface','dystopian_city_sector','space_telescope',
  'interstellar_empire','floating_skyland','sunken_atlantis','space_pirate','smuggler_pilot'
]);

const SCIENCE_IDS = new Set<GeneratorId>([
  'math_app','math_puzzle','fictional_theorem','geometric_object','fractal_pattern','number_system',
  'scientific_model','science_popularization','deep_learning_model','quantum_particle',
  'cryptographic_protocol','astronomy_constellation','research_project','scientific_expedition',
  'crystal_mineral','luminescent_fungi','math_olympiad_team'
]);

const PROJECT_IDS = new Set<GeneratorId>([
  'project','framework','event','ai_bot','software_tool','browser_extension','ai_agent_workflow',
  'opensource_project','code_library','api_service','database_engine','cloud_platform','cyber_lab',
  'educational_project','charity_ngo','coworking_space','newsletter','blog_name','podcast',
  'youtube','streaming_channel','publishing_house','novel_series','comic_manga_series',
  'band_name','album_title','song_title','webradio_station','hackathon_team','creative_workshop',
  'online_course','study_group','personal_portfolio','local_association','eco_initiative',
  'open_source_framework','literary_magazine','experimental_cinema','indie_music_label',
  'ted_talk_theme','educational_escape_game','book','calendar_era','community','creative_coworking','festival_event','os_system','sprint_ritual'
]);

const PLACE_IDS = new Set<GeneratorId>([
  'placename','restaurant','hotel_name','exotic_resort','enchanted_forest','mountain_summit',
  'coral_reef','wild_sanctuary','volcanic_geyser','desert_oasis','ancient_tree','deep_sea_species',
  'arctic_creature','tropical_rainforest','floating_skyland','dwarven_citadel','elven_sanctuary',
  'sunken_atlantis','desert_empire','frozen_fjord','pirate_haven','merchant_crossroad',
  'haunted_manor','forbidden_wasteland','ancient_pyramid_tomb','culinary','carnivorous_plant'
]);

// Deliberately omit generators whose subject is weapons, attacks, or tactical operations.
export const NAME_INSIGHT_EXCLUDED_GENERATORS = new Set<string>([
  'weapon',
  'plasma_weapon',
  'tactical_operation',
  'special_attack'
]);

export function isNameInsightSupported(generatorId: GeneratorId): boolean {
  return !NAME_INSIGHT_EXCLUDED_GENERATORS.has(generatorId);
}

export function resolveNameInsightCategory(generatorId: GeneratorId): NameInsightCategory {
  if (BRAND_IDS.has(generatorId)) return 'brand';
  if (CHARACTER_IDS.has(generatorId)) return 'character';
  if (RPG_IDS.has(generatorId)) return 'rpg';
  if (GAME_IDS.has(generatorId)) return 'game';
  if (SCIFI_IDS.has(generatorId)) return 'science-fiction';
  if (SCIENCE_IDS.has(generatorId)) return 'science';
  if (PROJECT_IDS.has(generatorId)) return 'project';
  if (PLACE_IDS.has(generatorId)) return 'place';
  return 'general';
}

export const NAME_INSIGHT_CATEGORY_LABELS: Record<NameInsightCategory, string> = {
  brand: 'Brand & identity',
  character: 'Character concept',
  rpg: 'Fantasy & role-playing',
  game: 'Gaming identity',
  'science-fiction': 'Science-fiction universe',
  science: 'Science & discovery',
  project: 'Project & innovation',
  place: 'Place & worldbuilding',
  general: 'Creative concept'
};

export const NAME_INSIGHT_PALETTES: [string, string, string][] = [
  ['#2563EB', '#38BDF8', '#A78BFA'],
  ['#0F766E', '#2DD4BF', '#A3E635'],
  ['#7C3AED', '#C084FC', '#F0ABFC'],
  ['#B45309', '#F59E0B', '#FDE68A'],
  ['#BE123C', '#FB7185', '#FDA4AF'],
  ['#334155', '#64748B', '#CBD5E1'],
  ['#166534', '#4ADE80', '#BEF264'],
  ['#1D4ED8', '#818CF8', '#C4B5FD']
];

export const NAME_INSIGHT_ALTERNATIVE_SUFFIXES: Record<NameInsightCategory, string[]> = {
  brand: ['Studio', 'Works', 'Collective'],
  character: ['the Wanderer', 'of the Dawn', 'the Unbound'],
  rpg: ['of the Vale', 'the Far-Seer', 'of the Ember'],
  game: ['Prime', 'Arc', 'Nova'],
  'science-fiction': ['Protocol', 'Nexus', 'Orbit'],
  science: ['Model', 'Vector', 'Principle'],
  project: ['Lab', 'Initiative', 'Project'],
  place: ['Haven', 'Reach', 'Sanctuary'],
  general: ['Nova', 'Origins', 'Horizon']
};

export type NameInsightSloganTone = 'identity' | 'world' | 'innovation';

export const NAME_INSIGHT_SLOGAN_TEMPLATES: Record<string, Record<NameInsightSloganTone, string>> = {
  en: { identity: 'Make your mark with {name}.', world: 'A new world begins with {name}.', innovation: "Imagine what's next with {name}." },
  fr: { identity: 'Affirmez votre identité avec {name}.', world: 'Un nouvel univers commence avec {name}.', innovation: 'Imaginez la suite avec {name}.' },
  es: { identity: 'Deja tu huella con {name}.', world: 'Un mundo nuevo comienza con {name}.', innovation: 'Imagina lo que viene con {name}.' },
  de: { identity: 'Setze ein Zeichen mit {name}.', world: 'Mit {name} beginnt eine neue Welt.', innovation: 'Denke mit {name} voraus.' },
  it: { identity: 'Lascia il segno con {name}.', world: 'Un nuovo mondo comincia con {name}.', innovation: 'Immagina il futuro con {name}.' },
  pt: { identity: 'Deixe sua marca com {name}.', world: 'Um novo mundo começa com {name}.', innovation: 'Imagine o que vem a seguir com {name}.' },
  ar: { identity: 'اترك بصمتك مع {name}.', world: 'يبدأ عالم جديد مع {name}.', innovation: 'تخيّل ما هو قادم مع {name}.' },
  tr: { identity: '{name} ile iz bırak.', world: 'Yeni bir dünya {name} ile başlar.', innovation: '{name} ile geleceği hayal et.' },
  ja: { identity: '{name}で、あなたらしい存在感を。', world: '{name}から、新しい世界が始まる。', innovation: '{name}と、その先の可能性へ。' },
  ko: { identity: '{name}로 당신만의 흔적을 남기세요.', world: '{name}에서 새로운 세계가 시작됩니다.', innovation: '{name}와 함께 다음 가능성을 상상하세요.' },
  zh: { identity: '用{name}留下独特印记。', world: '一个全新的世界，从{name}开始。', innovation: '与{name}一起，探索下一种可能。' },
  ru: { identity: 'Оставьте свой след вместе с {name}.', world: 'Новый мир начинается с {name}.', innovation: 'Представьте будущее вместе с {name}.' },
  hi: { identity: '{name} के साथ अपनी पहचान बनाएँ।', world: '{name} से एक नई दुनिया शुरू होती है।', innovation: '{name} के साथ आगे की कल्पना करें।' },
  nl: { identity: 'Laat je stempel achter met {name}.', world: 'Een nieuwe wereld begint met {name}.', innovation: 'Stel je voor wat hierna komt met {name}.' },
  pl: { identity: 'Zostaw swój ślad z {name}.', world: 'Nowy świat zaczyna się od {name}.', innovation: 'Wyobraź sobie przyszłość z {name}.' },
  sv: { identity: 'Sätt ditt avtryck med {name}.', world: 'En ny värld börjar med {name}.', innovation: 'Föreställ dig nästa steg med {name}.' },
  vi: { identity: 'Tạo dấu ấn riêng cùng {name}.', world: 'Một thế giới mới bắt đầu từ {name}.', innovation: 'Cùng {name} hình dung những điều tiếp theo.' },
  id: { identity: 'Tinggalkan jejak bersama {name}.', world: 'Dunia baru dimulai bersama {name}.', innovation: 'Bayangkan langkah berikutnya bersama {name}.' },
  th: { identity: 'สร้างเอกลักษณ์ไปกับ {name}', world: 'โลกใบใหม่เริ่มต้นที่ {name}', innovation: 'จินตนาการถึงก้าวต่อไปกับ {name}' },
  el: { identity: 'Άφησε το αποτύπωμά σου με το {name}.', world: 'Ένας νέος κόσμος ξεκινά με το {name}.', innovation: 'Φαντάσου όσα έρχονται με το {name}.' },
  he: { identity: 'השאירו חותם עם {name}.', world: 'עולם חדש מתחיל עם {name}.', innovation: 'דמיינו את הצעד הבא עם {name}.' },
  cs: { identity: 'Zanechte svou stopu se jménem {name}.', world: 'Nový svět začíná jménem {name}.', innovation: 'Představte si, co přijde dál s názvem {name}.' },
  ro: { identity: 'Lasă-ți amprenta cu {name}.', world: 'O lume nouă începe cu {name}.', innovation: 'Imaginează-ți ce urmează cu {name}.' },
  da: { identity: 'Sæt dit præg med {name}.', world: 'En ny verden begynder med {name}.', innovation: 'Forestil dig det næste med {name}.' },
  fi: { identity: 'Jätä oma jälkesi nimellä {name}.', world: 'Uusi maailma alkaa nimellä {name}.', innovation: 'Kuvittele seuraava askel nimellä {name}.' },
  uk: { identity: 'Залиште свій слід разом із {name}.', world: 'Новий світ починається з {name}.', innovation: 'Уявіть майбутнє разом із {name}.' },
  bn: { identity: '{name}-এর সঙ্গে নিজের ছাপ রাখুন।', world: '{name} দিয়ে শুরু হোক এক নতুন জগৎ।', innovation: '{name}-এর সঙ্গে আগামীর কল্পনা করুন।' },
  nb: { identity: 'Sett ditt preg med {name}.', world: 'En ny verden begynner med {name}.', innovation: 'Se for deg neste steg med {name}.' }
};

export type NameInsightReadingBand = 'compact' | 'balanced' | 'extended';

export const NAME_INSIGHT_READING_TEMPLATES: Record<string, Record<NameInsightReadingBand, string>> = {
  en: { compact: 'For {context}, {name} has a compact form at {count} letters, which is easy to scan.', balanced: 'For {context}, {name} has a balanced length of {count} letters, giving it room to stand out without feeling too long.', extended: 'For {context}, {name} has an extended form of {count} letters; a shorter display version may work better in small spaces.' },
  fr: { compact: 'Pour {context}, {name} présente une forme compacte de {count} lettres, facile à repérer.', balanced: 'Pour {context}, {name} possède une longueur équilibrée de {count} lettres, assez distinctive sans être trop longue.', extended: 'Pour {context}, {name} présente une forme longue de {count} lettres ; une version abrégée peut être plus lisible dans les petits espaces.' },
  es: { compact: 'Para {context}, {name} tiene una forma compacta de {count} letras, fácil de identificar.', balanced: 'Para {context}, {name} tiene una longitud equilibrada de {count} letras, distintiva sin resultar demasiado larga.', extended: 'Para {context}, {name} tiene una forma larga de {count} letras; una versión abreviada puede funcionar mejor en espacios pequeños.' },
  de: { compact: 'Für {context} hat {name} mit {count} Buchstaben eine kompakte, schnell erfassbare Form.', balanced: 'Für {context} hat {name} mit {count} Buchstaben eine ausgewogene Länge und bleibt gut unterscheidbar.', extended: 'Für {context} ist {name} mit {count} Buchstaben recht lang; eine Kurzform kann in kleinen Darstellungen besser funktionieren.' },
  it: { compact: 'Per {context}, {name} ha una forma compatta di {count} lettere, facile da leggere a colpo d’occhio.', balanced: 'Per {context}, {name} ha una lunghezza equilibrata di {count} lettere, distintiva senza risultare troppo lunga.', extended: 'Per {context}, {name} ha una forma estesa di {count} lettere; una versione breve può funzionare meglio negli spazi ridotti.' },
  pt: { compact: 'Para {context}, {name} tem uma forma compacta de {count} letras, fácil de identificar.', balanced: 'Para {context}, {name} tem um comprimento equilibrado de {count} letras, com personalidade sem ficar longo demais.', extended: 'Para {context}, {name} tem uma forma extensa de {count} letras; uma versão curta pode funcionar melhor em espaços pequenos.' },
  ar: { compact: 'في مجال {context}، يأتي {name} بصيغة موجزة من {count} أحرف يسهل تمييزها.', balanced: 'في مجال {context}، يتكوّن {name} من {count} أحرف، بطول متوازن يمنحه حضورًا واضحًا دون إطالة.', extended: 'في مجال {context}، يتكوّن {name} من {count} أحرف؛ وقد تكون الصيغة المختصرة أوضح في المساحات الصغيرة.' },
  tr: { compact: '{context} için {name}, {count} harflik kısa ve kolay taranan bir yapıya sahip.', balanced: '{context} için {name}, {count} harfle dengeli bir uzunluk sunar ve gereğinden fazla uzamaz.', extended: '{context} için {name}, {count} harfle uzun bir yapıya sahip; küçük alanlarda kısa bir biçim daha kullanışlı olabilir.' },
  ja: { compact: '{context}向けの{name}は{count}文字で、短く把握しやすい形です。', balanced: '{context}向けの{name}は{count}文字で、長すぎず個性を出しやすい長さです。', extended: '{context}向けの{name}は{count}文字です。小さな表示では短縮形も検討できます。' },
  ko: { compact: '{context}에 쓰이는 {name}은(는) {count}자로 짧고 한눈에 파악하기 쉽습니다.', balanced: '{context}에 쓰이는 {name}은(는) {count}자로 균형 잡힌 길이이며 개성을 드러내기 좋습니다.', extended: '{context}에 쓰이는 {name}은(는) {count}자로 긴 편입니다. 작은 화면에서는 짧은 표시형이 더 적합할 수 있습니다.' },
  zh: { compact: '{context}中的{name}由{count}个字符组成，形式简洁，容易识别。', balanced: '{context}中的{name}长度为{count}个字符，比较均衡，既有辨识度又不会太长。', extended: '{context}中的{name}长度为{count}个字符；在较小的显示区域中，缩短形式可能更清晰。' },
  ru: { compact: 'Для категории «{context}» имя {name} состоит из {count} букв и выглядит компактно.', balanced: 'Для категории «{context}» имя {name} длиной {count} букв выглядит сбалансированно и достаточно выразительно.', extended: 'Для категории «{context}» имя {name} довольно длинное — {count} букв; в небольших областях может пригодиться сокращённая форма.' },
  hi: { compact: '{context} के लिए {name} में {count} अक्षर हैं; इसका रूप संक्षिप्त और आसानी से पढ़ा जा सकता है।', balanced: '{context} के लिए {name} में {count} अक्षर हैं; इसकी लंबाई संतुलित है और यह अलग पहचान बना सकता है।', extended: '{context} के लिए {name} में {count} अक्षर हैं; छोटी जगहों पर इसका संक्षिप्त रूप अधिक उपयोगी हो सकता है।' },
  nl: { compact: 'Voor {context} heeft {name} een compacte vorm van {count} letters die snel te overzien is.', balanced: 'Voor {context} heeft {name} met {count} letters een evenwichtige lengte en een herkenbare vorm.', extended: 'Voor {context} is {name} met {count} letters aan de lange kant; een korte weergave kan op kleine plekken beter werken.' },
  pl: { compact: 'W kategorii {context} nazwa {name} ma zwartą formę i {count} liter, więc łatwo ją szybko odczytać.', balanced: 'W kategorii {context} nazwa {name} ma {count} liter — długość jest wyważona i pozwala zachować wyrazistość.', extended: 'W kategorii {context} nazwa {name} ma {count} liter; w małych miejscach lepiej może sprawdzić się krótsza forma.' },
  sv: { compact: 'För {context} har {name} en kompakt form med {count} bokstäver som är lätt att överblicka.', balanced: 'För {context} har {name} en balanserad längd på {count} bokstäver och kan ändå sticka ut.', extended: 'För {context} är {name} ganska långt med {count} bokstäver; en kortare visningsform kan fungera bättre på små ytor.' },
  vi: { compact: 'Với {context}, {name} có dạng ngắn gọn gồm {count} chữ cái, dễ quan sát.', balanced: 'Với {context}, {name} có độ dài cân đối gồm {count} chữ cái, đủ khác biệt mà không quá dài.', extended: 'Với {context}, {name} có {count} chữ cái và khá dài; dạng rút gọn có thể phù hợp hơn ở không gian nhỏ.' },
  id: { compact: 'Untuk {context}, {name} memiliki bentuk ringkas dengan {count} huruf sehingga mudah dipindai.', balanced: 'Untuk {context}, {name} memiliki panjang seimbang, yaitu {count} huruf, sehingga tetap khas tanpa terlalu panjang.', extended: 'Untuk {context}, {name} memiliki {count} huruf dan cukup panjang; bentuk singkat dapat lebih cocok di ruang kecil.' },
  th: { compact: 'สำหรับ{context} ชื่อ {name} มี {count} ตัวอักษร จึงกระชับและมองเห็นได้ง่าย', balanced: 'สำหรับ{context} ชื่อ {name} มี {count} ตัวอักษร ความยาวกำลังพอดีและจดจำได้ง่าย', extended: 'สำหรับ{context} ชื่อ {name} มี {count} ตัวอักษรและค่อนข้างยาว รูปแบบย่ออาจเหมาะกับพื้นที่ขนาดเล็กกว่า' },
  el: { compact: 'Για το {context}, το {name} έχει σύντομη μορφή {count} γραμμάτων που διαβάζεται εύκολα.', balanced: 'Για το {context}, το {name} έχει ισορροπημένο μήκος {count} γραμμάτων και ξεχωρίζει χωρίς να είναι υπερβολικά μεγάλο.', extended: 'Για το {context}, το {name} έχει {count} γράμματα· μια συντομότερη μορφή ίσως λειτουργεί καλύτερα σε μικρούς χώρους.' },
  he: { compact: 'עבור {context}, השם {name} כולל {count} אותיות ובעל צורה קצרה שקל לסרוק.', balanced: 'עבור {context}, השם {name} כולל {count} אותיות — אורך מאוזן שמאפשר לו לבלוט בלי להיות ארוך מדי.', extended: 'עבור {context}, השם {name} כולל {count} אותיות; גרסה קצרה עשויה להתאים יותר למקומות קטנים.' },
  cs: { compact: 'Pro oblast {context} má název {name} kompaktní podobu o {count} písmenech, kterou lze rychle přečíst.', balanced: 'Pro oblast {context} má název {name} vyváženou délku {count} písmen a působí dostatečně osobitě.', extended: 'Pro oblast {context} má název {name} {count} písmen; v malých prostorech může lépe fungovat zkrácená podoba.' },
  ro: { compact: 'Pentru {context}, {name} are o formă compactă de {count} litere, ușor de parcurs.', balanced: 'Pentru {context}, {name} are o lungime echilibrată de {count} litere, suficient de distinctă fără a fi prea lungă.', extended: 'Pentru {context}, {name} are {count} litere și este destul de lung; o variantă scurtă poate fi mai potrivită în spații mici.' },
  da: { compact: 'Til {context} har {name} en kompakt form på {count} bogstaver, som er let at overskue.', balanced: 'Til {context} har {name} en afbalanceret længde på {count} bogstaver og kan stadig skille sig ud.', extended: 'Til {context} er {name} langt med {count} bogstaver; en kortere visningsform kan fungere bedre på små flader.' },
  fi: { compact: '{context}-käyttöön {name} on kompakti {count} kirjaimen nimi, joka on helppo hahmottaa.', balanced: '{context}-käyttöön {name} on {count} kirjaimen mittainen ja tasapainoinen nimi, joka erottuu olematta liian pitkä.', extended: '{context}-käyttöön {name} on {count} kirjaimen mittainen ja melko pitkä; lyhyempi muoto voi toimia paremmin pienissä tiloissa.' },
  uk: { compact: 'Для категорії «{context}» назва {name} має компактну форму з {count} літер, яку легко прочитати.', balanced: 'Для категорії «{context}» назва {name} має збалансовану довжину — {count} літер, тож залишається виразною без зайвої довжини.', extended: 'Для категорії «{context}» назва {name} має {count} літер; у невеликих просторах може краще працювати скорочена форма.' },
  bn: { compact: '{context}-এর জন্য {name}-এ {count}টি অক্ষর রয়েছে; নামটি সংক্ষিপ্ত এবং সহজে চোখে পড়ে।', balanced: '{context}-এর জন্য {name}-এ {count}টি অক্ষর রয়েছে; দৈর্ঘ্যটি ভারসাম্যপূর্ণ এবং আলাদা করে চেনা যায়।', extended: '{context}-এর জন্য {name}-এ {count}টি অক্ষর রয়েছে; ছোট জায়গায় সংক্ষিপ্ত রূপটি বেশি কার্যকর হতে পারে।' },
  nb: { compact: 'For {context} har {name} en kompakt form på {count} bokstaver som er lett å få oversikt over.', balanced: 'For {context} har {name} en balansert lengde på {count} bokstaver og kan likevel skille seg ut.', extended: 'For {context} er {name} ganske langt med {count} bokstaver; en kortere visningsform kan fungere bedre på små flater.' }
};
