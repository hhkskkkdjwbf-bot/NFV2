# NameForge — protocole de validation linguistique humaine

## Portée et échantillon

Le contrôle automatique couvre 234 générateurs × 28 langues, soit 6 552 scénarios. Pour distinguer les doublons d'un lot visible des répétitions entre exécutions indépendantes, l'audit mesure désormais l'unicité à l'intérieur de chaque lot de 12 noms. Le chevauchement entre graines est conservé séparément, car les tests déterministes désactivent l'historique récent. Ces mesures ne constituent pas une validation linguistique.

Le workflow génère un fichier de relecture avec 30 sorties réelles par langue (840 noms au total), réparties entre plusieurs générateurs lorsque les données le permettent. Le CSV est produit dans l'artefact GitHub Actions `nameforge-generator-quality-baseline`, sous `artifacts/linguistic-human-review/review-queue-28-languages.csv`.

Cet échantillon sert à détecter des problèmes représentatifs. Il ne certifie pas chaque sortie, ni chaque scénario de la matrice.

## Qui peut noter ?

Un relecteur ne doit évaluer que les langues qu'il maîtrise suffisamment pour juger l'usage courant, la grammaire, la morphologie et les connotations culturelles. Une validation dite « native » doit être confirmée par le relecteur lui-même ; ne jamais déduire son niveau de compétence.

## Grille par nom

Noter de 1 à 5 :
- **Naturalité** : un locuteur compétent pourrait-il réellement employer ce nom ?
- **Adéquation à la catégorie** : correspond-il au générateur (marque, personnage, lieu, etc.) ?
- **Correction linguistique** : orthographe, morphologie, grammaire et conventions typographiques.
- **Lisibilité** : prononçable, mémorisable et facile à lire.

Consigner tout mot offensant, ambigu, involontairement comique, culturellement inadapté, grammaticalement incorrect ou déjà associé à une marque/personne connue. Ajouter une proposition de correction si possible.

## Signaux automatiques

Les colonnes `unicode_scripts` et `automatic_review_signals` servent uniquement à attirer l'attention. Elles ne constituent pas des verdicts. Les emprunts, translittérations et écritures mixtes peuvent être légitimes. Le japonais peut combiner Han, Hiragana et Katakana.

## Décision et suivi

1. Ne pas modifier le moteur sur la base d'un seul exemple isolé.
2. Regrouper les problèmes reproductibles par générateur et langue.
3. Faire confirmer les problèmes linguistiques par un relecteur compétent.
4. Corriger les règles ou données concernées sans remplacer arbitrairement une langue par l'anglais.
5. Relancer TypeScript, tests de régression, baseline 234 × 28, Playwright, Lighthouse et contrôle après déploiement.
6. Conserver la décision, la correction, le relecteur, sa compétence déclarée et la date de validation.

## Statut honnête

La création de l'échantillon et les contrôles automatisés ne valent pas validation humaine. Une langue ne peut être marquée « validée » qu'après relecture réelle et signature du relecteur compétent. Les 28 langues restent en attente tant que ces retours ne sont pas recueillis.
