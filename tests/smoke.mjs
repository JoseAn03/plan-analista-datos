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
const FL_PATH = join(ROOT, 'flujos_odea.js');

const html = readFileSync(HTML_PATH, 'utf8');
const sw = readFileSync(SW_PATH, 'utf8');
const fl = readFileSync(FL_PATH, 'utf8');
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
try {
  execFileSync(process.execPath, ['--check', FL_PATH], { stdio: 'pipe' });
  check('Sintaxis JS de flujos_odea.js', true);
} catch (e) {
  check('Sintaxis JS de flujos_odea.js', false);
  console.log(`\n${e.stderr?.toString() ?? e.message}`);
}

// ---------- 2) Símbolos clave ----------
for (const sym of ['CAP_FRONTS', 'capCompute', 'renderCapital', 'capToggleMission',
                   'ENG_OBJ', 'AI_OBJ', 'CAPF_LADDER', 'bovedaHTML', 'exportSave', 'importSave']) {
  check(`Símbolo definido: ${sym}`, new RegExp(`\\b${sym}\\b`).test(html));
}
for (const sym of ['FL_LADDER', 'FL_CHAPTERS', 'FL_MISSIONS', 'FL_OBJ', 'FL_PROD_CHECKLIST']) {
  check(`Símbolo definido: ${sym}`, new RegExp(`\\b${sym}\\b`).test(fl));
}

// ---------- 3) Tres frentes del Imperio ----------
const fronts = /const CAP_FRONTS = \[([\s\S]*?)\];/.exec(html);
check('CAP_FRONTS con cap/eng/ai y sin fl',
  !!fronts && ['k: "cap"', 'k: "eng"', 'k: "ai"'].every((k) => fronts[1].includes(k)) &&
  !fronts[1].includes('k: "fl"') && !fronts[1].includes('store: "fl"'));
check('CAP_METAFORA y CAP_FRONT_IMG sin fl',
  !/CAP_METAFORA = \{[^}]*fl:/.test(html) &&
  !/CAP_FRONT_IMG = \{[\s\S]*?fl:\s*"assets\/fronts\/fl\.svg"/.test(html) &&
  !html.includes('assets/fronts/fl.svg'));

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
check('＋ en tarjetas elegibles (campaña, vida, imperio, noticias, b2b, sagas)',
  html.includes('planAddBtnHTML("campaign"') && html.includes('planAddBtnHTML("vida"') &&
  /planAddBtnHTML\(front\.k/.test(html) &&
  html.includes('planAddBtnHTML("jobs"') && html.includes('planAddBtnHTML("b2b"') &&
  html.includes('planAddBtnHTML("sagas"'));
check('＋ en campaña incluye misiones y jefe, con has-plan',
  /function campaignCard[\s\S]{0,500}has-plan[\s\S]{0,300}planAddBtnHTML\("campaign"/.test(html) &&
  /function bossCard[\s\S]{0,600}has-plan[\s\S]{0,300}planAddBtnHTML\("campaign"/.test(html));
check('＋ fuera de "Hoy"',
  !/function renderHero[\s\S]{0,1500}planAddBtnHTML/.test(html) &&
  !/function renderWeekly[\s\S]{0,900}planAddBtnHTML/.test(html) &&
  !/function renderReto[\s\S]{0,900}planAddBtnHTML/.test(html));
check('＋ reutiliza Mi Plan (sin clave nueva)',
  html.includes('planHas(f, id)') && html.includes('plannerAdd(f, id)') &&
  !/odea_plan_/.test(html));

// ---------- 13) v5.65/v5.66: Nivel ODEA, racha global, perfil y plan expandible ----------
check('v5.80: APP_VERSION y caché', html.includes('const APP_VERSION = "5.80"') && /odea-v5\.80-20261028-visible/.test(sw));
check('v5.72: Taller cargado como fuente de la Campaña',
  html.includes('<script src="flujos_odea.js"></script>') &&
  sw.includes("'./flujos_odea.js'") && !sw.includes("'./assets/fronts/fl.svg'"));
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
  /gameState\.totalXP = career \+ ach \+ vida \+ capital \+ focus \+ diary \+ bosses \+ hunt/.test(html) &&
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

// ---------- 14) La Cacería v2 (v5.70) ----------
const bankCount = [...html.matchAll(/id:\s*"q\d+"/g)].length;
const bankCats = [...html.matchAll(/cat:\s*"([^"]+)"/g)].map((m) => m[1]);
const catCount = (name) => bankCats.filter((c) => c === name).length;
const v2Start = html.indexOf('function huntV2BossHTML()');
const v2End = html.indexOf('/* --- Interfaz de La Cacería --- */', v2Start);
const v2Body = (v2Start >= 0 && v2End > v2Start) ? html.slice(v2Start, v2End) : '';
check('v5.70: La Cacería es ítem propio de la barra lateral',
  html.includes('class="nav-item" data-tab="hunt"') && html.includes('id="view-hunt"') &&
  !html.includes('class="navb" data-tab="hunt"'));
check('v5.70: estado aditivo hunt.v2 y migración legacy',
  html.includes('legacyShots: 0') && html.includes('shots: []') &&
  html.includes('gameState.hunt = normalizeHunt(data.hunt)') &&
  html.includes('function normalizeHunt(raw)') && html.includes('const SAVE_KEY = "odea_save_v2"') &&
  html.includes('shotId: e.shotId ? String(e.shotId) : null'));
check('v5.70: 4 misiones base repetibles',
  html.includes('const HUNT_V2_MISSIONS') &&
  ['rabbit', 'precision', 'letter', 'direct'].every((id) => html.includes('id:"' + id + '"')) &&
  html.includes('xp:10, damage:1') && html.includes('xp:25, damage:2') &&
  html.includes('xp:40, damage:3') && html.includes('xp:30, damage:2'));
check('v5.70: diarias, plataformas y anillo de meta 5',
  html.includes('const HUNT_V2_DAILY') && html.includes('id:"dawn"') &&
  html.includes('id:"burst"') && html.includes('id:"tracker"') &&
  html.includes('const HUNT_V2_PLATFORMS') && html.includes('const HUNT_V2_DAILY_GOAL = 5') &&
  html.includes('linkedin') && html.includes('computrabajo') && html.includes('encuentra24'));
check('v5.70: jefe semanal HP 30 y recompensa única',
  html.includes('const HUNT_V2_BOSS_HP = 30') && html.includes('function huntV2BossInfo()') &&
  html.includes('v2boss:') && html.includes('Jefe derrotado') &&
  html.includes('300') && html.includes('100') && html.includes('daysLeft'));
check('v5.70: crítico 12%, combo 30 min y anti-spam 13',
  html.includes('const HUNT_V2_CRIT_CHANCE = 0.12') &&
  html.includes('const HUNT_V2_COMBO_MS = 30 * 60 * 1000') &&
  html.includes('const HUNT_V2_ANTI_SPAM_AT = 12') &&
  html.includes('const apply = count >= 3 ? 2 : count === 2 ? 1.5 : 1.2') &&
  html.includes('¡CRÍTICO!') && html.includes('anti-spam'));
check('v5.70: rangos, bonus y logros conectados',
  html.includes('const HUNT_V2_RANKS') && html.includes('name:"Aprendiz"') &&
  html.includes('name:"Rastreador"') && html.includes('name:"Cazador"') &&
  html.includes('name:"Francotirador"') && html.includes('name:"Leyenda"') &&
  html.includes('v2rank:') && html.includes('ach_hunt_boss') &&
  html.includes('huntV2TotalShots()') && html.includes('huntV2BestChain()') &&
  html.includes('huntV2DailyDone("burst")'));
check('v5.70: pantalla nueva sin formularios ni campos',
  v2Body.length > 0 && v2Body.includes('hunt-v2-fire') &&
  v2Body.includes('data-hunt-act="v2-shot"') &&
  v2Body.includes('data-hunt-act="v2-platform"') &&
  v2Body.includes('data-hunt-act="v2-undo"') &&
  !/<(input|select|textarea|form)\b/i.test(v2Body));
check('v5.70: render v2 y acciones de disparo/deshacer',
  html.includes('root.innerHTML = huntV2HTML();') &&
  html.includes('if (act === "v2-shot")') &&
  html.includes('if (act === "v2-platform")') &&
  html.includes('if (act === "v2-undo")') &&
  html.includes('function huntV2Shot(missionId, ev)') &&
  html.includes('function huntV2Undo()'));
check('v5.70: XP y monedas desde hunt.log sin duplicar',
  html.includes('function huntXPGain()') && html.includes('function huntCoinsEarned()') &&
  html.includes('huntCoinsEarned() +') && html.includes('const hunt = huntXPGain()') &&
  html.includes('gameState.xpBreakdown = { career, ach, vida, capital, focus, diary, bosses, hunt }'));
check('v5.70: Ajustes reinicia solo La Cacería',
  /getElementById\("btn-reset-daily"\)[\s\S]{0,220}huntReset\(\)/.test(html) &&
  !html.includes('resetDailyCampaign();'));
check('v5.70: respaldo/restauración conserva hunt.v2',
  html.includes('const bundle = { _format: "odea_bundle_v2", appVersion: APP_VERSION, save: gameState') &&
  html.includes('localStorage.setItem(SAVE_KEY, JSON.stringify(save))') &&
  html.includes('function importSave('));
check('v5.70: banco de 30 preguntas y reparto por categoría',
  bankCount === 30 && catCount('SQL') === 8 && catCount('Excel') === 4 &&
  catCount('Python') === 5 && catCount('Casos de negocio') === 5 &&
  catCount('Conductuales') === 5 && catCount('Datos y ciberseguridad') === 3,
  `${bankCount} preguntas · SQL ${catCount('SQL')} · Excel ${catCount('Excel')} · Python ${catCount('Python')}`);

// ---------- 15) El Taller de Flujos v2 (fuente de la Campaña, v5.72) ----------
const flCtx = {};
vm.runInNewContext(fl + '\nthis.out = { FL_LADDER, FL_CHAPTERS, FL_MISSIONS, FL_OBJ, FL_PROD_CHECKLIST, FL_TOTAL_XP, FL_TOTAL_MINUTES, FL_BOSS_IDS };', flCtx);
const F = flCtx.out;
const flCounts = F.FL_CHAPTERS.map((ch) => F.FL_MISSIONS.filter((m) => m.cap === ch.cap).length);
const flXP = F.FL_CHAPTERS.map((ch) => F.FL_MISSIONS.filter((m) => m.cap === ch.cap).reduce((s, m) => s + m.xp, 0));
const flHours = F.FL_CHAPTERS.map((ch) => F.FL_MISSIONS.filter((m) => m.cap === ch.cap).reduce((s, m) => s + m.time, 0) / 60);
const flBosses = F.FL_CHAPTERS.map((ch) => {
  const list = F.FL_MISSIONS.filter((m) => m.cap === ch.cap);
  return list.length ? list[list.length - 1].id : null;
});
const flAllText = F.FL_MISSIONS.map((m) => `${m.t} ${m.d} ${m.v}`).join(' ').toLowerCase();
const prodText = F.FL_PROD_CHECKLIST.join(' ').toLowerCase();

check('v5.72: Taller con 10 mundos, 74 misiones y 10 jefes',
  F.FL_CHAPTERS.length === 10 && F.FL_MISSIONS.length === 74 && flBosses.filter(Boolean).length === 10,
  `${F.FL_CHAPTERS.length} mundos · ${F.FL_MISSIONS.length} misiones · ${flBosses.filter(Boolean).length} jefes`);
check('v5.72: XP exactos 21.100 y ~163 h',
  F.FL_TOTAL_XP === 21100 && F.FL_TOTAL_MINUTES === 9765 && Math.abs(F.FL_TOTAL_MINUTES / 60 - 162.75) < 0.01,
  `${F.FL_TOTAL_XP} XP · ${(F.FL_TOTAL_MINUTES / 60).toFixed(2)} h`);
check('v5.72: misiones por mundo 6/6/8/8/8/8/8/10/7/5',
  JSON.stringify(flCounts) === JSON.stringify([6, 6, 8, 8, 8, 8, 8, 10, 7, 5]), flCounts.join('/'));
check('v5.72: XP por mundo exactos',
  JSON.stringify(flXP) === JSON.stringify([1200, 1500, 1900, 2150, 2200, 2500, 2350, 2800, 2400, 2100]), flXP.join('/'));
check('v5.72: horas por mundo alineadas al diseño',
  JSON.stringify(flHours.map((h) => Number(h.toFixed(2)))) === JSON.stringify([6.25, 10.5, 14, 16.5, 17, 20.5, 19, 22, 20, 17]),
  flHours.map((h) => h.toFixed(2)).join('/'));
check('v5.72: IDs de jefe exactos',
  JSON.stringify(flBosses) === JSON.stringify(['fl1_6', 'fl2_6', 'fl3_8', 'fl4_8', 'fl5_8', 'fl6_8', 'fl7_8', 'fl8_10', 'fl9_7', 'fl10_5']),
  flBosses.join(', '));
check('v5.72: títulos de los 10 mundos',
  JSON.stringify(F.FL_CHAPTERS.map((ch) => ch.title)) === JSON.stringify([
    'Cimientos del Flujo', 'Conectores: Traé los Datos', 'El LLM como Componente',
    'Documentos Inteligentes', 'Reportes que Piensan', 'Pregúntale a tus Datos',
    'Orquestación y Canales', 'Calidad, Costos y Seguridad', 'Rent-a-Car y Turismo', 'La Maestría'
  ]));
check('v5.72: escalera 0/800/1.850/3.200/5.500/9.000/14.000/21.100',
  JSON.stringify(F.FL_LADDER.map((r) => r.xp)) === JSON.stringify([0, 800, 1850, 3200, 5500, 9000, 14000, 21100]) &&
  /maestro de flujos/i.test(F.FL_LADDER[F.FL_LADDER.length - 1].n));
check('v5.72: toda misión tiene id/cap/t/d/xp/time/v y XP positiva',
  F.FL_MISSIONS.every((m) => /^fl\d+_\d+$/.test(m.id) && m.cap >= 1 && m.cap <= 10 &&
    m.t && m.d && m.v && Number.isFinite(m.xp) && m.xp > 0 && Number.isFinite(m.time) && m.time > 0) &&
  new Set(F.FL_MISSIONS.map((m) => m.id)).size === 74 &&
  Object.keys(F.FL_OBJ).length === 74);
check('v5.72: checklist de producción obligatorio desde el Mundo 5',
  F.FL_CHAPTERS.every((ch) => (ch.cap >= 5) === !!ch.prod) &&
  F.FL_PROD_CHECKLIST.length === 8 &&
  ['idempotencia', 'observabilidad', 'costos', 'seguridad', 'human override', 'runbook', 'tests', 'data contract', 'quality gates']
    .every((term) => prodText.includes(term)));
check('v5.72: contenido experto conectado a datos y agentes',
  ['text-to-sql', 'quality gate', 'audit log', 'golden set', 'lineage', 'human override', 'idempotencia']
    .every((term) => flAllText.includes(term)));

check('v5.72: Campaña se deriva del Taller (10 mundos, 74 misiones)',
  html.includes('const CHAPTERS = FL_CHAPTERS.map') &&
  html.includes('const flCampaignMissions = FL_MISSIONS.map') &&
  html.includes('const campaignMissions = flCampaignMissions.filter') &&
  html.includes('const bossMissions = flCampaignMissions.filter'));
check('v5.72: DATOS abre la Campaña de Datos y no Campamento Base',
  html.includes('data-tab="campaign" aria-label="Campaña de datos"') &&
  html.includes('<span>Datos</span>') &&
  html.includes('CAMPAÑA DE DATOS · PROGRESO'));
check('v5.72: Capital queda en 3 frentes y sin Taller duplicado',
  !!fronts && ['k: "cap"', 'k: "eng"', 'k: "ai"'].every((k) => fronts[1].includes(k)) &&
  !html.includes('data-csub="fl"') && !html.includes('id="cap-fl"') &&
  !html.includes('id="vm-fl"') && !html.includes('store: "fl"') &&
  !html.includes('fronts.fl') && !html.includes('assets/fronts/fl.svg'));
check('v5.72: guardado nuevo sin fl y migración desde capital.fl',
  /capital: \{ done: \[\], eng: \[\], ai: \[\] \}/.test(html) &&
  !/capital: \{[^}]*fl:/.test(html) &&
  !html.includes('ai: [], fl: []') &&
  html.includes('const legacyFl = (data.capital && Array.isArray(data.capital.fl))') &&
  /legacyFl\.filter\(id => campaignAll\.some/.test(html) &&
  !/fl: Array\.isArray\(cp\.fl\)/.test(html));
check('v5.72: jefes de Campaña se desbloquean por mundo, no por días',
  html.includes('function chapterPending(') && html.includes('function bossUnlocked(') &&
  /bossCard[\s\S]{0,1200}!bossUnlocked\(b\.chapter\)/.test(html) &&
  /toggleCampaign[\s\S]{0,900}!bossUnlocked\(m\.chapter\)/.test(html) &&
  !html.includes('bossMinLevel') && !html.includes('días de plan diario'));
check('v5.72: Campaña muestra requisitos y checklist de producción',
  html.includes('capChapterExtrasHTML(ch)') &&
  /function capChapterExtrasHTML[\s\S]{0,500}FL_PROD_CHECKLIST/.test(html) &&
  /function renderChapters[\s\S]{0,2500}capChapterExtrasHTML\(ch\)/.test(html));
check('v5.72: Campaña refresca progreso y jefe sin recargar',
  /toggleCampaign[\s\S]{0,1800}renderChapters\(\)/.test(html) &&
  /toggleCampaign[\s\S]{0,1900}mapRefresh\(\)/.test(html) &&
  html.includes('const openIds = new Set') &&
  html.includes('sec.dataset.chapter'));
check('v5.72: mapa y perfil reflejan 10 mundos y 3 frentes',
  html.includes('CHAPTERS.length + " mundos · "') &&
  html.includes('3 frentes:') &&
  html.includes('Tres Frentes') &&
  html.includes('Capital · Inglés · IA'));
check('v5.72: mapa de Campaña ajusta el alto a 10 nodos',
  /const trackH = Math\.max\(940/.test(html) &&
  /viewBox="0 0 100 ' \+ trackH \+ '"/.test(html));

// ---------- 16) Campaña de Datos = Taller de Flujos (v5.72) ----------
const chaptersStart = html.indexOf('const CHAPTERS = FL_CHAPTERS.map');
const chaptersEnd = html.indexOf('});', chaptersStart) + 3;
const mapStart = html.indexOf('function flCampaignCategory');
const mapEnd = html.indexOf('const campaignAll =', mapStart);
const mapEndSemi = html.indexOf(';', mapEnd) + 1;
const campCtx = {};
vm.runInNewContext(
  fl + '\n' + html.slice(chaptersStart, chaptersEnd) + '\n' + html.slice(mapStart, mapEndSemi) +
  '\nthis.out = { CHAPTERS, campaignMissions, bossMissions, campaignAll, flCampaignCategory };',
  campCtx
);
const C = campCtx.out;
const allXP = C.campaignAll.reduce((s, m) => s + m.xp, 0);
const allMin = C.campaignAll.reduce((s, m) => s + m.time, 0);
const bossIds = C.bossMissions.map((m) => m.id);
const allIds = new Set(C.campaignAll.map((m) => m.id));
const flIds = F.FL_MISSIONS.map((m) => m.id);
const flTitle = new Map(F.FL_MISSIONS.map((m) => [m.id, m.t]));
check('v5.72: Campaña 64 regulares + 10 jefes = 74',
  C.campaignMissions.length === 64 && C.bossMissions.length === 10 && C.campaignAll.length === 74,
  `${C.campaignMissions.length}+${C.bossMissions.length}=${C.campaignAll.length}`);
check('v5.72: Campaña conserva 21.100 XP y 9.765 min',
  allXP === 21100 && allMin === 9765 && Math.abs(allMin / 60 - 162.75) < 0.01,
  `${allXP} XP · ${(allMin / 60).toFixed(2)} h`);
check('v5.72: 10 mundos con ids 1..10 y títulos del Taller',
  C.CHAPTERS.length === 10 &&
  JSON.stringify(C.CHAPTERS.map((ch) => ch.id)) === JSON.stringify([1,2,3,4,5,6,7,8,9,10]) &&
  C.CHAPTERS[0].title === 'Cimientos del Flujo' &&
  C.CHAPTERS[9].title === 'La Maestría');
check('v5.72: jefes exactos y marcados en la Campaña',
  JSON.stringify(bossIds) === JSON.stringify(['fl1_6', 'fl2_6', 'fl3_8', 'fl4_8', 'fl5_8', 'fl6_8', 'fl7_8', 'fl8_10', 'fl9_7', 'fl10_5']) &&
  C.bossMissions.every((m) => m.boss === true) &&
  C.campaignMissions.every((m) => m.boss === false));
check('v5.72: todas las misiones mapeadas con campos de Campaña',
  JSON.stringify(C.campaignAll.map((m) => m.id)) === JSON.stringify(flIds) &&
  C.campaignAll.every((m) => m.id && m.chapter >= 1 && m.chapter <= 10 &&
    m.title && m.description && m.verification && m.xp > 0 && m.time > 0 &&
    m.estimatedTime === m.time + ' min' && m.category &&
    m.title === flTitle.get(m.id)));
check('v5.72: categorías conservan logros y colores',
  C.campaignAll.filter((m) => m.category === 'ai').length > 0 &&
  C.campaignAll.filter((m) => m.category === 'analyst').length >= 15 &&
  !C.campaignAll.some((m) => m.category === 'employability') &&
  C.CHAPTERS.every((ch) => C.campaignAll.filter((m) => m.chapter === ch.id)
    .every((m) => m.category === (ch.id >= 3 && ch.id <= 8 ? 'ai' : 'analyst'))));
check('v5.72: no quedan IDs ni misiones de la campaña vieja',
  ['d0_1', 'd1_1', 'd2_1', 'd3_1', 'd4_1', 'd5_1', 'd5_6', 'd6_1', 'd7_1', 'b2', 'b4', 'b6', 'b7']
    .every((id) => !allIds.has(id)));
check('v5.72: CHAPTERS incluye requisito y checklist de producción',
  C.CHAPTERS.every((ch) => ch.req && ch.subtitle === ch.req && ch.narrative && ch.icon) &&
  C.CHAPTERS.every((ch) => (ch.id >= 5) === !!ch.prod));
check('v5.72: se conserva SAVE_KEY y SAGA_KEY',
  html.includes('const SAVE_KEY = "odea_save_v2"') && html.includes('const SAGA_KEY = "odea_sagas_v1"'));

// ---------- 17) Correcciones de auditoría (v5.73) ----------
check('H-01: guardar marca la migración para no borrar el primer día',
  html.includes('const SAVE_SCHEMA = 3') &&
  /function saveGame\(\)[\s\S]{0,420}gameState\.saveVersion = SAVE_SCHEMA[\s\S]{0,300}localStorage\.setItem\("odea_empleo_v2", "1"\)/.test(html) &&
  /const hadSave = loadGame\(\)[\s\S]{0,350}legacySaveNeedsDailyReset/.test(html));
check('H-02: Mi Plan no completa misiones de Imperio bloqueadas',
  /function capToggleMission[\s\S]{0,1400}!before\.unlockMap\[o\.cap\]/.test(html) &&
  /function plannerInfo[\s\S]{0,2800}locked: !done && !capMissionUnlocked/.test(html) &&
  html.includes('function capMissionUnlocked('));
check('H-02: B2B y Sagas también respetan su secuencia',
  /function toggleB2B[\s\S]{0,500}!b2bUnlocked\(m\)/.test(html) &&
  /function toggleSagaChapter[\s\S]{0,700}!sagaChapterUnlocked\(id\)/.test(html));
check('M-01: el botón visible reinicia La Cacería',
  html.includes('⟲ REINICIAR LA CACERÍA') && !html.includes('⟲ REINICIAR CAMPAÑA DE EMPLEO') &&
  /getElementById\("btn-reset-daily"\)[\s\S]{0,220}huntReset\(\)/.test(html));
check('M-02/M-03: teclado en Imperio y roles en Vida',
  /view\.addEventListener\("keydown"[\s\S]{0,280}head\.click\(\)/.test(html) &&
  /head\.setAttribute\("aria-expanded", os\.has\(capNum\) \? "true" : "false"\)/.test(html) &&
  /function vidaCardHTML[\s\S]{0,450}role="checkbox" tabindex="0" aria-checked/.test(html));
check('M-04: modales de bienvenida/diagnóstico atrapan el foco',
  /const LAYERS = \["modal-layer", "diag-layer"/.test(html) &&
  /modalBtn\.dataset\.mode === "welcome"\) return;/.test(html) &&
  /layer\.id === "modal-layer" && modalBtn\.dataset\.mode === "welcome"/.test(html));
check('L-01/L-02/L-03: ruta, logo, holograma y diario accesibles',
  /day-card[\s\S]{0,400}role="button" tabindex="0"/.test(html) &&
  /id="logo" role="button" tabindex="0"/.test(html) &&
  /id="side-holo"[\s\S]{0,180}role="button" tabindex="0"/.test(html) &&
  html.includes('<label for="diary-input" class="sr-only">'));
check('L-04/L-05: jefes bloqueados y subpestañas aisladas',
  /bossCard[\s\S]{0,800}aria-disabled="true"/.test(html) &&
  html.includes('document.querySelector("#view-vida .sub-tabs")') &&
  !/document\.querySelectorAll\("\.sub-tab"\)\.forEach/.test(html));
check('L-06/L-07/L-08: reset limpio, contador completo y nav de dos filas',
  /function resetGame[\s\S]{0,500}localStorage\.removeItem\(FOCUS_TIMER_KEY\)/.test(html) &&
  /function totalMissionCount[\s\S]{0,900}vidaMissionIndex\(\)[\s\S]{0,500}RETOS\.length[\s\S]{0,700}SAGAS\.reduce/.test(html) &&
  html.includes('misiones y retos') && /@media \(max-width:380px\)/.test(html) &&
  /\.nav-bottom\{flex-wrap:wrap/.test(html));

// ---------- Resultado ----------
console.log();
if (fails.length) {
  console.log(`FALLÓ: ${fails.length} check(s):`);
  fails.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
console.log('✓ Smoke test OK');
