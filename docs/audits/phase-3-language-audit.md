# NameForge V2 — Audit linguistique des 28 langues

- Date de l'audit : 2026-10-31
- Branche source : `main`
- Périmètre : interface, banques de phrases, profils phonétiques, scripts Unicode, résultats générés, variantes et validation humaine.
- Nature : audit statique du code courant + analyse des artefacts d'un audit automatisé exécuté le 2026-10-31.
- Référence du dépôt : https://github.com/hhkskkkdjwbf-bot/NFV2

## 1. Résumé exécutif

| Dimension | Résultat vérifié | Limite importante |
|---|---|---|
| Interface | 28/28 langues enregistrées comme traductions complètes. La suite `comprehensiveSuite.ts` contient des contrôles des libellés shell, des champs principaux et des titres localisés pour les 28 langues. | Cela ne prouve pas que chaque description, FAQ et texte éditorial de chacun des 234 générateurs est spécifique et relu dans chaque langue. |
| Banques de phrases | 19 catégories × 28 langues. Chaque langue possède 226 entrées au total dans les banques analysées. | Volume égal ne signifie pas qualité idiomatique validée. |
| Profils phonétiques | 28/28 profils dans `LANGUAGE_PHONETICS`, avec préfixes, suffixes, mots de titre, voyelles et consonnes. | Plusieurs profils de scripts non latins utilisent des listes de voyelles/consonnes romanisées ; les profils sont donc des heuristiques de génération, pas des descriptions phonologiques complètes. |
| Profils de scripts | 28/28 profils explicites dans `linguisticRules.ts`. | Le contrôle porte surtout sur l'appartenance Unicode au script, pas sur l'orthographe, la morphologie ou la langue réelle. |
| Génération automatisée | 234 générateurs × 28 langues = 6 552 scénarios ; 233 352 noms produits ; 0 sortie vide. | Mesures structurelles et heuristiques seulement : elles ne certifient ni le naturel, ni le sens, ni l'adéquation culturelle. |
| Répétitions | 100 % d'unicité intra-lot dans les scénarios du rapport de référence. | Le chevauchement entre graines varie selon la langue et reste un signal de diversité, pas une faute linguistique en soi. |
| Noms attestés | Le répertoire de prénoms localisé explicitement contient actuellement une section arabe. | Pour les 10 autres langues à script non latin, le générateur de prénoms retombe sur le répertoire latin générique et déclenche les alertes de script. |
| Validation humaine | File de 840 échantillons préparée, soit 30 par langue. | Aucune note humaine n'est préremplie ; aucune langue n'est déclarée validée. |
| Variantes régionales | Pas de couche explicite de variantes régionales dans le moteur. | `pt-BR/pt-PT`, `en-US/en-GB`, `fr-FR/fr-CA`, `es-ES/es-MX` ne sont pas différenciés par des profils régionaux dédiés. |

## 2. Méthode et portée des résultats générés

Le rapport automatisé de référence a été produit par le workflow GitHub Actions **Generator quality baseline**, exécution [41219639115](https://github.com/hhkskkkdjwbf-bot/NFV2/actions/runs/41219639115), terminée avec succès. Son artefact contient :

- `baseline.json` : 6 552 scénarios, trois graines par scénario et 12 noms demandés par graine ;
- `deep-dive.json` : empreintes des sorties et type de pipeline ;
- `review-queue-28-languages.csv` : 840 exemples pour relecture humaine.

Les 233 352 sorties correspondent à 234 générateurs × 28 langues × 3 graines × 12 noms. Le moteur n'a renvoyé aucune sortie vide. Le taux d'unicité intra-lot est de 100 % dans les scénarios du rapport.

Le chevauchement inter-graines moyen par langue est un indicateur de répétition entre lots indépendants. Il ne doit pas être confondu avec les doublons dans un même lot.

**Limite fondamentale :** les scores automatiques ne mesurent pas la naturalité, la pertinence sémantique, la grammaire native ou les connotations culturelles. Le module `linguisticQuality.ts` laisse explicitement les dimensions de naturalité et d'adéquation à la catégorie sans score automatique lorsqu'aucune note humaine n'existe.

## 3. Rapport par langue

Chaque langue ci-dessous dispose de 8 334 sorties dans le rapport de référence (234 générateurs × 3 graines × 12 noms). « 0 doublon intra-lot » signifie qu'aucun doublon normalisé n'a été détecté dans les lots testés ; cela ne constitue pas une preuve de qualité linguistique.

| Langue | Script attendu | Interface | Banques | Profil phonétique | Sorties / vides | Chevauchement inter-graines | Lacune observée |
|---|---|---:|---:|---:|---:|---:|---|
| Français `fr` | Latin | Complet | 19/19 · 226 | Présent · 13 préfixes / 13 suffixes | 8 334 / 0 | 13,30 % | Règles grammaticales plus développées en français qu'ailleurs ; variante fr-FR/fr-CA absente. |
| Anglais `en` | Latin | Complet | 19/19 · 226 | Présent · 12 / 12 | 8 334 / 0 | 20,95 % | Pas de séparation en-US/en-GB ; différences orthographiques et lexicales régionales non modélisées. |
| Arabe `ar` | Arabe | Complet | 19/19 · 226 | Présent · 12 / 12 | 8 334 / 0 | 12,76 % | 12 prénoms arabes localisés, mais pas de variantes dialectales ni de règles morphologiques arabes complètes ; voyelles/consonnes du profil romanisées. |
| Turc `tr` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 16,05 % | Harmonie vocalique et agglutination non vérifiées par des règles morphologiques dédiées. |
| Espagnol `es` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 13,21 % | Pas de séparation es-ES/es-MX ; usages régionaux non contrôlés. |
| Allemand `de` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 24,77 % | Composés et flexion allemands non contrôlés par un module grammatical dédié. |
| Italien `it` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 13,01 % | Genre, accords et variantes régionales non validés systématiquement. |
| Portugais `pt` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 15,49 % | Une seule langue `pt` ; pas de distinction pt-BR/pt-PT ni de lexiques régionaux séparés. |
| Japonais `ja` | Han + Hiragana + Katakana | Complet | 19/19 · 226 | Présent · 13 / 13 | 8 334 / 0 | 8,57 % | Le contrôle autorise les trois scripts, mais ne valide pas les lectures, les kanji choisis, les particules ou les connotations. Le profil phonétique est partiellement romanisé. **Alerte de script sur baby_name : 100 % des sorties de ce scénario.** |
| Coréen `ko` | Hangul | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 9,95 % | Pas de règles dédiées de syllabation/blocs Hangul, de romanisation et de conventions de noms. **Alerte de script sur baby_name : 100 % des sorties de ce scénario.** |
| Chinois `zh` | Han | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 11,89 % | Simplifié/traditionnel, pinyin, tons et conventions de noms non différenciés. **Alerte de script sur baby_name : 100 % des sorties de ce scénario.** |
| Russe `ru` | Cyrillique | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 15,94 % | Déclinaisons, genre et formation des patronymes non modélisés de façon complète. **Alerte de script sur baby_name : 100 % des sorties de ce scénario.** |
| Hindi `hi` | Devanagari | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 15,71 % | Matras, translittération et conventions de noms ne sont pas validées par un modèle linguistique dédié. **Alerte de script sur baby_name : 100 % des sorties de ce scénario.** |
| Néerlandais `nl` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 15,92 % | Composés et variantes néerlandais/flamands non différenciés. |
| Polonais `pl` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 15,35 % | Déclinaisons et alternances morphologiques non modélisées. |
| Suédois `sv` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 17,77 % | Morphologie nominale et variantes d'usage non contrôlées. |
| Vietnamien `vi` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 19,62 % | Diacritiques et conventions de segmentation des noms nécessitent une validation dédiée ; pas de modèle tonal. |
| Indonésien `id` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 21,25 % | Affixation et différences de registre/région non modélisées. |
| Thaï `th` | Thaï | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 16,70 % | Segmentation des mots, tons et conventions de noms non validés. **Alerte de script sur baby_name : 100 % des sorties de ce scénario.** |
| Grec `el` | Grec | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 16,48 % | Déclinaisons et translittération non contrôlées. **Alerte de script sur baby_name : 100 % des sorties de ce scénario.** |
| Hébreu `he` | Hébreu | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 17,90 % | Écriture sans voyelles, translittérations et formes grammaticales non validées. **Alerte de script sur baby_name : 100 % des sorties de ce scénario.** |
| Tchèque `cs` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 16,90 % | Déclinaisons et alternances consonantiques non modélisées. |
| Roumain `ro` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 15,65 % | Genre, articles et flexion non vérifiés systématiquement. |
| Danois `da` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 15,67 % | Morphologie et distinction avec les usages norvégiens/suédois à approfondir. |
| Finnois `fi` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 15,61 % | Harmonie vocalique et suffixation casuelle non modélisées par des règles dédiées. |
| Ukrainien `uk` | Cyrillique | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 16,03 % | Morphologie et conventions anthroponymiques non vérifiées. **Alerte de script sur baby_name : 100 % des sorties de ce scénario.** |
| Bengali `bn` | Bengali | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 18,21 % | Graphèmes, signes vocaliques et conventions de noms non validés. **Alerte de script sur baby_name : 100 % des sorties de ce scénario.** |
| Norvégien Bokmål `nb` | Latin | Complet | 19/19 · 226 | Présent · 10 / 10 | 8 334 / 0 | 16,68 % | Pas de variante régionale ou de distinction Bokmål/Nynorsk dans le moteur. |

### Lecture des alertes de script

Les 10 scénarios signalés sont tous le générateur `baby_name` pour : `ja`, `ko`, `zh`, `ru`, `hi`, `th`, `el`, `he`, `uk` et `bn`.

Le problème n'est pas un défaut des banques de phrases : le pipeline des prénoms utilise un répertoire attesté commun, alors que le fichier `attestedBabyNames.ts` ne contient qu'une liste explicitement localisée en arabe. Les sorties des 10 langues ci-dessus sont donc en alphabet latin et ne respectent pas le script attendu. Il faut constituer des répertoires attestés et sourcés par langue avant de corriger ce problème ; une translittération automatique ne suffirait pas à prouver l'authenticité du prénom.

## 4. Banques de phrases

Les 19 catégories présentes sont :

`slogan`, `book`, `song_title`, `podcast`, `blog_name`, `newsletter`, `album_title`, `novel_series`, `tactical_operation`, `restaurant`, `coffee_shop`, `tavern`, `band_name`, `videogame`, `youtube`, `shop`, `guild`, `bakery`, `hotel_name`.

Le décompte extrait de `RAW_BANKS` est identique pour les 28 langues :

- 15 catégories × 10 entrées ;
- `restaurant` et `tavern` × 20 entrées ;
- `videogame` × 21 entrées ;
- `shop` × 15 entrées ;
- total : **226 entrées par langue**.

Le moteur de référence identifie 19 générateurs à banque de phrases ; les autres générateurs sont procéduraux, à l'exception de `baby_name` qui utilise les prénoms attestés. Les banques sont donc présentes partout, mais leur faible volume (10 à 21 phrases par catégorie) provoque mécaniquement des répétitions sur de gros lots. L'égalité du nombre d'entrées n'est pas une validation de la qualité des traductions.

## 5. Profils phonétiques et règles linguistiques

Les 28 langues ont un objet dans `LANGUAGE_PHONETICS`. La plupart ont 10 préfixes, 10 suffixes et 4 mots de titre ; français, anglais, japonais et arabe disposent de listes un peu plus longues.

Constats :

1. Les profils fournissent des éléments de génération, mais les voyelles et consonnes ne sont pas toujours représentées dans l'écriture native. Pour l'arabe, le russe, l'ukrainien, le grec, l'hindi, le bengali, le thaï, le japonais et le chinois, une partie des tableaux reste romanisée ou générique.
2. `linguisticRules.ts` gère principalement le script attendu et les stratégies autorisées selon la famille de générateur. Ce n'est pas un moteur complet de morphologie.
3. Les règles explicites d'accord, d'élision et de contraction visibles dans `combineParts` sont principalement françaises.
4. Les stratégies de fusion sont volontairement restreintes pour les langues qui exigent des mots entiers, mais cette prudence ne remplace pas des règles natives.

## 6. Traductions de l'interface et contenus des générateurs

Les traductions de l'interface sont assemblées depuis trois ensembles : 10 langues de base, 15 langues supplémentaires et 3 langues ajoutées (`uk`, `bn`, `nb`). La suite de tests contient des contrôles des 28 langues pour les libellés principaux, les libellés d'accessibilité, les pages, les familles et les titres localisés enregistrés.

Une différence reste importante :

- **Interface complète** : présence des traductions des menus, contrôles et modules partagés.
- **Contenu éditorial de chaque générateur** : le résolveur de descriptions peut renvoyer un texte spécifique au générateur, un texte générique par catégorie ou la description source. Le script `scripts/localization-coverage-audit.ts` sait recenser ces replis, mais son rapport chiffré n'était pas inclus dans l'artefact du workflow analysé.

Le statut « Interface complète » dans le tableau ne doit donc pas être interprété comme « 234 pages de générateur entièrement rédigées et relues dans cette langue ».

## 7. Scripts, détection sémantique et culture

- Les contrôles Unicode détectent les scripts et certains caractères de contrôle. Ils ne comprennent pas le sens d'un nom.
- L'audit Python propose des adaptateurs facultatifs (Hunspell, LanguageTool, ICU, fastText et Hyperscan), mais leur disponibilité dépend de l'environnement local et des dictionnaires/modèles installés.
- Hunspell peut signaler qu'un nom n'est pas dans un dictionnaire ; cela ne prouve pas qu'un nom propre est incorrect.
- LanguageTool vérifie une description textuelle lorsqu'elle est fournie ; il ne valide pas un nom isolé.
- Aucun lexique sémantique culturel multilingue validé n'est actuellement démontré par les tests. Les insultes, doubles sens, associations discriminatoires et connotations régionales exigent encore une base de données contrôlée et une revue humaine.

## 8. Variantes régionales

Aucun profil régional explicite n'a été trouvé dans le moteur actuel. Le code utilise principalement des codes de langue génériques. Les variantes à prévoir sont au minimum :

- `en-US` / `en-GB`
- `pt-BR` / `pt-PT`
- `fr-FR` / `fr-CA`
- `es-ES` / `es-MX`

Il faudra séparer les règles et lexiques régionaux de la langue de base, avec héritage explicite et tests de non-régression.

## 9. Validation humaine

La file de relecture contient exactement 840 lignes, soit 30 échantillons pour chacune des 28 langues. Les colonnes prévues couvrent naturalité, adéquation à la catégorie, adéquation linguistique, lisibilité, problème offensant/culturel et commentaires.

**Statut : en attente.** Aucune note humaine n'est renseignée. Le projet ne peut donc pas annoncer que ses 28 langues sont « natives », « naturelles » ou culturellement validées.

## 10. Priorités de correction déduites de l'audit

1. **P0 — Prénoms et scripts :** ajouter des listes de prénoms attestés, sourcées et relues pour les 10 langues signalées ; empêcher le repli silencieux vers des prénoms latins lorsque le script cible est non latin.
2. **P1 — Phonétique :** revoir les tableaux voyelles/consonnes et les règles de combinaison pour les écritures non latines ; documenter les limites pour chaque langue.
3. **P1 — Grammaire :** ajouter des règles par langue et famille de générateurs, en commençant par les langues où les assemblages morphologiques sont les plus sensibles.
4. **P1 — Contenus localisés :** exécuter et publier le rapport chiffré de `npm run audit:i18n` ; remplacer les replis génériques ou source par des contenus spécifiques lorsque nécessaire.
5. **P2 — Banques :** augmenter les banques par catégorie après relecture native ; 226 entrées par langue au total ne signifie pas 226 par générateur.
6. **P2 — Régions :** ajouter les locales régionales et leur héritage de règles.
7. **P2 — Sécurité sémantique :** constituer des listes de termes problématiques sourcées, avec seuils de confiance et revue humaine.
8. **P3 — Sign-off :** faire compléter les 840 fiches et conserver la qualification du relecteur, la date et les corrections.

## 11. Fichiers et preuves consultés

- `src/i18n/index.ts`, `extraLanguages.ts`, `newLanguageTranslations.ts`, `addedLanguages.ts`
- `src/i18n/generatorContent.ts`, `generatorTitles.ts`, `localizedGeneratorMeta.ts`
- `src/data/phraseBanks.ts`, `attestedBabyNames.ts`, `syllableEnrichment.ts`
- `src/services/generatorEngine.ts`, `linguisticRules.ts`, `linguisticQuality.ts`
- `scripts/generator-quality-baseline.ts`, `generator-quality-deep-dive.ts`, `localization-coverage-audit.ts`, `linguistic-audit.py`
- `src/tests/comprehensiveSuite.ts`, `linguisticRules.test.ts`, `generatorLanguageRules.integration.test.ts`, `datasetManifest.test.ts`
- Artefact du workflow [41219639115](https://github.com/hhkskkkdjwbf-bot/NFV2/actions/runs/41219639115), contenant les rapports et la file de relecture.

---
Ce rapport est un audit technique et quantitatif. Il ne constitue pas une certification linguistique par des locuteurs natifs.
## 11. Correctif de sécurité linguistique — 2026-10-31

Le correctif `1b7d996` dans `src/services/generatorEngine.ts` supprime le repli silencieux vers le répertoire global pour les langues dont le script attendu n'est pas latin :

- les langues non latines doivent disposer d'une banque explicitement localisée ;
- chaque prénom de cette banque est filtré selon les scripts autorisés pour la langue ;
- si aucune banque localisée valide n'existe, le générateur renvoie une liste vide plutôt que des prénoms français/latins présentés comme attestés ;
- l'arabe conserve sa banque localisée existante ;
- les langues latines conservent le comportement historique, en attendant une séparation plus fine des répertoires régionaux.

Le test de régression ajouté dans `src/tests/regressionQuality.ts` vérifie les dix langues signalées : `ja`, `ko`, `zh`, `ru`, `hi`, `th`, `el`, `he`, `uk`, `bn`. Il vérifie également que le parcours arabe conserve ses sorties en écriture arabe.

**Statut exact :** le défaut de faux repli est corrigé dans le code et le test de non-régression est ajouté. Les dix banques natives ne sont pas encore constituées ; le générateur de prénoms reste donc volontairement sans résultat dans ces dix langues jusqu'à l'intégration de données documentées, autorisées et relues. Ce correctif ne constitue pas une validation linguistique humaine et ne doit pas être compté comme une amélioration de naturalité.

Le changement de code et le test ont été poussés directement sur `main` :
- Correctif moteur : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/1b7d9966f05ddd31e72735386a99b8af75f6a37c
- Test de régression : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/414d477bfd3c6dc380b4dade533dbd88219769eb

Les tests automatisés complets et le déploiement doivent encore être confirmés par une exécution réussie du workflow de validation après ces commits.
