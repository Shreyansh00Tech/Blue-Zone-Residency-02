/* ============================================
   BZR HOMES — MAIN JAVASCRIPT  (upgraded)
   ============================================ */
'use strict';

/* ---- SCROLL PROGRESS ---- */
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
  if (scrollProgress) scrollProgress.style.transform = `scaleX(${progress})`;
}

/* ---- NAVBAR ---- */
const navbar = document.getElementById('navbar');
function updateNavbar() {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}

/* ---- HERO PARALLAX ---- */
const heroImg = document.getElementById('heroImg');
function updateHeroParallax() {
  if (heroImg && window.scrollY < window.innerHeight) {
    heroImg.style.transform = `scale(1) translateY(${window.scrollY * 0.28}px)`;
  }
}

/* ---- HERO IMAGE LOAD ---- */
if (heroImg) {
  if (heroImg.complete) heroImg.classList.add('loaded');
  else heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));
}

/* ---- REVEAL ON SCROLL ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---- MOBILE NAV ---- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });
  navLinks.addEventListener('click', (e) => {
    if (e.target === navLinks) {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });
}

/* ---- ACTIVE NAV HIGHLIGHT ---- */
const sections    = document.querySelectorAll('section[id]');
const navLinkEls  = document.querySelectorAll('.nav-link');
function updateActiveNav() {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinkEls.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

/* ---- ANIMATED COUNTERS ---- */
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target; clearInterval(timer); }
    else el.textContent = Math.floor(start);
  }, 16);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const val = parseInt(el.textContent, 10);
      if (!isNaN(val)) animateCounter(el, val);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.status-num').forEach(el => counterObserver.observe(el));

/* ---- GALLERY LIGHTBOX ---- */
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const img     = item.querySelector('img');
    const capEl   = item.querySelector('.gallery-cap strong');
    if (!img) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.96);
      display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:zoom-out;padding:2rem;`;

    const i = document.createElement('img');
    i.src   = img.src; i.alt = img.alt;
    i.style.cssText = `max-width:90vw;max-height:80vh;object-fit:contain;border-radius:12px;`;

    const cap = document.createElement('p');
    cap.textContent = capEl ? capEl.textContent : '';
    cap.style.cssText = `margin-top:1rem;font-family:'Playfair Display',serif;font-size:1.1rem;color:#dba94a;`;

    const close = document.createElement('button');
    close.innerHTML = '✕';
    close.style.cssText = `position:absolute;top:1.5rem;right:2rem;color:white;font-size:1.4rem;
      background:none;border:none;cursor:pointer;opacity:0.6;`;

    overlay.appendChild(i);
    overlay.appendChild(cap);
    overlay.appendChild(close);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const closeOverlay = () => { overlay.remove(); document.body.style.overflow = ''; };
    overlay.addEventListener('click', closeOverlay);
    close.addEventListener('click', e => { e.stopPropagation(); closeOverlay(); });
    const onKey = (e) => { if (e.key === 'Escape') { closeOverlay(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
  });
});

/* ---- SMOOTH ANCHOR SCROLLING ---- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- CONTACT FORM ---- */
const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name  = contactForm.name?.value.trim();
    const phone = contactForm.phone?.value.trim();
    if (!name || !phone) {
      showFormError('Please fill in your name and phone number.');
      return;
    }

    // Loading state
    const originalTxt = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    const formData = {
      name,
      phone,
      email:      contactForm.email?.value.trim(),
      unit_type:  contactForm.unit_type?.value,
      visit_date: contactForm.visit_date?.value,
      message:    contactForm.message?.value.trim(),
      timestamp:  new Date().toISOString(),
    };

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showSuccess();
      } else {
        throw new Error('Server responded with status: ' + res.status);
      }
    } catch (err) {
      console.error('Submission error:', err.message);
      showFormError('Failed to connect to server. Please ensure backend is running.');
    }

    function showSuccess() {
      contactForm.reset();
      submitBtn.textContent = 'Sent ✓';
      submitBtn.style.background = '#22c55e';
      formSuccess.style.display = 'block';
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function showFormError(msg) {
      submitBtn.textContent = originalTxt;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.background = ''; // Revert to original styling if any
      alert(msg);
    }
  });
}

/* ---- SCROLL HANDLER (passive, RAF-throttled) ---- */
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateScrollProgress();
      updateNavbar();
      updateHeroParallax();
      updateActiveNav();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

/* ---- INIT ---- */
updateNavbar();
updateScrollProgress();