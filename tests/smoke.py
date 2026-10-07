#!/usr/bin/env python3
"""Smoke test de ODEA: valida sintaxis JS inline + invariantes clave.

Uso: python3 tests/smoke.py
Sale con código 0 si todo pasa, 1 si hay fallos.
No requiere dependencias (solo node y python3).
"""
import re, subprocess, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, "odea.html")
SW = os.path.join(ROOT, "sw.js")

fails = []
def check(name, ok):
    print(("  ✓ " if ok else "  ✗ ") + name)
    if not ok:
        fails.append(name)

html = open(HTML, encoding="utf-8").read()
sw = open(SW, encoding="utf-8").read()

# 1) Sintaxis del JS inline
tmp = os.path.join(os.environ.get("TMPDIR", "/tmp"), "odea_check.js")
scripts = re.findall(r"<script[^>]*>(.*?)</script>", html, re.DOTALL)
open(tmp, "w", encoding="utf-8").write("\n;\n".join(scripts))
r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
check("Sintaxis JS inline (node --check)", r.returncode == 0)

# 2) Símbolos clave existen
for sym in ["CAP_FRONTS", "capCompute", "renderCapital", "capToggleMission",
            "ENG_OBJ", "AI_OBJ", "CAPF_LADDER", "bovedaHTML", "exportSave", "importSave"]:
    check(f"Símbolo definido: {sym}", re.search(rf"\b{sym}\b", html) is not None)

# 3) Tres frentes del Imperio
m = re.search(r"const CAP_FRONTS = \[(.*?)\];", html, re.DOTALL)
check("CAP_FRONTS con cap/eng/ai", bool(m) and all(k in m.group(1) for k in ['k: "cap"', 'k: "eng"', 'k: "ai"']))

# 4) Sin etiquetas viejas de mundo "Capital"
check("Sin '📈 Capital' residual (UI)", '"📈 Capital"' not in html)
check("Sin 'Insignia … del Capital' residual (UI)", re.search(r'Insignia[^"]{0,40}del Capital', html) is None)

# 5) Versión coherente entre odea.html y sw.js
ver_html = sorted(set(re.findall(r"v(\d+\.\d+)", html)), key=lambda s: [int(x) for x in s.split(".")])
msw = re.search(r"CACHE_VERSION = 'odea-v([\d.]+)-", sw)
check("sw.js CACHE_VERSION presente", bool(msw))
if msw:
    check("Versión HTML y sw.js alineadas", msw.group(1) in ver_html)

# 6) Respaldos export/import conectados
check("Botones respaldo en HTML", 'id="btn-export"' in html and 'id="btn-import"' in html)
check("Funciones exportSave/importSave", "function exportSave" in html and "function importSave" in html)

print()
if fails:
    print(f"FALLÓ: {len(fails)} check(s):")
    for f in fails:
        print("  - " + f)
    sys.exit(1)
print("✅ Smoke test OK")
