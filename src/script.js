/* =========================================================
   ROYAL ASIA SEA TRADE CORPORATION
   script.js — Vanilla JS for interactivity
   ========================================================= */

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

  viewport.addEventListener('touchstart', () => { isTouching = true; }, { passive: true });
  viewport.addEventListener('touchend', () => {
    isTouching = false;
    normalizeScroll();
  }, { passive: true });

  strip.addEventListener('mouseenter', () => { isHovering = true; });
  strip.addEventListener('mouseleave', () => { isHovering = false; });

  viewport.addEventListener('scroll', normalizeScroll, { passive: true });

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

});
