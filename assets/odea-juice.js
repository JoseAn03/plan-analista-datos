/*
 * ODEA Juice v1 — capa aditiva de celebración y feedback.
 *
 * No conoce ni modifica el estado del juego. Se monta después de la app,
 * envuelve funciones globales existentes y reacciona a los cambios de XP
 * con confeti, textos flotantes y sonidos generados con WebAudio.
 *
 * Único dato persistido: odea_juice_v1 (preferencia de sonido).
 * Sin librerías externas, sin archivos de audio y sin tocar el guardado.
 */
(function () {
  "use strict";

  try {
    var SOUND_KEY = "odea_juice_v1";
    var FLOAT_MS = 1200;
    var MAX_CONFETTI = 120;
    var reducedMotion = false;

    try {
      reducedMotion = !!(window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) {}

    var soundOn = readSoundPref();
    var audioUnlocked = false;
    var audioCtx = null;
    var canvas = null;
    var canvasCtx = null;
    var particles = [];
    var rafId = 0;
    var dpr = 1;

    /* ==========================================================
       1) Preferencia de sonido
       ========================================================== */
    function readSoundPref() {
      try {
        var raw = localStorage.getItem(SOUND_KEY);
        if (!raw) return true;
        var data = JSON.parse(raw);
        return !(data && typeof data === "object" && data.muted === true);
      } catch (e) {
        return true;
      }
    }

    function saveSoundPref() {
      try {
        localStorage.setItem(SOUND_KEY, JSON.stringify({ muted: !soundOn }));
      } catch (e) {}
    }

    /* ==========================================================
       2) Audio WebAudio: contexto creado en la primera interacción
       ========================================================== */
    function ensureAudio() {
      if (!soundOn || !audioUnlocked) return null;
      if (!audioCtx) {
        var AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) return null;
        try {
          audioCtx = new AudioCtor();
        } catch (e) {
          audioCtx = null;
          return null;
        }
      }
      if (audioCtx.state === "suspended") {
        try {
          var resumed = audioCtx.resume();
          if (resumed && typeof resumed.catch === "function") resumed.catch(function () {});
        } catch (e) {}
      }
      return audioCtx;
    }

    function unlockAudio() {
      audioUnlocked = true;
      if (!soundOn) return;
      try { ensureAudio(); } catch (e) {}
    }

    /* El contexto nace únicamente dentro de una interacción real. */
    window.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
    window.addEventListener("click", unlockAudio, { once: true, capture: true });

    function tone(freq, delay, duration, volume, type) {
      if (!soundOn || !audioUnlocked) return;
      var ctx = ensureAudio();
      if (!ctx) return;
      try {
        var start = ctx.currentTime + delay;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = type || "triangle";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume || 0.035, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.02);
      } catch (e) {}
    }

    function soundComplete() {
      tone(660, 0, 0.07, 0.035, "triangle");
      tone(880, 0.08, 0.07, 0.03, "triangle");
    }

    function soundLevel() {
      tone(523, 0, 0.09, 0.035, "triangle");
      tone(659, 0.10, 0.09, 0.035, "triangle");
      tone(784, 0.20, 0.12, 0.04, "triangle");
    }

    /* ==========================================================
       3) Confeti propio en canvas
       ========================================================== */
    function ensureCanvas() {
      if (reducedMotion) return null;
      if (canvas && canvasCtx) return canvasCtx;
      try {
        canvas = document.createElement("canvas");
        canvas.id = "odea-juice-confetti";
        canvas.setAttribute("aria-hidden", "true");
        document.body.appendChild(canvas);
        canvasCtx = canvas.getContext("2d");
        if (!canvasCtx) {
          canvas.remove();
          canvas = null;
          return null;
        }
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return canvasCtx;
      } catch (e) {
        return null;
      }
    }

    function resizeCanvas() {
      if (!canvas || !canvasCtx) return;
      try {
        dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
        canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } catch (e) {}
    }

    function confettiColors() {
      return ["#19d9ff", "#7c6cff", "#ff56d8", "#ffd866", "#71f6b2"];
    }

    function spawnConfetti(count, origin, spread, speed) {
      if (reducedMotion) return;
      if (!ensureCanvas()) return;
      var total = Math.max(1, Math.min(MAX_CONFETTI, count || 16));
      var cx = origin && isFinite(origin.x) ? origin.x : window.innerWidth / 2;
      var cy = origin && isFinite(origin.y) ? origin.y : 80;
      var radius = spread || 48;
      var power = speed || 5;
      var colors = confettiColors();

      for (var i = 0; i < total; i++) {
        var angle = Math.random() * Math.PI * 2;
        var distance = Math.random() * radius;
        particles.push({
          x: cx + Math.cos(angle) * distance,
          y: cy + Math.sin(angle) * distance * 0.45,
          vx: Math.cos(angle) * (1.4 + Math.random() * power),
          vy: Math.sin(angle) * (1.2 + Math.random() * power) - 2.2,
          size: 4 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.35,
          life: 1,
          decay: 0.012 + Math.random() * 0.014,
          shape: Math.random() < 0.55
        });
      }
      try { canvas.style.display = "block"; } catch (e) {}
      if (!rafId) rafId = requestAnimationFrame(confettiFrame);
    }

    function confettiFrame() {
      rafId = 0;
      if (!canvas || !canvasCtx) return;
      var w = window.innerWidth;
      var h = window.innerHeight;
      canvasCtx.clearRect(0, 0, w, h);

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.vy += 0.12;
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= p.decay;

        if (p.life <= 0 || p.y > h + 40 || p.x < -60 || p.x > w + 60) {
          particles.splice(i, 1);
          continue;
        }

        canvasCtx.save();
        canvasCtx.globalAlpha = Math.max(0, p.life);
        canvasCtx.translate(p.x, p.y);
        canvasCtx.rotate(p.rot);
        canvasCtx.fillStyle = p.color;
        if (p.shape) {
          canvasCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          canvasCtx.beginPath();
          canvasCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          canvasCtx.fill();
        }
        canvasCtx.restore();
      }

      if (particles.length) {
        rafId = requestAnimationFrame(confettiFrame);
      } else {
        try {
          canvasCtx.clearRect(0, 0, w, h);
          canvas.style.display = "none";
        } catch (e) {}
      }
    }

    function headerAnchor() {
      var el = document.getElementById("hud-xp") || document.getElementById("hud-level");
      if (el) {
        try {
          var r = el.getBoundingClientRect();
          if (r.width || r.height) {
            return { x: r.left + r.width / 2, y: Math.max(48, r.top + r.height / 2) };
          }
        } catch (e) {}
      }
      return { x: window.innerWidth / 2, y: 80 };
    }

    function smallCelebration() {
      if (reducedMotion) return;
      var anchor = headerAnchor();
      spawnConfetti(12 + Math.floor(Math.random() * 9), anchor, 58, 4.8);
    }

    function bigCelebration() {
      if (reducedMotion) return;
      spawnConfetti(80 + Math.floor(Math.random() * 41), {
        x: window.innerWidth / 2,
        y: Math.max(90, window.innerHeight * 0.22)
      }, 150, 8.5);
    }

    /* ==========================================================
       4) Texto flotante y pulso de la barra
       ========================================================== */
    function floatText(text, isLevel) {
      if (reducedMotion) return;
      var anchor = headerAnchor();
      var x = isLevel ? window.innerWidth / 2 : anchor.x;
      var y = isLevel ? Math.max(90, window.innerHeight * 0.2) : Math.max(60, anchor.y - 8);
      var el = document.createElement("div");
      el.className = "odea-juice-float" + (isLevel ? " is-level" : "");
      el.textContent = text;
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
      setTimeout(remove, FLOAT_MS + 200);
    }

    function pulseBar() {
      if (reducedMotion) return;
      var bar = document.getElementById("hud-bar");
      if (!bar) return;
      try {
        bar.classList.remove("odea-juice-pulse");
        void bar.offsetWidth;
        bar.classList.add("odea-juice-pulse");
        setTimeout(function () {
          try { bar.classList.remove("odea-juice-pulse"); } catch (e) {}
        }, 800);
      } catch (e) {}
    }

    /* ==========================================================
       5) Lectura defensiva del estado y reacción
       ========================================================== */
    function currentXP() {
      try {
        if (typeof gameState !== "undefined" && gameState) {
          var n = Number(gameState.totalXP);
          return isFinite(n) ? n : 0;
        }
      } catch (e) {}
      return 0;
    }

    function currentLevel() {
      try {
        if (typeof window.odeLevelNow === "function") {
          var n = Number(window.odeLevelNow());
          return isFinite(n) ? n : 0;
        }
      } catch (e) {}
      return 0;
    }

    function bossDefeated() {
      try {
        if (typeof window.huntV2BossDefeated === "function") {
          return !!window.huntV2BossDefeated();
        }
      } catch (e) {}
      return null;
    }

    function snapshot() {
      return {
        xp: currentXP(),
        level: currentLevel(),
        boss: bossDefeated()
      };
    }

    function react(before) {
      var after = snapshot();
      var gained = after.xp - before.xp;
      var levelUp = after.level > before.level;
      var bossUp = before.boss === false && after.boss === true;

      if (levelUp) {
        floatText("¡Nivel " + after.level + "!", true);
        bigCelebration();
        soundLevel();
        pulseBar();
        return;
      }
      if (bossUp) {
        bigCelebration();
        soundLevel();
        pulseBar();
        return;
      }
      if (gained > 0) {
        floatText("+" + gained + " XP", false);
        smallCelebration();
        soundComplete();
        pulseBar();
      }
    }

    /* ==========================================================
       6) Wrapping defensivo de acciones existentes
       ========================================================== */
    function wrapAction(name) {
      var original = window[name];
      if (typeof original !== "function") return false;

      var wrapped = function () {
        var before = snapshot();
        var result;
        try {
          result = original.apply(this, arguments);
        } finally {
          try { react(before); } catch (e) {}
        }
        return result;
      };

      try {
        window[name] = wrapped;
        return true;
      } catch (e) {
        return false;
      }
    }

    /* La vista de Vida registra la función original como listener directo.
       Este hook de captura cubre ese camino sin quitar listeners de la app. */
    function installVidaViewHook() {
      document.addEventListener("click", function (ev) {
        try {
          var target = ev.target;
          if (!target || typeof target.closest !== "function") return;
          if (target.closest(".btn-plan-add")) return;
          var card = target.closest("#view-vida .mission[data-mid]");
          if (!card) return;
          var before = snapshot();
          setTimeout(function () {
            try { react(before); } catch (e) {}
          }, 0);
        } catch (e) {}
      }, true);
    }

    /* ==========================================================
       7) Botón de silencio inyectado
       ========================================================== */
    function updateSoundButton(btn) {
      if (!btn) return;
      btn.textContent = "";
      var icon = document.createElement("span");
      icon.className = "odea-juice-sound-ico";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = soundOn ? "🔊" : "🔇";
      var label = document.createElement("span");
      label.className = "odea-juice-sound-label";
      label.textContent = "SONIDOS";
      btn.appendChild(icon);
      btn.appendChild(label);
      btn.setAttribute("aria-pressed", soundOn ? "true" : "false");
      btn.setAttribute("aria-label", soundOn
        ? "Silenciar sonidos de celebración"
        : "Activar sonidos de celebración");
      btn.title = soundOn
        ? "Sonidos de celebración activados"
        : "Sonidos de celebración silenciados";
    }

    function injectSoundButton() {
      if (document.getElementById("odea-juice-snd")) return;
      var host = document.querySelector("#side-settings .side-settings-body") ||
        document.querySelector(".hud");
      if (!host) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = "odea-juice-snd";
      btn.className = "odea-juice-sound" + (host.classList.contains("hud") ? " is-compact" : "");
      btn.addEventListener("click", function (ev) {
        try { ev.stopPropagation(); } catch (e) {}
        soundOn = !soundOn;
        saveSoundPref();
        updateSoundButton(btn);
        if (soundOn) {
          audioUnlocked = true;
          ensureAudio();
          soundComplete();
        }
      });
      updateSoundButton(btn);
      host.insertBefore(btn, host.firstChild);
    }

    /* ==========================================================
       8) Montaje
       ========================================================== */
    function install() {
      injectSoundButton();

      wrapAction("toggleDailyMission");
      wrapAction("toggleWeekly");
      wrapAction("toggleCampaign");
      wrapAction("focusComplete");
      wrapAction("toggleJob");
      wrapAction("vidaToggle");

      /* La Cacería derrota al jefe dentro de huntV2Shot. */
      wrapAction("huntV2Shot");

      installVidaViewHook();
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", install, { once: true });
    } else {
      install();
    }
  } catch (err) {
    try {
      if (window.console && console.warn) console.warn("ODEA Juice v1 no se pudo montar:", err);
    } catch (e) {}
  }
})();
