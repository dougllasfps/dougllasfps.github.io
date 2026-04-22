import { TOOLS } from './tools-data.js';
import { buildPageLink, buildToolLink, escapeHtml, formatToolTypeLabel } from './utils.js';

export function toolCard(tool) {
  return `
    <article class="tool-card" aria-label="${escapeHtml(tool.name)}">
      <div class="tool-meta">
        <span class="tag tag-type">${escapeHtml(formatToolTypeLabel(tool.type))}</span>
        <span class="tool-meta-sep" aria-hidden="true">•</span>
        <span class="tool-category">${escapeHtml(tool.category)}</span>
      </div>
      <h3>${escapeHtml(tool.name)}</h3>
      <p>${escapeHtml(tool.description)}</p>
      <div class="actions">
        <a class="btn-link" href="${buildToolLink(tool.slug)}">Abrir ferramenta</a>
      </div>
    </article>
  `;
}

export function renderToolGrid(target, tools, emptyMessage = 'Nenhuma ferramenta encontrada.') {
  if (!target) return;
  if (!tools.length) {
    target.innerHTML = `<div class="empty-state"><h3>Sem resultados</h3><p>${escapeHtml(emptyMessage)}</p></div>`;
    return;
  }
  target.innerHTML = tools.map(toolCard).join('');
}

export function getPopularTools(limit = 8) {
  return TOOLS.filter((tool) => tool.popular).slice(0, limit);
}

export function getByType(type) {
  return TOOLS.filter((tool) => tool.type === type);
}

export function getRelated(slugs, currentSlug) {
  return slugs
    .map((slug) => TOOLS.find((tool) => tool.slug === slug))
    .filter(Boolean)
    .filter((tool) => tool.slug !== currentSlug)
    .slice(0, 3);
}

export function categoryCards(type, categories) {
  return categories
    .map((category) => {
      const count = TOOLS.filter((tool) => tool.type === type && tool.category === category).length;
      return `
        <article class="info-card panel">
          <h3>${escapeHtml(category)}</h3>
          <p>${count} ferramenta(s) disponível(is).</p>
          <a class="btn-link" href="${type === 'calculadora' ? buildPageLink('calculadoras.html') : buildPageLink('conversores.html')}?categoria=${encodeURIComponent(category)}">Explorar categoria</a>
        </article>
      `;
    })
    .join('');
}
