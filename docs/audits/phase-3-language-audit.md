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
## 12. Règles de composition grammaticales — 2026-10-31

L'audit du moteur a également confirmé que les contractions et accords français de `combineParts` étaient appliqués sans tenir compte de la langue choisie. Cela créait un risque de réécriture française dans les sorties d'autres langues.

Correctifs poussés sur `main` :
- `combineParts` reçoit maintenant le code de langue ;
- les contractions, élisions et accords adjectivaux français sont exécutés uniquement pour `fr` ;
- les appels du moteur transmettent la langue sélectionnée à la fonction de composition ;
- les tests couvrent la conservation des contractions françaises et leur désactivation pour `en`.

Commit moteur : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/56c585f052f3e93ab54f95b18a87f831b77202e3
Commit propagation du code de langue : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/203cd9634bbd9c8c60c87968a2368b2a18b42b4a
Test de régression : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/a8b16b10596c69cb903fee54f2dc4f8bbf9370ff

**Limite :** ce correctif empêche l'application de règles françaises aux autres langues ; il n'ajoute pas encore les grammaires natives manquantes (déclinaisons slaves, harmonie vocalique turque/finnoise, règles de noms coréens, conventions chinoises, etc.). Les profils phonétiques contiennent encore des listes romanisées pour plusieurs écritures non latines, et les champs `vowels`/`consonants` ne sont pas actuellement utilisés par les stratégies de génération. Leur refonte doit s'appuyer sur des unités orthographiques/phonologiques propres à chaque langue et une validation compétente, pas sur une conversion automatique des tableaux latins.

Le workflow complet de validation et de déploiement déclenché après les commits est encore en cours au moment de cette mise à jour ; aucune réussite de tests ou de déploiement n'est revendiquée ici.
## 13. Unités orthographiques et premières règles morphologiques — 2026-10-31

### Unités orthographiques

Un module `src/services/orthographicUnits.ts` définit maintenant un profil explicite pour chacune des dix langues non latines signalées : japonais, coréen, chinois, russe, hindi, thaï, grec, hébreu, ukrainien et bengali.

- Segmentation en graphèmes via `Intl.Segmenter` quand disponible, avec une solution de repli qui conserve les marques combinatoires, les séquences ZWJ et les signes virama.
- Comptage des unités orthographiques au lieu de la longueur UTF-16 dans les choix de préfixes/suffixes courts ou longs.
- Les dix langues restent en génération par mots entiers : aucune découpe arbitraire en pseudo-phonèmes.
- Les tableaux `vowels`/`consonants` romanisés ou incomplets ont été vidés pour ces profils ; ils ne doivent plus être interprétés comme des inventaires phonologiques.

Ce travail décrit des unités d'écriture, pas une transcription phonétique : les tons, mora, syllabes, phonèmes et règles prosodiques restent à modéliser à partir de références linguistiques propres à chaque langue.

### Morphologie

Un module `src/services/languageMorphology.ts` introduit deux fonctions explicites et testées :
- harmonie vocalique turque avec les marqueurs de suffixe `A`, `I`, `D`, `C` ;
- accord régulier des adjectifs espagnols en `-o` lorsque le genre et le nombre sont fournis explicitement.

**Limite d'intégration :** ces fonctions sont des primitives morphologiques testables, pas encore des règles appliquées automatiquement aux générateurs. Les banques actuelles ne portent pas encore les annotations grammaticales nécessaires (type de radical, suffixe morphologique, genre, nombre, exceptions). Les appliquer à des racines créatives arbitraires serait linguistiquement risqué. Les règles slaves, grecques, hébraïques, arabes, japonaises, coréennes, chinoises, hindi, bengalies et thaïes nécessitent également des métadonnées et des validations propres à chaque système.

### Banques de prénoms et licences

Aucun nouveau prénom n'a été ajouté aux dix langues. Le manifeste `src/data/datasetManifest.ts` ne contient actuellement aucune source de prénoms dont la version exacte, la licence de redistribution, l'attribution et les obligations aient été approuvées. Le garde-fou de génération vide reste donc volontairement actif. Le lot de 840 échantillons est toujours en attente de notation humaine ; aucune validation native n'est revendiquée.

### Tests et revalidation

Les tests de `src/tests/linguisticRules.test.ts` couvrent maintenant les dix profils orthographiques, les graphèmes grec, coréen, hindi, bengali et thaï, ainsi que les règles turques et espagnoles. Ces tests doivent être confirmés par le workflow CI complet. Le nouvel audit de 6 552 scénarios doit être exécuté après stabilisation des changements ; les anciens chiffres de référence ne sont pas présentés comme des résultats post-correctif.

Commits :
- Profils orthographiques : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/9941d1fa7f0d471dc3efb0a0e64aa11cb4c62493b
- Protection des tokens et comptage par graphèmes : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/111282179ed653b440b5a0c4d35384acb8cc764e
- Tests orthographiques : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/a41d5f080df3c33ed523fa9f33fb6633df5ed3dc
- Primitives morphologiques : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/9a84e3d8298e6df85fb5cc48c6e9577cb501efd6
- Suppression des pseudo-inventaires de voyelles/consonnes : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/f48cd7de7d2ab7fa7981b827f463be6dace71086
- Tests morphologiques : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/227e2ff956d66861fbc2e5c610828a028d78edba

**État global :** le socle orthographique et quelques primitives morphologiques sont en place. Les banques natives, les règles grammaticales intégrées aux générateurs, la relecture humaine et le nouveau rapport 6 552 scénarios restent à faire. Aucune amélioration de naturalité ne doit être déclarée avant ces validations.
## 14. Première analyse phonétique et registre de sources — 2026-10-31

Un module `src/services/phoneticUnits.ts` ajoute deux analyses limitées et explicites :
- japonais : segmentation des kana en mora, avec attachement des petits kana ;
- coréen : décomposition algorithmique d'un bloc Hangul précomposé en attaque, noyau et coda selon les indices Unicode.

Les huit autres profils (`zh`, `ru`, `uk`, `el`, `he`, `hi`, `bn`, `th`) indiquent explicitement que des données de prononciation fiables sont nécessaires. La génération phonétique reste désactivée pour les dix langues. Ces fonctions d'analyse ne sont ni une transcription IPA complète ni une autorisation de synthétiser des prénoms.

Le manifeste de données référence désormais Onomaverse v2026.10 comme piste de recherche uniquement, désactivée à l'exécution. La page des datasets annonce CC BY 4.0 et des tables de translittération jusqu'à 94 langues, mais les formes principales de la table de fréquence sont latines. En outre, les conditions d'utilisation du site restreignent la redistribution substantielle de la base et le téléchargement automatisé en masse. Il faut résoudre cette portée juridique et vérifier les licences des sources avant tout import. Les translittérations ne seront pas confondues avec des graphies de naissance attestées. Source de piste : https://onomaverse.com/datasets ; conditions : https://onomaverse.com/ne/legal/terms-of-service.

Commit analyse phonétique : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/c080536293c65caf011d1bcdcc777c0bfcacdc16
Commit tests mora/Hangul : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/e746cf392539b9f091b8a71260adff9e6ca667b7
Commit registre candidat : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/32a77cda34ab6d3a7af0d0286d00c45c7ddf9f33
Correction des métadonnées du candidat : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/53f60248c838a4ea9bcf6b9cc411ac2a3732e0da

**À ne pas confondre :** les deux premières analyses phonétiques sont des outils de segmentation, pas des modèles complets de prononciation. Aucune des dix banques de prénoms n'est encore importée ou approuvée. La relecture des 840 échantillons et l'audit de 6 552 scénarios après stabilisation restent obligatoires.


## 15. Revalidation des 6 552 scénarios après les correctifs — 2026-10-31

Le workflow **Generator quality baseline** a été relancé après les modifications linguistiques et le correctif du faux signal de doublons sur les scénarios sans sortie : [exécution 41234701224](https://github.com/hhkskkkdjwbf-bot/NFV2/actions/runs/41234701224).

Résultats de l'artefact de cette exécution :

- **6 552 scénarios** exécutés (234 générateurs × 28 langues).
- **232 992 noms** produits au total.
- **0 chaîne vide** parmi les sorties effectivement produites.
- **0 signal automatique de qualité** après correction du contrôle qui classait à tort les lots vides comme fortement dupliqués.
- **10 scénarios baby_name** renvoient volontairement zéro prénom : `ja`, `ko`, `zh`, `ru`, `hi`, `th`, `el`, `he`, `uk`, `bn`. Ce comportement est le garde-fou attendu tant que des banques natives attestées ne sont pas disponibles ; il ne s'agit pas d'une couverture fonctionnelle complète.
- **840 exemples** sont disponibles dans la file de relecture, soit 30 par langue.

Les six champs de revue humaine (`naturalness_1_5`, `category_fit_1_5`, `language_fit_1_5`, `readability_1_5`, `offensive_or_cultural_issue`, `reviewer_notes`) sont toujours entièrement non renseignés. Le résultat « zéro signal automatique » n'est donc ni une note de naturalité ni une validation par locuteur natif.

Le contrôle d'unicité a aussi été corrigé : un scénario qui ne produit aucun nom ne doit pas être qualifié de « doublons » puisque son lot est vide. Correctif : [a48ec171](https://github.com/hhkskkkdjwbf-bot/NFV2/commit/a48ec171e36e808ce5569594281bb725f115fda9).

## 16. Validation CI et déploiement — 2026-10-31

Le commit de tête vérifié sur `main` est `f285bb0f0f80ded3bab01f5b8308f5aad20f749d`. Le workflow [Deploy NameForge to GitHub Pages, run 41234795551](https://github.com/hhkskkkdjwbf-bot/NFV2/actions/runs/41234795551) est terminé avec succès.

Étapes vérifiées comme réussies :

- installation des dépendances ;
- installation de Chromium ;
- vérification TypeScript ;
- tests de régression ;
- build GitHub Pages ;
- tests navigateur Playwright ;
- audit Lighthouse ;
- publication de l'artefact Pages ;
- déploiement GitHub Pages ;
- audit Lighthouse post-déploiement du site publié.

Artefacts de cette exécution : rapport Lighthouse en direct (`nameforge-live-lighthouse`), artefact Pages (`github-pages`) et rapports de qualité (`nameforge-quality-reports`).

Cette réussite valide le pipeline technique et le déploiement à ce commit. Elle ne remplace pas la validation linguistique humaine, l'intégration de phonologies complètes ou les banques de prénoms autorisées.

## 17. État consolidé des cinq objectifs

| Objectif | État au 2026-10-31 | Ce qui manque pour le déclarer terminé |
|---|---|---|
| 1. Unités phonétiques et orthographiques par langue | **Partiel** : profils orthographiques et segmentation graphémique pour dix écritures non latines ; analyse mora japonaise et décomposition des blocs Hangul coréens. | Modèles phonologiques complets et validés pour chaque langue, y compris tons, syllabes, phonèmes, prosodie et prononciations de référence ; extension aux 28 langues. |
| 2. Grammaires natives au-delà du français | **Partiel** : primitives testées pour harmonie vocalique turque et accord adjectival espagnol ; les règles françaises sont isolées du reste des langues. | Annoter les racines et suffixes, intégrer les règles aux générateurs concernés, couvrir les systèmes grammaticaux propres aux autres langues et tester les exceptions. |
| 3. Dix banques de prénoms autorisées et vérifiables | **Non terminé** : aucun nouveau prénom importé ; Onomaverse reste une piste désactivée en raison d'une portée de licence/conditions d'utilisation non résolue. Les dix scénarios concernés échouent de façon sûre plutôt que d'afficher des prénoms latins non attestés. | Identifier une source par langue, vérifier les droits de collecte, redistribution et attribution, vérifier l'écriture native et les formes attestées, publier la provenance et faire valider les listes. |
| 4. Relecture par des personnes compétentes | **En attente** : 840 échantillons préparés (30 × 28 langues), aucune évaluation humaine renseignée. | Recruter des relecteurs compétents, collecter leurs notes et commentaires, traiter les désaccords et conserver la trace du sign-off. |
| 5. Refaire les 6 552 scénarios | **Exécuté** : 6 552 scénarios, 232 992 noms, 0 sortie vide parmi les sorties émises, 0 signal automatique après correction. Dix scénarios de prénoms sont volontairement sans résultat. | Rejouer après chaque intégration importante ; compléter par la revue humaine et des contrôles linguistiques/culturels, qui ne sont pas couverts par le succès CI. |

**Conclusion :** l'objectif 5 a été exécuté et le pipeline de déploiement est vert. Les objectifs 1 et 2 ont une base technique partielle. Les objectifs 3 et 4 ne sont pas terminés. NameForge ne doit pas être présenté comme validé linguistiquement dans 28 langues tant que les sources, les modèles natifs et les relectures ne sont pas finalisés.


## 18. Fondations des variantes régionales et du contrôle sémantique — 2026-10-31

Deux nouveaux modules de fondation ont été ajoutés directement sur `main`.

### Registre de locales régionales

`src/services/regionalLocales.ts` enregistre explicitement :
- anglais : `en-US`, `en-GB` ;
- français : `fr-FR`, `fr-CA` ;
- portugais : `pt-BR`, `pt-PT` ;
- espagnol : `es-ES`, `es-MX` ;
- chinois : `zh-Hans`, `zh-Hant`.

Le registre normalise les tags, distingue les variantes et fournit la langue de base comme solution de repli explicite. Son statut est volontairement `metadata-only` : les lexiques, règles orthographiques, grammaires, prénoms et relectures propres à chaque région ne sont pas encore disponibles. Le registre n'est pas encore relié au sélecteur de langue ou au moteur de génération.

### Interface de contrôle sémantique

`src/services/semanticSafety.ts` définit un contrat pour les lexiques de risques documentés : langue, terme, niveau de risque, explication, URL source, licence, relecteur et date de validation humaine.

- Une entrée ne peut influencer le résultat que si elle est explicitement vérifiée par un humain et accompagnée de sa provenance.
- Une correspondance à haut risque vérifiée est bloquante ; une correspondance de niveau « review » exige une revue contextuelle.
- En l'absence de lexique validé pour une langue, le statut est `not-screened`, jamais « sûr ».
- Le module n'embarque aucun catalogue d'insultes et n'est pas encore connecté au moteur de génération. Il ne faut donc pas annoncer une détection opérationnelle des noms offensants.

### Tests ajoutés

La suite `linguisticRules.test.ts` inclut des tests de normalisation et de résolution des locales, de séparation des variantes chinoises, de repli vers la langue de base, ainsi que des tests du comportement prudent du contrôle sémantique.

Commits :
- Registre régional : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/3392a0b54d8d036911f361ac6029e54b83d7978d
- Tests régionaux : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/ffc074c0a7c5ac761a9600506b5886cddade425d
- Interface de contrôle sémantique : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/e21d6d26b241180f01392aea04719935c55b023d
- Tests de sécurité sémantique : https://github.com/hhkskkkdjwbf-bot/NFV2/commit/096d1e28e32c07e06a20a5379d0dd47579995b9d

Le workflow déclenché sur le commit de tests est en cours au moment de cette mise à jour. Les statuts TypeScript, tests, navigateur, Lighthouse et déploiement de ce dernier commit ne sont pas encore confirmés.
