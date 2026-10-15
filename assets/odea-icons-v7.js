/*
 * ODEA Icons v7
 * Iconos vectoriales originales para la navegación principal.
 * Se monta después de la aplicación para no tocar la lógica de estado.
 */
(function () {
  "use strict";

  var icons = {
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5 9 3l6 3 5-2.5v15L15 21l-6-3-5 2.5z"/><path d="M9 3v15M15 6v15"/><circle cx="16.8" cy="8.1" r="1.6"/></svg>',
    daily: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7 3.5v4M17 3.5v4M3.5 10h17M7 14h3M14 14h3M7 17h3"/></svg>',
    planner: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/><path d="m8 12 1.3 1.3L12 10.5"/></svg>',
    campaign: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h10l2 2v15H6z"/><path d="M16 3.5v3h3M9 10h6M9 14h6M9 18h4"/></svg>',
    vida: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3c5 0 5 5 10 5M7 8c5 0 5 5 10 5M7 13c5 0 5 5 10 5M7 18c5 0 5 3 10 3"/><path d="M17 3c-5 0-5 5-10 5M17 8c-5 0-5 5-10 5M17 13c-5 0-5 5-10 5"/></svg>',
    empire: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 19 2-8 4 3 2-8 2 8 4-3 2 8z"/><path d="M6 21h12M8 19l-1-4M16 19l1-4"/></svg>',
    inventory: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h16v12H4z"/><path d="m4 7.5 2-3h12l2 3M9 11h6"/></svg>',
    shop: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/><path d="M12 8v8M9.5 10.2c.5-1.5 4.5-1.7 5-.1.6 1.8-4.9 1.4-5 3.2-.1 1.7 4.3 1.9 5 .2"/></svg>'
  };

  function svg(name) {
    return '<span class="odea-icon" aria-hidden="true">' + (icons[name] || icons.map) + "</span>";
  }

  function mount(selector, name) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (el.dataset.odeaIconMounted === "1") return;
      el.dataset.odeaIconMounted = "1";
      el.innerHTML = svg(name);
    });
  }

  function prependButtonIcon(selector, name) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (el.querySelector(":scope > .odea-icon")) return;
      Array.prototype.slice.call(el.childNodes).forEach(function (node) {
        if (node.nodeType !== 3) return;
        node.nodeValue = node.nodeValue.replace(/^\s*(🎒|🪙)\s*/, "");
      });
      var span = document.createElement("span");
      span.className = "odea-icon";
      span.setAttribute("aria-hidden", "true");
      span.innerHTML = icons[name] || icons.map;
      el.prepend(span);
    });
  }

  function decorate() {
    mount('.nav-item[data-tab="map"] .ni-ico, .navb[data-tab="map"] .nb-ico', "map");
    mount('.nav-item[data-tab="daily"] .ni-ico, .navb[data-tab="daily"] .nb-ico', "daily");
    mount('.nav-item[data-tab="planner"] .ni-ico, .navb[data-tab="planner"] .nb-ico', "planner");
    mount('.nav-item[data-tab="campaign"] .ni-ico, .navb[data-tab="campaign"] .nb-ico', "campaign");
    mount('.nav-item[data-tab="vida"] .ni-ico, .navb[data-tab="vida"] .nb-ico', "vida");
    mount('.nav-item[data-tab="capital"] .ni-ico, .navb[data-tab="capital"] .nb-ico', "empire");
    mount("#bottom-inv .nb-ico", "inventory");
    prependButtonIcon("#side-inv", "inventory");
    prependButtonIcon("#side-shop", "shop");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", decorate, { once: true });
  } else {
    decorate();
  }
})();
