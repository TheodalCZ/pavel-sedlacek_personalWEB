const heroContours = document.querySelectorAll('.hero-contour:not(.footer-contour)');
heroContours.forEach((heroContour) => {
  requestAnimationFrame(() => {
    heroContour.classList.add('active');
  });
});

// Vrstevnice v patičce se začnou kreslit, až když se patička objeví na obrazovce.
const footerContour = document.querySelector('.footer-contour');
if (footerContour) {
  if ('IntersectionObserver' in window) {
    const footerObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        footerContour.classList.add('active');
        footerObserver.disconnect();
      }
    }, { threshold: 0.2 });
    footerObserver.observe(footerContour.closest('.site-footer'));
  } else {
    footerContour.classList.add('active');
  }
}

const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav a');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const navAnchors = Array.from(document.querySelectorAll('.main-nav ul a[href^="#"]'));
const navTargets = navAnchors
  .map((anchor) => ({ anchor, target: document.querySelector(anchor.getAttribute('href') === '#top' ? '.hero' : anchor.getAttribute('href')) }))
  .filter((item) => item.target);

// Zvýrazní položku menu podle sekce, která je právě pod hlavičkou.
const activateCurrentSection = () => {
  const header = document.querySelector('.site-header');
  const offset = (header ? header.offsetHeight : 0) + 80;
  let current = null;

  navTargets.forEach((item) => {
    if (item.target.getBoundingClientRect().top <= offset) {
      current = item;
    }
  });

  navTargets.forEach((item) => {
    item.anchor.classList.toggle('is-active', item === current);
    if (item === current) {
      item.anchor.setAttribute('aria-current', 'true');
    } else {
      item.anchor.removeAttribute('aria-current');
    }
  });
};

if (navTargets.length > 0) {
  activateCurrentSection();
  window.addEventListener('scroll', activateCurrentSection, { passive: true });
  window.addEventListener('resize', activateCurrentSection);
}

const headerLinks = document.querySelectorAll('.main-nav a');
headerLinks.forEach((link) => {
  if (link.getAttribute('href') === '#') {
    link.setAttribute('aria-current', 'page');
  }
});

const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
smoothScrollLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const dotsWrap = carousel.querySelector('.carousel-dots');
  const slides = track ? Array.from(track.children) : [];

  if (!track || !dotsWrap || slides.length < 2) {
    return;
  }

  let current = 0;
  let timer;

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
    });
  };

  const resetTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 4000);
  };

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    if (index === 0) {
      dot.classList.add('is-active');
    }
    dot.setAttribute('aria-label', `Snímek ${index + 1} z ${slides.length}`);
    dot.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      goTo(index);
      resetTimer();
    });
    dotsWrap.appendChild(dot);
  });

  const prevArrow = carousel.querySelector('.carousel-arrow--prev');
  const nextArrow = carousel.querySelector('.carousel-arrow--next');

  prevArrow?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    goTo(current - 1);
    resetTimer();
  });

  nextArrow?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    goTo(current + 1);
    resetTimer();
  });

  resetTimer();
});

// Česká typografie: za jednopísmenné předložky a spojky vloží pevnou mezeru,
// aby nezůstaly na konci řádku.
const fixCzechOrphans = (root) => {
  const pattern = /(^|[\s(„"])([KkSsVvZzOoUuAaIi])[ \t\r\n]+/g;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (
      node.parentElement && !node.parentElement.closest('script, style, textarea, pre, code')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    ),
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((node) => {
    const text = node.nodeValue;
    // Dvě průchody kvůli sousedním spojkám typu "a v".
    const fixed = text.replace(pattern, '$1$2\u00A0').replace(pattern, '$1$2\u00A0');
    if (fixed !== text) {
      node.nodeValue = fixed;
    }
  });
};

fixCzechOrphans(document.body);

// Jméno v hero sekci se při scrollu plynule rozjíždí do stran (Pavel doleva, Sedláček doprava).
const heroShiftItems = document.querySelectorAll('[data-hero-shift]');
const heroSection = document.querySelector('.hero');

if (heroShiftItems.length > 0 && heroSection && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let current = 0;
  let target = 0;
  let frame = null;

  const render = () => {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.001) {
      current = target;
    }

    heroShiftItems.forEach((item) => {
      const direction = Number(item.dataset.heroShift);
      item.style.translate = `${direction * current * window.innerWidth * 0.35}px 0`;
    });

    frame = current === target ? null : requestAnimationFrame(render);
  };

  const onScroll = () => {
    const progress = Math.min(Math.max(window.scrollY / heroSection.offsetHeight, 0), 1);
    target = progress;
    if (frame === null) {
      frame = requestAnimationFrame(render);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}

// Animace při scrollu: indikátor postupu a postupné odhalování sekcí.
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
scrollProgress.setAttribute('aria-hidden', 'true');
document.body.appendChild(scrollProgress);

const updateScrollProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  scrollProgress.style.transform = `scaleX(${ratio})`;
};
updateScrollProgress();
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);

const revealAllowed = 'IntersectionObserver' in window
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (revealAllowed && document.querySelector('.hero-grid')) {
  const addReveal = (selector, variant, stagger = true) => {
    const counters = new Map();
    document.querySelectorAll(selector).forEach((el) => {
      const index = counters.get(el.parentElement) || 0;
      counters.set(el.parentElement, index + 1);
      el.classList.add('reveal');
      el.dataset.reveal = typeof variant === 'function' ? variant(index) : variant;
      if (stagger) {
        el.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 0.12}s`);
      }
    });
  };

  const sideByIndex = (index) => ['left', 'up', 'right'][index % 3];

  addReveal('.section-heading', 'up', false);
  addReveal('.project-card', 'up');
  addReveal('.timeline-column > h3', 'up', false);
  addReveal('.timeline-column:nth-child(odd) .timeline-item', 'left');
  addReveal('.timeline-column:nth-child(even) .timeline-item', 'right');
  addReveal('.skill-block', 'zoom');
  addReveal('.interest-card', sideByIndex);
  addReveal('.footer-grid > div', 'left', false);
  addReveal('.contact-list', 'right', false);

  document.querySelectorAll('.skill-tags').forEach((tags) => {
    Array.from(tags.children).forEach((tag, i) => tag.style.setProperty('--i', i));
  });

  document.documentElement.classList.add('js-reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}