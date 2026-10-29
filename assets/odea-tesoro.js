/*
 * ODEA Tesoro v1 — Fase 5: economía cosmética + escudo de racha.
 * Capa independiente (patrón de las Fases 1–4):
 * - No modifica funciones del núcleo, saveGame ni las claves odea_* existentes.
 * - Solo LEE el XP total del núcleo (gameState.totalXP) para convertir tu
 *   progreso real en Monedas neón (1 moneda por cada 10 XP nuevos que la
 *   capa observa al abrir la app).
 * - Su único almacenamiento es la clave propia odea_tesoro_v1.
 * - La tienda vende SOLO cosméticos que aplica esta misma capa (temas,
 *   marco, título). El escudo protege la racha DE ESTA CAPA (días seguidos
 *   con ganancia de XP): las capas no pueden escribir el guardado del
 *   núcleo, así que la racha 🔥 principal de ODEA no se toca.
 */
(function () {
  "use strict";
  try {
    var STORAGE_KEY = "odea_tesoro_v1";
    var XP_POR_MONEDA = 10;
    var MAX_ESCUDOS = 2;

    var SHOP = [
      { id: "titulo", nombre: "Título: «el Imparable»", precio: 15,
        desc: "Un título junto a tu nombre en el panel lateral." },
      { id: "marco", nombre: "Marco dorado", precio: 25,
        desc: "Borde y brillo dorados para tu logo y tu personaje." },
      { id: "tema-aurora", nombre: "Tema Aurora boreal", precio: 40,
        desc: "El panel lateral se tiñe de verdes y violetas polares." },
      { id: "tema-synthwave", nombre: "Tema Atardecer synthwave", precio: 40,
        desc: "El panel lateral se tiñe de rosa y naranja retro." }
    ];
    var PRECIO_ESCUDO = 20;

    /* ---------------- utilidades ---------------- */
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function dateStr(d) {
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }
    function todayStr() { return dateStr(new Date()); }
    function dayOffsetStr(base, days) {
      var p = base.split("-");
      var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
      d.setDate(d.getDate() + days);
      return dateStr(d);
    }
    function dayDiff(a, b) { // días de a → b (b posterior)
      var pa = a.split("-"), pb = b.split("-");
      var da = Date.UTC(+pa[0], +pa[1] - 1, +pa[2]);
      var db = Date.UTC(+pb[0], +pb[1] - 1, +pb[2]);
      return Math.round((db - da) / 86400000);
    }
    function clampInt(v, min, max) {
      v = parseInt(v, 10);
      if (isNaN(v)) v = 0;
      return Math.max(min, Math.min(max, v));
    }
    function esc(s) {
      return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
    function totalXPNow() {
      try {
        if (typeof gameState !== "undefined" && gameState &&
            typeof gameState.totalXP === "number" && isFinite(gameState.totalXP)) {
          return gameState.totalXP;
        }
      } catch (e) {}
      return null;
    }

    /* ---------------- estado ---------------- */
    function defaultState() {
      return {
        v: 1,
        monedas: 0,
        xpUltimo: -1,      // último XP total observado (-1 = nunca)
        dia: "",           // día actualmente rastreado
        xpInicioDia: 0,    // XP al comenzar el día rastreado
        racha: 0,          // días seguidos con ganancia de XP (capa)
        mejorRacha: 0,
        escudos: 0,
        escudoUsadoEn: "", // día que un escudo salvó (para avisar)
        propios: [],       // ids comprados
        tema: "",          // "", "tema-aurora", "tema-synthwave"
        marco: false,      // cosmético activo
        titulo: false      // cosmético activo
      };
    }
    var state = defaultState();
    function loadState() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        var s = JSON.parse(raw);
        if (!s || typeof s !== "object") return;
        var d = defaultState();
        d.monedas = clampInt(s.monedas, 0, 2000000000);
        d.xpUltimo = (typeof s.xpUltimo === "number" && isFinite(s.xpUltimo)) ? s.xpUltimo : -1;
        d.dia = typeof s.dia === "string" ? s.dia : "";
        d.xpInicioDia = clampInt(s.xpInicioDia, 0, 2000000000);
        d.racha = clampInt(s.racha, 0, 99999);
        d.mejorRacha = clampInt(s.mejorRacha, 0, 99999);
        d.escudos = clampInt(s.escudos, 0, MAX_ESCUDOS);
        d.escudoUsadoEn = typeof s.escudoUsadoEn === "string" ? s.escudoUsadoEn : "";
        d.propios = Array.isArray(s.propios) ? s.propios.slice(0, 50) : [];
        d.tema = (s.tema === "tema-aurora" || s.tema === "tema-synthwave") ? s.tema : "";
        d.marco = !!s.marco;
        d.titulo = !!s.titulo;
        state = d;
      } catch (e) { /* estado corrupto: default */ }
    }
    function saveState() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }
    function owns(id) { return state.propios.indexOf(id) !== -1; }

    /* Conversión de progreso y cierre de día. Devuelve monedas ganadas ahora. */
    function syncProgress() {
      var xp = totalXPNow();
      if (xp === null) return 0;
      var t = todayStr();
      var ganadas = 0;

      if (state.xpUltimo < 0) { // primera observación: línea base, sin monedas retroactivas
        state.xpUltimo = xp;
        state.dia = t;
        state.xpInicioDia = xp;
        saveState();
        return 0;
      }

      if (state.dia !== t) {
        var gananciaDiaPrev = Math.max(0, state.xpUltimo - state.xpInicioDia);
        var salto = dayDiff(state.dia, t);
        if (salto === 1) {
          if (gananciaDiaPrev > 0) {
            state.racha += 1;
          } else if (state.escudos > 0 && state.racha > 0) {
            state.escudos -= 1;
            state.escudoUsadoEn = state.dia;
          } else {
            state.racha = 0;
          }
        } else if (salto > 1) {
          // Días sin abrir la app: un escudo cubre a lo sumo un día perdido.
          var diasPerdidos = salto - 1;
          if (gananciaDiaPrev > 0) {
            if (diasPerdidos === 1 && state.escudos > 0 && state.racha > 0) {
              state.escudos -= 1;
              state.escudoUsadoEn = dayOffsetStr(state.dia, 1);
              state.racha += 1;
            } else {
              state.racha = 1;
            }
          } else {
            state.racha = 0;
          }
        }
        if (state.racha > state.mejorRacha) state.mejorRacha = state.racha;
        state.dia = t;
        state.xpInicioDia = state.xpUltimo;
      }

      if (xp > state.xpUltimo) {
        ganadas = Math.floor((xp - state.xpUltimo) / XP_POR_MONEDA);
        if (ganadas > 0) state.monedas += ganadas;
        state.xpUltimo = xp;
      }
      saveState();
      return ganadas;
    }

    /* ---------------- cosméticos ---------------- */
    function applyCosmetics() {
      var b = document.body;
      if (!b) return;
      b.classList.toggle("ts-tema-aurora", state.tema === "tema-aurora");
      b.classList.toggle("ts-tema-synthwave", state.tema === "tema-synthwave");
      b.classList.toggle("ts-marco-on", !!state.marco);
      var badge = document.getElementById("ts-titulo");
      if (state.titulo) {
        if (!badge) {
          var name = document.getElementById("side-name");
          if (name && name.parentNode) {
            badge = document.createElement("span");
            badge.id = "ts-titulo";
            badge.className = "ts-titulo";
            badge.textContent = " · el Imparable";
            name.parentNode.insertBefore(badge, name.nextSibling);
          }
        }
      } else if (badge && badge.parentNode) {
        badge.parentNode.removeChild(badge);
      }
    }

    /* ---------------- interfaz ---------------- */
    var openBtn = null;
    var overlay = null;

    function updateOpenButton() {
      if (!openBtn) return;
      openBtn.textContent = "🪙 Tesoro · " + state.monedas;
      openBtn.setAttribute("aria-label",
        "Abrir el Tesoro: tenés " + state.monedas + " monedas neón, " +
        state.escudos + " escudos de racha y una racha de actividad de " +
        state.racha + " días.");
    }

    function injectOpenButton() {
      if (openBtn && document.body.contains(openBtn)) return;
      var host = document.querySelector("#side-settings .side-settings-body") ||
        document.querySelector(".hud") || document.body;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = "ts-open";
      btn.className = "ts-open-btn";
      btn.setAttribute("aria-haspopup", "dialog");
      btn.addEventListener("click", function (ev) {
        try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
        openPanel();
      });
      host.appendChild(btn);
      openBtn = btn;
      updateOpenButton();
    }

    function buildPanel() {
      if (overlay && document.body.contains(overlay)) return;
      overlay = document.createElement("div");
      overlay.className = "ts-overlay";
      overlay.hidden = true;
      overlay.innerHTML =
        '<div class="ts-card" role="dialog" aria-modal="true" aria-label="Tesoro: tienda cosmética y escudo de racha">' +
          '<div class="ts-head">' +
            '<span class="ts-title">🪙 Tesoro</span>' +
            '<button type="button" class="ts-close" aria-label="Cerrar el Tesoro">✕</button>' +
          '</div>' +
          '<div class="ts-body"></div>' +
        '</div>';
      overlay.addEventListener("click", function (ev) {
        if (ev.target === overlay) closePanel();
      });
      overlay.querySelector(".ts-close").addEventListener("click", closePanel);
      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape" && overlay && !overlay.hidden) closePanel();
      });
      document.body.appendChild(overlay);
    }

    function openPanel() {
      buildPanel();
      syncProgress();
      applyCosmetics();
      render();
      overlay.hidden = false;
      var close = overlay.querySelector(".ts-close");
      if (close) { try { close.focus(); } catch (e) {} }
    }
    function closePanel() {
      if (overlay) overlay.hidden = true;
      updateOpenButton();
      if (openBtn) { try { openBtn.focus(); } catch (e) {} }
    }

    function itemActive(item) {
      if (item.id === "marco") return state.marco;
      if (item.id === "titulo") return state.titulo;
      return state.tema === item.id;
    }
    function toggleItem(item) {
      if (item.id === "marco") state.marco = !state.marco;
      else if (item.id === "titulo") state.titulo = !state.titulo;
      else state.tema = (state.tema === item.id) ? "" : item.id;
      saveState();
      applyCosmetics();
      render();
    }

    function render() {
      var body = overlay.querySelector(".ts-body");
      var html = "";
      html += '<p class="ts-balance">Tenés <b>' + state.monedas +
        ' 🪙 monedas neón</b> <span class="ts-dim">(1 por cada ' + XP_POR_MONEDA +
        ' XP nuevos que ganés)</span></p>';

      html += '<div class="ts-streak">' +
        '<p class="ts-streak-line">🔥 Racha de actividad de la capa: <b>' + state.racha +
        ' días</b>' + (state.mejorRacha > 0 ? ' · mejor: ' + state.mejorRacha : '') + '</p>' +
        '<p class="ts-streak-line">🛡️ Escudos: <b>' + state.escudos + '/' + MAX_ESCUDOS +
        '</b> — un escudo salva tu racha si un día no ganás XP.</p>';
      if (state.escudoUsadoEn) {
        html += '<p class="ts-saved">🛡️ Tu escudo salvó tu racha el ' +
          esc(state.escudoUsadoEn) + '.</p>';
      }
      if (state.escudos < MAX_ESCUDOS) {
        html += '<button type="button" class="ts-buy" data-buy="escudo"' +
          (state.monedas < PRECIO_ESCUDO ? " disabled" : "") +
          '>Comprar escudo · ' + PRECIO_ESCUDO + ' 🪙</button>';
      }
      html += "</div>";

      html += '<p class="ts-shop-title">Tienda cosmética</p>';
      for (var i = 0; i < SHOP.length; i++) {
        var item = SHOP[i];
        var owned = owns(item.id);
        var active = owned && itemActive(item);
        html += '<div class="ts-item">' +
          '<div class="ts-item-info"><b>' + esc(item.nombre) + '</b>' +
          '<span>' + esc(item.desc) + '</span></div>';
        if (!owned) {
          html += '<button type="button" class="ts-buy" data-buy="' + item.id + '"' +
            (state.monedas < item.precio ? " disabled" : "") + '>' +
            item.precio + ' 🪙</button>';
        } else {
          html += '<button type="button" class="ts-toggle" data-toggle="' + item.id + '">' +
            (active ? "Activo ✓ · quitar" : "Activar") + '</button>';
        }
        html += "</div>";
      }
      html += '<p class="ts-note">Los cosméticos solo cambian cómo se ve tu ODEA; ' +
        'no dan XP ni ventajas. La racha y el escudo viven en esta capa: ' +
        'la racha 🔥 principal de ODEA es del núcleo y no se toca.</p>';
      body.innerHTML = html;

      var buys = body.querySelectorAll("[data-buy]");
      for (var j = 0; j < buys.length; j++) {
        buys[j].addEventListener("click", onBuy);
      }
      var toggles = body.querySelectorAll("[data-toggle]");
      for (var k = 0; k < toggles.length; k++) {
        toggles[k].addEventListener("click", onToggle);
      }
    }

    function onBuy(ev) {
      var id = ev.currentTarget.getAttribute("data-buy");
      if (id === "escudo") {
        if (state.escudos >= MAX_ESCUDOS || state.monedas < PRECIO_ESCUDO) return;
        state.monedas -= PRECIO_ESCUDO;
        state.escudos += 1;
      } else {
        var item = null;
        for (var i = 0; i < SHOP.length; i++) if (SHOP[i].id === id) item = SHOP[i];
        if (!item || owns(id) || state.monedas < item.precio) return;
        state.monedas -= item.precio;
        state.propios.push(id);
        // Recién comprado = se activa de una vez.
        if (id === "marco") state.marco = true;
        else if (id === "titulo") state.titulo = true;
        else state.tema = id;
      }
      saveState();
      applyCosmetics();
      updateOpenButton();
      render();
    }
    function onToggle(ev) {
      var id = ev.currentTarget.getAttribute("data-toggle");
      for (var i = 0; i < SHOP.length; i++) {
        if (SHOP[i].id === id) { toggleItem(SHOP[i]); updateOpenButton(); return; }
      }
    }

    /* ---------------- arranque ---------------- */
    function install() {
      loadState();
      if (totalXPNow() === null) return;
      syncProgress();
      injectOpenButton();
      buildPanel();
      applyCosmetics();
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", install, { once: true });
    } else {
      install();
    }
  } catch (err) {
    try {
      if (window.console && console.warn) {
        console.warn("ODEA Tesoro v1 no se pudo montar:", err);
      }
    } catch (e) {}
  }
})();
