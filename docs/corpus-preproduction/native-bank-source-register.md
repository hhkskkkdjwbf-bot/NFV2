# NameForge V2 — Registre des sources candidates pour les banques natives

- État du registre : recherche documentaire + premier snapshot brut en préproduction
- Date de vérification : 2026-10-31
- Périmètre : `ja`, `ko`, `zh`, `ru`, `hi`, `th`, `el`, `he`, `uk`, `bn`
- Politique : aucun prénom de ce dossier n'est intégré à un générateur public.

## Décision générale

Une seule source a franchi le seuil documentaire et a été copiée en préproduction : le corpus russe NEN sous CC BY 4.0, avec son fichier de licence et son attribution obligatoire. Les autres pistes restent conditionnelles ou bloquées. Aucun nom n'est déclaré linguistiquement validé par le seul fait qu'il figure dans un corpus.

Avant toute intégration, chaque source doit avoir un fichier/version figé, ses notices de licence, un SHA-256 calculé sur les octets originaux, une provenance par entrée, une séparation stricte des translittérations et une revue humaine.

## Registre par langue

| Langue | Piste principale | Licence / conditions observées | Décision de préproduction |
|---|---|---|---|
| Japonais `ja` | EDRDG **JMnedict/ENAMDICT** : dictionnaire de noms japonais comprenant prénoms, noms de famille, lieux, organisations et œuvres. Les codes `g`, `f`, `m` isolent les prénoms; `u` reste ambigu. | Licence EDRDG spécifique. Usage commercial autorisé sous conditions d'attribution; ne pas revendiquer le copyright du contenu; maintenir les données à jour au moins mensuellement. | **Candidat exploitable sous conditions**. Pas encore de snapshot brut. |
| Coréen `ko` | Statistiques de prénoms déclarés à la Cour suprême coréenne; Wikidata en complément pour les libellés natifs. | Aucune licence de redistribution du fichier officiel confirmée. Wikidata structured data est CC0. | **Bloqué pour le registre officiel** jusqu'à vérification des conditions et obtention du fichier source. |
| Chinois `zh` | Wikidata (libellés natifs et items de prénoms); bases CJKI commerciales/propriétaires; corpus issu d'une collaboration privée avec NCIIC. | Wikidata structured data CC0. Pas de licence claire identifiée pour le corpus privé; CJKI non retenu sans contrat. | **Partiellement exploitable** via Wikidata après validation individuelle des items seulement. |
| Russe `ru` | NEN « Имена » / `mdanina/nen-imena-dataset`, 1 551 entrées annoncées (809 masculines, 742 féminines). Snapshot copié dans `raw/ru/names.csv`. | CC BY 4.0. Attribution exacte obligatoire : « Данные: НЭН — сервис „Имена“, https://n-e-n.ru/imena/ »; en ligne, le lien doit être actif. | **Snapshot brut en préproduction**. SHA-256 et licence conservés dans `raw/ru/`; conversion et revue humaine encore à faire. |
| Hindi `hi` | Wikidata pour les items explicitement classés comme prénoms avec libellé Devanagari; portail OGD India à examiner si un jeu précis est identifié. | Wikidata CC0. La licence OGD India s'applique selon les métadonnées de chaque jeu; aucun corpus de prénoms précis confirmé. | **Pas de corpus officiel identifié**. Wikidata comme amorce CC0 seulement. |
| Thaï `th` | `korkeatw/thai-names-corpus` : 7 124 prénoms masculins et 5 098 féminins annoncés. | CC BY-SA 4.0 déclaré par le dépôt. Sources amont collectées sur le Web et issues de noms de candidats; droits sous-jacents à clarifier. | **Bloqué pour import public** tant que la provenance amont n'est pas clarifiée. |
| Grec `el` | Wikidata WikiProject Names — liste de prénoms grecs avec labels grecs et catégories explicites. | CC0 pour les données structurées. | **Candidat complémentaire CC0**; couverture et naturalité à mesurer. |
| Hébreu `he` | Jeu « שמות פרטיים בישראל » de l'Autorité de la population et de l'immigration, CSV annoncé, données au 14-09-2020. | Métadonnée « Other (Open) »; le portail signale des erreurs possibles de conversion/transcription. Fichier et texte exact de licence non vérifiés directement. | **Bloqué** jusqu'à obtention du CSV et de la licence officielle. |
| Ukrainien `uk` | Publications régionales du ministère de la Justice avec listes de prénoms; Wikidata en complément. | Les articles officiels ne prouvent pas un droit de réutilisation en corpus. Le jeu ouvert de natalité consulté ne contient pas les prénoms. | **Pas de fichier de prénoms réutilisable confirmé**. |
| Bengali `bn` | Wikidata pour les items de prénoms avec libellés bengalis. | CC0 pour les données structurées; aucun corpus tiers avec licence vérifiée dans cette passe. | **Pas de corpus officiel identifié**. Wikidata comme amorce CC0 seulement. |

## Snapshot russe — empreintes et provenance

- Fichier : `raw/ru/names.csv`
- Révision amont : `38b3cad3aa123326be8bb97b0e9a3c0e5c7f54e6`
- SHA-256 du fichier brut : `a8baa5aac8edf49ec317f3d6ba2556e3b12d63de883b2ee4150fd7ee57f62a77`
- Taille : 873328 octets
- Licence et attribution : `raw/ru/LICENSE-NEN.txt` et `raw/ru/SOURCE.md`

Le CSV est un fichier source brut. Le contrôle structurel a confirmé 1 551 lignes, 1 548 graphies distinctes, trois graphies répétées avec des catégories de genre différentes (Айнур, Адель, Фирдаус), aucun champ prénom vide et 1 551/1 551 graphies cyrilliques sans lettre latine. Le détail est dans `raw/ru/SOURCE.md`. Ce contrôle ne remplace pas la relecture humaine. Le champ `international_forms` contient des formes internationales romanisées et ne doit jamais être fusionné dans la banque native cyrillique. `popularity_place` est un rang relatif, pas un nombre de naissances.

## Règles d'importation obligatoires

1. Une source et une version par fichier brut; URL stable et date d'accès conservées.
2. SHA-256 calculé sur les octets exacts téléchargés, avant toute transformation.
3. Notice de licence, attribution et obligations de partage conservées avec le fichier.
4. Chaque entrée conserve `sourceId`, `sourceRecordId`, graphie originale, script, langue et provenance.
5. Une translittération est une ligne distincte liée au prénom natif; jamais une attestation native.
6. Les homographes, variantes régionales et formes historiques ne sont pas fusionnés automatiquement.
7. Les statistiques de naissance ne sont importées que si la source et son contrat l'autorisent explicitement.
8. Les corpus CC BY-SA restent isolés jusqu'à décision sur la compatibilité de la licence avec NameForge.
9. Les banques restent hors des générateurs publics jusqu'à validation juridique, technique et humaine.

## Références documentaires

- EDRDG, licence des dictionnaires : https://www.edrdg.org/edrdg/licence.html
- EDRDG, documentation JMnedict : https://www.edrdg.org/pub/Nihongo/enamdict_doc.html
- Corée, statistiques des déclarations de naissance : https://efamily.scourt.go.kr/
- Wikidata, politique de licence : https://www.wikidata.org/wiki/Wikidata:Licensing
- NEN, dépôt canonique : https://github.com/mdanina/nen-imena-dataset
- NEN, jeu russe : https://huggingface.co/datasets/MentalTech/russian-given-names-nen
- Thaï, dépôt de prénoms : https://github.com/korkeatw/thai-names-corpus
- Inde, licence OGD : https://www.data.gov.in/Godl
- Israël, jeu officiel : https://data.gov.il/he/datasets/population_authority/firs-name
- Ukraine, jeu de natalité (ne contient pas les prénoms) : https://data.gov.ua/dataset/d8cc2022-424b-4e7e-9460-bb7bf7f77ad9
- Grèce, liste Wikidata : https://www.wikidata.org/wiki/Wikidata:WikiProject_Names/lists/Greek_first_names
