import React, { useMemo, useState } from 'react';
import { Check, Copy, Sparkles, X, ChevronDown } from 'lucide-react';
import { GeneratedName, GeneratorMeta } from '../types';
import { getAppSettings } from '../services/settings';
import { getNameDetailsLabels } from '../i18n/nameDetails';
import { getLocalizedGeneratorDescription } from '../i18n/generatorContent';
import { createNameInsight } from '../services/nameInsightService';
import './name-insight.css';

const REVIEW_GUIDANCE: Record<string, string> = {
  en: 'Before using a name publicly, test its pronunciation and clarity with people in your target audience. For commercial use, check domain and trademark availability separately; NameForge does not perform those checks.',
  fr: 'Avant d’utiliser un nom publiquement, testez sa prononciation et sa clarté auprès du public visé. Pour un usage commercial, vérifiez séparément la disponibilité du domaine et des marques : NameForge n’effectue pas ces contrôles.',
  es: 'Antes de usar un nombre públicamente, prueba su pronunciación y claridad con personas de tu público objetivo. Para uso comercial, comprueba por separado la disponibilidad del dominio y de la marca; NameForge no realiza esas verificaciones.',
  de: 'Bevor du einen Namen öffentlich verwendest, teste Aussprache und Verständlichkeit mit Personen aus deiner Zielgruppe. Prüfe bei kommerzieller Nutzung die Domain- und Markenverfügbarkeit separat; NameForge führt diese Prüfungen nicht durch.',
  it: 'Prima di usare pubblicamente un nome, verifica pronuncia e chiarezza con persone del pubblico a cui ti rivolgi. Per un uso commerciale, controlla separatamente la disponibilità del dominio e del marchio: NameForge non effettua queste verifiche.',
  pt: 'Antes de usar um nome publicamente, teste a pronúncia e a clareza com pessoas do público-alvo. Para uso comercial, verifique separadamente a disponibilidade do domínio e da marca; o NameForge não realiza essas verificações.',
  ar: 'قبل استخدام الاسم علنًا، اختبر سهولة نطقه ووضوحه مع أشخاص من الجمهور المستهدف. وللاستخدام التجاري، تحقّق بشكل مستقل من توفر النطاق والعلامة التجارية؛ فـ NameForge لا يجري هذه الفحوصات.',
  tr: 'Bir adı herkese açık şekilde kullanmadan önce telaffuzunu ve anlaşılırlığını hedef kitlenizden kişilerle test edin. Ticari kullanım için alan adı ve marka uygunluğunu ayrıca kontrol edin; NameForge bu kontrolleri yapmaz.',
  ja: '名前を公開して使う前に、対象となる人々に発音や分かりやすさを確認してもらいましょう。商用利用では、ドメインと商標の利用可能性を別途確認してください。NameForgeはこれらを確認しません。',
  ko: '이름을 공개적으로 사용하기 전에 대상 사용자에게 발음과 명확성을 확인하세요. 상업적으로 사용하려면 도메인과 상표 사용 가능 여부를 별도로 확인해야 합니다. NameForge는 이러한 확인을 수행하지 않습니다.',
  zh: '公开使用名称前，请向目标受众测试其发音和清晰度。若用于商业用途，请另行核查域名和商标是否可用；NameForge 不执行这些核查。',
  ru: 'Перед публичным использованием имени проверьте его произношение и понятность на представителях целевой аудитории. Для коммерческого применения отдельно проверьте доступность домена и товарного знака: NameForge этого не делает.',
  hi: 'किसी नाम का सार्वजनिक उपयोग करने से पहले लक्षित दर्शकों के साथ उसके उच्चारण और स्पष्टता की जाँच करें। व्यावसायिक उपयोग के लिए डोमेन और ट्रेडमार्क की उपलब्धता अलग से जाँचें; NameForge ये जाँच नहीं करता।',
  nl: 'Test voordat je een naam openbaar gebruikt de uitspraak en duidelijkheid bij mensen uit je doelgroep. Controleer voor commercieel gebruik afzonderlijk de beschikbaarheid van de domeinnaam en het handelsmerk; NameForge voert deze controles niet uit.',
  pl: 'Przed publicznym użyciem nazwy sprawdź jej wymowę i czytelność wśród osób z grupy docelowej. W przypadku zastosowań komercyjnych osobno zweryfikuj dostępność domeny i znaku towarowego; NameForge tego nie sprawdza.',
  sv: 'Testa uttal och tydlighet med personer i målgruppen innan du använder ett namn offentligt. Vid kommersiell användning bör du separat kontrollera domän- och varumärkestillgänglighet; NameForge gör inte dessa kontroller.',
  vi: 'Trước khi sử dụng tên công khai, hãy thử kiểm tra cách phát âm và độ rõ ràng với những người thuộc nhóm đối tượng mục tiêu. Nếu dùng cho mục đích thương mại, hãy tự kiểm tra riêng tính khả dụng của tên miền và nhãn hiệu; NameForge không thực hiện các kiểm tra này.',
  id: 'Sebelum menggunakan nama secara publik, uji pelafalan dan kejelasannya kepada orang-orang dalam audiens sasaran. Untuk penggunaan komersial, periksa ketersediaan domain dan merek dagang secara terpisah; NameForge tidak melakukan pemeriksaan tersebut.',
  th: 'ก่อนนำชื่อไปใช้ในที่สาธารณะ โปรดลองตรวจสอบการออกเสียงและความชัดเจนกับกลุ่มเป้าหมายก่อน หากใช้ในเชิงพาณิชย์ ควรตรวจสอบโดเมนและเครื่องหมายการค้าแยกต่างหาก เนื่องจาก NameForge ไม่ได้ดำเนินการตรวจสอบเหล่านี้',
  el: 'Πριν χρησιμοποιήσετε δημόσια ένα όνομα, δοκιμάστε την προφορά και τη σαφήνειά του με άτομα από το κοινό-στόχο σας. Για εμπορική χρήση, ελέγξτε ξεχωριστά τη διαθεσιμότητα domain και εμπορικού σήματος· το NameForge δεν πραγματοποιεί αυτούς τους ελέγχους.',
  he: 'לפני שימוש פומבי בשם, בדקו את ההגייה והבהירות שלו עם אנשים מקהל היעד. לשימוש מסחרי, בדקו בנפרד זמינות של דומיין וסימן מסחר; NameForge אינו מבצע בדיקות אלה.',
  cs: 'Před veřejným použitím názvu ověřte jeho výslovnost a srozumitelnost u lidí z cílové skupiny. Pro komerční použití samostatně zkontrolujte dostupnost domény a ochranné známky; NameForge tyto kontroly neprovádí.',
  ro: 'Înainte de a folosi public un nume, testați pronunția și claritatea acestuia cu persoane din publicul țintă. Pentru uz comercial, verificați separat disponibilitatea domeniului și a mărcii; NameForge nu efectuează aceste verificări.',
  da: 'Før du bruger et navn offentligt, bør du teste udtale og tydelighed med personer fra målgruppen. Ved kommerciel brug skal du separat kontrollere, om domænet og varemærket er tilgængeligt; NameForge udfører ikke disse kontroller.',
  fi: 'Testaa nimen ääntämistä ja selkeyttä kohderyhmään kuuluvilla ihmisillä ennen julkista käyttöä. Tarkista kaupallisessa käytössä verkkotunnuksen ja tavaramerkin saatavuus erikseen; NameForge ei tee näitä tarkistuksia.',
  uk: 'Перш ніж використовувати назву публічно, перевірте її вимову та зрозумілість на представниках цільової аудиторії. Для комерційного використання окремо перевірте доступність домену й торговельної марки; NameForge цього не робить.',
  bn: 'কোনো নাম প্রকাশ্যে ব্যবহারের আগে লক্ষ্য শ্রোতার মানুষের সঙ্গে এর উচ্চারণ ও স্পষ্টতা পরীক্ষা করুন। বাণিজ্যিক ব্যবহারের জন্য ডোমেইন ও ট্রেডমার্কের প্রাপ্যতা আলাদাভাবে যাচাই করুন; NameForge এই যাচাই করে না।',
  nb: 'Test uttale og tydelighet med personer i målgruppen før du bruker et navn offentlig. Ved kommersiell bruk bør du kontrollere tilgjengeligheten til domenet og varemerket separat; NameForge utfører ikke disse kontrollene.'
};

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
    generatorLabel: meta.shortTitle,
    language
  }), [item.name, item.generatorId, item.style, meta, language]);
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

  const structureLabels: Record<string, { heading: string; vowelShare: string; vowelNote: string }> = {
    en: { heading: 'Name structure', vowelShare: 'Latin vowel share', vowelNote: 'This ratio is shown only when every letter in the name uses the Latin alphabet.' },
    fr: { heading: 'Structure du nom', vowelShare: 'Part de voyelles latines', vowelNote: 'Ce ratio est affiché uniquement si toutes les lettres du nom utilisent l’alphabet latin.' },
    es: { heading: 'Estructura del nombre', vowelShare: 'Proporción de vocales latinas', vowelNote: 'Este índice solo se muestra si todas las letras del nombre usan el alfabeto latino.' },
    de: { heading: 'Namensstruktur', vowelShare: 'Anteil lateinischer Vokale', vowelNote: 'Dieser Anteil wird nur angezeigt, wenn alle Buchstaben des Namens zum lateinischen Alphabet gehören.' },
    it: { heading: 'Struttura del nome', vowelShare: 'Quota di vocali latine', vowelNote: 'Questo rapporto viene mostrato solo se tutte le lettere del nome appartengono all’alfabeto latino.' },
    pt: { heading: 'Estrutura do nome', vowelShare: 'Proporção de vogais latinas', vowelNote: 'Esta proporção só é exibida quando todas as letras do nome usam o alfabeto latino.' },
    ar: { heading: 'بنية الاسم', vowelShare: 'نسبة حروف العلة اللاتينية', vowelNote: 'تُعرض هذه النسبة فقط عندما تكون جميع حروف الاسم مكتوبة بالأبجدية اللاتينية.' },
    tr: { heading: 'İsim yapısı', vowelShare: 'Latin sesli harf oranı', vowelNote: 'Bu oran yalnızca addaki tüm harfler Latin alfabesiyle yazıldığında gösterilir.' },
    ja: { heading: '名前の構造', vowelShare: 'ラテン文字の母音比率', vowelNote: 'この比率は、名前のすべての文字がラテン文字の場合にのみ表示されます。' },
    ko: { heading: '이름 구조', vowelShare: '라틴 모음 비율', vowelNote: '이 비율은 이름의 모든 글자가 라틴 문자일 때만 표시됩니다.' },
    zh: { heading: '名称结构', vowelShare: '拉丁字母元音占比', vowelNote: '仅当名称中的所有字母均为拉丁字母时，才会显示此比例。' },
    ru: { heading: 'Структура имени', vowelShare: 'Доля латинских гласных', vowelNote: 'Этот показатель отображается, только если все буквы имени написаны латиницей.' },
    hi: { heading: 'नाम की संरचना', vowelShare: 'लैटिन स्वरों का अनुपात', vowelNote: 'यह अनुपात तभी दिखाया जाता है जब नाम के सभी अक्षर लैटिन लिपि में हों।' },
    nl: { heading: 'Naamstructuur', vowelShare: 'Aandeel Latijnse klinkers', vowelNote: 'Deze verhouding wordt alleen getoond als alle letters van de naam uit het Latijnse alfabet komen.' },
    pl: { heading: 'Struktura nazwy', vowelShare: 'Udział samogłosek łacińskich', vowelNote: 'Ten wskaźnik jest widoczny tylko wtedy, gdy wszystkie litery nazwy należą do alfabetu łacińskiego.' },
    sv: { heading: 'Namnstruktur', vowelShare: 'Andel latinska vokaler', vowelNote: 'Andelen visas bara när alla bokstäver i namnet tillhör det latinska alfabetet.' },
    vi: { heading: 'Cấu trúc tên', vowelShare: 'Tỷ lệ nguyên âm Latin', vowelNote: 'Tỷ lệ này chỉ hiển thị khi tất cả chữ cái trong tên đều thuộc bảng chữ cái Latin.' },
    id: { heading: 'Struktur nama', vowelShare: 'Proporsi vokal Latin', vowelNote: 'Rasio ini hanya ditampilkan jika semua huruf dalam nama menggunakan alfabet Latin.' },
    th: { heading: 'โครงสร้างชื่อ', vowelShare: 'สัดส่วนสระละติน', vowelNote: 'จะแสดงสัดส่วนนี้เมื่ออักษรทุกตัวในชื่อใช้ตัวอักษรละตินเท่านั้น' },
    el: { heading: 'Δομή ονόματος', vowelShare: 'Ποσοστό λατινικών φωνηέντων', vowelNote: 'Το ποσοστό εμφανίζεται μόνο όταν όλα τα γράμματα του ονόματος ανήκουν στο λατινικό αλφάβητο.' },
    he: { heading: 'מבנה השם', vowelShare: 'שיעור התנועות הלטיניות', vowelNote: 'היחס מוצג רק כאשר כל האותיות בשם כתובות באלפבית הלטיני.' },
    cs: { heading: 'Struktura názvu', vowelShare: 'Podíl latinských samohlásek', vowelNote: 'Tento podíl se zobrazí pouze tehdy, když jsou všechna písmena názvu zapsána latinkou.' },
    ro: { heading: 'Structura numelui', vowelShare: 'Proporția vocalelor latine', vowelNote: 'Acest raport este afișat numai dacă toate literele numelui folosesc alfabetul latin.' },
    da: { heading: 'Navnestruktur', vowelShare: 'Andel latinske vokaler', vowelNote: 'Denne andel vises kun, når alle bogstaver i navnet bruger det latinske alfabet.' },
    fi: { heading: 'Nimen rakenne', vowelShare: 'Latinalaisten vokaalien osuus', vowelNote: 'Tämä osuus näytetään vain, kun kaikki nimen kirjaimet kuuluvat latinalaiseen aakkostoon.' },
    uk: { heading: 'Структура назви', vowelShare: 'Частка латинських голосних', vowelNote: 'Цей показник відображається лише тоді, коли всі літери назви записані латиницею.' },
    bn: { heading: 'নামের গঠন', vowelShare: 'ল্যাটিন স্বরবর্ণের অনুপাত', vowelNote: 'নামের সব অক্ষর ল্যাটিন বর্ণমালায় লেখা থাকলেই এই অনুপাত দেখানো হয়।' },
    nb: { heading: 'Navnestruktur', vowelShare: 'Andel latinske vokaler', vowelNote: 'Denne andelen vises bare når alle bokstavene i navnet bruker det latinske alfabetet.' }
  };
  const structureCopy = structureLabels[language] ?? structureLabels.en;

  const dir = language === 'ar' || language === 'he' ? 'rtl' : 'ltr';
  const sloganHeading: Record<string, string> = { en: 'Slogan', fr: 'Slogan', es: 'Eslogan', de: 'Slogan', it: 'Slogan', pt: 'Slogan', ar: 'عبارة تعريفية', tr: 'Slogan', ja: 'キャッチコピー', ko: '슬로건', zh: '宣传语', ru: 'Слоган', hi: 'नारा', nl: 'Slogan', pl: 'Hasło', sv: 'Slogan', vi: 'Khẩu hiệu', id: 'Slogan', th: 'สโลแกน', el: 'Σλόγκαν', he: 'סיסמה', cs: 'Slogan', ro: 'Slogan', da: 'Slogan', fi: 'Iskulause', uk: 'Слоган', bn: 'স্লোগান', nb: 'Slagord' };
  const metricLabels: Record<string, { words: string; digits: string; symbols: string; uppercase: string; mixed: string; repeated: string }> = {
    en: { words: 'Words', digits: 'Digits', symbols: 'Symbols', uppercase: 'Uppercase', mixed: 'Mixed scripts', repeated: 'Repeated letters' },
    fr: { words: 'Mots', digits: 'Chiffres', symbols: 'Symboles', uppercase: 'Majuscules', mixed: 'Écritures mixtes', repeated: 'Lettres répétées' },
    es: { words: 'Palabras', digits: 'Dígitos', symbols: 'Símbolos', uppercase: 'Mayúsculas', mixed: 'Escrituras mixtas', repeated: 'Letras repetidas' },
    de: { words: 'Wörter', digits: 'Ziffern', symbols: 'Symbole', uppercase: 'Großbuchstaben', mixed: 'Gemischte Schriften', repeated: 'Wiederholte Buchstaben' },
    it: { words: 'Parole', digits: 'Cifre', symbols: 'Simboli', uppercase: 'Maiuscole', mixed: 'Scritture miste', repeated: 'Lettere ripetute' },
    pt: { words: 'Palavras', digits: 'Dígitos', symbols: 'Símbolos', uppercase: 'Maiúsculas', mixed: 'Escritas mistas', repeated: 'Letras repetidas' },
    ar: { words: 'الكلمات', digits: 'الأرقام', symbols: 'الرموز', uppercase: 'الأحرف الكبيرة', mixed: 'أنظمة كتابة مختلطة', repeated: 'الأحرف المتكررة' },
    tr: { words: 'Kelimeler', digits: 'Rakamlar', symbols: 'Semboller', uppercase: 'Büyük harfler', mixed: 'Karışık alfabeler', repeated: 'Tekrarlanan harfler' },
    ja: { words: '単語', digits: '数字', symbols: '記号', uppercase: '大文字', mixed: '複数の文字体系', repeated: '繰り返し文字' },
    ko: { words: '단어', digits: '숫자', symbols: '기호', uppercase: '대문자', mixed: '혼합 문자 체계', repeated: '반복 문자' },
    zh: { words: '词数', digits: '数字', symbols: '符号', uppercase: '大写字母', mixed: '混合文字系统', repeated: '重复字符' },
    ru: { words: 'Слова', digits: 'Цифры', symbols: 'Символы', uppercase: 'Заглавные', mixed: 'Смешанные письменности', repeated: 'Повторы букв' },
    hi: { words: 'शब्द', digits: 'अंक', symbols: 'प्रतीक', uppercase: 'बड़े अक्षर', mixed: 'मिश्रित लिपियाँ', repeated: 'दोहराए अक्षर' },
    nl: { words: 'Woorden', digits: 'Cijfers', symbols: 'Symbolen', uppercase: 'Hoofdletters', mixed: 'Gemengde schriften', repeated: 'Herhaalde letters' },
    pl: { words: 'Słowa', digits: 'Cyfry', symbols: 'Symbole', uppercase: 'Wielkie litery', mixed: 'Mieszane pisma', repeated: 'Powtórzone litery' },
    sv: { words: 'Ord', digits: 'Siffror', symbols: 'Symboler', uppercase: 'Versaler', mixed: 'Blandade skriftsystem', repeated: 'Upprepade bokstäver' },
    vi: { words: 'Từ', digits: 'Chữ số', symbols: 'Ký hiệu', uppercase: 'Chữ hoa', mixed: 'Hệ chữ hỗn hợp', repeated: 'Ký tự lặp lại' },
    id: { words: 'Kata', digits: 'Angka', symbols: 'Simbol', uppercase: 'Huruf kapital', mixed: 'Aksara campuran', repeated: 'Huruf berulang' },
    th: { words: 'คำ', digits: 'ตัวเลข', symbols: 'สัญลักษณ์', uppercase: 'ตัวพิมพ์ใหญ่', mixed: 'ระบบอักษรผสม', repeated: 'อักษรซ้ำ' },
    el: { words: 'Λέξεις', digits: 'Ψηφία', symbols: 'Σύμβολα', uppercase: 'Κεφαλαία', mixed: 'Μικτά συστήματα γραφής', repeated: 'Επαναλαμβανόμενα γράμματα' },
    he: { words: 'מילים', digits: 'ספרות', symbols: 'סמלים', uppercase: 'אותיות גדולות', mixed: 'מערכות כתב מעורבות', repeated: 'אותיות חוזרות' },
    cs: { words: 'Slova', digits: 'Číslice', symbols: 'Symboly', uppercase: 'Velká písmena', mixed: 'Smíšená písma', repeated: 'Opakovaná písmena' },
    ro: { words: 'Cuvinte', digits: 'Cifre', symbols: 'Simboluri', uppercase: 'Majuscule', mixed: 'Scrieri mixte', repeated: 'Litere repetate' },
    da: { words: 'Ord', digits: 'Tal', symbols: 'Symboler', uppercase: 'Store bogstaver', mixed: 'Blandede skriftsystemer', repeated: 'Gentagne bogstaver' },
    fi: { words: 'Sanat', digits: 'Numerot', symbols: 'Symbolit', uppercase: 'Isot kirjaimet', mixed: 'Sekalaiset kirjoitusjärjestelmät', repeated: 'Toistuvat kirjaimet' },
    uk: { words: 'Слова', digits: 'Цифри', symbols: 'Символи', uppercase: 'Великі літери', mixed: 'Змішані писемності', repeated: 'Повторені літери' },
    bn: { words: 'শব্দ', digits: 'অঙ্ক', symbols: 'প্রতীক', uppercase: 'বড় হাতের অক্ষর', mixed: 'মিশ্র লিপি', repeated: 'পুনরাবৃত্ত অক্ষর' },
    nb: { words: 'Ord', digits: 'Tall', symbols: 'Symboler', uppercase: 'Store bokstaver', mixed: 'Blandede skriftsystemer', repeated: 'Gjentatte bokstaver' }
  };
  const metricCopy = metricLabels[language] ?? metricLabels.en;
  const writingSystemCodes: Record<string, string> = {
    latin: 'Latn',
    arabic: 'Arab',
    cyrillic: 'Cyrl',
    greek: 'Grek',
    hebrew: 'Hebr',
    devanagari: 'Deva',
    han: 'Hani',
    hiragana: 'Hira',
    katakana: 'Kana',
    hangul: 'Hang',
    thai: 'Thai',
    bengali: 'Beng',
    armenian: 'Armn',
    georgian: 'Geor',
    ethiopic: 'Ethi',
    tamil: 'Taml',
    telugu: 'Telu',
    gurmukhi: 'Guru',
    gujarati: 'Gujr',
    kannada: 'Knda',
    malayalam: 'Mlym',
    sinhala: 'Sinh',
    lao: 'Laoo',
    myanmar: 'Mymr',
    khmer: 'Khmr'
  };
  const writingSystemNames = insight.metrics.writingSystems.map((system) => {
    const code = writingSystemCodes[system];
    if (!code) return system;
    try {
      return new Intl.DisplayNames([language], { type: 'script' }).of(code) ?? system;
    } catch {
      return system;
    }
  });
  const writingSystemsHeading: Record<string, string> = {
    en: 'Writing systems detected', fr: 'Systèmes d’écriture détectés',
    es: 'Sistemas de escritura detectados', de: 'Erkannte Schriftsysteme',
    it: 'Sistemi di scrittura rilevati', pt: 'Sistemas de escrita detetados',
    ar: 'أنظمة الكتابة المكتشفة', tr: 'Tespit edilen yazı sistemleri',
    ja: '検出された文字体系', ko: '감지된 문자 체계', zh: '检测到的文字系统',
    ru: 'Обнаруженные системы письма', hi: 'पहचानी गई लिपियाँ',
    nl: 'Gedetecteerde schriftsystemen', pl: 'Wykryte systemy pisma',
    sv: 'Identifierade skriftsystem', vi: 'Hệ chữ được phát hiện',
    id: 'Sistem tulisan yang terdeteksi', th: 'ระบบอักษรที่ตรวจพบ',
    el: 'Συστήματα γραφής που εντοπίστηκαν', he: 'מערכות הכתב שזוהו',
    cs: 'Zjištěné systémy písma', ro: 'Sisteme de scriere detectate',
    da: 'Registrerede skriftsystemer', fi: 'Havaitut kirjoitusjärjestelmät',
    uk: 'Виявлені системи письма', bn: 'শনাক্ত করা লিপি',
    nb: 'Oppdagede skriftsystemer'
  };
  const metricItems = [
    { label: labels.length, value: insight.metrics.characterCount },
    { label: metricCopy.words, value: insight.metrics.wordCount ?? '—' },
    { label: metricCopy.digits, value: insight.metrics.digitCount },
    { label: metricCopy.symbols, value: insight.metrics.symbolCount },
    { label: metricCopy.uppercase, value: insight.metrics.uppercaseCount },
    { label: metricCopy.repeated, value: insight.metrics.repeatedCharacterCount },
    { label: metricCopy.mixed, value: insight.metrics.hasMixedScripts ? '✓' : '—' },
    { label: structureCopy.vowelShare, value: insight.metrics.latinVowelShare === null ? '—' : `${insight.metrics.latinVowelShare}%` }
  ];

  return (
    <div className="name-insight-overlay fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-2 sm:p-4 backdrop-blur-sm" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section data-testid="name-insight-dialog" role="dialog" aria-modal="true" aria-labelledby="name-insight-title" dir={dir}
        className="name-insight-dialog w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-sky-300/30 bg-white text-slate-900 shadow-2xl">
        <header className="name-insight-header sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 p-5 backdrop-blur">
          <div className="min-w-0">
            <div className="name-insight-eyebrow mb-1 flex items-center gap-2 text-sm font-semibold text-sky-700">
              <Sparkles className="h-4 w-4" />
              <span>{labels.header.replace(/[•·]\s*$/, '').trim()} · {meta.shortTitle}</span>
            </div>
            <h2 id="name-insight-title" className="name-insight-title break-words text-2xl font-black">{item.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{meta.shortTitle} · {item.style}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">{labels.length}: {insight.metrics.characterCount} {labels.letters}</p>
          </div>
          <button type="button" onClick={onClose} className="name-insight-close rounded-xl p-2 text-slate-600 hover:bg-slate-100" aria-label={labels.close} data-testid="name-insight-close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="name-insight-content space-y-4 p-5">
          <section className="name-insight-card rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">{labels.whyFits}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{insight.creativeReading}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{insight.contextDescription}</p>
            <p className="mt-3 text-xs leading-5 text-slate-500">{labels.adviceText}</p>
          </section>

          <section className="name-insight-slogan rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-violet-950">{sloganHeading[language] || sloganHeading.en}</h3>
              <button type="button" onClick={() => copyText(insight.slogan)} className="rounded-lg p-2 text-violet-800 hover:bg-violet-100" aria-label={labels.copy}>
                {copied === insight.slogan ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-violet-950">{insight.slogan}</p>
          </section>

          <details open className="name-insight-details group rounded-2xl border border-slate-200 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
              <span>{structureCopy.heading}</span>
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-4">
              {metricItems.map((metric, index) => (
                <div key={index} className="name-insight-metric rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] leading-4 text-slate-500">{metric.label}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{metric.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{structureCopy.vowelNote}</p>
            {insight.metrics.writingSystems.length > 0 && (
              <div className="mt-3 border-t border-slate-200 pt-3" data-testid="name-insight-writing-systems">
                <p className="text-xs font-semibold text-slate-600">{writingSystemsHeading[language] ?? writingSystemsHeading.en}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {writingSystemNames.map((system) => (
                    <li key={system} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">{system}</li>
                  ))}
                </ul>
              </div>
            )}
          </details>

          <details open className="name-insight-details group rounded-2xl border border-slate-200 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
              <span>{labels.tone}</span>
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="name-insight-palette mt-3 flex gap-2">
              {insight.palette.map((color) => (
                <button key={color} type="button" onClick={() => copyText(color)} className="min-w-0 flex-1 text-start" aria-label={`${labels.copy} ${color}`}>
                  <span className="block h-12 rounded-xl border border-black/10" style={{ backgroundColor: color }} />
                  <span className="mt-1 block text-center font-mono text-[11px] text-slate-600">{color}</span>
                </button>
              ))}
            </div>
          </details>

          <details open className="name-insight-details group rounded-2xl border border-slate-200 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
              <span>{labels.variants}</span>
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <ul className="name-insight-variants mt-3 space-y-2">
              {insight.alternatives.map((alternative) => (
                <li key={alternative} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                  <span className="min-w-0 break-words text-sm font-medium">{alternative}</span>
                  <button type="button" onClick={() => copyText(alternative)} className="shrink-0 rounded-lg p-2 text-sky-700 hover:bg-sky-100" aria-label={labels.copy}>
                    {copied === alternative ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </li>
              ))}
            </ul>
          </details>

          <section className="name-insight-card rounded-2xl border border-slate-200 bg-slate-50 p-4" data-testid="name-insight-review-guidance">
            <h3 className="font-bold text-slate-900">{labels.chooseTip}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{REVIEW_GUIDANCE[language] ?? REVIEW_GUIDANCE.en}</p>
          </section>

          <div className="name-insight-transparency rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-950">
            <p>{labels.transparency}</p>
          </div>

          <button type="button" onClick={() => copyText(item.name)} className="name-insight-primary-action flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 font-bold text-white transition hover:bg-sky-700">
            {copied === item.name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied === item.name ? labels.copied : labels.copy}
          </button>
        </div>
      </section>
    </div>
  );
};
