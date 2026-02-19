/**
 * aprendebtc.com — includes.js
 * Carga header.html y footer.html dinámicamente en cada página.
 * Uso: <div data-include="header"></div>
 * Configuración: <html data-base-path="../"> para páginas en subcarpetas
 */

(function () {
  'use strict';

  // Obtener la ruta base desde el atributo del elemento <html>
  // Páginas en raíz: data-base-path=""
  // Páginas en /nivel-1/: data-base-path="../"
  const basePath = document.documentElement.dataset.basePath ?? '';

  /**
   * Carga un include HTML y lo inyecta en el elemento destino.
   * @param {HTMLElement} el - Elemento con data-include
   */
  async function loadInclude(el) {
    const name = el.dataset.include;
    if (!name) return;

    const url = `${basePath}includes/${name}.html`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`No se pudo cargar ${url}: ${response.status}`);
      const html = await response.text();
      el.outerHTML = html; // Reemplaza el div con el contenido real
    } catch (error) {
      console.error('[aprendebtc] Error cargando include:', error);
    }
  }

  /**
   * Inicialización: busca todos los elementos con data-include
   * y los carga en paralelo. Luego dispara el evento para nav.js.
   */
  async function init() {
    const includes = document.querySelectorAll('[data-include]');
    if (includes.length === 0) return;

    // Cargar todos los includes en paralelo
    await Promise.all(Array.from(includes).map(loadInclude));

    // Notificar a otros scripts que los includes ya están en el DOM
    document.dispatchEvent(new CustomEvent('includes:loaded'));
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
