#!/usr/bin/env node
/**
 * Pruebas funcionales del EVENTO «Decision Lab» (v6.00).
 *
 * Extrae las funciones REALES de odea.html y las corre en Node con un
 * entorno mínimo (localStorage y document simulados), con el mismo
 * arnés del roundtrip de v5.98/v5.99:
 *  a) ida y vuelta save→load de gameState.eventDL (y guardado viejo sin él)
 *  b) la derivación de XP/monedas incluye el evento SIN alterar eventRL/farm
 *  c) comprar un objeto exclusivo descuenta monedas vía shop.spent
 *  d) el Trofeo «Decision Maker» exige las 14 misiones completas
 *
 * Uso: node tests/decision-lab.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(ROOT, 'odea.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');

function extract(name) {
  const i = scripts.indexOf(`function ${name}(`);
  if (i < 0) throw new Error('not found: ' + name);
  let depth = 0, j = scripts.indexOf('{', i);
  const start = j;
  for (; j < scripts.length; j++) {
    if (scripts[j] === '{') depth++;
    else if (scripts[j] === '}') { depth--; if (depth === 0) break; }
  }
  return scripts.slice(i, j + 1);
}
function extractConst(name) {
  const i = scripts.indexOf(`const ${name} =`);
  if (i < 0) throw new Error('not found const: ' + name);
  const j = scripts.indexOf('];', i);
  return scripts.slice(i, j + 2);
}

// --- Entorno mínimo ---
const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};
function stubEl() {
  return { style: {}, textContent: '', innerHTML: '', dataset: {},
    classList: { add() {}, remove() {} },
    querySelectorAll: () => [], addEventListener() {} };
}
global.document = { getElementById: () => stubEl(), querySelectorAll: () => [] };
global.window = { innerWidth: 400, innerHeight: 800 };
global.ODEA = { bus: { emit() {} } };
global.gameState = {};

const stubs = `
var SAVE_KEY = "odea_save_v2", OLD_KEY = "odea_save_v1", SAVE_SCHEMA = 3;
var campaignAll = [], employmentMissions = [], PUENTE_MISSIONS = [], achievements = [];
var B2B_LEGACY_XP = {}, CAP_OBJ = {}, ENG_OBJ = {}, AI_OBJ = {}, SHOP_ITEMS = [], REWARDS = [];
var DAILY_TOTAL = 56, WEEKLY_TOTAL = 8;
function plannerCatalog() { return []; }
function migrateEquipped(e) { return e || {}; }
function normalizeHunt(h) { return h || { log: [] }; }
var corruptSave = false, legacySaveNeedsDailyReset = false;
var FARM_XP_PER = 2, FARM_PER_COIN = 4, FARM_DAY_CAP = 40;
function todayStr() { return "2026-11-11"; }
function toast() {} function playSfx() {} function confetti() {}
function shopRender() {} function shopCoinSync() {}
function sagaCoinsEarned() { return 0; }
function huntCoinsEarned() { return 0; }
function huntXPGain() { return 0; }
function campaignXPGain() { return 0; } function dailyXPGain() { return 0; }
function weeklyXPGain() { return 0; } function jobsXPGain() { return 0; }
function b2bXPGain() { return 0; } function achXPSum() { return 0; }
function vidaCompute() { return { total: 0 }; } function capCompute() { return { xp: 0 }; }
function focusTotalXP() { return 0; } function diaryXPGain() { return 0; }
function bossXPSum() { return 0; } function campaignLevel() { return 1; }
function odeInfo() { return { lvl: 1 }; } function domainLevels() { return []; }
`;

const geval = (0, eval);
geval([stubs,
  extractConst('DL_PHASES'), extractConst('DL_MISSIONS'), extractConst('DL_SHOP_ITEMS'),
  extract('saveGame'), extract('loadGame'), extract('canjeEsc'),
  extract('dlState'), extract('dlXPGain'), extract('dlCoinsEarned'),
  extract('eventState'), extract('eventXPGain'), extract('eventCoinsEarned'),
  extract('farmState'), extract('farmByDay'), extract('farmCounted'), extract('farmXPGain'), extract('farmCoinsEarned'),
  extract('shopState'), extract('coinsEarned'), extract('coinsBalance'),
  extract('recomputeState'),
  extract('dlMission'), extract('dlDone'), extract('dlDoneCount'), extract('dlAllDone'),
  extract('dlRender'), extract('dlComplete'),
  extract('dlShopItem'), extract('dlShopRender'), extract('dlShopBuy'),
  'globalThis.__T = { DL_MISSIONS, DL_SHOP_ITEMS, loadGame, saveGame, dlState, dlXPGain, dlCoinsEarned,' +
  ' eventXPGain, farmXPGain, farmCoinsEarned, coinsEarned, coinsBalance, shopState, recomputeState,' +
  ' dlComplete, dlDoneCount, dlAllDone, dlShopBuy };'
].join('\n'));
const T = globalThis.__T;
const gs = () => globalThis.gameState;

function baseState() {
  return { playerName: 'Test', completedMissions: [], completedDaily: [], completedWeekly: [],
    completedJobs: [], completedB2b: [], completedPuente: [], unlockedAch: [],
    vida: { log: [] }, capital: {}, gods: {}, shop: { spent: 0, owned: [], equipped: {} },
    eventRL: { log: [] }, farm: { log: [] }, eventDL: { log: [], badge: false, owned: [] } };
}

const results = [];
function check(name, ok) { results.push([name, !!ok]); }

// ---------- a) Ida y vuelta save→load de eventDL ----------
delete store['odea_save_v2']; delete store['odea_save_v1'];
store['odea_save_v2'] = JSON.stringify({
  saveVersion: 3, playerName: 'Jose',
  eventRL: { log: [{ id: 'ev_x', d: '2026-11-05', xp: 15, coins: 3 }] },
  eventDL: { badge: true, owned: ['dl_lentes', 'dl_basura'],
    log: [
      { id: 'dl1', d: '2026-11-11', xp: 40, coins: 20 },
      { id: 'dl7', d: '2026-11-11', xp: 100, coins: 50 },
      { id: 'dl1', d: '2026-11-11', xp: 40, coins: 20 },
      { id: 'dl99', d: '2026-11-11', xp: 999, coins: 999 },
      { id: 'dl3', d: '11/11/2026', xp: 50, coins: 25 }
    ] }
});
globalThis.gameState = {};
check('a1: loadGame devuelve true con eventDL', T.loadGame() === true);
check('a2: log restaurado y saneado (2 válidas, sin duplicados ni inventadas)',
  gs().eventDL.log.length === 2 && gs().eventDL.log[0].id === 'dl1' && gs().eventDL.log[1].id === 'dl7' &&
  gs().eventDL.log[1].xp === 100 && gs().eventDL.log[1].coins === 50);
check('a3: insignia y objetos restaurados (objeto inválido fuera)',
  gs().eventDL.badge === true && JSON.stringify(gs().eventDL.owned) === JSON.stringify(['dl_lentes']));
T.saveGame();
const written = JSON.parse(store['odea_save_v2']);
check('a4: saveGame vuelve a escribir eventDL intacto',
  written.eventDL.log.length === 2 && written.eventDL.badge === true && written.eventDL.owned.length === 1);
store['odea_save_v2'] = JSON.stringify({ saveVersion: 3, playerName: 'Viejo' });
globalThis.gameState = {};
check('a5: guardado viejo sin eventDL carga con default seguro',
  T.loadGame() === true && gs().eventDL.log.length === 0 && gs().eventDL.badge === false && gs().eventDL.owned.length === 0);

// ---------- b) Derivación: el evento suma sin alterar eventRL/farm ----------
globalThis.gameState = baseState();
gs().eventRL = { log: [{ id: 'ev_x', d: '2026-11-05', xp: 15, coins: 3 }] };
gs().farm = { log: [{ d: '2026-11-11', c: 1 }, { d: '2026-11-11', c: 1 }, { d: '2026-11-11', c: 1 }, { d: '2026-11-11', c: 1 }] };
T.recomputeState();
const base = { total: gs().totalXP, evento: gs().xpBreakdown.evento, farm: gs().xpBreakdown.farm, coins: T.coinsEarned() };
check('b1: base sin evento (evento=15, farm=8)', base.evento === 15 && base.farm === 8);
gs().eventDL.log = [
  { id: 'dl1', d: '2026-11-11', xp: 40, coins: 20 },
  { id: 'dl7', d: '2026-11-11', xp: 100, coins: 50 }
];
T.recomputeState();
check('b2: dlXPGain=140 y dlCoinsEarned=70', T.dlXPGain() === 140 && T.dlCoinsEarned() === 70);
check('b3: breakdown.decision=140 y totalXP sube exactamente 140',
  gs().xpBreakdown.decision === 140 && gs().totalXP === base.total + 140);
check('b4: evento y farm NO cambian al sumar el Decision Lab',
  gs().xpBreakdown.evento === base.evento && gs().xpBreakdown.farm === base.farm &&
  T.eventXPGain() === 15 && T.farmXPGain() === 8);
check('b5: coinsEarned sube exactamente 70 por el evento',
  T.coinsEarned() === base.coins + 70);

// ---------- c) Compra de objeto exclusivo vía shop.spent ----------
globalThis.gameState = baseState();
gs().completedDaily = new Array(300).fill('d'); // 300 monedas derivadas
check('c1: saldo inicial 300', T.coinsBalance() === 300);
T.dlShopBuy('dl_marco'); // 150 🪙
check('c2: la compra descuenta por shop.spent (spent=150, saldo=150)',
  T.shopState().spent === 150 && T.coinsBalance() === 150);
check('c3: el objeto queda en eventDL.owned', gs().eventDL.owned.includes('dl_marco'));
T.dlShopBuy('dl_chaqueta'); // 250 > 150: no alcanza
check('c4: sin saldo no hay compra ni gasto', T.shopState().spent === 150 && !gs().eventDL.owned.includes('dl_chaqueta'));
T.dlShopBuy('dl_marco'); // ya es suyo: no cobra dos veces
check('c5: recomprar lo propio no cobra', T.shopState().spent === 150);

// ---------- d) El Trofeo exige las 14 misiones ----------
globalThis.gameState = baseState();
gs().completedDaily = new Array(600).fill('d'); // 600 monedas derivadas
T.DL_MISSIONS.slice(0, 13).forEach((m) => T.dlComplete(m.id));
check('d1: 13/14 misiones, sin insignia todavía', T.dlDoneCount() === 13 && gs().eventDL.badge === false);
check('d2: XP del evento con 13 misiones = 970', T.dlXPGain() === 970);
T.dlShopBuy('dl_trofeo');
check('d3: con 13/14 el trofeo NO se vende (spent=0, no está en owned)',
  T.shopState().spent === 0 && !gs().eventDL.owned.includes('dl_trofeo'));
T.dlComplete('dl14');
check('d4: al completar la 14ª se gana la insignia y el XP total es 1.020',
  gs().eventDL.badge === true && T.dlXPGain() === 1020 && T.dlAllDone());
T.dlComplete('dl14');
check('d5: completar dos veces la misma misión es idempotente', gs().eventDL.log.length === 14);
T.dlShopBuy('dl_trofeo');
check('d6: con 14/14 el trofeo se compra por shop.spent (400)',
  T.shopState().spent === 400 && gs().eventDL.owned.includes('dl_trofeo') && T.coinsBalance() === 600 + 510 - 400);

let fail = 0;
for (const [name, ok] of results) { console.log((ok ? '  ✓ ' : '  ✗ FALLÓ ') + name); if (!ok) fail++; }
console.log(fail === 0
  ? `\n✅ DECISION LAB OK: ${results.length}/${results.length} pruebas funcionales`
  : `\n❌ ${fail} fallo(s) de ${results.length}`);
process.exit(fail ? 1 : 0);
