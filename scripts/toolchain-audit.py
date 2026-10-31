#!/usr/bin/env python3
"""Report optional local NameForge linguistic tools without installing anything."""
from __future__ import annotations

import importlib.util
import json
import os
import shutil
import urllib.error
import urllib.request
from datetime import datetime, timezone


def command_version(command: str, args: list[str]) -> dict:
    path = shutil.which(command)
    if not path:
        return {"available": False, "path": None}
    import subprocess
    try:
        result = subprocess.run(
            [path, *args], capture_output=True, text=True, timeout=5, check=False
        )
        output = (result.stdout or result.stderr).strip().splitlines()
        return {"available": True, "path": path, "version": output[0][:200] if output else "installed"}
    except (OSError, subprocess.TimeoutExpired):
        return {"available": True, "path": path, "version": "version-check-unavailable"}


def module_status(module: str) -> dict:
    spec = importlib.util.find_spec(module)
    return {"available": spec is not None, "module": module}


def language_tool_status() -> dict:
    base = os.environ.get("LANGUAGETOOL_URL", "http://127.0.0.1:8010")
    url = base.rstrip("/") + "/v2/languages"
    try:
        with urllib.request.urlopen(url, timeout=2) as response:
            return {"available": response.status == 200, "endpoint": base, "mode": "local-server"}
    except (urllib.error.URLError, TimeoutError, OSError):
        return {"available": False, "endpoint": base, "mode": "local-server"}


def main() -> None:
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "policy": "Optional offline analyzers; absence does not block generation.",
        "tools": {
            "hunspell": command_version("hunspell", ["-v"]),
            "languagetool_local_server": language_tool_status(),
            "icu_python_binding": module_status("icu"),
            "nltk": module_status("nltk"),
            "fasttext": module_status("fasttext"),
            "hyperscan": module_status("hyperscan"),
            "rust_cargo": command_version("cargo", ["--version"]),
        },
    }
    present = sum(bool(item.get("available")) for item in report["tools"].values())
    report["summary"] = {
        "available_optional_components": present,
        "detected_components": len(report["tools"]),
        "note": "Detection is not proof of configured dictionaries, models, rules, or integration.",
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
