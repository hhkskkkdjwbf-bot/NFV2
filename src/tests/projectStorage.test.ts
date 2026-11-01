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
    dispatchEvent: () => true,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  },
});

const storage = await import('../services/storage');

storage.clearAllSavedNames();
storage.createCollection('Research');
storage.toggleSaveName('Aster Vale', 'fantasy', 'classic');
storage.addGenerationHistory([{
  name: 'Aster Vale',
  generatorId: 'fantasy',
  style: 'classic',
  tone: 'calm',
  description: 'A test entry',
  bestFor: 'A novel',
}]);

const project = storage.createSavedProject('Novel project', 'Snapshot for regression tests');
assert.ok(project, 'creating a named project should persist a snapshot');
assert.equal(project?.names.length, 1, 'project snapshot should include saved names');
assert.equal(project?.collections.length, 1, 'project snapshot should include collections');
assert.equal(project?.history.length, 1, 'project snapshot should include history');

storage.toggleSaveName('Nova Quill', 'fantasy', 'modern');
const restored = storage.restoreSavedProject(project!.id);
assert.equal(restored.success, true, 'restoring a project should import its snapshot');
const restoredNames = storage.getSavedNames().map((entry) => entry.name);
assert.ok(restoredNames.includes('Aster Vale'), 'restored snapshot data should be present');
assert.ok(restoredNames.includes('Nova Quill'), 'restoration should preserve current workspace data');

const exported = JSON.parse(storage.exportDataJSON());
assert.equal(exported.version, 3, 'new exports should use schema version 3');
assert.equal(exported.projects.length, 1, 'version 3 exports should include saved projects');

const before = storage.getSavedNames().length;
const unsupported = storage.importDataJSON(JSON.stringify({ version: 999, names: [] }));
assert.equal(unsupported.success, false, 'unsupported backup versions must be rejected');
assert.equal(storage.getSavedNames().length, before, 'rejected backups must not mutate stored names');

const importedProject = {
  id: 'external-project-id',
  name: 'Imported workspace',
  description: 'Imported from test fixture',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  names: [],
  collections: [],
  history: [],
};
const importResult = storage.importDataJSON(JSON.stringify({
  version: 3,
  names: [],
  collections: [],
  history: [],
  projects: [importedProject],
}));
assert.equal(importResult.success, true, 'version 3 backups should import');
assert.ok(storage.getSavedProjects().some((entry) => entry.id === importedProject.id), 'version 3 import should restore project records');

console.log('Project storage checks passed: snapshots, non-destructive restore, schema v3, and import validation.');
