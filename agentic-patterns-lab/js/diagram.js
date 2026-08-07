/* ============================================================
   diagram.js — declarative schematic engine
   ------------------------------------------------------------
   Every pattern supplies data, not animation code:

     diagram: {
       w: 720, h: 260,
       nodes: [ {id, kind, label:{zh,en}, sub?, x, y, w?, h?} ],
       edges: [ {from, to, label?:{zh,en}, bend?, via?:[{x,y}], dash?} ],
       steps: [ {edge:'a->b'|node:'id', say:{zh,en}} ]
     }

   The engine draws it, then plays the steps: a data token travels
   the edge, the active node lights up, and everything not yet
   reached stays dimmed so the flow builds up progressively.
   ============================================================ */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  // node kind -> accent colour variable + glyph
  // Olive is the primary and marks the agent/model itself; pink is the contrast
  // accent and marks anything that acts on or branches the flow.
  var KINDS = {
    actor:    { c: 'var(--ink-2)',  g: '🧑' },
    prompt:   { c: 'var(--amber)',  g: '📝' },
    agent:    { c: 'var(--sienna)', g: '🤖' },
    llm:      { c: 'var(--sienna)', g: '🧠' },
    tool:     { c: 'var(--pink)',   g: '🔧' },
    memory:   { c: 'var(--plum)',   g: '📚' },
    store:    { c: 'var(--slate)',  g: '🗄️' },
    gate:     { c: 'var(--pink)',   g: '🚦' },
    decision: { c: 'var(--pink)',   g: '🔀' },
    output:   { c: 'var(--teal)',   g: '📤' },
    check:    { c: 'var(--plum)',   g: '🔍' },
    plan:     { c: 'var(--amber)',  g: '🗺️' },
    human:    { c: 'var(--slate)',  g: '🙋' },
    world:    { c: 'var(--moss)',   g: '🌐' }
  };

  var NW = 112, NH = 56;   // default node box
  var el = function (n, a) {
    var e = document.createElementNS(NS, n);
    for (var k in a) if (a[k] != null) e.setAttribute(k, a[k]);
    return e;
  };

  // wrap a label into at most 2 lines (CJK counts double-width)
  function wrap(text, max) {
    var width = function (s) {
      var w = 0;
      for (var i = 0; i < s.length; i++) w += s.charCodeAt(i) > 255 ? 2 : 1;
      return w;
    };
    if (width(text) <= max) return [text];
    // prefer breaking on a space, else break by measured width
    var words = text.split(' ');
    if (words.length > 1) {
      var a = '', b = '';
      for (var i = 0; i < words.length; i++) {
        if (width(a + words[i]) <= max && !b) a += (a ? ' ' : '') + words[i];
        else b += (b ? ' ' : '') + words[i];
      }
      if (a && b) return [a, b];
    }
    var cut = 0, acc = 0;
    for (var j = 0; j < text.length; j++) {
      acc += text.charCodeAt(j) > 255 ? 2 : 1;
      if (acc > max) { cut = j; break; }
    }
    return cut ? [text.slice(0, cut), text.slice(cut)] : [text];
  }

  // where does the segment from node centre toward p leave the node box?
  function edgeOfBox(n, p) {
    var dx = p.x - n.x, dy = p.y - n.y;
    if (!dx && !dy) return { x: n.x, y: n.y };
    var hw = (n.w || NW) / 2 + 5, hh = (n.h || NH) / 2 + 5;
    var sx = dx ? hw / Math.abs(dx) : Infinity;
    var sy = dy ? hh / Math.abs(dy) : Infinity;
    var s = Math.min(sx, sy);
    return { x: n.x + dx * s, y: n.y + dy * s };
  }

  function pathFor(a, b, e) {
    var via = e.via || [];
    if (via.length) {
      var start = edgeOfBox(a, via[0]);
      var end = edgeOfBox(b, via[via.length - 1]);
      var d = 'M' + start.x + ',' + start.y;
      via.forEach(function (p) { d += ' L' + p.x + ',' + p.y; });
      return d + ' L' + end.x + ',' + end.y;
    }
    var s = edgeOfBox(a, b), t = edgeOfBox(b, a);
    if (e.bend) {
      var mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2;
      var vx = t.x - s.x, vy = t.y - s.y;
      var len = Math.hypot(vx, vy) || 1;
      // perpendicular offset
      var cx = mx + (-vy / len) * e.bend, cy = my + (vx / len) * e.bend;
      return 'M' + s.x + ',' + s.y + ' Q' + cx + ',' + cy + ' ' + t.x + ',' + t.y;
    }
    return 'M' + s.x + ',' + s.y + ' L' + t.x + ',' + t.y;
  }

  /**
   * Build a diagram instance inside `host`.
   * Returns { setLang(l), destroy() }.
   */
  function create(host, spec, lang, strings) {
    var byId = {};
    spec.nodes.forEach(function (n) { byId[n.id] = n; });

    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var uid = 'd' + Math.random().toString(36).slice(2, 8);
    var t = function (o) { return !o ? '' : (typeof o === 'string' ? o : (o[lang] || o.zh || o.en || '')); };

    // ---- shell ----
    host.className = 'diagram';
    var stage = document.createElement('div');
    stage.className = 'stage';
    var svg = el('svg', {
      viewBox: '0 0 ' + spec.w + ' ' + spec.h,
      role: 'img'
    });
    stage.appendChild(svg);

    var defs = el('defs');
    ['arrow', 'arrowHot'].forEach(function (id, i) {
      var m = el('marker', {
        id: uid + id, viewBox: '0 0 10 10', refX: '9', refY: '5',
        markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse'
      });
      m.appendChild(el('path', {
        d: 'M0,1 L9,5 L0,9 z',
        fill: i ? 'var(--sienna)' : 'var(--ink-3)'
      }));
      defs.appendChild(m);
    });
    svg.appendChild(defs);

    var gEdges = el('g'), gNodes = el('g'), gToken = el('g');
    svg.appendChild(gEdges); svg.appendChild(gNodes); svg.appendChild(gToken);

    // ---- edges ----
    var edgeEls = {};
    spec.edges.forEach(function (e) {
      var a = byId[e.from], b = byId[e.to];
      if (!a || !b) return;
      var p = el('path', {
        d: pathFor(a, b, e),
        class: 'e-path',
        'marker-end': 'url(#' + uid + 'arrow)',
        'stroke-dasharray': e.dash ? '5 4' : null
      });
      gEdges.appendChild(p);
      var lbl = null;
      if (e.label) {
        var mid = p.getPointAtLength ? null : null;
        lbl = el('text', { class: 'e-lbl' });
        gEdges.appendChild(lbl);
      }
      edgeEls[e.from + '->' + e.to] = { path: p, lbl: lbl, def: e };
    });

    // ---- nodes ----
    var nodeEls = {};
    spec.nodes.forEach(function (n) {
      var k = KINDS[n.kind] || KINDS.agent;
      var w = n.w || NW, h = n.h || NH;
      var g = el('g', { class: 'n-box' });
      var shape = el('rect', {
        x: n.x - w / 2, y: n.y - h / 2, width: w, height: h, rx: 14,
        class: 'n-shape', fill: 'var(--surface)', stroke: k.c, 'stroke-width': 1.6
      });
      g.appendChild(shape);
      var glyph = el('text', { class: 'n-emoji', x: n.x, y: n.y - h / 2 + 16 });
      glyph.textContent = n.glyph || k.g;
      g.appendChild(glyph);
      var txt = el('text', { class: 'n-label', x: n.x, y: n.y + 6 });
      g.appendChild(txt);
      var sub = null;
      if (n.sub) {
        sub = el('text', { class: 'n-sub', x: n.x, y: n.y + h / 2 - 6 });
        g.appendChild(sub);
      }
      gNodes.appendChild(g);
      nodeEls[n.id] = { g: g, shape: shape, txt: txt, sub: sub, def: n, kind: k };
    });

    // pool of travelling data tokens (a step may fire several edges at once)
    var tokens = [];
    function tokenAt(i) {
      while (tokens.length <= i) {
        var c = el('circle', { r: 5, class: 'token', opacity: 0 });
        gToken.appendChild(c);
        tokens.push(c);
      }
      return tokens[i];
    }
    function hideTokens() { tokens.forEach(function (c) { c.setAttribute('opacity', 0); }); }

    // ---- controls ----
    var bar = document.createElement('div');
    bar.className = 'bar';
    var bPlay = document.createElement('button'); bPlay.className = 'dbtn play';
    var bPrev = document.createElement('button'); bPrev.className = 'dbtn';
    var bNext = document.createElement('button'); bNext.className = 'dbtn';
    var bReset = document.createElement('button'); bReset.className = 'dbtn';
    var count = document.createElement('span'); count.className = 'dcount';
    bar.appendChild(bPlay); bar.appendChild(bPrev); bar.appendChild(bNext);
    bar.appendChild(bReset); bar.appendChild(count);

    var say = document.createElement('div');
    say.className = 'dsay idle';

    host.appendChild(stage); host.appendChild(say); host.appendChild(bar);

    // ---- state ----
    var cur = -1, playing = false, timer = null, raf = null;

    function labels() {
      spec.nodes.forEach(function (n) {
        var ne = nodeEls[n.id], h = n.h || NH;
        var lines = wrap(t(n.label), (n.w || NW) > 130 ? 22 : 15);
        ne.txt.textContent = '';
        if (lines.length === 1) {
          ne.txt.setAttribute('y', n.y + (n.sub ? 3 : 7));
          ne.txt.textContent = lines[0];
        } else {
          ne.txt.setAttribute('y', n.y + (n.sub ? -2 : 2));
          lines.forEach(function (ln, i) {
            var ts = el('tspan', { x: n.x, dy: i ? 13 : 0 });
            ts.textContent = ln;
            ne.txt.appendChild(ts);
          });
        }
        if (ne.sub) ne.sub.textContent = t(n.sub);
      });
      Object.keys(edgeEls).forEach(function (key) {
        var ee = edgeEls[key];
        if (!ee.lbl) return;
        var len = ee.path.getTotalLength ? ee.path.getTotalLength() : 0;
        var p = len ? ee.path.getPointAtLength(len / 2) : { x: 0, y: 0 };
        ee.lbl.setAttribute('x', p.x);
        ee.lbl.setAttribute('y', p.y - 6);
        ee.lbl.textContent = t(ee.def.label);
      });
      render();
    }

    // a step may fire one edge (`edge`) or several at once (`edges`)
    function edgesOf(s) {
      if (!s) return [];
      return s.edges ? s.edges : (s.edge ? [s.edge] : []);
    }

    // which nodes/edges have been reached by step index i
    function reached(i) {
      var ns = {}, es = {};
      for (var k = 0; k <= i; k++) {
        var s = spec.steps[k];
        if (!s) continue;
        edgesOf(s).forEach(function (key) {
          es[key] = true;
          var parts = key.split('->');
          ns[parts[0]] = true; ns[parts[1]] = true;
        });
        if (s.node) ns[s.node] = true;
        (s.show || []).forEach(function (id) { ns[id] = true; });
      }
      return { n: ns, e: es };
    }

    function render() {
      var idle = cur < 0;
      var r = reached(cur);
      var active = spec.steps[cur] || null;
      var hotEdges = edgesOf(active);
      var hotNodes = {};
      hotEdges.forEach(function (k) { hotNodes[k.split('->')[1]] = true; });
      if (active && active.node) hotNodes[active.node] = true;

      spec.nodes.forEach(function (n) {
        var ne = nodeEls[n.id];
        var on = idle || r.n[n.id];
        ne.g.classList.toggle('dim', !on);
        var isHot = !!hotNodes[n.id];
        ne.g.classList.toggle('hot', isHot);
        ne.shape.setAttribute('fill', isHot
          ? 'color-mix(in srgb, ' + ne.kind.c + ' 14%, var(--surface))'
          : 'var(--surface)');
      });

      Object.keys(edgeEls).forEach(function (key) {
        var ee = edgeEls[key];
        var on = idle || r.e[key];
        ee.path.style.opacity = on ? 1 : .25;
        var hot = hotEdges.indexOf(key) >= 0;
        ee.path.classList.toggle('hot', hot);
        ee.path.setAttribute('marker-end', 'url(#' + uid + (hot ? 'arrowHot' : 'arrow') + ')');
        if (ee.lbl) ee.lbl.style.opacity = on ? 1 : .25;
      });

      if (idle) {
        say.className = 'dsay idle';
        say.textContent = strings.hint[lang];
      } else {
        say.className = 'dsay';
        say.innerHTML = '';
        var k = document.createElement('span');
        k.className = 'k';
        k.textContent = (strings.step[lang] || 'Step %s').replace('%s', cur + 1);
        say.appendChild(k);
        say.appendChild(document.createTextNode(t(active.say)));
      }

      count.textContent = (cur < 0 ? 0 : cur + 1) + ' / ' + spec.steps.length;
      bPrev.disabled = cur < 0;
      bNext.disabled = cur >= spec.steps.length - 1;
      bPlay.textContent = playing ? strings.pause[lang] : strings.play[lang];
      bPrev.textContent = strings.prev[lang];
      bNext.textContent = strings.next[lang];
      bReset.textContent = strings.reset[lang];
    }

    // animate one token per edge; `done` fires when the slowest finishes
    function flyTokens(keys, done) {
      var live = keys.filter(function (k) {
        return edgeEls[k] && edgeEls[k].path.getTotalLength;
      });
      if (!live.length || reduce) { hideTokens(); return done && done(); }

      var runs = live.map(function (key, i) {
        var path = edgeEls[key].path;
        var len = path.getTotalLength();
        return { path: path, len: len, dot: tokenAt(i), dur: Math.max(420, Math.min(1100, len * 3.2)) };
      });
      var maxDur = Math.max.apply(null, runs.map(function (r) { return r.dur; }));
      var t0 = performance.now();
      hideTokens();
      runs.forEach(function (r) { r.dot.setAttribute('opacity', 1); });
      cancelAnimationFrame(raf);

      (function tick(now) {
        var elapsed = now - t0;
        runs.forEach(function (r) {
          var k = Math.min(1, elapsed / r.dur);
          var ease = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          var p = r.path.getPointAtLength(r.len * ease);
          r.dot.setAttribute('cx', p.x); r.dot.setAttribute('cy', p.y);
          if (k >= 1) r.dot.setAttribute('opacity', 0);
        });
        if (elapsed < maxDur) raf = requestAnimationFrame(tick);
        else { hideTokens(); done && done(); }
      })(t0);
    }

    function goto(i, andThen) {
      cur = Math.max(-1, Math.min(spec.steps.length - 1, i));
      render();
      var keys = edgesOf(spec.steps[cur]);
      if (keys.length) flyTokens(keys, andThen);
      else { hideTokens(); andThen && andThen(); }
    }

    function stop() {
      playing = false;
      clearTimeout(timer); cancelAnimationFrame(raf);
      hideTokens();
      render();
    }

    function play() {
      if (playing) return stop();
      playing = true;
      if (cur >= spec.steps.length - 1) cur = -1;
      render();
      (function advance() {
        if (!playing) return;
        if (cur >= spec.steps.length - 1) { playing = false; render(); return; }
        goto(cur + 1, function () {
          if (!playing) return;
          timer = setTimeout(advance, reduce ? 1400 : 620);
        });
      })();
    }

    bPlay.onclick = play;
    bPrev.onclick = function () { stop(); goto(cur - 1); };
    bNext.onclick = function () { stop(); goto(cur + 1); };
    bReset.onclick = function () { stop(); cur = -1; render(); };

    labels();

    return {
      setLang: function (l) { lang = l; labels(); },
      destroy: stop
    };
  }

  window.Diagram = { create: create, KINDS: KINDS };
})();
