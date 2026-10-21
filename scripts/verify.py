"""Check source preservation, documented bug fixes, anchors and JS syntax."""
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
errors = []
original_count = 0
patched_files = []
snapshot = json.loads((ROOT / "scripts/upstream-hashes.json").read_text(encoding="utf-8"))
fixes_path = ROOT / "scripts/approved-fixes.json"
fixes = json.loads(fixes_path.read_text(encoding="utf-8")).get("files", {}) if fixes_path.exists() else {}
for relative, expected in snapshot["files"].items():
    original_count += 1
    target = DIST / relative
    if not target.is_file():
        errors.append(f"Missing upstream file: {relative}")
        continue
    actual = target.read_bytes()
    if target.name == "index.html" and (target.parent == DIST or target.parent.name.startswith("lesson-")):
        actual_text = actual.decode("utf-8").replace("\r\n", "\n")
        actual_text = re.sub(r'<link[^>]*data-learning-extension[^>]*>\n?', '', actual_text)
        actual_text = re.sub(r'<script[^>]*data-learning-extension[^>]*></script>\n?', '', actual_text)
        actual = actual_text.encode("utf-8")
    if hashlib.sha256(actual).hexdigest() != expected:
        fix = fixes.get(relative, {})
        fixed_hash = hashlib.sha256(actual.replace(b"\r\n", b"\n")).hexdigest()
        if fix.get("upstream_sha256") == expected and fix.get("sha256") == fixed_hash and fix.get("reason"):
            patched_files.append(relative)
        else:
            errors.append(f"Unexpected original file edits: {relative}")

index = json.loads((DIST / "learning/search-index.json").read_text(encoding="utf-8"))
if len(index["sections"]) != 27:
    errors.append(f"Expected 27 sections; found {len(index['sections'])}")
for section in index["sections"]:
    url, anchor = section["url"].split("#", 1)
    body = (DIST / url / "index.html").read_text(encoding="utf-8")
    if f'id="{anchor}"' not in body or not section["title"] or not section["text"]:
        errors.append(f"Invalid index entry: {section['id']}")
for required in ["tools.js", "tools.css", "store.js", "exercises.js", "lab/index.html", "lab/lab.js", "lab/lab.css"]:
    if not (DIST / "learning" / required).is_file():
        errors.append(f"Missing extension file: {required}")
scripts = list((DIST / "learning").rglob("*.js")) + [DIST / path for path in patched_files if path.endswith(".js")]
for script in scripts:
    result = subprocess.run(["node", "--check", str(script)], capture_output=True, text=True, encoding="utf-8")
    if result.returncode:
        errors.append(result.stderr)
if errors:
    raise SystemExit("\n".join(errors))
print(f"PASS: {original_count} upstream files accounted for ({len(patched_files)} documented fixes), 27 search anchors valid, extension files present, JavaScript syntax valid.")
