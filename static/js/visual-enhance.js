/**
 * Senpa visual enhance — textures, presets, top HUD, spectate ring.
 * Visual / telemetry only. No netcode changes beyond ping helpers exposed by engine.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "Senpaio:settings";
  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var lastMsg = "";
  var lastMsgAt = 0;

  var PRESETS = {
    competitive: {
      graphicsQuality: 1,
      showTopHud: true,
      showSpectateRing: true,
    },
    cinematic: {
      graphicsQuality: 1.35,
      showTopHud: true,
      showSpectateRing: true,
    },
  };

  function readSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function writeSettings(partial) {
    var cur = readSettings();
    Object.assign(cur, partial);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cur));
    } catch (e) {}
    return cur;
  }

  function getPixi() {
    return window.PIXI || window.pixi || null;
  }

  function applyTextures(settings) {
    var s = settings || readSettings();
    var smooth =
      s.webglSmoothSkins !== false && s.webglSmoothCellTextures !== false;
    var mipmaps = s.webglTextureMipmaps !== false;
    var PIXI = getPixi();
    if (!PIXI) return;

    try {
      if (PIXI.settings) {
        if (PIXI.MIPMAP_MODES) {
          PIXI.settings.MIPMAP_TEXTURES = mipmaps
            ? PIXI.MIPMAP_MODES.ON
            : PIXI.MIPMAP_MODES.OFF;
        }
        if (PIXI.SCALE_MODES) {
          PIXI.settings.SCALE_MODE = smooth
            ? PIXI.SCALE_MODES.LINEAR
            : PIXI.SCALE_MODES.NEAREST;
        }
      }

      var cache =
        (PIXI.utils && PIXI.utils.BaseTextureCache) ||
        (PIXI.BaseTexture && PIXI.BaseTexture.Cache) ||
        null;
      if (!cache) return;

      Object.keys(cache).forEach(function (key) {
        var bt = cache[key];
        if (!bt) return;
        try {
          if (PIXI.SCALE_MODES) {
            bt.scaleMode = smooth
              ? PIXI.SCALE_MODES.LINEAR
              : PIXI.SCALE_MODES.NEAREST;
          }
          if (PIXI.MIPMAP_MODES && "mipmap" in bt) {
            bt.mipmap = mipmaps
              ? PIXI.MIPMAP_MODES.ON
              : PIXI.MIPMAP_MODES.OFF;
          }
          if (typeof bt.update === "function") bt.update();
        } catch (e) {}
      });
    } catch (e) {}
  }

  function applyCanvasSmoothing(settings) {
    var s = settings || readSettings();
    var smooth = s.webglSmoothSkins !== false;
    var canvas = document.getElementById("screen");
    if (!canvas) return;
    try {
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = smooth;
      if ("imageSmoothingQuality" in ctx) {
        ctx.imageSmoothingQuality = smooth ? "high" : "low";
      }
    } catch (e) {}
  }

  function applyPreset(name) {
    if (!name || name === "custom") return readSettings();
    var preset = PRESETS[name];
    if (!preset) return readSettings();
    var next = writeSettings(Object.assign({ appearancePreset: name }, preset));
    applyTextures(next);
    applyCanvasSmoothing(next);
    if (window.SenpaHudEnhance && window.SenpaHudEnhance.syncFromSettingsObject) {
      window.SenpaHudEnhance.syncFromSettingsObject(next);
    }
    return next;
  }

  function ensureTopHud() {
    var el = document.getElementById("senpa-top-hud");
    if (!el) {
      el = document.createElement("div");
      el.id = "senpa-top-hud";
      el.innerHTML = '<div class="status" id="senpa-top-hud-status">SENPA</div>';
      document.body.appendChild(el);
    }
    return el;
  }

  function ensureSpectateRing() {
    var el = document.getElementById("senpa-spectate-ring");
    if (!el) {
      el = document.createElement("div");
      el.id = "senpa-spectate-ring";
      document.body.appendChild(el);
    }
    return el;
  }

  function menuVisible() {
    var menu = document.getElementById("menu");
    if (!menu) return false;
    return (
      getComputedStyle(menu).display !== "none" && menu.offsetParent !== null
    );
  }

  function setTopMessage(msg, ttlMs) {
    lastMsg = String(msg || "");
    lastMsgAt = performance.now();
    if (ttlMs) {
      setTimeout(function () {
        if (performance.now() - lastMsgAt >= ttlMs - 20) lastMsg = "";
      }, ttlMs);
    }
  }

  function updateTopHud(settings) {
    var s = settings || readSettings();
    var el = ensureTopHud();
    var status = document.getElementById("senpa-top-hud-status");
    var show = s.showTopHud !== false && !menuVisible();
    el.classList.toggle("visible", show);
    if (!show || !status) return;

    var tel = window.__senpaHudTelemetry || {};
    var parts = [];
    if (window.__senpaIsSpectating) parts.push("SPECTATE");
    else if (tel.connected) parts.push("LIVE");
    else parts.push("STANDBY");

    if (tel.ping1 != null && isFinite(Number(tel.ping1))) {
      parts.push("P1 " + Math.round(tel.ping1) + "ms");
    }
    if (tel.connected2 && tel.ping2 != null && isFinite(Number(tel.ping2))) {
      parts.push("P2 " + Math.round(tel.ping2) + "ms");
    }
    if (lastMsg && performance.now() - lastMsgAt < 4500) {
      parts = [lastMsg];
    }
    status.textContent = parts.join("  ·  ");
  }

  function updateSpectateRing(settings) {
    var s = settings || readSettings();
    var ring = ensureSpectateRing();
    var on =
      s.showSpectateRing !== false &&
      !!window.__senpaIsSpectating &&
      !menuVisible();
    ring.style.display = on ? "block" : "none";
    if (!on) return;
    ring.style.left = mouse.x + "px";
    ring.style.top = mouse.y + "px";
  }

  function tick() {
    var s = readSettings();
    updateTopHud(s);
    updateSpectateRing(s);
  }

  window.addEventListener(
    "mousemove",
    function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    },
    { passive: true }
  );

  window.addEventListener("senpa:top-hud", function (e) {
    if (e && e.detail) setTopMessage(e.detail.message || e.detail, 4000);
  });

  // Catch common notify text as top HUD flash
  var obs = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var nodes = muts[i].addedNodes;
      for (var j = 0; j < nodes.length; j++) {
        var n = nodes[j];
        if (!n || n.nodeType !== 1) continue;
        var text = (n.textContent || "").trim();
        if (
          text &&
          text.length < 80 &&
          (n.className + "").indexOf("notify") !== -1
        ) {
          setTopMessage(text, 3500);
        }
      }
    }
  });
  if (document.body) {
    obs.observe(document.body, { childList: true, subtree: true });
  }

  window.SenpaVisualEnhance = {
    applyTextures: applyTextures,
    applyCanvasSmoothing: applyCanvasSmoothing,
    applyPreset: applyPreset,
    setTopMessage: setTopMessage,
    read: readSettings,
  };

  applyTextures();
  applyCanvasSmoothing();
  ensureTopHud();
  ensureSpectateRing();
  setInterval(tick, 200);
  setInterval(function () {
    applyTextures(readSettings());
    applyCanvasSmoothing(readSettings());
  }, 2500);
})();
