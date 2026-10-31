#!/usr/bin/env python3
"""Reproducible NEN Russian native-name conversion; preproduction only."""
from __future__ import annotations
import argparse, csv, hashlib, io, json, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = ROOT / "docs/corpus-preproduction/raw/ru/names.csv"
DEFAULT_OUTPUT = ROOT / "docs/corpus-preproduction/staged/ru"
EXPECTED_SHA256 = "a8baa5aac8edf49ec317f3d6ba2556e3b12d63de883b2ee4150fd7ee57f62a77"
SOURCE_RELEASE = "38b3cad3aa123326be8bb97b0e9a3c0e5c7f54e6"
SOURCE_ATTRIBUTION = "Данные: НЭН — сервис «Имена», https://n-e-n.ru/imena/"

def is_cyrillic_name(value: str) -> bool:
    letters = [c for c in value if c.isalpha()]
    return bool(letters) and all("CYRILLIC" in unicodedata.name(c, "") for c in letters)

def split_source_list(value: str) -> list[str]:
    return [x.strip() for x in (value or "").split(";") if x.strip()]

def transform_rows(rows: list[dict[str, str]], source_sha256: str = EXPECTED_SHA256) -> list[dict]:
    if source_sha256 != EXPECTED_SHA256:
        raise ValueError("Raw source checksum is not the pinned NEN snapshot")
    seen, records = set(), []
    for line, row in enumerate(rows, start=2):
        name, slug = (row.get("name") or "").strip(), (row.get("slug") or "").strip()
        gender = (row.get("gender") or "").strip().lower()
        if not name or not slug: raise ValueError(f"Row {line}: name and slug are required")
        if gender not in {"m", "f"}: raise ValueError(f"Row {line}: invalid gender {gender!r}")
        if not is_cyrillic_name(name): raise ValueError(f"Row {line}: native spelling is not Cyrillic-only: {name!r}")
        if slug in seen: raise ValueError(f"Row {line}: duplicate source slug {slug!r}")
        seen.add(slug)
        records.append({
            "schemaVersion": 1, "id": f"nen-ru-{slug}", "sourceId": "nen-ru-names",
            "sourceRecordId": slug, "displayName": name, "recordKind": "native-name-attestation",
            "languageContext": "ru", "script": "Cyrl",
            "sourceGender": "male" if gender == "m" else "female",
            "sourceOrigin": (row.get("origin") or "").strip(),
            "sourceMeaning": (row.get("meaning") or "").strip(),
            "sourceShortForms": split_source_list(row.get("short_forms", "")),
            "sourceInternationalForms": split_source_list(row.get("international_forms", "")),
            "sourceUrl": (row.get("url") or "").strip() or f"https://n-e-n.ru/imena/imya/{slug}/",
            "release": SOURCE_RELEASE, "sourceFileSha256": source_sha256,
            "attribution": SOURCE_ATTRIBUTION, "nativeScriptAttested": True,
            "runtimeEligible": False, "humanReviewStatus": "pending"
        })
    return records

def build_outputs(input_path: Path):
    raw = input_path.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if digest != EXPECTED_SHA256: raise ValueError(f"Unexpected source SHA-256: {digest}")
    rows = list(csv.DictReader(io.StringIO(raw.decode("utf-8-sig"), newline="")))
    records = transform_rows(rows, digest)
    counts = (len(records), sum(r["sourceGender"] == "male" for r in records),
              sum(r["sourceGender"] == "female" for r in records),
              len({r["displayName"] for r in records}))
    if counts != (1551, 809, 742, 1548): raise ValueError(f"Pinned source audit mismatch: {counts}")
    jsonl = ("\n".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) for r in records) + "\n").encode("utf-8")
    short_forms = sum(bool(r["sourceShortForms"]) for r in records)
    international_forms = sum(bool(r["sourceInternationalForms"]) for r in records)
    report = f"""# Russian NEN preproduction conversion

- Source: [NEN names dataset](https://github.com/mdanina/nen-imena-dataset)
- Pinned revision: `{SOURCE_RELEASE}`
- Raw source SHA-256: `{digest}`
- Licence: CC BY 4.0; required online attribution: [Данные: НЭН — сервис «Имена»](https://n-e-n.ru/imena/)
- Native-script records: **{len(records):,}**
- Distinct native spellings: **{counts[3]:,}**
- Source gender rows: **{counts[1]} male / {counts[2]} female**
- Records with source short forms: **{short_forms}**
- Records with international forms: **{international_forms}**

Native Cyrillic spellings are preserved separately from source short forms and international forms. International forms are not automatically labelled as transliterations because the upstream column does not make that claim. Homographs remain separate source records where source IDs or gender differ. Popularity ranks are not converted to birth counts.

**Human linguistic review is pending. This is preproduction only and is not connected to any public NameForge generator.**
""".encode("utf-8")
    return jsonl, report

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    p.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    p.add_argument("--check-only", action="store_true")
    a = p.parse_args()
    jsonl, report = build_outputs(a.input)
    expected = {"names.jsonl": jsonl, "README.md": report}
    if a.check_only:
        for name, data in expected.items():
            path = a.output_dir / name
            if not path.exists() or path.read_bytes() != data:
                raise SystemExit(f"Stale or missing output: {path}")
        print("Russian preproduction files match the pinned source.")
        return
    a.output_dir.mkdir(parents=True, exist_ok=True)
    for name, data in expected.items():
        (a.output_dir / name).write_bytes(data)
    sums = "".join(f"{hashlib.sha256(data).hexdigest()}  {name}\n" for name, data in expected.items())
    (a.output_dir / "SHA256SUMS").write_text(sums, encoding="utf-8")
    print(json.dumps({"records": len(jsonl.splitlines()), "jsonlSha256": hashlib.sha256(jsonl).hexdigest()}))

if __name__ == "__main__": main()
