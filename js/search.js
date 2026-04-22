import { TOOLS } from './tools-data.js';
import { buildToolLink, escapeHtml } from './utils.js';

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function searchTools(term, source = TOOLS) {
  const query = normalize(term).trim();
  if (!query) return source;
  return source.filter((tool) => {
    const text = normalize(`${tool.name} ${tool.description} ${tool.category} ${tool.keywords.join(' ')}`);
    return text.includes(query);
  });
}

export function setupSearchInput({ input, list, onSelect, limit = 8, source = TOOLS }) {
  if (!input || !list) return;

  function clear() {
    list.innerHTML = '';
    list.hidden = true;
  }

  input.addEventListener('input', () => {
    const term = input.value.trim();
    if (!term) {
      clear();
      if (onSelect) onSelect(source);
      return;
    }

    const results = searchTools(term, source);
    if (onSelect) onSelect(results);

    const suggestions = results.slice(0, limit);
    if (!suggestions.length) {
      list.hidden = false;
      list.innerHTML = '<div class="search-item">Nenhuma ferramenta encontrada.</div>';
      return;
    }

    list.hidden = false;
    list.innerHTML = suggestions
      .map(
        (tool) => `
          <a class="search-item" href="${buildToolLink(tool.slug)}">
            ${escapeHtml(tool.name)}
            <small>${escapeHtml(tool.type)} • ${escapeHtml(tool.category)}</small>
          </a>
        `,
      )
      .join('');
  });

  input.addEventListener('focus', () => {
    if (input.value.trim() && list.innerHTML.trim()) list.hidden = false;
  });

  document.addEventListener('click', (event) => {
    if (!list.contains(event.target) && event.target !== input) clear();
  });

  if (onSelect) onSelect(source);
}
