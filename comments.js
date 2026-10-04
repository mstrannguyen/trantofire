/* ===========================================================================
   Tran to Fire — comments, powered by FastComments.

   ONE THING TO EDIT IN THIS FILE. Paste your Tenant ID on the line below and
   redeploy. Nothing else here needs touching, ever.

   Where to get it:
     1. sign up at fastcomments.com (Flex plan, 30 day trial, no card)
     2. add trantofire.au as your site in the account settings, or the widget
        will load and then refuse with a domain authorisation error
     3. copy the Tenant ID from fastcomments.com/auth/my-account/api-secret

   HOW A COMMENT THREAD IS ATTACHED TO SOMETHING

   Every thread has a urlId, which is the drawer FastComments files the
   comments in. Threads on this site are named by hand rather than by page
   URL, so the conversation survives a page being renamed or moved:

       home            the home page
       strategy        the Strategy page
       progress        the Progress page
       my-story        the My Story page
       journal-2026-08 one per journal entry, set in js/journal-render.js

   DO NOT CHANGE a urlId once real comments exist under it. Changing it
   orphans every comment already filed there.

   To put a thread on a new page, add this where you want it, and the script
   tag for this file at the bottom of that page:

       <div class="fc-slot" data-comments="some-id"
            data-comments-title="Shown in your moderation dashboard"></div>

   The widget is only fetched when the reader scrolls near it, so pages that
   nobody scrolls to the bottom of stay as fast as they are now.
   =========================================================================== */
(function () {
  "use strict";

  var TENANT_ID = "ndvTLjF3MQ5";

  var SDK  = "https://cdn.fastcomments.com/js/embed-v2.min.js";
  var SITE = "https://trantofire.au";

  var loading = false, ready = false, waiting = [];

  function configured() {
    return !!TENANT_ID && TENANT_ID.indexOf("YOUR_") !== 0;
  }

  function loadSDK(done) {
    if (ready) return done();
    waiting.push(done);
    if (loading) return;
    loading = true;

    var s = document.createElement("script");
    s.src = SDK;
    s.async = true;
    s.onload = function () {
      ready = true;
      var q = waiting; waiting = [];
      q.forEach(function (f) { f(); });
    };
    s.onerror = function () {
      loading = false;
      var q = waiting; waiting = [];
      q.forEach(function (f) { f("failed"); });
    };
    document.head.appendChild(s);
  }

  function say(el, text) {
    el.innerHTML = "";
    var p = document.createElement("p");
    p.className = "fc-note";
    p.textContent = text;
    el.appendChild(p);
  }

  /* A short line above every thread saying where a reader's email actually
     goes. Rendered here rather than in the pages so there is one copy of it
     and the journal entries get it too. */
  function privacyLine(el) {
    if (!el.parentNode || el.parentNode.querySelector(".fc-privacy")) return;

    var p = document.createElement("p");
    p.className = "fc-note fc-privacy";
    p.style.marginBottom = "18px";
    p.appendChild(document.createTextNode(
      "Comments run on FastComments rather than on this site. If you leave an " +
      "email it is used to tell you about replies and to sign you back in. " +
      "FastComments stores it, not me, and it is never shown publicly or sold. "));

    var a = document.createElement("a");
    a.href = "/privacy/";
    a.appendChild(document.createTextNode("What this site knows about you"));
    p.appendChild(a);
    p.appendChild(document.createTextNode("."));

    el.parentNode.insertBefore(p, el);
  }

  /* Put a thread into an element.
     opts: urlId (required), url, pageTitle */
  function mount(el, opts) {
    if (!el || el.getAttribute("data-mounted")) return;
    opts = opts || {};
    if (!opts.urlId) return;
    el.setAttribute("data-mounted", "1");

    if (!configured()) {
      say(el, "Comments are not switched on yet.");
      return;
    }

    loadSDK(function (err) {
      if (err || !window.FastCommentsUI) {
        el.removeAttribute("data-mounted");
        say(el, "Comments could not load. Refreshing the page usually fixes it.");
        return;
      }
      privacyLine(el);
      window.FastCommentsUI(el, {
        tenantId:  TENANT_ID,
        urlId:     opts.urlId,
        url:       opts.url || (SITE + location.pathname),
        pageTitle: opts.pageTitle || document.title
      });
    });
  }

  /* Any element with data-comments becomes a thread, loaded when it is
     nearly in view. */
  function auto() {
    var slots = document.querySelectorAll("[data-comments]");
    if (!slots.length) return;

    Array.prototype.forEach.call(slots, function (el) {
      var opts = {
        urlId:     el.getAttribute("data-comments"),
        url:       el.getAttribute("data-comments-url") || "",
        pageTitle: el.getAttribute("data-comments-title") || document.title
      };

      if (!("IntersectionObserver" in window)) return mount(el, opts);

      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            io.disconnect();
            mount(el, opts);
            return;
          }
        }
      }, { rootMargin: "400px 0px" });

      io.observe(el);
    });
  }

  window.TTFComments = { mount: mount, configured: configured };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", auto);
  } else {
    auto();
  }
})();
