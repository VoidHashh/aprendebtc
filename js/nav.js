/**
 * aprendebtc.com - nav.js
 * Handles: mobile menu, search overlay, active states,
 * smooth anchor scroll, contextual return links, and sidebar tree navigation.
 */

(function () {
  'use strict';

  const RETURN_CONTEXT_KEY = 'aprendebtc:return-context';
  const SIDEBAR_TREE_KEY_PREFIX = 'aprendebtc:sidebar-tree:';

  let mobileMenuBound = false;
  let searchBound = false;
  let smoothScrollBound = false;
  let contextLinkBound = false;

  const LEVEL_TREE = [
    {
      title: 'Nivel 1 - Explorador',
      index: '/nivel-1/',
      pages: [
        { href: '/nivel-1/antes-de-empezar.html', text: 'Antes de empezar' },
        { href: '/nivel-1/el-problema-del-kyc.html', text: 'El problema del KYC' },
        { href: '/nivel-1/dos-caminos.html', text: 'Dos caminos: KYC o no-KYC' },
        { href: '/nivel-1/registrarte-en-un-exchange.html', text: 'Registrarte en un exchange' },
        { href: '/nivel-1/tu-primera-compra.html', text: 'Tu primera compra' },
        { href: '/nivel-1/que-has-hecho.html', text: 'Qu? acabas de hacer' }
      ]
    },
    {
      title: 'Nivel 2 - Soberano',
      index: '/nivel-2/',
      pages: [
        { href: '/nivel-2/crear-tu-wallet.html', text: 'Paso 1: Crea tu wallet propia' },
        { href: '/nivel-2/retirar-del-exchange.html', text: 'Paso 2: Retirar del exchange' },
        { href: '/nivel-2/tu-seed-phrase.html', text: 'Paso 3: Protege tu seed phrase' },
        { href: '/nivel-2/comprar-en-dex-p2p.html', text: 'Comprar en DEX/P2P' },
        { href: '/nivel-2/cajeros-bitcoin.html', text: 'Comprar en cajeros Bitcoin' },
        { href: '/nivel-2/wallet-y-seed-nokyc.html', text: 'Wallet y seed (no-KYC)' },
        { href: '/nivel-2/exchanges-comparativa.html', text: 'Comparativa de exchanges' },
        { href: '/nivel-2/que-es-lightning.html', text: 'Lightning: qu? es' },
        { href: '/nivel-2/usar-lightning.html', text: 'Cómo usar Lightning' },
        { href: '/nivel-2/wallets-lightning.html', text: 'Wallets Lightning recomendadas' },
        { href: '/nivel-2/lightning-address.html', text: 'Lightning Address e invoices' },
        { href: '/nivel-2/como-hacer-backup.html', text: 'Cómo hacer backup correctamente' },
        { href: '/nivel-2/wallets-recomendadas.html', text: 'Wallets recomendadas' }
      ]
    },
    {
      title: 'Nivel 3 - Analista',
      index: '/nivel-3/',
      pages: [
        { href: '/nivel-3/modelo-utxo.html', text: 'El modelo UTXO' },
        { href: '/nivel-3/anatomia-transaccion.html', text: 'Anatomía de una transacción' },
        { href: '/nivel-3/mempool.html', text: 'La mempool' },
        { href: '/nivel-3/rbf-cpfp.html', text: 'RBF y CPFP' },
        { href: '/nivel-3/utxos-y-privacidad.html', text: 'Tus UTXOs y tu privacidad' },
        { href: '/nivel-3/clave-privada.html', text: 'Clave privada' },
        { href: '/nivel-3/clave-publica.html', text: 'Clave pública' },
        { href: '/nivel-3/tipos-de-direcciones.html', text: 'Tipos de direcciones Bitcoin' },
        { href: '/nivel-3/hd-wallets.html', text: 'HD wallets y derivation paths' },
        { href: '/nivel-3/firma-digital.html', text: 'Firma digital' },
        { href: '/nivel-3/que-es-un-nodo.html', text: 'Qué es un nodo' },
        { href: '/nivel-3/montar-tu-nodo.html', text: 'Monta tu propio nodo' },
        { href: '/nivel-3/mineria-en-detalle.html', text: 'Minería en detalle' },
        { href: '/nivel-3/halving.html', text: 'El halving' },
        { href: '/nivel-3/configurar-hardware-wallet.html', text: 'Configura tu hardware wallet' },
        { href: '/nivel-3/comparativa-hardware-wallets.html', text: 'Comparativa hardware wallets' },
        { href: '/nivel-3/coin-control.html', text: 'Coin control' }
      ]
    },
    {
      title: 'Nivel 4 - En la madriguera',
      index: '/nivel-4/',
      pages: [
        { href: '/nivel-4/configurar-multisig.html', text: 'Configurar multisig con Sparrow' },
        { href: '/nivel-4/distribucion-claves.html', text: 'Distribución geográfica de claves' },
        { href: '/nivel-4/herencia-bitcoin.html', text: 'Herencia de Bitcoin' },
        { href: '/nivel-4/guia-herencia.html', text: 'Guía de herencia paso a paso' },
        { href: '/nivel-4/herencia-multisig.html', text: 'Herencia con multisig' },
        { href: '/nivel-4/canales-lightning.html', text: 'Canales de pago' },
        { href: '/nivel-4/liquidez-lightning.html', text: 'Gestión de liquidez' },
        { href: '/nivel-4/routing-lightning.html', text: 'Routing de pagos' },
        { href: '/nivel-4/nodo-lightning.html', text: 'Montar tu nodo Lightning' },
        { href: '/nivel-4/mineria-casera.html', text: 'Minería casera: tiene sentido' },
        { href: '/nivel-4/hardware-mineria.html', text: 'Hardware de minería' },
        { href: '/nivel-4/pools-mineria.html', text: 'Pools de minería' },
        { href: '/nivel-4/mineria-bitaxe.html', text: 'Minería con Bitaxe' },
        { href: '/nivel-4/calefaccion-bitcoin.html', text: 'Bitcoin como calefacción' }
      ]
    },
    {
      title: 'Nivel 5 - Mentor',
      index: '/nivel-5/',
      pages: [
        { href: '/nivel-5/funciones-hash.html', text: 'Funciones hash' },
        { href: '/nivel-5/curva-eliptica.html', text: 'Criptografia de curva eliptica' },
        { href: '/nivel-5/ecdsa.html', text: 'ECDSA' },
        { href: '/nivel-5/schnorr.html', text: 'Firmas Schnorr' },
        { href: '/nivel-5/estructura-transaccion.html', text: 'Estructura de una transaccion' },
        { href: '/nivel-5/segwit-internals.html', text: 'SegWit por dentro' },
        { href: '/nivel-5/taproot-internals.html', text: 'Taproot por dentro' },
        { href: '/nivel-5/psbt.html', text: 'PSBT' },
        { href: '/nivel-5/locktime-sequence.html', text: 'Locktime y Sequence' },
        { href: '/nivel-5/bitcoin-script.html', text: 'Bitcoin Script' },
        { href: '/nivel-5/p2pkh.html', text: 'P2PKH' },
        { href: '/nivel-5/p2sh.html', text: 'P2SH' },
        { href: '/nivel-5/p2wpkh-p2wsh.html', text: 'P2WPKH y P2WSH' },
        { href: '/nivel-5/p2tr.html', text: 'P2TR' },
        { href: '/nivel-5/op-return.html', text: 'OP_RETURN' },
        { href: '/nivel-5/estructura-bloque.html', text: 'Estructura de un bloque' },
        { href: '/nivel-5/merkle-tree.html', text: 'Arbol de Merkle' },
        { href: '/nivel-5/proof-of-work.html', text: 'Proof of Work en detalle' },
        { href: '/nivel-5/protocolo-p2p.html', text: 'Protocolo P2P' }
      ]
    },
    {
      title: 'Nivel 6 - Satoshi',
      index: '/nivel-6/',
      pages: [
        { href: '/nivel-6/por-que-bitcoin-importa.html', text: 'Por que Bitcoin importa de verdad' },
        { href: '/nivel-6/bitcoin-y-libertad.html', text: 'Bitcoin y libertad financiera' },
        { href: '/nivel-6/bitcoin-game-theory.html', text: 'Teoría de juegos de Bitcoin' },
        { href: '/nivel-6/criticas-a-bitcoin.html', text: 'Las críticas a Bitcoin y las respuestas' },
        { href: '/nivel-6/contribuir-bitcoin-core.html', text: 'Cómo contribuir a Bitcoin Core' },
        { href: '/nivel-6/que-es-un-bip.html', text: 'Qué es un BIP' },
        { href: '/nivel-6/soft-fork-hard-fork.html', text: 'Soft fork vs Hard fork' },
        { href: '/nivel-6/contribuir-sin-codigo.html', text: 'Contribuir sin saber programar' },
        { href: '/nivel-6/como-explicar-bitcoin.html', text: 'Cómo explicar Bitcoin sin que te miren raro' },
        { href: '/nivel-6/bitcoinizar-tu-entorno.html', text: 'Cómo bitcoinizar tu entorno' }
      ]
    }
  ];

  const PILLAR_TREE = [
    {
      title: 'Base de Conocimiento',
      index: '/base/',
      pages: [
        { href: '/base/que-es-bitcoin.html', text: 'Qué es Bitcoin' },
        { href: '/base/como-funciona-bitcoin.html', text: 'Cómo funciona Bitcoin' },
        { href: '/base/que-es-blockchain.html', text: 'Qué es la blockchain' },
        { href: '/base/que-es-la-mineria.html', text: 'Qué es la minería' },
        { href: '/base/los-21-millones.html', text: 'Los 21 millones y la oferta fija' },
        { href: '/base/que-es-un-satoshi.html', text: 'Qué es un satoshi' },
        { href: '/base/historia-bitcoin.html', text: 'Historia de Bitcoin' },
        { href: '/base/quien-es-satoshi.html', text: 'Quién es Satoshi Nakamoto' },
        { href: '/base/el-whitepaper.html', text: 'El whitepaper de Bitcoin' },
        { href: '/base/problema-del-dinero-tradicional.html', text: 'El problema del dinero tradicional' },
        { href: '/base/bitcoin-vs-dinero-tradicional.html', text: 'Bitcoin vs dinero tradicional' },
        { href: '/base/historia-del-dinero.html', text: 'Historia del dinero' },
        { href: '/base/inflacion-y-bitcoin.html', text: 'Inflación y Bitcoin' },
        { href: '/base/austrian-economics.html', text: 'Economía Austríaca y Bitcoin' },
        { href: '/base/bitcoin-vs-oro.html', text: 'Bitcoin vs Oro' },
        { href: '/base/bitcoin-reserva-de-valor.html', text: 'Bitcoin como reserva de valor' },
        { href: '/base/bitcoin-vs-altcoins.html', text: 'Bitcoin vs altcoins' },
        { href: '/base/exchange-centralizado-cex.html', text: 'Exchange centralizado (CEX)' },
        { href: '/base/exchange-descentralizado-dex.html', text: 'Exchange descentralizado (DEX)' },
        { href: '/base/kyc-vs-no-kyc.html', text: 'KYC y no-KYC' },
        { href: '/base/dca-compras-periodicas.html', text: 'DCA: compras periódicas' },
        { href: '/base/tipos-de-wallet.html', text: 'Tipos de wallet' },
        { href: '/base/que-es-seed-phrase.html', text: 'Qué es la seed phrase' },
        { href: '/base/on-chain-vs-lightning.html', text: 'On-chain vs Lightning' },
        { href: '/base/que-es-una-direccion.html', text: 'Qué es una dirección Bitcoin' },
        { href: '/base/que-es-una-confirmacion.html', text: 'Qué es una confirmación' },
        { href: '/base/que-son-las-fees.html', text: 'Qué son las comisiones (fees)' },
        { href: '/base/seguridad-basica.html', text: 'Seguridad básica' },
        { href: '/base/estafas-comunes.html', text: 'Estafas comunes en Bitcoin' }
      ]
    },
    {
      title: 'La Madriguera',
      index: '/la-madriguera/',
      pages: [
        { href: '/la-madriguera/el-hackeo-de-mt-gox.html', text: '01 - Mt. Gox' },
        { href: '/la-madriguera/silk-road-y-ross-ulbricht.html', text: '02 - Silk Road y Ross Ulbricht' },
        { href: '/la-madriguera/la-crisis-de-terra-luna.html', text: '03 - Crisis Terra/Luna' },
        { href: '/la-madriguera/los-etfs-de-bitcoin.html', text: '04 - ETFs de Bitcoin' },
        { href: '/la-madriguera/ordinals-inscriptions-debate.html', text: '05 - Ordinals e Inscriptions' },
        { href: '/la-madriguera/la-geopolitica-de-la-mineria.html', text: '06 - Geopolitica de la minería' },
        { href: '/la-madriguera/el-ataque-del-51-por-ciento.html', text: '07 - Ataque del 51%' },
        { href: '/la-madriguera/bloques-huerfanos-y-reorganizaciones.html', text: '08 - Bloques huerfanos y reorgs' },
        { href: '/la-madriguera/la-guerra-del-tamano-de-bloque.html', text: 'Debate - Tamaño de bloque' },
        { href: '/la-madriguera/el-colapso-de-ftx.html', text: 'Debate - Colapso FTX' },
        { href: '/la-madriguera/bitcoin-y-energia.html', text: 'Debate - Bitcoin y energia' },
        { href: '/la-madriguera/el-caso-samourai-wallet.html', text: 'Debate - Caso Samourai' },
        { href: '/la-madriguera/lightning-network-estado-actual.html', text: 'Debate - Estado de Lightning' },
        { href: '/la-madriguera/soft-forks-de-bitcoin.html', text: 'Debate - Soft forks' },
        { href: '/la-madriguera/puede-un-gobierno-prohibir-bitcoin.html', text: 'Debate - Prohibir Bitcoin' },
        { href: '/la-madriguera/halving-y-ciclos-de-precio.html', text: 'Debate - Halving y ciclos' }
      ]
    },
    {
      title: 'Herramientas',
      index: '/herramientas/',
      pages: [
        { href: '/herramientas/conversor.html', text: 'Conversor BTC / EUR / sats' },
        { href: '/herramientas/calculadora-dca.html', text: 'Calculadora DCA' },
        { href: '/herramientas/calculadora-fees.html', text: 'Calculadora de fees' },
        { href: '/herramientas/calculadora-impuestos.html', text: 'Calculadora de impuestos (ES)' },
        { href: '/herramientas/comparador-exchanges.html', text: 'Comparador de exchanges' },
        { href: '/herramientas/calculadora-herencia.html', text: 'Calculadora de herencia' },
        { href: '/herramientas/hash.html', text: 'Calculadora de hash' },
        { href: '/herramientas/mining-simulator.html', text: 'Simulador de minería' },
        { href: '/herramientas/difficulty-converter.html', text: 'Conversor de dificultad y target' },
        { href: '/herramientas/merkle-tree.html', text: 'Generador de Merkle Tree' },
        { href: '/herramientas/block-tools.html', text: 'Herramientas de bloques' },
        { href: '/herramientas/private-key.html', text: 'Generador de clave privada' },
        { href: '/herramientas/public-key.html', text: 'Derivar clave pública' },
        { href: '/herramientas/wif.html', text: 'Codificador/decodificador WIF' },
        { href: '/herramientas/address-base58.html', text: 'Dirección Bitcoin (Base58)' },
        { href: '/herramientas/address-bech32.html', text: 'Dirección Bitcoin (Bech32)' },
        { href: '/herramientas/checksum-base58.html', text: 'Base58Check y checksum' },
        { href: '/herramientas/multisig-address.html', text: 'Generador de dirección multisig' },
        { href: '/herramientas/mnemonic-seed.html', text: 'Mnemonic y seed (BIP39)' },
        { href: '/herramientas/extended-keys.html', text: 'Extended keys (xpub/xprv)' },
        { href: '/herramientas/derivation-paths.html', text: 'Derivation paths (BIP32)' },
        { href: '/herramientas/address-from-xpub.html', text: 'Direcciones desde xpub' },
        { href: '/herramientas/hd-wallet.html', text: 'HD Wallet explorer' },
        { href: '/herramientas/tx-decoder.html', text: 'Decodificador de transacciones' },
        { href: '/herramientas/tx-splitter.html', text: 'TX splitter (byte a byte)' },
        { href: '/herramientas/tx-builder.html', text: 'Constructor de transacciones (raw)' },
        { href: '/herramientas/script-interpreter.html', text: 'Interprete de Bitcoin Script' },
        { href: '/herramientas/psbt-decoder.html', text: 'Decodificador PSBT (BIP174)' },
        { href: '/herramientas/ecdsa-schnorr.html', text: 'Firma digital: ECDSA y Schnorr' },
        { href: '/herramientas/ec-calculator.html', text: 'Calculadora de curva eliptica' },
        { href: '/herramientas/compact-size.html', text: 'Compact Size (VarInt)' },
        { href: '/herramientas/ascii-hex.html', text: 'ASCII y hexadecimal' },
        { href: '/herramientas/unix-time.html', text: 'Tiempo Unix' },
        { href: '/herramientas/timelock-decoder.html', text: 'Decodificador de timelocks' },
        { href: '/herramientas/lightning-invoice.html', text: 'Decodificador de factura Lightning' },
        { href: '/herramientas/entropy-analyzer.html', text: 'Analizador de entropía' },
        { href: '/herramientas/seed-validator.html', text: 'Validador de seed phrase' },



      ]
    },
    {
      title: 'Comunidad',
      index: '/comunidad/',
      pages: [
        { href: '/comunidad/comunidades-online.html', text: 'Comunidades online' },
        { href: '/comunidad/meetups-presenciales.html', text: 'Meetups presenciales' },
        { href: '/comunidad/conferencias.html', text: 'Conferencias' },
        { href: '/comunidad/nostr-y-bitcoin.html', text: 'Nostr y Bitcoin' }
      ]
    },
    {
      title: 'Glosario',
      index: '/glosario.html',
      pages: []
    },
    {
      title: 'Recursos',
      index: '/recursos.html',
      pages: []
    }
  ];

  function normalizePath(pathname) {
    if (!pathname) return '/';
    const normalized = pathname
      .replace(/\/index\.html$/i, '/')
      .replace(/\/+$/, '');
    return normalized || '/';
  }

  function currentPath() {
    return normalizePath(window.location.pathname);
  }

  function inferSectionLabel(pathname) {
    const path = normalizePath(pathname);
    const nivelMatch = path.match(/^\/nivel-(\d)(\/|$)/);

    if (nivelMatch) return `Nivel ${nivelMatch[1]}`;
    if (path === '/base' || path.startsWith('/base/')) return 'Base de Conocimiento';
    if (path === '/la-madriguera' || path.startsWith('/la-madriguera/')) return 'La Madriguera';
    if (path === '/comunidad' || path.startsWith('/comunidad/')) return 'Comunidad';
    if (path === '/herramientas' || path.startsWith('/herramientas/')) return 'Herramientas';
    if (path === '/glosario.html') return 'Glosario';
    if (path === '/recursos.html') return 'Recursos';

    return 'Contenido';
  }

  function collapseWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function textScore(value) {
    const ok = (value.match(/[A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü¿¡]/g) || []).length;
    const bad = (value.match(/[ÃÂâ?]/g) || []).length;
    return ok - (bad * 3);
  }

  function maybeDecodeMojibake(value) {
    const raw = collapseWhitespace(value);
    if (!raw) return raw;
    if (!/[ÃÂâ]/.test(raw)) return raw;

    try {
      const bytes = Uint8Array.from(Array.from(raw).map((ch) => ch.charCodeAt(0) & 0xff));
      const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      if (decoded && textScore(decoded) >= textScore(raw)) {
        return collapseWhitespace(decoded);
      }
    } catch (_) {
      // noop
    }

    return raw;
  }

  function sanitizeLabel(value) {
    let text = collapseWhitespace(value);
    text = maybeDecodeMojibake(text);

    text = text
      .replace(/\uFFFD/g, '-')
      .replace(/\s+\?\s+/g, ' - ')
      .replace(/\s*â€”\s*/g, ' - ')
      .replace(/\s*—\s*/g, ' - ')
      .replace(/\s*·\s*/g, ' · ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    text = text.replace(/^Nivel\s+(\d)\s*-\s*Ya\s+Tengo\s+Sats$/i, 'Nivel $1 - Soberano');

    return text;
  }

  function sanitizeSameOriginPath(pathValue) {
    if (!pathValue) return null;

    try {
      const resolved = new URL(pathValue, window.location.origin);
      if (resolved.origin !== window.location.origin) return null;
      if (!resolved.pathname.startsWith('/')) return null;
      return `${resolved.pathname}${resolved.search}${resolved.hash}`;
    } catch (_) {
      return null;
    }
  }

  function getPageTitleText() {
    const h1 = document.querySelector('h1');
    if (h1) {
      const title = sanitizeLabel(h1.textContent);
      if (title) return title;
    }

    const breadcrumbCurrent = document.querySelector('.breadcrumb__current');
    if (breadcrumbCurrent) {
      const title = sanitizeLabel(breadcrumbCurrent.textContent);
      if (title) return title;
    }

    return sanitizeLabel(document.title.split('|')[0]);
  }

  function readContextFromStorage() {
    try {
      const raw = window.sessionStorage.getItem(RETURN_CONTEXT_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      const path = sanitizeSameOriginPath(parsed.path);
      if (!path) return null;

      return {
        path,
        title: sanitizeLabel(parsed.title || ''),
        section: sanitizeLabel(parsed.section || inferSectionLabel(path))
      };
    } catch (_) {
      return null;
    }
  }

  function saveContextToStorage(context) {
    if (!context || !context.path) return;

    const safePath = sanitizeSameOriginPath(context.path);
    if (!safePath) return;

    const payload = {
      path: safePath,
      title: sanitizeLabel(context.title || ''),
      section: sanitizeLabel(context.section || inferSectionLabel(safePath))
    };

    try {
      window.sessionStorage.setItem(RETURN_CONTEXT_KEY, JSON.stringify(payload));
    } catch (_) {
      // ignore storage failures
    }
  }

  function getCurrentLevelContext() {
    const path = currentPath();
    if (!/^\/nivel-\d(\/|$)/.test(path)) return null;

    return {
      path: window.location.pathname,
      title: getPageTitleText(),
      section: inferSectionLabel(window.location.pathname)
    };
  }

  function readContextFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const fromPath = sanitizeSameOriginPath(params.get('from'));
    if (!fromPath) return null;

    return {
      path: fromPath,
      title: sanitizeLabel(params.get('from_title') || ''),
      section: sanitizeLabel(params.get('from_section') || inferSectionLabel(fromPath))
    };
  }

  function getSameOriginReferrer() {
    if (!document.referrer) return null;

    try {
      const ref = new URL(document.referrer);
      if (ref.origin !== window.location.origin) return null;
      return ref;
    } catch (_) {
      return null;
    }
  }

  function getReturnContext() {
    const current = currentPath();

    const fromQuery = readContextFromQuery();
    if (fromQuery) {
      const target = normalizePath(new URL(fromQuery.path, window.location.origin).pathname);
      if (target !== current) {
        saveContextToStorage(fromQuery);
        return { ...fromQuery, source: 'query' };
      }
    }

    const fromStorage = readContextFromStorage();
    if (fromStorage) {
      const target = normalizePath(new URL(fromStorage.path, window.location.origin).pathname);
      if (target !== current) {
        return { ...fromStorage, source: 'storage' };
      }
    }

    const ref = getSameOriginReferrer();
    if (!ref) return null;

    const refPath = normalizePath(ref.pathname);
    if (refPath === current) return null;

    return {
      path: `${ref.pathname}${ref.search || ''}${ref.hash || ''}`,
      title: '',
      section: inferSectionLabel(ref.pathname),
      source: 'referrer'
    };
  }

  function formatContextLabel(context) {
    if (!context) return '';

    const section = sanitizeLabel(context.section || inferSectionLabel(context.path));
    const title = sanitizeLabel(context.title || '');

    if (section && title) return `${section} - ${title}`;
    if (title) return title;
    if (section) return section;

    return context.path;
  }

  function buildContextBackModel(returnContext) {
    const path = currentPath();
    const isBasePage = path === '/base' || path.startsWith('/base/');
    if (!isBasePage || !returnContext) return null;

    const targetUrl = new URL(returnContext.path, window.location.origin);
    const targetPath = normalizePath(targetUrl.pathname);

    if (targetPath === path) return null;
    if (targetPath === '/base' || targetPath.startsWith('/base/')) return null;

    const label = formatContextLabel(returnContext);

    return {
      href: returnContext.path,
      text: `<- Volver a: ${label}`,
      aria: `Volver a ${label}`
    };
  }

  function initContextBackButton(returnContext) {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb || !breadcrumb.parentNode) return;

    const existing = breadcrumb.parentNode.querySelector('.context-back-wrap');
    if (existing) existing.remove();

    const model = buildContextBackModel(returnContext);
    if (!model) return;

    const wrap = document.createElement('div');
    wrap.className = 'context-back-wrap';

    const link = document.createElement('a');
    link.className = 'context-back';
    link.href = model.href;
    link.textContent = model.text;
    link.setAttribute('aria-label', model.aria);

    wrap.appendChild(link);
    breadcrumb.parentNode.insertBefore(wrap, breadcrumb);
  }

  function initSidebarContextBlock(returnContext) {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const existing = sidebar.querySelector('.sidebar__section--context');
    if (existing) existing.remove();

    const model = buildContextBackModel(returnContext);
    if (!model) return;

    const section = document.createElement('div');
    section.className = 'sidebar__section sidebar__section--context sidebar__section--locked';

    const title = document.createElement('div');
    title.className = 'sidebar__section-title';
    title.textContent = 'Contexto de lectura';

    const link = document.createElement('a');
    link.className = 'sidebar__link sidebar__link--context';
    link.href = model.href;
    link.textContent = model.text;

    section.appendChild(title);
    section.appendChild(link);

    const firstSection = sidebar.querySelector('.sidebar__section');
    if (firstSection) {
      sidebar.insertBefore(section, firstSection);
    } else {
      sidebar.prepend(section);
    }
  }

  function shouldPropagateToLink(anchor) {
    if (!anchor || !anchor.getAttribute) return false;

    const href = anchor.getAttribute('href');
    if (!href) return false;
    if (href.startsWith('#')) return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;

    let resolved;
    try {
      resolved = new URL(href, window.location.href);
    } catch (_) {
      return false;
    }

    if (resolved.origin !== window.location.origin) return false;
    return resolved.pathname.startsWith('/base/');
  }

  function augmentLinkWithContext(anchor, context) {
    if (!context || !context.path) return;
    if (!shouldPropagateToLink(anchor)) return;

    const resolved = new URL(anchor.getAttribute('href'), window.location.href);
    resolved.searchParams.set('from', context.path);

    if (context.title) {
      resolved.searchParams.set('from_title', context.title);
    } else {
      resolved.searchParams.delete('from_title');
    }

    if (context.section) {
      resolved.searchParams.set('from_section', context.section);
    } else {
      resolved.searchParams.delete('from_section');
    }

    anchor.setAttribute('href', `${resolved.pathname}${resolved.search}${resolved.hash}`);
  }

  function initContextualLinkPropagation(returnContext) {
    const levelContext = getCurrentLevelContext();

    if (levelContext) {
      saveContextToStorage(levelContext);
    }

    if (returnContext && (currentPath() === '/base' || currentPath().startsWith('/base/'))) {
      saveContextToStorage(returnContext);
    }

    const contextToPropagate = levelContext || (currentPath().startsWith('/base/') ? returnContext : null);
    if (!contextToPropagate) return;

    document.querySelectorAll('a[href]').forEach((anchor) => {
      augmentLinkWithContext(anchor, contextToPropagate);
    });

    if (contextLinkBound) return;

    document.addEventListener('click', (event) => {
      const anchor = event.target.closest('a[href]');
      if (!anchor) return;

      const freshLevelContext = getCurrentLevelContext();
      const context = freshLevelContext || readContextFromQuery() || readContextFromStorage();
      if (!context) return;

      augmentLinkWithContext(anchor, context);
    });

    contextLinkBound = true;
  }

  function sanitizeSidebarTexts() {
    document.querySelectorAll('.sidebar__section-title, .sidebar__link').forEach((node) => {
      const cleaned = sanitizeLabel(node.textContent);
      if (cleaned) node.textContent = cleaned;
    });

    document.querySelectorAll('.breadcrumb__item, .breadcrumb__current').forEach((node) => {
      const cleaned = sanitizeLabel(node.textContent);
      if (cleaned) node.textContent = cleaned;
    });
  }

  function createSidebarSection(title, links, sectionClass) {
    const section = document.createElement('div');
    section.className = `sidebar__section ${sectionClass || ''}`.trim();

    const titleNode = document.createElement('div');
    titleNode.className = 'sidebar__section-title';
    titleNode.textContent = sanitizeLabel(title);
    section.appendChild(titleNode);

    links.forEach((item) => {
      const link = document.createElement('a');
      link.className = 'sidebar__link';
      link.href = item.href;
      link.textContent = sanitizeLabel(item.text);
      section.appendChild(link);
    });

    return section;
  }

  function createLevelSidebarSection(levelItem) {
    const links = [{ href: levelItem.index, text: 'Indice del nivel' }, ...levelItem.pages];
    const levelMatch = levelItem.index.match(/\/nivel-(\d)\//);
    const levelClass = levelMatch ? ` sidebar__section--nivel-${levelMatch[1]}` : '';
    return createSidebarSection(levelItem.title, links, `sidebar__section--primary sidebar__section--level${levelClass}`);
  }

  function createPillarSidebarSection(pillarItem) {
    const rootLabel = pillarItem.pages.length > 0 ? 'Indice del pilar' : 'Abrir página';
    const links = [{ href: pillarItem.index, text: rootLabel }, ...pillarItem.pages];
    return createSidebarSection(pillarItem.title, links, 'sidebar__section--primary sidebar__section--pillar');
  }

  function createSidebarGroupHeading(title, sectionClass) {
    const section = document.createElement('div');
    section.className = `sidebar__section sidebar__section--locked ${sectionClass || ''}`.trim();

    const titleNode = document.createElement('div');
    titleNode.className = 'sidebar__section-title';
    titleNode.textContent = sanitizeLabel(title);
    section.appendChild(titleNode);

    return section;
  }

  function removeLegacyLevelCurrentSection(sidebar) {
    const sections = Array.from(sidebar.querySelectorAll('.sidebar__section'));
    sections.forEach((section) => {
      const titleNode = section.querySelector('.sidebar__section-title');
      if (!titleNode) return;
      const normalized = titleNode.textContent
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase();
      if (normalized === 'NIVEL ACTUAL') {
        section.remove();
      }
    });
  }

  function injectPrimarySidebarSections() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const contextSection = sidebar.querySelector('.sidebar__section--context');
    const adWrap = sidebar.querySelector('.sidebar__ad-wrap');

    if (sidebar.dataset.primaryNavInjected !== '1') {
      removeLegacyLevelCurrentSection(sidebar);

      Array.from(sidebar.querySelectorAll('.sidebar__section')).forEach((section) => {
        if (section === contextSection) return;
        section.remove();
      });

      const fragment = document.createDocumentFragment();

      LEVEL_TREE.forEach((levelItem) => {
        fragment.appendChild(createLevelSidebarSection(levelItem));
      });

      fragment.appendChild(createSidebarGroupHeading('Pilares', 'sidebar__section--primary sidebar__section--pillars-heading'));

      PILLAR_TREE.forEach((pillarItem) => {
        fragment.appendChild(createPillarSidebarSection(pillarItem));
      });

      if (adWrap) {
        sidebar.insertBefore(fragment, adWrap);
      } else {
        sidebar.appendChild(fragment);
      }

      sidebar.dataset.primaryNavInjected = '1';
    }

    // Hide legacy static blocks (Nivel actual / secciones) if any remain in DOM.
    sidebar.classList.add('sidebar--primary-tree-ready');
  }

  function markActiveNavLinks() {
    const path = currentPath();

    document.querySelectorAll('.site-nav__link[href], .mobile-menu__link[href], .mobile-tree__link[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      let linkPath;
      try {
        linkPath = normalizePath(new URL(href, window.location.href).pathname);
      } catch (_) {
        return;
      }

      if (linkPath === '/' || linkPath === '') return;
      if (path === linkPath || path.startsWith(`${linkPath}/`)) {
        link.classList.add('site-nav__link--active');
      }
    });
  }

  function markActiveSidebarLink() {
    const path = currentPath();

    document.querySelectorAll('.sidebar__link[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      let linkPath;
      try {
        linkPath = normalizePath(new URL(href, window.location.href).pathname);
      } catch (_) {
        return;
      }

      if (path === linkPath) {
        link.classList.add('sidebar__link--active');
        return;
      }

      if (linkPath !== '/' && path.startsWith(`${linkPath}/`)) {
        link.classList.add('sidebar__link--section-active');
      }
    });

    const active = document.querySelector('.sidebar__link--active');
    if (active) {
      active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function getSidebarTreeStorageKey(section, index) {
    const titleNode = section.querySelector('.sidebar__section-title, .sidebar__section-toggle-label');
    const title = sanitizeLabel(titleNode ? titleNode.textContent : `section-${index}`);
    return `${SIDEBAR_TREE_KEY_PREFIX}${index}:${title}`;
  }

  function setSidebarSectionExpanded(section, expanded) {
    const toggle = section.querySelector('.sidebar__section-toggle');
    const children = section.querySelector('.sidebar__section-children');
    if (!toggle || !children) return;

    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    section.classList.toggle('sidebar__section--collapsed', !expanded);
    children.hidden = !expanded;
  }

  function buildChevronSvg() {
    return '<svg viewBox="0 0 20 20" focusable="false" aria-hidden="true"><path d="M5.5 7.5L10 12l4.5-4.5" /></svg>';
  }

  function initSidebarTree() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const sections = Array.from(sidebar.querySelectorAll('.sidebar__section'));
    const collapsibleSections = [];

    sections.forEach((section, index) => {
      if (section.dataset.treeInitialized === '1') return;
      if (section.classList.contains('sidebar__section--locked')) {
        section.dataset.treeInitialized = '1';
        return;
      }

      const title = section.querySelector('.sidebar__section-title');
      if (!title || title.parentElement !== section) {
        section.dataset.treeInitialized = '1';
        return;
      }

      const links = Array.from(section.querySelectorAll(':scope > .sidebar__link'));
      if (links.length === 0) {
        section.dataset.treeInitialized = '1';
        return;
      }

      const nodesToWrap = Array.from(section.children).filter((node) => node !== title);
      const childrenWrap = document.createElement('div');
      childrenWrap.className = 'sidebar__section-children';
      nodesToWrap.forEach((node) => childrenWrap.appendChild(node));

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'sidebar__section-toggle';
      toggle.setAttribute('aria-expanded', 'true');

      const label = document.createElement('span');
      label.className = 'sidebar__section-toggle-label';
      label.textContent = sanitizeLabel(title.textContent);

      const icon = document.createElement('span');
      icon.className = 'sidebar__section-toggle-icon';
      icon.innerHTML = buildChevronSvg();

      toggle.appendChild(label);
      toggle.appendChild(icon);

      section.replaceChild(toggle, title);
      section.appendChild(childrenWrap);
      section.classList.add('sidebar__section--collapsible');

      const hasActive = section.querySelector('.sidebar__link--active') !== null;
      if (hasActive) {
        section.classList.add('sidebar__section--contains-active');
      }
      collapsibleSections.push({
        section,
        sectionIndex: index,
        toggle,
        hasActive,
        storageKey: getSidebarTreeStorageKey(section, index)
      });

      section.dataset.treeInitialized = '1';
    });

    collapsibleSections.forEach((item) => {
      const stored = window.sessionStorage.getItem(item.storageKey);
      const shouldExpand = stored === null ? false : stored === '1';

      setSidebarSectionExpanded(item.section, shouldExpand);

      item.toggle.addEventListener('click', () => {
        const expanded = item.toggle.getAttribute('aria-expanded') === 'true';
        const nextExpanded = !expanded;
        setSidebarSectionExpanded(item.section, nextExpanded);
        window.sessionStorage.setItem(item.storageKey, nextExpanded ? '1' : '0');
      });
    });
  }


  function setMobileTreeCollapsed(node, collapsed, toggle) {
    node.classList.toggle('mobile-tree__group--collapsed', collapsed);
    node.classList.toggle('mobile-tree__item--collapsed', collapsed);
    if (toggle) {
      toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    }
  }

  function buildMobileMenuTree() {
    const host = document.getElementById('mobile-menu-tree');
    if (!host) return;

    host.innerHTML = '';

    const path = currentPath();
    const groups = [
      {
        title: 'Niveles',
        items: LEVEL_TREE.map((level) => {
          const levelMatch = level.index.match(/\/nivel-(\d)\//);
          const levelNum = levelMatch ? levelMatch[1] : '';
          return {
            title: level.title,
            levelNum,
            links: [{ href: level.index, text: 'Indice del nivel' }, ...level.pages]
          };
        })
      },
      {
        title: 'Pilares',
        items: PILLAR_TREE.map((pillar) => ({
          title: pillar.title,
          levelNum: '',
          links: [{ href: pillar.index, text: pillar.pages.length > 0 ? 'Indice del pilar' : 'Abrir página' }, ...pillar.pages]
        }))
      }
    ];

    groups.forEach((group) => {
      const groupNode = document.createElement('div');
      groupNode.className = 'mobile-tree__group mobile-tree__group--collapsed';

      const groupToggle = document.createElement('button');
      groupToggle.type = 'button';
      groupToggle.className = 'mobile-tree__toggle';
      groupToggle.setAttribute('aria-expanded', 'false');

      const groupLabel = document.createElement('span');
      groupLabel.className = 'mobile-tree__toggle-label';
      groupLabel.textContent = sanitizeLabel(group.title);

      const groupIcon = document.createElement('span');
      groupIcon.className = 'mobile-tree__toggle-icon';
      groupIcon.innerHTML = buildChevronSvg();

      groupToggle.appendChild(groupLabel);
      groupToggle.appendChild(groupIcon);
      groupNode.appendChild(groupToggle);

      const groupChildren = document.createElement('div');
      groupChildren.className = 'mobile-tree__children';

      let groupHasActive = false;

      group.items.forEach((item) => {
        const itemNode = document.createElement('div');
        itemNode.className = 'mobile-tree__item mobile-tree__item--collapsed';
        if (item.levelNum) {
          itemNode.classList.add(`mobile-tree__item--level-${item.levelNum}`);
        }

        const itemToggle = document.createElement('button');
        itemToggle.type = 'button';
        itemToggle.className = 'mobile-tree__toggle';
        itemToggle.setAttribute('aria-expanded', 'false');

        const itemLabel = document.createElement('span');
        itemLabel.className = 'mobile-tree__toggle-label';
        if (item.levelNum) {
          const dot = document.createElement('span');
          dot.className = `nivel-dot nivel-dot--${item.levelNum}`;
          dot.setAttribute('aria-hidden', 'true');
          itemLabel.appendChild(dot);
        }
        itemLabel.appendChild(document.createTextNode(sanitizeLabel(item.title)));

        const itemIcon = document.createElement('span');
        itemIcon.className = 'mobile-tree__toggle-icon';
        itemIcon.innerHTML = buildChevronSvg();

        itemToggle.appendChild(itemLabel);
        itemToggle.appendChild(itemIcon);
        itemNode.appendChild(itemToggle);

        const itemChildren = document.createElement('div');
        itemChildren.className = 'mobile-tree__children';

        let itemHasActive = false;

        item.links.forEach((linkData) => {
          const link = document.createElement('a');
          link.className = 'mobile-tree__link';
          link.href = linkData.href;
          link.textContent = sanitizeLabel(linkData.text);

          let linkPath;
          try {
            linkPath = normalizePath(new URL(linkData.href, window.location.origin).pathname);
          } catch (_) {
            linkPath = '';
          }

          if (linkPath && path === linkPath) {
            link.classList.add('mobile-tree__link--active');
            itemHasActive = true;
            groupHasActive = true;
          }

          itemChildren.appendChild(link);
        });

        itemNode.appendChild(itemChildren);
        groupChildren.appendChild(itemNode);

        if (itemHasActive) {
          setMobileTreeCollapsed(itemNode, false, itemToggle);
        }

        itemToggle.addEventListener('click', () => {
          const collapsed = itemNode.classList.contains('mobile-tree__item--collapsed');
          setMobileTreeCollapsed(itemNode, !collapsed, itemToggle);
        });
      });

      groupNode.appendChild(groupChildren);
      host.appendChild(groupNode);

      if (groupHasActive) {
        setMobileTreeCollapsed(groupNode, false, groupToggle);
      }

      groupToggle.addEventListener('click', () => {
        const collapsed = groupNode.classList.contains('mobile-tree__group--collapsed');
        setMobileTreeCollapsed(groupNode, !collapsed, groupToggle);
      });
    });
  }

  function initMobileMenu() {
    if (mobileMenuBound) return;

    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const overlay = document.getElementById('mobile-menu-overlay');
    const menu = document.getElementById('mobile-menu');

    if (!toggleBtn || !overlay || !menu) return;

    buildMobileMenuTree();

    function openMenu() {
      overlay.classList.add('mobile-menu-overlay--visible');
      overlay.offsetHeight;
      overlay.classList.add('mobile-menu-overlay--active');
      menu.classList.add('mobile-menu--open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      overlay.classList.remove('mobile-menu-overlay--active');
      menu.classList.remove('mobile-menu--open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      overlay.addEventListener('transitionend', () => {
        overlay.classList.remove('mobile-menu-overlay--visible');
      }, { once: true });
    }

    toggleBtn.addEventListener('click', () => {
      if (menu.classList.contains('mobile-menu--open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay.addEventListener('click', (event) => {
      if (!menu.contains(event.target)) closeMenu();
    });

    menu.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('mobile-menu--open')) {
        closeMenu();
        toggleBtn.focus();
      }
    });

    mobileMenuBound = true;
  }

  function initSearch() {
    if (searchBound) return;

    const toggleBtn = document.getElementById('search-toggle');
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');

    if (!toggleBtn || !overlay) return;

    function openSearch() {
      overlay.classList.add('search-overlay--open');
      if (input) setTimeout(() => input.focus(), 50);
    }

    function closeSearch() {
      overlay.classList.remove('search-overlay--open');
      if (input) input.value = '';
      toggleBtn.focus();
    }

    toggleBtn.addEventListener('click', openSearch);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeSearch();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('search-overlay--open')) {
        closeSearch();
      }
      if (event.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        event.preventDefault();
        openSearch();
      }
    });

    searchBound = true;
  }

  function initSmoothScroll() {
    if (smoothScrollBound) return;

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    smoothScrollBound = true;
  }

  function isProbablyMobile() {
    if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
      return navigator.userAgentData.mobile;
    }

    const ua = navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobi/i.test(ua);
  }

  async function copyToClipboard(textToCopy) {
    const value = String(textToCopy || '').trim();
    if (!value) return false;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch (_) {
        // Fall back to execCommand.
      }
    }

    try {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', 'true');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.left = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  function initFooterDonateButtons() {
    document.querySelectorAll('[data-donate-copy]').forEach((button) => {
      if (button.dataset.donateBound === '1') return;

      const copyText = button.getAttribute('data-donate-copy');
      const mobileUri = button.getAttribute('data-donate-mobile');
      const desktopLabel = button.getAttribute('data-donate-label-desktop') || button.textContent;
      const mobileLabel = button.getAttribute('data-donate-label-mobile') || button.textContent;
      const initialLabel = isProbablyMobile() && mobileUri ? mobileLabel : desktopLabel;

      button.textContent = initialLabel;

      button.addEventListener('click', async () => {
        if (isProbablyMobile() && mobileUri) {
          window.location.href = mobileUri;
          return;
        }

        const ok = await copyToClipboard(copyText);

        if (ok) {
          button.classList.add('site-footer__donate-action--copied');
          button.textContent = 'Copiado';
          window.setTimeout(() => {
            button.textContent = desktopLabel;
            button.classList.remove('site-footer__donate-action--copied');
          }, 1300);
        } else {
          button.textContent = 'No se pudo copiar';
          window.setTimeout(() => {
            button.textContent = desktopLabel;
          }, 1600);
        }
      });

      button.dataset.donateBound = '1';
    });
  }


  function applyLayoutContextClass() {
    const hasSidebar = Boolean(document.querySelector('.page-layout__sidebar .sidebar'));
    document.body.classList.toggle('has-page-sidebar', hasSidebar);
  }
  function init() {
    applyLayoutContextClass();
    const returnContext = getReturnContext();

    initContextualLinkPropagation(returnContext);
    sanitizeSidebarTexts();
    initContextBackButton(returnContext);
    initSidebarContextBlock(returnContext);
    injectPrimarySidebarSections();
    markActiveNavLinks();
    markActiveSidebarLink();
    initSidebarTree();
    initMobileMenu();
    initSearch();
    initSmoothScroll();
    initFooterDonateButtons();
  }

  document.addEventListener('includes:loaded', init);

  if (document.readyState !== 'loading') {
    setTimeout(init, 100);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
  }
})();




