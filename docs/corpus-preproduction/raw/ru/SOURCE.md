# Source snapshot — Russian given names (NEN)

- Language: Russian (`ru`)
- Script: Cyrillic (`Cyrl`)
- Upstream repository: https://github.com/mdanina/nen-imena-dataset
- Upstream revision: `38b3cad3aa123326be8bb97b0e9a3c0e5c7f54e6`
- Upstream path: `data/names.csv`
- Upstream Git blob SHA-1: `58478fe0d910ac400be6ba25022fcd1a7e932428`
- Raw file size: 873328 bytes
- SHA-256 of the exact decoded source bytes: `a8baa5aac8edf49ec317f3d6ba2556e3b12d63de883b2ee4150fd7ee57f62a77`
- Format: CSV, UTF-8 with BOM, comma-separated; multi-value fields use semicolon separators
- Dataset scope: 1,551 Russian given names (809 male, 742 female), according to upstream documentation
- Licence: Creative Commons Attribution 4.0 International (CC BY 4.0); see `LICENSE-NEN.txt`
- Required online attribution: **Данные: НЭН — сервис «Имена», [https://n-e-n.ru/imena/](https://n-e-n.ru/imena/)**

## Handling rules

1. Keep this file unchanged as the raw source snapshot.
2. Preserve the original Cyrillic `name` field as the native form.
3. Keep `international_forms` separate; those are not native-script attestations.
4. Do not treat `popularity_place` as a raw birth count: upstream describes it as a relative rank among newborn names from Moscow ZAGS data.
5. Do not merge spellings or diminutives automatically.
6. This snapshot is preproduction only. It is not connected to any public NameForge generator.
7. Retain the exact attribution above, including the working hyperlink wherever the data is shown online.

The upstream README and licence were checked at the pinned revision. The source's full licence notice is copied alongside this file.

## Structural validation performed on the staged CSV

- Parsed data rows (excluding header): **1,551**
- Distinct `name` spellings: **1,548**
- Repeated spellings with separate gender rows: **3** — Айнур (m/f), Адель (m/f), Фирдаус (f/m)
- Empty `name` fields: **0**
- Names containing Cyrillic letters and no Latin letters in the `name` field: **1,551 / 1,551**
- Human linguistic review: **not performed yet**

The three repeated spellings must remain distinct source records because their gender field differs. This check validates CSV structure and the declared Unicode script only; it does not establish etymology, cultural suitability, or naturalness.
