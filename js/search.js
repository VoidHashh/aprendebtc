/**
 * aprendebtc.com - search.js
 * Client-side search with static core pages + dynamic base index.
 */

(function () {
  'use strict';

  const staticIndex = [
    { title: 'Inicio', url: '/', tags: ['home', 'landing'], section: 'General' },

    { title: 'Nivel 1 - Nocoinero Curioso', url: '/nivel-1/', tags: ['nivel 1', 'principiante'], section: 'Niveles', nivel: 1 },
    { title: 'Antes de empezar', url: '/nivel-1/antes-de-empezar.html', tags: ['nivel 1', 'inicio'], section: 'Nivel 1', nivel: 1 },
    { title: 'El problema del KYC', url: '/nivel-1/el-problema-del-kyc.html', tags: ['kyc', 'privacidad'], section: 'Nivel 1', nivel: 1 },
    { title: 'Dos caminos: KYC o no-KYC', url: '/nivel-1/dos-caminos.html', tags: ['kyc', 'no-kyc'], section: 'Nivel 1', nivel: 1 },
    { title: 'Registrarte en un exchange', url: '/nivel-1/registrarte-en-un-exchange.html', tags: ['exchange', 'registro'], section: 'Nivel 1', nivel: 1 },
    { title: 'Tu primera compra', url: '/nivel-1/tu-primera-compra.html', tags: ['compra', 'sats'], section: 'Nivel 1', nivel: 1 },
    { title: 'Qu\u00e9 acabas de hacer', url: '/nivel-1/que-has-hecho.html', tags: ['custodia', 'keys'], section: 'Nivel 1', nivel: 1 },

    { title: 'Nivel 2 - Ya Tengo Sats', url: '/nivel-2/', tags: ['nivel 2', 'autocustodia', 'lightning'], section: 'Niveles', nivel: 2 },
    { title: 'Paso 1: Crea tu wallet propia', url: '/nivel-2/crear-tu-wallet.html', tags: ['nivel 2', 'wallet', 'autocustodia'], section: 'Nivel 2', nivel: 2 },
    { title: 'Paso 2: Retirar bitcoin del exchange a tu wallet', url: '/nivel-2/retirar-del-exchange.html', tags: ['nivel 2', 'retiro', 'exchange'], section: 'Nivel 2', nivel: 2 },
    { title: 'Paso 3: Protege tu frase semilla', url: '/nivel-2/tu-seed-phrase.html', tags: ['nivel 2', 'seed', 'seguridad'], section: 'Nivel 2', nivel: 2 },
    { title: 'Comprar en exchanges descentralizados (P2P)', url: '/nivel-2/comprar-en-dex-p2p.html', tags: ['nivel 2', 'p2p', 'no-kyc'], section: 'Nivel 2', nivel: 2 },
    { title: 'Comprar en cajeros Bitcoin', url: '/nivel-2/cajeros-bitcoin.html', tags: ['nivel 2', 'cajeros', 'compra'], section: 'Nivel 2', nivel: 2 },
    { title: 'Tu wallet y seed phrase (camino no-KYC)', url: '/nivel-2/wallet-y-seed-nokyc.html', tags: ['nivel 2', 'wallet', 'no-kyc'], section: 'Nivel 2', nivel: 2 },
    { title: 'Comparativa de exchanges', url: '/nivel-2/exchanges-comparativa.html', tags: ['nivel 2', 'exchanges', 'comparativa'], section: 'Nivel 2', nivel: 2 },
    { title: 'Lightning Network: bitcoin instant\u00e1neo', url: '/nivel-2/que-es-lightning.html', tags: ['nivel 2', 'lightning', 'pagos'], section: 'Nivel 2', nivel: 2 },
    { title: 'C\u00f3mo usar Lightning paso a paso', url: '/nivel-2/usar-lightning.html', tags: ['nivel 2', 'lightning', 'guia'], section: 'Nivel 2', nivel: 2 },
    { title: 'Wallets Lightning recomendadas', url: '/nivel-2/wallets-lightning.html', tags: ['nivel 2', 'lightning', 'wallets'], section: 'Nivel 2', nivel: 2 },
    { title: 'Lightning Address y facturas (invoices)', url: '/nivel-2/lightning-address.html', tags: ['nivel 2', 'lightning', 'invoice'], section: 'Nivel 2', nivel: 2 },
    { title: 'C\u00f3mo hacer backup correctamente', url: '/nivel-2/como-hacer-backup.html', tags: ['nivel 2', 'backup', 'seed'], section: 'Nivel 2', nivel: 2 },
    { title: 'Wallets recomendadas', url: '/nivel-2/wallets-recomendadas.html', tags: ['nivel 2', 'wallets', 'seguridad'], section: 'Nivel 2', nivel: 2 },

    { title: 'Nivel 3 - Rabbit Hole', url: '/nivel-3/', tags: ['nivel 3', 'utxo', 'transacciones'], section: 'Niveles', nivel: 3 },
    { title: 'El modelo UTXO', url: '/nivel-3/modelo-utxo.html', tags: ['nivel 3', 'utxo'], section: 'Nivel 3', nivel: 3 },
    { title: 'Anatom\u00eda de una transacci\u00f3n', url: '/nivel-3/anatomia-transaccion.html', tags: ['nivel 3', 'transacciones', 'inputs', 'outputs'], section: 'Nivel 3', nivel: 3 },
    { title: 'La mempool', url: '/nivel-3/mempool.html', tags: ['nivel 3', 'mempool', 'confirmaciones'], section: 'Nivel 3', nivel: 3 },
    { title: 'RBF y CPFP: acelerar transacciones', url: '/nivel-3/rbf-cpfp.html', tags: ['nivel 3', 'rbf', 'cpfp', 'fees'], section: 'Nivel 3', nivel: 3 },
    { title: 'Tus UTXOs y tu privacidad', url: '/nivel-3/utxos-y-privacidad.html', tags: ['nivel 3', 'utxo', 'privacidad'], section: 'Nivel 3', nivel: 3 },
    { title: 'Clave privada', url: '/nivel-3/clave-privada.html', tags: ['nivel 3', 'claves', 'criptografia'], section: 'Nivel 3', nivel: 3 },
    { title: 'Clave p\u00fablica', url: '/nivel-3/clave-publica.html', tags: ['nivel 3', 'claves', 'criptografia'], section: 'Nivel 3', nivel: 3 },
    { title: 'Tipos de direcciones Bitcoin', url: '/nivel-3/tipos-de-direcciones.html', tags: ['nivel 3', 'direcciones', 'segwit', 'taproot'], section: 'Nivel 3', nivel: 3 },
    { title: 'HD Wallets y derivation paths', url: '/nivel-3/hd-wallets.html', tags: ['nivel 3', 'hd wallets', 'derivation path'], section: 'Nivel 3', nivel: 3 },
    { title: 'Firma digital', url: '/nivel-3/firma-digital.html', tags: ['nivel 3', 'firmas', 'criptografia'], section: 'Nivel 3', nivel: 3 },
    { title: '\u00bfQu\u00e9 es un nodo?', url: '/nivel-3/que-es-un-nodo.html', tags: ['nivel 3', 'nodo', 'validacion'], section: 'Nivel 3', nivel: 3 },
    { title: 'Monta tu propio nodo', url: '/nivel-3/montar-tu-nodo.html', tags: ['nivel 3', 'nodo', 'instalacion'], section: 'Nivel 3', nivel: 3 },
    { title: 'Miner\u00eda en detalle', url: '/nivel-3/mineria-en-detalle.html', tags: ['nivel 3', 'mineria', 'pow'], section: 'Nivel 3', nivel: 3 },
    { title: 'El halving', url: '/nivel-3/halving.html', tags: ['nivel 3', 'halving', 'emision'], section: 'Nivel 3', nivel: 3 },
    { title: 'Configura tu hardware wallet', url: '/nivel-3/configurar-hardware-wallet.html', tags: ['nivel 3', 'hardware wallet', 'custodia'], section: 'Nivel 3', nivel: 3 },
    { title: 'Comparativa de hardware wallets', url: '/nivel-3/comparativa-hardware-wallets.html', tags: ['nivel 3', 'hardware wallet', 'comparativa'], section: 'Nivel 3', nivel: 3 },
    { title: 'Coin control: gestiona tus UTXOs', url: '/nivel-3/coin-control.html', tags: ['nivel 3', 'coin control', 'utxo'], section: 'Nivel 3', nivel: 3 },



    { title: 'Nivel 4 - Down the Rabbit Hole', url: '/nivel-4/', tags: ['nivel 4', 'privacidad', 'multisig', 'herencia', 'lightning', 'mineria'], section: 'Niveles', nivel: 4 },
    { title: 'Distribucion geografica de claves', url: '/nivel-4/distribucion-claves.html', tags: ['nivel 4', 'multisig', 'claves'], section: 'Nivel 4', nivel: 4 },
    { title: 'Herencia de Bitcoin', url: '/nivel-4/herencia-bitcoin.html', tags: ['nivel 4', 'herencia', 'planificacion'], section: 'Nivel 4', nivel: 4 },
    { title: 'Guia de herencia paso a paso', url: '/nivel-4/guia-herencia.html', tags: ['nivel 4', 'herencia', 'guia'], section: 'Nivel 4', nivel: 4 },
    { title: 'Herencia con multisig', url: '/nivel-4/herencia-multisig.html', tags: ['nivel 4', 'herencia', 'multisig'], section: 'Nivel 4', nivel: 4 },
    { title: 'Canales de pago', url: '/nivel-4/canales-lightning.html', tags: ['nivel 4', 'lightning', 'canales'], section: 'Nivel 4', nivel: 4 },
    { title: 'Gestion de liquidez', url: '/nivel-4/liquidez-lightning.html', tags: ['nivel 4', 'lightning', 'liquidez'], section: 'Nivel 4', nivel: 4 },
    { title: 'Routing de pagos', url: '/nivel-4/routing-lightning.html', tags: ['nivel 4', 'lightning', 'routing'], section: 'Nivel 4', nivel: 4 },
    { title: 'Montar tu nodo Lightning', url: '/nivel-4/nodo-lightning.html', tags: ['nivel 4', 'lightning', 'nodo'], section: 'Nivel 4', nivel: 4 },
    { title: 'Mineria casera: tiene sentido', url: '/nivel-4/mineria-casera.html', tags: ['nivel 4', 'mineria', 'casa'], section: 'Nivel 4', nivel: 4 },
    { title: 'Hardware de mineria', url: '/nivel-4/hardware-mineria.html', tags: ['nivel 4', 'mineria', 'asic'], section: 'Nivel 4', nivel: 4 },
    { title: 'Pools de mineria', url: '/nivel-4/pools-mineria.html', tags: ['nivel 4', 'mineria', 'pools'], section: 'Nivel 4', nivel: 4 },
    { title: 'Mineria con Bitaxe', url: '/nivel-4/mineria-bitaxe.html', tags: ['nivel 4', 'bitaxe', 'mineria'], section: 'Nivel 4', nivel: 4 },
    { title: 'Bitcoin como calefaccion', url: '/nivel-4/calefaccion-bitcoin.html', tags: ['nivel 4', 'mineria', 'calefaccion'], section: 'Nivel 4', nivel: 4 },

    { title: 'Base de Conocimiento', url: '/base/', tags: ['base', 'referencia'], section: 'Pilares' },
    { title: 'Glosario', url: '/glosario.html', tags: ['terminos', 'definiciones'], section: 'Pilares' },
    { title: 'Recursos', url: '/recursos.html', tags: ['libros', 'podcasts'], section: 'Pilares' },
    { title: 'Herramientas', url: '/herramientas/', tags: ['tools', 'hash'], section: 'Pilares' },
    { title: 'Comunidad', url: '/comunidad/', tags: ['meetups', 'eventos'], section: 'Pilares' }
  ];

  const nivelLabels = { 1: 'N1', 2: 'N2', 3: 'N3', 4: 'N4', 5: 'N5', 6: 'N6' };
  let baseIndex = [];

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function scoreItem(item, query) {
    const q = normalize(query);
    const title = normalize(item.title);
    const tags = (item.tags || []).map(normalize).join(' ');

    let score = 0;
    if (title.startsWith(q)) score += 8;
    if (title.includes(q)) score += 4;
    if (tags.includes(q)) score += 2;
    return score;
  }

  function search(query) {
    const q = normalize(query);
    if (q.length < 2) return [];

    return [...staticIndex, ...baseIndex]
      .map((item) => ({ item, score: scoreItem(item, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry) => entry.item);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderResults(results, query) {
    const container = document.getElementById('search-results');
    if (!container) return;

    const cleanQuery = (query || '').trim();
    if (cleanQuery.length < 2) {
      container.innerHTML = '<p class="search-hint">Escribe para buscar art\u00edculos, conceptos y niveles...</p>';
      return;
    }

    if (results.length === 0) {
      container.innerHTML = `<p class="search-hint">Sin resultados para "<strong>${escapeHtml(cleanQuery)}</strong>"</p>`;
      return;
    }

    container.innerHTML = results.map((item) => {
      const badgeLabel = item.nivel ? nivelLabels[item.nivel] : 'DOC';
      const badgeClass = item.nivel ? `search-result-item__badge search-result-item__badge--nivel-${item.nivel}` : 'search-result-item__badge';
      const meta = item.section || 'Contenido';

      return `
        <a href="${item.url}" class="search-result-item">
          <span class="${badgeClass}">${badgeLabel}</span>
          <span class="search-result-item__body">
            <span class="search-result-item__title">${escapeHtml(item.title)}</span>
            <span class="search-result-item__meta">${escapeHtml(meta)}</span>
          </span>
        </a>
      `;
    }).join('');
  }

  async function loadBaseIndex() {
    const basePath = document.documentElement.dataset.basePath ?? '';
    const url = `${basePath}js/search-index.base.json`;

    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) {
        baseIndex = data;
      }
    } catch (_) {
      // keep static index only
    }
  }

  function bindInput() {
    const input = document.getElementById('search-input');
    if (!input) return;

    let debounceTimer;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        renderResults(search(input.value), input.value);
      }, 120);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      const results = search(input.value);
      if (results.length > 0) {
        window.location.href = results[0].url;
      }
    });
  }

  async function init() {
    await loadBaseIndex();
    bindInput();
  }

  document.addEventListener('includes:loaded', init);
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 150));
})();
