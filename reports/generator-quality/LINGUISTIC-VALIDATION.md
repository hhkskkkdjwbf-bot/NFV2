# NameForge — protocole de validation linguistique ciblée

## Échantillon
30 couples générateur/langue prioritaires, sélectionnés depuis la matrice technique en privilégiant un générateur différent par ligne. Le CSV contient 984 sorties réelles issues du deep-dive, avec seed et rang.

## Évaluation humaine
Pour chaque nom, noter de 1 à 5 :
- **Naturalité** : ressemble-t-il à un nom qu’un locuteur natif pourrait réellement employer ?
- **Adéquation catégorie** : correspond-il au type de nom attendu (marque, personnage, lieu, etc.) ?
- **Adéquation linguistique** : orthographe, morphologie, accents et conventions adaptés à la langue ?
- **Lisibilité** : prononçable, mémorisable et facile à lire ?

Ajouter une note libre en cas de mot involontairement offensant, ambigu, déjà connu, culturellement inadapté ou grammaticalement incorrect. Ne pas noter une langue que le relecteur ne maîtrise pas.

## Interprétation
- 1–2 : problème manifeste ; conserver un exemple et expliquer le problème.
- 3 : acceptable mais perfectible.
- 4–5 : bon résultat.

Ne pas conclure à un défaut sur la seule base d’un préfixe/suffixe ou d’un script mixte.

## Décision de correction
Une correction du moteur ne sera proposée que si plusieurs exemples convergent, si le problème est reproductible avec le même générateur/langue, et si un locuteur compétent confirme le défaut. Les changements devront ensuite être testés contre la baseline pour éviter les régressions.
