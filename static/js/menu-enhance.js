/**
 * Senpa menu enhance — name fields, Nick 404, skin drives, servers.
 * Visual only. No Performance Mode.
 */
(function () {
  "use strict";

  var LABEL_MAP = {
    tag: "CLAN TAG",
    name: "PRIMARY PLAYER",
    code: "CODE",
  };

  var QUOTE =
    "One day, memories will be all we have, so create the most beautiful ones.";

  function wrapFields() {
    var box = document.querySelector("#primary-inputs");
    if (!box || box.dataset.senpaFields) return;
    box.dataset.senpaFields = "1";

    Array.prototype.slice.call(box.querySelectorAll("input")).forEach(function (input) {
      if (input.closest(".senpa-field")) return;
      var wrap = document.createElement("div");
      wrap.className = "senpa-field";
      if (input.getAttribute("data-cell2")) wrap.dataset.for = "cell2";
      else if (input.id) wrap.dataset.for = input.id;

      var label = document.createElement("label");
      if (input.getAttribute("data-cell2")) {
        label.textContent = "SECONDARY PLAYER";
      } else {
        label.textContent =
          LABEL_MAP[input.id] || (input.placeholder || "INPUT").toUpperCase();
      }
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(label);
      wrap.appendChild(input);

      if (input.id === "name" || input.getAttribute("data-cell2")) {
        input.style.maxWidth = "none";
        input.style.width = "100%";
        input.style.fontSize = "17px";
        input.style.fontWeight = "600";
      }
    });
  }

  function ensureSkinDrives() {
    var center = document.querySelector("#menu .main-menu .panel.center");
    if (!center) return;

    var s1 = document.getElementById("skinURL1");
    var s2 = document.getElementById("skinURL2");
    if (!s1) return;

    [s1, s2].forEach(function (el) {
      if (!el) return;
      el.style.height = "";
      el.style.visibility = "visible";
      el.style.width = "100%";
      el.style.display = "block";
      if (!el.placeholder) {
        el.placeholder =
          el.id === "skinURL2" ? "Secondary skin URL" : "Primary skin URL";
      }
    });

    var drives = document.getElementById("senpa-skin-drives");
    if (!drives) {
      drives = document.createElement("div");
      drives.id = "senpa-skin-drives";
      drives.innerHTML =
        '<div class="senpa-drive active" data-slot="1">' +
        '<span class="drive-label">PRIMARY SKIN</span>' +
        '<div class="drive-circle"><img id="senpa-skin-preview-1" alt="" /></div></div>' +
        '<div class="senpa-drive" data-slot="2">' +
        '<span class="drive-label">SECONDARY SKIN</span>' +
        '<div class="drive-circle"><img id="senpa-skin-preview-2" alt="" /></div></div>';
      var logo = center.querySelector(".logo");
      if (logo && logo.nextSibling) center.insertBefore(drives, logo.nextSibling);
      else center.insertBefore(drives, center.firstChild);
    }

    function bind(input, imgId, driveSel) {
      if (!input) return;
      var img = document.getElementById(imgId);
      var drive = document.querySelector(driveSel);
      var apply = function () {
        var url = (input.value || "").trim();
        if (img) {
          if (url) {
            img.src = url;
            img.style.display = "block";
          } else {
            img.removeAttribute("src");
            img.style.display = "none";
          }
        }
      };
      if (!input.dataset.senpaSkinBound) {
        input.dataset.senpaSkinBound = "1";
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
        if (drive) {
          drive.addEventListener("click", function () {
            document.querySelectorAll(".senpa-drive").forEach(function (d) {
              d.classList.remove("active");
            });
            drive.classList.add("active");
            input.focus();
          });
        }
      }
      apply();
    }

    bind(s1, "senpa-skin-preview-1", '.senpa-drive[data-slot="1"]');
    bind(s2, "senpa-skin-preview-2", '.senpa-drive[data-slot="2"]');
  }

  function set404Awake(on) {
    var card = document.getElementById("senpa-nick404");
    if (card) card.classList.toggle("is-awake", !!on);
    document.body.classList.toggle("senpa-404-awake", !!on);
  }

  function bind404(card) {
    if (!card || card.dataset.quoteBound) return;
    card.dataset.quoteBound = "1";

    card.addEventListener("mouseenter", function () {
      set404Awake(true);
    });
    card.addEventListener("mouseleave", function () {
      set404Awake(false);
      Array.prototype.slice
        .call(card.querySelectorAll(".n404-digit"))
        .forEach(function (d) {
          d.classList.remove("is-hot");
          d.style.setProperty("--mx", "0px");
          d.style.setProperty("--my", "0px");
        });
    });

    Array.prototype.slice
      .call(card.querySelectorAll(".n404-digit"))
      .forEach(function (digit) {
        digit.addEventListener("mouseenter", function () {
          digit.classList.add("is-hot");
          set404Awake(true);
        });
        digit.addEventListener("mousemove", function (e) {
          var r = digit.getBoundingClientRect();
          var dx = ((e.clientX - r.left) / r.width - 0.5) * 16;
          var dy = ((e.clientY - r.top) / r.height - 0.5) * 16;
          digit.style.setProperty("--mx", dx.toFixed(1) + "px");
          digit.style.setProperty("--my", dy.toFixed(1) + "px");
          digit.classList.add("is-hot");
          set404Awake(true);
        });
        digit.addEventListener("mouseleave", function () {
          digit.classList.remove("is-hot");
          digit.style.setProperty("--mx", "0px");
          digit.style.setProperty("--my", "0px");
        });
      });

    var quote = card.querySelector(".n404-quote");
    if (quote && !quote.dataset.driftBound) {
      quote.dataset.driftBound = "1";
      quote.addEventListener("mousemove", function (e) {
        var r = quote.getBoundingClientRect();
        var dx = ((e.clientX - r.left) / r.width - 0.5) * 8;
        var dy = ((e.clientY - r.top) / r.height - 0.5) * 6;
        quote.style.setProperty("--qx", dx.toFixed(1) + "px");
        quote.style.setProperty("--qy", dy.toFixed(1) + "px");
      });
      quote.addEventListener("mouseleave", function () {
        quote.style.setProperty("--qx", "0px");
        quote.style.setProperty("--qy", "0px");
      });
    }
  }

  function placeNick404(card) {
    var center = document.querySelector("#menu .main-menu .panel.center");
    if (!center || !card) return;

    // Glue directly under the "Advertisement" label
    var adInformer = center.querySelector(".advertisement-informer");
    var discord = center.querySelector("#discord_link");

    if (adInformer && adInformer.parentNode) {
      var parent = adInformer.parentNode;
      if (card.previousElementSibling !== adInformer || card.parentNode !== parent) {
        if (adInformer.nextSibling) {
          parent.insertBefore(card, adInformer.nextSibling);
        } else {
          parent.appendChild(card);
        }
      }
      return;
    }

    var anchor =
      center.querySelector(".main-btns") ||
      center.querySelector("#spectate") ||
      center.querySelector("#play");
    if (anchor && anchor.parentNode) {
      var p = anchor.parentNode;
      if (card.previousElementSibling !== anchor || card.parentNode !== p) {
        if (anchor.nextSibling) p.insertBefore(card, anchor.nextSibling);
        else p.appendChild(card);
      }
      return;
    }

    if (discord && discord.parentNode) {
      discord.parentNode.insertBefore(card, discord);
      return;
    }
    if (card.parentNode !== center) center.appendChild(card);
  }

  function ensureNick404() {
    var center = document.querySelector("#menu .main-menu .panel.center");
    if (!center) return;

    var existing = document.getElementById("senpa-nick404");
    if (existing) {
      // Always keep it under the center ads (black area)
      placeNick404(existing);
      if (!existing.dataset.senpa404Ready) {
        var kick = existing.querySelector(".n404-kicker");
        var sub = existing.querySelector(".n404-sub");
        if (kick) kick.remove();
        if (sub) sub.remove();
        var hintEl = existing.querySelector(".n404-hint");
        if (hintEl) {
          hintEl.innerHTML =
            'Hover your mouse on nick <strong>404</strong>';
        }
        if (!existing.querySelector(".n404-quote")) {
          var q = document.createElement("p");
          q.className = "n404-quote";
          q.textContent = QUOTE;
          existing.appendChild(q);
        }
        existing.dataset.senpa404Ready = "1";
        bind404(existing);
      }
      return;
    }

    var card = document.createElement("div");
    card.id = "senpa-nick404";
    card.dataset.senpa404Ready = "1";
    card.innerHTML =
      '<div class="n404-hint">Hover your mouse on nick <strong>404</strong></div>' +
      '<div class="n404-name" aria-label="404">' +
      '<span class="n404-digit" data-d="4">4</span>' +
      '<span class="n404-digit" data-d="0">0</span>' +
      '<span class="n404-digit" data-d="4b">4</span>' +
      "</div>" +
      '<p class="n404-quote">' +
      QUOTE +
      "</p>";

    placeNick404(card);
    if (!card.parentNode) center.appendChild(card);
    bind404(card);
  }

  function ensureProfileStrip() {
    if (document.getElementById("senpa-profile-strip")) return;
    if (!document.getElementById("menu")) return;
    var el = document.createElement("div");
    el.id = "senpa-profile-strip";
    el.innerHTML =
      '<span class="dot"></span><div><div>SENPA</div>' +
      '<div class="muted">EMBER DECK</div></div>';
    document.body.appendChild(el);
  }

  function ensureSettingsFab() {
    var menu = document.getElementById("menu");
    if (!menu) return;
    var fab = document.getElementById("senpa-settings-fab");
    if (!fab) {
      fab = document.createElement("button");
      fab.id = "senpa-settings-fab";
      fab.type = "button";
      fab.textContent = "SETTINGS";
      fab.addEventListener("click", function () {
        var toggle =
          document.getElementById("settings-toggle") ||
          document.querySelector("#menu #settings-toggle") ||
          document.querySelector(".setting-btn-container #settings-toggle");
        if (toggle) toggle.click();
      });
      document.body.appendChild(fab);
    }
    var visible =
      getComputedStyle(menu).display !== "none" && menu.offsetParent !== null;
    var next = visible ? "block" : "none";
    if (fab.style.display !== next) fab.style.display = next;
  }

  function syncProfileVisibility() {
    var strip = document.getElementById("senpa-profile-strip");
    var menu = document.getElementById("menu");
    if (!strip) return;
    var visible =
      menu &&
      getComputedStyle(menu).display !== "none" &&
      menu.offsetParent !== null;
    var next = visible ? "flex" : "none";
    if (strip.style.display !== next) strip.style.display = next;
  }

  function boostServerRows() {
    var rows = document.querySelectorAll(
      "#menu .main-menu .panel.right .list-container .list-row"
    );
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (row.classList.contains("header")) continue;
      if (!row.classList.contains("senpa-server-row")) {
        row.classList.add("senpa-server-row");
      }
      var cells = row.querySelectorAll(".list-cell");
      for (var c = 0; c < cells.length; c++) {
        if (!cells[c].classList.contains("senpa-server-cell")) {
          cells[c].classList.add("senpa-server-cell");
        }
        if (c === 0 && !cells[c].classList.contains("senpa-server-name")) {
          cells[c].classList.add("senpa-server-name");
        }
      }
    }
  }

  var _tickBusy = false;
  function tick() {
    if (_tickBusy) return;
    _tickBusy = true;
    try {
      wrapFields();
      ensureSkinDrives();
      ensureNick404();
      ensureProfileStrip();
      ensureSettingsFab();
      syncProfileVisibility();
      boostServerRows();
    } catch (_e) {
    } finally {
      _tickBusy = false;
    }
  }

  tick();
  setInterval(tick, 800);
  var _moTimer = null;
  new MutationObserver(function () {
    if (_moTimer) return;
    _moTimer = setTimeout(function () {
      _moTimer = null;
      tick();
    }, 250);
  }).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
