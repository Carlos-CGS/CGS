// Renderiza a pagina CodeVerse: abas por ano, introducao, indicadores, temas abordados,
// codigo em destaque, catalogo de artigos (filtro por mes + busca) e chamada final.
// Tudo a partir de window.CGS_CODEVERSE (fonte unica de dados por ano).
(function () {
  const data = window.CGS_CODEVERSE;
  const resultsEl = document.getElementById('codeverse-results');
  if (!data || !resultsEl) return;

  const tabs = Array.from(document.querySelectorAll('.codeverse-tab'));
  const coverImg = document.getElementById('codeverse-cover');
  const titleEl = document.getElementById('codeverse-year-title');
  const taglineEl = document.getElementById('codeverse-year-tagline');
  const descEl = document.getElementById('codeverse-year-description');
  const highlightsEl = document.getElementById('codeverse-year-highlights');
  const awardEl = document.getElementById('codeverse-year-award');
  const closingEl = document.getElementById('codeverse-year-closing');
  const statsEl = document.getElementById('codeverse-year-stats');
  const ctasEl = document.getElementById('codeverse-year-ctas');
  const codeSectionEl = document.getElementById('codeverse-code');

  const indicatorsSection = document.getElementById('codeverse-indicators');
  const indicatorsGrid = document.getElementById('codeverse-indicators-grid');
  const topicsSection = document.getElementById('codeverse-topics');
  const topicsGrid = document.getElementById('codeverse-topics-grid');
  const finalCtaSection = document.getElementById('codeverse-final-cta');
  const finalCtaTitleEl = document.getElementById('codeverse-final-cta-title');
  const finalCtaTextEl = document.getElementById('codeverse-final-cta-text');
  const finalCtaButtonsEl = document.getElementById('codeverse-final-cta-buttons');

  const articlesTitleEl = document.getElementById('codeverse-articles-title');
  const articlesDescEl = document.getElementById('codeverse-articles-desc');
  const articlesStatsEl = document.getElementById('codeverse-articles-stats');
  const monthFilterEl = document.getElementById('codeverse-month-filter');
  const monthButtons = monthFilterEl ? Array.from(monthFilterEl.querySelectorAll('.codeverse-filter-btn')) : [];
  const searchLabelEl = document.getElementById('codeverse-search-label');
  const searchInput = document.getElementById('codeverse-search');
  const noResultsEl = document.getElementById('codeverse-no-results');

  const DEFAULT_SEARCH_LABEL = 'Pesquisar artigo';
  const DEFAULT_SEARCH_PLACEHOLDER = 'Buscar por título ou palavra-chave';
  const DEFAULT_NO_RESULTS = 'Nenhum artigo encontrado com os filtros selecionados.';

  const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Estado da secao de artigos (por ano ativo)
  let currentArticles = [];
  let currentYearData = null;
  let currentMonthFilter = 'all';

  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '');
  }

  function getMonthIndex(article) {
    const parts = article.date.split('/');
    return parseInt(parts[1], 10) - 1;
  }

  function getArticleByNumber(articles, number) {
    return articles.find(function (article) { return article.number === number; }) || null;
  }

  // Estado de carregamento (shimmer) + fallback visual discreto quando a capa nao carrega.
  // As capas do CodeVerse2026 vem de outro repositorio e podem demorar pra baixar; o shimmer
  // deixa claro que a imagem esta a caminho, em vez de um retangulo cinza parado (que parece quebrado).
  function attachImageLifecycle(img, wrapper) {
    function clearLoading() {
      wrapper.classList.remove('is-loading');
    }
    img.addEventListener('load', clearLoading, { once: true });
    img.addEventListener('error', function handleError() {
      img.removeEventListener('error', handleError);
      clearLoading();
      img.style.display = 'none';
      wrapper.classList.add('is-broken');
    }, { once: true });
    // Cache hit: a imagem pode ja estar completa no momento em que o listener e anexado.
    if (img.complete && img.naturalWidth > 0) clearLoading();
  }

  function buildCoverFigure(src, alt, extraClass, eager, objectPosition) {
    const wrapper = document.createElement('div');
    wrapper.className = 'codeverse-cover-frame' + (extraClass ? ' ' + extraClass : '');
    if (!src) {
      wrapper.classList.add('is-broken');
      return wrapper;
    }
    wrapper.classList.add('is-loading');
    const img = document.createElement('img');
    img.alt = alt || '';
    img.loading = eager ? 'eager' : 'lazy';
    img.decoding = 'async';
    // Ajuste fino de enquadramento por artigo (ex.: capa com informacao importante perto da
    // borda), sem precisar criar uma regra CSS nova para cada imagem.
    if (objectPosition) img.style.objectPosition = objectPosition;
    attachImageLifecycle(img, wrapper);
    img.src = src;
    wrapper.appendChild(img);
    return wrapper;
  }

  // ---- Cabecalho da secao de artigos (titulo, descricao e contadores automaticos) ----
  function renderArticlesHeader(yearData, articles) {
    if (articlesTitleEl) articlesTitleEl.textContent = yearData.label || yearData.intro.title;

    const monthsWithArticles = new Set(articles.map(getMonthIndex));
    const monthsCount = monthsWithArticles.size;
    const publishedArticles = articles.filter(function (a) { return !a.comingSoon; });
    const articlesCount = publishedArticles.length;
    const cadenceLabel = yearData.cadenceLabel || 'semanal sobre Python e desenvolvimento';

    if (articlesDescEl) {
      articlesDescEl.textContent = articlesCount
        ? `${articlesCount} artigo${articlesCount === 1 ? '' : 's'} publicado${articlesCount === 1 ? '' : 's'} ao longo de ${monthsCount} ${monthsCount === 1 ? 'mês' : 'meses'}, com conteúdo ${cadenceLabel}.`
        : 'Nenhum artigo publicado ainda nesta temporada. Volte em breve para conferir as novidades.';
    }

    if (articlesStatsEl) {
      articlesStatsEl.innerHTML = '';
      const chips = [
        { label: 'meses com conteúdo', value: String(monthsCount) },
        { label: 'artigos publicados', value: String(articlesCount) },
        { label: 'status', value: yearData.status || '—' }
      ];
      chips.forEach(function (chip) {
        const el = document.createElement('span');
        el.className = 'codeverse-stat-chip';
        const strong = document.createElement('strong');
        strong.textContent = chip.value;
        el.appendChild(strong);
        el.appendChild(document.createTextNode(' ' + chip.label));
        articlesStatsEl.appendChild(el);
      });
    }
  }

  // ---- Card de artigo no formato "linha do tempo simples" (CodeVerse Python 2025) ----
  function buildCardSimple(article) {
    const card = document.createElement('a');
    card.className = 'codeverse-card';
    card.href = article.link;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.setAttribute('aria-label', 'Artigo #' + article.number + ': ' + article.title + '. Ler no LinkedIn.');

    const top = document.createElement('div');
    top.className = 'codeverse-card-top';

    const number = document.createElement('span');
    number.className = 'codeverse-card-number';
    number.textContent = '#' + article.number;
    number.setAttribute('aria-hidden', 'true');

    const arrow = document.createElement('span');
    arrow.className = 'codeverse-card-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';

    top.appendChild(number);
    top.appendChild(arrow);

    const title = document.createElement('h4');
    title.className = 'codeverse-card-title';
    title.textContent = article.title;

    const meta = document.createElement('div');
    meta.className = 'codeverse-card-meta';

    const date = document.createElement('span');
    date.className = 'codeverse-card-date';
    date.textContent = article.date;
    meta.appendChild(date);

    // Categoria/tecnologia: so exibida se o dado ja existir no artigo (nao inventamos valor).
    if (article.tag) {
      const tag = document.createElement('span');
      tag.className = 'codeverse-card-tag';
      tag.textContent = article.tag;
      meta.appendChild(tag);
    }

    const read = document.createElement('span');
    read.className = 'codeverse-card-read';
    read.textContent = 'Ler artigo';
    meta.appendChild(read);

    card.appendChild(top);
    card.appendChild(title);
    card.appendChild(meta);
    return card;
  }

  // ---- Card de artigo "rico" (CodeVerse2026): capa, numero, titulo, data, tipo,
  // botao "Ler conteudo", botao opcional "Assistir video" e estado "Em breve".
  // Nao e um <a> unico (pode ter dois links), entao o card em si e um container acessivel,
  // com botoes proprios focaveis via teclado (nada de link aninhado dentro de link).
  function buildCardRich(article) {
    const card = document.createElement('article');
    card.className = 'codeverse-card codeverse-card--rich';
    if (article.comingSoon) card.classList.add('is-coming-soon');

    const cover = buildCoverFigure(article.cover, article.title, 'codeverse-card-cover', false, article.coverPosition);
    card.appendChild(cover);

    const body = document.createElement('div');
    body.className = 'codeverse-card-body';

    const top = document.createElement('div');
    top.className = 'codeverse-card-top';

    const number = document.createElement('span');
    number.className = 'codeverse-card-number';
    number.textContent = '#' + article.number;
    top.appendChild(number);

    if (article.comingSoon) {
      const soon = document.createElement('span');
      soon.className = 'codeverse-card-soon';
      soon.textContent = 'Em breve';
      top.appendChild(soon);
    } else if (article.tag) {
      const tag = document.createElement('span');
      tag.className = 'codeverse-card-tag';
      tag.textContent = article.tag;
      top.appendChild(tag);
    }

    body.appendChild(top);

    const title = document.createElement('h4');
    title.className = 'codeverse-card-title';
    title.textContent = article.title;
    // O card limita o titulo visualmente a 2 linhas (line-clamp); o atributo title garante
    // que o texto completo continue acessivel (tooltip nativo / leitura via longo toque).
    title.title = article.title;
    body.appendChild(title);

    const date = document.createElement('span');
    date.className = 'codeverse-card-date';
    date.textContent = article.date;
    body.appendChild(date);

    const actions = document.createElement('div');
    actions.className = 'codeverse-card-actions';

    if (article.link) {
      const read = document.createElement('a');
      read.className = 'codeverse-card-btn codeverse-card-btn--primary';
      read.href = article.link;
      read.target = '_blank';
      read.rel = 'noopener noreferrer';
      read.textContent = 'Ler conteúdo';
      read.setAttribute('aria-label', 'Ler conteúdo: ' + article.title);
      actions.appendChild(read);
    }

    if (article.video) {
      const watch = document.createElement('a');
      watch.className = 'codeverse-card-btn codeverse-card-btn--ghost';
      watch.href = article.video;
      watch.target = '_blank';
      watch.rel = 'noopener noreferrer';
      watch.textContent = 'Assistir vídeo';
      watch.setAttribute('aria-label', 'Assistir vídeo: ' + article.title);
      actions.appendChild(watch);
    }

    if (!article.link && !article.video) {
      const soonNote = document.createElement('span');
      soonNote.className = 'codeverse-card-soon-note';
      soonNote.textContent = 'Conteúdo em breve.';
      actions.appendChild(soonNote);
    }

    body.appendChild(actions);
    card.appendChild(body);
    return card;
  }

  function buildCardGrid(articles, builder) {
    const grid = document.createElement('div');
    grid.className = 'codeverse-card-grid';
    articles.forEach(function (article) {
      grid.appendChild(builder(article));
    });
    return grid;
  }

  // ---- Mostra apenas os botoes de mes que tem pelo menos um conteudo cadastrado ----
  function updateMonthButtonsVisibility(articles) {
    const monthsWithContent = new Set(articles.map(getMonthIndex));
    monthButtons.forEach(function (btn) {
      if (btn.dataset.month === 'all') return;
      const monthIdx = Number(btn.dataset.month);
      const hasContent = monthsWithContent.has(monthIdx);
      btn.hidden = !hasContent;
      if (!hasContent && btn.classList.contains('is-active')) {
        currentMonthFilter = 'all';
      }
    });
  }

  // ---- Aplica filtro de mes + busca sobre o ano ativo e renderiza o resultado ----
  function applyFiltersAndRender() {
    const searchTerm = normalize(searchInput ? searchInput.value : '');
    const isRich = !!(currentYearData && Array.isArray(currentYearData.temas) && currentYearData.temas.length);
    const builder = isRich ? buildCardRich : buildCardSimple;

    const filtered = currentArticles.filter(function (article) {
      const matchesMonth = currentMonthFilter === 'all' || getMonthIndex(article) === Number(currentMonthFilter);
      const haystack = normalize(
        article.title + ' ' + (article.tag || '') + ' ' + (article.project || '') +
        ' ' + (Array.isArray(article.tecnologias) ? article.tecnologias.join(' ') : '')
      );
      const matchesSearch = !searchTerm || haystack.includes(searchTerm);
      return matchesMonth && matchesSearch;
    });

    resultsEl.innerHTML = '';

    if (!filtered.length) {
      resultsEl.hidden = true;
      if (noResultsEl) noResultsEl.hidden = false;
      return;
    }

    resultsEl.hidden = false;
    if (noResultsEl) noResultsEl.hidden = true;

    if (currentMonthFilter === 'all') {
      // Agrupa por mes; meses sem conteudo (apos o filtro de busca) simplesmente nao aparecem.
      const byMonth = {};
      filtered.forEach(function (article) {
        const idx = getMonthIndex(article);
        if (!byMonth[idx]) byMonth[idx] = [];
        byMonth[idx].push(article);
      });

      Object.keys(byMonth)
        .map(Number)
        .sort(function (a, b) { return a - b; })
        .forEach(function (monthIdx) {
          const monthArticles = byMonth[monthIdx];
          const group = document.createElement('section');
          group.className = 'codeverse-month-group';
          group.setAttribute('aria-label', MONTHS[monthIdx]);

          const heading = document.createElement('h3');
          heading.className = 'codeverse-month-group-title';
          const yearOfMonth = monthArticles[0].date.split('/')[2];
          heading.textContent = MONTHS[monthIdx] + ' ' + yearOfMonth + ' ';

          const count = document.createElement('span');
          count.className = 'codeverse-month-group-count';
          // "artigo(s)" quando todo o grupo e do tipo Artigo (ou nao tem "tag", caso do
          // CodeVerse Python 2025, que so publica artigos); "conteudo(s)" quando ha tipos
          // diferentes misturados (ex.: Artigo + Post) no mesmo mes.
          const allArticles = monthArticles.every(function (a) { return !a.tag || a.tag === 'Artigo'; });
          const noun = allArticles ? 'artigo' : 'conteúdo';
          count.textContent = monthArticles.length + ' ' + noun + (monthArticles.length === 1 ? '' : 's');
          heading.appendChild(count);

          group.appendChild(heading);
          group.appendChild(buildCardGrid(monthArticles, builder));
          resultsEl.appendChild(group);
        });
    } else {
      // Mes especifico ja selecionado: grade direta, sem cabecalho de mes repetido.
      resultsEl.appendChild(buildCardGrid(filtered, builder));
    }
  }

  function setActiveMonthButton(monthValue) {
    monthButtons.forEach(function (btn) {
      const isActive = btn.dataset.month === monthValue;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  monthButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.hidden) return;
      currentMonthFilter = btn.dataset.month;
      setActiveMonthButton(currentMonthFilter);
      applyFiltersAndRender();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFiltersAndRender);
  }

  function renderArticlesSection(yearData) {
    currentArticles = Array.isArray(yearData.articles) ? yearData.articles : [];
    currentYearData = yearData;
    currentMonthFilter = 'all';
    if (searchInput) searchInput.value = '';

    if (searchLabelEl) searchLabelEl.textContent = yearData.searchLabel || DEFAULT_SEARCH_LABEL;
    if (searchInput) {
      searchInput.placeholder = yearData.searchPlaceholder || DEFAULT_SEARCH_PLACEHOLDER;
      searchInput.setAttribute('aria-label', yearData.searchLabel || DEFAULT_SEARCH_LABEL);
    }
    if (noResultsEl) noResultsEl.textContent = yearData.noResultsLabel || DEFAULT_NO_RESULTS;

    updateMonthButtonsVisibility(currentArticles);
    setActiveMonthButton('all');
    renderArticlesHeader(yearData, currentArticles);
    applyFiltersAndRender();
  }

  // ---- 2. Indicadores do projeto: cards compactos com dados calculados a partir dos artigos ----
  function renderIndicators(yearData, articles) {
    if (!indicatorsSection || !indicatorsGrid) return;
    // Indicadores so fazem sentido para temporadas com esse formato de apresentacao
    // (ex.: CodeVerse2026); o CodeVerse Python 2025 usa seu proprio resumo (highlights + selo).
    const temas = Array.isArray(yearData.temas) ? yearData.temas : [];
    if (!temas.length) {
      indicatorsSection.hidden = true;
      return;
    }

    const publishedCount = articles.filter(function (a) { return !a.comingSoon; }).length;
    const anos = new Set(articles.map(function (a) { return a.date.split('/')[2]; }));
    const anoLabel = anos.size === 1 ? Array.from(anos)[0] : Array.from(anos).join('–');

    indicatorsGrid.innerHTML = '';
    const items = [
      { value: String(publishedCount), label: publishedCount === 1 ? 'artigo publicado' : 'artigos publicados' },
      { value: 'Quinzenal', label: 'frequência de publicação' },
      { value: anoLabel, label: 'ano do projeto' }
    ];

    items.forEach(function (item) {
      const card = document.createElement('div');
      card.className = 'codeverse-indicator-card';
      const strong = document.createElement('strong');
      strong.textContent = item.value;
      const span = document.createElement('span');
      span.textContent = item.label;
      card.appendChild(strong);
      card.appendChild(span);
      indicatorsGrid.appendChild(card);
    });

    const statusCard = document.createElement('div');
    statusCard.className = 'codeverse-indicator-card codeverse-indicator-card--status';
    const dot = document.createElement('span');
    dot.className = 'codeverse-indicator-dot';
    dot.setAttribute('aria-hidden', 'true');
    const statusText = document.createElement('span');
    statusText.textContent = yearData.status || 'Em andamento';
    statusCard.appendChild(dot);
    statusCard.appendChild(statusText);
    indicatorsGrid.appendChild(statusCard);

    indicatorsSection.hidden = false;
  }

  // ---- 3. Temas abordados: grade compacta de tags (sem linha do tempo) ----
  function renderTopics(yearData) {
    if (!topicsSection || !topicsGrid) return;
    const temas = Array.isArray(yearData.temas) ? yearData.temas : [];
    if (!temas.length) {
      topicsSection.hidden = true;
      return;
    }
    topicsGrid.innerHTML = '';
    temas.forEach(function (tema) {
      const chip = document.createElement('span');
      chip.className = 'codeverse-topic-chip';
      chip.textContent = tema;
      topicsGrid.appendChild(chip);
    });
    topicsSection.hidden = false;
  }

  // ---- Botoes de chamada da apresentacao ("Ver artigos" / "Ver repositorio") ----
  function renderCtas(yearData) {
    if (!ctasEl) return;
    const ctas = Array.isArray(yearData.intro && yearData.intro.ctas) ? yearData.intro.ctas : [];
    if (!ctas.length) {
      ctasEl.hidden = true;
      ctasEl.innerHTML = '';
      return;
    }
    ctasEl.innerHTML = '';
    ctas.forEach(function (cta) {
      const link = document.createElement('a');
      link.className = 'codeverse-cta-btn';
      link.textContent = cta.label;
      if (cta.type === 'scroll' && cta.target) {
        link.href = cta.target;
        link.addEventListener('click', function (event) {
          const target = document.querySelector(cta.target);
          if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      } else {
        link.href = cta.href || '#';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      ctasEl.appendChild(link);
    });
    ctasEl.hidden = false;
  }

  // ---- 6. Chamada final ----
  function renderFinalCta(yearData) {
    if (!finalCtaSection) return;
    const cta = yearData.ctaFinal;
    if (!cta) {
      finalCtaSection.hidden = true;
      return;
    }
    if (finalCtaTitleEl) finalCtaTitleEl.textContent = cta.title || '';
    if (finalCtaTextEl) finalCtaTextEl.textContent = cta.text || '';
    if (finalCtaButtonsEl) {
      finalCtaButtonsEl.innerHTML = '';
      (cta.buttons || []).forEach(function (btn) {
        if (!btn.href) return;
        const link = document.createElement('a');
        link.className = 'codeverse-cta-btn';
        link.href = btn.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = btn.label;
        finalCtaButtonsEl.appendChild(link);
      });
    }
    finalCtaSection.hidden = false;
  }

  function renderYear(year) {
    const yearData = data[year];
    if (!yearData) return;

    if (coverImg) {
      if (yearData.cover) {
        coverImg.src = yearData.cover;
        coverImg.alt = yearData.intro.title;
        coverImg.style.display = '';
      } else {
        coverImg.removeAttribute('src');
        coverImg.style.display = 'none';
      }
    }

    if (titleEl) titleEl.textContent = yearData.intro.title;

    if (taglineEl) {
      if (yearData.intro.tagline) {
        taglineEl.textContent = yearData.intro.tagline;
        taglineEl.hidden = false;
      } else {
        taglineEl.textContent = '';
        taglineEl.hidden = true;
      }
    }

    if (descEl) {
      descEl.innerHTML = '';
      (yearData.intro.description || []).forEach(function (paragraph) {
        const p = document.createElement('p');
        p.textContent = paragraph;
        descEl.appendChild(p);
      });
    }

    if (highlightsEl) {
      highlightsEl.innerHTML = '';
      (yearData.intro.highlights || []).forEach(function (item) {
        const card = document.createElement('div');
        card.className = 'codeverse-highlight';

        const icon = document.createElement('span');
        icon.className = 'codeverse-highlight-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = item.icon || '✨';

        const body = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = item.title;
        const text = document.createElement('span');
        text.textContent = item.text;
        body.appendChild(title);
        body.appendChild(text);

        card.appendChild(icon);
        card.appendChild(body);
        highlightsEl.appendChild(card);
      });
    }

    // Selo de premiacao/indicacao (ex.: DIO Awards): so aparece quando a temporada tiver esse dado.
    if (awardEl) {
      awardEl.innerHTML = '';
      const award = yearData.award;
      if (award) {
        awardEl.hidden = false;

        if (award.image) {
          const img = document.createElement('img');
          img.className = 'codeverse-award-image';
          img.src = award.image;
          img.alt = award.imageAlt || '';
          img.loading = 'lazy';
          awardEl.appendChild(img);
        }

        const body = document.createElement('div');

        const title = document.createElement('strong');
        title.className = 'codeverse-award-title';
        title.textContent = award.title;
        body.appendChild(title);

        const text = document.createElement('p');
        text.className = 'codeverse-award-text';
        text.textContent = award.text;
        body.appendChild(text);

        if (award.repoUrl) {
          const link = document.createElement('a');
          link.className = 'codeverse-award-link';
          link.href = award.repoUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = award.repoLabel || 'Repositório no GitHub';
          const arrow = document.createElement('span');
          arrow.setAttribute('aria-hidden', 'true');
          arrow.textContent = '→';
          link.appendChild(arrow);
          body.appendChild(link);
        }

        awardEl.appendChild(body);
      } else {
        awardEl.hidden = true;
      }
    }

    if (closingEl) {
      closingEl.textContent = yearData.intro.closing || '';
      closingEl.style.display = yearData.intro.closing ? '' : 'none';
    }

    if (statsEl) {
      statsEl.innerHTML = '';
      if (yearData.intro.stats) {
        const badge = document.createElement('div');
        badge.className = 'codeverse-stat-badge';
        const value = document.createElement('strong');
        value.textContent = yearData.intro.stats.value;
        const label = document.createElement('span');
        label.textContent = yearData.intro.stats.label;
        badge.appendChild(value);
        badge.appendChild(label);
        statsEl.appendChild(badge);
      }
    }

    renderCtas(yearData);

    if (codeSectionEl) {
      codeSectionEl.innerHTML = '';
      const sample = yearData.codeSample;
      const hasSample = !!(sample && sample.code);
      codeSectionEl.hidden = !hasSample;
      if (hasSample) {
        const wrapper = document.createElement('div');
        wrapper.className = 'codeverse-code-card';

        const header = document.createElement('div');
        header.className = 'codeverse-code-header';

        const headerText = document.createElement('div');
        const title = document.createElement('h3');
        title.textContent = sample.title;
        const desc = document.createElement('p');
        desc.textContent = sample.description;
        headerText.appendChild(title);
        headerText.appendChild(desc);

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'codeverse-copy-btn';
        copyBtn.textContent = 'Copiar código';
        copyBtn.addEventListener('click', function () {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(sample.code).then(function () {
              copyBtn.textContent = 'Copiado!';
              setTimeout(function () { copyBtn.textContent = 'Copiar código'; }, 1800);
            }).catch(function () {});
          }
        });

        header.appendChild(headerText);
        header.appendChild(copyBtn);

        const pre = document.createElement('pre');
        pre.className = 'codeverse-code-block line-numbers';
        const code = document.createElement('code');
        code.className = 'language-' + (sample.language || 'python');
        code.textContent = sample.code;
        pre.appendChild(code);

        wrapper.appendChild(header);
        wrapper.appendChild(pre);
        codeSectionEl.appendChild(wrapper);

        if (window.Prism) {
          window.Prism.highlightElement(code);
        }
      }
    }

    const articles = Array.isArray(yearData.articles) ? yearData.articles : [];
    renderIndicators(yearData, articles);
    renderTopics(yearData);
    renderArticlesSection(yearData);
    renderFinalCta(yearData);
  }

  function setActiveTab(year) {
    tabs.forEach(function (tab) {
      const isActive = tab.dataset.year === String(year);
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const year = tab.dataset.year;
      setActiveTab(year);
      renderYear(year);
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  setActiveTab('2025');
  renderYear('2025');
})();
