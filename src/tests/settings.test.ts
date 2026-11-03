import assert from 'node:assert/strict';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const memory = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: memory });
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: {
    localStorage: memory,
    dispatchEvent: () => true,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  },
});

const { resetAllLocalData } = await import('../services/settings');

const personalKeys = [
  'nameforge_saved_names',
  'nameforge_collections',
  'nameforge_generation_history',
  'nameforge_recent_names',
  'nameforge.unified-designs.v1',
  'nameforge.text-art.favorites.v1',
];

for (const key of personalKeys) memory.setItem(key, 'test-data');
memory.setItem('nameforge_settings', JSON.stringify({
  language: 'fr',
  theme: 'light',
  textSize: 'large',
  reduceMotion: true,
  defaultGenLanguage: 'fr',
}));
memory.setItem('unrelated-app-data', 'must-remain');

resetAllLocalData();

for (const key of personalKeys) {
  assert.equal(memory.getItem(key), null, key + ' should be cleared by reset');
}
assert.ok(memory.getItem('nameforge_settings'), 'reset must preserve user preferences');
assert.equal(memory.getItem('unrelated-app-data'), 'must-remain', 'reset must not touch unrelated storage');

console.log('Settings reset checks passed: all NameForge personal workspaces are cleared and preferences are preserved.');
