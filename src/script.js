/* =========================================================
   ROYAL ASIA SEA TRADE CORPORATION
   script.js — Vanilla JS for interactivity
   ========================================================= */

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
    // Fallback: show everything immediately
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

  /* ---------- Header Background on Scroll ---------- */
  const header = document.querySelector('.site-header');

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.style.background = 'rgba(7, 38, 42, 0.95)';
      } else {
        header.style.background = 'rgba(13, 59, 62, 0.85)';
      }
    });
  }

  /* ---------- Leaflet Map Initialization ---------- */
  const mapEl = document.getElementById('leaflet-map');

  if (mapEl && typeof L !== 'undefined') {
    // Approximate coordinates for Navotas Fish Port Complex area, Navotas City, Philippines
    const lat = 14.6580;
    const lng = 120.9430;

    const map = L.map('leaflet-map', {
      scrollWheelZoom: false
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const marker = L.marker([lat, lng]).addTo(map);

    marker.bindPopup(
      '<strong>ROYAL ASIA SEA TRADE CORPORATION</strong><br>' +
      '1056 RAV Compound<br>' +
      'NBBS Proper<br>' +
      'Navotas City<br>' +
      'Philippines'
    ).openPopup();

    // Enable scroll zoom only when map is clicked/focused (better mobile UX)
    map.on('click', () => map.scrollWheelZoom.enable());
    mapEl.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());
  }

});