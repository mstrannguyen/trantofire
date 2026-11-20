/* What every chart on the site shares: its colours, and the helpers that keep
   the words on a chart readable.

   COLOURS. Each one is a CSS variable, --k-*, set in the :root block of every
   page that has a chart (Home, Strategy, Progress, Journal). The four blocks
   are the same. A colour has two steps: the mark (lines, markers, shading),
   which clears 3:1 against the white card, and the text step, --k-*-t, for
   words printed in that colour, which clears 4.5:1.

     blue     the record high, and whatever a fund is measured against:
              the unleveraged fund, the return on every dollar in
     orange   the fund itself: what the rules bought, the return on the
              money spent on shares
     purple   3x (TQQQ on the growth chart, 3x on the leverage chart)
     up       Baseline, the first tier
     h1 h2 h3 Dip, Deep dip, Crash, lighter to darker
     red      a bar below zero in a Journal chart

   Gains and losses printed as figures keep the site's own #2F6B33 and
   #A33220. The tier colours mean tiers only.

   WIDTH. A chart is drawn at the width it is shown at, so its words stay
   the size they are set in. Before, every chart was drawn 880 wide and
   scaled to fit, and on a phone the labels came out at four or five pixels.
   fit() calls the painter with the host's width and again when it changes. */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var FONT = "EB Garamond,Georgia,serif";

  var K = {
    blue: "var(--k-blue)", orange: "var(--k-orange)", purple: "var(--k-purple)",
    up: "var(--k-up)", h1: "var(--k-h1)", h2: "var(--k-h2)", h3: "var(--k-h3)",
    red: "var(--k-red)",
    ink: "#3A2B31", grey: "#8A7A7E", greyText: "#6B5F62", axis: "#8A7A7E", card: "#FFFFFF"
  };

  /* The text step of a chart colour. Anything else comes back as it went in. */
  function txt(c) {
    var m = /^var\(--k-([a-z0-9]+)\)$/.exec(c || "");
    return m ? "var(--k-" + m[1] + "-t)" : c;
  }

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function svg(host, W, H, label) {
    var s = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
    if (label) s.setAttribute("aria-label", label);
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");
    host.innerHTML = "";
    host.appendChild(s);          // in the page before anything is measured
    return s;
  }

  function text(s, x, y, str, attrs) {
    var a = { x: x, y: y, "font-family": FONT, "font-size": "11.5", fill: K.axis };
    for (var k in attrs) a[k] = attrs[k];
    var t = el("text", a);
    t.textContent = str;
    s.appendChild(t);
    return t;
  }

  function box(node) {
    try { var b = node.getBBox(); return b && b.width > 0 ? b : null; }
    catch (e) { return null; }
  }

  /* The box around one label, or around the several lines of one. */
  function bounds(texts) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    [].concat(texts).forEach(function (t) {
      var b = t && box(t);
      if (!b) return;
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
      x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
    });
    return isFinite(x0) ? { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } : null;
  }

  /* A plate in the card's colour behind words that sit on the plot, so a line
     or a shaded band never runs through the letters. One plate for a label of
     several lines. */
  function plate(s, texts, pad) {
    texts = [].concat(texts).filter(function (t) { return t; });
    var b = bounds(texts);
    if (!b) return null;
    var p = pad === undefined ? 3 : pad;
    var r = el("rect", { x: (b.x - p - 1).toFixed(1), y: (b.y - p + 1).toFixed(1),
      width: (b.width + 2 * p + 2).toFixed(1), height: Math.max(0, b.height + 2 * p - 2).toFixed(1),
      rx: "3", fill: K.card, "fill-opacity": ".9" });
    s.insertBefore(r, texts[0]);
    return r;
  }

  /* Slide a label sideways until it is inside the drawing. */
  function keepIn(texts, lo, hi) {
    texts = [].concat(texts);
    var b = bounds(texts);
    if (!b) return 0;
    var dx = 0;
    if (b.x + b.width > hi) dx = hi - (b.x + b.width);
    if (b.x + dx < lo) dx = lo - b.x;
    if (dx) texts.forEach(function (t) { t.setAttribute("x", (+t.getAttribute("x") + dx).toFixed(1)); });
    return dx;
  }

  /* Does a run of straight lines pass through a box? Walked in small steps
     rather than solved, which is plenty at this size. */
  function crosses(b, lines) {
    var x0 = b.x - 2, x1 = b.x + b.width + 2, y0 = b.y - 1, y1 = b.y + b.height + 1;
    return (lines || []).some(function (pts) {
      for (var i = 1; i < pts.length; i++) {
        var p = pts[i - 1], q = pts[i];
        if (Math.max(p[0], q[0]) < x0 || Math.min(p[0], q[0]) > x1) continue;
        var n = Math.max(1, Math.ceil(Math.max(Math.abs(q[0] - p[0]), Math.abs(q[1] - p[1])) / 2));
        for (var k = 0; k <= n; k++) {
          var x = p[0] + (q[0] - p[0]) * k / n, y = p[1] + (q[1] - p[1]) * k / n;
          if (x >= x0 && x <= x1 && y >= y0 && y <= y1) return true;
        }
      }
      return false;
    });
  }

  function overlap(a, b) {
    return !(a.x + a.width + 4 < b.x || b.x + b.width + 4 < a.x ||
             a.y + a.height + 2 < b.y || b.y + b.height + 2 < a.y);
  }

  /* The name of a level line ("break even"), put where no data line runs
     through it: above the line at its left end, then at its right end, then
     under it at either end. It goes on a plate all the same, for the case
     where every place is taken. lines is the data, as lists of [x, y];
     avoid is the boxes of labels already on the chart. */
  function caption(s, str, level, xl, xr, lines, avoid, attrs) {
    var t = text(s, xl + 4, level - 7, str, attrs);
    var tries = [[xl + 4, "start", level - 7], [xr - 4, "end", level - 7],
                 [xl + 4, "start", level + 15], [xr - 4, "end", level + 15]];
    var best = null;
    for (var i = 0; i < tries.length; i++) {
      t.setAttribute("x", tries[i][0]); t.setAttribute("text-anchor", tries[i][1]); t.setAttribute("y", tries[i][2]);
      var b = box(t);
      if (!b) break;
      var bad = (crosses(b, lines) ? 2 : 0) + ((avoid || []).some(function (o) { return overlap(b, o); }) ? 3 : 0);
      if (best === null || bad < best.bad) best = { i: i, bad: bad };
      if (!bad) break;
    }
    if (best) {
      t.setAttribute("x", tries[best.i][0]); t.setAttribute("text-anchor", tries[best.i][1]); t.setAttribute("y", tries[best.i][2]);
    }
    plate(s, t, 1);
    return t;
  }

  /* Labels along the foot of a chart, in order from the left. One that would
     touch the label before it is taken out. The first and the last always
     stay: the last is the newest date, and it wins over its neighbour. */
  function thin(texts, gap) {
    var g = gap === undefined ? 6 : gap, kept = [];
    texts.forEach(function (t, i) {
      var b = box(t);
      if (!b) { kept.push({ t: t, b: null }); return; }
      var prev = kept.length ? kept[kept.length - 1] : null;
      if (prev && prev.b && b.x < prev.b.x + prev.b.width + g) {
        if (i === texts.length - 1 && kept.length > 1) {
          prev.t.parentNode.removeChild(prev.t); kept.pop();
          var before = kept[kept.length - 1];
          if (before.b && b.x < before.b.x + before.b.width + g && kept.length > 1) {
            before.t.parentNode.removeChild(before.t); kept.pop();
          }
        } else if (i !== texts.length - 1 || kept.length > 1) {
          t.parentNode.removeChild(t); return;
        }
      }
      kept.push({ t: t, b: b });
    });
    return kept.map(function (k) { return k.t; });
  }

  /* Labels down the right-hand side, each wanting to sit level with its line.
     Where two want the same place they are moved apart, by as little as it
     takes, and the whole run is kept between lo and hi. Each item has y (the
     centre it wants) and h (its height). */
  function spread(items, lo, hi, gap) {
    var a = items.slice().sort(function (p, q) { return p.y - q.y; });
    var g = gap === undefined ? 3 : gap, i;
    for (i = 1; i < a.length; i++) {
      var need = (a[i - 1].h + a[i].h) / 2 + g;
      if (a[i].y - a[i - 1].y < need) a[i].y = a[i - 1].y + need;
    }
    if (a.length) {
      var over = a[a.length - 1].y + a[a.length - 1].h / 2 - hi;
      if (over > 0) {
        a[a.length - 1].y -= over;
        for (i = a.length - 2; i >= 0; i--) {
          var need2 = (a[i + 1].h + a[i].h) / 2 + g;
          if (a[i + 1].y - a[i].y < need2) a[i].y = a[i + 1].y - need2;
        }
      }
      var under = lo - (a[0].y - a[0].h / 2);
      if (under > 0) {
        a[0].y += under;
        for (i = 1; i < a.length; i++) {
          var need3 = (a[i - 1].h + a[i].h) / 2 + g;
          if (a[i].y - a[i - 1].y < need3) a[i].y = a[i - 1].y + need3;
        }
      }
    }
    return items;
  }

  /* A wash between a line and the level it is measured from, strongest where
     the line is furthest from that level. stops is a list of [offset, opacity]
     down the drawing from y0 to y1. Returns the fill to use. */
  var washes = 0;
  function wash(s, colour, y0, y1, stops) {
    var id = "ttf-wash-" + (++washes);
    var defs = el("defs", {});
    var g = el("linearGradient", { id: id, gradientUnits: "userSpaceOnUse",
      x1: "0", y1: y0.toFixed(1), x2: "0", y2: y1.toFixed(1) });
    stops.forEach(function (st) {
      g.appendChild(el("stop", { offset: String(Math.max(0, Math.min(1, st[0]))),
        "stop-color": colour, "stop-opacity": String(st[1]) }));
    });
    defs.appendChild(g);
    s.appendChild(defs);
    return "url(#" + id + ")";
  }

  /* Draw at the width the chart is shown at, and again when that changes.
     wide is the width the chart was designed at: a host that wide or wider
     gets exactly that drawing, scaled up as before. Narrower, the drawing is
     made at the host's own width. A host that is hidden has no width yet; it
     is drawn when it appears. */
  function unwatch(host) {
    if (host.__ttfWatch) { try { host.__ttfWatch.disconnect(); } catch (e) {} host.__ttfWatch = null; }
    if (host.__ttfResize) { window.removeEventListener("resize", host.__ttfResize); host.__ttfResize = null; }
  }

  /* Empty a chart's host and stop redrawing it. */
  function clear(host) {
    if (!host) return;
    unwatch(host);
    host.innerHTML = "";
  }

  function fit(host, wide, draw) {
    if (!host) return;
    var last = 0;
    function run() {
      var w = Math.round(host.clientWidth || 0);
      if (!w) return;
      var W = Math.min(wide, Math.max(250, w));
      if (W === last) return;
      last = W;
      draw(W, W < 560);
    }
    unwatch(host);
    run();
    if (typeof ResizeObserver !== "undefined") {
      host.__ttfWatch = new ResizeObserver(run);
      host.__ttfWatch.observe(host);
    } else {
      if (!last) { last = wide; draw(wide, false); }   // no way to wait for it: the old drawing
      host.__ttfResize = run;
      window.addEventListener("resize", run);
    }
  }

  window.TTF_CHART = { K: K, FONT: FONT, txt: txt, el: el, svg: svg, text: text, box: box,
                       bounds: bounds, plate: plate, keepIn: keepIn, spread: spread,
                       crosses: crosses, overlap: overlap, caption: caption, thin: thin,
                       wash: wash, fit: fit, clear: clear };
})();
