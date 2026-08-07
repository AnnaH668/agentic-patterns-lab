/* ============================================================
   app.js — routing, bilingual rendering, progress, quizzes
   ============================================================ */
(function () {
  'use strict';

  var P = window.PATTERNS;
  P.sort(function (a, b) { return a.num - b.num; });

  var byId = {};
  P.forEach(function (p) { byId[p.id] = p; });

  // ---------- UI strings ----------
  var S = {
    sub:        { zh: '智能体设计模式 · 图解版', en: 'Agentic Design Patterns · Illustrated' },
    heroEyebrow:{ zh: '基于 Antonio Gulli《Agentic Design Patterns》', en: 'After Antonio Gulli, "Agentic Design Patterns"' },
    heroTitle:  { zh: ['把 AI Agent 拆开，', '直到你能自己搭一个'], en: ['Take agents apart, ', 'until you can build one'] },
    lede: {
      zh: '从「Agent 到底是什么」开始，走完 21 个设计模式，最后按一条实战路径把它们拼成一个能跑的 Agent。每个模式都有可单步播放的图解、原书术语对照和一手论文出处。',
      en: 'Start from what an agent actually is, work through the 21 design patterns, then follow one hands-on path that assembles them into a working agent. Every pattern has a step-through diagram, the canonical terminology, and links to the primary sources.'
    },
    metaCount:  { zh: '%s 个模式', en: '%s patterns' },
    metaParts:  { zh: '基础 + 实战路径', en: 'foundations + build path' },
    metaTime:   { zh: '每个约 5 分钟', en: '~5 min each' },
    buildTitle: { zh: '从零搭一个 Agent', en: 'Build an agent from scratch' },
    buildLede:  { zh: '一个真的能跑的项目：从一次裸调用加到能查书、有记忆、带护栏、可评测的 Agent，每一步都能 python 跑出来。最后一步教你怎么让 AI 工具帮你搭，以及怎么验收它写的东西。', en: 'A project that actually runs: from one bare call to an agent that searches, remembers, is guarded and measured — every step executes. The last step covers having AI tools build it for you, and how to review what they wrote.' },
    buildGo:    { zh: '开始动手 →', en: 'Start building →' },
    search:     { zh: '搜索模式…（中英文都可以）', en: 'Search patterns…' },
    pathMode:   { zh: '新手路线', en: 'Beginner path' },
    reset:      { zh: '重置进度', en: 'Reset progress' },
    resetAsk:   { zh: '确定要清空学习进度和小测成绩吗？', en: 'Clear all progress and quiz scores?' },
    noResult:   { zh: '没有匹配的模式，换个词试试。', en: 'No matching pattern — try another word.' },
    contents:   { zh: '目录', en: 'Contents' },
    core:       { zh: '核心', en: 'Core' },
    later:      { zh: '可稍后', en: 'Later' },
    seen:       { zh: '已看', en: 'Seen' },
    unseen:     { zh: '未学', en: 'New' },

    lOne:       { zh: '一句话讲清', en: 'In one line' },
    lAnalogy:   { zh: '生活类比', en: 'Everyday analogy' },
    lProblem:   { zh: '痛点与解法', en: 'Problem & solution' },
    lDiagram:   { zh: '交互图解 · 点「运行」看数据怎么流', en: 'Interactive diagram — press Run' },
    lCompare:   { zh: '踩坑对比', en: 'Before / after' },
    lWhen:      { zh: '什么时候用 / 什么时候别用', en: 'When to use / when not to' },
    lDeep:      { zh: '硬核机制 · 落地时真正要懂的', en: 'Under the hood — what actually matters in practice' },
    lCode:      { zh: '极简代码', en: 'Minimal code' },
    lCases:     { zh: '真实用例', en: 'Real-world uses' },
    lQuiz:      { zh: '随堂小测', en: 'Quick check' },
    lRelated:   { zh: '关联模式', en: 'Related patterns' },
    lTerms:     { zh: '原书术语对照 · 查资料和跟人讨论时要用这些词', en: 'Canonical terminology — the words to search and cite' },
    lRefs:      { zh: '延伸阅读 · 一手来源', en: 'Further reading — primary sources' },
    lSteps:     { zh: '动手步骤', en: 'Build it' },
    bsWatch:    { zh: '这一步的坑：', en: 'Watch out: ' },
    bsRel:      { zh: '这一步用到的模式', en: 'Patterns behind this step' },
    bsOut:      { zh: '跑出来长这样', en: 'What you should see' },
    bsOutVaries:{ zh: '格式是脚本固定打印的；具体数值和模型说的话每次运行都不一样，这里是示意。',
                  en: 'The format is printed by the script; the actual values and the model\'s wording differ on every run — these are illustrative.' },
    bsOutReal:  { zh: '这段是在本机实际运行的真实输出。',
                  en: 'This is real output captured from an actual run on this machine.' },
    hoTitle:    { zh: '这个模式在实战路径里怎么用', en: 'Where this pattern shows up in the build path' },

    hBad:       { zh: '不用这个模式', en: 'Without the pattern' },
    hGood:      { zh: '用了这个模式', en: 'With the pattern' },
    hProblem:   { zh: '问题出在哪', en: 'What goes wrong' },
    hSolution:  { zh: '这个模式怎么解', en: 'How the pattern fixes it' },
    hYes:       { zh: '适合用', en: 'Good fit' },
    hNo:        { zh: '别硬上', en: 'Poor fit' },
    codeHead:   { zh: '展开 / 收起 · Python 骨架（带注释）', en: 'Show / hide · annotated Python skeleton' },
    why:        { zh: '为什么', en: 'Why' },
    scored:     { zh: '本节得分', en: 'Score' },
    allRight:   { zh: '全对，这个模式你拿下了。', en: 'All correct — you have got this one.' },
    prev:       { zh: '上一个', en: 'Previous' },
    next:       { zh: '下一个', en: 'Next' },
    home:       { zh: '全部模式', en: 'All patterns' },
    src:        { zh: '对应原书', en: 'In the book' },
    page:       { zh: '页', en: 'pp.' },
    alsoCalled: { zh: '又称', en: 'Also called' },

    dHint:  { zh: '按「▶ 运行」看完整流程，或用 ← → 自己一步一步走。', en: 'Press Run for the whole flow, or step through with ← →.' },
    dPlay:  { zh: '▶ 运行', en: '▶ Run' },
    dPause: { zh: '⏸ 暂停', en: '⏸ Pause' },
    dPrev:  { zh: '← 上一步', en: '← Back' },
    dNext:  { zh: '下一步 →', en: 'Next →' },
    dReset: { zh: '↺ 重来', en: '↺ Reset' },
    dStep:  { zh: '第 %s 步', en: 'Step %s' }
  };

  var PARTS = [
    { n: 0, name: { zh: '基础', en: 'Foundations' },
      desc: { zh: '先搞清楚 Agent 到底是什么、由哪几个零件组成、框架该怎么选', en: 'What an agent actually is, what it is made of, which framework to pick' } },
    { n: 1, name: { zh: '核心执行模式', en: 'Core Execution' },
      desc: { zh: 'Agent 干活的基本骨架：怎么拆步骤、怎么分岔、怎么并行、怎么自查、怎么用工具', en: 'How an agent actually gets work done' } },
    { n: 2, name: { zh: '记忆与外部世界', en: 'Memory & the Outside World' },
      desc: { zh: '让 Agent 记得住、学得会、连得上外部系统', en: 'Remembering, learning, and connecting outward' } },
    { n: 3, name: { zh: '可靠性', en: 'Reliability' },
      desc: { zh: '出错了怎么办，什么时候该叫人，知识不够怎么补', en: 'Failing gracefully and knowing when to ask a human' } },
    { n: 4, name: { zh: '高级协作与安全', en: 'Advanced Collaboration & Safety' },
      desc: { zh: 'Agent 之间怎么沟通，怎么省钱，怎么推理，怎么不闯祸', en: 'Talking to each other, thinking harder, staying safe' } },
    { n: 5, name: { zh: '附录', en: 'Appendix' },
      desc: { zh: '提示技术——喂给模型的每一句话怎么写，直接决定上面所有模式的效果', en: 'Prompting technique — how you phrase things gates every pattern above' } }
  ];

  // ---------- state ----------
  // 语言优先级：?lang= 参数 > 用户自己切过的选择 > 浏览器语言。
  // 最后一条很关键：这个站会被分享到中英文两种圈子，
  // 首次访问就把中文界面丢给英语读者，他们不会去找那个切换按钮，直接就走了。
  var lang = (function () {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'zh') return q;          // 分享链接可强制指定
    var saved = localStorage.getItem('apl.lang');
    if (saved === 'en' || saved === 'zh') return saved;
    return /^zh\b/i.test(navigator.language || '') ? 'zh' : 'en';
  })();
  // null = follow the viewer's OS preference; 'light'/'dark' = pinned by the toggle
  var theme = localStorage.getItem('apl.theme');
  var pathMode = localStorage.getItem('apl.path') === '1';
  var prog = {};
  try { prog = JSON.parse(localStorage.getItem('apl.progress') || '{}'); } catch (e) { prog = {}; }

  function saveProg() { localStorage.setItem('apl.progress', JSON.stringify(prog)); }
  function t(o) { return !o ? '' : (typeof o === 'string' ? o : (o[lang] != null ? o[lang] : (o.zh || o.en || ''))); }

  var view = document.getElementById('view');
  var rail = document.getElementById('rail');
  var tip = document.getElementById('tip');
  var liveDiagrams = [];

  // ---------- text helpers ----------
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var glossKeys = null;
  function glossaryKeys() {
    if (glossKeys) return glossKeys;
    glossKeys = Object.keys(window.GLOSSARY || {}).sort(function (a, b) { return b.length - a.length; });
    return glossKeys;
  }

  // escape -> protect `code` -> **bold** -> glossary -> restore code
  function rich(str, noGloss) {
    // Code spans come out first so Python's `2 ** attempt` is not read as bold
    // and identifiers inside code are never glossary-tagged.
    // \u0001 is the sentinel: it cannot collide with real digits in the copy.
    var spans = [];
    var out = esc(t(str)).replace(/`([^`]+)`/g, function (_, code) {
      spans.push(code);
      return '\u0001' + (spans.length - 1) + '\u0001';
    });

    out = out.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

    if (!noGloss) {
      var used = {};
      glossaryKeys().forEach(function (k) {
        if (used[k]) return;
        // don't match inside an existing tag
        var re = new RegExp('(?![^<]*>)' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
          (/[a-zA-Z]$/.test(k) ? '\\b' : ''));
        if (re.test(out)) {
          out = out.replace(re, '<span class="term" data-t="' + esc(k) + '">' + esc(k) + '</span>');
          used[k] = 1;
        }
      });
    }

    return out.replace(/\u0001(\d+)\u0001/g, function (_, i) {
      return '<code class="ic">' + spans[+i] + '</code>';
    });
  }

  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function section(labelKey, node) {
    var s = h('section', 'sec');
    s.appendChild(h('div', 'lbl', esc(t(S[labelKey]))));
    s.appendChild(node);
    return s;
  }

  // ---------- progress ----------
  function isSeen(id) { return !!(prog[id] && prog[id].viewed); }
  function isDone(id) {
    var r = prog[id];
    var p = byId[id];
    return !!(r && p && p.quiz && r.right === p.quiz.length);
  }
  function doneCount() { return P.filter(function (p) { return isDone(p.id); }).length; }

  function paintProgress() {
    var n = doneCount(), total = P.length;
    var C = 2 * Math.PI * 15.5;
    var arc = document.getElementById('progArc');
    arc.setAttribute('stroke-dasharray', C.toFixed(1));
    arc.setAttribute('stroke-dashoffset', (C * (1 - n / total)).toFixed(1));
    document.getElementById('progTxt').textContent = n + ' / ' + total;
  }

  // ---------- rail ----------
  function buildRail() {
    rail.innerHTML = '';

    var b = document.createElement('a');
    b.href = '#/build';
    b.className = 'railbuild';
    b.dataset.id = '__build';
    b.innerHTML = '<span class="n">🔨</span><span>' + esc(t(S.buildTitle)) + '</span>';
    rail.appendChild(b);

    PARTS.forEach(function (part) {
      var list = P.filter(function (p) { return p.part === part.n; });
      if (!list.length) return;
      rail.appendChild(h('div', 'grp', 'Part ' + part.n + ' · ' + esc(t(part.name))));
      list.forEach(function (p) {
        var a = document.createElement('a');
        a.href = '#/p/' + p.id;
        a.dataset.id = p.id;
        a.innerHTML = '<span class="n">' + (p.kind ? '·' : p.num) + '</span><span>' + esc(t(p.name)) + '</span>' +
          '<span class="dot' + (isDone(p.id) ? ' done' : (isSeen(p.id) ? ' seen' : '')) + '"></span>';
        rail.appendChild(a);
      });
    });
  }

  function markRail(id) {
    [].forEach.call(rail.querySelectorAll('a'), function (a) {
      a.classList.toggle('on', a.dataset.id === id);
      if (a.classList.contains('on')) {
        var top = a.offsetTop - rail.clientHeight / 2;
        if (top > 0) rail.scrollTop = top;
      }
    });
  }

  // ---------- home ----------
  function renderHome() {
    view.innerHTML = '';
    document.title = 'Agentic Patterns Lab · ' + t(S.sub);

    var hero = h('div', 'hero');
    hero.appendChild(h('div', 'eyebrow', esc(t(S.heroEyebrow))));
    var ttl = t(S.heroTitle);
    hero.appendChild(h('h1', null, esc(ttl[0]) + '<span class="accent">' + esc(ttl[1]) + '</span>'));
    hero.appendChild(h('p', 'lede', esc(t(S.lede))));
    var nPatterns = P.filter(function (x) { return !x.kind; }).length;
    hero.appendChild(h('div', 'meta',
      '<span>' + esc(t(S.metaCount).replace('%s', nPatterns)) + '</span>' +
      '<span>' + esc(t(S.metaParts)) + '</span>' +
      '<span>' + esc(t(S.metaTime)) + '</span>'));
    view.appendChild(hero);

    // build-path call to action — the app's actual destination
    var cta = document.createElement('a');
    cta.className = 'buildcta';
    cta.href = '#/build';
    cta.innerHTML = '<span class="bi">🔨</span><div><h3>' + esc(t(S.buildTitle)) + '</h3>' +
      '<p>' + esc(t(S.buildLede)) + '</p></div><span class="go">' + esc(t(S.buildGo)) + '</span>';
    view.appendChild(cta);

    // controls
    var ctl = h('div', 'controls');
    var input = document.createElement('input');
    input.className = 'search'; input.type = 'search';
    input.placeholder = t(S.search); input.id = 'q';
    ctl.appendChild(input);

    var sw = h('label', 'switch' + (pathMode ? ' on' : ''));
    sw.innerHTML = '<span class="track"></span><span>' + esc(t(S.pathMode)) + '</span>';
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = pathMode;
    sw.appendChild(cb);
    cb.onchange = function () {
      pathMode = cb.checked;
      localStorage.setItem('apl.path', pathMode ? '1' : '0');
      sw.classList.toggle('on', pathMode);
      document.body.classList.toggle('pathmode', pathMode);
    };
    ctl.appendChild(sw);

    var rb = h('button', 'tb-btn', esc(t(S.reset)));
    rb.onclick = function () {
      if (!confirm(t(S.resetAsk))) return;
      prog = {}; saveProg(); buildRail(); paintProgress(); renderHome();
    };
    ctl.appendChild(rb);
    view.appendChild(ctl);

    // path ordering numbers
    var order = {};
    P.filter(function (p) { return p.core; })
      .sort(function (a, b) { return a.num - b.num; })
      .forEach(function (p, i) { order[p.id] = i + 1; });

    var d = 0;
    PARTS.forEach(function (part) {
      var list = P.filter(function (p) { return p.part === part.n; });
      if (!list.length) return;
      var sec = h('section', 'partsec');
      sec.dataset.part = part.n;
      var hd = h('div', 'parthd');
      hd.innerHTML = '<span class="pn">Part ' + part.n + '</span><h2>' + esc(t(part.name)) +
        '</h2><span class="pd">' + esc(t(part.desc)) + '</span>';
      sec.appendChild(hd);

      var grid = h('div', 'cards');
      list.forEach(function (p) {
        var a = document.createElement('a');
        a.className = 'card' + (p.core ? ' core' : '');
        a.href = '#/p/' + p.id;
        a.dataset.key = (t(p.name) + ' ' + p.name.en + ' ' + p.name.zh + ' ' + t(p.oneLiner) + ' ' + (p.keywords || '')).toLowerCase();
        a.style.animationDelay = (Math.min(d++, 16) * 32) + 'ms';
        var done = isDone(p.id), seen = isSeen(p.id);
        a.innerHTML =
          '<span class="step">' + (order[p.id] || '') + '</span>' +
          '<div class="top"><span class="icon">' + p.icon + '</span>' +
            '<div><h3>' + esc(t(p.name)) + '</h3><div class="en">' + esc(p.name.en) + '</div></div>' +
            (p.kind ? '' : '<span class="num">' + String(p.num).padStart(2, '0') + '</span>') + '</div>' +
          '<p class="one">' + rich(p.oneLiner, true) + '</p>' +
          '<div class="foot">' +
            (p.core ? '<span class="tag core">' + esc(t(S.core)) + '</span>' : '<span class="tag">' + esc(t(S.later)) + '</span>') +
            '<span class="status' + (done ? ' done' : '') + '">' +
              (done ? '✓ ' + esc(t(S.scored)) + ' ' + prog[p.id].right + '/' + p.quiz.length
                    : (seen ? esc(t(S.seen)) : esc(t(S.unseen)))) +
            '</span></div>';
        grid.appendChild(a);
      });
      sec.appendChild(grid);
      view.appendChild(sec);
    });

    view.appendChild(h('div', 'empty', esc(t(S.noResult)))).style.display = 'none';
    var empty = view.lastChild;

    input.oninput = function () {
      var q = input.value.trim().toLowerCase();
      var any = 0;
      [].forEach.call(view.querySelectorAll('.card'), function (c) {
        var hit = !q || c.dataset.key.indexOf(q) >= 0;
        c.classList.toggle('hidden', !hit);
        if (hit) any++;
      });
      [].forEach.call(view.querySelectorAll('.partsec'), function (s) {
        s.style.display = s.querySelectorAll('.card:not(.hidden)').length ? '' : 'none';
      });
      empty.style.display = any ? 'none' : '';
    };

    document.body.classList.toggle('pathmode', pathMode);
    markRail(null);
  }

  // ---------- build path ----------
  function renderBuild() {
    view.innerHTML = '';
    document.body.classList.remove('pathmode');
    document.title = t(S.buildTitle) + ' · Agentic Patterns Lab';
    var B = window.BUILD_PATH || { steps: [] };

    view.appendChild(h('div', 'crumb', '<a href="#/">← ' + esc(t(S.home)) + '</a>'));

    var hd = h('header', 'phd');
    hd.innerHTML = '<div class="row"><span class="icon">🔨</span><div>' +
      '<div class="no">' + esc(t(S.lSteps)) + '</div>' +
      '<h1>' + esc(t(S.buildTitle)) + '</h1>' +
      '<div class="alias">' + rich(t(B.lede || S.buildLede)) + '</div></div></div>';
    view.appendChild(hd);

    // 环境准备：在所有步骤之前，因为跑不起来就什么都别谈
    if (B.setup) {
      var su = h('section', 'sec buildstep bs-setup');
      su.innerHTML =
        '<div class="bs-head"><span class="bs-n">⚙</span>' +
        '<div><h2>' + esc(t(B.setup.title)) + '</h2>' +
        '<div class="bs-goal">' + rich(B.setup.goal) + '</div></div></div>' +
        '<p class="bs-body">' + rich(B.setup.body) + '</p>' +
        (B.setup.code ? '<pre class="code">' + B.setup.code.map(function (l) {
          return '<span class="ln">' + hi(l) + '</span>'; }).join('') + '</pre>' : '') +
        (B.setup.note ? '<div class="bs-note">' + rich(B.setup.note) + '</div>' : '');
      view.appendChild(su);
    }

    B.steps.forEach(function (s, i) {
      var sec = h('section', 'sec buildstep');
      var chips = (s.patterns || []).filter(function (id) { return byId[id]; })
        .map(function (id) {
          var q = byId[id];
          return '<a class="chip" href="#/p/' + q.id + '"><span>' + q.icon + '</span><span>' +
            esc(t(q.name)) + '</span></a>';
        }).join('');
      sec.innerHTML =
        '<div class="bs-head"><span class="bs-n">' + (s.n !== undefined ? s.n : i + 1) + '</span>' +
        '<div><h2>' + esc(t(s.title)) + '</h2>' +
        '<div class="bs-goal">' + rich(s.goal) + '</div></div></div>' +
        (s.file ? '<div class="bs-file">' + esc(s.file) + '</div>' : '') +
        '<p class="bs-body">' + rich(s.body) + '</p>' +
        (s.run ? '<div class="bs-run"><span class="p">$</span><code>' + esc(s.run) + '</code></div>' : '') +
        (s.code ? '<pre class="code">' + s.code.map(function (l) {
          return '<span class="ln">' + hi(l) + '</span>'; }).join('') + '</pre>' : '') +
        (s.output ? '<div class="bs-out"><b>' + esc(t(S.bsOut)) + '</b><pre>' +
          esc(s.output.join('\n')) + '</pre>' +
          '<em>' + esc(t(s.outputNote || S.bsOutVaries)) + '</em></div>' : '') +
        (s.watch ? '<div class="bs-watch"><b>' + esc(t(S.bsWatch)) + '</b>' + rich(s.watch) + '</div>' : '') +
        (chips ? '<div class="bs-rel"><span>' + esc(t(S.bsRel)) + '</span><div class="chips">' + chips + '</div></div>' : '');
      view.appendChild(sec);
    });

    markRail('__build');
    window.scrollTo(0, 0);
  }

  // ---------- pattern page ----------
  function renderPattern(p) {
    view.innerHTML = '';
    document.body.classList.remove('pathmode');
    document.title = t(p.name) + ' · Agentic Patterns Lab';

    prog[p.id] = prog[p.id] || {};
    prog[p.id].viewed = true;
    saveProg();

    var partName = (PARTS.filter(function (x) { return x.n === p.part; })[0] || {}).name;
    var crumb = h('div', 'crumb', '<a href="#/">← ' + esc(t(S.home)) + '</a>　/　' +
      esc(partName ? t(partName) : 'Part ' + p.part));
    view.appendChild(crumb);

    var eyebrow = p.kind
      ? esc(t(p.label || { zh: '基础', en: 'Foundations' }))
      : 'Pattern ' + String(p.num).padStart(2, '0') + (p.core ? ' · ' + esc(t(S.core)) : '');

    var hd = h('header', 'phd');
    hd.innerHTML = '<div class="row"><span class="icon">' + p.icon + '</span><div>' +
      '<div class="no">' + eyebrow + '</div>' +
      '<h1>' + esc(t(p.name)) + '</h1>' +
      '<div class="alias">' + esc(p.name.en) + (p.alias ? '　·　' + esc(t(S.alsoCalled)) + ' ' + esc(t(p.alias)) : '') + '</div>' +
      '</div></div>';
    view.appendChild(hd);

    // 1. one-liner
    view.appendChild(section('lOne', h('p', 'oneliner', rich(p.oneLiner))));

    // 2. analogy
    if (p.analogy) {
      var an = h('div', 'analogy');
      an.innerHTML = '<span class="big">' + p.analogy.icon + '</span><div><h3>' +
        esc(t(p.analogy.title)) + '</h3><p>' + rich(p.analogy.body) + '</p></div>';
      view.appendChild(section('lAnalogy', an));
    }

    // 3. problem / solution
    if (p.problem && p.solution) {
      var duo = h('div', 'duo');
      duo.innerHTML =
        '<div class="panel bad"><div class="ph">▲ ' + esc(t(S.hProblem)) + '</div><p>' + rich(p.problem) + '</p></div>' +
        '<div class="panel good"><div class="ph">● ' + esc(t(S.hSolution)) + '</div><p>' + rich(p.solution) + '</p></div>';
      view.appendChild(section('lProblem', duo));
    }

    // 4. diagram
    if (p.diagram) {
      var host = document.createElement('div');
      view.appendChild(section('lDiagram', host));
      var inst = window.Diagram.create(host, p.diagram, lang, {
        hint: S.dHint, play: S.dPlay, pause: S.dPause,
        prev: S.dPrev, next: S.dNext, reset: S.dReset,
        step: S.dStep
      });
      liveDiagrams.push(inst);
    }

    // 5. before / after
    if (p.without && p.with) {
      var cmp = h('div', 'duo');
      cmp.innerHTML =
        '<div class="panel bad"><div class="ph">✕ ' + esc(t(S.hBad)) + '</div><p>' + rich(p.without) + '</p></div>' +
        '<div class="panel good"><div class="ph">✓ ' + esc(t(S.hGood)) + '</div><p>' + rich(p.with) + '</p></div>';
      view.appendChild(section('lCompare', cmp));
    }

    // 6. when to use / not
    if (p.whenToUse && p.whenNotToUse) {
      var ul = h('div', 'uselists');
      var mk = function (cls, head, items) {
        return '<div class="panel uselist ' + cls + '"><div class="ph">' + head + '</div><ul>' +
          items.map(function (i) { return '<li>' + rich(i) + '</li>'; }).join('') + '</ul></div>';
      };
      ul.innerHTML =
        mk('yes good', '✓ ' + esc(t(S.hYes)), p.whenToUse) +
        mk('no bad', '✕ ' + esc(t(S.hNo)), p.whenNotToUse);
      view.appendChild(section('lWhen', ul));
    }

    // 6.5 hard knowledge
    if (p.deepDive && p.deepDive.length) {
      var facts = h('div', 'facts');
      facts.innerHTML = p.deepDive.map(function (f) {
        return '<div class="fact"><h4>' + rich(f.t, true) + '</h4><p>' + rich(f.d) + '</p></div>';
      }).join('');
      view.appendChild(section('lDeep', facts));
    }

    // 7. code
    if (p.code) {
      var det = document.createElement('details');
      det.className = 'codewrap';
      var sum = document.createElement('summary');
      sum.textContent = t(S.codeHead);
      det.appendChild(sum);
      var pre = h('pre', 'code');
      pre.innerHTML = p.code.map(function (l) {
        return '<span class="ln">' + hi(l) + '</span>';
      }).join('');
      det.appendChild(pre);
      view.appendChild(section('lCode', det));
    }

    // 8. use cases
    if (p.useCases && p.useCases.length) {
      var ol = h('ul', 'bul');
      ol.innerHTML = p.useCases.map(function (c) { return '<li>' + rich(c) + '</li>'; }).join('');
      view.appendChild(section('lCases', ol));
    }

    // 8.5 canonical terminology — the bridge to the book and to other people
    if (p.terms && p.terms.length) {
      var tw = h('div', 'terms');
      tw.innerHTML = p.terms.map(function (x) {
        return '<div class="tm"><div class="tm-en">' + esc(x.en) + '</div>' +
          '<div class="tm-zh">' + esc(t(x.zh)) + '</div>' +
          '<p>' + rich(x.d, true) + '</p></div>';
      }).join('');
      view.appendChild(section('lTerms', tw));
    }

    // 8.6 primary sources from the book's own reference list
    if (p.refs && p.refs.length) {
      var rl = h('ul', 'refs');
      rl.innerHTML = p.refs.map(function (r) {
        var tag = r.kind ? '<span class="rk ' + r.kind + '">' + esc(r.kind) + '</span>' : '';
        var name = esc(r.title);
        return '<li>' + tag + (r.url
          ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + name + '</a>'
          : '<span>' + name + '</span>') +
          (r.note ? '<em>' + esc(t(r.note)) + '</em>' : '') + '</li>';
      }).join('');
      view.appendChild(section('lRefs', rl));
    }

    // 9. quiz
    if (p.quiz && p.quiz.length) view.appendChild(section('lQuiz', quizBlock(p)));

    // 10. related
    if (p.related && p.related.length) {
      var chips = h('div', 'chips');
      chips.innerHTML = p.related.filter(function (r) { return byId[r]; }).map(function (r) {
        var q = byId[r];
        return '<a class="chip" href="#/p/' + q.id + '"><span>' + q.icon + '</span>' +
          '<span>' + esc(t(q.name)) + '</span>' +
          (q.kind ? '' : '<span class="n">' + String(q.num).padStart(2, '0') + '</span>') + '</a>';
      }).join('');
      view.appendChild(section('lRelated', chips));
    }

    // 11. 动手做：反向链接到实战路径里用到这个模式的那一步
    var uses = ((window.BUILD_PATH || {}).steps || []).filter(function (s) {
      return (s.patterns || []).indexOf(p.id) !== -1;
    });
    if (uses.length) {
      var hands = h('div', 'handson');
      hands.innerHTML =
        '<div class="ho-h"><span>🔨</span><b>' + esc(t(S.hoTitle)) + '</b></div>' +
        uses.map(function (s) {
          return '<a class="ho-row" href="#/build">' +
            '<span class="ho-n">' + s.n + '</span>' +
            '<span class="ho-t">' + esc(t(s.title)) + '</span>' +
            (s.file ? '<code>' + esc(s.file) + '</code>' : '') + '</a>';
        }).join('');
      view.appendChild(hands);
    }

    // prev / next
    var i = P.indexOf(p), nav = h('div', 'pagenav');
    if (P[i - 1]) nav.appendChild(navLink(P[i - 1], 'prev'));
    if (P[i + 1]) nav.appendChild(navLink(P[i + 1], 'next'));
    view.appendChild(nav);

    if (p.pages) {
      view.appendChild(h('div', 'srcnote',
        esc(t(S.src)) + ' · ' + (p.chapter || ('Chapter ' + p.num)) +
        ' · ' + esc(t(S.page)) + ' ' + p.pages));
    }

    markRail(p.id);
    window.scrollTo(0, 0);
  }

  function navLink(p, dir) {
    var a = document.createElement('a');
    a.className = dir; a.href = '#/p/' + p.id;
    a.innerHTML = '<div class="d">' + (dir === 'prev' ? '← ' + esc(t(S.prev)) : esc(t(S.next)) + ' →') +
      '</div><div class="t">' + p.icon + ' ' + esc(t(p.name)) + '</div>';
    return a;
  }

  // ---------- quiz ----------
  function quizBlock(p) {
    var box = document.createElement('div');
    var right = 0, answered = 0;
    var score = h('div', 'quizscore', '');

    p.quiz.forEach(function (q, qi) {
      var card = h('div', 'quiz');
      card.appendChild(h('div', 'q', '<span class="qn">Q' + (qi + 1) + '</span>' + rich(q.q, true)));
      var btns = [];
      q.options.forEach(function (o, oi) {
        var b = h('button', 'opt', '<span class="mk">' + 'ABCD'[oi] + '</span>' + rich(o, true));
        b.onclick = function () {
          btns.forEach(function (x) { x.disabled = true; });
          var ok = oi === q.answer;
          b.classList.add(ok ? 'right' : 'wrong');
          if (!ok) btns[q.answer].classList.add('right');
          answered++; if (ok) right++;
          var w = h('div', 'why', '<span class="k">' + esc(t(S.why)) + '</span>' + rich(q.why, true));
          card.appendChild(w);
          if (answered === p.quiz.length) {
            prog[p.id] = prog[p.id] || {};
            prog[p.id].right = right;
            prog[p.id].total = p.quiz.length;
            saveProg(); buildRail(); paintProgress();
            score.innerHTML = esc(t(S.scored)) + ' <b>' + right + ' / ' + p.quiz.length + '</b>' +
              (right === p.quiz.length ? '　' + esc(t(S.allRight)) : '');
          }
        };
        btns.push(b);
        card.appendChild(b);
      });
      box.appendChild(card);
    });
    box.appendChild(score);
    return box;
  }

  // ---------- tiny python highlighter ----------
  function hi(line) {
    var s = esc(line);
    var cm = s.indexOf('#');
    var code = cm >= 0 ? s.slice(0, cm) : s;
    var note = cm >= 0 ? s.slice(cm) : '';
    code = code
      .replace(/(&quot;[^&]*?&quot;|'[^']*?')/g, '<span class="st">$1</span>')
      .replace(/\b(def|return|for|in|if|else|elif|while|import|from|class|await|async|with|as|not|and|or|try|except|yield|lambda|True|False|None)\b/g, '<span class="kw">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="nu">$1</span>')
      .replace(/([A-Za-z_][A-Za-z0-9_]*)\(/g, '<span class="fn">$1</span>(');
    return code + (note ? '<span class="cm">' + note + '</span>' : '');
  }

  // ---------- glossary tooltip ----------
  function showTip(el) {
    var k = el.dataset.t, g = window.GLOSSARY[k];
    if (!g) return;
    tip.innerHTML = '<span class="tn">' + esc(k) + '</span>' + esc(t(g));
    tip.classList.add('show');
    var r = el.getBoundingClientRect();
    tip.style.left = Math.max(10, Math.min(window.innerWidth - 300, r.left)) + 'px';
    var top = r.bottom + 8;
    if (top + tip.offsetHeight > window.innerHeight - 10) top = r.top - tip.offsetHeight - 8;
    tip.style.top = top + 'px';
  }
  function hideTip() { tip.classList.remove('show'); }

  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest && e.target.closest('.term');
    if (el) showTip(el);
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest && e.target.closest('.term')) hideTip();
  });
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('.term');
    if (el) { showTip(el); e.preventDefault(); } else hideTip();
  });
  window.addEventListener('scroll', hideTip, { passive: true });

  // ---------- routing ----------
  function route() {
    liveDiagrams.forEach(function (d) { d.destroy(); });
    liveDiagrams = [];
    var m = /^#\/p\/(.+)$/.exec(location.hash);
    if (location.hash === '#/build') renderBuild();
    else if (m && byId[m[1]]) renderPattern(byId[m[1]]);
    else renderHome();
    rail.classList.remove('open');
    document.getElementById('scrim').classList.remove('on');
  }

  // ---------- chrome ----------
  function applyLang() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.getElementById('brandSub').textContent = t(S.sub);
    document.getElementById('btnZh').setAttribute('aria-pressed', lang === 'zh');
    document.getElementById('btnEn').setAttribute('aria-pressed', lang === 'en');
    buildRail(); route();
  }
  function setLang(l) {
    if (l === lang) return;
    lang = l; localStorage.setItem('apl.lang', l); applyLang();
  }
  document.getElementById('btnZh').onclick = function () { setLang('zh'); };
  document.getElementById('btnEn').onclick = function () { setLang('en'); };

  function systemPrefersDark() {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function applyTheme() {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('apl.theme', theme);
    } else {
      // no pin: let the CSS media query follow the OS
      document.documentElement.removeAttribute('data-theme');
    }
  }
  document.getElementById('btnTheme').onclick = function () {
    var current = theme || (systemPrefersDark() ? 'dark' : 'light');
    theme = current === 'light' ? 'dark' : 'light';
    applyTheme();
  };

  var rt = document.getElementById('railToggle'), scrim = document.getElementById('scrim');
  rt.onclick = function () {
    var open = rail.classList.toggle('open');
    scrim.classList.toggle('on', open);
  };
  scrim.onclick = function () { rail.classList.remove('open'); scrim.classList.remove('on'); };

  window.addEventListener('hashchange', route);

  applyTheme();
  buildRail();
  paintProgress();
  applyLang();
})();
