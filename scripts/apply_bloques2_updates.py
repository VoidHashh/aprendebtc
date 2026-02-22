from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(r"d:\Directorio BTC\aprendebtc")
TXT = Path(r"d:\Directorio BTC\bloques2.txt")

START_RE = re.compile(r"^\s*P(?:Á|A)GINA:\s*(.+?)\s*$", re.IGNORECASE)
TITLE_RE = re.compile(r"^\s*T(?:Í|I)TULO:\s*(.+?)\s*$", re.IGNORECASE)
META_RE = re.compile(r"^\s*META DESCRIPTION:\s*(.+?)\s*$", re.IGNORECASE)
SUBTITLE_RE = re.compile(r"^\s*SUBT(?:Í|I)TULO:\s*(.+?)\s*$", re.IGNORECASE)
MOJIBAKE_HINT_RE = re.compile(r"[ÃÂâ]")


def text_score(value: str) -> int:
    good = len(re.findall(r"[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ¿¡]", value))
    bad = len(re.findall(r"[ÃÂâ�]", value))
    return good - (bad * 4)


def repair_mojibake(value: str) -> str:
    raw = value or ""
    if not raw:
        return raw
    if not MOJIBAKE_HINT_RE.search(raw):
        return raw
    try:
        repaired = raw.encode("latin1", errors="ignore").decode("utf-8", errors="ignore")
        if repaired and text_score(repaired) >= text_score(raw):
            return repaired
    except Exception:
        pass
    return raw


def read_text_auto(path: Path) -> str:
    data = path.read_bytes()
    candidates: list[str] = []
    for enc in ("utf-8", "cp1252", "latin1"):
        try:
            decoded = data.decode(enc, errors="ignore")
            candidates.append(decoded)
            candidates.append(repair_mojibake(decoded))
        except Exception:
            continue
    if not candidates:
        return ""
    best = max(candidates, key=text_score)
    return best.replace("\r\n", "\n").replace("\r", "\n")


def normalize_whitepaper_url(url: str) -> str:
    clean = (url or "").strip().rstrip(")")
    if clean == "/whitepaper.pdf":
        return "/whitepaper-bitcoin-es.pdf"
    if clean in ("https://bitcoin.org/bitcoin.pdf", "http://bitcoin.org/bitcoin.pdf", "bitcoin.org/bitcoin.pdf"):
        return "/whitepaper-bitcoin-en.pdf"
    if clean.startswith("bitcoin.org/"):
        return "/whitepaper-bitcoin-en.pdf"
    return clean


def clean_inline_targets(value: str) -> str:
    text = value or ""
    text = text.replace("/whitepaper.pdf", "/whitepaper-bitcoin-es.pdf")
    text = text.replace("https://bitcoin.org/bitcoin.pdf", "/whitepaper-bitcoin-en.pdf")
    text = text.replace("http://bitcoin.org/bitcoin.pdf", "/whitepaper-bitcoin-en.pdf")
    text = text.replace("bitcoin.org/bitcoin.pdf", "/whitepaper-bitcoin-en.pdf")
    text = text.replace("/nivel-4/privacidad-la-verdad.html", "/nivel-3/utxos-y-privacidad.html")
    text = text.replace("/nivel-4/payjoin.html", "/nivel-4/coinjoin.html")
    text = text.replace("/nivel-5/segwit.html", "/nivel-5/segwit-internals.html")
    return text


def escape_with_bold(text: str) -> str:
    parts = re.split(r"(\*\*.*?\*\*)", clean_inline_targets(text))
    out: list[str] = []
    for part in parts:
        if part.startswith("**") and part.endswith("**") and len(part) >= 4:
            out.append(f"<strong>{html.escape(part[2:-2])}</strong>")
        else:
            out.append(html.escape(part))
    return "".join(out)


def format_inline(text: str) -> str:
    raw = clean_inline_targets((text or "").strip())
    if not raw:
        return ""

    match = re.match(r"^(.*?)\s*→\s*([^\s]+)\s*$", raw)
    if match:
        label = match.group(1).strip() or "Abrir"
        url = normalize_whitepaper_url(match.group(2).strip())
        return f'<a href="{html.escape(url, quote=True)}">{escape_with_bold(label)}</a>'

    return escape_with_bold(raw)


def parse_blocks() -> list[dict[str, str]]:
    text = read_text_auto(TXT)
    lines = [repair_mojibake(line).lstrip("\ufeff") for line in text.split("\n")]

    starts: list[int] = []
    for i, line in enumerate(lines):
        if START_RE.match(line.strip()):
            starts.append(i)
    starts.append(len(lines))

    blocks: list[dict[str, str]] = []
    for n in range(len(starts) - 1):
        s, e = starts[n], starts[n + 1]
        chunk = lines[s:e]
        if not chunk:
            continue

        page_path = ""
        title = ""
        meta = ""
        subtitle = ""
        body_start = 1

        path_match = START_RE.match(chunk[0].strip())
        if path_match:
            page_path = repair_mojibake(path_match.group(1).strip())

        for j in range(1, len(chunk)):
            line = repair_mojibake(chunk[j].strip())
            if not line or line.startswith("==="):
                continue

            title_match = TITLE_RE.match(line)
            if title_match:
                title = repair_mojibake(title_match.group(1).strip())
                body_start = j + 1
                continue

            meta_match = META_RE.match(line)
            if meta_match:
                meta = repair_mojibake(meta_match.group(1).strip())
                body_start = j + 1
                continue

            subtitle_match = SUBTITLE_RE.match(line)
            if subtitle_match:
                subtitle = repair_mojibake(subtitle_match.group(1).strip())
                body_start = j + 1
                continue

            body_start = j
            break

        body_lines: list[str] = []
        for line in chunk[body_start:]:
            cleaned = repair_mojibake(line.rstrip())
            if re.match(r"^\s*Bloque\s+\d+\s+completado", cleaned, re.IGNORECASE):
                break
            if re.match(r"^\s*##\s*LA\s+MADRIGUERA\b", cleaned, re.IGNORECASE):
                break
            if cleaned.strip().startswith("==="):
                continue
            body_lines.append(cleaned)

        body = "\n".join(body_lines).strip()
        if "<!DOCTYPE html>" in body:
            # The txt embeds a full standalone draft for this page. Keep the editorial part only.
            body = body.split("<!DOCTYPE html>", 1)[0].strip()

        blocks.append(
            {
                "path": page_path,
                "title": title,
                "meta": meta,
                "subtitle": subtitle,
                "body": body,
            }
        )

    return [b for b in blocks if b["path"]]


def render_callout(lines: list[str]) -> str:
    payload = [line.lstrip(">").strip() for line in lines if line.strip()]
    if not payload:
        return ""

    kind = "info"
    title = "Informacion"
    body_lines: list[str] = []

    match = re.match(r"^\*\*CALLOUT\s+([A-Z]+)(?::\s*([^*]+))?\*\*(?::\s*(.*))?$", payload[0], re.IGNORECASE)
    if match:
        k = (match.group(1) or "info").lower()
        if k in {"info", "warning", "danger", "success"}:
            kind = k
        title = match.group(2).strip() if match.group(2) else {"info": "Informacion", "warning": "Atencion", "danger": "Alerta", "success": "Exito"}[kind]
        if match.group(3):
            body_lines.append(match.group(3).strip())
        body_lines.extend(payload[1:])
    else:
        body_lines = payload

    icon = {"info": "💡", "warning": "⚠️", "danger": "🚨", "success": "✅"}[kind]
    body_html = "".join(f'<p class="callout__text">{format_inline(x)}</p>' for x in body_lines if x.strip())

    return (
        f'<div class="callout callout--{kind}">'
        f'<span class="callout__icon" aria-hidden="true">{icon}</span>'
        f'<div class="callout__content"><div class="callout__title">{html.escape(title)}</div>{body_html}</div>'
        "</div>"
    )


def render_note(line: str) -> str:
    content = line.strip()[1:-1].strip() if line.strip().startswith("[") and line.strip().endswith("]") else line
    return (
        '<div class="callout callout--info">'
        '<span class="callout__icon" aria-hidden="true">💡</span>'
        f'<div class="callout__content"><div class="callout__title">Nota</div><p class="callout__text">{format_inline(content)}</p></div>'
        "</div>"
    )


def render_table(lines: list[str]) -> str:
    rows = [[cell.strip() for cell in row.strip().strip("|").split("|")] for row in lines]
    if not rows:
        return ""

    has_separator = len(rows) >= 2 and all(re.fullmatch(r"[:\-\s]+", c or "-") for c in rows[1])
    headers = rows[0]
    body_rows = rows[2:] if has_separator else rows[1:]

    thead = "".join(f"<th>{format_inline(cell)}</th>" for cell in headers)
    tbody = "".join("<tr>" + "".join(f"<td>{format_inline(cell)}</td>" for cell in row) + "</tr>" for row in body_rows)
    return f'<div class="table-wrap"><table class="article-table"><thead><tr>{thead}</tr></thead><tbody>{tbody}</tbody></table></div>'


def body_to_html(body: str) -> str:
    lines = body.splitlines()
    out: list[str] = []
    paragraph: list[str] = []

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            out.append(f"<p>{format_inline(' '.join(paragraph))}</p>")
            paragraph = []

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        if not line or line.startswith("===") or line == "---":
            flush_paragraph()
            i += 1
            continue

        if line.startswith("[NOTA:") and line.endswith("]"):
            flush_paragraph()
            out.append(render_note(line))
            i += 1
            continue

        if line.startswith("# "):
            flush_paragraph()
            out.append(f"<h2>{format_inline(line[2:])}</h2>")
            i += 1
            continue

        if line.startswith("**") and line.endswith("**") and len(line) > 4:
            flush_paragraph()
            out.append(f"<h2>{format_inline(line[2:-2])}</h2>")
            i += 1
            continue

        if line.startswith(">"):
            flush_paragraph()
            callout_block = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                callout_block.append(lines[i].strip())
                i += 1
            out.append(render_callout(callout_block))
            continue

        if line.startswith("- "):
            flush_paragraph()
            items = []
            while i < len(lines) and lines[i].strip().startswith("- "):
                items.append(lines[i].strip()[2:])
                i += 1
            out.append("<ul>" + "".join(f"<li>{format_inline(item)}</li>" for item in items) + "</ul>")
            continue

        if line.startswith("|"):
            flush_paragraph()
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
            out.append(render_table(table_lines))
            continue

        paragraph.append(line)
        i += 1

    flush_paragraph()
    return "\n\n".join(out)


def section_info(page_path: str) -> tuple[str, str, str, str, str]:
    if page_path.startswith("la-madriguera/"):
        return ("La Madriguera", "/la-madriguera/", "nivel-badge--4", "La madriguera", "Navegacion de la madriguera")
    if page_path.startswith("base/"):
        return ("Base de Conocimiento", "/base/", "nivel-badge--base", "Base", "Navegacion de la base")
    return ("Proyecto", "/", "nivel-badge--base", "Proyecto", "Navegacion del proyecto")


def template(
    page_path: str,
    title: str,
    meta: str,
    subtitle: str,
    article_html: str,
    prev_link: tuple[str, str] | None,
    next_link: tuple[str, str] | None,
) -> str:
    section_label, section_url, badge_class, badge_text, aria_label = section_info(page_path)
    is_root_page = "/" not in page_path
    asset_prefix = "" if is_root_page else "../"
    html_base = "" if is_root_page else "../"

    canonical = "https://aprendebtc.com/" + page_path
    if page_path.endswith("index.html"):
        canonical = "https://aprendebtc.com/" + page_path[: -len("index.html")]

    prev_html = "<div></div>"
    if prev_link:
        prev_html = (
            f'<a href="{prev_link[0]}" class="page-nav__item"><span class="page-nav__label">&larr; Anterior</span>'
            f'<span class="page-nav__title">{html.escape(prev_link[1])}</span></a>'
        )

    next_html = "<div></div>"
    if next_link:
        next_html = (
            f'<a href="{next_link[0]}" class="page-nav__item page-nav__item--next"><span class="page-nav__label">Siguiente &rarr;</span>'
            f'<span class="page-nav__title">{html.escape(next_link[1])}</span></a>'
        )

    return f"""<!DOCTYPE html>
<html lang=\"es\" data-base-path=\"{html_base}\">
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
  <link rel=\"stylesheet\" href=\"{asset_prefix}css/main.css\" />
  <link rel=\"stylesheet\" href=\"{asset_prefix}css/components.css\" />
</head>
<body>
  <div data-include=\"header\"></div>
  <div class=\"page-layout\">
    <aside class=\"page-layout__sidebar\" aria-label=\"{aria_label}\"><nav class=\"sidebar\"><div class=\"sidebar__ad-wrap\"><div class=\"ad-slot ad-sidebar\" id=\"ad-sidebar-auto\" aria-hidden=\"true\"></div></div></nav></aside>
    <main class=\"page-layout__content\" id=\"main-content\"><div class=\"content-inner\">
      <nav class=\"breadcrumb\" aria-label=\"Ruta de navegacion\"><a href=\"/\" class=\"breadcrumb__item\">Inicio</a><span class=\"breadcrumb__separator\" aria-hidden=\"true\">&rsaquo;</span><a href=\"{section_url}\" class=\"breadcrumb__item\">{section_label}</a><span class=\"breadcrumb__separator\" aria-hidden=\"true\">&rsaquo;</span><span class=\"breadcrumb__current\">{html.escape(title)}</span></nav>
      <article class=\"article\"><div class=\"nivel-badge {badge_class} article__badge\">{badge_text}</div><h1>{html.escape(title)}</h1><p class=\"article__subtitle\">{html.escape(subtitle)}</p>
{article_html}
<div class=\"ad-slot ad-content\" id=\"ad-content-auto\" aria-hidden=\"true\"></div>
<nav class=\"page-nav\" aria-label=\"Navegacion entre paginas\">{prev_html}{next_html}</nav></article>
    </div></main>
  </div>
  <div data-include=\"footer\"></div>
  <script src=\"{asset_prefix}js/includes.js\"></script>
  <script src=\"{asset_prefix}js/nav.js\"></script>
  <script src=\"{asset_prefix}js/search.js\"></script>
</body>
</html>
"""


def rel_href(to_path: str) -> str:
    return "/" + to_path.replace("\\", "/")


def main() -> None:
    blocks = parse_blocks()
    titles = {b["path"]: b["title"] for b in blocks}

    groups: dict[str, list[str]] = {}
    for block in blocks:
        key = block["path"].split("/", 1)[0] if "/" in block["path"] else "root"
        groups.setdefault(key, []).append(block["path"])

    for block in blocks:
        page_path = block["path"]
        group_key = page_path.split("/", 1)[0] if "/" in page_path else "root"
        group_pages = groups[group_key]
        idx = group_pages.index(page_path)

        prev_link: tuple[str, str] | None = None
        next_link: tuple[str, str] | None = None

        if idx > 0:
            p = group_pages[idx - 1]
            prev_link = (rel_href(p), titles.get(p, p))
        else:
            if group_key == "la-madriguera":
                prev_link = ("/base/", "Base de Conocimiento")
            elif group_key == "root":
                prev_link = ("/", "Inicio")

        if idx < len(group_pages) - 1:
            n = group_pages[idx + 1]
            next_link = (rel_href(n), titles.get(n, n))

        html_doc = template(
            page_path=page_path,
            title=block["title"],
            meta=block["meta"],
            subtitle=block["subtitle"],
            article_html=body_to_html(block["body"]),
            prev_link=prev_link,
            next_link=next_link,
        )

        target = ROOT / page_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html_doc, encoding="utf-8", newline="\n")

    print(f"Paginas generadas desde TXT: {len(blocks)}")


if __name__ == "__main__":
    main()
