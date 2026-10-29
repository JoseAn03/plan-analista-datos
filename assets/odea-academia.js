/*
 * ODEA Academia v1 — Fase 8: Mundo del Currículum.
 * Capa independiente (patrón de las Fases 1–7):
 * - 6 rutas y 29 pasos para construir el currículum 2026.
 * - La misión 29 es automática: se completa al cerrar las 28 anteriores.
 * - Su único almacenamiento es la clave propia odea_academia_v1.
 * - Emite academia.mision y academia.ruta por el bus del núcleo.
 * - No toca el núcleo ni claves ajenas.
 */
(function () {
  "use strict";
  try {
    var STORAGE_KEY = "odea_academia_v1";
    var TOTAL = 29;

    var RUTAS = [
      {
        id: "arranque",
        nombre: "Ruta 0 · Arranque",
        detalle: "Esta semana",
        misiones: [
          { id: "efset-examen", nombre: "Examen de inglés EF SET", detalle: "50 min en línea, gratis: el inglés certificado no caduca nunca; es tu activo más durable." },
          { id: "efset-linkedin", nombre: "Publicar el certificado EF SET", detalle: "Guardá el resultado y agregalo a tu perfil de LinkedIn." },
          { id: "ina-ia", nombre: "Cerrar el curso INA de IA Moderna", detalle: "Termina el 22 de noviembre: actividades NetAcad, encuesta y examen final con 70 o más." },
          { id: "ssms-instalar", nombre: "Instalar SQL Server Express + SSMS", detalle: "SQL es EL fundamento que no muere: cambia el motor, no el lenguaje." },
          { id: "ssms-puente", nombre: "Puente T-SQL: 10 consultas de práctica", detalle: "Diferencias clave contra MySQL: TOP, IDENTITY, funciones de fecha, CTE." }
        ]
      },
      {
        id: "google",
        nombre: "Ruta 1 · Google",
        detalle: "Cerrar el certificado y subir de nivel",
        misiones: [
          { id: "g-curso2", nombre: "Curso 2: Ask Questions to Make Data-Driven Decisions", detalle: "Coursera · Financial Aid si no tenés suscripción. Con tu experiencia, varios cursos son repaso rápido." },
          { id: "g-curso3", nombre: "Curso 3: Prepare Data for Exploration", detalle: "Coursera · bases y limpieza." },
          { id: "g-curso5", nombre: "Curso 5: Analyze Data to Answer Questions", detalle: "Coursera · SQL y hojas de cálculo en serio." },
          { id: "g-curso6", nombre: "Curso 6: Share Data Through the Art of Visualization", detalle: "Coursera · Tableau y presentaciones." },
          { id: "g-curso7", nombre: "Curso 7: Data Analysis with R Programming", detalle: "Se completa para cerrar el certificado; el futuro es Python (Ruta 3), pero el título completo es la señal que vale." },
          { id: "g-capstone", nombre: "Curso 8: Capstone y certificado completo 🏅", detalle: "Reclamás el Google Data Analytics Professional Certificate." },
          { id: "g-advanced", nombre: "Siguiente nivel: Google Advanced Data Analytics", detalle: "Inscribirse en Coursera: Python, estadística y machine learning. Ahí está el futuro de la ruta Google." }
        ]
      },
      {
        id: "microsoft",
        nombre: "Ruta 2 · Microsoft",
        detalle: "Power BI, Fabric y nube",
        misiones: [
          { id: "ms-mod1", nombre: "Power BI (Coursera): preparar y cargar datos", detalle: "Certificado Microsoft Power BI Data Analyst, parte 1." },
          { id: "ms-mod2", nombre: "Power BI (Coursera): modelado y DAX", detalle: "Parte 2: tu fuerte, formalizado." },
          { id: "ms-mod3", nombre: "Power BI (Coursera): visualización y certificado", detalle: "Parte 3: quedás listo para el examen PL-300 cuando haya voucher." },
          { id: "ms-fabric", nombre: "Microsoft Fabric: ruta gratuita en MS Learn", detalle: "Fabric es la evolución del ecosistema Power BI: lagos de datos y análisis en un solo lugar." },
          { id: "ms-training", nombre: "Virtual Training Day: Fundamentals", detalle: "Evento gratuito de Microsoft; al asistir te dan el voucher del examen de fundamentos." },
          { id: "ms-examen", nombre: "Aprobar el examen con voucher: AI-900 (recomendado) o DP-900 🏅", detalle: "AI-900 (Azure AI Fundamentals) mira al futuro y combina con tu curso del INA; DP-900 es la ruta de datos clásica. Uno de los dos, oficial Microsoft." }
        ]
      },
      {
        id: "ia",
        nombre: "Ruta 3 · IA aplicada",
        detalle: "La ruta del futuro",
        misiones: [
          { id: "ia-essentials", nombre: "Google AI Essentials (Coursera)", detalle: "Fundamentos prácticos de IA generativa para trabajar: prompting y criterio, en horas no semanas." },
          { id: "ia-flujo", nombre: "Tu flujo de análisis con IA, documentado", detalle: "Guía personal: cómo usás IA para explorar datos, generar SQL y revisar resultados SIN confiar a ciegas. Verificar es la habilidad." },
          { id: "ia-n8n", nombre: "Proyecto: automatización n8n + IA (datos demo)", detalle: "Un flujo que lee datos, los analiza con IA y genera un reporte solo. Publicado en GitHub: tu diferenciador 2026." },
          { id: "ia-ml", nombre: "Kaggle Learn: Intro to Machine Learning", detalle: "Gratis y corto: tu primer modelo predictivo en Python, como el de No-Show pero formal." }
        ]
      },
      {
        id: "demanda",
        nombre: "Ruta 4 · Demanda inmediata",
        detalle: "Lo que las vacantes piden HOY",
        misiones: [
          { id: "sf-trailmix", nombre: "Trailhead: ruta de reportes y dashboards (parte 1)", detalle: "Salesforce sigue siendo la brecha #1 en las vacantes de Costa Rica." },
          { id: "sf-proyecto", nombre: "Trailhead: proyecto práctico de reportes (parte 2)", detalle: "Un playground con reportes reales para mostrar en entrevista." },
          { id: "sap-intro", nombre: "SAP Learning: ruta introductoria", detalle: "Navegación y conceptos: “SAP a nivel usuario”, honesto y suficiente por ahora." }
        ]
      },
      {
        id: "vitrina",
        nombre: "Ruta 5 · Vitrina 2026",
        detalle: "El CV que se ve",
        misiones: [
          { id: "gh-insignia", nombre: "GitHub: proyecto insignia con IA", detalle: "Un pipeline completo y público: datos → SQL → Python → Power BI → automatización. Con README que cuente la historia." },
          { id: "li-vitrina", nombre: "LinkedIn: headline y sección destacada", detalle: "Titular con las palabras de 2026: datos, automatización e IA aplicada." },
          { id: "cv-final", nombre: "Regenerar el CV “perfecto”", detalle: "CV ES/EN con todo lo nuevo, y subirlo a Indeed, elempleo y LinkedIn." },
          { id: "meta-final", nombre: "🏆 Analista de la era IA", detalle: "Se marca sola al completar las 28 anteriores: fundamentos fuertes + IA + credenciales. El objetivo de la Academia.", meta: true }
        ]
      }
    ];

    var PRIORIDADES = [
      { t: "💼 Empleos (La Cacería)", m: "Donde el plan se convierte en salario: las vacantes vencen." },
      { t: "📜 Campaña de Datos", m: "El plan de 56 días que te hace contratable." },
      { t: "🎓 Mundo del Currículum", m: "El multiplicador: certificaciones que suben tu valor." },
      { t: "🧠 Quiz de entrevista", m: "Práctica inmediata: tenés un assessment de Amazon encima." },
      { t: "🏕️ Campamento Base (Hoy)", m: "La rutina diaria que alimenta todo el sistema." },
      { t: "🚗 Garaje", m: "Vida real: evita averías y gastos mayores." },
      { t: "◆ Anomalía diaria", m: "30 segundos de constancia que sostienen la racha." },
      { t: "👹 Jefe semanal", m: "La meta semanal de XP que te mantiene en movimiento." },
      { t: "📹 Sagas con mi hijo", m: "Familia: no compite en esta escala; es tiempo protegido." },
      { t: "🧬 Aldea de la Vida", m: "Hábitos y bienestar que sostienen el rendimiento." },
      { t: "💸 Ingreso Extra B2B", m: "Oportunidades freelance cuando aparezcan bien pagadas." },
      { t: "🛰️ Centro y Tesoro", m: "Infraestructura de motivación: sirven a los demás mundos." },
      { t: "📡 Radar del Mundo", m: "Noticias para estar al día: bonito, no urgente." },
      { t: "👑 El Imperio", m: "La visión a largo plazo: hoy no pide tiempo." }
    ];

    /* ---------------- catálogo y estado ---------------- */
    var MISIONES = [];
    var REAL_MISIONES = [];
    var MISSION_BY_ID = {};
    var RUTA_IDS = [];
    RUTAS.forEach(function (r) {
      RUTA_IDS.push(r.id);
      r.misiones.forEach(function (m) {
        m.ruta = r.id;
        m.paso = MISIONES.length + 1;
        MISIONES.push(m);
        MISSION_BY_ID[m.id] = m;
        if (!m.meta) REAL_MISIONES.push(m);
      });
    });
    var REAL_COUNT = REAL_MISIONES.length;

    function defaultState() {
      return { v: 1, hechas: {}, rutasAvisadas: [] };
    }
    var state = defaultState();

    function pad2(n) { return (n < 10 ? "0" : "") + n; }
    function todayStr() {
      var d = new Date();
      return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
    }
    function esc(s) {
      return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
    function formatDate(iso) {
      var p = String(iso || "").split("-");
      if (p.length === 3 && p[0].length === 4) return p[2] + "/" + p[1] + "/" + p[0];
      return String(iso || "");
    }
    function busEmit(tipo, datos) {
      try {
        if (window.ODEA && ODEA.bus && typeof ODEA.bus.emit === "function") {
          ODEA.bus.emit(tipo, datos);
        }
      } catch (e) {}
    }

    function loadState() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        var s = JSON.parse(raw);
        if (!s || typeof s !== "object") return;
        var d = defaultState();
        var valid = {};
        for (var i = 0; i < REAL_MISIONES.length; i++) valid[REAL_MISIONES[i].id] = true;
        if (s.hechas && typeof s.hechas === "object" && !Array.isArray(s.hechas)) {
          for (var k in s.hechas) {
            if (!Object.prototype.hasOwnProperty.call(s.hechas, k)) continue;
            if (!valid[k]) continue;
            var fecha = String(s.hechas[k] || "");
            if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) d.hechas[k] = fecha;
          }
        }
        var rvalid = {};
        for (var j = 0; j < RUTA_IDS.length; j++) rvalid[RUTA_IDS[j]] = true;
        if (Array.isArray(s.rutasAvisadas)) {
          for (var n = 0; n < s.rutasAvisadas.length; n++) {
            var rid = s.rutasAvisadas[n];
            if (rvalid[rid] && d.rutasAvisadas.indexOf(rid) === -1) d.rutasAvisadas.push(rid);
          }
        }
        state = d;
      } catch (e) { state = defaultState(); }
    }
    function saveState() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    function realDoneCount() {
      var n = 0;
      for (var i = 0; i < REAL_MISIONES.length; i++) {
        if (state.hechas[REAL_MISIONES[i].id]) n++;
      }
      return n;
    }
    function doneCount() {
      var n = realDoneCount();
      return n + (n >= REAL_COUNT ? 1 : 0);
    }
    function pctOf(n) { return Math.round((n / TOTAL) * 100); }
    function routeProgress(r) {
      var done = 0;
      for (var i = 0; i < r.misiones.length; i++) {
        var m = r.misiones[i];
        if (m.meta) {
          if (realDoneCount() >= REAL_COUNT) done++;
        } else if (state.hechas[m.id]) {
          done++;
        }
      }
      return { done: done, total: r.misiones.length };
    }

    /* ---------------- acciones ---------------- */
    function markDone(id) {
      var m = MISSION_BY_ID[id];
      if (!m || m.meta || state.hechas[id]) return;
      state.hechas[id] = todayStr();
      saveState();
      busEmit("academia.mision", { id: id });
      checkRoutes();
      updateOpenButton();
      render();
    }
    function undo(id) {
      if (!state.hechas[id]) return;
      delete state.hechas[id];
      saveState();
      updateOpenButton();
      render();
    }
    function checkRoutes() {
      var nuevas = [];
      for (var i = 0; i < RUTAS.length; i++) {
        var r = RUTAS[i];
        var p = routeProgress(r);
        if (p.done >= p.total && state.rutasAvisadas.indexOf(r.id) === -1) {
          state.rutasAvisadas.push(r.id);
          nuevas.push(r.id);
        }
      }
      if (!nuevas.length) return;
      saveState();
      for (var j = 0; j < nuevas.length; j++) {
        busEmit("academia.ruta", { ruta: nuevas[j] });
      }
    }

    /* ---------------- interfaz ---------------- */
    var openBtn = null;
    var overlay = null;

    function updateOpenButton() {
      if (!openBtn) return;
      var n = doneCount();
      openBtn.textContent = "🎓 Academia · " + n + "/" + TOTAL;
      openBtn.setAttribute("aria-label",
        "Abrir la Academia: " + n + " de " + TOTAL + " misiones completadas.");
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
      btn.id = "ac-open";
      btn.className = "ac-open-btn";
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
      overlay.id = "ac-overlay";
      overlay.className = "ac-overlay";
      overlay.hidden = true;
      overlay.innerHTML =
        '<div class="ac-card" role="dialog" aria-modal="true" aria-label="Academia: Mundo del Currículum">' +
          '<div class="ac-head">' +
            '<div class="ac-head-txt">' +
              '<span class="ac-title">🎓 Academia</span>' +
              '<span class="ac-sub">Mundo del Currículum · 29 pasos</span>' +
            '</div>' +
            '<span class="ac-head-progress">0/29 · 0%</span>' +
            '<button type="button" class="ac-close" aria-label="Cerrar la Academia">✕</button>' +
          '</div>' +
          '<div class="ac-body"></div>' +
        '</div>';
      overlay.addEventListener("click", function (ev) {
        if (ev.target === overlay) closePanel();
      });
      overlay.querySelector(".ac-close").addEventListener("click", closePanel);
      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape" && overlay && !overlay.hidden) closePanel();
      });
      document.body.appendChild(overlay);
    }

    function openPanel() {
      buildPanel();
      render();
      overlay.hidden = false;
      var close = overlay.querySelector(".ac-close");
      if (close) { try { close.focus(); } catch (e) {} }
    }
    function closePanel() {
      if (overlay) overlay.hidden = true;
      updateOpenButton();
      if (openBtn) { try { openBtn.focus(); } catch (e) {} }
    }

    function render() {
      if (!overlay) return;
      var body = overlay.querySelector(".ac-body");
      var headProg = overlay.querySelector(".ac-head-progress");
      if (!body) return;

      var scrollTop = body.scrollTop;
      var oldPrio = body.querySelector(".ac-priorities");
      var prioOpen = oldPrio ? oldPrio.open : false;

      var total = doneCount();
      var pct = pctOf(total);
      if (headProg) headProg.textContent = total + "/" + TOTAL + " · " + pct + "%";

      var html = "";
      html += '<div class="ac-general">' +
        '<div class="ac-general-top"><b>Progreso total</b><span>' + total + "/" + TOTAL + " · " + pct + "%</span></div>" +
        '<div class="ac-bar ac-bar-lg"><span style="width:' + pct + '%"></span></div>' +
        '<p class="ac-general-note">' +
          (total >= TOTAL
            ? "🏆 Academia completa: fundamentos + IA + credenciales."
            : "El paso 29 se completa solo al cerrar los 28 anteriores.") +
        '</p>' +
      '</div>';

      for (var i = 0; i < RUTAS.length; i++) {
        var r = RUTAS[i];
        var rp = routeProgress(r);
        var rpct = Math.round((rp.done / rp.total) * 100);
        html += '<section class="ac-route">' +
          '<div class="ac-route-head">' +
            '<div><h3 class="ac-route-title">' + esc(r.nombre) + '</h3>' +
            '<p class="ac-route-sub">' + esc(r.detalle) + '</p></div>' +
            '<span class="ac-route-count">' + rp.done + "/" + rp.total + '</span>' +
          '</div>' +
          '<div class="ac-bar"><span style="width:' + rpct + '%"></span></div>' +
          '<div class="ac-missions">';
        for (var j = 0; j < r.misiones.length; j++) {
          var m = r.misiones[j];
          var done = m.meta ? realDoneCount() >= REAL_COUNT : !!state.hechas[m.id];
          html += '<div class="ac-mission' + (done ? " ac-done" : "") + (m.meta ? " ac-meta" : "") + '">' +
            '<span class="ac-step">' + pad2(m.paso) + '</span>' +
            '<div class="ac-mission-main">' +
              '<div class="ac-mission-title">' + esc(m.nombre) + '</div>' +
              '<div class="ac-mission-detail">' + esc(m.detalle) + '</div>' +
            '</div>' +
            '<div class="ac-mission-action">';
          if (m.meta) {
            html += done
              ? '<span class="ac-status">✓ Automática</span>'
              : '<span class="ac-locked">🔒 28/28</span>';
          } else if (done) {
            html += '<span class="ac-status">✓ Hecha · ' + esc(formatDate(state.hechas[m.id])) + '</span>' +
              '<button type="button" class="ac-undo" data-undo="' + esc(m.id) + '">deshacer</button>';
          } else {
            html += '<button type="button" class="ac-done-btn" data-done="' + esc(m.id) + '">Hecha ✓</button>';
          }
          html += '</div></div>';
        }
        html += '</div></section>';
      }

      html += '<details class="ac-priorities">' +
        '<summary>🗺️ Mapa de prioridades del juego</summary>' +
        '<p class="ac-priorities-note">Ranking de importancia × urgencia (Muse, octubre 2026). Solo lectura.</p>' +
        '<ol class="ac-priority-list">';
      for (var p = 0; p < PRIORIDADES.length; p++) {
        html += '<li><b>' + esc(PRIORIDADES[p].t) + '</b><span>' + esc(PRIORIDADES[p].m) + '</span></li>';
      }
      html += '</ol></details>';

      body.innerHTML = html;
      var newPrio = body.querySelector(".ac-priorities");
      if (newPrio && prioOpen) newPrio.open = true;
      body.scrollTop = scrollTop;
      wire(body);
    }

    function wire(body) {
      var dones = body.querySelectorAll("[data-done]");
      for (var i = 0; i < dones.length; i++) {
        dones[i].addEventListener("click", function (ev) {
          markDone(ev.currentTarget.getAttribute("data-done"));
        });
      }
      var undos = body.querySelectorAll("[data-undo]");
      for (var j = 0; j < undos.length; j++) {
        undos[j].addEventListener("click", function (ev) {
          undo(ev.currentTarget.getAttribute("data-undo"));
        });
      }
    }

    window.ODEA_ACADEMIA = { open: openPanel };

    /* ---------------- arranque ---------------- */
    function install() {
      loadState();
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
        console.warn("ODEA Academia v1 no se pudo montar:", err);
      }
    } catch (e) {}
  }
})();
