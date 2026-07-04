# data/inflation.json — datos de inflación (US + EU)

Alimenta la herramienta [`/herramientas/bitcoin-vs-inflacion.html`](../herramientas/bitcoin-vs-inflacion.html), que descuenta la devaluación del dólar y del euro del precio nominal de Bitcoin.

## Cómo se genera

Lo produce [`scripts/fetch-inflation.mjs`](../scripts/fetch-inflation.mjs), que corre **en servidor** (GitHub Action, no en el navegador) para no exponer la clave de FRED ni chocar con su CORS. El fichero versionado en el repo es un **seed de respaldo**: si el JSON en vivo falla, la herramienta usa además datos semilla embebidos en la propia página y muestra el estado "sin conexión".

- **EE. UU. — CPI-U:** FRED, serie `CPIAUCSL` (todos los ítems, base 1982-84=100). Requiere clave y **no permite CORS**.
- **Zona euro — HICP:** Eurostat, dataset `prc_hicp_midx` (índice mensual, base 2015=100). Sin clave.

Las dos series están en bases distintas a propósito: la herramienta **normaliza todo a 2010=100** antes de comparar, así que la base concreta de cada una es irrelevante.

## Regenerar a mano

```bash
# 1) Consigue una clave FRED (gratis): https://fredaccount.stlouisfed.org/apikey
FRED_API_KEY=tu_clave node scripts/fetch-inflation.mjs           # escribe data/inflation.json
FRED_API_KEY=tu_clave node scripts/fetch-inflation.mjs --stdout  # solo imprime, no escribe
```

## GitHub Action

[`.github/workflows/inflation.yml`](../.github/workflows/inflation.yml) lo ejecuta el **día 20 de cada mes** (cron) y también a mano (`workflow_dispatch`). Commitea `data/inflation.json` solo si cambió.

**Configuración necesaria (una vez):** en el repo de GitHub → *Settings → Secrets and variables → Actions → New repository secret*:

- Nombre: `FRED_API_KEY`
- Valor: tu clave de FRED

## Verificar los códigos de Eurostat

Si algún día la serie EU llega vacía, los códigos pueden haber cambiado. Pega esta URL en el navegador (o en el *Data Browser* de Eurostat) y comprueba que devuelve datos:

```
https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_midx?format=JSON&lang=EN&freq=M&unit=I15&coicop=CP00&geo=EA&sinceTimePeriod=2009-01
```

- `geo=EA` → zona euro (composición cambiante). Alternativa: `EA20`. *(El script ya reintenta con `EA20` automáticamente si `EA` viene vacío.)*
- `unit=I15` → índice base 2015=100 (base vigente). Alternativa histórica: `I05`.
- `coicop=CP00` → todos los artículos.

## Formato del JSON

```jsonc
{
  "updated": "2026-…T…Z",            // ISO; cuándo se regeneró
  "seed": false,                      // true solo en el fichero de respaldo versionado
  "note": "…",
  "us": {
    "source": "FRED CPIAUCSL",
    "base": "1982-84=100",
    "latestMonth": { "date": "YYYY-MM", "v": 000.0 },   // hasta qué mes llega el dato
    "annual": [ { "year": 2010, "index": 218.06 }, … ]  // cierre anual (último mes del año)
  },
  "eu": { /* misma forma, Eurostat prc_hicp_midx EA */ }
}
```

2025-2026 son provisionales.
