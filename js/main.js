import { CALCULATOR_CATEGORIES, CONVERTER_CATEGORIES, TOOLS } from './tools-data.js';
import { renderToolGrid, getByType, getPopularTools, categoryCards, getRelated } from './render.js';
import { setupSearchInput, searchTools } from './search.js';
import { TOOL_DEFINITIONS } from './tools.js';
import { buildPageLink, buildToolLink, bySlug, escapeHtml, rootPath } from './utils.js';

const body = document.body;
const page = body.dataset.page || 'home';

renderHeader();
renderFooter();
setupMobileMenu();
setupBackToTop();
setupBreadcrumb();

initPage(page);

function initPage(pageName) {
  if (pageName === 'home') return initHome();
  if (pageName === 'calculators') return initCalculators();
  if (pageName === 'converters') return initConverters();
  if (pageName === 'tools') return initAllTools();
  if (pageName === 'tool') return initToolDetail();
}

function renderHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const current = currentPathLabel();

  header.className = 'site-header';
  header.innerHTML = `
    <div class="container header-inner">
      <a class="brand" href="${buildPageLink('index.html')}" aria-label="Página inicial">
        <img class="brand-mark" src="${rootPath}assets/logo-mark.svg" alt="" aria-hidden="true" />
        <span class="brand-text">
          <strong>Ferramentas Online</strong>
          <small>Calculadoras e Conversores</small>
        </span>
      </a>
      <button class="menu-toggle" id="menuToggle" aria-expanded="false" aria-controls="mainNav" aria-label="Abrir menu">
        ☰
      </button>
      <nav class="main-nav" id="mainNav" aria-label="Menu principal">
        <ul class="nav-list">
          ${navItem('Início', buildPageLink('index.html'), current)}
          ${navItem('Calculadoras', buildPageLink('calculadoras.html'), current)}
          ${navItem('Conversores', buildPageLink('conversores.html'), current)}
          ${navItem('Todas as ferramentas', buildPageLink('ferramentas.html'), current)}
          ${navItem('Sobre', buildPageLink('sobre.html'), current)}
          ${navItem('Contato', buildPageLink('contato.html'), current)}
          <li class="dropdown">
            <details>
              <summary>Categorias</summary>
              <ul>
                <li><strong>Calculadoras</strong></li>
                ${CALCULATOR_CATEGORIES.map((cat) => `<li><a href="${buildPageLink('calculadoras.html')}?categoria=${encodeURIComponent(cat)}">${escapeHtml(cat)}</a></li>`).join('')}
                <li><strong>Conversores</strong></li>
                ${CONVERTER_CATEGORIES.map((cat) => `<li><a href="${buildPageLink('conversores.html')}?categoria=${encodeURIComponent(cat)}">${escapeHtml(cat)}</a></li>`).join('')}
              </ul>
            </details>
          </li>
        </ul>
      </nav>
    </div>
  `;
}

function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;

  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container footer-grid">
      <section>
        <h3>Ferramentas Online</h3>
        <p>Portal de calculadoras e conversores para tarefas do dia a dia, finanças, medidas, datas e produtividade.</p>
      </section>
      <section>
        <h3>Páginas</h3>
        <ul>
          <li><a href="${buildPageLink('index.html')}">Início</a></li>
          <li><a href="${buildPageLink('ferramentas.html')}">Todas as ferramentas</a></li>
          <li><a href="${buildPageLink('sobre.html')}">Sobre</a></li>
          <li><a href="${buildPageLink('contato.html')}">Contato</a></li>
        </ul>
      </section>
      <section>
        <h3>Legal</h3>
        <ul>
          <li><a href="${buildPageLink('politica-privacidade.html')}">Política de Privacidade</a></li>
          <li><a href="${buildPageLink('termos-de-uso.html')}">Termos de Uso</a></li>
        </ul>
        <p>© ${new Date().getFullYear()} Ferramentas Online.</p>
      </section>
    </div>
  `;
}

function setupMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

function setupBackToTop() {
  const button = document.getElementById('scrollTopBtn');
  if (!button) return;

  button.className = 'btn scroll-top';
  button.textContent = 'Topo';
  button.hidden = true;

  window.addEventListener('scroll', () => {
    button.hidden = window.scrollY < 420;
  });

  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function setupBreadcrumb() {
  const container = document.getElementById('breadcrumb');
  const trail = body.dataset.breadcrumb;
  if (!container || !trail) return;

  const parts = trail.split('|').map((item) => item.trim()).filter(Boolean);
  const items = ['Início', ...parts];
  const links = [buildPageLink('index.html')];

  items.slice(1, -1).forEach((item) => {
    const url = inferLink(item);
    links.push(url);
  });

  container.className = 'breadcrumb';
  container.innerHTML = `
    <ol>
      ${items
        .map((item, index) => {
          const isLast = index === items.length - 1;
          if (isLast) return `<li aria-current="page">${escapeHtml(item)}</li>`;
          const href = links[index] || '#';
          return `<li><a href="${href}">${escapeHtml(item)}</a> ›</li>`;
        })
        .join('')}
    </ol>
  `;
}

function initHome() {
  const popularTarget = document.getElementById('popularTools');
  const calcTarget = document.getElementById('calculatorHighlights');
  const convTarget = document.getElementById('converterHighlights');
  const calcCategories = document.getElementById('calculatorCategories');
  const convCategories = document.getElementById('converterCategories');

  renderToolGrid(popularTarget, getPopularTools(8));
  renderToolGrid(calcTarget, getByType('calculadora').slice(0, 6));
  renderToolGrid(convTarget, getByType('conversor').slice(0, 6));

  if (calcCategories) calcCategories.innerHTML = categoryCards('calculadora', CALCULATOR_CATEGORIES);
  if (convCategories) convCategories.innerHTML = categoryCards('conversor', CONVERTER_CATEGORIES);

  const homeSearchInput = document.getElementById('homeSearch');
  const homeSuggestions = document.getElementById('homeSearchSuggestions');
  setupSearchInput({ input: homeSearchInput, list: homeSuggestions });

  const quick = document.getElementById('quickLinks');
  if (quick) {
    quick.innerHTML = getPopularTools(8)
      .map((tool) => `<a href="${buildToolLink(tool.slug)}">${escapeHtml(tool.name)}</a>`)
      .join('');
  }
}

function initCalculators() {
  const category = new URLSearchParams(window.location.search).get('categoria');
  let items = getByType('calculadora');
  if (category) items = items.filter((tool) => tool.category === category);

  const title = document.getElementById('categoryTitle');
  if (title) title.textContent = category ? `Calculadoras: ${category}` : 'Calculadoras';

  renderToolGrid(document.getElementById('pageTools'), items, 'Nenhuma calculadora encontrada para esta categoria.');
}

function initConverters() {
  const category = new URLSearchParams(window.location.search).get('categoria');
  let items = getByType('conversor');
  if (category) items = items.filter((tool) => tool.category === category);

  const title = document.getElementById('categoryTitle');
  if (title) title.textContent = category ? `Conversores: ${category}` : 'Conversores';

  renderToolGrid(document.getElementById('pageTools'), items, 'Nenhum conversor encontrado para esta categoria.');
}

function initAllTools() {
  const source = [...TOOLS];
  const grid = document.getElementById('allToolsGrid');
  const count = document.getElementById('resultsCount');
  const typeFilter = document.getElementById('filterType');
  const categoryFilter = document.getElementById('filterCategory');
  const input = document.getElementById('allSearch');
  const list = document.getElementById('allSearchSuggestions');

  if (!grid || !count || !typeFilter || !categoryFilter || !input || !list) return;

  const categories = [...new Set(TOOLS.map((tool) => tool.category))].sort((a, b) => a.localeCompare(b));
  categoryFilter.innerHTML += categories.map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');

  function applyFilters() {
    const typed = typeFilter.value;
    const category = categoryFilter.value;
    const term = input.value.trim();

    let items = searchTools(term, source);
    if (typed) items = items.filter((tool) => tool.type === typed);
    if (category) items = items.filter((tool) => tool.category === category);

    renderToolGrid(grid, items, 'Tente ajustar a busca ou filtros para encontrar uma ferramenta.');
    count.textContent = `${items.length} resultado(s)`;
  }

  setupSearchInput({
    input,
    list,
    source,
    onSelect: () => applyFilters(),
    limit: 10,
  });

  typeFilter.addEventListener('change', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
  applyFilters();
}

function initToolDetail() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug') || '';
  const tool = bySlug(slug, TOOLS);
  const target = document.getElementById('toolDetail');
  if (!target) return;

  if (!tool || !TOOL_DEFINITIONS[slug]) {
    target.innerHTML = `
      <section class="alert">
        <h2>Ferramenta não encontrada</h2>
        <p>Não encontramos essa ferramenta. Confira o catálogo completo.</p>
        <a class="btn" href="${buildPageLink('ferramentas.html')}">Ver todas as ferramentas</a>
      </section>
    `;
    return;
  }

  document.title = `${tool.name} | Ferramentas Online`;

  const definition = TOOL_DEFINITIONS[slug];
  const related = getRelated(definition.related || [], slug);

  target.innerHTML = `
    <article class="form-card">
      <span class="tag">${escapeHtml(tool.type)} • ${escapeHtml(tool.category)}</span>
      <h1>${escapeHtml(tool.name)}</h1>
      <p>${escapeHtml(tool.description)}</p>
      <form id="toolForm" novalidate>
        <div class="form-grid">
          ${definition.inputs
            .map(
              (field) => `
                <div class="field">
                  <label for="${escapeHtml(field.name)}">${escapeHtml(field.label)}</label>
                  <input
                    class="input"
                    id="${escapeHtml(field.name)}"
                    name="${escapeHtml(field.name)}"
                    type="${escapeHtml(field.type || 'text')}"
                    step="${escapeHtml(field.step || 'any')}"
                    placeholder="${escapeHtml(field.placeholder || '')}"
                    value="${escapeHtml(field.value || '')}"
                    aria-label="${escapeHtml(field.label)}"
                  />
                  ${field.help ? `<small>${escapeHtml(field.help)}</small>` : ''}
                </div>
              `,
            )
            .join('')}
        </div>
        <div class="form-actions">
          <button class="btn" type="submit">Calcular</button>
          <button class="btn-secondary" type="reset">Limpar</button>
        </div>
      </form>
      <div class="result-box" id="resultBox" aria-live="polite">
        <p class="result-value">Preencha os campos e clique em calcular.</p>
      </div>
      <div class="content-text">
        <h2>Como funciona</h2>
        <p>${escapeHtml(definition.explanation || '')}</p>
        <h3>Exemplo de uso</h3>
        <p>${escapeHtml(definition.example || '')}</p>
      </div>
    </article>

    <aside class="panel">
      <h2>Ferramentas relacionadas</h2>
      <div class="grid tools">
        ${related.length ? related.map((item) => toolCardInline(item)).join('') : '<p>Sem relacionadas no momento.</p>'}
      </div>
      <div class="ad-slot" style="margin-top:1rem;">Área de anúncio interno (300x250)</div>
    </aside>
  `;

  const form = document.getElementById('toolForm');
  const resultBox = document.getElementById('resultBox');
  if (!form || !resultBox) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    const outcome = definition.calculate(values);

    if (!outcome || outcome.error) {
      resultBox.innerHTML = `<p class="result-value">${escapeHtml((outcome && outcome.error) || 'Dados inválidos. Revise os campos.')}</p>`;
      return;
    }

    resultBox.innerHTML = `
      <p class="result-value">${escapeHtml(outcome.value)}</p>
      <p>${escapeHtml(outcome.detail || '')}</p>
    `;
  });

  form.addEventListener('reset', () => {
    requestAnimationFrame(() => {
      resultBox.innerHTML = '<p class="result-value">Campos limpos. Pronto para um novo cálculo.</p>';
    });
  });
}

function toolCardInline(tool) {
  return `
    <article class="tool-card">
      <h3>${escapeHtml(tool.name)}</h3>
      <p>${escapeHtml(tool.description)}</p>
      <a class="btn-link" href="${buildPageLink('ferramenta.html')}?slug=${encodeURIComponent(tool.slug)}">Abrir</a>
    </article>
  `;
}

function navItem(label, href, current) {
  const active = current === href ? 'active' : '';
  return `<li><a class="nav-link ${active}" href="${href}">${label}</a></li>`;
}

function currentPathLabel() {
  const path = window.location.pathname;
  if (path.endsWith('/index.html') || path.endsWith('/')) return buildPageLink('index.html');
  const file = path.split('/').pop() || '';
  if (!file || file.includes('.')) return `${rootPath}pages/${file}`;
  return buildPageLink('index.html');
}

function inferLink(label) {
  const map = {
    Calculadoras: buildPageLink('calculadoras.html'),
    Conversores: buildPageLink('conversores.html'),
    'Todas as ferramentas': buildPageLink('ferramentas.html'),
    Sobre: buildPageLink('sobre.html'),
    Contato: buildPageLink('contato.html'),
    'Política de Privacidade': buildPageLink('politica-privacidade.html'),
    'Termos de Uso': buildPageLink('termos-de-uso.html'),
  };
  return map[label] || '#';
}
