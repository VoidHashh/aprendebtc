/**
 * aprendebtc.com — nav.js
 * Maneja: hamburger, menú móvil, dropdowns, estado activo en sidebar y header.
 * Se inicializa después de que includes.js haya inyectado el header.
 */

(function () {
  'use strict';

  /** ========================
   * Utilidades
   * ======================== */

  /** Obtiene la ruta actual normalizada (sin trailing slash excepto para raíz) */
  function currentPath() {
    return window.location.pathname;
  }

  /** Marca el enlace activo en el nav principal */
  function markActiveNavLinks() {
    const path = currentPath();
    document.querySelectorAll('.site-nav__link[href], .mobile-menu__link[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '/') return;
      if (path.startsWith(href)) {
        link.classList.add('site-nav__link--active');
      }
    });
  }

  /** Marca el enlace activo en el sidebar de contenido */
  function markActiveSidebarLink() {
    const path = currentPath();
    document.querySelectorAll('.sidebar__link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      // Comparar la ruta exacta o la URL actual contiene el href
      if (path === href || path.endsWith(href)) {
        link.classList.add('sidebar__link--active');
        // Scroll el sidebar para hacer visible el link activo
        link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  /** ========================
   * Menú hamburger / móvil
   * ======================== */
  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const overlay = document.getElementById('mobile-menu-overlay');
    const menu = document.getElementById('mobile-menu');

    if (!toggleBtn || !overlay || !menu) return;

    function openMenu() {
      overlay.classList.add('mobile-menu-overlay--visible');
      // Trigger reflow para animar la transición
      overlay.offsetHeight;
      overlay.classList.add('mobile-menu-overlay--active');
      menu.classList.add('mobile-menu--open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Bloquear scroll
    }

    function closeMenu() {
      overlay.classList.remove('mobile-menu-overlay--active');
      menu.classList.remove('mobile-menu--open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      // Esperar a que termine la animación para ocultar del todo
      overlay.addEventListener('transitionend', () => {
        overlay.classList.remove('mobile-menu-overlay--visible');
      }, { once: true });
    }

    toggleBtn.addEventListener('click', () => {
      if (menu.classList.contains('mobile-menu--open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Cerrar al hacer clic en el overlay (fuera del menú)
    overlay.addEventListener('click', (e) => {
      if (!menu.contains(e.target)) {
        closeMenu();
      }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('mobile-menu--open')) {
        closeMenu();
        toggleBtn.focus();
      }
    });
  }

  /** ========================
   * Búsqueda (overlay)
   * ======================== */
  function initSearch() {
    const toggleBtn = document.getElementById('search-toggle');
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');

    if (!toggleBtn || !overlay) return;

    function openSearch() {
      overlay.classList.add('search-overlay--open');
      if (input) setTimeout(() => input.focus(), 50);
    }

    function closeSearch() {
      overlay.classList.remove('search-overlay--open');
      if (input) input.value = '';
      toggleBtn.focus();
    }

    toggleBtn.addEventListener('click', openSearch);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSearch();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('search-overlay--open')) {
        closeSearch();
      }
      // Atajo de teclado: / para abrir búsqueda
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openSearch();
      }
    });
  }

  /** ========================
   * Smooth scroll para anchors
   * ======================== */
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /** ========================
   * Init principal
   * ======================== */
  function init() {
    markActiveNavLinks();
    markActiveSidebarLink();
    initMobileMenu();
    initSearch();
    initSmoothScroll();
  }

  // Escuchar el evento de includes cargados (disparado por includes.js)
  document.addEventListener('includes:loaded', init);

  // Fallback: si el DOM ya tiene el header (p.ej. en index.html con header inline)
  if (document.readyState !== 'loading') {
    // Pequeño delay para que includes.js tenga tiempo
    setTimeout(init, 100);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
  }
})();
