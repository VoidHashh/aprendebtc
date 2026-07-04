#!/usr/bin/env node
/**
 * fetch-inflation.mjs
 * -------------------
 * Descarga la inflacion REAL de EE. UU. (FRED / CPI-U) y de la zona euro
 * (Eurostat / HICP) y escribe `data/inflation.json`, que consume la herramienta
 * /herramientas/bitcoin-vs-inflacion.html.
 *
 * FRED: usa la API oficial con clave (FRED_API_KEY, ya configurada como secret
 * del repo). Si no hay clave o la API falla, cae al CSV publico (fredgraph.csv,
 * sin clave) para que el pipeline nunca se quede sin datos. Eurostat es abierto.
 *
 * Ambas fuentes se reducen a MEDIA ANUAL por anio (es lo que dibuja el grafico).
 * El anio en curso queda como media de los meses disponibles.
 *
 * Uso:
 *   node scripts/fetch-inflation.mjs            # escribe data/inflation.json
 *   node scripts/fetch-inflation.mjs --stdout   # imprime por stdout
 *
 * Requisitos: Node 18+ (fetch global). Sin dependencias externas.
 * Frecuencia: 1 vez al mes (la inflacion se publica mensualmente y con retraso).
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const FRED_KEY = process.env.FRED_API_KEY; // opcional
const START = "1971-01-01"; // ancla $ = 1971 (fin del patron oro)
const EU_START = "1996-01"; // primer dato real de HICP zona euro (el EUR nace en 1999)
const US_ANCHOR_YEAR = 1971; // origen fiat del dolar
const EU_ANCHOR_YEAR = 1999; // nacimiento del euro

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "data", "inflation.json");
const TO_STDOUT = process.argv.includes("--stdout");

/* ---------------------------------------------------------------- */
/*  FRED - CPI-U (CPIAUCSL, base 1982-84=100).                       */
/*  Primario: API oficial con clave (la del secret del repo).        */
/*  Respaldo: fredgraph.csv (sin clave). En el CSV los huecos vienen */
/*  como celda VACIA (no "."): hay que filtrarlos, porque Number("") */
/*  === 0 colaria como dato valido.                                  */
/* ---------------------------------------------------------------- */
async function fetchFredCPI() {
  if (FRED_KEY) {
    try {
      return await fetchFredApi();
    } catch (e) {
      console.error("FRED API con clave fallo, uso el CSV publico:", e.message);
    }
  }
  return fetchFredCsv();
}

async function fetchFredCsv() {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL&cosd=${START}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fredgraph HTTP ${res.status}`);
  const rows = parseFredCsv(await res.text());
  if (!rows.length) throw new Error("fredgraph: 0 filas utiles");
  return rows;
}

function parseFredCsv(csv) {
  return csv
    .trim()
    .split(/\r?\n/)
    .slice(1) // cabecera
    .map((line) => line.split(","))
    .filter((c) => c.length >= 2 && c[1] != null && c[1].trim() !== "")
    .map((c) => ({ date: c[0].slice(0, 7), v: Number(c[1]) }))
    .filter((o) => Number.isFinite(o.v) && o.v > 0);
}

// Respaldo con clave (API v2, cabecera Authorization) por si el CSV fallara.
async function fetchFredApi() {
  const url =
    "https://api.stlouisfed.org/fred/series/observations" +
    `?series_id=CPIAUCSL&observation_start=${START}&file_type=json`;
  let res = await fetch(url, { headers: { Authorization: `Bearer ${FRED_KEY}` } });
  if (res.status === 400 || res.status === 401 || res.status === 403) {
    res = await fetch(`${url}&api_key=${FRED_KEY}`);
  }
  if (!res.ok) throw new Error(`FRED API HTTP ${res.status}`);
  const json = await res.json();
  return (json.observations || [])
    .filter((o) => o.value !== ".")
    .map((o) => ({ date: o.date.slice(0, 7), v: Number(o.value) }))
    .filter((o) => Number.isFinite(o.v) && o.v > 0);
}

/* ---------------------------------------------------------------- */
/*  Eurostat - HICP zona euro (prc_hicp_midx), JSON-stat.            */
/*  Codigos a verificar si algun dia devuelve vacio (Data Browser):  */
/*    geo=EA (alt EA20) · unit=I15 (base 2015=100) · coicop=CP00.     */
/* ---------------------------------------------------------------- */
async function fetchEurostatHICP() {
  const params = new URLSearchParams({
    format: "JSON", lang: "EN", freq: "M",
    unit: "I15", coicop: "CP00", geo: "EA", sinceTimePeriod: EU_START,
  });
  const base =
    "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_midx";

  let series = parseJsonStatTime(await fetchJson(`${base}?${params}`));
  if (series.length === 0) {
    params.set("geo", "EA20"); // fallback de robustez
    series = parseJsonStatTime(await fetchJson(`${base}?${params}`));
  }
  if (series.length === 0) throw new Error("Eurostat: 0 observaciones (revisar codigos).");
  return series;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Eurostat HTTP ${res.status}`);
  return res.json();
}

function parseJsonStatTime(json) {
  if (!json || !json.dimension || !json.value) return [];
  const timeDim =
    json.dimension.time || json.dimension.TIME_PERIOD || findTimeDimension(json);
  if (!timeDim || !timeDim.category || !timeDim.category.index) return [];
  const posToPeriod = {};
  for (const [period, pos] of Object.entries(timeDim.category.index)) posToPeriod[pos] = period;
  return Object.entries(json.value)
    .map(([pos, v]) => ({ date: posToPeriod[pos], v: Number(v) }))
    .filter((o) => o.date && Number.isFinite(o.v) && o.v > 0)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

function findTimeDimension(json) {
  for (const dim of Object.values(json.dimension)) {
    const keys = dim && dim.category && dim.category.index ? Object.keys(dim.category.index) : [];
    if (keys.length && keys.every((k) => /^\d{4}-\d{2}$/.test(k))) return dim;
  }
  return null;
}

/* ---------------------------------------------------------------- */
/*  Media anual por anio (el anio en curso queda con su media parcial) */
/* ---------------------------------------------------------------- */
function annualAverage(series) {
  const byYear = {};
  for (const { date, v } of series) {
    const y = date.slice(0, 4);
    (byYear[y] = byYear[y] || []).push(v);
  }
  return Object.entries(byYear)
    .map(([year, vals]) => ({
      year: Number(year),
      index: Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)),
    }))
    .sort((a, b) => a.year - b.year);
}

async function main() {
  const [usMonthly, euMonthly] = await Promise.all([
    fetchFredCPI(),
    fetchEurostatHICP(),
  ]);

  const usLatest = usMonthly.at(-1);
  const euLatest = euMonthly.at(-1);
  const usAnnual = annualAverage(usMonthly);
  const euAnnual = annualAverage(euMonthly);
  const usAnchor = usAnnual.find((o) => o.year === US_ANCHOR_YEAR) || null;
  const euAnchor = euAnnual.find((o) => o.year === EU_ANCHOR_YEAR) || null;

  const out = {
    updated: new Date().toISOString(),
    seed: false,
    note:
      "Datos reales, media anual. US: FRED CPIAUCSL (1982-84=100) desde 1971. EU: " +
      "Eurostat prc_hicp_midx EA (2015=100) desde 1996. El poder de compra se ancla " +
      "en el origen fiat de cada moneda ($ 1971, EUR 1999); el valor real de BTC se " +
      "mide desde 2010. El anio en curso es media de los meses disponibles.",
    us: {
      source: "FRED CPIAUCSL (fredgraph.csv, keyless)",
      base: "1982-84=100",
      anchor: usAnchor,
      latestMonth: usLatest,
      annual: usAnnual,
    },
    eu: {
      source: "Eurostat prc_hicp_midx EA",
      base: "2015=100",
      anchor: euAnchor,
      latestMonth: euLatest,
      annual: euAnnual,
    },
  };

  const text = JSON.stringify(out, null, 2) + "\n";
  if (TO_STDOUT) process.stdout.write(text);
  else {
    writeFileSync(OUT_PATH, text, "utf8");
    console.error(`Escrito ${OUT_PATH}`);
  }
  console.error(`OK - US hasta ${usLatest?.date ?? "?"} - EU hasta ${euLatest?.date ?? "?"}`);
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
