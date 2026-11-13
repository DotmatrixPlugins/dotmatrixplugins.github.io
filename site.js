// Dotmatrix site: theme switch, reveals, the drawings that draw and colour themselves, the wordmark, the sparks.
(function () {
  var root = document.documentElement;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };

  // ---- light / dark
  var btn = document.querySelector('.theme');
  if (btn) btn.addEventListener('click', function () {
    var t = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = t;
    try { localStorage.setItem('dm-theme', t); } catch (e) {}
  });

  // ---- colouring book: a bright line races round each control (several at once), and the control fills in as
  // its line closes. Last, the line runs round the chassis and the whole panel comes in. About three and a half seconds.
  var colour = function (svg, total, done) {
    var pcs = [].slice.call(svg.querySelectorAll('.pc'));
    var trs = [].slice.call(svg.querySelectorAll('.tr'));
    var n = pcs.length - 1;                          // the last piece is the chassis
    if (still) { pcs.forEach(function (p) { p.setAttribute('opacity', 1); }); trs.forEach(function (t) { t.style.opacity = 0; }); if (done) done(); return; }
    var ctrlTime = total * 0.82, step = ctrlTime / Math.max(1, n), dur = Math.min(260, Math.max(90, step * 3.2));
    var start = function (i) { return i < n ? i * step : ctrlTime; };
    var length = function (i) { return i < n ? dur : total - ctrlTime; };
    var t0 = performance.now(), last = total + 400;
    var tick = function (now) {
      var t = now - t0;
      for (var i = 0; i <= n; i++) {
        var s = start(i), d = length(i), p = clamp((t - s) / d), after = t - s - d;
        trs[i].style.strokeDashoffset = 1 - p;
        trs[i].style.opacity = p <= 0 ? 0 : 1 - clamp(after / 220);
        pcs[i].setAttribute('opacity', clamp(after / 90));
      }
      if (t < last) requestAnimationFrame(tick); else if (done) done();
    };
    requestAnimationFrame(tick);
  };
  document.querySelectorAll('svg.fill').forEach(function (svg) {
    svg.querySelectorAll('.pc').forEach(function (p) { p.setAttribute('opacity', still ? 1 : 0); });
  });
  var runFill = function (svg, delay) {
    setTimeout(function () {
      colour(svg, 3500);
    }, still ? 0 : delay);
  };

  // ---- reveals: fade up (.rv)
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      if (el.matches('svg.sketch')) {
        el.classList.add('drawn');
        if (el.matches('svg.fill')) runFill(el, 1150);
      } else el.classList.add('in');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }) : null;
  document.querySelectorAll('.rv, svg.sketch').forEach(function (el) {
    if (io && !still) io.observe(el);
    else {
      if (el.matches('svg.sketch')) { el.classList.add('drawn'); if (el.matches('svg.fill')) runFill(el, 0); }
      else el.classList.add('in');
    }
  });

  // ---- the dot wordmark: scrambles, then each letter settles, left to right
  if (!still) document.querySelectorAll('svg.word').forEach(function (svg) {
    var gs = [].slice.call(svg.querySelectorAll('g[data-g]'));
    var frame = 0;
    var run = function () {
      gs.forEach(function (g, i) {
        var bits = g.dataset.g, dots = g.children, settled = frame > 6 + i * 2;
        for (var k = 0; k < dots.length; k++)
          dots[k].classList.toggle('on', settled ? bits[k] === '1' : Math.random() < 0.38);
      });
      if (frame++ < 8 + gs.length * 2) setTimeout(run, 55);
    };
    var go = function () { frame = 0; run(); };
    if (io) {
      var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { go(); o.unobserve(svg); } }); });
      o.observe(svg);
    } else go();
  });

  // ---- sparks: lit dots in the brand colours on the sheet's dot grid
  var sp = document.querySelector('.sparks');
  if (sp) {
    var cols = ['#FF6A1A', '#FF2390', '#B026FF', '#2F5BFF', '#00D8FF'];
    var make = function () {
      sp.innerHTML = '';
      var w = sp.clientWidth, h = sp.clientHeight, g = 26, n = Math.round(w * h / 30000);
      for (var i = 0; i < n; i++) {
        var s = document.createElement('i');
        s.style.left = (Math.floor(Math.random() * w / g) * g + g / 2 - 4) + 'px';
        s.style.top = (Math.floor(Math.random() * h / g) * g + g / 2 - 4) + 'px';
        s.style.background = cols[i % cols.length];
        s.style.animationDelay = (-Math.random() * 6).toFixed(2) + 's';
        s.style.animationDuration = (4 + Math.random() * 5).toFixed(2) + 's';
        sp.appendChild(s);
      }
    };
    make();
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(make, 200); });
  }
})();
