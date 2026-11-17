// gospelar.com — shared site behaviour (no dependencies).
(function () {
  document.documentElement.classList.remove('no-js');

  // ── Sticky header shadow ────────────────────────────────────────────────
  var header = document.querySelector('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', window.scrollY > 8); };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Dropdown menus (click to toggle, Esc / outside click to close) ──────
  var items = Array.prototype.slice.call(document.querySelectorAll('.nav-item'));
  var closeAll = function (except) {
    items.forEach(function (it) {
      if (it === except) return;
      it.classList.remove('open');
      var b = it.querySelector('.nav-trigger');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  };
  items.forEach(function (it) {
    var btn = it.querySelector('.nav-trigger');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !it.classList.contains('open');
      closeAll(it);
      it.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    // Hover-intent on pointer devices
    if (window.matchMedia('(hover: hover)').matches) {
      var t;
      it.addEventListener('mouseenter', function () { clearTimeout(t); closeAll(it); it.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); });
      it.addEventListener('mouseleave', function () { t = setTimeout(function () { it.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }, 160); });
    }
  });
  document.addEventListener('click', function () { closeAll(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAll(); document.body.classList.remove('menu-open'); setToggle(false); }
  });

  // ── Mobile menu ─────────────────────────────────────────────────────────
  var toggle = document.querySelector('.nav-toggle');
  var setToggle = function (open) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = !document.body.classList.contains('menu-open');
      document.body.classList.toggle('menu-open', open);
      setToggle(open);
    });
    document.querySelectorAll('.mobile-panel a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('menu-open'); setToggle(false); });
    });
  }

  // ── Reveal on scroll ────────────────────────────────────────────────────
  var reveal = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('in'); });
  }

  // ── Count-up numbers ────────────────────────────────────────────────────
  var counters = document.querySelectorAll('[data-count]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var run = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (!isFinite(target)) return;
    if (reduce) { el.firstChild.nodeValue = String(target); return; }
    var start = performance.now(), dur = 1100;
    var tick = function (now) {
      var p = Math.min(1, (now - start) / dur);
      el.firstChild.nodeValue = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // ── Tabs ────────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    var tabs = group.querySelectorAll('[role="tab"]');
    var select = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.classList.toggle('active', on);
      });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        n.focus(); select(n);
      });
    });
  });

  // ── Marquee: duplicate the track so it loops seamlessly ─────────────────
  document.querySelectorAll('.marquee-track').forEach(function (track) {
    var kids = Array.prototype.slice.call(track.children);
    kids.forEach(function (k) { var c = k.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });
  });

  // ── Table of contents: highlight the section in view ────────────────────
  var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove('active'); });
          var a = map[en.target.id]; if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) tio.observe(el); });
  }

  // ── Footer year ─────────────────────────────────────────────────────────
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
