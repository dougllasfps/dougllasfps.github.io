export const isSubpage = window.location.pathname.includes('/pages/');
export const rootPath = isSubpage ? '../' : './';

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (value == null) return NaN;
  const normalized = String(value).trim().replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return '--';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCurrency(value) {
  if (!Number.isFinite(value)) return '--';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value);
}

export function daysBetween(start, end) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / ms);
}

export function parseTimeToMinutes(timeText) {
  if (!timeText || !timeText.includes(':')) return NaN;
  const [h, m] = timeText.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  return h * 60 + m;
}

export function minutesToTime(totalMinutes) {
  const sign = totalMinutes < 0 ? '-' : '';
  const abs = Math.abs(Math.round(totalMinutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function bySlug(slug, list) {
  return list.find((item) => item.slug === slug);
}

export function buildToolLink(slug) {
  return `${rootPath}pages/ferramenta.html?slug=${encodeURIComponent(slug)}`;
}

export function buildPageLink(fileName) {
  if (fileName === 'index.html') return `${rootPath}index.html`;
  return `${rootPath}pages/${fileName}`;
}
