function scrollToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

function checkScrollPosition() {
  var btnHome = document.querySelector('.btn-home');
  if (!btnHome) return;
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    btnHome.classList.add('visible');
  } else {
    btnHome.classList.remove('visible');
  }
}

window.onscroll = checkScrollPosition;
document.addEventListener('DOMContentLoaded', checkScrollPosition);

const CGS_INTERACTION_PRESET = (function () {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preset = {
    mode: 'cinema',
    typeSpeed: 30,
    typeDelay: 2500,
    cursorScale: 1.16,
    glitchDuration: 0.34,
    tiltMaxDeg: 7,
    scanlineOpacity: 0.12,
    panelGlow: 0.3
  };

  if (preset.mode === 'cinema') {
    preset.typeSpeed = 24;
    preset.typeDelay = 2100;
    preset.cursorScale = 1.24;
    preset.glitchDuration = 0.44;
    preset.tiltMaxDeg = 9;
    preset.scanlineOpacity = 0.18;
    preset.panelGlow = 0.45;
  }

  if (reduceMotion) {
    preset.typeSpeed = 22;
    preset.typeDelay = 500;
    preset.cursorScale = 1.05;
    preset.glitchDuration = 0.2;
    preset.tiltMaxDeg = 0;
    preset.scanlineOpacity = 0.05;
    preset.panelGlow = 0.12;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const root = document.documentElement;
    root.style.setProperty('--cursor-scale', String(preset.cursorScale));
    root.style.setProperty('--glitch-duration', preset.glitchDuration.toFixed(2) + 's');
    root.style.setProperty('--scanline-opacity', String(preset.scanlineOpacity));
    root.style.setProperty('--panel-active-glow', String(preset.panelGlow));
  });

  return preset;
})();

// ===== Trailer Intro =====
(function () {
  const intro = document.getElementById('trailer-intro');
  const skipBtn = document.getElementById('trailer-skip');
  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!intro) return;

  if (prefersReduce) {
    intro.classList.add('is-hidden');
    return;
  }

  document.body.classList.add('trailer-lock');

  let finished = false;
  function closeIntro() {
    if (finished) return;
    finished = true;
    intro.classList.add('is-hidden');
    document.body.classList.remove('trailer-lock');
    window.setTimeout(function () {
      if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    }, 560);
  }

  window.setTimeout(closeIntro, 2600);
  if (skipBtn) skipBtn.addEventListener('click', closeIntro);
})();

// ===== Reading Progress Bar =====
window.addEventListener(
  'scroll',
  function () {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    const progress = documentHeight > 0 ? (scrolled / documentHeight) * 100 : 0;

    progressBar.style.width = progress + '%';
    progressBar.setAttribute('aria-valuenow', Math.round(progress));
  },
  { passive: true }
);

// ===== Theme Toggle (Light/Dark) =====
(function () {
  const THEME_KEY = 'cgs_theme';
  const btn = document.getElementById('theme-toggle');
  const label = document.getElementById('theme-label');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}

    if (label) label.textContent = theme === 'dark' ? '🌙 Escuro' : '☀️ Claro';
    if (btn) btn.setAttribute('aria-pressed', String(theme === 'dark'));

    const footerLogo = document.querySelector('.footer-logo');
    if (footerLogo) {
      footerLogo.src = theme === 'light' ? './assets/images/logo.black.png' : './assets/images/logo.png';
    }

    const meusJogos = document.getElementById('meus_jogos');
    if (meusJogos) {
      meusJogos.style.backgroundImage =
        theme === 'light' ? 'url("./assets/images/codigosClean.jpg")' : 'url("./assets/images/codigos.jpeg")';
    }
  }

  function getInitialTheme() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (e) {}

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(getInitialTheme());
    if (btn) btn.addEventListener('click', toggleTheme);
  });
})();

// ===== Email Link: mailto + fallback =====
document.addEventListener('DOMContentLoaded', function () {
  const emailLink = document.getElementById('email-link');
  if (!emailLink) return;

  const mailto =
    'mailto:garcia.mar.mil@gmail.com?subject=Contato%20Portf%C3%B3lio&body=Ol%C3%A1%20Carlos,%20tudo%20bem?';
  const gmailFallback =
    'https://mail.google.com/mail/?view=cm&fs=1&to=garcia.mar.mil@gmail.com&su=Contato%20Portf%C3%B3lio&body=Ol%C3%A1%20Carlos,%20tudo%20bem?';

  emailLink.addEventListener('click', function (ev) {
    ev.preventDefault();
    try {
      window.location.href = mailto;
    } catch (e) {}

    setTimeout(function () {
      if (document.hasFocus()) {
        window.open(gmailFallback, '_blank', 'noopener');
      }
    }, 400);
  });
});

// ===== Parallax Backgrounds (fallback when GSAP not available) =====
(function () {
  if (window.gsap && window.ScrollTrigger) return;

  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = function () {
    return window.innerWidth <= 768;
  };
  let ticking = false;

  const elements = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!elements.length) return;

  function update() {
    const disable = prefersReduce || isSmall();
    elements.forEach(function (el) {
      if (disable) {
        el.style.backgroundPosition = 'center center';
        return;
      }
      const speed = parseFloat(el.dataset.parallax) || 0.25;
      const rect = el.getBoundingClientRect();
      const move = -rect.top * speed;
      el.style.backgroundPosition = 'center calc(50% + ' + move + 'px)';
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();

// ===== Mobile Menu Toggle =====
(function () {
  const menuToggle = document.getElementById('menu-toggle');
  const menuItems = document.getElementById('menu-items');
  const menuLinks = document.querySelectorAll('.navegacao_link');

  if (!menuToggle || !menuItems) return;

  menuToggle.addEventListener('click', function () {
    const isActive = menuToggle.classList.toggle('active');
    menuItems.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(isActive));
  });

  menuLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      menuToggle.classList.remove('active');
      menuItems.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 700) {
      menuToggle.classList.remove('active');
      menuItems.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('nav')) {
      menuToggle.classList.remove('active');
      menuItems.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

// ===== Hero polish: typewriter + availability + glitch =====
(function () {
  function runTypewriter(el) {
    if (!el) return;
    const original = (el.dataset.fullText || el.textContent || '').trim();
    if (!original || el.dataset.typedReady === 'true') return;

    el.dataset.fullText = original;
    el.dataset.typedReady = 'true';
    el.textContent = '';

    let i = 0;
    const tick = window.setInterval(function () {
      i += 1;
      el.textContent = original.slice(0, i);
      if (i >= original.length) {
        window.clearInterval(tick);
      }
    }, CGS_INTERACTION_PRESET.typeSpeed);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const subtitle = document.querySelector('.hero-subtitle');
    const heroTitle = document.querySelector('.hero-title');

    if (subtitle) {
      const badge = document.createElement('span');
      badge.className = 'hero-availability';
      badge.textContent = 'Disponivel para projetos';
      subtitle.insertAdjacentElement('afterend', badge);
    }

    if (heroTitle) {
      heroTitle.classList.add('glitch-ready');
      heroTitle.setAttribute('data-text', (heroTitle.textContent || '').trim());

      heroTitle.addEventListener('mouseenter', function () {
        heroTitle.classList.remove('is-glitching');
        void heroTitle.offsetWidth;
        heroTitle.classList.add('is-glitching');
      });

      heroTitle.addEventListener('animationend', function () {
        heroTitle.classList.remove('is-glitching');
      });
    }

    // Delay to start after trailer intro ends.
    window.setTimeout(function () {
      runTypewriter(subtitle);
    }, CGS_INTERACTION_PRESET.typeDelay);
  });
})();

// ===== Stats counter =====
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const numbers = Array.from(document.querySelectorAll('.stat-number'));
    if (!numbers.length) return;

    let started = false;
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || started) return;
          started = true;

          numbers.forEach(function (el) {
            const raw = (el.textContent || '').trim();
            const target = parseInt(raw.replace(/\D/g, ''), 10);
            const suffix = raw.replace(/[0-9]/g, '');
            if (Number.isNaN(target)) return;

            const duration = 1200;
            const startTs = performance.now();

            function step(now) {
              const progress = Math.min((now - startTs) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(target * eased);
              el.textContent = String(current) + suffix;
              if (progress < 1) requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
          });

          observer.disconnect();
        });
      },
      { threshold: 0.45 }
    );

    const stats = document.querySelector('#sobre .stats');
    if (stats) observer.observe(stats);
  });
})();

// ===== Cursos summary counters =====
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const totalCourses = document.getElementById('summary-total-courses');
    const techCourses = document.getElementById('summary-tech-courses');
    const badges = document.getElementById('summary-badges');
    const certificados = document.getElementById('certificados');

    if (!certificados || (!totalCourses && !techCourses && !badges)) return;

    const lists = Array.from(certificados.querySelectorAll('.column ol'));
    const techList = certificados.querySelector('.column:first-of-type ol');
    const totalItems = lists.reduce(function (sum, list) {
      return sum + list.querySelectorAll('li').length;
    }, 0);
    const techItems = techList ? techList.querySelectorAll('li').length : 0;
    const badgeItems = document.querySelectorAll('.galeria_cursos a').length;

    if (totalCourses) totalCourses.textContent = String(totalItems) + '+';
    if (techCourses) techCourses.textContent = String(techItems) + '+';
    if (badges) badges.textContent = String(badgeItems) + '+';
  });
})();

// ===== Cursos em destaque (top relevantes + expandivel) =====
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const coursesPage = document.body && document.body.classList.contains('courses-page');
    if (!coursesPage) return;

    const certificados = document.getElementById('certificados');
    const filtros = document.getElementById('filtros');
    if (!certificados || !filtros) return;

    const techColumn = certificados.querySelector('.column:first-of-type ol');
    if (!techColumn || certificados.querySelector('.courses-featured')) return;

    const items = Array.from(techColumn.querySelectorAll('li'))
      .map(function (li) {
        return (li.textContent || '').trim();
      })
      .filter(Boolean);

    if (!items.length) return;

    const featuredItems = [
      'Bacharelado em Ciência de Dados - UNIVESP - (2023-2027)',
      'Técnico em Desenvolvimento de Sistemas - Escola Técnica FAT - (2024-2025)',
      'Técnico em Administração - SENAC - (2013)',
      'Técnico em Montagem e Manutenção de Micro - Trainee Course - (2010)',
      'Google Project Management - 06 cursos - CIEE/Google - (2023)',
      'Scrum Fundamentals Certified - SFC - VMEdu Scrum Study - (2023)',
      'Certificação - GitHub Foundations - GitHub/Credly - (2024)',
      'Six Sigma Yellow Belt Professional - VMEdu - (2024)'
    ];

    if (!featuredItems.length) return;

    const featured = document.createElement('section');
    featured.className = 'courses-featured';
    featured.setAttribute('aria-label', 'Formacao e certificacoes em destaque');

    const title = document.createElement('h3');
    title.textContent = 'Formacao e Certificacoes em destaque';
    featured.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'featured-course-list';

    featuredItems.forEach(function (entry, index) {
      const li = document.createElement('li');
      li.textContent = entry.replace(/;\s*$/, '');
      if (index >= 6) li.classList.add('is-hidden');
      list.appendChild(li);
    });

    featured.appendChild(list);

    if (featuredItems.length > 6) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'featured-toggle';
      toggle.textContent = 'Ver mais destaques';
      toggle.setAttribute('aria-expanded', 'false');

      toggle.addEventListener('click', function () {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        const next = !expanded;
        toggle.setAttribute('aria-expanded', String(next));
        toggle.textContent = next ? 'Mostrar menos' : 'Ver mais destaques';

        list.querySelectorAll('li').forEach(function (li, idx) {
          if (idx < 6) return;
          li.classList.toggle('is-hidden', !next);
        });
      });

      featured.appendChild(toggle);
    }

    filtros.insertAdjacentElement('afterend', featured);
  });
})();

// ===== Cursos ribbon de instituicoes =====
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const ribbon = document.querySelector('.courses-page .galeria1[data-ribbon]');
    if (!ribbon || ribbon.dataset.ribbonReady === 'true') return;

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = Array.from(ribbon.querySelectorAll(':scope > a'));
    if (!items.length) return;

    const track = document.createElement('div');
    track.className = 'galeria1-track';

    items.forEach(function (item) {
      track.appendChild(item);
    });

    items.forEach(function (item) {
      const clone = item.cloneNode(true);
      clone.classList.add('is-ribbon-clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      track.appendChild(clone);
    });

    ribbon.textContent = '';
    ribbon.appendChild(track);
    ribbon.dataset.ribbonReady = 'true';

    if (reduceMotion) {
      track.style.animation = 'none';
      ribbon.style.overflowX = 'auto';
      ribbon.style.maskImage = 'none';
      ribbon.style.webkitMaskImage = 'none';
    }
  });
})();

// ===== Custom crosshair cursor =====
(function () {
  const isDesktop = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (!isDesktop) return;

  document.addEventListener('DOMContentLoaded', function () {
    const cursor = document.createElement('span');
    cursor.className = 'custom-crosshair';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);

    function setState(target) {
      const interactive = target && target.closest && target.closest('a, button, input, textarea, select, .link_game, .video, .theme-toggle, .navegacao_link');
      cursor.classList.toggle('is-interactive', Boolean(interactive));
    }

    document.addEventListener('mousemove', function (event) {
      cursor.style.left = event.clientX + 'px';
      cursor.style.top = event.clientY + 'px';
      cursor.classList.add('is-visible');
      setState(event.target);
    });

    document.addEventListener('mouseover', function (event) {
      setState(event.target);
    });

    document.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-visible');
    });
  });
})();

// ===== Tech section card transformation =====
(function () {
  function normalizeLabel(value) {
    return (value || '')
      .replace(/\.[a-z]+$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function detectTechGroup(sectionTitle) {
    const title = (sectionTitle || '').toLowerCase();
    if (title.indexOf('linguagens') !== -1) return 'languages';
    if (title.indexOf('framework') !== -1) return 'frameworks';
    if (title.indexOf('outras') !== -1) return 'tools';
    return 'general';
  }

  function resolveTechLabel(sectionTitle, index, image) {
    const title = (sectionTitle || '').toLowerCase();
    const programming = ['C#', 'Python', 'HTML', 'CSS', 'JavaScript', 'SQL', 'Java'];
    const frameworks = ['.NET', 'Spring Boot', 'React'];
    const others = ['GitHub', 'Git', 'Markdown', 'Gemini', 'Copilot', 'ChatGPT', 'VS Code', 'Visual Studio', 'Windows', 'Linux'];

    if (title.indexOf('linguagens') !== -1) return programming[index] || 'Tech';
    if (title.indexOf('framework') !== -1) return frameworks[index] || 'Framework';
    if (title.indexOf('outras') !== -1) return others[index] || 'Tool';

    const srcParts = (image.getAttribute('src') || '').split('/');
    const fallback = srcParts[srcParts.length - 1] || image.getAttribute('alt') || 'tech';
    return normalizeLabel(image.getAttribute('alt') || fallback).slice(0, 18);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const gallery = document.querySelector('#tech-content .galeria_tech');
    if (!gallery || gallery.dataset.cardified === 'true') return;

    gallery.classList.add('tech-gallery-v3');

    const nodes = Array.from(gallery.childNodes);
    let currentGrid = null;
    let currentSectionTitle = '';
    let currentGroup = 'general';
    let currentIndex = 0;

    nodes.forEach(function (node) {
      if (node.nodeType === 1 && node.tagName === 'P') {
        currentSectionTitle = (node.textContent || '').trim();
        currentGroup = detectTechGroup(currentSectionTitle);
        currentIndex = 0;

        node.classList.add('tech-group-title', 'tech-group-title-' + currentGroup);

        currentGrid = document.createElement('div');
        currentGrid.className = 'tech-grid tech-grid-' + currentGroup;
        if (currentGroup === 'tools') {
          currentGrid.classList.add('tech-grid-tools');
        }
        node.insertAdjacentElement('afterend', currentGrid);
        return;
      }

      if (node.nodeType === 1 && node.tagName === 'IMG' && currentGrid) {
        const card = document.createElement('div');
        card.className = 'tech-card tech-card-' + currentGroup;
        card.style.setProperty('--tech-index', String(currentIndex));

        const clone = node.cloneNode(true);
        clone.setAttribute('loading', 'lazy');
        clone.setAttribute('decoding', 'async');

        const label = document.createElement('span');
        label.className = 'tech-card-label';
        label.textContent = resolveTechLabel(currentSectionTitle, currentIndex, clone);

        card.setAttribute('role', 'listitem');
        card.setAttribute('aria-label', label.textContent);
        currentIndex += 1;

        card.appendChild(clone);
        card.appendChild(label);
        currentGrid.appendChild(card);
        node.remove();
        return;
      }

      if (node.nodeType === 1 && node.tagName === 'BR') {
        node.remove();
      }
    });

    gallery.dataset.cardified = 'true';
  });
})();

// ===== Project cards metadata + smart videos =====
(function () {
  const projectMap = {
    worldwar: {
      status: 'Em evolucao',
      stack: ['Python', 'Flask', 'Socket'],
      case: {
        problem: 'Partidas online sincronizadas',
        solution: 'Matchmaking + regras de turno',
        result: 'MVP multiplayer funcional'
      }
    },
    appgestao: {
      status: 'Concluido',
      stack: ['.NET 8', 'SQL Server', 'JWT'],
      case: {
        problem: 'Gestao manual de equipe',
        solution: 'Plataforma web com KPIs e relatorios',
        result: 'Processo operacional centralizado'
      }
    },
    kidsrunner: {
      status: 'Concluido',
      stack: ['Python', 'Pygame', 'MediaPipe'],
      case: {
        problem: 'Gameplay infantil interativo',
        solution: 'Runner com gestos e pontuacao',
        result: 'Jogo jogavel com feedback em tempo real'
      }
    },
    'controle de acesso': {
      status: 'Concluido',
      stack: ['C#', 'Windows Forms'],
      case: {
        problem: 'Controle local sem padronizacao',
        solution: 'Aplicativo desktop para registros',
        result: 'Fluxo local mais confiavel'
      }
    },
    'j.a.r.v.i.s': {
      status: 'Concluido',
      stack: ['Python', 'Speech API'],
      case: {
        problem: 'Atalhos manuais para tarefas repetitivas',
        solution: 'Assistente por voz com automacoes',
        result: 'Execucao rapida de comandos cotidianos'
      }
    },
    'world war - game': {
      status: 'Concluido',
      stack: ['JavaScript', 'Game Logic'],
      case: {
        problem: 'Demonstrar logica de batalha por cartas',
        solution: 'Motor de rodada com regras de combate',
        result: 'Gameplay estavel para web'
      }
    },
    avatar: {
      status: 'Concluido',
      stack: ['JavaScript', 'IA', 'Search'],
      case: {
        problem: 'Busca tecnica com baixa contextualizacao',
        solution: 'Avatar + descricao por tecnologia',
        result: 'Experiencia de consulta mais didatica'
      }
    },
    'desafio do heroi': {
      status: 'Concluido',
      stack: ['JavaScript', 'UI Logic'],
      case: {
        problem: 'Classificacao de nivel sem padrao visual',
        solution: 'Formulario com regra de XP',
        result: 'Feedback imediato de nivel do usuario'
      }
    },
    'projeto pokedex': {
      status: 'Concluido',
      stack: ['JavaScript', 'PokeAPI'],
      case: {
        problem: 'Visualizar dados da API de forma clara',
        solution: 'Pokedex com detalhamento e filtros visuais',
        result: 'Consulta rapida de catalogo'
      }
    },
    codeverse: {
      status: 'Concluido',
      stack: ['HTML', 'CSS', 'JavaScript'],
      case: {
        problem: 'Explicar front, back e fullstack ao iniciante',
        solution: 'Site educativo com narrativa visual',
        result: 'Conteudo tecnico mais acessivel'
      }
    }
  };

  function getMeta(title) {
    const key = (title || '').toLowerCase();
    const found = Object.keys(projectMap).find(function (k) {
      return key.indexOf(k) !== -1;
    });
    return found
      ? projectMap[found]
      : {
          status: 'Concluido',
          stack: ['Web']
        };
  }

  document.addEventListener('DOMContentLoaded', function () {
    const cards = Array.from(document.querySelectorAll('#projetos .video-text-container'));

    cards.forEach(function (card) {
      const titleEl = card.querySelector('b');
      const paragraph = card.querySelector('p');
      if (!titleEl || !paragraph) return;

      if (!card.querySelector('.project-meta')) {
        const meta = getMeta(titleEl.textContent || '');
        const metaRow = document.createElement('span');
        metaRow.className = 'project-meta';

        const status = document.createElement('span');
        status.className = 'project-chip status';
        status.textContent = meta.status;
        metaRow.appendChild(status);

        meta.stack.forEach(function (tech) {
          const chip = document.createElement('span');
          chip.className = 'project-chip';
          chip.textContent = tech;
          metaRow.appendChild(chip);
        });

        titleEl.insertAdjacentElement('afterend', metaRow);
      }
    });

    const videos = Array.from(document.querySelectorAll('#projetos .video'));
    videos.forEach(function (video) {
      video.autoplay = false;
      video.removeAttribute('autoplay');
      video.preload = 'none';
      video.muted = true;
      video.loop = true;
      video.setAttribute('playsinline', '');
      video.pause();
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            const playAttempt = video.play();
            if (playAttempt && typeof playAttempt.catch === 'function') {
              playAttempt.catch(function () {});
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0.2, 0.55, 0.8] }
    );

    videos.forEach(function (video) {
      observer.observe(video);
    });
  });
})();

// ===== Game cards 3D tilt =====

// ===== Game cards 3D tilt =====
(function () {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Detecta mobile (tela até 900px ou touch)
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  if (reduceMotion || isMobile) return;

  document.addEventListener('DOMContentLoaded', function () {
    const cards = Array.from(document.querySelectorAll('.meus_jogos_container__jogo'));
    cards.forEach(function (card) {
      function onMove(event) {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * (CGS_INTERACTION_PRESET.tiltMaxDeg * 2);
        const rotateX = (0.5 - y) * (CGS_INTERACTION_PRESET.tiltMaxDeg * 2);
        card.style.transform = 'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg)';
        card.classList.add('is-tilting');
      }

      function reset() {
        card.style.transform = '';
        card.classList.remove('is-tilting');
      }

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', reset);
    });
  });
})();

// ===== Scroll Spy (active nav links) =====
(function () {
  const links = Array.from(document.querySelectorAll('.navegacao_link[href^="#"]'));
  const panels = links
    .map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);

  if (!links.length || !panels.length) return;

  const map = new Map();
  links.forEach(function (link) {
    map.set(link.getAttribute('href'), link);
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.remove('active');
        });
        const active = map.get('#' + entry.target.id);
        if (active) active.classList.add('active');
      });
    },
    { threshold: 0.35 }
  );

  panels.forEach(function (panel) {
    observer.observe(panel);
  });
})();

// ===== Cinematic GSAP + ScrollTrigger =====
(function () {
  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.banner');
  const heroContent = document.querySelector('.cinematic-content');
  const body = document.body;
  const root = document.documentElement;

  if (!window.gsap || !window.ScrollTrigger || prefersReduce || !hero || !heroContent) {
    document.querySelectorAll('.meus_jogos_container__jogo, .video-text-container').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  const panels = gsap.utils.toArray('.panel');
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  const panelRevealStart = isMobile ? 'top 88%' : 'top 82%';
  const cardRevealStart = isMobile ? 'top 86%' : 'top 78%';
  const videoRevealStart = isMobile ? 'top 90%' : 'top 84%';
  const parallaxFromSize = isMobile ? '106%' : '116%';
  const parallaxScrub = isMobile ? 0.7 : 1.2;
  const layerBackShift = isMobile ? 6 : 12;
  const layerMidShift = isMobile ? 10 : 18;
  const heroContentShift = isMobile ? 8 : 16;

  function setSceneByPanel(panel) {
    if (!panel || !panel.id) return;
    body.setAttribute('data-scene', panel.id);
    panels.forEach(function (item) {
      item.classList.remove('is-panel-active');
    });
    panel.classList.add('is-panel-active');
  }

  function splitTitleChars(selector) {
    const titles = Array.from(document.querySelectorAll(selector));

    titles.forEach(function (title) {
      if (title.dataset.splitReady === 'true') return;
      const text = title.textContent || '';
      const trimmed = text.trim();
      if (!trimmed) return;

      title.classList.add('split-title');
      title.setAttribute('aria-label', trimmed);
      title.textContent = '';

      trimmed.split('').forEach(function (char) {
        const span = document.createElement('span');
        span.className = 'split-char';
        if (char === ' ') {
          span.classList.add('space-char');
          span.textContent = '\u00A0';
        } else {
          span.textContent = char;
        }
        title.appendChild(span);
      });

      title.dataset.splitReady = 'true';
    });
  }

  splitTitleChars('.hero-title, section h2');

  const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  introTl
    .from('.cinematic-layer-back', { scale: 1.08, opacity: 0, duration: 1.4 })
    .from('.logo', { y: 50, opacity: 0, duration: 0.9 }, '-=1.0')
    .from('.hero-title .split-char', { y: 45, opacity: 0, duration: 0.65, stagger: 0.03 }, '-=0.55')
    .from('.hero-subtitle', { y: 25, opacity: 0, duration: 0.65 }, '-=0.45')
    .from('.social-icons a', { y: 18, opacity: 0, stagger: 0.1, duration: 0.45 }, '-=0.3')
    .from('.scroll-cue', { y: 10, opacity: 0, duration: 0.35 }, '-=0.2');

  panels.forEach(function (panel, index) {
    const panelContent = panel.querySelectorAll(':scope > *:not(.panel-wipe)');

    ScrollTrigger.create({
      trigger: panel,
      start: 'top 45%',
      end: 'bottom 45%',
      onEnter: function () {
        setSceneByPanel(panel);
      },
      onEnterBack: function () {
        setSceneByPanel(panel);
      }
    });

    if (panelContent.length) {
      gsap.fromTo(
        panelContent,
        { opacity: 0.72, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: panel,
            start: panelRevealStart,
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    if (index === 0) return;

    let wipe = panel.querySelector('.panel-wipe');
    if (!wipe) {
      wipe = document.createElement('div');
      wipe.className = 'panel-wipe';
      panel.prepend(wipe);
    }

    gsap.fromTo(
      wipe,
      { yPercent: 0, opacity: 0.95 },
      {
        yPercent: -110,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: panel,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  gsap.to(root, {
    '--cinema-bar-size': '18px',
    ease: 'none',
    scrollTrigger: {
      trigger: '#sobre',
      start: 'top 85%',
      end: 'top 35%',
      scrub: true
    }
  });

  gsap.to(root, {
    '--cinema-bar-size': '6px',
    ease: 'none',
    scrollTrigger: {
      trigger: 'footer',
      start: 'top 78%',
      end: 'top 25%',
      scrub: true
    }
  });

  gsap.to(root, {
    '--hero-pulse': 0.55,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });

  gsap.to('.cinematic-layer-back', {
    yPercent: layerBackShift,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2
    }
  });

  gsap.to('.cinematic-layer-mid', {
    yPercent: layerMidShift,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.6
    }
  });

  gsap.to(heroContent, {
    yPercent: heroContentShift,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.3
    }
  });

  mm.add('(min-width: 901px)', function () {
    gsap.fromTo(
      '#sobre .container-sobre',
      { y: 36, opacity: 0.88 },
      {
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#sobre',
          start: 'top 82%',
          end: 'top 38%',
          scrub: 0.45
        }
      }
    );
  });

  gsap.utils.toArray('section h2').forEach(function (title) {
    const chars = title.querySelectorAll('.split-char');
    if (!chars.length) return;

    gsap.from(chars, {
      yPercent: 100,
      opacity: 0,
      duration: 0.72,
      stagger: 0.015,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 82%',
        once: true
      }
    });
  });

  gsap.to('.meus_jogos_container__jogo', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#meus_jogos',
      start: cardRevealStart
    }
  });

  gsap.utils.toArray('.video-text-container').forEach(function (item) {
    gsap.fromTo(
      item,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: videoRevealStart,
          toggleActions: 'play none none none'
        }
      }
    );
  });

  gsap.utils.toArray('#projetos .video').forEach(function (video) {
    gsap.fromTo(
      video,
      {
        filter: 'saturate(1.06) contrast(1.02)'
      },
      {
        filter: 'saturate(1) contrast(1)',
        ease: 'power2.out',
        scrollTrigger: {
          trigger: video,
          start: videoRevealStart,
          end: 'top 35%',
          scrub: 1.1
        }
      }
    );
  });

  gsap.utils.toArray('[data-parallax]').forEach(function (section) {
    gsap.fromTo(
      section,
      { backgroundSize: parallaxFromSize },
      {
        backgroundSize: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: parallaxScrub
        }
      }
    );
  });

  window.addEventListener(
    'scroll',
    function () {
      if (window.scrollY <= 8) {
        gsap.set(heroContent, { opacity: 1 });
      }
    },
    { passive: true }
  );
})();
