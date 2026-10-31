# Phase 3 — Enrichissement et droits des banques

## Résultat et limites
Ce commit met en place le registre de provenance `src/data/datasetManifest.ts` et un contrôle automatisé empêchant qu'une source candidate soit traitée comme une source approuvée. **Aucun corpus externe n'est encore importé dans le moteur** : la vérification d'une page de licence ne suffit pas à autoriser la redistribution d'un dump ou d'une base transformée.

Le champ `runtimeEnabled` signale si une banque est actuellement utilisée par l'application; il ne vaut pas approbation juridique. `getRuntimeDatasetSources()` ne retourne que les sources ayant passé le contrôle d'approbation. Ainsi, les banques historiques peuvent rester actives tout en étant signalées comme non vérifiées.\n\nLes 19 familles de phrases déjà présentes dans `src/data/phraseBanks.ts` et les banques procédurales sont classées `editorial-unverified`. Le dépôt ne contient pas encore de preuve d'auteur/contributeur ni de licence explicite pour chaque entrée. Elles restent utilisables dans l'état actuel du site, mais ne doivent pas être présentées comme du domaine public ou des données libres, ni relicenciées sans confirmation des droits.

## Sources recensées

| Ressource | Apport possible | Licence et conditions | Décision |
|---|---|---|---|
| Open English WordNet 2025 | Lemmes anglais, noms communs, adjectifs, relations de sens | CC BY 4.0 **et avis de licence Princeton WordNet hérité** | Candidate, non importée |
| Wiktionary / Kaikki | Lemmes multilingues, formes, prononciations, étymologie | CC BY-SA 4.0 et GFDL 1.3 selon les données | Candidate, séparation des données dérivées |
| Tatoeba | Phrases naturelles et traductions | Licence au niveau de chaque contribution; souvent CC BY 2.0 FR, certaines CC0 | Candidate, attribution individuelle obligatoire |
| CMU Pronouncing Dictionary | Prononciation et syllabification anglaises | BSD 2-Clause, avis complet à conserver | Candidate, outil phonétique seulement |

### Règles spécifiques
- Open English WordNet est une base lexicale de mots communs, pas une liste de noms propres validés. Garder attribution CC BY et avis Princeton avec les copies.
- Wiktionary peut imposer le partage à l'identique sur les données adaptées; conserver un jeu séparé et ses liens sources.
- Tatoeba exige de préserver le contributeur et l'identifiant/URL de chaque phrase; ne pas appliquer une licence unique à l'export entier.
- CMUdict sert à la prononciation, pas à constituer des exemples créatifs.

## Fiche obligatoire pour chaque donnée importée
`source_id`, version exacte, URL/identifiant de l'entrée source, licence exacte, attribution et avis complets, date de téléchargement, SHA-256 de l'archive, script/version de transformation, indicateur de modification, langue/script, catégorie/sens, statut de revue et motifs d'exclusion.

Une source ne passe en production qu'après examen des droits, de la provenance des entrées et une validation linguistique humaine. Une licence permissive ne garantit pas que les mots conviennent à une catégorie ou soient idiomatiques.

## Vérification
```bash
npx tsx src/tests/datasetManifest.test.ts
npm test
npm run build
```

Le test vérifie l'unicité des sources, les métadonnées de droits et le blocage des corpus candidats. Il ne remplace ni une revue juridique ni une validation par des locuteurs natifs.

## Prochaine porte d'entrée
Pilote conseillé : Open English WordNet 2025, limité à l'anglais. Épingler le release exact, conserver les avis de licence, extraire des lemmes pertinents avec leur identifiant de sens et leur source, filtrer les parties du discours, puis faire relire les entrées avant de les ajouter à un générateur. Ce pilote n'est pas encore réalisé par ce commit.
