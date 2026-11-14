// Dotmatrix site, clean edition: theme switch, the header that firms up on scroll, quiet reveals, the headline
// lines rising into place, and (from the main site) the sketches that draw and colour themselves and the wordmark.
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

  // ---- header: frosted once the page has moved
  var top = document.querySelector('.top');
  var onScroll = function () { if (top) top.classList.toggle('scrolled', scrollY > 24); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---- the hero headline rises in as soon as the page is up
  var hero = document.querySelector('.hero .display');
  if (hero) requestAnimationFrame(function () { setTimeout(function () { hero.classList.add('in'); }, still ? 0 : 120); });

  // ---- colouring book (as on the main site): a bright line races round each control, which fills in as it closes
  var colour = function (svg, total) {
    var pcs = [].slice.call(svg.querySelectorAll('.pc'));
    var trs = [].slice.call(svg.querySelectorAll('.tr'));
    var n = pcs.length - 1;
    if (still) { pcs.forEach(function (p) { p.setAttribute('opacity', 1); }); trs.forEach(function (t) { t.style.opacity = 0; }); return; }
    var ctrlTime = total * 0.82, step = ctrlTime / Math.max(1, n), dur = Math.min(260, Math.max(90, step * 3.2));
    var start = function (i) { return i < n ? i * step : ctrlTime; };
    var length = function (i) { return i < n ? dur : total - ctrlTime; };
    var t0 = performance.now(), last = total + 400;
    var tick = function (now) {
      var t = now - t0;
      for (var i = 0; i <= n; i++) {
        var s = start(i), d = length(i), p = clamp((t - s) / d), after = t - s - d;
        if (trs[i]) { trs[i].style.strokeDashoffset = 1 - p; trs[i].style.opacity = p <= 0 ? 0 : 1 - clamp(after / 220); }
        pcs[i].setAttribute('opacity', clamp(after / 90));
      }
      if (t < last) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  document.querySelectorAll('svg.fill').forEach(function (svg) {
    svg.querySelectorAll('.pc').forEach(function (p) { p.setAttribute('opacity', still ? 1 : 0); });
  });

  // ---- reveals
  var show = function (el) {
    if (el.matches('svg.sketch')) {
      el.classList.add('drawn');
      if (el.matches('svg.fill')) setTimeout(function () { colour(el, 3500); }, still ? 0 : 1150);
    } else el.classList.add('in');
  };
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }) : null;
  document.querySelectorAll('.rv, svg.sketch').forEach(function (el) { if (io && !still) io.observe(el); else show(el); });

  // ---- the dot wordmark: scrambles, then each letter settles, left to right
  if (!still) document.querySelectorAll('svg.word').forEach(function (svg) {
    var gs = [].slice.call(svg.querySelectorAll('g[data-g]')), frame = 0;
    var run = function () {
      gs.forEach(function (g, i) {
        var bits = g.dataset.g, dots = g.children, settled = frame > 6 + i * 2;
        for (var k = 0; k < dots.length; k++) dots[k].classList.toggle('on', settled ? bits[k] === '1' : Math.random() < 0.38);
      });
      if (frame++ < 8 + gs.length * 2) setTimeout(run, 55);
    };
    if (io) {
      var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { frame = 0; run(); o.unobserve(svg); } }); });
      o.observe(svg);
    } else run();
  });
  if (still) document.querySelectorAll('svg.word g[data-g]').forEach(function (g) {
    var bits = g.dataset.g; [].forEach.call(g.children, function (d, k) { d.classList.toggle('on', bits[k] === '1'); });
  });
})();
