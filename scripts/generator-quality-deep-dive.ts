/**
 * Deep, non-invasive generator instrumentation.
 * Stores every raw output and structural fingerprints; never changes generator code.
 * Run: npm run audit:generators:deep
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { ALL_GENERATORS_LIST } from '../src/data/generators';
import { generateNames } from '../src/services/generatorEngine';
import { getPhraseBank } from '../src/data/phraseBanks';

declare const process: { cwd(): string; exitCode?: number };

const LANGUAGES = ['fr','en','ar','tr','es','de','it','pt','ja','ko','zh','ru','hi','nl','pl','sv','vi','id','th','el','he','cs','ro','da','fi','uk','bn','nb'] as const;
const SEEDS = ['nf-deep-01','nf-deep-02','nf-deep-03'] as const;
const BATCH_SIZE = 12;
const STRATEGIES = ['phonetic_harmony','neologism','portmanteau_blend','symbolic_evocative','punchy_minimal','epic_compound'];
const PHRASE_IDS = new Set(['slogan','book','novel_series','song_title','album_title','blog_name','newsletter','podcast','tactical_operation','restaurant','coffee_shop','tavern','band_name','videogame','youtube','shop','guild','bakery','hotel_name']);

type RawOutput = { name: string; normalized: string; codePoints: number; scriptProfile: string[]; prefix2: string; suffix2: string; prefix3: string; suffix3: string };
function norm(s: string): string { return s.normalize('NFKC').toLocaleLowerCase().replace(/[\p{P}\p{S}\s]+/gu,' ').trim().replace(/\s+/g,' '); }
function points(s: string): string[] { return Array.from(s.normalize('NFC')); }
function scripts(s: string): string[] {
  const tests: Array<[string,RegExp]> = [
    ['Latin',/\p{Script=Latin}/u],['Arabic',/\p{Script=Arabic}/u],['Hebrew',/\p{Script=Hebrew}/u],
    ['Cyrillic',/\p{Script=Cyrillic}/u],['Greek',/\p{Script=Greek}/u],['Devanagari',/\p{Script=Devanagari}/u],
    ['Bengali',/\p{Script=Bengali}/u],['Thai',/\p{Script=Thai}/u],['Hangul',/\p{Script=Hangul}/u],
    ['Han',/\p{Script=Han}/u],['Hiragana',/\p{Script=Hiragana}/u],['Katakana',/\p{Script=Katakana}/u],
    ['Other',/[\p{L}&&[^\p{Script=Latin}]]/v],
  ];
  const found = new Set<string>();
  for (const ch of points(s)) for (const [label,re] of tests.slice(0,12)) if (re.test(ch)) found.add(label);
  return [...found].sort();
}
function grams(values: string[], size: number, fromStart: boolean) {
  const counts = new Map<string,number>();
  for (const value of values) {
    const p = points(value.replace(/\s+/g,''));
    if (p.length < size) continue;
    const key = (fromStart ? p.slice(0,size) : p.slice(-size)).join('');
    counts.set(key,(counts.get(key)||0)+1);
  }
  return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,20).map(([value,count])=>({value,count,share:Number((count/Math.max(1,values.length)).toFixed(4))}));
}
function sharedAffixes(values: string[]) {
  const pfx = new Map<string,number>(), sfx = new Map<string,number>();
  for (const name of values) {
    const p=points(norm(name).replace(/\s/g,''));
    for(let n=2;n<=Math.min(6,p.length-1);n++){
      const a=p.slice(0,n).join(''), b=p.slice(-n).join('');
      pfx.set(a,(pfx.get(a)||0)+1); sfx.set(b,(sfx.get(b)||0)+1);
    }
  }
  const min=Math.max(3,Math.ceil(values.length*0.12));
  const sort=(m:Map<string,number>)=>[...m.entries()].filter(([,c])=>c>=min).sort((a,b)=>b[1]-a[1]).slice(0,30).map(([value,count])=>({value,count,share:Number((count/Math.max(1,values.length)).toFixed(4))}));
  return {sharedPrefixes:sort(pfx),sharedSuffixes:sort(sfx)};
}
async function main(){
  const memory=new Map<string,string>();
  const storage={getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>{memory.set(k,v)},removeItem:(k:string)=>memory.delete(k),clear:()=>memory.clear()};
  (globalThis as any).localStorage=storage;
  (globalThis as any).window={localStorage:storage,dispatchEvent:()=>true,addEventListener:()=>{},removeEventListener:()=>{}};
  (globalThis as any).CustomEvent=class{type:string;constructor(type:string){this.type=type;}};

  const scenarios:any[]=[];
  const allRaw:any[]=[];
  for(const generator of [...ALL_GENERATORS_LIST]){
    for(const language of LANGUAGES){
      const names:string[]=[];
      const raw:any[]=[];
      const bankSize=language==='auto'?0:getPhraseBank(generator.id,language).length;
      const pipeline=generator.id==='baby_name'?'attested_names':(bankSize>0?'curated_phrase_bank':'procedural');
      for(const seed of SEEDS){
        storage.clear();
        const batch=generateNames({generatorId:generator.id,genLanguage:language,quantity:BATCH_SIZE,seed:`${seed}:${generator.id}:${language}`});
        for(let i=0;i<batch.length;i++){
          const name=String(batch[i]?.name??'').trim();
          if(!name) continue;
          names.push(name);
          const cp=points(name);
          raw.push({seed,ordinal:i+1,name,normalized:norm(name),codePoints:cp.length,scriptProfile:scripts(name),prefix2:cp.slice(0,2).join(''),suffix2:cp.slice(-2).join(''),prefix3:cp.slice(0,3).join(''),suffix3:cp.slice(-3).join('')});
        }
      }
      const normalized=names.map(norm), unique=new Set(normalized);
      const affixes=sharedAffixes(names);
      const scenario={
        generatorId:generator.id,category:(generator as any).category||'unknown',language,pipeline,
        strategyProfile:pipeline==='procedural'?'six_strategy_cycle_with_runtime_skips':pipeline==='attested_names'?'curated_attested_pool':'curated_phrase_bank',
        candidateStrategies:pipeline==='procedural'?STRATEGIES:[],
        phraseBankSize:bankSize,generated:names.length,uniqueNames:unique.size,
        duplicateRate:Number((1-unique.size/Math.max(1,names.length)).toFixed(4)),
        scriptProfiles:[...new Set(raw.flatMap(x=>x.scriptProfile))].sort(),
        topPrefixes2:grams(names,2,true),topSuffixes2:grams(names,2,false),
        topPrefixes3:grams(names,3,true),topSuffixes3:grams(names,3,false),
        ...affixes,
        outputs:raw,
      };
      scenarios.push(scenario);
      allRaw.push({generatorId:generator.id,category:scenario.category,language,pipeline,phraseBankSize:bankSize,outputs:raw});
    }
  }
  const outputDir=`${process.cwd()}/artifacts/generator-quality-audit`;
  await mkdir(outputDir,{recursive:true});
  const detailed={schemaVersion:1,generatedAt:new Date().toISOString(),generatorCount:ALL_GENERATORS_LIST.length,languageCount:LANGUAGES.length,scenarioCount:scenarios.length,seedCount:SEEDS.length,batchSize:BATCH_SIZE,totalOutputs:allRaw.reduce((n,x)=>n+x.outputs.length,0),methodology:{
    rawOutputs:'Every non-empty generated name is retained with generator, category, language, seed, and ordinal.',
    strategyAttribution:'The current public API does not expose per-output strategy selection. Procedural records therefore report the six-strategy cycle as eligible, not falsely claim a specific strategy per output.',
    roots:'Prefix/suffix and shared-affix fingerprints are structural proxies, not linguistic morpheme or etymological root analysis.',
    scripts:'Unicode Script property profiles; mixed scripts are observable but not automatically invalid (e.g. Japanese may legitimately combine Han, Hiragana and Katakana).',
    phraseBanks:'Actual getPhraseBank size is recorded per generator-language pair; phrase-bank repetition is evaluated separately from procedural output.',
    limitations:['No engine behavior or generation algorithm was changed.','Naturalness, semantics, transliteration and morphology require native-speaker review or validated language datasets.']
  },scenarios};
  await writeFile(`${outputDir}/deep-dive.json`,JSON.stringify(detailed,null,2),'utf8');
  const summary=[
    '# NameForge — Deep instrumentation (raw outputs)',
    `- Generators: ${ALL_GENERATORS_LIST.length}`,
    `- Languages: ${LANGUAGES.length}`,
    `- Scenarios: ${scenarios.length}`,
    `- Raw outputs: ${detailed.totalOutputs}`,
    '',
    '## Pipeline coverage',
    ...['procedural','curated_phrase_bank','attested_names'].map(p=>`- ${p}: ${scenarios.filter(s=>s.pipeline===p).length} scenarios`),
    '',
    '## Largest phrase banks (scenario count × language)',
    ...scenarios.filter(s=>s.pipeline==='curated_phrase_bank').sort((a,b)=>b.phraseBankSize-a.phraseBankSize).slice(0,20).map(s=>`- ${s.generatorId}/${s.language}: ${s.phraseBankSize} entries; ${(s.duplicateRate*100).toFixed(1)}% observed duplicates`),
    '',
    '> Structural prefixes/suffixes are candidates for review, not validated linguistic roots. Strategy attribution is limited to the actual public API.'
  ];
  await writeFile(`${outputDir}/deep-dive.md`,summary.join('\n'),'utf8');
  console.log(JSON.stringify({generatorCount:ALL_GENERATORS_LIST.length,languageCount:LANGUAGES.length,scenarioCount:scenarios.length,totalOutputs:detailed.totalOutputs,files:['artifacts/generator-quality-audit/deep-dive.json','artifacts/generator-quality-audit/deep-dive.md']},null,2));
  if(ALL_GENERATORS_LIST.length!==234||scenarios.length!==234*28) process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
