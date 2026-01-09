(function(){
  // Executa somente na página de cursos
  const certificadosSection = document.getElementById('certificados');
  if (!certificadosSection) return;

  const yearSelect = document.getElementById('filter-year');
  const typeSelect = document.getElementById('filter-type');
  const langSelect = document.getElementById('filter-lang');
  const textInput = document.getElementById('filter-text');
  const clearBtn = document.getElementById('filter-clear');
  const countEl = document.getElementById('filter-count');

  // Seleciona todos os itens das duas colunas
  const items = Array.from(certificadosSection.querySelectorAll('.column ol li'));

  // Palavras-chave para linguagem/área
  const LANG_KEYWORDS = [
    {key:'python', labels:['python']},
    {key:'dotnet', labels:['.net','c#','net']},
    {key:'javascript', labels:['javascript','js']},
    {key:'java', labels:['java']},
    {key:'kotlin', labels:['kotlin']},
    {key:'sql', labels:['sql','banco de dados']},
    {key:'azure', labels:['azure']},
    {key:'ia', labels:['inteligência artificial','ai','copilot','gemini','chatgpt','claude']},
    {key:'scrum', labels:['scrum']},
    {key:'gestao', labels:['gestão','liderança','projetos']}
  ];

  // Palavras-chave para tipo
  const TYPE_KEYWORDS = [
    {key:'bootcamp', labels:['bootcamp']},
    {key:'certificacao', labels:['certificação','certificate','certified']},
    {key:'formacao', labels:['formação']},
    {key:'curso', labels:['curso']}
  ];

  function normalize(str){
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu,'');
  }

  function parseYear(text){
    const m = text.match(/\((\d{4})\)/);
    return m ? m[1] : '';
  }

  function detectByKeywords(text, groups){
    const n = normalize(text);
    for(const g of groups){
      for(const lbl of g.labels){
        if(n.includes(normalize(lbl))) return g.key;
      }
    }
    return '';
  }

  function getMeta(li){
    const text = li.textContent || '';
    return {
      year: parseYear(text),
      type: detectByKeywords(text, TYPE_KEYWORDS),
      lang: detectByKeywords(text, LANG_KEYWORDS),
    };
  }

  // Build dynamic options from items
  const years = new Set();
  const types = new Set();
  const langs = new Set();

  items.forEach(li => {
    const m = getMeta(li);
    if(m.year) years.add(m.year);
    if(m.type) types.add(m.type);
    if(m.lang) langs.add(m.lang);
    li.dataset.text = normalize(li.textContent || '');
    // guarda nos data-attributes para acelerar o filtro
    if(m.year) li.dataset.year = m.year;
    if(m.type) li.dataset.type = m.type;
    if(m.lang) li.dataset.lang = m.lang;
  });

  function fillSelect(select, values, mapper){
    const sorted = Array.from(values).sort();
    sorted.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = mapper ? mapper(v) : v;
      select.appendChild(opt);
    });
  }

  fillSelect(yearSelect, years);
  fillSelect(typeSelect, types, (v)=>{
    const map = {bootcamp:'Bootcamp', certificacao:'Certificação', formacao:'Formação', curso:'Curso'};
    return map[v] || v;
  });
  fillSelect(langSelect, langs, (v)=>{
    const map = {
      python:'Python', dotnet:'.NET/C#', javascript:'JavaScript', java:'Java', kotlin:'Kotlin',
      sql:'SQL/BD', azure:'Azure', ia:'IA/GenAI', scrum:'Scrum', gestao:'Gestão'
    };
    return map[v] || v;
  });

  function applyFilter(){
    const fy = yearSelect.value;
    const ft = typeSelect.value;
    const fl = langSelect.value;
    const ftxt = normalize(textInput?.value || '');
    let visible = 0;

    items.forEach(li => {
      const matchYear = !fy || li.dataset.year === fy;
      const matchType = !ft || li.dataset.type === ft;
      const matchLang = !fl || li.dataset.lang === fl;
      const matchText = !ftxt || (li.dataset.text && li.dataset.text.includes(ftxt));
      const ok = matchYear && matchType && matchLang && matchText;
      li.style.display = ok ? '' : 'none';
      if(ok) visible++;
    });

    if(countEl){
      countEl.textContent = `${visible} itens`;
    }
  }

  [yearSelect, typeSelect, langSelect].forEach(sel => sel.addEventListener('change', applyFilter));
  textInput?.addEventListener('input', applyFilter);

  clearBtn?.addEventListener('click', () => {
    yearSelect.value = '';
    typeSelect.value = '';
    langSelect.value = '';
    if(textInput) textInput.value = '';
    applyFilter();
  });

  // Inicializa contagem
  applyFilter();
})();
