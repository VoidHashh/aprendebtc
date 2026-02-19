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

## Reglas de navegación

### Sidebar de niveles (obligatorio)

En todas las páginas de nivel (`nivel-1` a `nivel-6`):

1. Incluir bloque `Nivel actual` al inicio del sidebar.
2. Ese bloque enlaza a `index.html` del nivel.
3. En el `index.html` del nivel, ese enlace va activo con `sidebar__link--active`.

### Botón contextual volver

Gestionado globalmente en `js/nav.js`:

- Muestra `<- Volver` encima del breadcrumb en páginas de Base cuando hay contexto de origen.
- El destino se construye con `from` + `from_title` + `from_section` (y respaldo en `sessionStorage`).
- Si no hay contexto válido, el botón no se muestra.

## Reglas de estilo y consistencia

- Mantener el sistema visual dark con acento naranja Bitcoin.
- Evitar estilos inline nuevos; centralizar en CSS.
- Mantener legibilidad (contraste, espaciado y jerarquía).
- Mantener consistencia en cards, sidebar, breadcrumb y `page-nav`.

## Publicidad

- Los `ad-slot` están preparados.
- Por defecto se mantienen ocultos.
- Solo activar explícitamente con `data-ads="on"`.
- Integración AdSense: pendiente (pausada).

## Búsqueda

- `js/search.js` mantiene índice estático general.
- `js/search-index.base.json` alimenta la base de conocimiento.
- Al crear nuevas páginas, actualizar índice de búsqueda.

## QA mínimo antes de cerrar cambios

1. Cargar rutas afectadas en navegador.
2. Confirmar includes (`header/footer`).
3. Confirmar sidebar y enlace de `Nivel actual`.
4. Confirmar breadcrumb y navegación entre páginas.
5. Confirmar ausencia de errores JS.
6. Confirmar codificación UTF-8 (sin mojibake).

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




