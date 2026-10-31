const heroContours = document.querySelectorAll('.hero-contour');
heroContours.forEach((heroContour) => {
  requestAnimationFrame(() => {
    heroContour.classList.add('active');
  });
});

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

const sections = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.main-nav a[href^="#"]');

const activateCurrentSection = () => {
  const scrollPosition = window.scrollY + 120;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPosition >= top && scrollPosition < top + height) {
      navAnchors.forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (href === `#${id}`) {
          anchor.classList.add('is-active');
        } else {
          anchor.classList.remove('is-active');
        }
      });
    }
  });
};

if (navAnchors.length > 0) {
  activateCurrentSection();
  window.addEventListener('scroll', activateCurrentSection, { passive: true });
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