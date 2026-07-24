/* =========================================================
   ROYAL ASIA SEA TRADE CORPORATION
   script.js — Vanilla JS for interactivity
   ========================================================= */

/* ---------- Haptic Feedback Engine ---------- */
/*
  Lightweight wrapper around the Vibration API.
  Designed to be subtle, fast and non-intrusive — short pulses only.
  Silently no-ops on devices/browsers without support (desktop, iOS Safari, etc).
*/
const Haptics = (() => {
  const supported = typeof window !== 'undefined' &&
    'vibrate' in window.navigator &&
    typeof window.navigator.vibrate === 'function';

  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Patterns kept intentionally short (ms) for a subtle, non-buzzy feel.
  const patterns = {
    tap: 22,                // click — links, icons, menu items
    select: 30,             // selection / toggle — buttons, form controls
    cardPress: 26,          // card press
    dragStart: 18,          // beginning of a drag/swipe gesture
    slideChange: 35,        // a carousel slide successfully snapped/changed
    confirm: [25, 40, 25]   // success / submit confirmation
  };

  let lastFireTime = 0;
  const MIN_INTERVAL_MS = 80; // throttle so rapid-fire events don't feel like a buzz

  function fire(pattern) {
    if (!supported || prefersReducedMotion) return;
    const now = performance.now();
    if (now - lastFireTime < MIN_INTERVAL_MS) return;
    lastFireTime = now;
    try {
      window.navigator.vibrate(pattern);
    } catch (err) {
      /* fail silently — haptics are purely an enhancement */
    }
  }

  return {
    tap: () => fire(patterns.tap),
    select: () => fire(patterns.select),
    cardPress: () => fire(patterns.cardPress),
    dragStart: () => fire(patterns.dragStart),
    slideChange: () => fire(patterns.slideChange),
    confirm: () => fire(patterns.confirm),
    isSupported: () => supported
  };
})();

function initInfiniteProductsStrip(strip) {
  const viewport = strip.querySelector('.products-strip-viewport');
  const track = strip.querySelector('.products-strip-track');
  const fadeLeft = strip.querySelector('.products-strip-fade--left');
  const fadeRight = strip.querySelector('.products-strip-fade--right');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const originals = [...track.children];

  originals.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('img').forEach((img) => img.setAttribute('alt', ''));
    track.appendChild(clone);
  });

  [...originals].reverse().forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('img').forEach((img) => img.setAttribute('alt', ''));
    track.insertBefore(clone, track.firstChild);
  });

  let setWidth = 0;
  let isDragging = false;
  let isHovering = false;
  let isTouching = false;
  let startX = 0;
  let scrollLeft = 0;
  let rafId = null;

  function shouldAutoScroll() {
    return !prefersReducedMotion && !isDragging && !isHovering && !isTouching && setWidth;
  }

  function measureSetWidth() {
    setWidth = track.scrollWidth / 3;
  }

  function normalizeScroll() {
    if (!setWidth) return;
    if (viewport.scrollLeft >= setWidth * 2 - 1) {
      viewport.scrollLeft -= setWidth;
    } else if (viewport.scrollLeft <= 1) {
      viewport.scrollLeft += setWidth;
    }
  }

  function initScrollPosition() {
    measureSetWidth();
    viewport.scrollLeft = setWidth;
    fadeLeft.classList.remove('is-hidden');
    fadeRight.classList.remove('is-hidden');
  }

  function tick() {
    if (shouldAutoScroll()) {
      viewport.classList.add('is-auto-scrolling');
      viewport.scrollLeft += 0.6;
      normalizeScroll();
    } else {
      viewport.classList.remove('is-auto-scrolling');
    }
    rafId = requestAnimationFrame(tick);
  }

  viewport.addEventListener('mousedown', (e) => {
    isDragging = true;
    viewport.classList.add('is-dragging');
    startX = e.pageX;
    scrollLeft = viewport.scrollLeft;
  });

  viewport.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    viewport.scrollLeft = scrollLeft - (e.pageX - startX);
  });

  const stopDragging = () => {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');
    normalizeScroll();
  };

  viewport.addEventListener('mouseup', stopDragging);
  viewport.addEventListener('mouseleave', stopDragging);

  viewport.addEventListener('touchstart', () => {
    isTouching = true;
  }, { passive: true });
  viewport.addEventListener('touchend', () => {
    isTouching = false;
    normalizeScroll();
  }, { passive: true });

  strip.addEventListener('mouseenter', () => { isHovering = true; });
  strip.addEventListener('mouseleave', () => { isHovering = false; });

  let lastActiveSlideIndex = -1;

  function trackSlideChange() {
    if (!setWidth) return;
    const slideEls = [...track.children].filter((el) => el.getAttribute('aria-hidden') !== 'true' || true);
    if (!slideEls.length) return;
    const slideWidth = track.scrollWidth / track.children.length;
    if (!slideWidth) return;
    const currentIndex = Math.round(viewport.scrollLeft / slideWidth);
    if (currentIndex !== lastActiveSlideIndex) {
      if (lastActiveSlideIndex !== -1 && (isDragging || isTouching)) {
        Haptics.slideChange();
      }
      lastActiveSlideIndex = currentIndex;
    }
  }

  viewport.addEventListener('scroll', normalizeScroll, { passive: true });
  viewport.addEventListener('scroll', trackSlideChange, { passive: true });

  window.addEventListener('resize', () => {
    const ratio = setWidth ? viewport.scrollLeft / setWidth : 1;
    measureSetWidth();
    viewport.scrollLeft = setWidth * ratio;
    normalizeScroll();
  });

  if (document.readyState === 'complete') {
    initScrollPosition();
  } else {
    window.addEventListener('load', initScrollPosition);
  }

  initScrollPosition();
  rafId = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(rafId);
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Set Current Year in Footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Scroll Reveal Animation ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------- Button Ripple Effect ---------- */
  const rippleButtons = document.querySelectorAll('.ripple');

  rippleButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      ripple.classList.add('ripple-effect');
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      button.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* ---------- Scroll to Section (no URL hash) ---------- */
  document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.scrollTo);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  if (window.location.hash === '#contact') {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'instant' });
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  /* ---------- Back to Top Button ---------- */
  const backToTopBtn = document.getElementById('backToTop');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Director Photo Fallbacks ---------- */
  document.querySelectorAll('.director-card__image[data-fallback]').forEach((img) => {
    img.addEventListener('error', function handleImageError() {
      const fallback = this.dataset.fallback;
      if (fallback && this.src !== fallback) {
        this.src = fallback;
      }
      this.removeEventListener('error', handleImageError);
    }, { once: true });
  });

  /* ---------- Products Infinite Drag Scroll ---------- */
  const productsStrip = document.querySelector('.products-strip');

  if (productsStrip) {
    initInfiniteProductsStrip(productsStrip);
  }

  /* ---------- Global Haptic Feedback Wiring ---------- */
  /*
    Applies a strong, consistent haptic pulse on actual clicks across
    every interactive element on the page: buttons, links, cards,
    icons, menu items, and form controls. Uses event delegation so
    it also covers elements that are dynamically cloned (e.g. the
    carousel slides). Fires only on real interaction — no pre-emptive
    or anticipatory pulses.
  */
  (() => {
    if (!Haptics.isSupported()) return;

    const SELECTOR_MAP = [
      { selector: '.btn, button, [role="button"]', handler: Haptics.select },
      { selector: 'a[href]', handler: Haptics.tap },
      { selector: '.contact-card', handler: Haptics.cardPress },
      { selector: '.info-card, .director-card, .goal-item', handler: Haptics.cardPress },
      { selector: '.products-slide', handler: Haptics.tap },
      { selector: 'input, select, textarea, label', handler: Haptics.select },
      { selector: '.products-strip-track svg, .info-card-icon, .contact-icon', handler: Haptics.tap }
    ];

    document.addEventListener('click', (e) => {
      for (const { selector, handler } of SELECTOR_MAP) {
        const match = e.target.closest(selector);
        if (match) {
          handler();
          break;
        }
      }
    }, { passive: true });
  })();

});