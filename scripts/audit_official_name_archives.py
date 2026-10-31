#!/usr/bin/env python3
import argparse,csv,hashlib,io,json,re,unicodedata,zipfile
from pathlib import Path
from collections import Counter,defaultdict
INSEE='https://www.insee.fr/fr/statistiques/fichier/8595130/prenoms-2025-nat_csv.zip'
SSA='https://www.ssa.gov/oact/babynames/names.zip'
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1048576),b''): h.update(b)
 return h.hexdigest()
def dec(b):
 for e in ('utf-8-sig','utf-8','cp1252','latin-1'):
  try:return b.decode(e)
  except UnicodeDecodeError:pass
 raise ValueError('encoding')
def key(s):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
def fold(s):return ''.join(c for c in unicodedata.normalize('NFKD',s.casefold()) if not unicodedata.combining(c))
def num(s):
 try:return int(str(s).strip().replace(' ',''))
 except:return None
def dictrows(b):
 t=dec(b)
 try:d=csv.Sniffer().sniff(t[:8192],delimiters=';,|'+chr(9))
 except csv.Error:d=csv.excel
 r=csv.DictReader(io.StringIO(t),dialect=d)
 return r.fieldnames or [],list(r)
def find(h,opts):
 m={key(x):x for x in h}
 return next((m[x] for x in opts if x in m),None)
def item(name,src,row,year,sex,count,checksum):
 fr=src=='insee-prenoms-2025'
 return {'id':src+':'+row,'sourceId':src,'sourceRecordId':row,'displayName':name,'recordKind':'civil-registration-name' if fr else 'ssa-card-application-name','languageContext':'fr-FR' if fr else 'en-US','script':'Latn','observation':{'year':year,'sourceSex':'male' if sex in ('1','M') else 'female','count':count},'sourceUrl':INSEE if fr else SSA,'release':'INSEE July 2026 / births 1900-2025' if fr else 'SSA national archive May 2026 / 1880-2025','sourceFileSha256':checksum,'attribution':'Insee, Fichier des prénoms; Licence Ouverte 2.0' if fr else 'U.S. Social Security Administration, Baby Names from Social Security Card Applications','nativeScriptAttested':True}
def parse_insee(p):
 ch=sha(p);out=[];bad=Counter();members=[]
 with zipfile.ZipFile(p) as z:
  for fn in z.namelist():
   if not fn.lower().endswith(('.csv','.txt')) or fn.endswith('/'):continue
   h,rs=dictrows(z.read(fn)); sc=find(h,['sexe']);nc=find(h,['preusuel','prenom']);yc=find(h,['annais','annee','year','periode']);cc=find(h,['nombre','effectif','count','valeur'])
   if not all((sc,nc,yc,cc)):bad['unexpected_file_columns']+=1;continue
   members.append(fn)
   for ln,r in enumerate(rs,2):
    n=(r.get(nc) or '').strip();s=(r.get(sc) or '').strip();y=num(r.get(yc));c=num(r.get(cc))
    if not n:bad['empty_name']+=1;continue
    if n.startswith('_'):bad['aggregate_or_suppressed_label']+=1;continue
    if s not in ('1','2'):bad['invalid_sex']+=1;continue
    if y is None or not 1900<=y<=2025:bad['non_year_or_out_of_range']+=1;continue
    if c is None or c<0 or c%5:bad['invalid_count_or_rounding']+=1;continue
    out.append(item(n,'insee-prenoms-2025',fn+':'+str(ln),y,s,c,ch))
 return out,bad,members,ch
def parse_ssa(p):
 ch=sha(p);out=[];bad=Counter();members=[]
 with zipfile.ZipFile(p) as z:
  for fn in z.namelist():
   m=re.search(r'yob(\d{4})\.txt$',fn.lower())
   if not m:continue
   y=int(m.group(1));members.append(fn)
   for ln,r in enumerate(csv.reader(io.StringIO(dec(z.read(fn)))),1):
    if len(r)!=3:bad['wrong_column_count']+=1;continue
    n,s,craw=(v.strip() for v in r);c=num(craw)
    if not n:bad['empty_name']+=1;continue
    if s not in ('M','F'):bad['invalid_sex']+=1;continue
    if c is None or c<5:bad['below_privacy_threshold_or_invalid_count']+=1;continue
    out.append(item(n,'ssa-baby-names-national',fn+':'+str(ln),y,s,c,ch))
 return out,bad,members,ch
def main():
 a=argparse.ArgumentParser();a.add_argument('--insee',type=Path,required=True);a.add_argument('--ssa',type=Path,required=True);a.add_argument('--out',type=Path,required=True);x=a.parse_args();x.out.mkdir(parents=True,exist_ok=True)
 for p in (x.insee,x.ssa):
  if not zipfile.is_zipfile(p):raise SystemExit('Invalid ZIP: '+str(p))
 ir,ib,im,ih=parse_insee(x.insee);sr,sb,sm,sh=parse_ssa(x.ssa)
 if not ir or not sr:raise SystemExit('At least one official archive yielded zero records; inspect its format.')
 allr=ir+sr;groups=defaultdict(list);forms=defaultdict(set)
 for r in allr:groups[r['sourceId']].append(r);forms[r['displayName'].casefold()].add(r['sourceId'])
 stats={}
 for src,rs in groups.items():
  exact=Counter((r['displayName'].casefold(),r['observation']['year'],r['observation']['sourceSex']) for r in rs);variants=defaultdict(set)
  for r in rs:variants[(fold(r['displayName']),r['observation']['year'],r['observation']['sourceSex'])].add(r['displayName'])
  stats[src]={'records':len(rs),'distinct_spellings':len({r['displayName'] for r in rs}),'duplicate_observation_rows':sum(n-1 for n in exact.values() if n>1),'accent_unicode_variant_groups':sum(len(v)>1 for v in variants.values()),'years':[min(r['observation']['year'] for r in rs),max(r['observation']['year'] for r in rs)]}
 with (x.out/'staging-corpus.jsonl').open('w',encoding='utf-8') as f:
  for r in allr:f.write(json.dumps(r,ensure_ascii=False)+'\n')
 report={'status':'PREPRODUCTION_ONLY_NOT_FOR_RUNTIME','runtimeImport':False,'archives':{'insee':{'sha256':ih,'members':im},'ssa':{'sha256':sh,'members':sm}},'records':{'insee':len(ir),'ssa':len(sr),'total':len(allr)},'stats':stats,'exact_name_overlap_across_sources':sum(len(v)>1 for v in forms.values()),'rejected':{'insee':dict(ib),'ssa':dict(sb)},'limitations':['INSEE is French civil-registration context, not etymology.','SSA is US card-application context, not English etymology or complete birth coverage.','Original spellings are preserved; duplicate rows are reported, not silently removed.','Automated audit is not legal or human linguistic approval.']}
 (x.out/'corpus-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 lines=['# Official corpus preproduction audit','','**PREPRODUCTION ONLY — NOT FOR RUNTIME.**','','| Source | Rows | Distinct spellings | Duplicate rows | Accent/Unicode variant groups | Years |','|---|---:|---:|---:|---:|---|']
 for src,v in stats.items():lines.append('| '+src+' | '+str(v['records'])+' | '+str(v['distinct_spellings'])+' | '+str(v['duplicate_observation_rows'])+' | '+str(v['accent_unicode_variant_groups'])+' | '+str(v['years'][0])+'–'+str(v['years'][1])+' |')
 lines+=['','Exact cross-source name-form overlap: '+str(report['exact_name_overlap_across_sources']),'','Rejected rows: '+json.dumps(report['rejected'],ensure_ascii=False),'','No record from this artifact is runtime-approved.']
 (x.out/'report.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
 print(json.dumps({'status':report['status'],'records':report['records'],'stats':stats},ensure_ascii=False))
if __name__=='__main__':main()