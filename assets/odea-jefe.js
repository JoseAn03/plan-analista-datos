/*
 * ODEA Jefe v1 — Fase 4: jefe con historia + fantasma (tu mejor semana).
 * Capa independiente (patrón de odea-juice / odea-anomalias / odea-quiz):
 * - No modifica funciones del núcleo, saveGame ni las claves odea_* existentes.
 * - Solo LEE el XP total del núcleo (gameState.totalXP, que el propio núcleo
 *   recalcula desde las misiones completadas) para medir la semana.
 * - Su único almacenamiento es la clave propia odea_jefe_v1.
 * - El "fantasma" es la ganancia de XP de tu mejor semana registrada;
 *   el jefe de la historia se derrota superando a ese fantasma.
 */
(function () {
  "use strict";
  try {
    var STORAGE_KEY = "odea_jefe_v1";

    /* ---------------- jefes (rotan por semana) ---------------- */
    var BOSSES = [
      {
        nombre: "Vorthak, el Devorador de Dashboards",
        titulo: "Terror de los reportes de los lunes",
        intro: "Vorthak se alimenta de dashboards rotos y reportes que nadie lee. Esta semana descendió a tu reino de datos para devorar tus paneles uno por uno. Solo hay una forma de expulsarlo: producir más XP que tu mejor semana registrada. Tu fantasma ya conoce el camino.",
        perdiendo: "Vorthak se ríe entre gráficos a medio cargar: «¿Eso es todo? Tu fantasma hizo más que vos a esta altura.»",
        ganando: "Vorthak retrocede, con los paneles ardiendo en verde: «Imposible… estás superando a tu propio fantasma.»",
        desenlace: "🏆 Vorthak huyó dejando caer un dashboard dorado. Superaste a tu fantasma: esta semana se convierte en tu nueva marca a vencer."
      },
      {
        nombre: "La Reina Nula",
        titulo: "Soberana de las celdas vacías",
        intro: "La Reina Nula siembra NULLs y celdas vacías en cada tabla que toca. Su hechizo favorito: que dejés todo «para después». Derrotala superando la ganancia de XP de tu mejor semana, la que guarda tu fantasma.",
        perdiendo: "La Reina Nula bosteza sobre un trono de celdas en blanco: «El vacío también es una respuesta, querido.»",
        ganando: "Las celdas se llenan de datos a tu paso y la Reina pierde su corona: «¡Mis vacíos! ¡Mis preciosos vacíos!»",
        desenlace: "🏆 La Reina Nula se disolvió en una tabla perfectamente limpia. Tu fantasma quedó atrás: nueva mejor semana registrada."
      },
      {
        nombre: "El Archivista Ciego",
        titulo: "Guardián de los archivos que nadie encuentra",
        intro: "El Archivista esconde cada archivo «en un lugar seguro» que ni él recuerda: reportes_final_v7_AHORA_SI.xlsx por todas partes. Ordená tu semana, superá a tu fantasma y obligalo a devolver el orden.",
        perdiendo: "El Archivista sonríe ajustándose las gafas empañadas: «Tu fantasma guardaba todo con nombre y fecha. Vos, no tanto.»",
        ganando: "Carpetas ordenadas, nombres claros, versiones únicas: el Archivista empieza a sudar tinta.",
        desenlace: "🏆 El Archivista entregó el índice maestro y se retiró. Tu semana superó a tu fantasma: queda registrada como la nueva marca."
      },
      {
        nombre: "Madame Duplicada",
        titulo: "Multiplicadora de filas infinitas",
        intro: "Madame Duplicada clona filas mientras dormís: cada tabla amanece con el doble de registros y la mitad de sentido. Tu fantasma conoce su debilidad: constancia. Superá su mejor semana y la Madame se queda sin copias.",
        perdiendo: "Madame Duplicada aplaude con cien manos idénticas: «Tu fantasma ya llevaba más XP que vos, y de él hice dos copias.»",
        ganando: "Tus registros únicos avanzan más rápido que sus clones: la Madame se está quedando sin tinta.",
        desenlace: "🏆 Madame Duplicada colapsó en una sola fila, limpia y única. Fantasma superado: esta semana es tu nueva mejor marca."
      }
    ];

    /* ---------------- utilidades ---------------- */
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function dateStr(d) {
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }
    function mondayStr(offsetWeeks) {
      var d = new Date();
      d.setHours(0, 0, 0, 0);
      var diff = (d.getDay() + 6) % 7; // lunes = 0
      d.setDate(d.getDate() - diff + (offsetWeeks || 0) * 7);
      return dateStr(d);
    }
    function hash(str) {
      var h = 5381;
      for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
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

    /* ---------------- estado ---------------- */
    function defaultState() {
      return {
        v: 1,
        semana: "",        // lunes de la semana en curso (YYYY-MM-DD)
        xpInicio: 0,       // XP total al iniciar la semana
        mejorSemana: "",   // lunes de la mejor semana registrada
        mejorGanancia: 0,  // ganancia de XP de esa mejor semana (el fantasma)
        semanas: 0,        // semanas cerradas registradas
        victorias: 0,      // semanas en que se superó al fantasma
        victoriaEn: ""     // lunes de la semana cuya victoria ya se contó
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
        d.semana = typeof s.semana === "string" ? s.semana : "";
        d.xpInicio = clampInt(s.xpInicio, 0, 2000000000);
        d.mejorSemana = typeof s.mejorSemana === "string" ? s.mejorSemana : "";
        d.mejorGanancia = clampInt(s.mejorGanancia, 0, 2000000000);
        d.semanas = clampInt(s.semanas, 0, 99999);
        d.victorias = clampInt(s.victorias, 0, 99999);
        d.victoriaEn = typeof s.victoriaEn === "string" ? s.victoriaEn : "";
        state = d;
      } catch (e) { /* estado corrupto: default */ }
    }
    function saveState() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    /* Semana en curso: al cambiar de semana se cierra la anterior
       (su ganancia compite por ser el nuevo fantasma) y se abre la nueva. */
    function ensureWeek() {
      var xp = totalXPNow();
      if (xp === null) return false;
      var monday = mondayStr(0);
      if (state.semana === monday) return true;
      if (state.semana === "") {
        state.semana = monday;
        state.xpInicio = xp;
        saveState();
        return true;
      }
      // Cierre de la semana anterior.
      var gananciaPrev = Math.max(0, xp - state.xpInicio);
      // Solo cuenta como semana registrada si hubo actividad medible o ya venía de antes.
      state.semanas += 1;
      if (gananciaPrev > state.mejorGanancia) {
        state.mejorGanancia = gananciaPrev;
        state.mejorSemana = state.semana;
      }
      state.semana = monday;
      state.xpInicio = xp;
      saveState();
      return true;
    }
    function gananciaActual() {
      var xp = totalXPNow();
      if (xp === null) return 0;
      return Math.max(0, xp - state.xpInicio);
    }
    function bossOfWeek() {
      return BOSSES[hash("odea-jefe:" + mondayStr(0)) % BOSSES.length];
    }

    /* ---------------- interfaz ---------------- */
    var openBtn = null;
    var overlay = null;

    function updateOpenButton() {
      if (!openBtn) return;
      var g = gananciaActual();
      var ghost = state.mejorGanancia;
      var txt = "👹 Jefe semanal";
      if (ghost > 0) txt += (g > ghost ? " · ¡superado! 🏆" : " · " + g + "/" + ghost + " XP");
      else if (g > 0) txt += " · +" + g + " XP";
      openBtn.textContent = txt;
      openBtn.setAttribute("aria-label",
        "Abrir el jefe semanal con historia y la carrera contra tu fantasma (tu mejor semana).");
    }

    function injectOpenButton() {
      if (openBtn && document.body.contains(openBtn)) return;
      var host = document.querySelector("#side-settings .side-settings-body") ||
        document.querySelector(".hud") || document.body;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = "jf-open";
      btn.className = "jf-open-btn";
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
      overlay.className = "jf-overlay";
      overlay.hidden = true;
      overlay.innerHTML =
        '<div class="jf-card" role="dialog" aria-modal="true" aria-label="Jefe semanal con historia">' +
          '<div class="jf-head">' +
            '<span class="jf-title">👹 Jefe semanal</span>' +
            '<button type="button" class="jf-close" aria-label="Cerrar el jefe semanal">✕</button>' +
          '</div>' +
          '<div class="jf-body"></div>' +
        '</div>';
      overlay.addEventListener("click", function (ev) {
        if (ev.target === overlay) closePanel();
      });
      overlay.querySelector(".jf-close").addEventListener("click", closePanel);
      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape" && overlay && !overlay.hidden) closePanel();
      });
      document.body.appendChild(overlay);
    }

    function openPanel() {
      buildPanel();
      ensureWeek();
      render();
      overlay.hidden = false;
      var close = overlay.querySelector(".jf-close");
      if (close) { try { close.focus(); } catch (e) {} }
    }
    function closePanel() {
      if (overlay) overlay.hidden = true;
      updateOpenButton();
      if (openBtn) { try { openBtn.focus(); } catch (e) {} }
    }

    function render() {
      var body = overlay.querySelector(".jf-body");
      var boss = bossOfWeek();
      var g = gananciaActual();
      var ghost = state.mejorGanancia;
      var html = "";

      html += '<p class="jf-boss-name">' + esc(boss.nombre) + "</p>";
      html += '<p class="jf-boss-title">' + esc(boss.titulo) + "</p>";
      html += '<p class="jf-story">' + esc(boss.intro) + "</p>";

      if (ghost > 0) {
        var pct = Math.min(100, Math.round((g / ghost) * 100));
        var superado = g > ghost;
        html += '<div class="jf-race">' +
          '<div class="jf-race-line"><span>👻 Tu fantasma (semana del ' +
            esc(state.mejorSemana) + ')</span><b>+' + ghost + ' XP</b></div>' +
          '<div class="jf-race-line"><span>⚡ Vos esta semana</span><b>+' + g + ' XP</b></div>' +
          '<div class="jf-bar"><div class="jf-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<p class="jf-pct">' + pct + '% del fantasma</p>' +
        "</div>";
        if (superado) {
          if (state.victoriaEn !== state.semana) {
            state.victoriaEn = state.semana;
            state.victorias += 1;
            saveState();
            try {
              if (window.ODEA && ODEA.bus && typeof ODEA.bus.emit === "function") {
                ODEA.bus.emit("jefe.superado", { fecha: dateStr(new Date()), ganancia: g, fantasma: ghost });
              }
            } catch (e) {}
          }
          html += '<p class="jf-quote jf-quote-win">' + esc(boss.desenlace) + "</p>";
        } else {
          html += '<p class="jf-quote">' + esc(g >= ghost * 0.5 ? boss.ganando : boss.perdiendo) + "</p>";
          html += '<p class="jf-note">Te faltan <b>' + (ghost - g + 1) +
            ' XP</b> para superar a tu fantasma y derrotar al jefe. ' +
            'Al cerrar la semana, tu marca de hoy queda registrada.</p>';
        }
      } else {
        html += '<div class="jf-race">' +
          '<p class="jf-origin">👻 <b>Semana de origen:</b> todavía no tenés fantasma. ' +
          'Tu ganancia de esta semana es <b>+' + g + ' XP</b>; al cerrar la semana, ' +
          'esa marca se convierte en tu primer fantasma y el jefe de la próxima semana ' +
          'te retará a superarla.</p>' +
        "</div>";
      }

      html += '<p class="jf-stats">Semanas registradas: ' + state.semanas +
        (state.mejorGanancia > 0 ? ' · Mejor semana: +' + state.mejorGanancia + ' XP' : '') +
        (state.victorias > 0 ? ' · 🏆 Victorias contra el fantasma: ' + state.victorias : '') +
        "</p>";
      body.innerHTML = html;
    }

    /* ---------------- arranque ---------------- */
    function install() {
      loadState();
      if (totalXPNow() === null) return; // sin lectura de XP no se monta
      ensureWeek();
      injectOpenButton();
      buildPanel();
      // Fase 6: la carrera contra el fantasma se refresca en vivo con el bus.
      var XP_EVENTS = ["mission.completed", "job.applied", "focus.completed",
        "diary.written", "boss.defeated"];
      for (var i = 0; i < XP_EVENTS.length; i++) {
        busOn(XP_EVENTS[i], function () {
          ensureWeek();
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
        console.warn("ODEA Jefe v1 no se pudo montar:", err);
      }
    } catch (e) {}
  }
})();
