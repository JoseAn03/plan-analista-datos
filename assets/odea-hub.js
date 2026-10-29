/*
 * ODEA Hub v1 — Fase 6 (Ecosistema): Centro de Comando.
 * Capa independiente que CONECTA a las demás sin tocar sus claves:
 * - Lee (solo lectura) el estado del núcleo y de las capas Anomalías,
 *   Quiz, Jefe y Tesoro desde sus claves públicas de localStorage.
 * - Muestra todo en un panel: nivel/racha/XP, Ruta del día y el estado
 *   de cada capa.
 * - Al completarse la Ruta del día deja un bonus en su "buzón"
 *   (su propia clave odea_hub_v1); el Tesoro lo cobra en su casa.
 * - Escucha el bus del núcleo (ODEA.bus) para refrescar su botón.
 * Su único almacenamiento es odea_hub_v1; no escribe claves ajenas.
 */
(function () {
  "use strict";
  try {
    var STORAGE_KEY = "odea_hub_v1";
    var RUTA_BONUS = 15;
    var XP_EVENTS = ["mission.completed", "job.applied", "focus.completed",
      "diary.written", "boss.defeated", "achievement.unlocked",
      "quiz.completed", "anomalia.claimed", "jefe.superado"];

    /* ---------------- utilidades ---------------- */
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function todayStr() {
      var d = new Date();
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }
    function esc(s) {
      return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
    function readJSON(key) {
      try {
        var raw = localStorage.getItem(key);
        if (!raw) return null;
        var o = JSON.parse(raw);
        return (o && typeof o === "object") ? o : null;
      } catch (e) { return null; }
    }
    function num(v) { v = parseInt(v, 10); return isNaN(v) ? 0 : v; }
    function totalXPNow() {
      try {
        if (typeof gameState !== "undefined" && gameState &&
            typeof gameState.totalXP === "number" && isFinite(gameState.totalXP)) {
          return gameState.totalXP;
        }
      } catch (e) {}
      return null;
    }
    function busOn(tipo, fn) {
      try {
        if (window.ODEA && ODEA.bus && typeof ODEA.bus.on === "function") {
          ODEA.bus.on(tipo, fn);
        }
      } catch (e) {}
    }

    /* ---------------- lecturas del ecosistema ---------------- */
    function snapshot() {
      var t = todayStr();
      var xp = totalXPNow();
      var anm = readJSON("odea_anomalia_v1");
      var qz = readJSON("odea_quiz_v1");
      var jf = readJSON("odea_jefe_v1");
      var ts = readJSON("odea_tesoro_v1");

      var rankEl = document.querySelector("#side-rank");
      var s = {
        xp: xp,
        rachaNucleo: null,
        nivelTxt: rankEl ? rankEl.textContent.trim() : "",
        anm: null, qz: null, jf: null, ts: null,
        xpHoy: null
      };
      try {
        if (typeof gameState !== "undefined" && gameState &&
            typeof gameState.streak === "number") s.rachaNucleo = gameState.streak;
      } catch (e) {}

      if (anm) {
        s.anm = {
          fragmentos: num(anm.fragmentos),
          cartaHoy: anm.ultimaCarta === t,
          reclamada: anm.ultimaCarta === t && !!anm.reclamada
        };
      }
      if (qz) {
        var resp = Array.isArray(qz.respuestas) ? qz.respuestas : [];
        var answered = 0, correct = 0;
        for (var i = 0; i < resp.length; i++) {
          if (resp[i] !== null && resp[i] !== undefined) {
            answered++;
            if (resp[i] === true) correct++;
          }
        }
        s.qz = {
          hechoHoy: qz.fecha === t && answered >= 3,
          aciertosHoy: qz.fecha === t ? correct : 0,
          respondidas: num(qz.respondidas),
          aciertos: num(qz.aciertos)
        };
      }
      if (jf && xp !== null) {
        var ganSemana = Math.max(0, xp - num(jf.xpInicio));
        s.jf = {
          mejor: num(jf.mejorGanancia),
          mejorSemana: jf.mejorSemana || "",
          ganSemana: ganSemana,
          pct: num(jf.mejorGanancia) > 0
            ? Math.min(100, Math.round(ganSemana / num(jf.mejorGanancia) * 100))
            : null,
          superado: num(jf.mejorGanancia) > 0 && ganSemana > num(jf.mejorGanancia)
        };
      }
      if (ts) {
        s.ts = {
          monedas: num(ts.monedas),
          escudos: num(ts.escudos),
          racha: num(ts.racha)
        };
        if (ts.dia === t && xp !== null) {
          s.xpHoy = Math.max(0, xp - num(ts.xpInicioDia));
        } else if (ts.dia === t) {
          s.xpHoy = 0;
        }
      }
      s.ruta = {
        anomalia: !!(s.anm && s.anm.reclamada),
        quiz: !!(s.qz && s.qz.hechoHoy),
        xp: s.xpHoy !== null && s.xpHoy > 0
      };
      s.rutaCount = (s.ruta.anomalia ? 1 : 0) + (s.ruta.quiz ? 1 : 0) + (s.ruta.xp ? 1 : 0);
      return s;
    }

    /* ---------------- estado propio (buzón) ---------------- */
    function defaultState() { return { v: 1, rutaFecha: "", pendientes: [] }; }
    var state = defaultState();
    function loadState() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        var s = JSON.parse(raw);
        if (!s || typeof s !== "object") return;
        state.rutaFecha = typeof s.rutaFecha === "string" ? s.rutaFecha : "";
        state.pendientes = Array.isArray(s.pendientes) ? s.pendientes.slice(0, 20) : [];
      } catch (e) {}
    }
    function saveState() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }
    /* Si la ruta se completó hoy y aún no se registró, deja el bonus. */
    function checkRuta(s) {
      var t = todayStr();
      if (s.rutaCount < 3 || state.rutaFecha === t) return false;
      state.rutaFecha = t;
      state.pendientes.push({ id: "ruta-" + t, monedas: RUTA_BONUS, tipo: "ruta", fecha: t });
      // Poda: conservar solo pendientes de los últimos 14 días.
      var limite = t;
      state.pendientes = state.pendientes.filter(function (p) {
        return p && typeof p.fecha === "string" && p.fecha >= limiteMinus(limite, 14);
      });
      saveState();
      return true;
    }
    function limiteMinus(fecha, dias) {
      var p = fecha.split("-");
      var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
      d.setDate(d.getDate() - dias);
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    /* ---------------- interfaz ---------------- */
    var openBtn = null;
    var overlay = null;

    function updateOpenButton() {
      if (!openBtn) return;
      var s = snapshot();
      openBtn.textContent = s.rutaCount >= 3
        ? "🛰️ Centro · Ruta completa 🎉"
        : "🛰️ Centro · Ruta " + s.rutaCount + "/3";
      openBtn.setAttribute("aria-label",
        "Abrir el Centro de Comando del ecosistema ODEA. Ruta del día: " +
        s.rutaCount + " de 3.");
    }

    function injectOpenButton() {
      if (openBtn && document.body.contains(openBtn)) return;
      var host = document.querySelector("#side-settings .side-settings-body") ||
        document.querySelector(".hud") || document.body;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = "hub-open";
      btn.className = "hub-open-btn";
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
      overlay.className = "hub-overlay";
      overlay.hidden = true;
      overlay.innerHTML =
        '<div class="hub-card" role="dialog" aria-modal="true" aria-label="Centro de Comando del ecosistema ODEA">' +
          '<div class="hub-head">' +
            '<span class="hub-title">🛰️ Centro de Comando</span>' +
            '<button type="button" class="hub-close" aria-label="Cerrar el Centro de Comando">✕</button>' +
          '</div>' +
          '<div class="hub-body"></div>' +
        '</div>';
      overlay.addEventListener("click", function (ev) {
        if (ev.target === overlay) closePanel();
      });
      overlay.querySelector(".hub-close").addEventListener("click", closePanel);
      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape" && overlay && !overlay.hidden) closePanel();
      });
      document.body.appendChild(overlay);
    }

    function openPanel() {
      buildPanel();
      render();
      overlay.hidden = false;
      var close = overlay.querySelector(".hub-close");
      if (close) { try { close.focus(); } catch (e) {} }
    }
    function closePanel() {
      if (overlay) overlay.hidden = true;
      updateOpenButton();
      if (openBtn) { try { openBtn.focus(); } catch (e) {} }
    }

    function checkLine(ok, label, extra) {
      return '<p class="hub-check">' + (ok ? "✅" : "⬜") + " " + esc(label) +
        (extra ? ' <span class="hub-dim">' + esc(extra) + "</span>" : "") + "</p>";
    }

    function render() {
      var body = overlay.querySelector(".hub-body");
      var s = snapshot();
      var rutaNueva = checkRuta(s);
      var html = "";

      html += '<p class="hub-status">' +
        (s.nivelTxt ? esc(s.nivelTxt) + " · " : "") +
        (s.xp !== null ? "<b>" + s.xp + " XP</b>" : "") +
        (s.rachaNucleo !== null ? " · 🔥 racha " + s.rachaNucleo : "") +
        (s.xpHoy !== null ? " · hoy +" + s.xpHoy + " XP" : "") + "</p>";

      html += '<div class="hub-ruta"><p class="hub-sec">🧭 Ruta del día</p>';
      html += checkLine(s.ruta.anomalia, "Reclamar la anomalía diaria",
        s.anm ? (s.anm.reclamada ? "" : (s.anm.cartaHoy ? "carta lista" : "sin abrir hoy")) : "capa no activa");
      html += checkLine(s.ruta.quiz, "Completar el micro-quiz (3 preguntas)",
        s.qz && s.ruta.quiz ? s.qz.aciertosHoy + "/3 correctas" : "");
      html += checkLine(s.ruta.xp, "Ganar XP hoy en el núcleo",
        s.xpHoy !== null ? "+" + s.xpHoy + " XP" : "sin datos");
      if (s.rutaCount >= 3) {
        html += '<p class="hub-ruta-done">🎉 Ruta completa' +
          (rutaNueva || state.rutaFecha === todayStr()
            ? " — bonus de +" + RUTA_BONUS + " 🪙 esperando en el Tesoro."
            : ".") + "</p>";
      } else {
        html += '<p class="hub-dim">Completá las 3 y el Tesoro recibe +' + RUTA_BONUS + ' 🪙 de bonus.</p>';
      }
      html += "</div>";

      html += '<p class="hub-sec">🧩 Capas del ecosistema</p>';
      html += '<p class="hub-layer">🎴 <b>Anomalías</b> — ' +
        (s.anm ? s.anm.fragmentos + " ◆ Fragmentos" +
          (s.anm.reclamada ? " · carta de hoy reclamada ✓" : " · carta de hoy pendiente") : "sin datos") + "</p>";
      html += '<p class="hub-layer">🧠 <b>Quiz</b> — ' +
        (s.qz ? (s.qz.hechoHoy ? "hoy: " + s.qz.aciertosHoy + "/3 ✓" : "hoy pendiente") +
          " · total " + s.qz.aciertos + "/" + s.qz.respondidas : "sin datos") + "</p>";
      html += '<p class="hub-layer">👹 <b>Jefe y fantasma</b> — ' +
        (s.jf ? (s.jf.mejor > 0
          ? "fantasma +" + s.jf.mejor + " XP · esta semana +" + s.jf.ganSemana +
            " XP (" + s.jf.pct + "%)" + (s.jf.superado ? " · ¡superado! 🏆" : "")
          : "semana de origen · esta semana +" + s.jf.ganSemana + " XP") : "sin datos") + "</p>";
      html += '<p class="hub-layer">🪙 <b>Tesoro</b> — ' +
        (s.ts ? s.ts.monedas + " monedas · 🛡️ " + s.ts.escudos +
          " · racha de capa " + s.ts.racha + " días" : "sin datos") + "</p>";

      html += '<p class="hub-note">Todo conectado por el bus de eventos del núcleo: ' +
        'completar misiones paga monedas en vivo, el quiz y la anomalía dan ' +
        'bonus de sinergia al Tesoro, y en el Tesoro podés cambiar 1 ◆ por 5 🪙.</p>';
      body.innerHTML = html;
    }

    /* ---------------- arranque ---------------- */
    function install() {
      loadState();
      if (totalXPNow() === null) return;
      injectOpenButton();
      buildPanel();
      checkRuta(snapshot());
      for (var i = 0; i < XP_EVENTS.length; i++) {
        busOn(XP_EVENTS[i], function () {
          updateOpenButton();
          if (overlay && !overlay.hidden) render();
        });
      }
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", install, { once: true });
    } else {
      install();
    }
  } catch (err) {
    try {
      if (window.console && console.warn) {
        console.warn("ODEA Hub v1 no se pudo montar:", err);
      }
    } catch (e) {}
  }
})();
