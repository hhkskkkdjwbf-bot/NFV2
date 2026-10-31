# NameForge V2 — Registre des sources candidates pour les banques natives

- État du registre : recherche documentaire initiale, préproduction uniquement
- Date de vérification : 2026-10-31
- Périmètre : `ja`, `ko`, `zh`, `ru`, `hi`, `th`, `el`, `he`, `uk`, `bn`
- Politique : aucune ligne de prénom n'est importée par ce registre. Il ne constitue pas un corpus de prénoms.

## Décision générale

Aucune banque native n'est déclarée prête à intégrer. Les pages et licences ci-dessous identifient des pistes et leurs limites. Avant tout import, il faut télécharger un fichier source précis, figer sa version, conserver les notices et le texte de licence, calculer son SHA-256, documenter la provenance de chaque entrée, dédupliquer sans fusionner les graphies, distinguer les noms natifs des translittérations, puis faire relire les échantillons par un locuteur compétent.

Les sommes de contrôle de `SHA256SUMS` portent uniquement sur les fichiers de ce dossier de recherche. Elles ne sont pas des empreintes de corpus sources.

## Registre par langue

| Langue | Piste principale | Licence / conditions observées | Décision de préproduction |
|---|---|---|---|
| Japonais `ja` | EDRDG **JMnedict/ENAMDICT** : dictionnaire de noms japonais comprenant des prénoms, mais aussi des noms de famille, lieux, organisations et œuvres. Les codes `g`, `f`, `m` isolent les prénoms; `u` reste ambigu. | Licence EDRDG spécifique, pas une simple déclaration CC BY. Usage commercial autorisé sous conditions d'attribution; ne pas revendiquer le copyright du contenu; maintenir les données à jour au moins mensuellement. | **Candidat exploitable sous conditions**. Télécharger le fichier officiel, isoler les codes de prénoms, conserver l'attribution et organiser les mises à jour. |
| Coréen `ko` | Statistiques de prénoms déclarés à la Cour suprême coréenne, exposées par des sites tiers; Wikidata peut servir de source complémentaire pour les libellés natifs. | Les pages consultées montrent l'existence de statistiques officielles, mais aucune licence de redistribution du fichier source n'a été confirmée ici. Wikidata structured data est CC0. | **Bloqué pour le registre officiel** jusqu'à vérification des conditions de réutilisation et obtention du fichier source. Wikidata seulement comme complément CC0, avec contrôle manuel des types d'entités. |
| Chinois `zh` | Wikidata (libellés natifs et items de prénoms) comme amorce; les bases CJKI sont commerciales/propriétaires. Un corpus chinois signalé comme provenant d'une collaboration privée avec NCIIC ne fournit pas, dans la documentation consultée, de licence de redistribution claire. | Wikidata structured data CC0. Les bases CJKI ne sont pas retenues sans contrat/licence. La documentation du corpus privé ne suffit pas à autoriser la redistribution. | **Partiellement exploitable** : uniquement les données CC0 de Wikidata après validation des items; pas d'import du corpus privé ou propriétaire. |
| Russe `ru` | NEN « Имена » / `russian-given-names-nen`, 1 551 entrées annoncées, avec formes natives, diminutifs et références à des statistiques ZAGS de Moscou. | CC BY 4.0 déclaré par la fiche du jeu de données; attribution exigée, avec lien vers NEN pour l'utilisation en ligne. | **Candidat exploitable sous conditions**. Vérifier le dépôt canonique, le fichier intégral, la provenance des champs, la date de version et les obligations d'attribution avant copie. |
| Hindi `hi` | Wikidata pour les items explicitement classés comme prénoms et possédant un libellé Devanagari; portail OGD India à examiner si un jeu de données de prénoms est identifié. | Les données structurées Wikidata sont CC0. Le portail OGD India prévoit une licence ouverte gouvernementale pour les jeux concernés, mais les droits d'un jeu précis doivent être lus dans ses métadonnées; aucun corpus de prénoms précis n'a été confirmé. | **Pas de corpus officiel identifié**. Wikidata peut fournir une liste de départ CC0, à valider individuellement; ne pas assimiler cela à une liste représentative de prénoms hindi. |
| Thaï `th` | `korkeatw/thai-names-corpus` : listes thaïes d'hommes/femmes; le dépôt indique 7 124 prénoms masculins et 5 098 féminins. | CC BY-SA 4.0 déclaré par le dépôt. L'auteur indique une collecte sur le Web et une extraction de noms de candidats électoraux; les sources amont ne sont pas toutes documentées individuellement. | **Bloqué pour import public** tant que la provenance amont et les droits sur les données compilées ne sont pas clarifiés. Licence share-alike à respecter si l'usage est autorisé. |
| Grec `el` | Wikidata WikiProject Names — liste de prénoms grecs avec labels grecs et catégories explicites; données structurées Wikidata. | CC0 pour les données structurées. Vérifier chaque item, son type, sa langue et son écriture avant extraction. | **Candidat complémentaire exploitable** sous CC0, mais la couverture et la naturalité doivent être mesurées; ce n'est pas un registre officiel. |
| Hébreu `he` | Jeu « שמות פרטיים בישראל » publié sur data.gov.il par l'Autorité de la population et de l'immigration; CSV annoncé, données arrêtées au 14-09-2020. | Métadonnée de licence affichée « Other (Open) »; le portail signale des erreurs possibles de conversion/transcription. La page source a renvoyé 403 pendant la vérification, donc le texte exact de licence et le fichier n'ont pas pu être contrôlés. | **Candidat à vérifier, non importable pour l'instant**. Obtenir le CSV et le texte de licence officiel; contrôler les graphies et les erreurs signalées. |
| Ukrainien `uk` | Publications des services régionaux du ministère de la Justice donnant des listes de prénoms enregistrés; les jeux ouverts consultés sur la natalité ne contiennent pas les prénoms. Wikidata peut compléter les libellés natifs. | Les articles officiels ne prouvent pas, à eux seuls, un droit de réutilisation en corpus. Le jeu ouvert de natalité ukrainien est sous CC BY, mais ne contient pas les noms. Wikidata structured data CC0. | **Pas de fichier source de prénoms réutilisable confirmé**. Ne pas recopier les listes d'articles comme corpus sans clarification; Wikidata reste un complément CC0 à vérifier. |
| Bengali `bn` | Wikidata pour les items de prénoms avec libellés bengalis; aucune banque officielle ou corpus natif avec licence de redistribution vérifiée n'a été confirmé pendant cette passe. | CC0 pour les données structurées Wikidata. Aucune licence de corpus tiers vérifiée. | **Pas de corpus officiel identifié**. Utiliser Wikidata uniquement comme amorce CC0, avec validation linguistique et contrôle de provenance. |

## Règles d'importation obligatoires

1. Une source et une version par fichier brut; URL stable et date d'accès conservées.
2. SHA-256 calculé sur les octets exacts téléchargés, avant toute transformation.
3. Notice de licence, attribution requise et obligations de partage à conserver avec le fichier.
4. Chaque entrée conserve `sourceId`, `sourceRecordId`, graphie originale, script, langue de contexte et référence de provenance.
5. Une translittération est une ligne distincte, liée explicitement au prénom natif; elle ne peut pas être marquée comme graphie native attestée.
6. Les homographes, variantes régionales et formes historiques ne sont pas fusionnés automatiquement.
7. Les statistiques de naissance ne sont importées que si la source et son contrat autorisent explicitement ces observations.
8. Les corpus CC BY-SA restent isolés jusqu'à décision sur la compatibilité de la licence avec la distribution de NameForge.
9. Les banques restent hors des générateurs publics jusqu'à validation juridique, technique et humaine.

## Références documentaires consultées

- EDRDG, licence des dictionnaires : https://www.edrdg.org/edrdg/licence.html
- EDRDG, documentation JMnedict : https://www.edrdg.org/pub/Nihongo/enamdict_doc.html
- Corée, service de statistiques des déclarations de naissance : https://efamily.scourt.go.kr/
- Wikidata, politique de licence : https://www.wikidata.org/wiki/Wikidata:Licensing
- NEN, jeu russe : https://huggingface.co/datasets/MentalTech/russian-given-names-nen
- Thaï, dépôt de prénoms : https://github.com/korkeatw/thai-names-corpus
- Inde, licence OGD : https://www.data.gov.in/Godl
- Israël, jeu officiel : https://data.gov.il/he/datasets/population_authority/firs-name
- Ukraine, jeu de natalité (ne contient pas les prénoms) : https://data.gov.ua/dataset/d8cc2022-424b-4e7e-9460-bb7bf7f77ad9
- Grèce, liste Wikidata : https://www.wikidata.org/wiki/Wikidata:WikiProject_Names/lists/Greek_first_names

