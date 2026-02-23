from __future__ import annotations

import html
import re
import unicodedata
from pathlib import Path

ROOT = Path(r"d:\Directorio BTC\aprendebtc")
TXT = Path(r"d:\Directorio BTC\bloques2.txt")

TARGET_SLUGS = {
    "el-hackeo-de-mt-gox.html",
    "silk-road-y-ross-ulbricht.html",
    "la-crisis-de-terra-luna.html",
    "los-etfs-de-bitcoin.html",
}

PAGE_TITLES = {
    "/la-madriguera/": "La Madriguera",
    "/la-madriguera/el-hackeo-de-mt-gox.html": "El hackeo de Mt. Gox: el mayor robo de Bitcoin de la historia",
    "/la-madriguera/silk-road-y-ross-ulbricht.html": "Silk Road, Ross Ulbricht y el debate sobre la libertad",
    "/la-madriguera/la-crisis-de-terra-luna.html": "La crisis de Terra/Luna: la \"stablecoin\" que no era estable",
    "/la-madriguera/los-etfs-de-bitcoin.html": "Los ETFs de Bitcoin: qué son, qué significan y qué cambian",
    "/la-madriguera/la-guerra-del-tamano-de-bloque.html": "La Guerra del Tamaño de Bloque: la batalla que definió Bitcoin",
    "/la-madriguera/el-colapso-de-ftx.html": "El colapso de FTX: qué pasó y qué lecciones dejó",
    "/la-madriguera/bitcoin-y-energia.html": "Bitcoin y energía: el debate completo",
    "/la-madriguera/el-caso-samourai-wallet.html": "El caso Samourai Wallet y el futuro de la privacidad en Bitcoin",
    "/la-madriguera/lightning-network-estado-actual.html": "Lightning Network: dónde estamos y hacia dónde vamos",
    "/la-madriguera/soft-forks-de-bitcoin.html": "Los soft forks de Bitcoin: historia de cada cambio de consenso",
    "/la-madriguera/puede-un-gobierno-prohibir-bitcoin.html": "¿Puede un gobierno prohibir Bitcoin?",
    "/la-madriguera/halving-y-ciclos-de-precio.html": "El halving y los ciclos de precio: ¿correlación o causalidad?",
}

NAV_SEQUENCE = [
    "/la-madriguera/",
    "/la-madriguera/el-hackeo-de-mt-gox.html",
    "/la-madriguera/silk-road-y-ross-ulbricht.html",
    "/la-madriguera/la-crisis-de-terra-luna.html",
    "/la-madriguera/los-etfs-de-bitcoin.html",
    "/la-madriguera/la-guerra-del-tamano-de-bloque.html",
    "/la-madriguera/el-colapso-de-ftx.html",
    "/la-madriguera/bitcoin-y-energia.html",
    "/la-madriguera/el-caso-samourai-wallet.html",
    "/la-madriguera/lightning-network-estado-actual.html",
    "/la-madriguera/soft-forks-de-bitcoin.html",
    "/la-madriguera/puede-un-gobierno-prohibir-bitcoin.html",
    "/la-madriguera/halving-y-ciclos-de-precio.html",
]


def score_text(value: str) -> int:
    good = len(re.findall(r"[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ¿¡]", value))
    bad = len(re.findall(r"[ÃÂâ�]", value))
    return good - (bad * 6)


def repair_mojibake(value: str) -> str:
    if not value:
        return value
    if not any(ch in value for ch in ("Ã", "Â", "â")):
        return value
    try:
        repaired = value.encode("latin1", errors="ignore").decode("utf-8", errors="ignore")
    except Exception:
        return value
    return repaired if score_text(repaired) >= score_text(value) else value


def read_source() -> list[str]:
    data = TXT.read_bytes()
    candidates: list[str] = []
    for enc in ("utf-8", "cp1252", "latin1"):
        try:
            decoded = data.decode(enc, errors="replace")
        except Exception:
            continue
        candidates.append(decoded)
        candidates.append(repair_mojibake(decoded))
    text = max(candidates, key=score_text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [repair_mojibake(line).replace("\ufeff", "") for line in text.split("\n")]
    return lines


def normalize_key(raw: str) -> str:
    norm = unicodedata.normalize("NFKD", raw)
    norm = "".join(ch for ch in norm if unicodedata.category(ch) != "Mn")
    norm = norm.upper()
    norm = re.sub(r"[^A-Z ]+", "", norm)
    return " ".join(norm.split())


def normalize_target(href: str) -> str:
    clean = href.strip()
    clean = clean.replace("/whitepaper.pdf", "/whitepaper-bitcoin-es.pdf")
    clean = clean.replace("https://bitcoin.org/bitcoin.pdf", "/whitepaper-bitcoin-en.pdf")
    clean = clean.replace("http://bitcoin.org/bitcoin.pdf", "/whitepaper-bitcoin-en.pdf")
    clean = clean.replace("/nivel-4/privacidad-la-verdad.html", "/nivel-3/utxos-y-privacidad.html")
    return clean


def parse_articles(lines: list[str]) -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        key, sep, value = line.partition(":")
        if sep and normalize_key(key).endswith("ARTICULO"):
            slug = value.strip()
            i += 1

            title = ""
            meta = ""
            subtitle = ""
            fecha = ""
            longitud = ""
            body_lines: list[str] = []
            header_mode = True

            while i < len(lines):
                current = lines[i]
                stripped = current.strip()
                if stripped:
                    k, s, v = stripped.partition(":")
                    k_norm = normalize_key(k) if s else ""
                    if s and k_norm.endswith("ARTICULO"):
                        break
                    if re.match(r"^Bloque\s+\d+\s+completado", stripped, re.IGNORECASE):
                        break
                    if re.match(r"^FIN\s+DEL\s+BLOQUE", stripped, re.IGNORECASE):
                        break

                if header_mode:
                    if not stripped or set(stripped) <= {"=", "-"}:
                        i += 1
                        continue

                    k, s, v = stripped.partition(":")
                    if s:
                        k_norm = normalize_key(k)
                        val = repair_mojibake(v.strip())
                        if k_norm == "TITULO":
                            title = val
                            i += 1
                            continue
                        if k_norm == "META DESCRIPTION":
                            meta = val
                            i += 1
                            continue
                        if k_norm == "SUBTITULO":
                            subtitle = val
                            i += 1
                            continue
                        if k_norm == "FECHA":
                            fecha = val
                            i += 1
                            continue
                        if k_norm == "LONGITUD":
                            longitud = val
                            i += 1
                            continue

                    header_mode = False

                if stripped.startswith("==="):
                    i += 1
                    continue

                body_lines.append(current.rstrip())
                i += 1

            body = "\n".join(body_lines).strip()
            entries.append(
                {
                    "slug": slug,
                    "title": title,
                    "meta": meta,
                    "subtitle": subtitle,
                    "fecha": fecha,
                    "longitud": longitud,
                    "body": body,
                }
            )
            continue

        i += 1

    return entries


def inline_bold(text: str) -> str:
    chunks = re.split(r"(\*\*.*?\*\*)", text)
    out: list[str] = []
    for chunk in chunks:
        if chunk.startswith("**") and chunk.endswith("**") and len(chunk) > 4:
            out.append(f"<strong>{html.escape(chunk[2:-2])}</strong>")
        else:
            out.append(html.escape(chunk))
    return "".join(out)


def render_inline(text: str) -> str:
    src = repair_mojibake((text or "").strip())
    src = src.replace("â†’", "→")
    src = src.replace(" / ", "/")
    if not src:
        return ""

    m = re.fullmatch(r"(.+?)\s*→\s*(/[^\s]+)", src)
    if m:
        label = inline_bold(m.group(1).strip())
        href = html.escape(normalize_target(m.group(2)), quote=True)
        return f'<a href="{href}">{label}</a>'

    return inline_bold(src)


def body_to_html(body: str) -> str:
    lines = body.splitlines()
    parts: list[str] = []
    paragraph: list[str] = []

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            parts.append(f"<p>{render_inline(' '.join(paragraph))}</p>")
            paragraph = []

    i = 0
    while i < len(lines):
        line = repair_mojibake(lines[i].strip())

        if not line or line == "---" or line.startswith("==="):
            flush_paragraph()
            i += 1
            continue

        if re.match(r"^FIN\s+DEL\s+BLOQUE", line, re.IGNORECASE):
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
            parts.append(f"<h2>{render_inline(heading_text)}</h2>")
            i += 1
            continue

        if line.startswith("- "):
            flush_paragraph()
            items: list[str] = []
            while i < len(lines):
                candidate = repair_mojibake(lines[i].strip())
                if not candidate.startswith("- "):
                    break
                items.append(candidate[2:].strip())
                i += 1
            li = "".join(f"<li>{render_inline(item)}</li>" for item in items)
            parts.append(f"<ul>{li}</ul>")
            continue

        paragraph.append(line)
        i += 1

    flush_paragraph()
    return "\n\n".join(parts)


def reading_minutes(body: str) -> int:
    words = re.findall(r"\w+", body, flags=re.UNICODE)
    return max(1, round(len(words) / 230))


def page_nav_for(slug: str) -> tuple[tuple[str, str] | None, tuple[str, str] | None]:
    current = f"/la-madriguera/{slug}"
    if current not in NAV_SEQUENCE:
        return None, None

    idx = NAV_SEQUENCE.index(current)

    prev_item = None
    next_item = None

    if idx > 0:
        prev_url = NAV_SEQUENCE[idx - 1]
        prev_item = (prev_url, PAGE_TITLES.get(prev_url, "Anterior"))

    if idx < len(NAV_SEQUENCE) - 1:
        next_url = NAV_SEQUENCE[idx + 1]
        next_item = (next_url, PAGE_TITLES.get(next_url, "Siguiente"))

    return prev_item, next_item


def render_page(article: dict[str, str]) -> str:
    slug = article["slug"]
    title = article["title"].strip()
    subtitle = article["subtitle"].strip()
    meta = article["meta"].strip()
    fecha = article["fecha"].strip()
    body = article["body"].strip()

    minutes = reading_minutes(body)
    content_html = body_to_html(body)
    prev_item, next_item = page_nav_for(slug)

    canonical = f"https://aprendebtc.com/la-madriguera/{slug}"

    prev_html = "<div></div>"
    if prev_item:
        prev_html = (
            f'<a href="{prev_item[0]}" class="page-nav__item">'
            f'<span class="page-nav__label">← Anterior</span>'
            f'<span class="page-nav__title">{html.escape(prev_item[1])}</span>'
            "</a>"
        )

    next_html = "<div></div>"
    if next_item:
        next_html = (
            f'<a href="{next_item[0]}" class="page-nav__item page-nav__item--next">'
            f'<span class="page-nav__label">Siguiente →</span>'
            f'<span class="page-nav__title">{html.escape(next_item[1])}</span>'
            "</a>"
        )

    date_line = ""
    if fecha:
        date_line = (
            f'<p style="color: var(--text-secondary);">'
            f'Fecha de publicación: {html.escape(fecha)} · Tiempo de lectura: ~{minutes} minutos'
            "</p>"
        )

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
    <aside class=\"page-layout__sidebar\" aria-label=\"Navegación de la madriguera\">
      <nav class=\"sidebar\">
        <div class=\"sidebar__ad-wrap\">
          <div class=\"ad-slot ad-sidebar\" id=\"ad-sidebar-auto\" aria-hidden=\"true\"></div>
        </div>
      </nav>
    </aside>

    <main class=\"page-layout__content\" id=\"main-content\">
      <div class=\"content-inner\">
        <nav class=\"breadcrumb\" aria-label=\"Ruta de navegación\">
          <a href=\"/\" class=\"breadcrumb__item\">Inicio</a>
          <span class=\"breadcrumb__separator\" aria-hidden=\"true\">›</span>
          <a href=\"/la-madriguera/\" class=\"breadcrumb__item\">La Madriguera</a>
          <span class=\"breadcrumb__separator\" aria-hidden=\"true\">›</span>
          <span class=\"breadcrumb__current\">{html.escape(title)}</span>
        </nav>

        <article class=\"article\">
          <div class=\"nivel-badge nivel-badge--4 article__badge\">La madriguera</div>
          <h1>{html.escape(title)}</h1>
          <p class=\"article__subtitle\">{html.escape(subtitle)}</p>
          {date_line}

{content_html}

          <div class=\"ad-slot ad-content\" id=\"ad-content-{slug.replace('.html', '')}\" aria-hidden=\"true\"></div>

          <nav class=\"page-nav\" aria-label=\"Navegación entre páginas\">
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
    lines = read_source()
    parsed = [x for x in parse_articles(lines) if x["slug"] in TARGET_SLUGS]

    if not parsed:
        raise SystemExit("No se encontraron artículos objetivo en bloques2.txt")

    for article in parsed:
        output = ROOT / "la-madriguera" / article["slug"]
        output.write_text(render_page(article), encoding="utf-8", newline="\n")

    print(f"Artículos regenerados: {len(parsed)}")


if __name__ == "__main__":
    main()
