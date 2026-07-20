/**
 * Senpa HUD enhance bridge
 * Syncs Senpaio:settings (+ defaults) to CSS variables.
 * Adds dual ping / FPS+Hz badges. Visual only — no game logic.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "Senpaio:settings";
  var root = document.documentElement;

  var defaults = {
    leaderboardTitle: "#705E5E",
    teamplayersTitle: "#705E5E",
    chatTab: "#705E5E",
    chatNick: "#705E5E",
    backgroundColor: "#111111",
    hudPanelBg: "#000000",
    hudPanelOpacity: 30,
    hudMinimapOpacity: 50,
    hudChatOpacity: 32,
    leaderboardHudScale: 100,
    alliesHudScale: 100,
    minimapHudScale: 100,
    chatHudScale: 100,
    statsHudScale: 100,
    hudEdgeGap: 5,
    showLeaderboardHud: true,
    showAlliesHud: true,
    showMinimapHud: true,
    showChatHud: true,
    showFpsHzBadge: true,
    showDualPingBadge: true,
  };

  function hexToRgb(hex) {
    if (!hex || typeof hex !== "string") return "0, 0, 0";
    var h = hex.replace("#", "").trim();
    if (h.length === 3)
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return "0, 0, 0";
    var n = parseInt(h, 16);
    if (isNaN(n)) return "0, 0, 0";
    return ((n >> 16) & 255) + ", " + ((n >> 8) & 255) + ", " + (n & 255);
  }

  function readSettings() {
    var out = Object.assign({}, defaults);
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) Object.assign(out, JSON.parse(raw));
    } catch (e) {}
    return out;
  }

  function pct(v, fallback) {
    var n = Number(v);
    if (!isFinite(n)) n = fallback;
    return Math.max(0, Math.min(100, n));
  }

  function scale(v, fallback) {
    return pct(v, fallback) / 100;
  }

  function apply(settings) {
    var s = settings || readSettings();
    root.style.setProperty(
      "--hud-leaderboard-title-color",
      s.leaderboardTitle || defaults.leaderboardTitle
    );
    root.style.setProperty(
      "--hud-allies-title-color",
      s.teamplayersTitle || defaults.teamplayersTitle
    );
    root.style.setProperty(
      "--hud-chat-active-tab-color",
      s.chatTab || defaults.chatTab
    );
    root.style.setProperty(
      "--hud-chat-name-color",
      s.chatNick || defaults.chatNick
    );
    root.style.setProperty(
      "--hud-chat-party-color",
      s.chatNick || defaults.chatNick
    );
    root.style.setProperty(
      "--hud-bg-color",
      s.backgroundColor || defaults.backgroundColor
    );
    root.style.setProperty(
      "--hud-panel-bg-rgb",
      hexToRgb(s.hudPanelBg || defaults.hudPanelBg)
    );
    root.style.setProperty(
      "--hud-minimap-bg-rgb",
      hexToRgb(s.hudPanelBg || defaults.hudPanelBg)
    );
    root.style.setProperty(
      "--hud-chat-bg-rgb",
      hexToRgb(s.hudPanelBg || defaults.hudPanelBg)
    );
    root.style.setProperty(
      "--hud-panel-opacity",
      String(pct(s.hudPanelOpacity, 30) / 100)
    );
    root.style.setProperty(
      "--hud-minimap-opacity",
      String(pct(s.hudMinimapOpacity, 50) / 100)
    );
    root.style.setProperty(
      "--hud-chat-opacity",
      String(pct(s.hudChatOpacity, 32) / 100)
    );
    root.style.setProperty(
      "--hud-leaderboard-scale",
      String(scale(s.leaderboardHudScale, 100))
    );
    root.style.setProperty(
      "--hud-allies-scale",
      String(scale(s.alliesHudScale, 100))
    );
    root.style.setProperty(
      "--hud-minimap-scale",
      String(scale(s.minimapHudScale, 100))
    );
    root.style.setProperty(
      "--hud-chat-scale",
      String(scale(s.chatHudScale, 100))
    );
    root.style.setProperty(
      "--hud-stats-scale",
      String(scale(s.statsHudScale, 100))
    );
    root.style.setProperty("--hud-edge-gap", pct(s.hudEdgeGap, 5) + "px");

    document.body.classList.toggle(
      "hide-leaderboard",
      s.showLeaderboardHud === false
    );
    document.body.classList.toggle("hide-allies", s.showAlliesHud === false);
    document.body.classList.toggle("hide-minimap", s.showMinimapHud === false);
    document.body.classList.toggle("hide-chat", s.showChatHud === false);

    ensureBadges(s);
  }

  function ensureBadges(s) {
    var el = document.getElementById("senpa-hud-badges");
    if (!el) {
      el = document.createElement("div");
      el.id = "senpa-hud-badges";
      el.innerHTML =
        '<div class="senpa-hud-badge" id="senpa-fps-badge">' +
        '<span id="senpa-fps-value">0</span> FPS' +
        '<span class="sep">|</span>' +
        '<span class="hz" id="senpa-hz-value">--Hz</span></div>' +
        '<div class="senpa-hud-badge ping" id="senpa-ping1-badge" style="display:none">' +
        '<span class="ping-slot">1</span>' +
        '<span id="senpa-ping1-value">--ms</span></div>' +
        '<div class="senpa-hud-badge ping" id="senpa-ping2-badge" style="display:none">' +
        '<span class="ping-slot">2</span>' +
        '<span id="senpa-ping2-value">--ms</span></div>';
      document.body.appendChild(el);
    }
    el.style.display = s.showFpsHzBadge === false ? "none" : "flex";
  }

  function setPingTone(badge, ms) {
    if (!badge) return;
    badge.classList.remove("warn", "bad");
    if (ms > 120) badge.classList.add("bad");
    else if (ms > 70) badge.classList.add("warn");
  }

  function updateTelemetry() {
    var s = readSettings();
    var fpsEl = document.getElementById("senpa-fps-value");
    var hzEl = document.getElementById("senpa-hz-value");
    var p1b = document.getElementById("senpa-ping1-badge");
    var p2b = document.getElementById("senpa-ping2-badge");
    var p1v = document.getElementById("senpa-ping1-value");
    var p2v = document.getElementById("senpa-ping2-value");
    var tel = window.__senpaHudTelemetry;

    if (hzEl && hzEl.dataset.est) {
      hzEl.textContent = hzEl.dataset.est + "Hz";
    }

    if (tel && fpsEl && typeof tel.fps === "number") {
      fpsEl.textContent = String(tel.fps);
    } else {
      var stats = document.querySelector(".stats-display");
      if (stats && fpsEl) {
        var fm = (stats.textContent || "").match(/FPS:\s*(\d+)/i);
        if (fm) fpsEl.textContent = fm[1];
      }
    }

    function showPing(badge, valueEl, ms, connected) {
      if (!badge || !valueEl) return;
      if (s.showDualPingBadge === false) {
        badge.style.display = "none";
        return;
      }
      if (!connected || ms == null || !isFinite(Number(ms))) {
        badge.style.display = "none";
        badge.dataset.active = "none";
        return;
      }
      var n = Math.round(Number(ms));
      valueEl.textContent = n + "ms";
      badge.dataset.active = "flex";
      badge.style.display = "flex";
      setPingTone(badge, n);
    }

    if (tel) {
      showPing(p1b, p1v, tel.ping1, tel.connected !== false);
      showPing(p2b, p2v, tel.ping2, !!tel.connected2);
    } else {
      var stats2 = document.querySelector(".stats-display");
      if (stats2) {
        var pm = (stats2.textContent || "").match(/(\d+)\s*ms/i);
        if (pm) showPing(p1b, p1v, +pm[1], true);
      }
    }
  }

  (function estimateHz() {
    var samples = [];
    var last = performance.now();
    var n = 0;
    function tick(now) {
      var d = now - last;
      last = now;
      if (d > 0 && d < 100) samples.push(d);
      if (++n < 60) requestAnimationFrame(tick);
      else {
        samples.sort(function (a, b) {
          return a - b;
        });
        var mid = samples[Math.floor(samples.length / 2)] || 16.67;
        var hz = Math.round(1000 / mid);
        if (hz >= 50 && hz <= 360) {
          var hzEl = document.getElementById("senpa-hz-value");
          if (hzEl) {
            hzEl.dataset.est = String(hz);
            hzEl.textContent = hz + "Hz";
          }
        }
      }
    }
    requestAnimationFrame(tick);
  })();

  window.SenpaHudEnhance = {
    apply: apply,
    read: readSettings,
    syncFromSettingsObject: function (obj) {
      if (!obj || typeof obj !== "object") return apply();
      apply(Object.assign(readSettings(), obj));
    },
  };

  apply();
  var applyTick = 0;
  setInterval(function () {
    if (++applyTick % 4 === 0) apply(readSettings());
    updateTelemetry();
  }, 250);

  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY) apply();
  });
})();
