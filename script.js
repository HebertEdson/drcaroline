const root = document.documentElement;
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const motionToggle = document.querySelector('.motion-toggle');
const toTop = document.querySelector('.to-top');
const images = [...document.querySelectorAll('[data-parallax]')];
let motionEnabled = true;
let observer;
let framePending = false;

// The requested motion is on by default, with an explicit per-visitor pause.
try { motionEnabled = sessionStorage.getItem('dracaroline-motion') !== 'paused'; } catch {}
window.lucide?.createIcons();

function setMenu(open) {
  header.classList.toggle('menu-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  navToggle.innerHTML = '<i data-lucide="' + (open ? 'x' : 'menu') + '"></i>';
  window.lucide?.createIcons();
}
navToggle.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && header.classList.contains('menu-open')) {
    setMenu(false);
    navToggle.focus();
  }
});
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    setMenu(false);
    target.scrollIntoView({ behavior: motionEnabled ? 'smooth' : 'instant', block: 'start' });
  });
});

// Preserve line breaks and emphasis while splitting text into animated words.
document.querySelectorAll('[data-split]').forEach((heading) => {
  const label = heading.innerText.replace(/\s+/g, ' ').trim();
  heading.setAttribute('aria-label', label);
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let index = 0;
  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part.trim()) {
        fragment.append(document.createTextNode(part));
        return;
      }
      const span = document.createElement('span');
      span.className = 'word';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = part;
      span.style.transitionDelay = Math.min(index++ * 55, 550) + 'ms';
      fragment.append(span);
    });
    node.replaceWith(fragment);
  });
});

const animated = [...document.querySelectorAll('[data-reveal], [data-split]')];
animated.forEach((element, index) => {
  if (!element.hasAttribute('data-split')) {
    element.style.transitionDelay = (index % 3) * 90 + 'ms';
  }
});

function updateScroll() {
  framePending = false;
  const height = window.innerHeight;
  header.classList.toggle('is-scrolled', window.scrollY > 8);
  toTop.classList.toggle('is-visible', window.scrollY > 240);
  if (motionEnabled) {
    images.forEach((img) => {
      const rect = img.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > height) return;
      const offset = Math.max(-26, Math.min(26, -(rect.top + rect.height / 2 - height / 2) * 0.06));
      img.style.setProperty('--parallax-y', offset.toFixed(1) + 'px');
    });
  }
  const sections = ['inicio', 'servicos', 'sobre', 'duvidas', 'contato'];
  let current = sections[0];
  sections.forEach((id) => {
    if (document.getElementById(id).getBoundingClientRect().top <= 170) current = id;
  });
  document.querySelectorAll('.site-nav a').forEach((link) => {
    const active = link.hash === '#' + current;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function requestScroll() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(updateScroll);
}
function observeReveals() {
  if (!motionEnabled || !('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else if (entry.boundingClientRect.top > 0 && !entry.target.contains(document.activeElement)) {
        entry.target.classList.remove('is-visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -35px 0px' });
  animated.forEach((element) => observer.observe(element));
}
function setupMotion() {
  observer?.disconnect();
  root.classList.toggle('motion-enabled', motionEnabled && 'IntersectionObserver' in window);
  root.classList.toggle('motion-paused', !motionEnabled);
  motionToggle.hidden = false;
  const label = motionEnabled ? 'Pausar animações' : 'Ativar animações';
  motionToggle.setAttribute('aria-label', label);
  motionToggle.setAttribute('aria-pressed', String(motionEnabled));
  motionToggle.title = label;
  motionToggle.innerHTML = '<i data-lucide="' + (motionEnabled ? 'pause' : 'play') + '"></i>';
  window.lucide?.createIcons();
  if (!motionEnabled || !('IntersectionObserver' in window)) {
    animated.forEach((element) => element.classList.add('is-visible'));
    images.forEach((img) => img.style.removeProperty('--parallax-y'));
  } else {
    // Commit the initial frame before observing so the first visit animates too.
    requestAnimationFrame(() => requestAnimationFrame(observeReveals));
  }
  requestScroll();
}
motionToggle.addEventListener('click', () => {
  motionEnabled = !motionEnabled;
  try { sessionStorage.setItem('dracaroline-motion', motionEnabled ? 'on' : 'paused'); } catch {}
  setupMotion();
});
document.addEventListener('focusin', (event) => {
  event.target.closest('[data-reveal]')?.classList.add('is-visible');
});
window.addEventListener('scroll', requestScroll, { passive: true });
window.addEventListener('resize', requestScroll, { passive: true });
setupMotion();
