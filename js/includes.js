/**
 * aprendebtc.com - includes.js
 * Carga header.html y footer.html dinamicamente en cada pagina.
 * Uso: <div data-include="header"></div>
 * Configuracion: <html data-base-path="../"> para paginas en subcarpetas
 */

(function () {
  'use strict';

  const GA_MEASUREMENT_ID = 'G-FQZGS04FVD';

  // Paginas en raiz: data-base-path=""
  // Paginas en /nivel-1/: data-base-path="../"
  const basePath = document.documentElement.dataset.basePath || '';

  function isLocalEnvironment() {
    const host = window.location.hostname;
    return (
      window.location.protocol === 'file:' ||
      host === 'localhost' ||
      host === '127.0.0.1'
    );
  }

  function initAnalytics() {
    if (isLocalEnvironment()) return;
    if (window.__aprendebtcAnalyticsInitialized) return;

    window.__aprendebtcAnalyticsInitialized = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };

    const existing = document.querySelector(`script[data-gtag-id="${GA_MEASUREMENT_ID}"]`);
    if (!existing) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      script.setAttribute('data-gtag-id', GA_MEASUREMENT_ID);
      document.head.appendChild(script);
    }

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
  }

  function ensureFavicon() {
    const href = `${basePath}assets/img/bitcoincalculadora-favicon.svg`;
    const icons = Array.from(document.querySelectorAll('link[rel~="icon"]'));

    if (icons.length > 0) {
      icons.forEach((el) => {
        el.setAttribute('href', href);
        el.setAttribute('type', 'image/svg+xml');
        el.setAttribute('sizes', 'any');
      });
      return;
    }

    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.sizes = 'any';
    link.href = href;
    document.head.appendChild(link);
  }

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
      el.outerHTML = html;
    } catch (error) {
      console.error('[aprendebtc] Error cargando include:', error);
    }
  }

  /**
   * Inicializacion: busca todos los elementos con data-include
   * y los carga en paralelo. Luego dispara el evento para nav.js.
   */
  async function init() {
    initAnalytics();
    ensureFavicon();

    const includes = document.querySelectorAll('[data-include]');
    if (includes.length === 0) return;

    await Promise.all(Array.from(includes).map(loadInclude));
    document.dispatchEvent(new CustomEvent('includes:loaded'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
