/**
 * aprendebtc.com — search.js
 * Búsqueda client-side. Placeholder funcional.
 * TODO: Poblar searchIndex con los datos reales del sitio.
 */

(function () {
  'use strict';

  // Índice de búsqueda — se irá ampliando con el contenido real
  const searchIndex = [
    { title: '¿Qué es Bitcoin?', url: '/base/que-es-bitcoin.html', tags: ['bitcoin', 'introducción', 'qué es'], nivel: null },
    { title: 'Nivel 1 — Nocoinero Curioso', url: '/nivel-1/', tags: ['nivel 1', 'principiante', 'nocoinero'], nivel: 1 },
    { title: 'Nivel 2 — Ya Tengo Sats', url: '/nivel-2/', tags: ['nivel 2', 'wallet', 'comprar bitcoin'], nivel: 2 },
    { title: 'Nivel 3 — Rabbit Hole', url: '/nivel-3/', tags: ['nivel 3', 'lightning', 'nodo', 'privacidad'], nivel: 3 },
    { title: 'Nivel 4 — Down the Rabbit Hole', url: '/nivel-4/', tags: ['nivel 4', 'criptografía', 'minería'], nivel: 4 },
    { title: 'Nivel 5 — El Arquitecto', url: '/nivel-5/', tags: ['nivel 5', 'avanzado', 'multisig'], nivel: 5 },
    { title: 'Nivel 6 — Satoshi', url: '/nivel-6/', tags: ['nivel 6', 'experto', 'protocolo'], nivel: 6 },
    { title: 'Glosario', url: '/glosario.html', tags: ['glosario', 'términos', 'definiciones'] },
    { title: 'Recursos', url: '/recursos.html', tags: ['recursos', 'libros', 'podcasts', 'links'] },
    { title: 'Herramientas', url: '/herramientas/', tags: ['herramientas', 'calculadora', 'hash'] },
  ];

  const NIVEL_LABELS = {
    1: 'N1', 2: 'N2', 3: 'N3', 4: 'N4', 5: 'N5', 6: 'N6'
  };

  /**
   * Busca en el índice por query
   * @param {string} query
   * @returns {Array}
   */
  function search(query) {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return searchIndex.filter(item => {
      return item.title.toLowerCase().includes(q) ||
             item.tags.some(tag => tag.includes(q));
    }).slice(0, 8);
  }

  /**
   * Renderiza los resultados en el DOM
   */
  function renderResults(results, query) {
    const container = document.getElementById('search-results');
    if (!container) return;

    if (!query || query.trim().length < 2) {
      container.innerHTML = '<p class="search-hint">Escribe para buscar artículos, conceptos, niveles…</p>';
      return;
    }

    if (results.length === 0) {
      container.innerHTML = `<p class="search-hint">Sin resultados para "<strong>${query}</strong>"</p>`;
      return;
    }

    const html = results.map(item => `
      <a href="${item.url}" class="search-result-item" style="
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6rem 0.75rem;
        border-radius: 6px;
        color: var(--text-primary);
        font-size: 0.9rem;
        text-decoration: none;
        transition: background 0.2s;
      " onmouseover="this.style.background='var(--bg-primary)'" onmouseout="this.style.background=''">
        ${item.nivel ? `<span style="font-size:0.7rem;font-weight:700;color:var(--nivel-${item.nivel});">${NIVEL_LABELS[item.nivel]}</span>` : '<span style="font-size:0.7rem;color:var(--text-muted);">📄</span>'}
        ${item.title}
      </a>
    `).join('');

    container.innerHTML = html;
  }

  /**
   * Inicializar la búsqueda cuando el DOM esté listo
   */
  function init() {
    const input = document.getElementById('search-input');
    if (!input) return;

    let debounceTimer;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const results = search(input.value);
        renderResults(results, input.value);
      }, 150);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const results = search(input.value);
        if (results.length > 0) {
          window.location.href = results[0].url;
        }
      }
    });
  }

  document.addEventListener('includes:loaded', init);
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 200));
})();
