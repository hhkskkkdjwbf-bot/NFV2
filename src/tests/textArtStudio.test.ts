import assert from 'node:assert/strict';
import { filterTextArtItems, generateTextArtCss, readTextArtFavorites, saveTextArtFavorites, TEXT_ART_ITEMS, SYMBOL_FAVORITES_KEY } from '../services/textArtStudio';

const filtered = filterTextArtItems(TEXT_ART_ITEMS, 'heart');
assert.ok(filtered.some(item => item.id === 'heart'));
assert.ok(filterTextArtItems(TEXT_ART_ITEMS, 'etoile').length === 0);
assert.ok(filterTextArtItems(TEXT_ART_ITEMS, '', 'kaomoji').every(item => item.category === 'kaomoji'));
assert.ok(filterTextArtItems(TEXT_ART_ITEMS, '', 'all', ['shrug'], true).some(item => item.id === 'shrug'));
assert.equal(filterTextArtItems(TEXT_ART_ITEMS, '', 'all', [], true).length, 0);
const memory = new Map<string,string>();
const storage = { getItem:(key:string)=>memory.get(key) ?? null, setItem:(key:string,value:string)=>{memory.set(key,value);} };
assert.equal(saveTextArtFavorites(['heart','heart','shrug'],storage),true);
assert.deepEqual(readTextArtFavorites(storage),['heart','shrug']);
assert.equal(memory.has(SYMBOL_FAVORITES_KEY),true);
assert.ok(generateTextArtCss({fontFamily:'Arial";color:red',fontSize:48,fontWeight:700,color:'#abc',letterSpacing:2,textAlign:'center',lineHeight:1.3}).includes('font-size: 48px'));
assert.ok(!generateTextArtCss({fontFamily:'Arial',fontSize:999,fontWeight:700,color:'red',letterSpacing:99,textAlign:'center',lineHeight:9}).includes('font-size: 999px'));
assert.ok(TEXT_ART_ITEMS.length >= 150);
assert.equal(new Set(TEXT_ART_ITEMS.map(item => item.id)).size, TEXT_ART_ITEMS.length, 'symbol IDs must be unique');
for (const category of ['emoji','gaming','music','weather','food','travel'] as const) {
  assert.ok(filterTextArtItems(TEXT_ART_ITEMS, '', category).length >= 10, category + ' category should have a useful collection');
}
assert.ok(filterTextArtItems(TEXT_ART_ITEMS, 'rocket').some(item => item.id === 'rocket'));
assert.ok(filterTextArtItems(TEXT_ART_ITEMS, 'pizza', 'food').some(item => item.value === '🍕'));
assert.ok(filterTextArtItems(TEXT_ART_ITEMS, 'game', 'gaming').length > 0);
console.log('Phase 5 Text Art tests passed');
