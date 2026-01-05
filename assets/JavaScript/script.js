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

// Executar ao carregar a página
document.addEventListener('DOMContentLoaded', checkScrollPosition);

// ===== Reading Progress Bar =====
window.addEventListener('scroll', function() {
  const progressBar = document.getElementById('progress-bar');
  if (!progressBar) return;
  
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight - windowHeight;
  const scrolled = window.scrollY;
  const progress = (scrolled / documentHeight) * 100;
  
  progressBar.style.width = progress + '%';
  progressBar.setAttribute('aria-valuenow', Math.round(progress));
}, { passive: true });

// ===== Theme Toggle (Light/Dark) =====
(function(){
  const THEME_KEY = 'cgs_theme';
  const btn = document.getElementById('theme-toggle');
  const label = document.getElementById('theme-label');

  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch(e){}
    if (label) label.textContent = theme === 'dark' ? '🌙 Escuro' : '☀️ Claro';
    if (btn) btn.setAttribute('aria-pressed', String(theme === 'dark'));
    
    // Trocar logo conforme o tema
    const footerLogo = document.querySelector('footer .logo');
    if (footerLogo) {
      if (theme === 'light') {
        footerLogo.src = './assets/images/logo.black.png';
      } else {
        footerLogo.src = './assets/images/logo.png';
      }
    }
    
    // Trocar imagem de fundo conforme o tema
    const meusJogos = document.getElementById('meus_jogos');
    if (meusJogos) {
      if (theme === 'light') {
        meusJogos.style.backgroundImage = 'url("./assets/images/codigosClean.jpg")';
      } else {
        meusJogos.style.backgroundImage = 'url("./assets/images/codigos.jpeg")';
      }
    }
  }

  function getInitialTheme(){
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch(e){}
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  function toggleTheme(){
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  document.addEventListener('DOMContentLoaded', function(){
    const initial = getInitialTheme();
    applyTheme(initial);
    if (btn) btn.addEventListener('click', toggleTheme);
  });
})();

// ===== Email Link: mailto + fallback =====
document.addEventListener('DOMContentLoaded', function(){
  const emailLink = document.getElementById('email-link');
  if (!emailLink) return;
  const mailto = 'mailto:garcia.mar.mil@gmail.com?subject=Contato%20Portf%C3%B3lio&body=Ol%C3%A1%20Carlos,%20tudo%20bem?';
  const gmailFallback = 'https://mail.google.com/mail/?view=cm&fs=1&to=garcia.mar.mil@gmail.com&su=Contato%20Portf%C3%B3lio&body=Ol%C3%A1%20Carlos,%20tudo%20bem?';

  emailLink.addEventListener('click', function(ev){
    ev.preventDefault();
    try { window.location.href = mailto; } catch(e) {}
    setTimeout(function(){
      if (document.hasFocus()) {
        window.open(gmailFallback, '_blank', 'noopener');
      }
    }, 400);
  });
});

// ===== Parallax Backgrounds =====
(function(){
  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = () => window.innerWidth <= 768;
  let ticking = false;

  const elements = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!elements.length) return;

  function update(){
    const disable = prefersReduce || isSmall();
    elements.forEach(el => {
      if (disable) {
        el.style.backgroundPosition = 'center center';
        return;
      }
      const speed = parseFloat(el.dataset.parallax) || 0.25;
      const rect = el.getBoundingClientRect();
      const offset = rect.top;
      const move = -offset * speed;
      el.style.backgroundPosition = `center calc(50% + ${move}px)`;
    });
    ticking = false;
  }

  function onScroll(){
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();