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
- Respetar `data-base-path` según profundidad.

## 3) Reglas de marca y naming

- Usar siempre `aprendebtc.com` y `aprendeBTC`.
- No reintroducir textos de la marca anterior (`bitcoinfácil`, `bitcoinfacil`).

## 4) Reglas de navegación

### Sidebar en páginas de nivel (obligatorio)

En `nivel-1` a `nivel-6`:

1. Incluir bloque `Nivel actual` al inicio del sidebar.
2. Enlace del bloque: `index.html` del nivel.
3. En el índice del nivel, marcar ese enlace con `sidebar__link--active`.

### Botón contextual volver (global)

- Gestionado por `js/nav.js`.
- Mostrar `<- Volver` encima del breadcrumb en páginas de Base cuando exista contexto de origen.
- Comportamiento:
  - con contexto (`from`/storage) válido -> enlace directo a la página de origen
  - sin contexto válido -> no mostrar botón contextual

## 5) Reglas de contenido y estilo

- Tono didáctico, claro y honesto.
- Evitar tecnicismo innecesario en niveles iniciales.
- Enlazar a `/base/` cuando se menciona un concepto de referencia.
- Mantener consistencia visual del sistema actual.
- Evitar nuevos estilos inline; centralizar en CSS.
- Cuidar contraste en header/sidebar y legibilidad de `page-nav`.

## 6) Publicidad

- Los `ad-slot` existen pero deben quedar ocultos por defecto.
- Solo activar si se define explícitamente (`data-ads="on"`).
- Ads de AdSense están en pausa hasta nueva instrucción.

## 7) Búsqueda

- Actualizar `js/search.js` al crear páginas nuevas de niveles.
- Actualizar `js/search-index.base.json` para nuevas páginas de base.
- Verificar que búsquedas clave devuelven resultados esperados.

## 8) QA mínimo antes de cerrar cambios

- Ejecutar servidor/pruebas locales en modo oculto siempre que sea posible (sin abrir ventanas visibles de consola).


1. Levantar servidor local y abrir rutas afectadas.
2. Confirmar carga de includes (`header/footer`).
3. Confirmar sidebar y enlace de `Nivel actual`.
4. Confirmar breadcrumb y navegación anterior/siguiente.
5. Confirmar ausencia de errores JS en consola.
6. Confirmar UTF-8 correcto (sin mojibake).

## 9) Flujo de trabajo recomendado

1. Crear estructura de página.
2. Integrar contenido en template existente.
3. Asegurar consistencia CSS/JS reusable.
4. Validar en navegador (ideal: pruebas headless + revisión visual).
5. Actualizar búsqueda si aplica.

## 10) Notas de alcance

- El `sitemap.xml` definitivo se cerrará al final del proyecto.
- No dejar placeholders rotos; si una ruta no existe aún, documentarlo.




