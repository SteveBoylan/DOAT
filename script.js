// Dead or Alive Technology — site interactions

// Enable JS-dependent styling (scroll-reveal hidden states)
document.documentElement.classList.add('js');

// --- Sticky nav style on scroll ---
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// --- Mobile menu ---
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// --- Scroll-reveal animations ---
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// --- Animated stat counters ---
const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll('.stat__num[data-count]').forEach((el) => statObserver.observe(el));

// --- Booking form ---
// NOTE: This opens the visitor's email client pre-filled with the request.
// For direct submission, connect a service like Formspree/Netlify Forms
// and replace the handler below.
const form = document.getElementById('bookingForm');
const formStatus = document.getElementById('formStatus');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const subject = encodeURIComponent(`Repair request: ${data.get('device')}`);
  const body = encodeURIComponent(
    `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nDevice: ${data.get('device')}\n\nProblem:\n${data.get('message')}`
  );
  window.location.href = `mailto:info@deadoralivetechnology.com?subject=${subject}&body=${body}`;
  formStatus.textContent = 'Opening your email app… if nothing happens, email us directly at info@deadoralivetechnology.com.';
});

// --- Footer year ---
document.getElementById('year').textContent = new Date().getFullYear();
