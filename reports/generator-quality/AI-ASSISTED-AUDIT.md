# NameForge — audit linguistique assisté par IA

**État : audit exploratoire terminé sur les sorties du 31 octobre 2026 ; corrections de données linguistiques en attente de validation compétente.**

Cet audit est une analyse assistée par IA des données et sorties réellement produites par le moteur local. Il ne constitue ni une certification humaine, ni une preuve qu'une formulation est idiomatique.

## Périmètre mesuré

- 234 générateurs × 28 langues = **6 552 scénarios**.
- **233 352 sorties non vides** observées sur trois seeds et 12 résultats par lot.
- Une file de relecture humaine distincte contient **840 exemples**, soit 30 par langue.
- Le moteur testé est local : cet audit n'ajoute aucun appel API à la génération des utilisateurs.

## Problème prioritaire confirmé : prénoms

Le générateur `baby_name` utilise actuellement le même tableau global `ATTESTED_BABY_NAMES` pour toutes les langues lorsque le générateur ne fournit pas de liste spécialisée. Les entrées sont principalement des formes françaises/latines (par exemple « Alexandre », « Hélène », « Raphaël »). L'audit retrouve ces formes dans les sorties des 28 langues, y compris arabe, japonais, coréen, chinois, hindi, thaï, hébreu et bengali.

Cela ne signifie pas que chaque prénom soit invalide dans ces langues : plusieurs prénoms sont internationaux ou partagés. En revanche, **le moteur ne dispose pas encore d'un répertoire localisé par langue** et ne doit pas laisser croire que chaque résultat est natif ou local à la langue sélectionnée.

Action recommandée : créer des listes de prénoms attestés et adaptées à chaque langue/région, avec graphie native, variantes de translittération, origine documentée et source vérifiable. Les entrées doivent être relues par des personnes compétentes avant d'être présentées comme locales ou certifiées. En attendant, ce point reste explicitement signalé comme limitation ; aucune traduction automatique improvisée n'est injectée dans la base.

## Signaux automatiques

Les signaux de répétition, de script Unicode et de forme latine dans un répertoire de prénoms non français servent à prioriser la relecture. Ils ne sont pas des verdicts : les emprunts, noms internationaux et écritures mixtes peuvent être parfaitement légitimes.

## Limites et statut

- Les taux de doublons et empreintes de préfixes/suffixes mesurent la diversité de surface, pas la qualité linguistique.
- L'IA peut proposer des corrections, mais ne remplace pas une personne compétente pour les nuances culturelles, les connotations, les usages régionaux et l'idiomaticité.
- Les **840 évaluations humaines sont toujours en attente**. Aucun score humain ni visa linguistique n'a été prérempli.
- Aucun appel à un service IA externe n'est nécessaire pour générer les noms sur le site.

## Prochaine correction de données

Priorité : répertoire `baby_name` localisé, puis audit approfondi des générateurs de marques/entreprises/startups et des banques de phrases à forte répétition. Toute donnée nouvelle doit rester dans le moteur local et passer les tests de non-régression.
