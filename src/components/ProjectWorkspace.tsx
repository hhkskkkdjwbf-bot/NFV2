import React, { useEffect, useState } from 'react';
import { FolderPlus, FolderOpen, Trash2, RefreshCw, Save } from 'lucide-react';
import {
  createSavedProject,
  deleteSavedProject,
  getSavedProjects,
  restoreSavedProject,
  subscribeToStorage,
} from '../services/storage';
import { SavedProject } from '../types';
import { getAppSettings } from '../services/settings';

const COPY = {
  fr: {
    title: 'Projets sauvegardés',
    description: 'Enregistrez un instantané de vos noms, collections et historique pour reprendre votre travail plus tard.',
    name: 'Nom du projet',
    details: 'Description (facultatif)',
    create: 'Enregistrer le projet actuel',
    empty: 'Aucun projet sauvegardé pour le moment.',
    restore: 'Importer dans mon espace',
    remove: 'Supprimer',
    created: 'Projet sauvegardé.',
    restored: 'Données du projet ajoutées à votre espace. Les données actuelles ont été conservées.',
    removed: 'Projet supprimé.',
    confirm: 'Supprimer ce projet sauvegardé ?',
    counts: (p: SavedProject) => `${p.names.length} noms · ${p.collections.length} collections · ${p.history.length} éléments d’historique`,
    error: 'Impossible d’effectuer cette opération. Vérifiez l’espace de stockage disponible.',
  },
  en: {
    title: 'Saved projects',
    description: 'Save a snapshot of your names, collections, and history so you can continue later.',
    name: 'Project name',
    details: 'Description (optional)',
    create: 'Save current workspace',
    empty: 'No saved projects yet.',
    restore: 'Add to my workspace',
    remove: 'Delete',
    created: 'Project saved.',
    restored: 'Project data added to your workspace. Existing data was preserved.',
    removed: 'Project deleted.',
    confirm: 'Delete this saved project?',
    counts: (p: SavedProject) => `${p.names.length} names · ${p.collections.length} collections · ${p.history.length} history items`,
    error: 'Unable to complete this action. Check available browser storage.',
  },
  ar: {
    title: 'المشاريع المحفوظة',
    description: 'احفظ نسخة من الأسماء والمجموعات والسجل لمتابعة العمل لاحقًا.',
    name: 'اسم المشروع',
    details: 'الوصف (اختياري)',
    create: 'حفظ مساحة العمل الحالية',
    empty: 'لا توجد مشاريع محفوظة بعد.',
    restore: 'إضافة إلى مساحة العمل',
    remove: 'حذف',
    created: 'تم حفظ المشروع.',
    restored: 'تمت إضافة بيانات المشروع مع الحفاظ على البيانات الحالية.',
    removed: 'تم حذف المشروع.',
    confirm: 'هل تريد حذف هذا المشروع المحفوظ؟',
    counts: (p: SavedProject) => `${p.names.length} أسماء · ${p.collections.length} مجموعات · ${p.history.length} عناصر في السجل`,
    error: 'تعذر تنفيذ العملية. تحقق من مساحة التخزين المتاحة.',
  },
};

export const ProjectWorkspace: React.FC = () => {
  const language = getAppSettings().language;
  const t = COPY[language as keyof typeof COPY] || COPY.en;
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');

  const reload = () => setProjects(getSavedProjects());
  useEffect(() => {
    reload();
    return subscribeToStorage(reload);
  }, []);

  const handleCreate = () => {
    const project = createSavedProject(name, description);
    if (!project) {
      setStatus(t.error);
      return;
    }
    setName('');
    setDescription('');
    setStatus(t.created);
    reload();
  };

  const handleRestore = (id: string) => {
    const result = restoreSavedProject(id);
    setStatus(result.success ? t.restored : (result.errors[0] || t.error));
    reload();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t.confirm)) return;
    setStatus(deleteSavedProject(id) ? t.removed : t.error);
    reload();
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#0d1424] p-4 sm:p-6 space-y-4" aria-labelledby="saved-projects-title">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center"><FolderOpen className="w-5 h-5" /></div>
        <div>
          <h2 id="saved-projects-title" className="text-lg font-black text-white">{t.title}</h2>
          <p className="text-xs text-slate-400 mt-1">{t.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_auto] gap-2">
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder={t.name} aria-label={t.name} className="min-w-0 h-10 rounded-xl border border-slate-700 bg-[#080e1b] px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500" />
        <input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={240} placeholder={t.details} aria-label={t.details} className="min-w-0 h-10 rounded-xl border border-slate-700 bg-[#080e1b] px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500" />
        <button type="button" onClick={handleCreate} disabled={!name.trim()} className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold inline-flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />{t.create}
        </button>
      </div>

      {status && <p role="status" aria-live="polite" className="text-xs text-cyan-300">{status}</p>}

      {projects.length === 0 ? (
        <p className="text-sm text-slate-500 py-3">{t.empty}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {projects.map((project) => (
            <article key={project.id} className="rounded-xl border border-slate-700/80 bg-[#090f1d] p-4 space-y-3">
              <div>
                <h3 className="font-bold text-sm text-white">{project.name}</h3>
                {project.description && <p className="text-xs text-slate-400 mt-1">{project.description}</p>}
                <p className="text-[11px] text-slate-500 mt-2">{t.counts(project)}</p>
                <p className="text-[10px] text-slate-600 mt-1">{new Date(project.updatedAt).toLocaleString(language)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => handleRestore(project.id)} className="px-3 py-2 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 text-xs font-bold inline-flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />{t.restore}
                </button>
                <button type="button" onClick={() => handleDelete(project.id)} className="px-3 py-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs font-bold inline-flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />{t.remove}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
