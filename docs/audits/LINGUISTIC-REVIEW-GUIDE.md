# NameForge — guide de relecture linguistique humaine

## Objet

Ce protocole accompagne la file de 840 échantillons issue de l'audit : 30 échantillons par langue pour les 28 langues prises en charge. Les résultats automatiques ne mesurent ni la naturalité réelle ni la pertinence culturelle. La relecture humaine est obligatoire avant toute promotion d'un corpus ou d'une règle de génération.

## Compétences attendues

- Relecteur natif ou professionnellement compétent dans la langue évaluée.
- Pour les prénoms et noms propres : expérience en onomastique, linguistique, édition ou documentation de noms, lorsque possible.
- Pour les marques, boutiques, entreprises et startups : expérience de rédaction, de naming ou de communication dans le marché linguistique visé.
- Le relecteur doit pouvoir identifier les limites de sa compétence régionale et les signaler.

## Échelle commune

| Note | Naturalité / adéquation / langue / lisibilité |
|---:|---|
| 1 | Incorrect, incompréhensible, offensant ou manifestement artificiel |
| 2 | Très maladroit ; formulation ou morphologie peu crédible |
| 3 | Compréhensible mais peu naturel ou insuffisamment adapté à la catégorie |
| 4 | Naturel et adapté ; défaut mineur éventuel |
| 5 | Très naturel, idiomatique, lisible et pertinent |

Les quatre colonnes de notation du CSV sont indépendantes : naturalité, adéquation à la catégorie, adéquation linguistique et lisibilité. Ne donnez pas une bonne note à un nom simplement parce qu'il est original.

## Contrôles obligatoires pour chaque échantillon

1. **Graphie et alphabet** — écriture conforme à la langue et à la variante annoncée ; aucun mélange accidentel de scripts.
2. **Phonétique** — prononciation plausible, séquence de sons acceptable, rythme naturel.
3. **Morphologie et grammaire** — accords, suffixes, flexion, ordre des éléments et conventions de formation des noms.
4. **Naturalité** — le nom pourrait-il être utilisé par un locuteur réel dans ce contexte ?
5. **Adéquation à la catégorie** — une marque doit sonner comme une marque ; un nom de personnage comme un nom de personnage.
6. **Connotations** — sens involontaire, homophone, vulgarité, insulte, connotation religieuse/politique sensible ou référence culturelle problématique.
7. **Variante régionale** — préciser le pays, la région ou le registre lorsque le jugement varie.

## Règles de décision

- **Accepté** : aucune erreur majeure ; notes linguistique et naturalité généralement ≥ 4.
- **À corriger** : idée exploitable mais graphie, phonétique, morphologie ou adéquation à améliorer. Décrire la correction proposée.
- **Rejeté** : erreur linguistique importante, nom trompeur, connotation problématique ou manque de naturel non réparable.
- **À escalader** : sens ou contexte incertain ; demander un second avis au lieu de deviner.

Tout signal offensant ou culturel doit recevoir une explication contextuelle. Ne pas inscrire de données personnelles sur les personnes citées comme exemples.

## Double relecture et arbitrage

Pour les langues natives non latines et les variantes régionales, privilégier deux avis indépendants. Faire arbitrer tout écart supérieur à deux points ou tout désaccord sur un risque offensant. Conserver les décisions, la variante évaluée, la date et un identifiant de relecteur non sensible.

## Interdictions

- Ne pas inventer d'étymologie ou d'origine.
- Ne pas transformer une translittération en forme native.
- Ne pas traiter une absence de correspondance dans un lexique comme une preuve d'innocuité.
- Ne pas intégrer un échantillon dans les générateurs publics sur la seule base d'un score automatique.
- Ne pas publier un corpus dont la source, la licence ou l'attribution ne sont pas établies.

## Fichier de travail

La file CSV de 840 échantillons contient les champs de notation et de commentaire. Garder l'identifiant de l'échantillon et les colonnes source intactes ; ajouter les évaluations dans une copie de travail afin de conserver l'original.
