# TECHNICAL.md

Guía técnica y reglas de implementación para el proyecto `aprendebtc.com`.

## Stack

- HTML5 + CSS3 + JavaScript vanilla.
- Sin frameworks.
- Sin bundlers.
- Sin dependencias de UI.

## Arquitectura base

- `includes/header.html` y `includes/footer.html` se inyectan con `js/includes.js`.
- Usar `data-base-path` correcto en `<html>`:
  - raíz: `data-base-path=""`
  - carpetas: `data-base-path="../"`

Patrón por página:

```html
<div data-include="header"></div>
<!-- contenido -->
<div data-include="footer"></div>
<script src="../js/includes.js"></script>
<script src="../js/nav.js"></script>
<script src="../js/search.js"></script>
```

## Navegación

### Sidebar (árbol completo)

- La navegación lateral es un árbol global (Niveles + Pilares) y se inyecta desde `js/nav.js`.
- Por defecto, todo aparece plegado; el usuario despliega por secciones.
- La página actual queda resaltada y el grupo contiene un estado activo.

Requisito en todas las páginas HTML:

- Incluir un `<nav class="sidebar">` dentro del `<aside>` (puede estar vacío salvo el wrapper del ad-slot).
- No mantener sidebars estáticas antiguas (secciones y nivel actual); `js/nav.js` las elimina si detecta restos.

### Menú móvil

- El menú móvil contiene el mismo árbol de navegación (Niveles + Pilares).

### Botón contextual “Volver”

Gestionado en `js/nav.js`:

- Cuando navegas desde un nivel a una página de `/base/`, se propaga `?from=...` (y se guarda en `sessionStorage`).
- En páginas de Base, si hay contexto válido, aparece un botón de volver junto al breadcrumb.

## Footer (donaciones y enlaces)

- Editar `includes/footer.html` para:
  - Dirección on-chain (BTC) en `data-donate-copy`.
  - Dirección Lightning (LNURL / Lightning Address) en `data-donate-copy`.
  - URI móvil (wallet) en `data-donate-mobile`:
    - On-chain: `bitcoin:...`
    - Lightning: `lightning:...`
  - Enlace PayPal (“invítame a un café”): pendiente hasta tener URL final.

Comportamiento:

- Desktop: el botón copia al portapapeles.
- Móvil: el botón intenta abrir la wallet.
- Las direcciones no deben mostrarse como texto visible.

## Publicidad

- Los `ad-slot` están preparados.
- Por defecto se mantienen ocultos.
- Solo activar explícitamente con `data-ads="on"`.
- Integración AdSense: pendiente (pausada).

## Búsqueda

- `js/search.js` mantiene índice general.
- `js/search-index.base.json` alimenta la Base de Conocimiento.

## QA mínimo antes de cerrar cambios

1. Confirmar includes (`header/footer`).
2. Confirmar sidebar y menú móvil (árbol plegable + activo).
3. Confirmar breadcrumb y navegación anterior/siguiente.
4. Confirmar ausencia de errores JS.
5. Confirmar codificación UTF-8 (sin mojibake).

## Desarrollo local

- Para QA automatizado, arrancar el servidor en modo oculto para evitar ventanas emergentes de consola.

```bash
python -m http.server 4173 --bind 127.0.0.1 --directory .
```

Abrir:

- `http://127.0.0.1:4173/`

## Convenciones de marca

- Usar siempre `aprendeBTC` y `aprendebtc.com`.
- No reintroducir `bitcoinfácil` ni variantes anteriores.
