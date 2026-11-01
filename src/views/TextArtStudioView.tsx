import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Download, Heart, Search, Shapes, Star } from 'lucide-react';
import { getAppSettings, subscribeToSettings } from '../services/settings';
import {
  filterTextArtItems, generateTextArtCss, readTextArtFavorites, saveTextArtFavorites,
  TEXT_ART_ITEMS, TextArtStyle, SymbolCategory,
} from '../services/textArtStudio';

const COPY = {
  en: { title:'Symbols & Text Art', subtitle:'Find expressive symbols, kaomojis and create styled text banners.', search:'Search symbols and kaomojis…', all:'All', favorites:'Favorites', add:'Add to favorites', remove:'Remove favorite', preview:'Live HTML preview', text:'Your text', font:'Font family', size:'Font size', weight:'Weight', color:'Text color', spacing:'Letter spacing', align:'Alignment', left:'Left', center:'Center', right:'Right', css:'Export CSS', copyCss:'Copy CSS', downloadCss:'Download CSS', banner:'Banner creator', background:'Background', width:'Width', height:'Height', png:'Export PNG', copied:'Copied to clipboard', noResults:'No symbols match your search.', favoriteSaved:'Favorites saved on this device.', favoriteError:'This browser could not save favorites.', bannerHint:'Your banner text', categories:{stars:'Stars',arrows:'Arrows',hearts:'Hearts',decorative:'Decorative',nature:'Nature',kaomoji:'Kaomoji'} },
  fr: { title:'Symboles & Text Art', subtitle:'Explorez les symboles et kaomojis, puis créez des textes et bannières personnalisés.', search:'Rechercher des symboles et kaomojis…', all:'Tout', favorites:'Favoris', add:'Ajouter aux favoris', remove:'Retirer des favoris', preview:'Aperçu HTML en direct', text:'Votre texte', font:'Police', size:'Taille', weight:'Graisse', color:'Couleur du texte', spacing:'Espacement', align:'Alignement', left:'Gauche', center:'Centre', right:'Droite', css:'Exporter le CSS', copyCss:'Copier le CSS', downloadCss:'Télécharger le CSS', banner:'Créateur de bannière', background:'Arrière-plan', width:'Largeur', height:'Hauteur', png:'Exporter en PNG', copied:'Copié dans le presse-papiers', noResults:'Aucun symbole ne correspond à la recherche.', favoriteSaved:'Favoris enregistrés sur cet appareil.', favoriteError:'Impossible d’enregistrer les favoris dans ce navigateur.', bannerHint:'Texte de votre bannière', categories:{stars:'Étoiles',arrows:'Flèches',hearts:'Cœurs',decorative:'Décoratifs',nature:'Nature',kaomoji:'Kaomojis'} },
  ar: { title:'الرموز وفن النصوص', subtitle:'اكتشف الرموز والكاوموجي وأنشئ نصوصًا ولافتات مخصصة.', search:'ابحث عن الرموز والكاوموجي…', all:'الكل', favorites:'المفضلة', add:'أضف إلى المفضلة', remove:'إزالة من المفضلة', preview:'معاينة HTML مباشرة', text:'النص', font:'الخط', size:'الحجم', weight:'السماكة', color:'لون النص', spacing:'تباعد الحروف', align:'المحاذاة', left:'يسار', center:'وسط', right:'يمين', css:'تصدير CSS', copyCss:'نسخ CSS', downloadCss:'تنزيل CSS', banner:'منشئ اللافتات', background:'الخلفية', width:'العرض', height:'الارتفاع', png:'تصدير PNG', copied:'تم النسخ', noResults:'لا توجد رموز مطابقة.', favoriteSaved:'تم حفظ المفضلة على هذا الجهاز.', favoriteError:'تعذر حفظ المفضلة في المتصفح.', bannerHint:'نص اللافتة', categories:{stars:'نجوم',arrows:'أسهم',hearts:'قلوب',decorative:'زخارف',nature:'طبيعة',kaomoji:'كاوموجي'} },
};
type Locale = keyof typeof COPY;
const DEFAULT_STYLE: TextArtStyle = { fontFamily:'Arial', fontSize:48, fontWeight:700, color:'#ffffff', letterSpacing:1, textAlign:'center', lineHeight:1.3 };
const CATEGORY_KEYS: SymbolCategory[] = ['stars','arrows','hearts','decorative','nature','kaomoji'];

async function copyValue(value: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(value); return true; }
  catch {
    const area=document.createElement('textarea'); area.value=value; area.style.position='fixed'; area.style.opacity='0'; document.body.appendChild(area); area.select();
    try { return document.execCommand('copy'); } catch { return false; } finally { area.remove(); }
  }
}
function downloadFile(content: string, filename: string, type: string) {
  const url=URL.createObjectURL(new Blob([content],{type})); const anchor=document.createElement('a'); anchor.href=url; anchor.download=filename; anchor.click(); URL.revokeObjectURL(url);
}

export const TextArtStudioView: React.FC = () => {
  const [language,setLanguage]=useState(getAppSettings().language);
  useEffect(()=>subscribeToSettings(settings=>setLanguage(settings.language)),[]);
  const locale: Locale = language in COPY ? language as Locale : 'en'; const t=COPY[locale];
  const [query,setQuery]=useState(''); const [category,setCategory]=useState<SymbolCategory|'all'>('all');
  const [favorites,setFavorites]=useState<string[]>(()=>readTextArtFavorites()); const [favoritesOnly,setFavoritesOnly]=useState(false);
  const [textValue,setTextValue]=useState('✦ Create something beautiful ✦'); const [bannerText,setBannerText]=useState('YOUR TEXT ART');
  const [style,setStyle]=useState<TextArtStyle>(DEFAULT_STYLE); const [background,setBackground]=useState('#17152f');
  const [width,setWidth]=useState(1200); const [height,setHeight]=useState(400); const [status,setStatus]=useState('');
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const items=useMemo(()=>filterTextArtItems(TEXT_ART_ITEMS,query,category,favorites,favoritesOnly),[query,category,favorites,favoritesOnly]);
  const css=useMemo(()=>generateTextArtCss(style),[style]);
  const toggleFavorite=(id:string)=>{const next=favorites.includes(id)?favorites.filter(value=>value!==id):[...favorites,id];setFavorites(next);setStatus(saveTextArtFavorites(next)?t.favoriteSaved:t.favoriteError);};
  const insertSymbol=(value:string)=>setTextValue(current=>current ? current+' '+value : value);
  const exportPng=()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    const context=canvas.getContext('2d'); if(!context)return;
    const w=Math.max(320,Math.min(2400,width)); const h=Math.max(160,Math.min(1200,height));
    canvas.width=w; canvas.height=h; context.fillStyle=background; context.fillRect(0,0,w,h);
    context.fillStyle=style.color; context.font=`${style.fontWeight} ${Math.min(style.fontSize, h*0.45)}px "${style.fontFamily.replace(/["\\\\]/g,'')}", sans-serif`;
    context.textAlign=style.textAlign; context.textBaseline='middle';
    const lines=bannerText.split(/\\r?\\n/).slice(0,Math.max(1,Math.floor(h/Math.max(24,style.fontSize*1.35))));
    const x=style.textAlign==='left'?w*0.08:style.textAlign==='right'?w*0.92:w/2;
    lines.forEach((line,index)=>context.fillText(line,x,h/2+(index-(lines.length-1)/2)*style.fontSize*1.35,w*0.84));
    const anchor=document.createElement('a');anchor.download='nameforge-text-art.png';anchor.href=canvas.toDataURL('image/png');anchor.click();
  };
  return <section className="min-h-[75vh] px-4 py-12 sm:px-8" dir={locale==='ar'?'rtl':'ltr'}>
    <div className="mx-auto max-w-7xl">
      <header className="mb-9 text-center"><span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-xs font-bold tracking-wider text-fuchsia-200"><Shapes className="h-4 w-4"/> NAMEFORGE TOOLKIT</span><h1 className="mt-5 text-4xl font-black text-white sm:text-5xl">{t.title}</h1><p className="mx-auto mt-3 max-w-2xl text-slate-400">{t.subtitle}</p></header>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
        <section className="rounded-3xl border border-white/10 bg-[#101426] p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute start-3 top-3.5 h-4 w-4 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search} className="w-full rounded-xl border border-white/10 bg-[#080d1c] py-3 ps-10 pe-3 text-white"/></label><button type="button" onClick={()=>setFavoritesOnly(value=>!value)} aria-pressed={favoritesOnly} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${favoritesOnly?'border-pink-400 bg-pink-500/15 text-pink-200':'border-white/10 text-slate-300'}`}><Heart className="me-2 inline h-4 w-4"/>{t.favorites} ({favorites.length})</button></div>
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={()=>setCategory('all')} className={`rounded-full px-3 py-1.5 text-xs ${category==='all'?'bg-purple-500 text-white':'bg-white/5 text-slate-300'}`}>{t.all}</button>{CATEGORY_KEYS.map(key=><button key={key} type="button" onClick={()=>setCategory(key)} className={`rounded-full px-3 py-1.5 text-xs ${category===key?'bg-purple-500 text-white':'bg-white/5 text-slate-300'}`}>{t.categories[key]}</button>)}</div>
          <p className="mt-5 text-xs text-slate-400">{items.length} / {TEXT_ART_ITEMS.length}</p>
          {items.length===0?<p className="py-10 text-center text-sm text-slate-400">{t.noResults}</p>:<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{items.map(item=><div key={item.id} className="group relative rounded-xl border border-white/10 bg-[#0b1020] p-3 text-center"><button type="button" onClick={()=>insertSymbol(item.value)} title={item.label} className="block min-h-16 w-full break-words text-2xl text-white hover:text-fuchsia-200">{item.value}</button><span className="block truncate text-[11px] text-slate-400">{item.label}</span><button type="button" onClick={()=>toggleFavorite(item.id)} aria-label={favorites.includes(item.id)?t.remove:t.add} className="absolute end-2 top-2 rounded-lg p-1 text-pink-300 hover:bg-pink-500/10">{favorites.includes(item.id)?<Heart className="h-3.5 w-3.5 fill-current"/>:<Star className="h-3.5 w-3.5"/>}</button></div>)}</div>}
        </section>
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-[#101426] p-5 sm:p-7"><h2 className="text-lg font-bold text-white">{t.preview}</h2><label className="mt-4 block text-sm text-slate-300">{t.text}<textarea value={textValue} onChange={e=>setTextValue(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] p-3 text-white"/></label><div className="mt-4 min-h-32 overflow-auto rounded-2xl border border-white/10 bg-[#080d1c] p-5" aria-label={t.preview}><div className="whitespace-pre-wrap break-words" style={{fontFamily:style.fontFamily,fontSize:`min(${style.fontSize}px, 8vw)`,fontWeight:style.fontWeight,color:style.color,letterSpacing:`${style.letterSpacing}px`,lineHeight:style.lineHeight,textAlign:style.textAlign}}>{textValue}</div></div>
            <div className="mt-5 grid grid-cols-2 gap-3"><label className="text-xs text-slate-300">{t.font}<select value={style.fontFamily} onChange={e=>setStyle(s=>({...s,fontFamily:e.target.value}))} className="mt-1 w-full rounded-lg bg-[#080d1c] p-2"><option>Arial</option><option>Georgia</option><option>Verdana</option><option>Trebuchet MS</option><option>Courier New</option><option>Impact</option></select></label><label className="text-xs text-slate-300">{t.size}<input type="range" min="12" max="120" value={style.fontSize} onChange={e=>setStyle(s=>({...s,fontSize:Number(e.target.value)}))} className="mt-3 w-full"/></label><label className="text-xs text-slate-300">{t.weight}<select value={style.fontWeight} onChange={e=>setStyle(s=>({...s,fontWeight:Number(e.target.value)}))} className="mt-1 w-full rounded-lg bg-[#080d1c] p-2"><option value="400">400</option><option value="500">500</option><option value="700">700</option><option value="900">900</option></select></label><label className="text-xs text-slate-300">{t.color}<input type="color" value={style.color} onChange={e=>setStyle(s=>({...s,color:e.target.value}))} className="mt-1 h-10 w-full rounded-lg bg-transparent"/></label><label className="text-xs text-slate-300">{t.spacing}<input type="range" min="-2" max="12" value={style.letterSpacing} onChange={e=>setStyle(s=>({...s,letterSpacing:Number(e.target.value)}))} className="mt-3 w-full"/></label><label className="text-xs text-slate-300">{t.align}<select value={style.textAlign} onChange={e=>setStyle(s=>({...s,textAlign:e.target.value as TextArtStyle['textAlign']}))} className="mt-1 w-full rounded-lg bg-[#080d1c] p-2"><option value="left">{t.left}</option><option value="center">{t.center}</option><option value="right">{t.right}</option></select></label></div>
            <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={()=>void copyValue(css).then(ok=>setStatus(ok?t.copied:'Copy failed'))} className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white"><Copy className="me-2 inline h-4 w-4"/>{t.copyCss}</button><button type="button" onClick={()=>downloadFile(css,'nameforge-text-art.css','text/css')} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200"><Download className="me-2 inline h-4 w-4"/>{t.downloadCss}</button></div><pre className="mt-3 max-h-36 overflow-auto rounded-xl bg-[#080d1c] p-3 text-xs text-cyan-200">{css}</pre>
          </section>
          <section className="rounded-3xl border border-white/10 bg-[#101426] p-5 sm:p-7"><h2 className="text-lg font-bold text-white">{t.banner}</h2><label className="mt-4 block text-sm text-slate-300">{t.text}<textarea value={bannerText} onChange={e=>setBannerText(e.target.value)} placeholder={t.bannerHint} rows={2} className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d1c] p-3 text-white"/></label><div className="mt-3 grid grid-cols-2 gap-3"><label className="text-xs text-slate-300">{t.background}<input type="color" value={background} onChange={e=>setBackground(e.target.value)} className="mt-1 h-10 w-full"/></label><label className="text-xs text-slate-300">{t.width}<input type="number" min="320" max="2400" value={width} onChange={e=>setWidth(Number(e.target.value))} className="mt-1 w-full rounded-lg bg-[#080d1c] p-2"/></label><label className="text-xs text-slate-300">{t.height}<input type="number" min="160" max="1200" value={height} onChange={e=>setHeight(Number(e.target.value))} className="mt-1 w-full rounded-lg bg-[#080d1c] p-2"/></label></div><div className="mt-4 overflow-hidden rounded-xl border border-white/10"><div className="flex min-h-28 items-center justify-center whitespace-pre-wrap break-words p-4" style={{backgroundColor:background,color:style.color,fontFamily:style.fontFamily,fontWeight:style.fontWeight,fontSize:`min(${style.fontSize}px, 8vw)`,letterSpacing:`${style.letterSpacing}px`,textAlign:style.textAlign}}>{bannerText}</div></div><button type="button" onClick={exportPng} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-3 font-bold text-white"><Download className="h-4 w-4"/>{t.png} (PNG)</button><canvas ref={canvasRef} className="hidden" aria-hidden="true"/></section>
          {status&&<p role="status" aria-live="polite" className="text-xs text-emerald-300">{status}</p>}
        </div>
      </div>
    </div>
  </section>;
};
