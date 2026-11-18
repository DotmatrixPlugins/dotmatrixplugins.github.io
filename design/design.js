// Reuben Armstrong Graphic Design: theme switch (shared with Dotmatrix), frosted header, headline rise, quiet reveals,
// and a simple lightbox for the print work.
(function () {
  var root = document.documentElement;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var btn = document.querySelector('.theme');
  if (btn) btn.addEventListener('click', function () {
    var t = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = t;
    try { localStorage.setItem('dm-theme', t); } catch (e) {}
  });

  var top = document.querySelector('.top');
  var onScroll = function () { if (top) top.classList.toggle('scrolled', scrollY > 24); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var hero = document.querySelector('.hero .display');
  if (hero) requestAnimationFrame(function () { setTimeout(function () { hero.classList.add('in'); }, still ? 0 : 120); });

  var io = 'IntersectionObserver' in window && !still ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;
  // the current project's drawing: lines draw in, then a bright line races round each control as it colours in
  // (the same as the Dotmatrix home page)
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var colour = function (svg, total) {
    var pcs = [].slice.call(svg.querySelectorAll('.pc')), trs = [].slice.call(svg.querySelectorAll('.tr')), n = pcs.length - 1;
    if (still) { pcs.forEach(function (p) { p.setAttribute('opacity', 1); }); trs.forEach(function (t) { t.style.opacity = 0; }); return; }
    var ctrlTime = total * 0.82, step = ctrlTime / Math.max(1, n), dur = Math.min(260, Math.max(90, step * 3.2));
    var t0 = performance.now(), last = total + 400;
    var tick = function (now) {
      var t = now - t0;
      for (var i = 0; i <= n; i++) {
        var s = i < n ? i * step : ctrlTime, d = i < n ? dur : total - ctrlTime, p = clamp((t - s) / d), after = t - s - d;
        if (trs[i]) { trs[i].style.strokeDashoffset = 1 - p; trs[i].style.opacity = p <= 0 ? 0 : 1 - clamp(after / 220); }
        pcs[i].setAttribute('opacity', clamp(after / 90));
      }
      if (t < last) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  document.querySelectorAll('svg.fill .pc').forEach(function (p) { p.setAttribute('opacity', still ? 1 : 0); });
  var drawSketch = function (svg) {
    svg.classList.add('drawn');
    if (svg.matches('svg.fill')) setTimeout(function () { colour(svg, 3500); }, still ? 0 : 1150);
  };
  var so = 'IntersectionObserver' in window && !still ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { drawSketch(e.target); so.unobserve(e.target); } });
  }, { threshold: 0.1 }) : null;
  document.querySelectorAll('svg.sketch').forEach(function (s) { if (so) so.observe(s); else drawSketch(s); });

  document.querySelectorAll('.rv').forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); });

  // lightbox
  var lb = document.querySelector('.lb'), lbImg = lb && lb.querySelector('img'), last = null;
  var close = function () { lb.classList.remove('open'); if (last) last.focus(); };
  document.querySelectorAll('[data-full]').forEach(function (f) {
    f.tabIndex = 0; f.setAttribute('role', 'button');
    var open = function () {
      var im = f.querySelector('img'); last = f;
      lbImg.src = f.dataset.full; lbImg.alt = im ? im.alt : '';
      lb.classList.add('open'); lb.querySelector('button').focus();
    };
    f.addEventListener('click', open);
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  if (lb) {
    lb.addEventListener('click', close);
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }
})();
