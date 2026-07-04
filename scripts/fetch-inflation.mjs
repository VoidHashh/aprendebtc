#!/usr/bin/env node
/**
 * fetch-inflation.mjs
 * -------------------
 * Descarga la inflacion de EE. UU. (FRED / CPI-U) y de la zona euro
 * (Eurostat / HICP) y escribe un `data/inflation.json` compacto que consume
 * la herramienta /herramientas/bitcoin-vs-inflacion.html.
 *
 * Pensado para correr en SERVIDOR (GitHub Action), no en el navegador:
 * asi la clave de FRED no se expone y el CORS de FRED deja de ser un problema.
 *
 * Frecuencia recomendada: 1 vez al mes (cron / GitHub Action). La inflacion se
 * publica mensualmente y con retraso; no tiene sentido pedirla mas a menudo.
 *
 * Uso:
 *   FRED_API_KEY=tu_clave node scripts/fetch-inflation.mjs           # escribe data/inflation.json
 *   FRED_API_KEY=tu_clave node scripts/fetch-inflation.mjs --stdout  # imprime por stdout
 *
 * Requisitos: Node 18+ (fetch global). Sin dependencias externas.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const FRED_KEY = process.env.FRED_API_KEY;
const START = "2009-01-01"; // arranque historico (FRED, YYYY-MM-DD)
const EU_START = "2009-01"; // Eurostat usa YYYY-MM

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "data", "inflation.json");
const TO_STDOUT = process.argv.includes("--stdout");

/* ---------------------------------------------------------------- */
/*  FRED - CPI-U (CPIAUCSL). Base 1982-84=100.                       */
/*  Se usa la API con cabecera Authorization: Bearer para no poner   */
/*  la clave en la URL (evita que aparezca en logs de CI).           */
/*  Devuelve [{ date:'YYYY-MM', v:Number }] ordenado ascendente.     */
/* ---------------------------------------------------------------- */
async function fetchFredCPI() {
  if (!FRED_KEY) throw new Error("Falta FRED_API_KEY en el entorno.");
  const url =
    "https://api.stlouisfed.org/fred/series/observations" +
    `?series_id=CPIAUCSL&observation_start=${START}&file_type=json`;

  // Preferimos la cabecera; si un despliegue de FRED no la acepta, caemos al
  // parametro api_key en la URL (v1), que sigue funcionando.
  let res = await fetch(url, {
    headers: { Authorization: `Bearer ${FRED_KEY}` },
  });
  if (res.status === 400 || res.status === 401 || res.status === 403) {
    res = await fetch(`${url}&api_key=${FRED_KEY}`);
  }
  if (!res.ok) throw new Error(`FRED HTTP ${res.status}`);

  const json = await res.json();
  if (!json || !Array.isArray(json.observations)) {
    throw new Error("FRED: respuesta sin 'observations'.");
  }
  return json.observations
    .filter((o) => o.value !== ".") // FRED marca huecos con "."
    .map((o) => ({ date: o.date.slice(0, 7), v: Number(o.value) }))
    .filter((o) => Number.isFinite(o.v));
}

/* ---------------------------------------------------------------- */
/*  Eurostat - HICP zona euro (prc_hicp_midx), formato JSON-stat.    */
/*  Al fijar geo/unit/coicop, la unica dimension que varia es el     */
/*  tiempo, asi que las claves de `value` mapean a posiciones de la  */
/*  dimension TIME_PERIOD; hay que invertir el indice de tiempo.     */
/*                                                                   */
/*  Codigos a verificar si algun dia devuelve vacio (Data Browser):  */
/*    geo=EA  -> zona euro (composicion cambiante). Alt: EA20.       */
/*    unit=I15 -> indice base 2015=100 (base vigente). Alt: I05.     */
/*    coicop=CP00 -> todos los articulos.                            */
/* ---------------------------------------------------------------- */
async function fetchEurostatHICP() {
  const params = new URLSearchParams({
    format: "JSON",
    lang: "EN",
    freq: "M",
    unit: "I15",
    coicop: "CP00",
    geo: "EA",
    sinceTimePeriod: EU_START,
  });
  const base =
    "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_midx";

  let json = await fetchEurostatJson(`${base}?${params}`);
  let series = parseJsonStatTime(json);

  // Fallback de robustez: si `EA` no trae datos, probar `EA20`.
  if (series.length === 0) {
    params.set("geo", "EA20");
    json = await fetchEurostatJson(`${base}?${params}`);
    series = parseJsonStatTime(json);
  }
  if (series.length === 0) {
    throw new Error("Eurostat: 0 observaciones (revisar geo/unit/coicop).");
  }
  return series;
}

async function fetchEurostatJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Eurostat HTTP ${res.status}`);
  return res.json();
}

/**
 * Parsea un JSON-stat de Eurostat cuya unica dimension variable es el tiempo.
 * Localiza la dimension de tiempo de forma tolerante (id 'time' o 'TIME_PERIOD')
 * e invierte category.index (periodo->posicion) a (posicion->periodo).
 * Devuelve [{ date:'YYYY-MM', v:Number }] ordenado ascendente.
 */
function parseJsonStatTime(json) {
  if (!json || !json.dimension || !json.value) return [];

  const timeDim =
    json.dimension.time ||
    json.dimension.TIME_PERIOD ||
    findTimeDimension(json);
  if (!timeDim || !timeDim.category || !timeDim.category.index) return [];

  const index = timeDim.category.index; // { '2009-01': 0, ... }
  const posToPeriod = {};
  for (const [period, pos] of Object.entries(index)) posToPeriod[pos] = period;

  return Object.entries(json.value)
    .map(([pos, v]) => ({ date: posToPeriod[pos], v: Number(v) }))
    .filter((o) => o.date && Number.isFinite(o.v))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

// Busca la dimension cuyas claves parecen periodos YYYY-MM (por si el id cambia).
function findTimeDimension(json) {
  for (const dim of Object.values(json.dimension)) {
    const keys = dim && dim.category && dim.category.index
      ? Object.keys(dim.category.index)
      : [];
    if (keys.length && keys.every((k) => /^\d{4}-\d{2}$/.test(k))) return dim;
  }
  return null;
}

/* ---------------------------------------------------------------- */
/*  Reduce una serie mensual a cierre anual (ultima observacion de   */
/*  cada anio) - es lo que el grafico dibuja. El anio en curso queda  */
/*  con su ultimo parcial disponible.                                */
/* ---------------------------------------------------------------- */
function annualize(series) {
  const byYear = {};
  for (const { date, v } of series) byYear[date.slice(0, 4)] = v; // pisa: ultimo mes gana
  return Object.entries(byYear)
    .map(([year, index]) => ({ year: Number(year), index }))
    .sort((a, b) => a.year - b.year);
}

async function main() {
  const [usMonthly, euMonthly] = await Promise.all([
    fetchFredCPI(),
    fetchEurostatHICP(),
  ]);

  const usLatest = usMonthly.at(-1);
  const euLatest = euMonthly.at(-1);

  const out = {
    updated: new Date().toISOString(),
    seed: false,
    note:
      "US: FRED CPIAUCSL (1982-84=100). EU: Eurostat prc_hicp_midx EA (2015=100). " +
      "Indices en bases distintas: el grafico normaliza a 2010=100 antes de comparar.",
    us: {
      source: "FRED CPIAUCSL",
      base: "1982-84=100",
      latestMonth: usLatest,
      annual: annualize(usMonthly),
    },
    eu: {
      source: "Eurostat prc_hicp_midx EA",
      base: "2015=100",
      latestMonth: euLatest,
      annual: annualize(euMonthly),
    },
  };

  const text = JSON.stringify(out, null, 2) + "\n";
  if (TO_STDOUT) {
    process.stdout.write(text);
  } else {
    writeFileSync(OUT_PATH, text, "utf8");
    console.error(`Escrito ${OUT_PATH}`);
  }
  console.error(
    `OK - US hasta ${usLatest?.date ?? "?"} - EU hasta ${euLatest?.date ?? "?"}`
  );
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
