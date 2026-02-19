/**
 * aprendebtc.com - nav.js
 * Handles: mobile menu, search overlay, active link states,
 * smooth anchor scroll, contextual return links, and sidebar tree navigation.
 */

(function () {
  'use strict';

  const RETURN_CONTEXT_KEY = 'aprendebtc:return-context';
  const SIDEBAR_TREE_KEY_PREFIX = 'aprendebtc:sidebar-tree:';

  let mobileMenuBound = false;
  let searchBound = false;
  let smoothScrollBound = false;
  let contextLinkBound = false;

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

  function getCurrentAbsoluteUrl() {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  function inferSectionLabel(pathname) {
    const path = normalizePath(pathname);

    const nivelMatch = path.match(/^\/nivel-(\d)(\/|$)/);
    if (nivelMatch) return `Nivel ${nivelMatch[1]}`;

    if (path === '/base' || path.startsWith('/base/')) return 'Base de Conocimiento';
    if (path === '/comunidad' || path.startsWith('/comunidad/')) return 'Comunidad';
    if (path === '/herramientas' || path.startsWith('/herramientas/')) return 'Herramientas';
    if (path === '/glosario.html') return 'Glosario';
    if (path === '/recursos.html') return 'Recursos';

    return 'Contenido';
  }

  function collapseWhitespace(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function getPageTitleText() {
    const h1 = document.querySelector('h1');
    if (h1) {
      const h1Text = collapseWhitespace(h1.textContent);
      if (h1Text) return h1Text;
    }

    const breadcrumbCurrent = document.querySelector('.breadcrumb__current');
    if (breadcrumbCurrent) {
      const breadcrumbText = collapseWhitespace(breadcrumbCurrent.textContent);
      if (breadcrumbText) return breadcrumbText;
    }

    const title = document.title.split('|')[0];
    return collapseWhitespace(title);
  }

  function sanitizeSameOriginPath(pathValue) {
    if (!pathValue) return null;

    try {
      const resolved = new URL(pathValue, window.location.origin);
      if (resolved.origin !== window.location.origin) return null;
      if (!resolved.pathname.startsWith('/')) return null;
      return `${resolved.pathname}${resolved.search}${resolved.hash}`;
    } catch (_) {
      return null;
    }
  }

  function readContextFromStorage() {
    try {
      const raw = window.sessionStorage.getItem(RETURN_CONTEXT_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      const path = sanitizeSameOriginPath(parsed.path);
      if (!path) return null;

      return {
        path,
        title: collapseWhitespace(parsed.title || ''),
        section: collapseWhitespace(parsed.section || inferSectionLabel(path))
      };
    } catch (_) {
      return null;
    }
  }

  function saveContextToStorage(context) {
    if (!context || !context.path) return;

    const safePath = sanitizeSameOriginPath(context.path);
    if (!safePath) return;

    const payload = {
      path: safePath,
      title: collapseWhitespace(context.title || ''),
      section: collapseWhitespace(context.section || inferSectionLabel(safePath))
    };

    try {
      window.sessionStorage.setItem(RETURN_CONTEXT_KEY, JSON.stringify(payload));
    } catch (_) {
      // ignore storage failures
    }
  }

  function getCurrentLevelContext() {
    const current = normalizePath(window.location.pathname);
    if (!/^\/nivel-\d(\/|$)/.test(current)) return null;

    return {
      path: window.location.pathname,
      title: getPageTitleText(),
      section: inferSectionLabel(window.location.pathname)
    };
  }

  function readContextFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const fromPath = sanitizeSameOriginPath(params.get('from'));
    if (!fromPath) return null;

    return {
      path: fromPath,
      title: collapseWhitespace(params.get('from_title') || ''),
      section: collapseWhitespace(params.get('from_section') || inferSectionLabel(fromPath))
    };
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

  function formatContextLabel(context) {
    if (!context) return '';

    const section = collapseWhitespace(context.section || inferSectionLabel(context.path));
    const title = collapseWhitespace(context.title || '');

    if (section && title) return `${section} · ${title}`;
    if (title) return title;
    if (section) return section;

    return context.path;
  }

  function getReturnContext() {
    const current = normalizePath(window.location.pathname);

    const fromQuery = readContextFromQuery();
    if (fromQuery && normalizePath(new URL(fromQuery.path, window.location.origin).pathname) !== current) {
      saveContextToStorage(fromQuery);
      return { ...fromQuery, source: 'query' };
    }

    const fromStorage = readContextFromStorage();
    if (fromStorage && normalizePath(new URL(fromStorage.path, window.location.origin).pathname) !== current) {
      return { ...fromStorage, source: 'storage' };
    }

    const ref = getSameOriginReferrer();
    if (ref) {
      const refPath = normalizePath(ref.pathname);
      if (refPath !== current) {
        return {
          path: `${ref.pathname}${ref.search || ''}${ref.hash || ''}`,
          title: '',
          section: inferSectionLabel(ref.pathname),
          source: 'referrer'
        };
      }
    }

    return null;
  }

  function buildContextBackModel(returnContext) {
    const current = normalizePath(window.location.pathname);

    if (returnContext) {
      const targetPath = normalizePath(new URL(returnContext.path, window.location.origin).pathname);
      if (targetPath !== current) {
        if (returnContext.source === 'referrer' && !returnContext.title) {
          return {
            href: returnContext.path,
            text: '<- Volver a la pagina anterior',
            aria: 'Volver a la pagina anterior'
          };
        }

        const label = formatContextLabel(returnContext);
        return {
          href: returnContext.path,
          text: `<- Volver a: ${label}`,
          aria: `Volver a ${label}`
        };
      }
    }

    const fallback = sectionFallbackPath(window.location.pathname);
    if (normalizePath(fallback) !== current) {
      return {
        href: fallback,
        text: '<- Ir al indice de la seccion',
        aria: 'Ir al indice de la seccion'
      };
    }

    return null;
  }

  function initContextBackButton(returnContext) {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb || !breadcrumb.parentNode) return;

    const existingWrap = breadcrumb.parentNode.querySelector('.context-back-wrap');
    if (existingWrap) existingWrap.remove();

    const model = buildContextBackModel(returnContext);
    if (!model) return;

    const wrap = document.createElement('div');
    wrap.className = 'context-back-wrap';

    const link = document.createElement('a');
    link.className = 'context-back';
    link.href = model.href;
    link.textContent = model.text;
    link.setAttribute('aria-label', model.aria);

    wrap.appendChild(link);
    breadcrumb.parentNode.insertBefore(wrap, breadcrumb);
  }

  function initSidebarContextBlock(returnContext) {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const existing = sidebar.querySelector('.sidebar__section--context');
    if (existing) existing.remove();

    if (!returnContext) return;

    const current = normalizePath(window.location.pathname);
    const targetPath = normalizePath(new URL(returnContext.path, window.location.origin).pathname);
    if (current === targetPath) return;

    const section = document.createElement('div');
    section.className = 'sidebar__section sidebar__section--context sidebar__section--locked';

    const title = document.createElement('div');
    title.className = 'sidebar__section-title';
    title.textContent = 'Contexto de lectura';

    const link = document.createElement('a');
    link.className = 'sidebar__link sidebar__link--context';
    link.href = returnContext.path;
    link.textContent = `<- Volver a: ${formatContextLabel(returnContext)}`;

    section.appendChild(title);
    section.appendChild(link);

    const firstSection = sidebar.querySelector('.sidebar__section');
    if (firstSection) {
      sidebar.insertBefore(section, firstSection);
    } else {
      sidebar.prepend(section);
    }
  }

  function shouldPropagateToLink(anchor) {
    if (!anchor || !anchor.getAttribute) return false;

    const href = anchor.getAttribute('href');
    if (!href) return false;
    if (href.startsWith('#')) return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;

    let resolved;
    try {
      resolved = new URL(href, window.location.href);
    } catch (_) {
      return false;
    }

    if (resolved.origin !== window.location.origin) return false;
    if (!resolved.pathname.startsWith('/base/')) return false;

    return true;
  }

  function augmentLinkWithContext(anchor, context) {
    if (!context || !context.path) return;
    if (!shouldPropagateToLink(anchor)) return;

    const resolved = new URL(anchor.getAttribute('href'), window.location.href);
    resolved.searchParams.set('from', context.path);

    if (context.title) {
      resolved.searchParams.set('from_title', context.title);
    } else {
      resolved.searchParams.delete('from_title');
    }

    if (context.section) {
      resolved.searchParams.set('from_section', context.section);
    } else {
      resolved.searchParams.delete('from_section');
    }

    const nextHref = `${resolved.pathname}${resolved.search}${resolved.hash}`;
    anchor.setAttribute('href', nextHref);
  }

  function initContextualLinkPropagation(returnContext) {
    const levelContext = getCurrentLevelContext();

    if (levelContext) {
      saveContextToStorage(levelContext);
    }

    if (returnContext && window.location.pathname.startsWith('/base/')) {
      saveContextToStorage(returnContext);
    }

    const contextToPropagate = levelContext || (window.location.pathname.startsWith('/base/') ? returnContext : null);
    if (!contextToPropagate) return;

    document.querySelectorAll('a[href]').forEach((anchor) => {
      augmentLinkWithContext(anchor, contextToPropagate);
    });

    if (!contextLinkBound) {
      document.addEventListener('click', (event) => {
        const anchor = event.target.closest('a[href]');
        if (!anchor) return;

        const freshLevelContext = getCurrentLevelContext();
        const context = freshLevelContext || readContextFromQuery() || readContextFromStorage();
        if (!context) return;

        augmentLinkWithContext(anchor, context);
      });
      contextLinkBound = true;
    }
  }

  function markActiveNavLinks() {
    const current = normalizePath(currentPath());

    document.querySelectorAll('.site-nav__link[href], .mobile-menu__link[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      let linkPath;
      try {
        linkPath = normalizePath(new URL(href, window.location.href).pathname);
      } catch (_) {
        return;
      }

      if (linkPath === '/' || linkPath === '') return;
      if (current === linkPath || current.startsWith(`${linkPath}/`)) {
        link.classList.add('site-nav__link--active');
      }
    });
  }

  function markActiveSidebarLink() {
    const current = normalizePath(currentPath());

    document.querySelectorAll('.sidebar__link[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      let linkPath;
      try {
        linkPath = normalizePath(new URL(href, window.location.href).pathname);
      } catch (_) {
        return;
      }

      if (current === linkPath) {
        link.classList.add('sidebar__link--active');
        link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  function getSidebarTreeStorageKey(section, index) {
    const titleNode = section.querySelector('.sidebar__section-title, .sidebar__section-toggle-label');
    const title = collapseWhitespace(titleNode ? titleNode.textContent : `section-${index}`);
    return `${SIDEBAR_TREE_KEY_PREFIX}${normalizePath(window.location.pathname)}:${index}:${title}`;
  }

  function setSidebarSectionExpanded(section, expanded) {
    const toggle = section.querySelector('.sidebar__section-toggle');
    const children = section.querySelector('.sidebar__section-children');
    if (!toggle || !children) return;

    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    section.classList.toggle('sidebar__section--collapsed', !expanded);
    children.hidden = !expanded;
  }

  function getSidebarDefaultExpanded(sectionMeta) {
    const path = normalizePath(window.location.pathname);
    const isBasePath = path === '/base' || path.startsWith('/base/');
    const levelMatch = path.match(/^\/nivel-(\d)(\/|$)/);
    const isLevelPath = !!levelMatch;
    const isLevelIndex = isLevelPath && path === `/nivel-${levelMatch[1]}`;
    const isBaseIndex = path === '/base';

    if (isLevelIndex || isBaseIndex) {
      // In index pages we prioritize discovery: keep all tree sections expanded.
      return true;
    }

    if (isBasePath) {
      // In Base pages keep focus: open only the active conceptual block.
      return sectionMeta.hasActive;
    }

    if (isLevelPath) {
      if (sectionMeta.activeSectionIndex === -1) {
        return sectionMeta.sectionIndex === 0;
      }

      // In level content pages open the active section and adjacent sections.
      const distance = Math.abs(sectionMeta.sectionIndex - sectionMeta.activeSectionIndex);
      return sectionMeta.hasActive || distance <= 1;
    }

    return sectionMeta.hasActive;
  }

  function initSidebarTree() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const sections = Array.from(sidebar.querySelectorAll('.sidebar__section'));
    const collapsibleSections = [];

    sections.forEach((section, index) => {
      if (section.dataset.treeInitialized === '1') return;
      if (section.classList.contains('sidebar__section--locked')) {
        section.dataset.treeInitialized = '1';
        return;
      }

      const title = section.querySelector('.sidebar__section-title');
      if (!title || title.parentElement !== section) {
        section.dataset.treeInitialized = '1';
        return;
      }

      const links = Array.from(section.querySelectorAll(':scope > .sidebar__link'));
      if (links.length < 2) {
        section.dataset.treeInitialized = '1';
        return;
      }

      const nodesToWrap = Array.from(section.children).filter((node) => node !== title);
      const childrenWrap = document.createElement('div');
      childrenWrap.className = 'sidebar__section-children';
      nodesToWrap.forEach((node) => childrenWrap.appendChild(node));

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'sidebar__section-toggle';
      toggle.setAttribute('aria-expanded', 'true');

      const label = document.createElement('span');
      label.className = 'sidebar__section-toggle-label';
      label.textContent = collapseWhitespace(title.textContent);

      const icon = document.createElement('span');
      icon.className = 'sidebar__section-toggle-icon';
      icon.textContent = 'v';
      icon.setAttribute('aria-hidden', 'true');

      toggle.appendChild(label);
      toggle.appendChild(icon);

      section.replaceChild(toggle, title);
      section.appendChild(childrenWrap);
      section.classList.add('sidebar__section--collapsible');

      const hasActive = section.querySelector('.sidebar__link--active') !== null;
      collapsibleSections.push({
        section,
        sectionIndex: index,
        toggle,
        hasActive,
        storageKey: getSidebarTreeStorageKey(section, index)
      });

      section.dataset.treeInitialized = '1';
    });

    const activeSectionIndex = collapsibleSections.findIndex((item) => item.hasActive);

    collapsibleSections.forEach((item) => {
      const stored = window.sessionStorage.getItem(item.storageKey);
      const shouldExpand = stored === null
        ? getSidebarDefaultExpanded({
            sectionIndex: item.sectionIndex,
            hasActive: item.hasActive,
            activeSectionIndex
          })
        : stored === '1';

      setSidebarSectionExpanded(item.section, shouldExpand);

      item.toggle.addEventListener('click', () => {
        const expanded = item.toggle.getAttribute('aria-expanded') === 'true';
        const nextExpanded = !expanded;
        setSidebarSectionExpanded(item.section, nextExpanded);
        window.sessionStorage.setItem(item.storageKey, nextExpanded ? '1' : '0');
      });
    });
  }

  function initMobileMenu() {
    if (mobileMenuBound) return;

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

    mobileMenuBound = true;
  }

  function initSearch() {
    if (searchBound) return;

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

    searchBound = true;
  }

  function initSmoothScroll() {
    if (smoothScrollBound) return;

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    smoothScrollBound = true;
  }

  function init() {
    const returnContext = getReturnContext();

    initContextualLinkPropagation(returnContext);
    markActiveNavLinks();
    markActiveSidebarLink();
    initContextBackButton(returnContext);
    initSidebarContextBlock(returnContext);
    initSidebarTree();
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




