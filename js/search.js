/**
 * aprendebtc.com - search.js
 * Client-side search with static core pages + dynamic base index.
 */

(function () {
  'use strict';

  const staticIndex = [
    { title: 'Inicio', url: '/', tags: ['home', 'landing'], section: 'General' },
    { title: 'Nivel 1 - Nocoinero Curioso', url: '/nivel-1/', tags: ['nivel 1', 'principiante'], section: 'Niveles', nivel: 1 },
    { title: 'Antes de empezar', url: '/nivel-1/antes-de-empezar.html', tags: ['nivel 1', 'inicio'], section: 'Nivel 1', nivel: 1 },
    { title: 'El problema del KYC', url: '/nivel-1/el-problema-del-kyc.html', tags: ['kyc', 'privacidad'], section: 'Nivel 1', nivel: 1 },
    { title: 'Dos caminos: KYC o no-KYC', url: '/nivel-1/dos-caminos.html', tags: ['kyc', 'no-kyc'], section: 'Nivel 1', nivel: 1 },
    { title: 'Registrarte en un exchange', url: '/nivel-1/registrarte-en-un-exchange.html', tags: ['exchange', 'registro'], section: 'Nivel 1', nivel: 1 },
    { title: 'Tu primera compra', url: '/nivel-1/tu-primera-compra.html', tags: ['compra', 'sats'], section: 'Nivel 1', nivel: 1 },
    { title: 'Qué acabas de hacer', url: '/nivel-1/que-has-hecho.html', tags: ['custodia', 'keys'], section: 'Nivel 1', nivel: 1 },
    { title: 'Base de Conocimiento', url: '/base/', tags: ['base', 'referencia'], section: 'Pilares' },
    { title: 'Glosario', url: '/glosario.html', tags: ['términos', 'definiciones'], section: 'Pilares' },
    { title: 'Recursos', url: '/recursos.html', tags: ['libros', 'podcasts'], section: 'Pilares' },
    { title: 'Herramientas', url: '/herramientas/', tags: ['tools', 'hash'], section: 'Pilares' },
    { title: 'Comunidad', url: '/comunidad/', tags: ['meetups', 'eventos'], section: 'Pilares' }
  ];

  const nivelLabels = { 1: 'N1', 2: 'N2', 3: 'N3', 4: 'N4', 5: 'N5', 6: 'N6' };
  let baseIndex = [];

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function scoreItem(item, query) {
    const q = normalize(query);
    const title = normalize(item.title);
    const tags = (item.tags || []).map(normalize).join(' ');

    let score = 0;
    if (title.startsWith(q)) score += 8;
    if (title.includes(q)) score += 4;
    if (tags.includes(q)) score += 2;
    return score;
  }

  function search(query) {
    const q = normalize(query);
    if (q.length < 2) return [];

    return [...staticIndex, ...baseIndex]
      .map((item) => ({ item, score: scoreItem(item, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry) => entry.item);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderResults(results, query) {
    const container = document.getElementById('search-results');
    if (!container) return;

    const cleanQuery = (query || '').trim();
    if (cleanQuery.length < 2) {
      container.innerHTML = '<p class="search-hint">Escribe para buscar artículos, conceptos y niveles...</p>';
      return;
    }

    if (results.length === 0) {
      container.innerHTML = `<p class="search-hint">Sin resultados para "<strong>${escapeHtml(cleanQuery)}</strong>"</p>`;
      return;
    }

    container.innerHTML = results.map((item) => {
      const badgeLabel = item.nivel ? nivelLabels[item.nivel] : 'DOC';
      const badgeClass = item.nivel ? `search-result-item__badge search-result-item__badge--nivel-${item.nivel}` : 'search-result-item__badge';
      const meta = item.section || 'Contenido';

      return `
        <a href="${item.url}" class="search-result-item">
          <span class="${badgeClass}">${badgeLabel}</span>
          <span class="search-result-item__body">
            <span class="search-result-item__title">${escapeHtml(item.title)}</span>
            <span class="search-result-item__meta">${escapeHtml(meta)}</span>
          </span>
        </a>
      `;
    }).join('');
  }

  async function loadBaseIndex() {
    const basePath = document.documentElement.dataset.basePath ?? '';
    const url = `${basePath}js/search-index.base.json`;

    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) {
        baseIndex = data;
      }
    } catch (_) {
      // keep static index only
    }
  }

  function bindInput() {
    const input = document.getElementById('search-input');
    if (!input) return;

    let debounceTimer;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        renderResults(search(input.value), input.value);
      }, 120);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      const results = search(input.value);
      if (results.length > 0) {
        window.location.href = results[0].url;
      }
    });
  }

  async function init() {
    await loadBaseIndex();
    bindInput();
  }

  document.addEventListener('includes:loaded', init);
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 150));
})();
