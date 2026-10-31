# Registre de validation par langue

Le fichier généré `language-signoff.csv` contient une ligne par langue. Le statut reste `pending` tant qu'un relecteur compétent n'a pas évalué les échantillons et signé la décision.

Champs attendus :
- identifiant/alias du relecteur ;
- compétence déclarée et variante/dialecte évalué ;
- nombre d'échantillons réellement relus ;
- nombre approuvé, à corriger et bloqué ;
- date et statut final.

Valeurs autorisées pour `signoff_status` : `pending`, `in_review`, `needs_revision`, `approved`, `blocked`.

Ne pas déclarer une langue approuvée si les échantillons ne sont pas tous traités ou si un problème bloquant reste ouvert. La signature doit être donnée par le relecteur, pas générée automatiquement.
