from __future__ import annotations

import html
import re
import unicodedata
from pathlib import Path

ROOT = Path(r"d:\Directorio BTC\aprendebtc")
TXT = Path(r"d:\Directorio BTC\bloques2.txt")
DEFAULT_DIR = "la-madriguera"

NAV_SEQUENCE = [
    "/la-madriguera/",
    "/la-madriguera/los-primeros-dias-de-bitcoin.html",
    "/la-madriguera/bitcoin-y-wikileaks.html",
    "/la-madriguera/silk-road-y-ross-ulbricht.html",
    "/la-madriguera/el-hackeo-de-mt-gox.html",
    "/la-madriguera/la-guerra-del-tamano-de-bloque.html",
    "/la-madriguera/la-crisis-de-terra-luna.html",
    "/la-madriguera/el-colapso-de-ftx.html",
    "/la-madriguera/ordinals-inscriptions-debate.html",
    "/la-madriguera/el-caso-samourai-wallet.html",
    "/la-madriguera/los-etfs-de-bitcoin.html",
    "/la-madriguera/el-ataque-del-51-por-ciento.html",
    "/la-madriguera/bloques-huerfanos-y-reorganizaciones.html",
    "/la-madriguera/el-problema-del-general-bizantino.html",
    "/la-madriguera/el-doble-gasto.html",
    "/la-madriguera/la-politica-monetaria-de-bitcoin.html",
    "/la-madriguera/soft-forks-de-bitcoin.html",
    "/la-madriguera/multisig-custodia-y-herencia-segun-satoshi.html",
    "/la-madriguera/economia-austriaca-para-bitcoiners.html",
    "/la-madriguera/bitcoin-y-energia.html",
    "/la-madriguera/la-geopolitica-de-la-mineria.html",
    "/la-madriguera/lightning-network-estado-actual.html",
    "/la-madriguera/privacidad-en-bitcoin-estado-actual.html",
    "/la-madriguera/puede-un-gobierno-prohibir-bitcoin.html",
    "/la-madriguera/el-debate-de-la-osificacion.html",
    "/la-madriguera/bitcoin-medio-de-pago-vs-reserva-de-valor.html",
    "/la-madriguera/hiperinflaciones-y-bitcoin.html",
    "/la-madriguera/halving-y-ciclos-de-precio.html",
]

LINK_MAP = {
    "/whitepaper.pdf": "/whitepaper-bitcoin-es.pdf",
    "https://bitcoin.org/bitcoin.pdf": "/whitepaper-bitcoin-en.pdf",
    "http://bitcoin.org/bitcoin.pdf": "/whitepaper-bitcoin-en.pdf",
    "/nivel-4/privacidad-la-verdad.html": "/nivel-3/utxos-y-privacidad.html",
    "/la-madriguera/los-soft-forks-de-bitcoin.html": "/la-madriguera/soft-forks-de-bitcoin.html",
    "/nivel-4/tor-bitcoin.html": "/nivel-3/utxos-y-privacidad.html",
}


def score_text(value: str) -> int:
    good = len(re.findall(r"[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ¿¡]", value))
    bad = len(re.findall(r"[ÃÂâ�]", value))
    return good - (bad * 6)


def maybe_repair_mojibake(value: str) -> str:
    if not value:
        return value
    if not any(ch in value for ch in ("Ã", "Â", "â")):
        return value
    try:
        repaired = value.encode("latin1", errors="ignore").decode("utf-8", errors="ignore")
    except Exception:
        return value
    return repaired if score_text(repaired) >= score_text(value) else value


def read_source_lines() -> list[str]:
    raw = TXT.read_bytes()
    candidates: list[str] = []

    for enc in ("utf-8", "cp1252", "latin1"):
        try:
            decoded = raw.decode(enc, errors="replace")
        except Exception:
            continue
        candidates.append(decoded)
        candidates.append(maybe_repair_mojibake(decoded))

    text = max(candidates, key=score_text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    return [maybe_repair_mojibake(line).replace("\ufeff", "") for line in text.split("\n")]


def normalize_key(raw: str) -> str:
    normalized = unicodedata.normalize("NFKD", raw)
    normalized = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    normalized = normalized.upper()
    normalized = re.sub(r"[^A-Z ]+", "", normalized)
    return " ".join(normalized.split())


def normalize_page_path(raw_path: str) -> str:
    value = maybe_repair_mojibake(raw_path.strip().replace("\\", "/"))
    value = value.lstrip("/")
    if "/" not in value:
        return f"{DEFAULT_DIR}/{value}"
    return value


def normalize_target(href: str) -> str:
    clean = maybe_repair_mojibake(href.strip())
    return LINK_MAP.get(clean, clean)


def parse_blocks(lines: list[str]) -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    i = 0

    while i < len(lines):
        stripped = lines[i].strip()
        if not stripped or ":" not in stripped:
            i += 1
            continue

        key, _, value = stripped.partition(":")
        key_norm = normalize_key(key)

        if key_norm not in {"ARTICULO", "PAGINA"}:
            i += 1
            continue

        page_path = normalize_page_path(value)
        i += 1

        title = ""
        meta = ""
        subtitle = ""
        date = ""
        length = ""
        body_lines: list[str] = []
        in_header = True

        while i < len(lines):
            line = lines[i]
            s = line.strip()

            if s and ":" in s:
                mk, _, _ = s.partition(":")
                mk_norm = normalize_key(mk)
                if mk_norm in {"ARTICULO", "PAGINA"}:
                    break

            if re.match(r"^Bloque\s+\d+\s+completado", s, re.IGNORECASE):
                break

            if re.match(r"^FIN\s+DEL\s+BLOQUE", s, re.IGNORECASE):
                i += 1
                continue

            if re.match(r"^#\s*BLOQUE", s, re.IGNORECASE):
                i += 1
                continue

            if re.match(r"^Crea\s+esta\s+nueva\s+organizaci", s, re.IGNORECASE):
                break

            if re.match(r"^(HISTORIA|FUNDAMENTOS|AN[A?]LISIS)\b", s, re.IGNORECASE):
                break

            if in_header:
                if not s or set(s) <= {"=", "-"}:
                    i += 1
                    continue

                if ":" in s:
                    hk, _, hv = s.partition(":")
                    hk_norm = normalize_key(hk)
                    hv = maybe_repair_mojibake(hv.strip())

                    if hk_norm == "TITULO":
                        title = hv
                        i += 1
                        continue
                    if hk_norm == "META DESCRIPTION":
                        meta = hv
                        i += 1
                        continue
                    if hk_norm == "SUBTITULO":
                        subtitle = hv
                        i += 1
                        continue
                    if hk_norm == "FECHA":
                        date = hv
                        i += 1
                        continue
                    if hk_norm == "LONGITUD":
                        length = hv
                        i += 1
                        continue

                in_header = False

            if s.startswith("==="):
                i += 1
                continue

            body_lines.append(line.rstrip())
            i += 1

        entries.append(
            {
                "path": page_path,
                "title": title,
                "meta": meta,
                "subtitle": subtitle,
                "date": date,
                "length": length,
                "body": "\n".join(body_lines).strip(),
            }
        )

    return [e for e in entries if e["path"].startswith("la-madriguera/")]


def fallback_title(slug: str) -> str:
    base = slug.replace(".html", "").replace("-", " ").strip()
    return base[:1].upper() + base[1:]


def inline_with_bold(text: str) -> str:
    parts = re.split(r"(\*\*.*?\*\*)", text)
    out: list[str] = []
    for part in parts:
        if part.startswith("**") and part.endswith("**") and len(part) > 4:
            out.append(f"<strong>{html.escape(part[2:-2])}</strong>")
        else:
            out.append(html.escape(part))
    return "".join(out)


def render_inline(text: str) -> str:
    src = maybe_repair_mojibake((text or "").strip())
    if not src:
        return ""

    src = src.replace("â†’", "→")
    m = re.fullmatch(r"(.+?)\s*(?:→|->)\s*(/[\w\-\./]+)", src)
    if m:
        label = inline_with_bold(m.group(1).strip())
        href = html.escape(normalize_target(m.group(2)), quote=True)
        return f'<a href="{href}">{label}</a>'

    return inline_with_bold(src)


def body_to_html(body: str) -> str:
    lines = body.splitlines()
    out: list[str] = []
    paragraph: list[str] = []

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            out.append(f"<p>{render_inline(' '.join(paragraph))}</p>")
            paragraph = []

    i = 0
    while i < len(lines):
        line = maybe_repair_mojibake(lines[i].strip())

        if not line or line == "---" or line.startswith("==="):
            flush_paragraph()
            i += 1
            continue

        heading_match = re.fullmatch(r"\*\*(.+?)\*\*", line)
        if heading_match:
            heading_text = heading_match.group(1).strip()
            if re.match(r"^FIN\s+DEL\s+BLOQUE", heading_text, re.IGNORECASE):
                flush_paragraph()
                i += 1
                continue
            flush_paragraph()
            out.append(f"<h2>{render_inline(heading_text)}</h2>")
            i += 1
            continue

        if line.startswith("- "):
            flush_paragraph()
            items: list[str] = []
            while i < len(lines):
                current = maybe_repair_mojibake(lines[i].strip())
                if not current.startswith("- "):
                    break
                items.append(current[2:].strip())
                i += 1
            out.append("<ul>" + "".join(f"<li>{render_inline(item)}</li>" for item in items) + "</ul>")
            continue

        paragraph.append(line)
        i += 1

    flush_paragraph()
    return "\n\n".join(out)


def reading_minutes(text: str) -> int:
    words = re.findall(r"\w+", text, flags=re.UNICODE)
    return max(1, round(len(words) / 230))


def collect_titles() -> dict[str, str]:
    titles: dict[str, str] = {"/la-madriguera/": "La Madriguera"}
    for route in NAV_SEQUENCE:
        if route == "/la-madriguera/":
            continue
        file_path = ROOT / route.lstrip("/")
        if not file_path.exists():
            continue
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        m = re.search(r"<h1[^>]*>(.*?)</h1>", content, re.IGNORECASE | re.DOTALL)
        if not m:
            continue
        title = re.sub(r"<[^>]+>", "", m.group(1)).strip()
        titles[route] = html.unescape(title)
    return titles


def nav_links(path: str, titles: dict[str, str]) -> tuple[tuple[str, str] | None, tuple[str, str] | None]:
    route = "/" + path.lstrip("/")
    if route not in NAV_SEQUENCE:
        return None, None

    idx = NAV_SEQUENCE.index(route)
    prev_item = None
    next_item = None

    if idx > 0:
        prev_route = NAV_SEQUENCE[idx - 1]
        prev_title = titles.get(prev_route, fallback_title(prev_route.split("/")[-1]))
        prev_item = (prev_route, prev_title)

    if idx < len(NAV_SEQUENCE) - 1:
        next_route = NAV_SEQUENCE[idx + 1]
        next_title = titles.get(next_route, fallback_title(next_route.split("/")[-1]))
        next_item = (next_route, next_title)

    return prev_item, next_item


def render_page(entry: dict[str, str], titles: dict[str, str]) -> str:
    path = entry["path"]
    route = "/" + path
    slug = path.split("/")[-1]

    title = entry["title"].strip() or fallback_title(slug)
    subtitle = entry["subtitle"].strip() or "Analisis en profundidad para entender Bitcoin con mas contexto historico y tecnico."
    meta = entry["meta"].strip() or subtitle

    body = entry["body"].strip()
    article_html = body_to_html(body)

    date = entry["date"].strip()
    mins = reading_minutes(body)

    prev_item, next_item = nav_links(path, titles)

    prev_html = "<div></div>"
    if prev_item:
        prev_html = (
            f'<a href="{prev_item[0]}" class="page-nav__item">'
            f'<span class="page-nav__label">&larr; Anterior</span>'
            f'<span class="page-nav__title">{html.escape(prev_item[1])}</span>'
            "</a>"
        )

    next_html = "<div></div>"
    if next_item:
        next_html = (
            f'<a href="{next_item[0]}" class="page-nav__item page-nav__item--next">'
            f'<span class="page-nav__label">Siguiente &rarr;</span>'
            f'<span class="page-nav__title">{html.escape(next_item[1])}</span>'
            "</a>"
        )

    date_line = ""
    if date:
        date_line = (
            f'<p style="color: var(--text-secondary);">'
            f'Fecha de publicacion: {html.escape(date)} &middot; Tiempo de lectura: ~{mins} minutos'
            "</p>"
        )

    canonical = f"https://aprendebtc.com{route}"

    return f"""<!DOCTYPE html>
<html lang=\"es\" data-base-path=\"../\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <meta name=\"description\" content=\"{html.escape(meta, quote=True)}\" />
  <meta property=\"og:title\" content=\"{html.escape(title)} | aprendebtc.com\" />
  <meta property=\"og:description\" content=\"{html.escape(meta, quote=True)}\" />
  <meta property=\"og:type\" content=\"article\" />
  <meta property=\"og:url\" content=\"{canonical}\" />
  <meta name=\"twitter:card\" content=\"summary_large_image\" />
  <meta name=\"twitter:title\" content=\"{html.escape(title)} | aprendebtc.com\" />
  <meta name=\"twitter:description\" content=\"{html.escape(meta, quote=True)}\" />
  <title>{html.escape(title)} | aprendebtc.com</title>
  <link rel=\"canonical\" href=\"{canonical}\" />
  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />
  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />
  <link rel=\"stylesheet\" href=\"../css/main.css\" />
  <link rel=\"stylesheet\" href=\"../css/components.css\" />
</head>
<body>
  <div data-include=\"header\"></div>

  <div class=\"page-layout\">
    <aside class=\"page-layout__sidebar\" aria-label=\"Navegacion de la madriguera\">
      <nav class=\"sidebar\">
        <div class=\"sidebar__ad-wrap\">
          <div class=\"ad-slot ad-sidebar\" id=\"ad-sidebar-auto\" aria-hidden=\"true\"></div>
        </div>
      </nav>
    </aside>

    <main class=\"page-layout__content\" id=\"main-content\">
      <div class=\"content-inner\">
        <nav class=\"breadcrumb\" aria-label=\"Ruta de navegacion\">
          <a href=\"/\" class=\"breadcrumb__item\">Inicio</a>
          <span class=\"breadcrumb__separator\" aria-hidden=\"true\">&rsaquo;</span>
          <a href=\"/la-madriguera/\" class=\"breadcrumb__item\">La Madriguera</a>
          <span class=\"breadcrumb__separator\" aria-hidden=\"true\">&rsaquo;</span>
          <span class=\"breadcrumb__current\">{html.escape(title)}</span>
        </nav>

        <article class=\"article\">
          <div class=\"nivel-badge nivel-badge--4 article__badge\">La madriguera</div>
          <h1>{html.escape(title)}</h1>
          <p class=\"article__subtitle\">{html.escape(subtitle)}</p>
          {date_line}

{article_html}

          <div class=\"ad-slot ad-content\" id=\"ad-content-{slug.replace('.html', '')}\" aria-hidden=\"true\"></div>

          <nav class=\"page-nav\" aria-label=\"Navegacion entre paginas\">
            {prev_html}
            {next_html}
          </nav>
        </article>
      </div>
    </main>
  </div>

  <div data-include=\"footer\"></div>
  <script src=\"../js/includes.js\"></script>
  <script src=\"../js/nav.js\"></script>
  <script src=\"../js/search.js\"></script>
</body>
</html>
"""


def main() -> None:
    lines = read_source_lines()
    entries = parse_blocks(lines)
    if not entries:
        raise SystemExit("No pages detected in bloques2.txt")

    titles = collect_titles()
    for entry in entries:
        route = "/" + entry["path"]
        if entry["title"].strip():
            titles[route] = entry["title"].strip()

    generated = 0
    for entry in entries:
        out_file = ROOT / entry["path"]
        out_file.parent.mkdir(parents=True, exist_ok=True)
        out_file.write_text(render_page(entry, titles), encoding="utf-8", newline="\n")
        generated += 1

    print(f"Articulos generados/actualizados: {generated}")


if __name__ == "__main__":
    main()
