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
