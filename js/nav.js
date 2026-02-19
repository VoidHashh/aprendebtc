/**
 * aprendebtc.com - nav.js
 * Handles: mobile menu, search overlay, active link states,
 * smooth anchor scroll, and contextual back button.
 */

(function () {
  'use strict';

  function normalizePath(pathname) {
    if (!pathname) return '/';
    const normalized = pathname
      .replace(/\/index\.html$/i, '/')
      .replace(/\/+$/, '');
    return normalized || '/';
  }

  function currentPath() {
    return window.location.pathname;
  }

  function markActiveNavLinks() {
    const path = currentPath();
    document.querySelectorAll('.site-nav__link[href], .mobile-menu__link[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '/') return;
      if (path.startsWith(href)) {
        link.classList.add('site-nav__link--active');
      }
    });
  }

  function markActiveSidebarLink() {
    const path = currentPath();
    document.querySelectorAll('.sidebar__link').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (path === href || path.endsWith(href)) {
        link.classList.add('sidebar__link--active');
        link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  function sectionFallbackPath(pathname) {
    const path = normalizePath(pathname);

    if (path === '/nivel-1' || path.startsWith('/nivel-1/')) return '/nivel-1/';
    if (path === '/nivel-2' || path.startsWith('/nivel-2/')) return '/nivel-2/';
    if (path === '/nivel-3' || path.startsWith('/nivel-3/')) return '/nivel-3/';
    if (path === '/nivel-4' || path.startsWith('/nivel-4/')) return '/nivel-4/';
    if (path === '/nivel-5' || path.startsWith('/nivel-5/')) return '/nivel-5/';
    if (path === '/nivel-6' || path.startsWith('/nivel-6/')) return '/nivel-6/';
    if (path === '/base' || path.startsWith('/base/')) return '/base/';
    if (path === '/comunidad' || path.startsWith('/comunidad/')) return '/comunidad/';
    if (path === '/herramientas' || path.startsWith('/herramientas/')) return '/herramientas/';

    if (path === '/glosario.html' || path === '/recursos.html') return '/';

    return '/';
  }

  function getSameOriginReferrer() {
    if (!document.referrer) return null;

    try {
      const ref = new URL(document.referrer);
      if (ref.origin === window.location.origin) return ref;
    } catch (_) {
      return null;
    }

    return null;
  }

  function initContextBackButton() {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;
    if (document.querySelector('.context-back')) return;

    const current = normalizePath(window.location.pathname);
    const fallback = sectionFallbackPath(window.location.pathname);
    const ref = getSameOriginReferrer();

    const hasValidRef = !!ref && normalizePath(ref.pathname) !== current;
    const hasFallback = normalizePath(fallback) !== current;

    if (!hasValidRef && !hasFallback) return;

    const wrap = document.createElement('div');
    wrap.className = 'context-back-wrap';

    const link = document.createElement('a');
    link.className = 'context-back';
    link.textContent = '<- Volver';

    if (hasValidRef) {
      const target = `${ref.pathname}${ref.search || ''}${ref.hash || ''}`;
      link.href = target;
      link.setAttribute('aria-label', 'Volver a la pagina anterior');
      link.addEventListener('click', (event) => {
        event.preventDefault();
        window.history.back();
      });
    } else {
      link.href = fallback;
      link.setAttribute('aria-label', 'Volver al indice de la seccion');
    }

    wrap.appendChild(link);
    breadcrumb.parentNode.insertBefore(wrap, breadcrumb);
  }

  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const overlay = document.getElementById('mobile-menu-overlay');
    const menu = document.getElementById('mobile-menu');

    if (!toggleBtn || !overlay || !menu) return;

    function openMenu() {
      overlay.classList.add('mobile-menu-overlay--visible');
      overlay.offsetHeight;
      overlay.classList.add('mobile-menu-overlay--active');
      menu.classList.add('mobile-menu--open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      overlay.classList.remove('mobile-menu-overlay--active');
      menu.classList.remove('mobile-menu--open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

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

    overlay.addEventListener('click', (event) => {
      if (!menu.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('mobile-menu--open')) {
        closeMenu();
        toggleBtn.focus();
      }
    });
  }

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

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeSearch();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('search-overlay--open')) {
        closeSearch();
      }
      if (event.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        event.preventDefault();
        openSearch();
      }
    });
  }

  function initSmoothScroll() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function init() {
    markActiveNavLinks();
    markActiveSidebarLink();
    initContextBackButton();
    initMobileMenu();
    initSearch();
    initSmoothScroll();
  }

  document.addEventListener('includes:loaded', init);

  if (document.readyState !== 'loading') {
    setTimeout(init, 100);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
  }
})();

