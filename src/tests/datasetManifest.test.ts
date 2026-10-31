import {DATASET_SOURCES,getRuntimeDatasetSources,isDatasetEligibleForRuntime} from '../data/datasetManifest';
declare const process:{exitCode?:number};
const checks:Array<[string,boolean]>=[
['Unique stable source IDs',new Set(DATASET_SOURCES.map(x=>x.id)).size===DATASET_SOURCES.length],
['Every source documents URL, license and obligations',DATASET_SOURCES.every(x=>/^https:\/\//.test(x.sourceUrl)&&!!x.license.trim()&&x.obligations.length>0)],
['Existing banks are not cleared for redistribution',!isDatasetEligibleForRuntime(DATASET_SOURCES[0])],
['External candidates are not runtime-enabled',DATASET_SOURCES.filter(x=>x.status==='candidate-review').every(x=>!x.runtimeEnabled&&!isDatasetEligibleForRuntime(x))],
['Runtime source accessor returns only approved sources',getRuntimeDatasetSources().every(x=>x.status==='approved'&&isDatasetEligibleForRuntime(x))],
['Current editorial banks remain flagged but are not represented as approved sources',DATASET_SOURCES[0].runtimeEnabled && !getRuntimeDatasetSources().some(x=>x.id===DATASET_SOURCES[0].id)]
];
const failed=checks.filter(([,ok])=>!ok); for(const [label,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${label}`);
console.log(`${checks.length-failed.length}/${checks.length} dataset provenance checks passed`); if(failed.length) process.exitCode=1;
