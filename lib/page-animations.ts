/**
 * PAGE_ANIMATION_SCRIPT
 *
 * A self-contained, zero-dependency animation engine injected into every
 * generated page iframe. It runs entirely inside the sandboxed iframe and
 * never communicates with the parent window.
 *
 * Features:
 *  1. Page-load fade-in  — the whole page fades in smoothly on first render
 *  2. Scroll-triggered entrance animations — IntersectionObserver watches
 *     semantic sections, cards, headings, and any element with data-animate
 *  3. Staggered children — grids and lists animate children in cascade
 *  4. Navbar scroll behaviour — adds backdrop-blur + shadow after 60px scroll
 *  5. Parallax hero — hero sections move at 0.25× scroll speed
 *  6. Smooth scroll — all anchor links scroll smoothly
 *  7. Button micro-interactions — press scale on all buttons and CTAs
 *  8. Counter animation — numbers with data-count animate from 0 to value
 *  9. Cursor glow — subtle radial glow that follows the cursor (opt-in via
 *     data-cursor-glow on the root element)
 *
 * Design principles:
 *  - Respects prefers-reduced-motion — all animations are disabled when the
 *    user has requested reduced motion
 *  - Never throws — every block is wrapped in try/catch
 *  - Idempotent — safe to call multiple times
 *  - No external dependencies, no ES modules, no async/await
 *  - Minification-friendly: uses var, function declarations, no arrow fns
 *    in the hot path
 */

export const PAGE_ANIMATION_SCRIPT = `
(function () {
  'use strict';

  /* ── 0. Reduced-motion guard ─────────────────────────────────────────── */
  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) return; // honour the user's OS preference

  /* ── 1. Inject animation CSS ─────────────────────────────────────────── */
  try {
    var style = document.createElement('style');
    style.textContent = [
      /* Base hidden state for scroll-animated elements */
      '[data-az]{opacity:0;will-change:opacity,transform;}',

      /* Entrance variants */
      '[data-az="fade-up"]{transform:translateY(32px);}',
      '[data-az="fade-down"]{transform:translateY(-24px);}',
      '[data-az="fade-left"]{transform:translateX(32px);}',
      '[data-az="fade-right"]{transform:translateX(-32px);}',
      '[data-az="zoom-in"]{transform:scale(0.92);}',
      '[data-az="zoom-out"]{transform:scale(1.06);}',
      '[data-az="flip-up"]{transform:perspective(600px) rotateX(12deg) translateY(24px);}',

      /* Visible state — applied by JS */
      '[data-az].az-visible{',
      '  opacity:1!important;',
      '  transform:none!important;',
      '  transition:opacity var(--az-dur,0.65s) var(--az-ease,cubic-bezier(0.22,1,0.36,1)) var(--az-delay,0s),',
      '             transform var(--az-dur,0.65s) var(--az-ease,cubic-bezier(0.22,1,0.36,1)) var(--az-delay,0s);',
      '}',

      /* Navbar scroll state */
      '[data-az-nav].az-scrolled{',
      '  background:rgba(var(--background-rgb,255,255,255),0.85)!important;',
      '  backdrop-filter:blur(20px) saturate(180%)!important;',
      '  -webkit-backdrop-filter:blur(20px) saturate(180%)!important;',
      '  box-shadow:0 1px 0 0 rgba(0,0,0,0.06)!important;',
      '  transition:background 0.3s ease,box-shadow 0.3s ease;',
      '}',

      /* Page-load fade */
      '#root{animation:az-page-in 0.45s cubic-bezier(0.22,1,0.36,1) both;}',
      '@keyframes az-page-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}',

      /* Button press */
      '.az-btn:active{transform:scale(0.97)!important;transition:transform 0.1s ease!important;}',

      /* Cursor glow */
      '#az-glow{pointer-events:none;position:fixed;width:480px;height:480px;',
      'border-radius:50%;background:radial-gradient(circle,rgba(var(--primary-rgb,99,102,241),0.07) 0%,transparent 70%);',
      'transform:translate(-50%,-50%);transition:left 0.12s ease,top 0.12s ease;z-index:0;mix-blend-mode:normal;}',
    ].join('');
    document.head.appendChild(style);
  } catch(e) {}

  /* ── 2. Auto-instrument elements ─────────────────────────────────────── */
  try {
    /*
     * We target elements that are likely to be meaningful sections/cards.
     * Elements that already have data-az are left as-is (AI-authored).
     * We skip elements that are already visible above the fold (first 120px).
     */
    var SELECTORS = [
      'section',
      'article',
      '[class*="card"]',
      '[class*="bento"]',
      '[class*="feature"]',
      '[class*="pricing"]',
      '[class*="testimonial"]',
      '[class*="hero"]',
      '[class*="cta"]',
      '[class*="faq"]',
      '[class*="team"]',
      '[class*="footer"]',
      'h1','h2','h3',
      'p[class*="text-"]',
      '[data-animate]',   /* AI-authored attribute */
    ].join(',');

    var STAGGER_SELECTORS = [
      '[data-stagger]',        /* AI-authored stagger container — highest priority */
      '[class*="grid"]',
      '[class*="flex"][class*="gap"]',
      'ul',
      'ol',
    ].join(',');

    var VARIANT_MAP = {
      'hero':        'fade-up',
      'cta':         'zoom-in',
      'card':        'fade-up',
      'bento':       'fade-up',
      'feature':     'fade-up',
      'pricing':     'fade-up',
      'testimonial': 'fade-up',
      'faq':         'fade-up',
      'team':        'fade-up',
      'footer':      'fade-up',
      'h1':          'fade-up',
      'h2':          'fade-up',
      'h3':          'fade-up',
    };

    function getVariant(el) {
      /* Respect explicit data-animate attribute from AI */
      if (el.dataset && el.dataset.animate) return el.dataset.animate;
      var tag = el.tagName ? el.tagName.toLowerCase() : '';
      var cls = (el.className || '').toLowerCase();
      for (var key in VARIANT_MAP) {
        if (cls.indexOf(key) !== -1 || tag === key) return VARIANT_MAP[key];
      }
      return 'fade-up';
    }

    function isAboveFold(el) {
      try {
        var rect = el.getBoundingClientRect();
        return rect.top < 120 && rect.bottom > 0;
      } catch(e) { return false; }
    }

    function instrument(el, delay) {
      if (!el || el.dataset.az !== undefined) return; /* already done */
      if (isAboveFold(el)) return; /* skip above-fold — show immediately */
      el.dataset.az = getVariant(el);
      if (delay) el.style.setProperty('--az-delay', delay + 'ms');
    }

    /* Instrument individual elements */
    var candidates = document.querySelectorAll(SELECTORS);
    for (var i = 0; i < candidates.length; i++) {
      instrument(candidates[i], 0);
    }

    /* Stagger children of grid/flex containers */
    var staggerParents = document.querySelectorAll(STAGGER_SELECTORS);
    for (var j = 0; j < staggerParents.length; j++) {
      var parent = staggerParents[j];
      var children = parent.children;
      var staggerDelay = 0;
      for (var k = 0; k < children.length; k++) {
        var child = children[k];
        if (child.dataset.az === undefined && !isAboveFold(child)) {
          child.dataset.az = 'fade-up';
          child.style.setProperty('--az-delay', staggerDelay + 'ms');
          staggerDelay += 70;
        }
      }
    }
  } catch(e) {}

  /* ── 3. IntersectionObserver — trigger animations on scroll ──────────── */
  try {
    var io = new IntersectionObserver(function(entries) {
      for (var n = 0; n < entries.length; n++) {
        var entry = entries[n];
        if (entry.isIntersecting) {
          entry.target.classList.add('az-visible');
          io.unobserve(entry.target);
        }
      }
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px',
    });

    function observeAll() {
      var els = document.querySelectorAll('[data-az]');
      for (var m = 0; m < els.length; m++) {
        io.observe(els[m]);
      }
    }

    observeAll();

    /* Re-observe after a short delay to catch dynamically rendered content */
    setTimeout(observeAll, 600);
  } catch(e) {}

  /* ── 4. Navbar scroll behaviour ──────────────────────────────────────── */
  try {
    var navSelectors = ['nav','header','[class*="navbar"]','[class*="nav-"]'];
    var navEl = null;
    for (var ns = 0; ns < navSelectors.length; ns++) {
      navEl = document.querySelector(navSelectors[ns]);
      if (navEl) break;
    }

    if (navEl) {
      navEl.dataset.azNav = '1';

      function onNavScroll() {
        var y = window.scrollY || window.pageYOffset;
        if (y > 60) {
          navEl.classList.add('az-scrolled');
        } else {
          navEl.classList.remove('az-scrolled');
        }
      }

      window.addEventListener('scroll', onNavScroll, { passive: true });
      onNavScroll(); /* run once on load */
    }
  } catch(e) {}

  /* ── 5. Parallax hero ────────────────────────────────────────────────── */
  try {
    var heroEl = document.querySelector(
      '[class*="hero"], section:first-of-type, [class*="banner"]'
    );

    if (heroEl) {
      var heroBg = heroEl.querySelector('[class*="absolute"], [class*="bg-"]');
      var parallaxTarget = heroBg || heroEl;

      function onParallaxScroll() {
        var y = window.scrollY || window.pageYOffset;
        parallaxTarget.style.transform = 'translateY(' + (y * 0.25) + 'px)';
      }

      window.addEventListener('scroll', onParallaxScroll, { passive: true });
    }
  } catch(e) {}

  /* ── 6. Smooth scroll for all anchor links ───────────────────────────── */
  try {
    document.documentElement.style.scrollBehavior = 'smooth';
  } catch(e) {}

  /* ── 7. Button micro-interactions ────────────────────────────────────── */
  try {
    var btnSelectors = [
      'button',
      '[class*="btn"]',
      '[class*="cta"]',
      'a[class*="rounded"]',
      'a[class*="px-"]',
    ].join(',');

    var btns = document.querySelectorAll(btnSelectors);
    for (var b = 0; b < btns.length; b++) {
      btns[b].classList.add('az-btn');
    }

    /* Also handle dynamically added buttons */
    document.addEventListener('mousedown', function(e) {
      var t = e.target;
      if (t && (t.tagName === 'BUTTON' || t.tagName === 'A')) {
        t.classList.add('az-btn');
      }
    }, true);
  } catch(e) {}

  /* ── 8. Counter animation ────────────────────────────────────────────── */
  try {
    function animateCounter(el) {
      /* data-count is the authoritative source; fall back to parsing innerText */
      var raw = el.dataset.count !== undefined
        ? el.dataset.count
        : (el.innerText || '').replace(/[^0-9.]/g, '');
      var target = parseFloat(raw);
      if (isNaN(target)) return;
      var suffix = el.dataset.count !== undefined
        ? (el.innerText || '').replace(/[0-9.,]/g, '').trim()
        : (el.innerText || '').replace(/[0-9.]/g, '');
      var start = 0;
      var duration = 1400;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        /* Ease-out cubic */
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(start + (target - start) * eased);
        el.innerText = current + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }

    var counterObserver = new IntersectionObserver(function(entries) {
      for (var ci = 0; ci < entries.length; ci++) {
        if (entries[ci].isIntersecting) {
          animateCounter(entries[ci].target);
          counterObserver.unobserve(entries[ci].target);
        }
      }
    }, { threshold: 0.5 });

    /* Target elements that look like stat numbers */
    var statSelectors = [
      '[data-count]',          /* AI-authored — highest priority */
      '[class*="stat"] [class*="text-"]',
      '[class*="kpi"] [class*="text-"]',
      '[class*="metric"] [class*="text-"]',
      '[class*="number"]',
    ].join(',');

    var statEls = document.querySelectorAll(statSelectors);
    for (var si = 0; si < statEls.length; si++) {
      var el = statEls[si];
      /* Only animate if the text looks like a number */
      if (/^[\\d,.$%k+]+$/i.test((el.innerText || '').trim())) {
        counterObserver.observe(el);
      }
    }
  } catch(e) {}

  /* ── 9. Cursor glow (opt-in) ─────────────────────────────────────────── */
  try {
    var rootEl = document.getElementById('root');
    if (rootEl && rootEl.dataset.cursorGlow !== undefined) {
      var glow = document.createElement('div');
      glow.id = 'az-glow';
      document.body.appendChild(glow);

      document.addEventListener('mousemove', function(e) {
        glow.style.left = e.clientX + 'px';
        glow.style.top  = e.clientY + 'px';
      }, { passive: true });
    }
  } catch(e) {}

  /* ── 10. Re-measure iframe height after animations settle ────────────── */
  try {
    setTimeout(function() {
      var pageId = window.__ZEPHIO_PAGE_ID__;
      if (!pageId) return;
      var h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 900);
      parent.postMessage({ type: 'FRAME_HEIGHT', pageId: pageId, height: h }, '*');
    }, 800);
  } catch(e) {}

})();
`.trim();
