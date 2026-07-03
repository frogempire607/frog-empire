// ===========================
// FROG EMPIRE - Main JS
// ===========================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Active nav link based on current page ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // ---- Navbar scroll effect ----
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
      lastScroll = window.scrollY;
    }, { passive: true });
  }

  // ---- Mobile nav toggle with backdrop ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Create backdrop element
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  function closeMobileNav() {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    backdrop.classList.remove('visible');
    document.body.style.overflow = '';
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function openMobileNav() {
    navToggle.classList.add('open');
    navLinks.classList.add('open');
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
    navToggle.setAttribute('aria-expanded', 'true');
  }

  if (navToggle && navLinks) {
    navToggle.setAttribute('aria-expanded', 'false');

    navToggle.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    // Close on backdrop click
    backdrop.addEventListener('click', closeMobileNav);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMobileNav();
      }
    });
  }

  // ---- FAQ Accordion with ARIA ----
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---- Schedule Tabs ----
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.schedule-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });

  // ---- Fade-up scroll animations ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ---- Contact form (Netlify Forms via fetch) ----
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const formData = new URLSearchParams(new FormData(contactForm));

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })
      .then(res => {
        if (res.ok) {
          btn.textContent = 'Sent! We\'ll be in touch.';
          btn.style.background = 'var(--success)';
          contactForm.reset();
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
          }, 5000);
        } else {
          throw new Error('Form submission failed');
        }
      })
      .catch(() => {
        btn.textContent = 'Error — please try again';
        btn.style.background = '#c0392b';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      });
    });
  }

  // ---- Tab buttons: expose active state to assistive tech ----
  const allTabButtons = document.querySelectorAll('.tab-btn, .page-tab-btn, .sub-tab-btn');
  function syncTabAria() {
    allTabButtons.forEach(b => b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false'));
  }
  syncTabAria();
  allTabButtons.forEach(btn => {
    // run after the click handlers that toggle .active
    btn.addEventListener('click', () => setTimeout(syncTabAria, 0));
  });

  // ---- Back-to-top ----
  const btt = document.getElementById('backToTop');
  if (btt) {
    // Remove inline styles that might conflict
    btt.removeAttribute('style');

    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

});
