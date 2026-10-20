#!/usr/bin/env node
/**
 * Smoke test de ODEA (versión Node, sin dependencias).
 *
 * Uso: node tests/smoke.mjs
 * Sale con código 0 si todo pasa, 1 si hay fallos.
 *
 * Es el equivalente a tests/smoke.py pero solo requiere Node 18+,
 * y añade comprobaciones de estructura, assets y accesibilidad.
 */
import { readFileSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HTML_PATH = join(ROOT, 'odea.html');
const SW_PATH = join(ROOT, 'sw.js');

const html = readFileSync(HTML_PATH, 'utf8');
const sw = readFileSync(SW_PATH, 'utf8');
const fails = [];

function check(name, ok, detail = '') {
  console.log(`${ok ? '  ✓' : '  ✗'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

// ---------- 1) Sintaxis del JS inline ----------
const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
const tmp = mkdtempSync(join(tmpdir(), 'odea-'));
try {
  let allOk = true;
  inlineScripts.forEach((code, i) => {
    const file = join(tmp, `script-${i}.js`);
    writeFileSync(file, code, 'utf8');
    try {
      execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    } catch (e) {
      allOk = false;
      console.log(`\n${e.stderr?.toString() ?? e.message}`);
    }
  });
  check(`Sintaxis JS inline (${inlineScripts.length} bloque/s)`, allOk);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// ---------- 2) Símbolos clave ----------
for (const sym of ['CAP_FRONTS', 'capCompute', 'renderCapital', 'capToggleMission',
                   'ENG_OBJ', 'AI_OBJ', 'CAPF_LADDER', 'bovedaHTML', 'exportSave', 'importSave']) {
  check(`Símbolo definido: ${sym}`, new RegExp(`\\b${sym}\\b`).test(html));
}

// ---------- 3) Tres frentes del Imperio ----------
const fronts = /const CAP_FRONTS = \[([\s\S]*?)\];/.exec(html);
check('CAP_FRONTS con cap/eng/ai',
  !!fronts && ['k: "cap"', 'k: "eng"', 'k: "ai"'].every((k) => fronts[1].includes(k)));

// ---------- 4) Etiquetas viejas ----------
check('Sin "💰 Capital" residual (UI)', !html.includes('"💰 Capital"'));
check('Sin "Insignia … del Capital" residual (UI)', !/Insignia[^"]{0,40}del Capital/.test(html));

// ---------- 5) Versión coherente ----------
const verHtml = [...html.matchAll(/v(\d+\.\d+)/g)].map((m) => m[1]);
const swVer = /CACHE_VERSION = 'odea-v([\d.]+)-/.exec(sw);
check('sw.js CACHE_VERSION presente', !!swVer);
if (swVer) check('Versión HTML y sw.js alineadas', verHtml.includes(swVer[1]),
  `html: ${[...new Set(verHtml)].join(', ')} / sw: ${swVer[1]}`);

// ---------- 6) Respaldos conectados ----------
check('Botones de respaldo en HTML', html.includes('id="btn-export"') && html.includes('id="btn-import"'));
check('Funciones exportSave/importSave', html.includes('function exportSave') && html.includes('function importSave'));

// ---------- 7) Estructura del documento ----------
const count = (re, s = html) => (s.match(re) || []).length;
check('Un solo <h1>', count(/<h1[\s>]/g) === 1);
check('<main> presente', /<main[\s>]/.test(html));
check('HTML de assets modificables sin .png sueltos',
  !/assets\/[^"']+\.png/.test(html));

// ---------- 8) IDs duplicados en el DOM real ----------
const dom = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<!--[\s\S]*?-->/g, '');
const ids = [...dom.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dupIds = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
check('Sin IDs duplicados en el DOM', dupIds.length === 0, dupIds.join(', '));

// ---------- 9) El shell del service worker existe ----------
const shellBlock = /const SHELL = \[([\s\S]*?)\];/.exec(sw);
const shellUrls = shellBlock
  ? [...shellBlock[1].matchAll(/'(\.\/[^']*)'/g)].map((m) => m[1].replace(/^\.\//, '').split('?')[0])
  : [];
const missing = shellUrls.filter((u) => u && u !== '' && !existsSync(join(ROOT, u)));
check(`Assets del SW existen (${shellUrls.length})`, missing.length === 0, missing.join(', '));

// ---------- 10) Contenido del plan ----------
const days = new Set([...html.matchAll(/\bday:(\d+),/g)].map((m) => Number(m[1])));
check('56 días de misiones diarias', days.size === 56, `${days.size} días`);
check('Sin referencias al día 60', !/\b(46[–-]60|Día 60|60 días)\b/.test(html));

// ---------- 11) Sagas ----------
check('Sagas: clave nueva odea_sagas_v1', html.includes('const SAGA_KEY = "odea_sagas_v1"'));
check('Sagas: no cambia la clave de guardado', html.includes('const SAVE_KEY = "odea_save_v2"'));
const sagaIds = [...html.matchAll(/id: "(video|roblox)-(\d+)", n: \2, xp:/g)];
check('Sagas: 12 capítulos (5 video + 7 roblox)',
  sagaIds.filter((m) => m[1] === 'video').length === 5 &&
  sagaIds.filter((m) => m[1] === 'roblox').length === 7,
  `${sagaIds.length} capítulos`);
check('Sagas: XP va a Legado y Poder',
  html.includes('xp.kid += sagaAreaXP("kid")') && html.includes('xp.pow += sagaAreaXP("pow")'));
check('Sagas: recompensas finales', html.includes('rw_sg_video') && html.includes('rw_sg_roblox'));
check('Sagas: pestaña y vista', html.includes('data-tab="sagas"') && html.includes('id="view-sagas"'));
check('Sagas: mundo integrado en el mapa',
  html.includes('{ k: "sagas"') && html.includes('sagas: s.sagas') && html.includes('assets/worlds/sagas.svg'));
check('Sagas: monedas integradas',
  html.includes('function sagaCoinsEarned()') && html.includes('sagaCoinsEarned() +'));
check('Sagas: evalúa logros al completar',
  /function toggleSagaChapter[\s\S]*?checkAchievements\(\)/.test(html));
check('Logro IA no se desbloquea con lista vacía',
  html.includes('aiMissions.length > 0 && aiMissions.every'));
check('Sagas: botón volver al mapa', html.includes('id="sagas-back"'));
check('Sagas: regla de seguridad visible',
  html.includes('Regla de oro: publicar seguro') && html.includes('controles parentales de Roblox'));

// ---------- Resultado ----------
console.log();
if (fails.length) {
  console.log(`FALLÓ: ${fails.length} check(s):`);
  fails.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
console.log('✓ Smoke test OK');
