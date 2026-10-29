/*
 * ODEA Quiz v1 — Fase 3: micro-quiz diario de entrevista.
 * Capa independiente (patrón de odea-juice / odea-anomalias):
 * - No modifica funciones del núcleo, saveGame, sumXP ni las claves odea_* existentes.
 * - Su único almacenamiento es la clave propia odea_quiz_v1.
 * - Consume el banco window.ODEA_QUIZ_BANK.entrevista (assets/odea-quiz-bank.js).
 * - 3 preguntas por día, selección determinista por fecha; una partida por día.
 * - El XP de ODEA es derivado (sumXP): esta capa no otorga XP, lleva sus
 *   propias estadísticas (aciertos, días jugados, racha de quiz).
 */
(function () {
  "use strict";
  try {
    var STORAGE_KEY = "odea_quiz_v1";
    var DAILY_COUNT = 3;

    var BANK = (window.ODEA_QUIZ_BANK && window.ODEA_QUIZ_BANK.entrevista) || [];
    if (!BANK || BANK.length < DAILY_COUNT) return;

    /* ---------------- utilidades ---------------- */
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function todayStr() {
      var d = new Date();
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }
    function dateStrOffset(days) {
      var d = new Date();
      d.setDate(d.getDate() + days);
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }
    function hash(str) {
      var h = 5381;
      for (var i = 0; i < str.length; i++) {
        h = ((h << 5) + h + str.charCodeAt(i)) | 0;
      }
      return Math.abs(h);
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

    /* ---------------- estado ---------------- */
    function defaultState() {
      return {
        v: 1,
        fecha: "",
        seleccion: [],
        respuestas: [],
        aciertos: 0,
        respondidas: 0,
        dias: 0,
        racha: 0,
        ultimaJugada: ""
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
        d.fecha = typeof s.fecha === "string" ? s.fecha : "";
        d.seleccion = Array.isArray(s.seleccion) ? s.seleccion.slice(0, DAILY_COUNT) : [];
        d.respuestas = Array.isArray(s.respuestas) ? s.respuestas.slice(0, DAILY_COUNT) : [];
        d.aciertos = clampInt(s.aciertos, 0, 999999);
        d.respondidas = clampInt(s.respondidas, 0, 999999);
        d.dias = clampInt(s.dias, 0, 99999);
        d.racha = clampInt(s.racha, 0, 99999);
        d.ultimaJugada = typeof s.ultimaJugada === "string" ? s.ultimaJugada : "";
        state = d;
      } catch (e) { /* estado corrupto: se usa el default */ }
    }
    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) { /* almacenamiento no disponible: la capa sigue en memoria */ }
    }

    /* ---------------- selección diaria ---------------- */
    function selectionFor(dateStr) {
      var n = BANK.length;
      var seed = hash("odea-quiz:" + dateStr);
      var picked = [];
      var start = seed % n;
      var step = 1 + (seed % 13);
      var idx = start;
      var guard = 0;
      while (picked.length < DAILY_COUNT && guard < n * 2) {
        if (picked.indexOf(idx) === -1) picked.push(idx);
        idx = (idx + step) % n;
        guard++;
      }
      return picked;
    }
    function ensureToday() {
      var t = todayStr();
      if (state.fecha === t && state.seleccion.length === DAILY_COUNT) return;
      var sel = selectionFor(t);
      // Evitar repetir exactamente el set de ayer: semilla alterna.
      var yest = selectionFor(dateStrOffset(-1)).slice().sort().join(",");
      if (sel.slice().sort().join(",") === yest) sel = selectionFor(t + "#2");
      state.fecha = t;
      state.seleccion = sel;
      state.respuestas = [null, null, null];
      saveState();
    }
    function answeredCount() {
      var c = 0;
      for (var i = 0; i < state.respuestas.length; i++) {
        if (state.respuestas[i] !== null && state.respuestas[i] !== undefined) c++;
      }
      return c;
    }
    function isDone() { return answeredCount() >= DAILY_COUNT; }
    function todayScore() {
      var c = 0;
      for (var i = 0; i < state.respuestas.length; i++) {
        if (state.respuestas[i] === true) c++;
      }
      return c;
    }

    /* ---------------- interfaz ---------------- */
    var openBtn = null;
    var overlay = null;
    var currentStep = 0;

    function updateOpenButton() {
      if (!openBtn) return;
      var done = isDone();
      openBtn.textContent = done ? "🧠 Quiz de hoy ✓" : "🧠 Quiz · 3 de hoy";
      openBtn.classList.toggle("qz-is-done", done);
      openBtn.setAttribute("aria-label", done
        ? "Micro-quiz de entrevista de hoy ya completado. Ver resultado."
        : "Abrir el micro-quiz de entrevista de hoy: 3 preguntas.");
    }

    function injectOpenButton() {
      if (openBtn && document.body.contains(openBtn)) return;
      var host = document.querySelector("#side-settings .side-settings-body") ||
        document.querySelector(".hud") || document.body;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = "qz-open";
      btn.className = "qz-open-btn";
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
      overlay.className = "qz-overlay";
      overlay.hidden = true;
      overlay.innerHTML =
        '<div class="qz-card" role="dialog" aria-modal="true" aria-label="Micro-quiz de entrevista">' +
          '<div class="qz-head">' +
            '<span class="qz-title">🧠 Micro-quiz de entrevista</span>' +
            '<button type="button" class="qz-close" aria-label="Cerrar el quiz">✕</button>' +
          '</div>' +
          '<div class="qz-body"></div>' +
        '</div>';
      overlay.addEventListener("click", function (ev) {
        if (ev.target === overlay) closePanel();
      });
      overlay.querySelector(".qz-close").addEventListener("click", closePanel);
      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape" && overlay && !overlay.hidden) closePanel();
      });
      document.body.appendChild(overlay);
    }

    function openPanel() {
      buildPanel();
      ensureToday();
      currentStep = answeredCount();
      render();
      overlay.hidden = false;
      var close = overlay.querySelector(".qz-close");
      if (close) { try { close.focus(); } catch (e) {} }
    }
    function closePanel() {
      if (overlay) overlay.hidden = true;
      updateOpenButton();
      if (openBtn) { try { openBtn.focus(); } catch (e) {} }
    }

    function render() {
      var body = overlay.querySelector(".qz-body");
      if (isDone()) { renderSummary(body); return; }
      renderQuestion(body);
    }

    function renderQuestion(body) {
      var q = BANK[state.seleccion[currentStep]];
      if (!q) { renderSummary(body); return; }
      var html = "";
      html += '<div class="qz-progress">Pregunta ' + (currentStep + 1) + " de " +
        DAILY_COUNT + (q.tema ? ' · <span class="qz-tema">' + esc(q.tema) + "</span>" : "") + "</div>";
      html += '<p class="qz-question">' + esc(q.pregunta) + "</p>";
      html += '<div class="qz-options">';
      for (var i = 0; i < q.opciones.length; i++) {
        html += '<button type="button" class="qz-option" data-idx="' + i + '">' +
          esc(q.opciones[i]) + "</button>";
      }
      html += "</div>";
      html += '<div class="qz-feedback" hidden></div>';
      body.innerHTML = html;

      var buttons = body.querySelectorAll(".qz-option");
      for (var j = 0; j < buttons.length; j++) {
        buttons[j].addEventListener("click", onAnswer);
      }
    }

    function onAnswer(ev) {
      var btn = ev.currentTarget;
      var body = overlay.querySelector(".qz-body");
      var q = BANK[state.seleccion[currentStep]];
      if (!q) return;
      var chosen = parseInt(btn.getAttribute("data-idx"), 10);
      var correct = chosen === q.correcta;

      state.respuestas[currentStep] = correct;
      state.respondidas += 1;
      if (correct) state.aciertos += 1;

      var last = currentStep === DAILY_COUNT - 1;
      if (last) {
        var t = todayStr();
        if (state.ultimaJugada !== t) {
          state.dias += 1;
          state.racha = (state.ultimaJugada === dateStrOffset(-1)) ? state.racha + 1 : 1;
          state.ultimaJugada = t;
        }
      }
      saveState();

      var buttons = body.querySelectorAll(".qz-option");
      for (var i = 0; i < buttons.length; i++) {
        var idx = parseInt(buttons[i].getAttribute("data-idx"), 10);
        buttons[i].disabled = true;
        if (idx === q.correcta) buttons[i].classList.add("qz-is-correct");
        else if (idx === chosen) buttons[i].classList.add("qz-is-wrong");
      }
      var fb = body.querySelector(".qz-feedback");
      fb.hidden = false;
      fb.innerHTML =
        '<p class="qz-verdict">' + (correct ? "✅ ¡Correcta!" : "❌ No es esa.") + "</p>" +
        (q.explicacion ? '<p class="qz-explain">' + esc(q.explicacion) + "</p>" : "") +
        '<button type="button" class="qz-next">' +
          (last ? "Ver resultado 🏁" : "Siguiente →") + "</button>";
      fb.querySelector(".qz-next").addEventListener("click", function () {
        if (last) { renderSummary(body); updateOpenButton(); }
        else { currentStep += 1; renderQuestion(body); }
      });
    }

    function renderSummary(body) {
      var score = todayScore();
      var perfect = score === DAILY_COUNT;
      var html = "";
      html += '<p class="qz-score">' + (perfect ? "🎉 ¡Perfecto! " : "🏁 ") +
        "Hoy: " + score + "/" + DAILY_COUNT + " correctas</p>";
      html += '<p class="qz-stats">Total acumulado: ' + state.aciertos +
        " aciertos de " + state.respondidas + " respuestas · " +
        state.dias + (state.dias === 1 ? " día jugado" : " días jugados") +
        (state.racha > 1 ? " · 🔥 racha de quiz: " + state.racha + " días" : "") +
        "</p>";
      html += '<p class="qz-note">Mañana hay 3 preguntas nuevas del banco de entrevista. ' +
        "Practicá un poco cada día y llegás afilado a la entrevista.</p>";
      body.innerHTML = html;
    }

    /* ---------------- arranque ---------------- */
    function install() {
      loadState();
      ensureToday();
      injectOpenButton();
      buildPanel();
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", install, { once: true });
    } else {
      install();
    }
  } catch (err) {
    try {
      if (window.console && console.warn) {
        console.warn("ODEA Quiz v1 no se pudo montar:", err);
      }
    } catch (e) {}
  }
})();
