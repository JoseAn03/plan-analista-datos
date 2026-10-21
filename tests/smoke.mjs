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
import vm from 'node:vm';
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

// ---------- 12) Botón "＋" añadir a Mi Plan (v5.64) ----------
check('＋ de Mi Plan: helper definido', html.includes('function planAddBtnHTML'));
check('＋ en tarjetas elegibles (vida, imperio, noticias, b2b, sagas)',
  html.includes('planAddBtnHTML("vida"') && /planAddBtnHTML\(front\.k/.test(html) &&
  html.includes('planAddBtnHTML("jobs"') && html.includes('planAddBtnHTML("b2b"') &&
  html.includes('planAddBtnHTML("sagas"'));
check('＋ fuera de la campaña principal',
  !/function campaignCard[\s\S]{0,900}planAddBtnHTML/.test(html) &&
  !/function bossCard[\s\S]{0,900}planAddBtnHTML/.test(html));
check('＋ fuera de "Hoy"',
  !/function renderHero[\s\S]{0,1500}planAddBtnHTML/.test(html) &&
  !/function renderWeekly[\s\S]{0,900}planAddBtnHTML/.test(html) &&
  !/function renderReto[\s\S]{0,900}planAddBtnHTML/.test(html));
check('＋ reutiliza Mi Plan (sin clave nueva)',
  html.includes('planHas(f, id)') && html.includes('plannerAdd(f, id)') &&
  !/odea_plan_/.test(html));

// ---------- 13) v5.65/v5.66: Nivel ODEA, racha global, perfil y plan expandible ----------
check('v5.66: APP_VERSION y caché', html.includes('const APP_VERSION = "5.66"') && /odea-v5\.66-/.test(sw));
check('v5.65: escalera global ODE_LADDER + odeInfo', html.includes('const ODE_LADDER') &&
  html.includes('function odeInfo(') && html.includes('function odeLevelNow(') &&
  html.includes('function campaignLevel('));
check('v5.66: curva ODEA progresiva (63 niveles, 120k máximo)', (() => {
  const start = html.indexOf('const LEVELS =');
  const end = html.indexOf('const CHAPTERS =');
  if (start < 0 || end <= start) return false;
  const ctx = {};
  vm.runInNewContext(html.slice(start, end) + '\nthis.out = { LEVELS, ODE_LADDER };', ctx);
  const ladder = ctx.out.ODE_LADDER;
  const lvlAt = (xp) => ladder.reduce((n, e, i) => xp >= e.xp ? i + 1 : n, 1);
  return ladder.length === 63 &&
    ladder.every((e, i) => !i || e.xp > ladder[i - 1].xp) &&
    lvlAt(0) === 1 && lvlAt(88) === 2 && lvlAt(295) === 3 &&
    lvlAt(5000) === 11 && lvlAt(20000) === 23 && lvlAt(120000) === 63;
})());
check('v5.66: primeros niveles rápidos y después más exigentes',
  (() => {
    const m = /const ODE_LADDER = \(function \(\) \{([\s\S]*?)\n\}\)\(\);/.exec(html);
    return !!m && m[1].includes('Math.pow(t, ODE_CURVE)') &&
      html.includes('const ODE_MAX_LEVEL = 63') &&
      html.includes('const ODE_MAX_XP = 120000') &&
      html.includes('const ODE_CURVE = 1.75');
  })());
check('v5.66: barra lateral sin estadísticas ni XP del ecosistema',
  !html.includes('id="side-stats"') && !html.includes('id="s-lvl"') &&
  !html.includes('id="eco-xp-total"') && !html.includes('id="eco-xp"') &&
  !html.includes('id="radar-chart"') && !html.includes('id="d-count"') &&
  !html.includes('id="w-count"') && !html.includes('id="c-count"'));
check('v5.66: respaldos, reinicios y logros siguen disponibles en AJUSTES',
  html.includes('class="side-settings"') && html.includes('id="ach-link"') &&
  html.includes('id="btn-export"') && html.includes('id="btn-import"') &&
  html.includes('id="btn-reset"') && html.includes('id="btn-reset-daily"'));
check('v5.66: perfil del inventario conserva estadísticas y curva',
  html.includes('id="rw-profile"') && html.includes('XP del ecosistema') &&
  html.includes('Ritmo de nivel') && html.includes('curveMiles'));
check('v5.65: todo el XP suma (jefes incluidos)',
  /const bosses = bossXPSum\(\)/.test(html) &&
  /gameState\.totalXP = career \+ ach \+ vida \+ capital \+ focus \+ diary \+ bosses/.test(html) &&
  /gameState\.odeLevel = odeInfo\(gameState\.totalXP\)\.lvl/.test(html));
check('v5.65: el nivel de días queda como campaña',
  /gameState\.campaignLevel = campaignLevel\(\)/.test(html) &&
  /gameState\.level = gameState\.campaignLevel/.test(html));
check('v5.65: racha con 5 misiones de cualquier frente',
  html.includes('const STREAK_MIN_MISSIONS = 5') &&
  html.includes('function activityAdd(') && html.includes('function activityMaybeStreak(') &&
  /activityAdd\("daily"/.test(html) && /activityAdd\("campaign"/.test(html) &&
  /activityAdd\("jobs"/.test(html) && /activityAdd\("b2b"/.test(html) &&
  /activityAdd\("vida"/.test(html) && /activityAdd\("sagas"/.test(html) &&
  /activityAdd\(front\.k/.test(html) && /activityAdd\("boss"/.test(html));
check('v5.65: diario persistente migra guardados viejos',
  /diary: \{ date: null, text: "", log: \[\] \}/.test(html) &&
  html.includes('const diaryLog = Array.isArray(di2.log)') &&
  html.includes('if (diaryDate && diaryText.trim()') &&
  /function diaryXPGain\(\)[\s\S]{0,500}\(d\.log \|\| \[\]\)\.reduce/.test(html));
check('v5.65: Mi Plan devuelve descripción/verificación/pasos',
  /function plannerInfo[\s\S]*?desc: m\.description, verif: m\.verification/.test(html) &&
  /function plannerInfo[\s\S]*?desc: cap\.objective/.test(html) &&
  html.includes('teach: cap.teach') && html.includes('steps: Array.isArray(cap.steps)'));
check('v5.65: Mi Plan expandible sin completar la misión',
  html.includes('data-pl-expand="') && html.includes('aria-expanded="false"') &&
  html.includes('class="pl-desc" id="pl-desc-') &&
  /closest\("\[data-pl-expand\]"\)[\s\S]{0,700}setAttribute\("hidden"/.test(html));
check('v5.65: área táctil del título del plan >= 44px',
  /\.pl-main\{[^}]*min-height:48px/.test(html));
check('v5.65: CSS del media 400px no se traga VIDA/planner',
  (() => {
    const m = /@media \(max-width:400px\)\{([\s\S]*?)\n\}/.exec(html);
    return !!m && !m[1].includes('.vida-hero') && !m[1].includes('.pl-main') && !m[1].includes('.rw-profile');
  })());
check('v5.65: perfil dentro del inventario',
  html.includes('id="rw-tabs"') && html.includes('data-rwt="profile"') &&
  html.includes('data-rwt="arsenal"') && html.includes('id="rw-profile"') &&
  html.includes('id="rw-arsenal-panel"') &&
  html.includes('function rwProfileRender(') && html.includes('function rwApplyTab('));
check('v5.65: perfil muestra XP, frentes, dominios y rangos',
  html.includes('XP del ecosistema') && html.includes('Frentes') &&
  html.includes('Dominios') && html.includes('Rangos internos') &&
  html.includes('pf-xp-list') && html.includes('pf-grid') && html.includes('pf-ranks'));
check('v5.65: perfil tiene atajos a los frentes',
  html.includes('go: "daily"') && html.includes('go: "campaign"') &&
  html.includes('go: "jobs"') && html.includes('go: "capital"') &&
  html.includes('go: "vida"') && html.includes('go: "sagas"') &&
  html.includes("data-go=\"' + f.go + '\""));
check('v5.66: HUD, identidad lateral y mapa usan Nivel ODEA',
  html.includes('_hudLvl.textContent = "NIVEL " + _oi.lvl') &&
  html.includes('r.textContent = "NIVEL " + odeLevelNow()') &&
  html.includes('NIVEL ODEA') && html.includes('odeLevelNow()'));

// ---------- Resultado ----------
console.log();
if (fails.length) {
  console.log(`FALLÓ: ${fails.length} check(s):`);
  fails.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
console.log('✓ Smoke test OK');
