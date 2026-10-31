#!/usr/bin/env python3
"""Optional, local-only linguistic audit adapters for NameForge.

Input: JSON Lines on stdin. Each row is an object with name, language and
optional description. Output: one JSON report per row on stdout.
No adapter certifies naturalness. Findings are review signals with provenance.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import subprocess
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

LANG_MAP = {
    "en": "en_US", "fr": "fr_FR", "de": "de_DE", "es": "es_ES",
    "it": "it_IT", "pt": "pt_PT", "nl": "nl_NL", "ru": "ru_RU",
    "ar": "ar", "tr": "tr_TR", "pl": "pl_PL", "sv": "sv_SE",
}
DEFAULT_PATTERNS = [
    (r"(.)\1{3,}", "long_repeated_character_run"),
    (r"[\u0000-\u001f\u007f]", "control_character"),
    (r"[\u200b\u200e\u200f\u202a-\u202e\u2060-\u206f]", "invisible_or_directional_control"),
]


def finding(tool: str, code: str, message: str, severity: str = "review") -> dict[str, str]:
    return {"tool": tool, "code": code, "message": message, "severity": severity}


def load_json(path: str | None, default: Any) -> Any:
    if not path:
        return default
    with open(path, encoding="utf-8") as stream:
        return json.load(stream)


class Audit:
    def __init__(self, args: argparse.Namespace):
        self.args = args
        self.cache: dict[str, Any] = {}
        self.patterns = load_json(args.patterns, DEFAULT_PATTERNS)
        self.hunspell_dict_dir = Path(args.hunspell_dict_dir) if args.hunspell_dict_dir else None
        self.fasttext_model = args.fasttext_model
        self.languagetool_url = args.languagetool_url.rstrip("/")
        self.nltk_corpus = args.nltk_corpus

    def adapter_status(self) -> dict[str, Any]:
        return {
            "hunspell": {"available": bool(__import__("shutil").which("hunspell"))},
            "languagetool": {"available": self._url_available(self.languagetool_url + "/v2/languages")},
            "icu": {"available": importlib.util.find_spec("icu") is not None},
            "nltk": {"available": importlib.util.find_spec("nltk") is not None},
            "fasttext": {"available": importlib.util.find_spec("fasttext") is not None and bool(self.fasttext_model)},
            "hyperscan": {"available": importlib.util.find_spec("hyperscan") is not None},
        }

    @staticmethod
    def _url_available(url: str) -> bool:
        try:
            with urllib.request.urlopen(url, timeout=1.5) as response:
                return response.status == 200
        except (urllib.error.URLError, TimeoutError, OSError):
            return False

    def run(self, record: dict[str, Any]) -> dict[str, Any]:
        name = str(record.get("name", "")).strip()
        language = str(record.get("language", "und")).lower()
        description = str(record.get("description", "")).strip()
        findings: list[dict[str, str]] = []
        results: dict[str, Any] = {}
        started = time.perf_counter_ns()

        if not name:
            findings.append(finding("pipeline", "empty_name", "No name supplied.", "error"))
        else:
            results["icu"] = self.icu(name, language, findings)
            results["hunspell"] = self.hunspell(name, language, findings)
            results["languagetool"] = self.languagetool(description, language, findings)
            results["nltk"] = self.nltk(name, language, findings)
            results["fasttext"] = self.fasttext(name, language, findings)
            results["hyperscan"] = self.hyperscan(name, findings)

        return {
            "schema_version": 1,
            "input": {"name": name, "language": language, "description": description or None},
            "findings": findings,
            "adapters": results,
            "elapsed_ms": round((time.perf_counter_ns() - started) / 1_000_000, 3),
            "interpretation": "Signals for human review only; no naturalness or cultural-validity score is inferred.",
        }

    def icu(self, name: str, language: str, findings: list[dict]) -> dict:
        try:
            import icu  # type: ignore
            nfc = str(icu.Normalizer2.getNFCInstance().normalize(name))
            locale = icu.Locale(language)
            iterator = icu.BreakIterator.createCharacterInstance(locale)
            iterator.setText(nfc)
            boundaries = []
            pos = iterator.first()
            while pos != icu.BreakIterator.DONE:
                boundaries.append(pos)
                pos = iterator.nextBoundary()
            return {"available": True, "provider": "PyICU", "locale": str(locale),
                    "nfc": nfc, "grapheme_boundary_count": max(0, len(boundaries) - 1)}
        except ImportError:
            fallback = unicodedata.normalize("NFC", name)
            if fallback != name:
                findings.append(finding("icu", "unicode_normalization_changed",
                                        "Python Unicode NFC fallback changed the comparison form."))
            return {"available": False, "fallback": "python-unicodedata",
                    "nfc": fallback, "note": "ICU locale segmentation unavailable."}
        except Exception as exc:
            findings.append(finding("icu", "adapter_error", f"ICU adapter error: {type(exc).__name__}."))
            return {"available": True, "error": type(exc).__name__}

    def hunspell(self, name: str, language: str, findings: list[dict]) -> dict:
        import shutil
        executable = shutil.which("hunspell")
        dictionary = (self.hunspell_dict_dir / (LANG_MAP.get(language, language) + ".dic")
                      if self.hunspell_dict_dir else None)
        if not executable:
            return {"available": False, "reason": "hunspell executable not installed"}
        if not dictionary or not dictionary.is_file():
            return {"available": True, "configured": False, "reason": "explicit language dictionary missing"}
        try:
            proc = subprocess.run([executable, "-d", str(dictionary.with_suffix(""))],
                                  input=name + "\n", capture_output=True, text=True,
                                  timeout=3, check=False)
            lines = [line for line in proc.stdout.splitlines() if line.startswith(("*", "&", "#", "?"))]
            if lines:
                findings.append(finding("hunspell", "not_in_dictionary",
                    "Name is absent from the selected spelling dictionary; proper names and transliterations are often omitted."))
            return {"available": True, "configured": True, "dictionary": dictionary.name,
                    "exit_code": proc.returncode, "dictionary_response": lines[:5]}
        except (OSError, subprocess.TimeoutExpired) as exc:
            findings.append(finding("hunspell", "adapter_error", f"Hunspell error: {type(exc).__name__}."))
            return {"available": True, "configured": True, "error": type(exc).__name__}

    def languagetool(self, description: str, language: str, findings: list[dict]) -> dict:
        if not description:
            return {"available": self._url_available(self.languagetool_url + "/v2/languages"),
                    "skipped": True, "reason": "no description; isolated names are not grammar-checked"}
        payload = urllib.parse.urlencode({"text": description, "language": language}).encode()
        request = urllib.request.Request(self.languagetool_url + "/v2/check", data=payload)
        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                data = json.loads(response.read().decode("utf-8"))
            matches = [{"message": x.get("message", ""),
                        "rule_id": x.get("rule", {}).get("id"),
                        "offset": x.get("offset"), "length": x.get("length")}
                       for x in data.get("matches", [])]
            for match in matches:
                findings.append(finding("languagetool", "description_language_issue",
                                        match["message"] or "Potential description issue."))
            return {"available": True, "match_count": len(matches), "matches": matches[:20]}
        except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
            findings.append(finding("languagetool", "adapter_error",
                                    f"Local LanguageTool request failed: {type(exc).__name__}."))
            return {"available": False, "error": type(exc).__name__}

    def nltk(self, name: str, language: str, findings: list[dict]) -> dict:
        try:
            import nltk  # type: ignore
            tokens = nltk.tokenize.wordpunct_tokenize(name)
            result: dict[str, Any] = {"available": True, "tokens": tokens,
                                      "token_count": len(tokens), "corpus": self.nltk_corpus}
            if self.nltk_corpus:
                try:
                    corpus = nltk.corpus.words.words(self.nltk_corpus)
                    vocabulary = set(w.casefold() for w in corpus)
                    result["corpus_membership"] = [t.casefold() in vocabulary for t in tokens]
                    result["corpus_note"] = "Corpus membership is not a name-validity test."
                except LookupError:
                    result["corpus_available"] = False
                    findings.append(finding("nltk", "corpus_missing",
                                            "Configured NLTK corpus is not installed locally."))
            return result
        except ImportError:
            return {"available": False, "reason": "NLTK not installed"}
        except Exception as exc:
            findings.append(finding("nltk", "adapter_error", f"NLTK error: {type(exc).__name__}."))
            return {"available": True, "error": type(exc).__name__}

    def fasttext(self, name: str, language: str, findings: list[dict]) -> dict:
        if not self.fasttext_model:
            return {"available": False, "reason": "set NAMEFORGE_FASTTEXT_MODEL to a local model"}
        try:
            import fasttext  # type: ignore
            model = self.cache.get("fasttext_model")
            if model is None:
                model = fasttext.load_model(self.fasttext_model)
                self.cache["fasttext_model"] = model
            labels, scores = model.predict(name.replace("\n", " "), k=3)
            predictions = [{"label": l.removeprefix("__label__"), "confidence": round(float(s), 5)}
                           for l, s in zip(labels, scores)]
            top = predictions[0] if predictions else None
            if top and top["confidence"] >= self.args.fasttext_threshold and language != "und":
                if top["label"].split("_")[0] != language:
                    findings.append(finding("fasttext", "possible_language_mismatch",
                        "Short-name language classification disagrees with the requested language; confidence is not proof."))
            return {"available": True, "model": self.fasttext_model, "predictions": predictions,
                    "minimum_confidence_for_signal": self.args.fasttext_threshold,
                    "warning": "Short names are intrinsically difficult to classify."}
        except ImportError:
            return {"available": False, "reason": "fasttext Python package not installed"}
        except Exception as exc:
            findings.append(finding("fasttext", "adapter_error", f"fastText error: {type(exc).__name__}."))
            return {"available": True, "error": type(exc).__name__}

    def hyperscan(self, name: str, findings: list[dict]) -> dict:
        try:
            import hyperscan  # type: ignore
            db = hyperscan.Database()
            expressions = [p[0].encode("utf-8") for p in self.patterns]
            ids = list(range(1, len(expressions) + 1))
            flags = [hyperscan.HS_FLAG_UTF8 | hyperscan.HS_FLAG_UCP for _ in expressions]
            db.compile(expressions=expressions, ids=ids, flags=flags)
            matches = []
            def on_match(identifier, from_, to, flags, context):
                matches.append({"pattern": self.patterns[identifier - 1][1], "start": from_, "end": to})
            db.scan(name.encode("utf-8"), match_event_handler=on_match)
            for match in matches:
                findings.append(finding("hyperscan", match["pattern"],
                                        "Configured structural pattern matched; inspect manually."))
            return {"available": True, "pattern_count": len(expressions), "matches": matches}
        except ImportError:
            # A stdlib fallback keeps the audit useful but is clearly labelled.
            matches = []
            for pattern, label in self.patterns:
                if re.search(pattern, name):
                    matches.append(label)
                    findings.append(finding("hyperscan-fallback", label,
                                            "Python regex fallback matched; Hyperscan itself is not installed."))
            return {"available": False, "fallback": "python-re",
                    "matches": matches, "pattern_count": len(self.patterns)}
        except Exception as exc:
            findings.append(finding("hyperscan", "adapter_error", f"Hyperscan error: {type(exc).__name__}."))
            return {"available": True, "error": type(exc).__name__}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--hunspell-dict-dir", default=os.getenv("HUNSPELL_DICT_DIR"))
    parser.add_argument("--languagetool-url", default=os.getenv("LANGUAGETOOL_URL", "http://127.0.0.1:8010"))
    parser.add_argument("--fasttext-model", default=os.getenv("NAMEFORGE_FASTTEXT_MODEL"))
    parser.add_argument("--fasttext-threshold", type=float, default=0.80)
    parser.add_argument("--nltk-corpus", default=os.getenv("NAMEFORGE_NLTK_CORPUS"))
    parser.add_argument("--patterns", default=os.getenv("NAMEFORGE_HYPERSCAN_PATTERNS"))
    parser.add_argument("--status", action="store_true", help="print adapter availability and exit")
    args = parser.parse_args()
    audit = Audit(args)
    if args.status:
        print(json.dumps(audit.adapter_status(), ensure_ascii=False, indent=2))
        return 0
    count = 0
    for line_number, line in enumerate(sys.stdin, 1):
        if not line.strip():
            continue
        try:
            record = json.loads(line)
            if not isinstance(record, dict):
                raise ValueError("each JSONL row must be an object")
            print(json.dumps(audit.run(record), ensure_ascii=False))
            count += 1
        except (json.JSONDecodeError, ValueError) as exc:
            print(json.dumps({"line": line_number, "error": str(exc)}), file=sys.stderr)
            return 2
    if count == 0:
        print("No JSONL records received.", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
