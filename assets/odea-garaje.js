/*
 * ODEA Garaje v1 — Fase 7: misiones de mantenimiento de vehículos.
 * Capa independiente (patrón de las Fases 1–6):
 * - Vehículos: Hyundai Accent 2017 (manual) y moto Formula X2.
 * - Misiones recurrentes con intervalo en días: última vez, próxima
 *   fecha y estado (al día / por vencer / vencida / sin registro).
 * - Misiones personalizadas y lista de accesorios por vehículo.
 * - Su único almacenamiento es la clave propia odea_garaje_v1.
 * - Al completar una misión emite "garaje.mision" por el bus del
 *   núcleo (ODEA.bus): el Tesoro paga sinergia y el Hub la cuenta.
 * - No toca el núcleo ni claves ajenas.
 */
(function () {
  "use strict";
  try {
    var STORAGE_KEY = "odea_garaje_v1";

    var VEHICULOS = [
      { id: "carro", nombre: "Hyundai Accent 2017", detalle: "Carro · manual", icono: "🚗" },
      { id: "moto", nombre: "Formula X2", detalle: "Moto", icono: "🏍️" }
    ];

    var MISIONES_BASE = [
      { id: "c-lavar", vehiculo: "carro", nombre: "Lavar el carro", dias: 7 },
      { id: "c-llantas", vehiculo: "carro", nombre: "Revisar presión de llantas", dias: 14 },
      { id: "c-interior", vehiculo: "carro", nombre: "Limpiar el interior", dias: 14 },
      { id: "c-aceite-nivel", vehiculo: "carro", nombre: "Revisar nivel de aceite", dias: 15 },
      { id: "c-fluidos", vehiculo: "carro", nombre: "Revisar refrigerante y líquido de frenos", dias: 30 },
      { id: "c-luces", vehiculo: "carro", nombre: "Revisar luces y escobillas", dias: 30 },
      { id: "c-aceite-cambio", vehiculo: "carro", nombre: "Cambio de aceite y filtro (control por fecha/km)", dias: 90 },
      { id: "m-lavar", vehiculo: "moto", nombre: "Lavar la moto", dias: 7 },
      { id: "m-llantas", vehiculo: "moto", nombre: "Revisar presión de llantas", dias: 7 },
      { id: "m-cadena", vehiculo: "moto", nombre: "Limpiar y lubricar la cadena", dias: 14 },
      { id: "m-aceite", vehiculo: "moto", nombre: "Revisar nivel de aceite", dias: 15 },
      { id: "m-frenos", vehiculo: "moto", nombre: "Revisar frenos", dias: 30 },
      { id: "m-luces", vehiculo: "moto", nombre: "Revisar luces", dias: 30 }
    ];

    var ESTADOS_ACC = ["quiero", "ahorrando", "comprado"];

    /* ---------------- utilidades ---------------- */
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function dateStr(d) {
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }
    function todayStr() { return dateStr(new Date()); }
    function addDays(fecha, dias) {
      var p = fecha.split("-");
      var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
      d.setDate(d.getDate() + dias);
      return dateStr(d);
    }
    function dayDiff(a, b) { // días de a → b
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
    function busEmit(tipo, datos) {
      try {
        if (window.ODEA && ODEA.bus && typeof ODEA.bus.emit === "function") {
          ODEA.bus.emit(tipo, datos);
        }
      } catch (e) {}
    }

    /* ---------------- estado ---------------- */
    function seedState() {
      var s = { v: 1, km: { carro: 0, moto: 0 }, misiones: [], accesorios: [] };
      for (var i = 0; i < MISIONES_BASE.length; i++) {
        var m = MISIONES_BASE[i];
        s.misiones.push({
          id: m.id, vehiculo: m.vehiculo, nombre: m.nombre,
          dias: m.dias, ultima: "", base: true
        });
      }
      return s;
    }
    var state = seedState();
    function loadState() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) { saveState(); return; }
        var s = JSON.parse(raw);
        if (!s || typeof s !== "object") return;
        var d = seedState();
        d.km.carro = clampInt(s.km && s.km.carro, 0, 2000000);
        d.km.moto = clampInt(s.km && s.km.moto, 0, 2000000);
        if (Array.isArray(s.misiones)) {
          d.misiones = [];
          for (var i = 0; i < s.misiones.length && i < 200; i++) {
            var m = s.misiones[i];
            if (!m || typeof m.nombre !== "string" || !m.nombre) continue;
            if (m.vehiculo !== "carro" && m.vehiculo !== "moto") continue;
            d.misiones.push({
              id: typeof m.id === "string" && m.id ? m.id : "x" + i,
              vehiculo: m.vehiculo,
              nombre: m.nombre.slice(0, 90),
              dias: clampInt(m.dias, 1, 3650),
              ultima: /^\d{4}-\d{2}-\d{2}$/.test(m.ultima || "") ? m.ultima : "",
              base: !!m.base
            });
          }
        }
        if (Array.isArray(s.accesorios)) {
          d.accesorios = [];
          for (var j = 0; j < s.accesorios.length && j < 200; j++) {
            var a = s.accesorios[j];
            if (!a || typeof a.nombre !== "string" || !a.nombre) continue;
            if (a.vehiculo !== "carro" && a.vehiculo !== "moto") continue;
            d.accesorios.push({
              id: typeof a.id === "string" && a.id ? a.id : "a" + j,
              vehiculo: a.vehiculo,
              nombre: a.nombre.slice(0, 90),
              precio: clampInt(a.precio, 0, 2000000000),
              estado: ESTADOS_ACC.indexOf(a.estado) !== -1 ? a.estado : "quiero"
            });
          }
        }
        state = d;
      } catch (e) { /* estado corrupto: se usa la semilla */ }
    }
    function saveState() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    /* Estado de una misión: 0 al día, 1 por vencer, 2 vencida, 3 sin registro. */
    function missionStatus(m) {
      if (!m.ultima) return { nivel: 3, texto: "sin registro", falta: null };
      var proxima = addDays(m.ultima, m.dias);
      var falta = dayDiff(todayStr(), proxima);
      if (falta < 0) return { nivel: 2, texto: "vencida hace " + (-falta) + (falta === -1 ? " día" : " días"), falta: falta, proxima: proxima };
      if (falta <= 3) return { nivel: 1, texto: falta === 0 ? "toca hoy" : "toca en " + falta + (falta === 1 ? " día" : " días"), falta: falta, proxima: proxima };
      return { nivel: 0, texto: "al día · toca en " + falta + " días", falta: falta, proxima: proxima };
    }
    function counts() {
      var pen = 0, ven = 0;
      for (var i = 0; i < state.misiones.length; i++) {
        var st = missionStatus(state.misiones[i]);
        if (st.nivel === 2) { ven++; pen++; }
        else if (st.nivel === 1 || st.nivel === 3) pen++;
      }
      return { pendientes: pen, vencidas: ven, total: state.misiones.length };
    }

    /* ---------------- interfaz ---------------- */
    var openBtn = null;
    var overlay = null;

    function updateOpenButton() {
      if (!openBtn) return;
      var c = counts();
      openBtn.textContent = "🚗 Garaje" +
        (c.vencidas > 0 ? " · ⚠️ " + c.vencidas + " vencida" + (c.vencidas === 1 ? "" : "s")
         : c.pendientes > 0 ? " · " + c.pendientes + " por hacer" : " · al día ✓");
      openBtn.setAttribute("aria-label",
        "Abrir el Garaje: " + c.pendientes + " misiones pendientes, " +
        c.vencidas + " vencidas, de " + c.total + " en total.");
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
      btn.id = "gr-open";
      btn.className = "gr-open-btn";
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
      overlay.className = "gr-overlay";
      overlay.hidden = true;
      overlay.innerHTML =
        '<div class="gr-card" role="dialog" aria-modal="true" aria-label="Garaje: mantenimiento de vehículos">' +
          '<div class="gr-head">' +
            '<span class="gr-title">🚗 Garaje</span>' +
            '<button type="button" class="gr-close" aria-label="Cerrar el Garaje">✕</button>' +
          '</div>' +
          '<div class="gr-body"></div>' +
        '</div>';
      overlay.addEventListener("click", function (ev) {
        if (ev.target === overlay) closePanel();
      });
      overlay.querySelector(".gr-close").addEventListener("click", closePanel);
      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape" && overlay && !overlay.hidden) closePanel();
      });
      document.body.appendChild(overlay);
    }

    function openPanel() {
      buildPanel();
      render();
      overlay.hidden = false;
      var close = overlay.querySelector(".gr-close");
      if (close) { try { close.focus(); } catch (e) {} }
    }
    function closePanel() {
      if (overlay) overlay.hidden = true;
      updateOpenButton();
      if (openBtn) { try { openBtn.focus(); } catch (e) {} }
    }

    function pillClass(nivel) {
      return nivel === 2 ? "gr-pill gr-pill-bad" :
             nivel === 1 ? "gr-pill gr-pill-warn" :
             nivel === 3 ? "gr-pill gr-pill-new" : "gr-pill gr-pill-ok";
    }

    function render() {
      var body = overlay.querySelector(".gr-body");
      var html = "";
      for (var v = 0; v < VEHICULOS.length; v++) {
        var veh = VEHICULOS[v];
        html += '<div class="gr-veh">' +
          '<p class="gr-veh-name">' + veh.icono + " " + esc(veh.nombre) +
          ' <span class="gr-dim">' + esc(veh.detalle) + "</span></p>" +
          '<label class="gr-km">Kilometraje: ' +
          '<input type="number" class="gr-km-input" data-km="' + veh.id +
            '" value="' + (state.km[veh.id] || "") + '" min="0" inputmode="numeric"> km ' +
          '<button type="button" class="gr-mini" data-km-save="' + veh.id + '">Guardar</button></label>';

        var list = state.misiones.filter(function (m) { return m.vehiculo === veh.id; });
        list.sort(function (a, b) {
          return missionStatus(b).nivel - missionStatus(a).nivel;
        });
        for (var i = 0; i < list.length; i++) {
          var m = list[i];
          var st = missionStatus(m);
          html += '<div class="gr-mission">' +
            '<div class="gr-mission-info"><b>' + esc(m.nombre) + "</b>" +
            '<span class="gr-dim">cada ' + m.dias + " días · última: " +
              (m.ultima ? esc(m.ultima) : "nunca") + "</span></div>" +
            '<span class="' + pillClass(st.nivel) + '">' + esc(st.texto) + "</span>" +
            '<button type="button" class="gr-done" data-done="' + esc(m.id) + '">Hecha ✓</button>' +
            (m.base ? "" : '<button type="button" class="gr-del" data-del-m="' + esc(m.id) + '" aria-label="Borrar misión">✕</button>') +
            "</div>";
        }
        if (!list.length) html += '<p class="gr-dim">Sin misiones para este vehículo.</p>';

        var accs = state.accesorios.filter(function (a) { return a.vehiculo === veh.id; });
        html += '<p class="gr-acc-title">🎁 Accesorios</p>';
        var totalPend = 0;
        for (var j = 0; j < accs.length; j++) {
          var a = accs[j];
          if (a.estado !== "comprado") totalPend += a.precio;
          html += '<div class="gr-acc">' +
            '<div class="gr-mission-info"><b>' + esc(a.nombre) + "</b>" +
            '<span class="gr-dim">' + (a.precio > 0 ? "₡" + a.precio.toLocaleString("es-CR") : "sin precio") + "</span></div>" +
            '<button type="button" class="gr-toggle" data-acc="' + esc(a.id) + '">' +
              (a.estado === "comprado" ? "comprado ✓" : a.estado) + "</button>" +
            '<button type="button" class="gr-del" data-del-a="' + esc(a.id) + '" aria-label="Borrar accesorio">✕</button>' +
            "</div>";
        }
        if (accs.length) {
          html += '<p class="gr-dim">Por comprar: ₡' + totalPend.toLocaleString("es-CR") + "</p>";
        } else {
          html += '<p class="gr-dim">Nada en la lista todavía.</p>';
        }
        html += "</div>";
      }

      html += '<div class="gr-forms">' +
        '<p class="gr-acc-title">➕ Nueva misión</p>' +
        '<div class="gr-form-row">' +
          '<select id="gr-new-veh" class="gr-input"><option value="carro">🚗 Accent</option><option value="moto">🏍️ Moto</option></select>' +
          '<input id="gr-new-name" class="gr-input" type="text" maxlength="90" placeholder="Nombre de la misión">' +
          '<input id="gr-new-days" class="gr-input gr-input-sm" type="number" min="1" max="3650" placeholder="días">' +
          '<button type="button" class="gr-mini" id="gr-add-m">Agregar</button>' +
        "</div>" +
        '<p class="gr-acc-title">➕ Nuevo accesorio</p>' +
        '<div class="gr-form-row">' +
          '<select id="gr-new-aveh" class="gr-input"><option value="carro">🚗 Accent</option><option value="moto">🏍️ Moto</option></select>' +
          '<input id="gr-new-aname" class="gr-input" type="text" maxlength="90" placeholder="Accesorio">' +
          '<input id="gr-new-price" class="gr-input gr-input-sm" type="number" min="0" placeholder="₡">' +
          '<button type="button" class="gr-mini" id="gr-add-a">Agregar</button>' +
        "</div>" +
        '<p class="gr-note">Completar misiones del Garaje paga sinergia en el Tesoro ' +
        '(+2 🪙, máx. 2 al día). Las fechas y el kilometraje viven solo en esta capa.</p>' +
      "</div>";

      body.innerHTML = html;
      wire(body);
    }

    function wire(body) {
      var dones = body.querySelectorAll("[data-done]");
      for (var i = 0; i < dones.length; i++) dones[i].addEventListener("click", onDone);
      var delM = body.querySelectorAll("[data-del-m]");
      for (var j = 0; j < delM.length; j++) delM[j].addEventListener("click", onDelMission);
      var accs = body.querySelectorAll("[data-acc]");
      for (var k = 0; k < accs.length; k++) accs[k].addEventListener("click", onAccToggle);
      var delA = body.querySelectorAll("[data-del-a]");
      for (var l = 0; l < delA.length; l++) delA[l].addEventListener("click", onDelAcc);
      var kms = body.querySelectorAll("[data-km-save]");
      for (var n = 0; n < kms.length; n++) kms[n].addEventListener("click", onKmSave);
      var addM = body.querySelector("#gr-add-m");
      if (addM) addM.addEventListener("click", onAddMission);
      var addA = body.querySelector("#gr-add-a");
      if (addA) addA.addEventListener("click", onAddAcc);
    }

    function findMission(id) {
      for (var i = 0; i < state.misiones.length; i++) {
        if (state.misiones[i].id === id) return state.misiones[i];
      }
      return null;
    }
    function onDone(ev) {
      var m = findMission(ev.currentTarget.getAttribute("data-done"));
      if (!m) return;
      m.ultima = todayStr();
      saveState();
      busEmit("garaje.mision", { vehiculo: m.vehiculo, mision: m.nombre, fecha: m.ultima });
      updateOpenButton();
      render();
    }
    function onDelMission(ev) {
      var id = ev.currentTarget.getAttribute("data-del-m");
      state.misiones = state.misiones.filter(function (m) { return m.id !== id; });
      saveState();
      updateOpenButton();
      render();
    }
    function onAccToggle(ev) {
      var id = ev.currentTarget.getAttribute("data-acc");
      for (var i = 0; i < state.accesorios.length; i++) {
        var a = state.accesorios[i];
        if (a.id === id) {
          var idx = ESTADOS_ACC.indexOf(a.estado);
          a.estado = ESTADOS_ACC[(idx + 1) % ESTADOS_ACC.length];
        }
      }
      saveState();
      render();
    }
    function onDelAcc(ev) {
      var id = ev.currentTarget.getAttribute("data-del-a");
      state.accesorios = state.accesorios.filter(function (a) { return a.id !== id; });
      saveState();
      render();
    }
    function onKmSave(ev) {
      var veh = ev.currentTarget.getAttribute("data-km-save");
      var input = overlay.querySelector('[data-km="' + veh + '"]');
      if (!input) return;
      state.km[veh] = clampInt(input.value, 0, 2000000);
      saveState();
      render();
    }
    function onAddMission() {
      var veh = overlay.querySelector("#gr-new-veh").value;
      var name = overlay.querySelector("#gr-new-name").value.trim();
      var dias = clampInt(overlay.querySelector("#gr-new-days").value, 1, 3650);
      if (!name) return;
      state.misiones.push({
        id: "u" + Date.now(), vehiculo: veh, nombre: name.slice(0, 90),
        dias: dias || 7, ultima: "", base: false
      });
      saveState();
      updateOpenButton();
      render();
    }
    function onAddAcc() {
      var veh = overlay.querySelector("#gr-new-aveh").value;
      var name = overlay.querySelector("#gr-new-aname").value.trim();
      var precio = clampInt(overlay.querySelector("#gr-new-price").value, 0, 2000000000);
      if (!name) return;
      state.accesorios.push({
        id: "a" + Date.now(), vehiculo: veh, nombre: name.slice(0, 90),
        precio: precio, estado: "quiero"
      });
      saveState();
      render();
    }

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
        console.warn("ODEA Garaje v1 no se pudo montar:", err);
      }
    } catch (e) {}
  }
})();
