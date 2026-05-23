/* =============================================
   NANYA'S LABEL — Main JS
   ============================================= */

(function () {
  'use strict';

  // --- NAVBAR SCROLL ---
  const navbar = document.getElementById('navbar');
  if (navbar && !navbar.classList.contains('navbar--solid')) {
    const onScroll = () => {
      navbar.classList.toggle('navbar--scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- MOBILE NAV TOGGLE ---
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
      // Animate hamburger → X
      const spans = toggle.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity  = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity  = '';
        spans[2].style.transform = '';
      }
    });

    // Close nav on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
        const spans = toggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity  = '';
        spans[2].style.transform = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // --- SMOOTH SCROLL for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 0;
      const y = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  // --- REVEAL ON SCROLL ---
  const reveals = document.querySelectorAll('.service-card, .about-text, .footer-inner > *');
  reveals.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 3 === 1) el.classList.add('reveal-delay-1');
    if (i % 3 === 2) el.classList.add('reveal-delay-2');
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  // --- ACTIVE NAV LINK on scroll (landing page only) ---
  const sections = document.querySelectorAll('section[id]');
  if (sections.length) {
    const navAnchors = document.querySelectorAll('.nav-link:not(.nav-cta)');
    const activateNav = () => {
      const navH = navbar ? navbar.offsetHeight + 20 : 80;
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - navH) current = sec.id;
      });
      navAnchors.forEach(a => {
        const href = a.getAttribute('href') || '';
        a.style.color = href.includes(current) ? 'var(--clr-tan-lt)' : '';
      });
    };
    window.addEventListener('scroll', activateNav, { passive: true });
    activateNav();
  }
})();
