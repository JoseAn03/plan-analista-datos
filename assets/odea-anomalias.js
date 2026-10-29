/*
 * ODEA Anomalías v1 — Fase 2: carta diaria y economía propia de Fragmentos.
 *
 * Capa aditiva y aislada:
 * - No modifica funciones del núcleo, saveGame, sumXP ni las claves odea_* existentes.
 * - Solo persiste odea_anomalia_v1, con la forma acordada.
 * - Envuelve acciones globales para detectar compleciones reales.
 * - No depende de la capa de jugo ni modifica sus archivos.
 */
(function () {
  "use strict";

  try {
    var STORAGE_KEY = "odea_anomalia_v1";
    var PULSO_COST = 5;
    var MAX_TRIES = 3;
    var CAZA_TARGET = 3;
    var FLOAT_MS = 1500;

    var TRIVIA = [
      {
        q: "¿Qué significa SQL?",
        o: ["Structured Query Language", "Simple Question List", "System Quality Level", "Server Query Logic"],
        c: 0,
        e: "SQL es el lenguaje estándar para consultar bases de datos relacionales."
      },
      {
        q: "En una tabla de datos, ¿qué es cada fila?",
        o: ["Una columna", "Un registro", "Una clave", "Un índice"],
        c: 1,
        e: "Cada fila es un registro; cada columna, un campo."
      },
      {
        q: "¿Qué lenguaje de fórmulas usa Power BI?",
        o: ["VBA", "DAX", "M", "SQL"],
        c: 1,
        e: "DAX es el lenguaje de cálculos de Power BI (M se usa en Power Query)."
      },
      {
        q: "¿De qué lenguaje es la librería pandas?",
        o: ["Java", "R", "Python", "JavaScript"],
        c: 2,
        e: "pandas es la librería de análisis de datos de Python."
      },
      {
        q: "¿Para qué sirve un gráfico de barras?",
        o: ["Comparar categorías", "Mostrar partes de un todo en el tiempo", "Medir correlación", "Predecir el futuro"],
        c: 0,
        e: "Las barras comparan valores entre categorías."
      },
      {
        q: "¿Cuál es la media de 2, 4 y 6?",
        o: ["3", "4", "5", "6"],
        c: 1,
        e: "(2+4+6)/3 = 4."
      },
      {
        q: "En Excel, ¿qué hace la función SUMA?",
        o: ["Cuenta celdas con texto", "Suma los valores de un rango", "Busca un valor", "Ordena datos"],
        c: 1,
        e: "SUMA agrega todos los números del rango indicado."
      },
      {
        q: "¿Qué es un valor nulo en un conjunto de datos?",
        o: ["Un cero", "Un error de fórmula", "Un dato faltante", "Un texto vacío siempre"],
        c: 2,
        e: "Nulo = ausencia de dato; no es lo mismo que cero."
      }
    ];

    var MILESTONES = [
      { n: 3, ico: "🔰", label: "3 de por vida" },
      { n: 7, ico: "🛰️", label: "7 de por vida" },
      { n: 15, ico: "🌌", label: "15 de por vida" }
    ];

    var TYPE_META = {
      trivia: { icon: "📡", title: "Trivia relámpago" },
      objetivo: { icon: "🎯", title: "Objetivo marcado" },
      caza: { icon: "🛰️", title: "Caza de señal" },
      cofre: { icon: "🎁", title: "Cofre de datos" }
    };

    var CLAIMED_TEXT = {
      trivia: "La trivia de hoy ya está cerrada. Vuelve mañana por otra señal.",
      objetivo: "El objetivo marcado ya se completó. +1 ◆ acreditado.",
      caza: "La caza de hoy ya está completa. +1 ◆ acreditado.",
      cofre: "El cofre de hoy ya se abrió. +1 ◆ acreditado."
    };

    var reducedMotion = false;
    try {
      reducedMotion = !!(window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) {}

    var state = null;
    var overlay = null;
    var panel = null;
    var openBtn = null;
    var closeBtn = null;
    var isOpen = false;
    var lastFocus = null;
    var pulseTimer = 0;
    var objectiveTimer = 0;
    var lastActionKey = "";
    var lastActionAt = 0;
    var lastNote = "";
    var lastNoteKind = "";

    /* ==========================================================
       1) Estado: única clave permitida y forma exacta
       ========================================================== */
    function pad2(n) {
      return n < 10 ? "0" + n : String(n);
    }

    function todayStr() {
      var d = new Date();
      return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
    }

    function clampInt(value, min, max) {
      var n = Math.floor(Number(value));
      if (!isFinite(n)) n = min;
      if (n < min) n = min;
      if (n > max) n = max;
      return n;
    }

    function defaultState() {
      return {
        ultimaCarta: "",
        tipo: "cofre",
        progreso: 0,
        reclamada: false,
        fragmentos: 0,
        fragmentosVida: 0,
        pulsoHasta: null
      };
    }

    function normalizeState(raw) {
      if (!raw || typeof raw !== "object") return null;
      var s = defaultState();
      var fecha = typeof raw.ultimaCarta === "string" ? raw.ultimaCarta : "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) s.ultimaCarta = fecha;

      if (raw.tipo === "trivia" || raw.tipo === "objetivo" ||
          raw.tipo === "caza" || raw.tipo === "cofre") {
        s.tipo = raw.tipo;
      } else {
        s.tipo = "";
      }

      s.progreso = clampInt(raw.progreso, 0, 999999);
      s.reclamada = raw.reclamada === true;
      s.fragmentos = clampInt(raw.fragmentos, 0, 999999);
      s.fragmentosVida = clampInt(raw.fragmentosVida, 0, 999999);

      /* La vida útil nunca puede ser menor que el saldo actual. */
      if (s.fragmentosVida < s.fragmentos) s.fragmentosVida = s.fragmentos;

      var hasta = raw.pulsoHasta;
      if (typeof hasta === "string" && hasta) {
        var parsed = Date.parse(hasta);
        if (isFinite(parsed)) hasta = parsed;
      }
      if (typeof hasta === "number" && isFinite(hasta) && hasta > 0) {
        s.pulsoHasta = hasta;
      } else {
        s.pulsoHasta = null;
      }

      return s;
    }

    function readState() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return normalizeState(JSON.parse(raw));
      } catch (e) {
        return null;
      }
    }

    function saveState() {
      if (!state) return;
      try {
        /* Se serializa un objeto plano con las ocho claves exactas. */
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ultimaCarta: state.ultimaCarta,
          tipo: state.tipo,
          progreso: state.progreso,
          reclamada: state.reclamada,
          fragmentos: state.fragmentos,
          fragmentosVida: state.fragmentosVida,
          pulsoHasta: state.pulsoHasta
        }));
      } catch (e) {}
    }

    function ensureState() {
      state = readState();
      if (!state) state = defaultState();

      var today = todayStr();
      if (!state.ultimaCarta || state.ultimaCarta !== today || !state.tipo) {
        generateCard();
        return true;
      }

      /* Si el objetivo guardado ya no existe, se recupera o se cambia a cofre. */
      if (state.tipo === "objetivo" && !state.reclamada) {
        var target = objectiveMission();
        if (!target) {
          var next = pickObjectiveMission();
          if (next) {
            state.progreso = missionIndex(next);
            saveState();
          } else {
            state.tipo = "cofre";
            state.progreso = 0;
            saveState();
          }
        }
      }

      return false;
    }

    function rollType() {
      var r = Math.random() * 100;
      if (r < 35) return "trivia";
      if (r < 65) return "objetivo";
      if (r < 90) return "caza";
      return "cofre";
    }

    function generateCard() {
      var tipo = rollType();
      var idx = 0;

      if (tipo === "objetivo") {
        var target = pickObjectiveMission();
        if (!target) {
          tipo = "cofre";
        } else {
          idx = missionIndex(target);
          if (idx < 0) {
            tipo = "cofre";
            idx = 0;
          }
        }
      }

      state.ultimaCarta = todayStr();
      state.tipo = tipo;
      state.progreso = idx;
      state.reclamada = false;
      lastNote = "";
      lastNoteKind = "";
      saveState();
    }

    /* ==========================================================
       2) Lectura defensiva del núcleo
       ========================================================== */
    function isDailyDone(id) {
      try {
        return !!(typeof gameState !== "undefined" && gameState &&
          gameState.completedDaily && gameState.completedDaily.indexOf(id) >= 0);
      } catch (e) {
        return false;
      }
    }

    function pendingOfDay(day) {
      try {
        if (typeof missionsOfDay === "function") {
          return missionsOfDay(day).filter(function (m) {
            return m && !isDailyDone(m.id);
          });
        }
      } catch (e) {}
      return [];
    }

    function pickObjectiveMission() {
      try {
        var day = 0;
        try {
          if (typeof selectedDay !== "undefined" && isFinite(Number(selectedDay))) {
            day = Number(selectedDay);
          }
        } catch (e) {}

        var list = [];
        if (day > 0) {
          var unlocked = true;
          try {
            if (typeof isDayUnlocked === "function") unlocked = !!isDayUnlocked(day);
          } catch (e) {}
          if (unlocked) list = pendingOfDay(day);
        }

        if (!list.length && typeof firstPendingDay === "function") {
          var pendingDay = firstPendingDay();
          if (pendingDay && isFinite(Number(pendingDay))) {
            list = pendingOfDay(Number(pendingDay));
          }
        }

        if (!list.length) {
          if (typeof dailyMissions !== "undefined" && dailyMissions && dailyMissions.length) {
            list = dailyMissions.filter(function (m) {
              return m && !isDailyDone(m.id);
            });
          }
        }

        return list.length ? list[0] : null;
      } catch (e) {
        return null;
      }
    }

    function dailyMissionByIndex(idx) {
      try {
        if (typeof dailyMissions !== "undefined" && dailyMissions && dailyMissions[idx]) {
          return dailyMissions[idx];
        }
      } catch (e) {}
      return null;
    }

    function missionIndex(mission) {
      try {
        if (typeof dailyMissions !== "undefined" && dailyMissions) {
          return dailyMissions.indexOf(mission);
        }
      } catch (e) {}
      return -1;
    }

    function objectiveMission() {
      if (!state) return null;
      var idx = clampInt(state.progreso, 0, 999999);
      return dailyMissionByIndex(idx);
    }

    function findObjectiveCard(mission) {
      try {
        var nodes = document.querySelectorAll("#daily-hero .dm-row[data-mid]");
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].getAttribute("data-mid") === mission.id) return nodes[i];
        }
      } catch (e) {}
      return null;
    }

    function currentXP() {
      try {
        if (typeof gameState !== "undefined" && gameState) {
          var n = Number(gameState.totalXP);
          if (isFinite(n)) return n;
        }
      } catch (e) {}
      return 0;
    }

    /* ==========================================================
       3) Recompensas, pulso y celebración propia
       ========================================================== */
    function endOfDay() {
      var d = new Date();
      d.setHours(23, 59, 59, 999);
      return d.getTime();
    }

    function pulseActive() {
      return !!(state && state.pulsoHasta &&
        Number(state.pulsoHasta) > Date.now());
    }

    function syncPulse() {
      if (!state) return;
      var until = Number(state.pulsoHasta);
      var active = isFinite(until) && until > Date.now();

      try {
        document.body.classList.toggle("anm-pulso", active);
      } catch (e) {}

      if (!active && state.pulsoHasta) {
        state.pulsoHasta = null;
        saveState();
      }

      if (pulseTimer) {
        clearTimeout(pulseTimer);
        pulseTimer = 0;
      }

      if (active) {
        var wait = Math.min(until - Date.now() + 1000, 2147480000);
        if (wait > 0) {
          pulseTimer = setTimeout(function () {
            pulseTimer = 0;
            try {
              syncPulse();
              updateUI();
            } catch (e) {}
          }, wait);
        }
      }
    }

    /* Fase 6 (Ecosistema): conversión de Fragmentos a Monedas del Tesoro.
       El Tesoro pide por el bus; SOLO esta capa descuenta de su clave
       y confirma. Dedup por id dentro de la sesión (el intercambio es
       sincrónico dentro de la misma página). */
    var cambiosVistos = {};
    function installCambio() {
      try {
        if (!(window.ODEA && ODEA.bus && typeof ODEA.bus.on === "function")) return;
        ODEA.bus.on("tesoro.cambio.solicitado", function (d) {
          try {
            if (!d || !d.id || cambiosVistos[d.id]) return;
            cambiosVistos[d.id] = true;
            if (!state || state.fragmentos < 1) {
              ODEA.bus.emit("anomalia.cambio.rechazado", { id: d.id, motivo: "sin-fragmentos" });
              return;
            }
            state.fragmentos = clampInt(state.fragmentos - 1, 0, 999999);
            saveState();
            updateUI();
            ODEA.bus.emit("anomalia.cambio.confirmado", { id: d.id });
          } catch (e) {}
        });
      } catch (e) {}
    }

    function claimReward(kind, opts) {
      if (!state || state.reclamada) return false;
      opts = opts || {};

      var reward = opts.reward !== false;
      state.reclamada = true;

      if (reward) {
        state.fragmentos = clampInt(state.fragmentos + 1, 0, 999999);
        state.fragmentosVida = clampInt(state.fragmentosVida + 1, 0, 999999);
      }

      if (kind === "caza") {
        state.progreso = CAZA_TARGET;
      } else if (kind === "cofre") {
        state.progreso = 1;
      } else if (kind === "trivia" && opts.attempts != null) {
        state.progreso = clampInt(opts.attempts, 0, MAX_TRIES);
      }

      saveState();
      try {
        if (window.ODEA && ODEA.bus && typeof ODEA.bus.emit === "function") {
          ODEA.bus.emit("anomalia.claimed", { fecha: todayStr(), kind: kind });
        }
      } catch (e) {}
      lastNote = opts.note || (reward ? "+1 ◆ Fragmento" : "Carta reclamada.");
      lastNoteKind = reward ? "ok" : "warn";
      updateUI();
      if (reward) celebrate(kind);
      return true;
    }

    function claimObjectiveIfDone() {
      if (!state || state.ultimaCarta !== todayStr() ||
          state.tipo !== "objetivo" || state.reclamada) {
        return false;
      }
      var target = objectiveMission();
      if (!target || !isDailyDone(target.id)) return false;
      return claimReward("objetivo", { note: "🎯 Objetivo completado. +1 ◆" });
    }

    function syncObjectiveMark() {
      try {
        var marked = document.querySelectorAll("#daily-hero .dm-row.anm-objetivo");
        for (var i = 0; i < marked.length; i++) {
          marked[i].classList.remove("anm-objetivo");
          marked[i].removeAttribute("data-anm-objetivo");
        }
      } catch (e) {}

      if (!state || state.tipo !== "objetivo" || state.reclamada ||
          state.ultimaCarta !== todayStr()) {
        return;
      }

      var target = objectiveMission();
      if (!target) return;

      if (isDailyDone(target.id)) {
        claimObjectiveIfDone();
        return;
      }

      var card = findObjectiveCard(target);
      if (card) {
        try {
          card.classList.add("anm-objetivo");
          card.setAttribute("data-anm-objetivo", target.id);
        } catch (e) {}
      }
    }

    function scheduleObjectiveSync() {
      if (objectiveTimer) return;
      objectiveTimer = setTimeout(function () {
        objectiveTimer = 0;
        try { syncObjectiveMark(); } catch (e) {}
      }, 60);
    }

    function showFloat(text) {
      if (reducedMotion) return;
      try {
        var el = document.createElement("div");
        el.className = "anm-float";
        el.textContent = text;

        var x = window.innerWidth / 2;
        var y = Math.max(70, window.innerHeight * 0.18);
        var anchor = null;
        if (isOpen && panel) {
          anchor = panel.getBoundingClientRect();
        } else if (openBtn) {
          anchor = openBtn.getBoundingClientRect();
        }

        if (anchor && anchor.width && anchor.height) {
          x = anchor.left + anchor.width / 2;
          y = isOpen ? Math.max(60, anchor.top + 76) : Math.max(50, anchor.top - 12);
        }

        el.style.left = x + "px";
        el.style.top = y + "px";
        document.body.appendChild(el);

        var removed = false;
        function remove() {
          if (removed) return;
          removed = true;
          try { el.remove(); } catch (e) {}
        }
        el.addEventListener("animationend", remove, { once: true });
        setTimeout(remove, FLOAT_MS + 300);
      } catch (e) {}
    }

    function pulseOpenButton() {
      if (reducedMotion || !openBtn) return;
      try {
        openBtn.classList.remove("anm-pulse");
        void openBtn.offsetWidth;
        openBtn.classList.add("anm-pulse");
        setTimeout(function () {
          try { openBtn.classList.remove("anm-pulse"); } catch (e) {}
        }, 900);
      } catch (e) {}
    }

    function celebrate(kind) {
      if (reducedMotion) return;
      var text = "+1 ◆";
      if (kind === "objetivo") text = "🎯 +1 ◆";
      else if (kind === "caza") text = "🛰️ +1 ◆";
      else if (kind === "cofre") text = "🎁 +1 ◆";

      showFloat(text);
      pulseOpenButton();

      if (kind === "objetivo") {
        var target = objectiveMission();
        var card = target ? findObjectiveCard(target) : null;
        if (card) {
          try {
            card.classList.add("anm-pulse");
            setTimeout(function () {
              try { card.classList.remove("anm-pulse"); } catch (e) {}
            }, 950);
          } catch (e) {}
        }
      }
    }

    function buyPulse() {
      if (!state) return;

      if (pulseActive()) {
        lastNote = "✦ El Pulso neón ya está activo hasta fin del día.";
        lastNoteKind = "warn";
        if (isOpen) renderPanel();
        return;
      }

      if (state.fragmentos < PULSO_COST) {
        lastNote = "Te faltan " + (PULSO_COST - state.fragmentos) + " ◆ para el Pulso neón.";
        lastNoteKind = "warn";
        if (isOpen) renderPanel();
        return;
      }

      state.fragmentos -= PULSO_COST;
      state.pulsoHasta = endOfDay();
      saveState();
      lastNote = "✦ Pulso neón activado hasta fin del día.";
      lastNoteKind = "ok";
      updateUI();
      showFloat("✦ Pulso neón");
      pulseOpenButton();
    }

    /* ==========================================================
       4) Interfaz inyectada
       ========================================================== */
    function updateOpenButton() {
      if (!openBtn) return;
      var n = state ? clampInt(state.fragmentos, 0, 999999) : 0;
      openBtn.textContent = "◆ " + n;
      openBtn.classList.toggle("anm-has-card", !!(state &&
        state.ultimaCarta === todayStr() && !state.reclamada));
      openBtn.title = "Anomalía diaria · " + n + " Fragmentos";
      openBtn.setAttribute("aria-label", "Abrir anomalía diaria. Tenés " + n + " Fragmentos.");
    }

    function ecoHost() {
      var side = document.querySelector(".app-side");
      var eco = document.getElementById("odea-eco");
      if (!eco && side) {
        eco = document.createElement("div");
        eco.id = "odea-eco";
        eco.className = "odea-eco";
        eco.innerHTML = '<p class="odea-eco-title">🌐 ECOSISTEMA</p>';
        var settings = document.getElementById("side-settings");
        if (settings && settings.parentNode === side) side.insertBefore(eco, settings);
        else side.appendChild(eco);
      }
      return eco || document.querySelector("#side-settings .side-settings-body") ||
        document.querySelector(".hud") || document.body;
    }

    function injectOpenButton() {
      if (openBtn && document.body.contains(openBtn)) return;

      var host = ecoHost();

      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = "anm-open";
      btn.className = "anm-frag-btn" +
        (host.classList && host.classList.contains("hud") ? " anm-is-compact" : "");
      btn.setAttribute("aria-haspopup", "dialog");
      btn.addEventListener("click", function (ev) {
        try {
          ev.preventDefault();
          ev.stopPropagation();
        } catch (e) {}
        openPanel();
      });

      host.appendChild(btn);

      openBtn = btn;
      updateOpenButton();
    }

    function buildPanel() {
      if (panel) return;

      overlay = document.createElement("div");
      overlay.id = "anm-overlay";
      overlay.className = "anm-overlay";
      overlay.setAttribute("aria-hidden", "true");
      overlay.addEventListener("click", function (ev) {
        if (ev.target === overlay) closePanel();
      });
      document.body.appendChild(overlay);

      panel = document.createElement("section");
      panel.id = "anm-panel";
      panel.className = "anm-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      panel.setAttribute("aria-labelledby", "anm-title");
      panel.setAttribute("aria-hidden", "true");
      panel.innerHTML =
        '<div class="anm-head">' +
          '<div class="anm-head-txt">' +
            '<div class="anm-kicker">ANOMALÍA DEL DÍA</div>' +
            '<h2 class="anm-title" id="anm-title">Señal detectada</h2>' +
          '</div>' +
          '<button type="button" class="anm-close" id="anm-close" aria-label="Cerrar anomalía">✕</button>' +
        '</div>' +
        '<div class="anm-content" id="anm-content"></div>' +
        '<div class="anm-foot" id="anm-foot"></div>';

      document.body.appendChild(panel);
      closeBtn = document.getElementById("anm-close");
      if (closeBtn) closeBtn.addEventListener("click", closePanel);

      panel.addEventListener("keydown", trapFocus);
      document.addEventListener("keydown", function (ev) {
        if (!isOpen) return;
        if (ev.key === "Escape") {
          ev.preventDefault();
          closePanel();
        }
      });
    }

    function trapFocus(ev) {
      if (!isOpen || ev.key !== "Tab" || !panel) return;
      var focusables = panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), ' +
        'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        try { last.focus(); } catch (e) {}
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        try { first.focus(); } catch (e) {}
      }
    }

    function openPanel() {
      if (!panel) buildPanel();
      if (!panel) return;

      lastFocus = document.activeElement;
      renderPanel();
      overlay.classList.add("anm-on");
      panel.classList.add("anm-on");
      overlay.setAttribute("aria-hidden", "false");
      panel.setAttribute("aria-hidden", "false");
      isOpen = true;

      setTimeout(function () {
        try {
          closeBtn.focus({ preventScroll: true });
        } catch (e) {
          try { closeBtn.focus(); } catch (e2) {}
        }
      }, 40);
    }

    function closePanel() {
      if (!isOpen) return;
      isOpen = false;
      if (overlay) overlay.classList.remove("anm-on");
      if (panel) panel.classList.remove("anm-on");
      if (overlay) overlay.setAttribute("aria-hidden", "true");
      if (panel) panel.setAttribute("aria-hidden", "true");

      try {
        if (lastFocus && typeof lastFocus.focus === "function") {
          lastFocus.focus({ preventScroll: true });
        } else if (openBtn) {
          openBtn.focus({ preventScroll: true });
        }
      } catch (e) {}
    }

    function typeMeta(tipo) {
      return TYPE_META[tipo] || TYPE_META.cofre;
    }

    function appendNote(host) {
      if (!lastNote) return;
      var note = document.createElement("div");
      note.className = "anm-note " + (lastNoteKind === "warn" ? "anm-is-warn" : "anm-is-ok");
      note.setAttribute("role", "status");
      note.textContent = lastNote;
      host.appendChild(note);
    }

    function renderClaimed(host, meta) {
      var wrap = document.createElement("div");
      wrap.className = "anm-claimed";

      var ico = document.createElement("div");
      ico.className = "anm-claimed-ico";
      ico.textContent = meta.icon;
      wrap.appendChild(ico);

      var title = document.createElement("div");
      title.className = "anm-claimed-title";
      title.textContent = "Carta reclamada";
      wrap.appendChild(title);

      var text = document.createElement("p");
      text.className = "anm-muted";
      text.textContent = CLAIMED_TEXT[state.tipo] || "Vuelve mañana por otra anomalía.";
      wrap.appendChild(text);

      host.appendChild(wrap);
    }

    function triviaIndexFor(date, attempt) {
      function hash(str) {
        var h = 2166136261;
        for (var i = 0; i < str.length; i++) {
          h ^= str.charCodeAt(i);
          h = (h * 16777619) >>> 0;
        }
        return h >>> 0;
      }
      var idx = hash("odea-anomalia:" + date + ":" + attempt) % TRIVIA.length;
      if (attempt > 0) {
        var prev = hash("odea-anomalia:" + date + ":" + (attempt - 1)) % TRIVIA.length;
        if (idx === prev) idx = (idx + 1) % TRIVIA.length;
      }
      return idx;
    }

    function answerTrivia(question, chosen) {
      if (!state || state.reclamada) return;

      if (chosen === question.c) {
        claimReward("trivia", {
          attempts: state.progreso + 1,
          note: "✔ Correcto. " + question.e + " +1 ◆"
        });
        return;
      }

      state.progreso = clampInt(state.progreso + 1, 0, MAX_TRIES);
      saveState();

      if (state.progreso >= MAX_TRIES) {
        claimReward("trivia", {
          reward: false,
          attempts: MAX_TRIES,
          note: "✕ Tres intentos agotados. La carta queda reclamada sin fragmento."
        });
      } else {
        var left = MAX_TRIES - state.progreso;
        lastNote = "✕ Incorrecto. Te queda" + (left === 1 ? " 1 intento." : "n " + left + " intentos.");
        lastNoteKind = "warn";
        updateUI();
      }
    }

    function renderTrivia(host) {
      var attempt = clampInt(state.progreso, 0, MAX_TRIES - 1);
      var question = TRIVIA[triviaIndexFor(todayStr(), attempt)];

      var counter = document.createElement("div");
      counter.className = "anm-kicker2";
      counter.textContent = "INTENTO " + (attempt + 1) + " / " + MAX_TRIES;
      host.appendChild(counter);

      var q = document.createElement("p");
      q.className = "anm-question";
      q.textContent = question.q;
      host.appendChild(q);

      var options = document.createElement("div");
      options.className = "anm-options";
      question.o.forEach(function (label, idx) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "anm-opt";

        var letter = document.createElement("span");
        letter.className = "anm-opt-letter";
        letter.textContent = String.fromCharCode(65 + idx);
        btn.appendChild(letter);

        var txt = document.createElement("span");
        txt.textContent = label;
        btn.appendChild(txt);

        btn.addEventListener("click", function () {
          answerTrivia(question, idx);
        });
        options.appendChild(btn);
      });
      host.appendChild(options);

      var hint = document.createElement("p");
      hint.className = "anm-muted";
      hint.textContent = "Acertá para ganar ◆ 1. Tenés hasta 3 intentos hoy.";
      host.appendChild(hint);
    }

    function renderObjective(host) {
      var target = objectiveMission();
      if (!target) {
        var empty = document.createElement("p");
        empty.className = "anm-muted";
        empty.textContent = "No hay una misión diaria pendiente para marcar hoy.";
        host.appendChild(empty);
        return;
      }

      var kicker = document.createElement("div");
      kicker.className = "anm-kicker2";
      kicker.textContent = "DÍA " + target.day + " · " + target.slot + " · " + target.xp + " XP";
      host.appendChild(kicker);

      var card = document.createElement("div");
      card.className = "anm-objective";

      var title = document.createElement("div");
      title.className = "anm-objective-title";
      title.textContent = target.title;
      card.appendChild(title);

      var text = document.createElement("p");
      text.className = "anm-muted";
      text.textContent = isDailyDone(target.id)
        ? "Misión completada. La recompensa se acredita automáticamente."
        : "Completá esta misión para reclamar ◆ 1. La tarjeta ya tiene el anillo ANOMALÍA.";
      card.appendChild(text);

      host.appendChild(card);
    }

    function renderCaza(host) {
      var n = clampInt(state.progreso, 0, CAZA_TARGET);

      var head = document.createElement("div");
      head.className = "anm-progress-label";
      var left = document.createElement("span");
      left.textContent = "SEÑALES COMPLETADAS";
      var right = document.createElement("b");
      right.textContent = n + " / " + CAZA_TARGET;
      head.appendChild(left);
      head.appendChild(right);
      host.appendChild(head);

      var bar = document.createElement("div");
      bar.className = "anm-progress";
      var fill = document.createElement("span");
      fill.style.width = Math.round((n / CAZA_TARGET) * 100) + "%";
      bar.appendChild(fill);
      host.appendChild(bar);

      var text = document.createElement("p");
      text.className = "anm-muted";
      text.textContent = "Completá 3 misiones cualesquiera hoy. Desmarcar no resta.";
      host.appendChild(text);
    }

    function renderCofre(host) {
      var text = document.createElement("p");
      text.className = "anm-muted";
      text.textContent = "Un cofre de datos apareció en la señal. Abrirlo entrega ◆ 1 al instante.";
      host.appendChild(text);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "anm-cta";
      btn.textContent = "🎁 ABRIR COFRE · +1 ◆";
      btn.addEventListener("click", function () {
        claimReward("cofre", { note: "🎁 Cofre abierto. +1 ◆" });
      });
      host.appendChild(btn);
    }

    function renderFooter(host) {
      var balance = document.createElement("div");
      balance.className = "anm-balance";

      var label = document.createElement("span");
      label.className = "anm-balance-label";
      label.textContent = "FRAGMENTOS";
      balance.appendChild(label);

      var num = document.createElement("span");
      num.className = "anm-balance-num";
      num.textContent = "◆ " + state.fragmentos;
      balance.appendChild(num);

      var life = document.createElement("span");
      life.className = "anm-balance-life";
      life.textContent = state.fragmentosVida + " de por vida";
      balance.appendChild(life);
      host.appendChild(balance);

      var miles = document.createElement("div");
      miles.className = "anm-milestones";
      MILESTONES.forEach(function (m) {
        var chip = document.createElement("span");
        chip.className = "anm-mile" + (state.fragmentosVida >= m.n ? " anm-is-on" : "");
        chip.title = m.label;
        chip.innerHTML = '<span class="anm-mile-ico">' + m.ico + '</span><span>' + m.n + '</span>';
        miles.appendChild(chip);
      });
      host.appendChild(miles);

      var buy = document.createElement("button");
      buy.type = "button";
      buy.className = "anm-cta anm-pulse-buy";

      if (pulseActive()) {
        buy.textContent = "✦ PULSO NEÓN ACTIVO";
        buy.disabled = true;
        buy.classList.add("anm-is-active");
      } else {
        buy.textContent = "✦ PULSO NEÓN · " + PULSO_COST + " ◆";
        if (state.fragmentos < PULSO_COST) buy.classList.add("anm-is-short");
      }
      buy.addEventListener("click", buyPulse);
      host.appendChild(buy);

      var hint = document.createElement("p");
      hint.className = "anm-muted anm-foot-hint";
      hint.textContent = "El pulso ilumina bordes y encabezados hasta el final del día.";
      host.appendChild(hint);
    }

    function renderPanel() {
      if (!panel || !state) return;
      var titleEl = document.getElementById("anm-title");
      var content = document.getElementById("anm-content");
      var foot = document.getElementById("anm-foot");
      if (!titleEl || !content || !foot) return;

      var meta = typeMeta(state.tipo);
      titleEl.textContent = meta.title;
      panel.setAttribute("data-tipo", state.tipo || "cofre");
      content.innerHTML = "";
      foot.innerHTML = "";

      appendNote(content);

      if (state.reclamada) {
        renderClaimed(content, meta);
      } else if (state.tipo === "trivia") {
        renderTrivia(content);
      } else if (state.tipo === "objetivo") {
        renderObjective(content);
      } else if (state.tipo === "caza") {
        renderCaza(content);
      } else {
        renderCofre(content);
      }

      renderFooter(foot);
    }

    function updateUI() {
      try { updateOpenButton(); } catch (e) {}
      try { syncPulse(); } catch (e) {}
      try { syncObjectiveMark(); } catch (e) {}
      if (isOpen) {
        try { renderPanel(); } catch (e) {}
      }
    }

    /* ==========================================================
       5) Detección de compleciones reales
       ========================================================== */
    function afterAction(name, args, before) {
      var after = currentXP();
      if (!(after > before)) return;

      var first = "";
      try {
        if (args && args.length) first = String(args[0]);
      } catch (e) {}

      /* Evita doble conteo cuando un clic pasa por wrapper y hook de Vida. */
      var key = name + ":" + first;
      var now = Date.now();
      if (key === lastActionKey && now - lastActionAt < 250) return;
      lastActionKey = key;
      lastActionAt = now;

      if (!state || state.ultimaCarta !== todayStr() || state.reclamada) return;

      if (state.tipo === "objetivo") {
        var target = objectiveMission();
        if (target && isDailyDone(target.id)) {
          claimReward("objetivo", { note: "🎯 Objetivo completado. +1 ◆" });
        }
        return;
      }

      if (state.tipo === "caza") {
        state.progreso = clampInt(state.progreso + 1, 0, CAZA_TARGET);
        saveState();

        if (state.progreso >= CAZA_TARGET) {
          claimReward("caza", { note: "🛰️ Señal completa: 3/3. +1 ◆" });
        } else {
          lastNote = "🛰️ " + state.progreso + "/" + CAZA_TARGET + " misiones completadas hoy.";
          lastNoteKind = "ok";
          updateUI();
        }
      }
    }

    function wrapAction(name) {
      try {
        var original = window[name];
        if (typeof original !== "function") return;

        window[name] = function () {
          var before = currentXP();
          var args = arguments;
          var result;
          try {
            result = original.apply(this, args);
          } finally {
            try { afterAction(name, args, before); } catch (e) {}
          }
          return result;
        };
      } catch (e) {}
    }

    function wrapActions() {
      var names = [
        "toggleDailyMission",
        "toggleWeekly",
        "toggleCampaign",
        "focusComplete",
        "toggleJob",
        "vidaToggle",
        "huntV2Shot",
        "capToggleMission",
        "toggleB2B",
        "toggleSagaWeekly",
        "toggleSagaChapter"
      ];
      for (var i = 0; i < names.length; i++) wrapAction(names[i]);
    }

    /* Vida registra vidaToggle directamente como listener; el hook cubre ese camino. */
    function installVidaHook() {
      document.addEventListener("click", function (ev) {
        try {
          var target = ev.target;
          if (!target || typeof target.closest !== "function") return;
          if (target.closest(".btn-plan-add")) return;

          var card = target.closest("#view-vida .mission[data-mid]") ||
            target.closest("#node-layer .mission[data-mid]");
          if (!card) return;

          var id = card.getAttribute("data-mid") || "";
          var before = currentXP();
          setTimeout(function () {
            try { afterAction("vidaToggle", [id], before); } catch (e) {}
          }, 0);
        } catch (e) {}
      }, true);
    }

    function installObjectiveObserver() {
      var hero = document.getElementById("daily-hero");
      if (hero && window.MutationObserver) {
        try {
          new MutationObserver(function () {
            scheduleObjectiveSync();
          }).observe(hero, { childList: true, subtree: true });
        } catch (e) {}
      }
      scheduleObjectiveSync();
    }

    /* ==========================================================
       6) Montaje
       ========================================================== */
    function install() {
      var generated = ensureState();

      injectOpenButton();
      buildPanel();
      updateUI();
      installCambio();
      installObjectiveObserver();
      installVidaHook();
      wrapActions();

      claimObjectiveIfDone();

      if (generated) {
        setTimeout(function () {
          try {
            if (state && state.ultimaCarta === todayStr()) openPanel();
          } catch (e) {}
        }, 900);
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
        console.warn("ODEA Anomalías v1 no se pudo montar:", err);
      }
    } catch (e) {}
  }
})();
