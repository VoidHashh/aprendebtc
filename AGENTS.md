# AGENTS.md

Instrucciones operativas para cualquier agente que trabaje en este repositorio.

## 1) Reglas de producto

- Proyecto: `aprendebtc.com`.
- Marca: `aprendeBTC`.
- Sitio multipágina educativo sobre Bitcoin.
- Estructura conceptual fija:
  - Pilares = referencia.
  - Niveles = acción paso a paso.

## 2) Reglas técnicas

- Stack obligatorio: HTML/CSS/JS vanilla.
- No frameworks, no bundlers, no dependencias de UI.
- Mantener arquitectura de includes:
  - `includes/header.html`
  - `includes/footer.html`
  - `js/includes.js`

## 3) Reglas de marca y naming

- Usar siempre `aprendebtc.com` y `aprendeBTC`.
- No reintroducir textos de la marca anterior (`bitcoinfácil`, `bitcoinfacil`).

## 4) Reglas de navegación

- Sidebar y menú móvil usan un árbol global (Niveles + Pilares) inyectado por `js/nav.js`.
- Todo plegado por defecto.
- La página actual debe quedar resaltada.

Botón contextual volver (global):

- Gestionado por `js/nav.js`.
- En páginas de Base, mostrar “Volver” si existe contexto válido (`from` / `sessionStorage`).

## 5) Reglas de contenido y estilo

- Tono didáctico, claro y honesto.
- Evitar tecnicismo innecesario en niveles iniciales.
- Enlazar a `/base/` cuando se menciona un concepto de referencia.
- Mantener consistencia visual del sistema actual.
- Evitar nuevos estilos inline; centralizar en CSS.

## 6) Publicidad

- Los `ad-slot` existen pero deben quedar ocultos por defecto.
- Solo activar si se define explícitamente (`data-ads="on"`).
- Ads de AdSense están en pausa hasta nueva instrucción.

## 7) Búsqueda

- Actualizar `js/search.js` al crear páginas nuevas de niveles.
- Actualizar `js/search-index.base.json` para nuevas páginas de Base.

## 8) QA mínimo antes de cerrar cambios

- Ejecutar servidor/pruebas locales en modo oculto siempre que sea posible (sin abrir ventanas visibles de consola).

1. Confirmar carga de includes (`header/footer`).
2. Confirmar sidebar y menú móvil (árbol plegable + activo).
3. Confirmar breadcrumb y navegación anterior/siguiente.
4. Confirmar ausencia de errores JS en consola.
5. Confirmar UTF-8 correcto (sin mojibake).

## 9) Notas de alcance

- El `sitemap.xml` definitivo se cerrará al final del proyecto.
- No dejar placeholders rotos; si una ruta no existe aún, documentarlo.
