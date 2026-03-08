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
      id: 'nivel-1',
      label: 'Nivel 1',
      sublabel: 'Nocoinero Curioso',
      href: '/nivel-1/',
      pages: [
        { href: '/nivel-1/que-es-bitcoin.html', text: '¿Qué es Bitcoin?' },
        { href: '/nivel-1/por-que-existe-bitcoin.html', text: '¿Por qué existe Bitcoin?' },
        { href: '/nivel-1/como-funciona-bitcoin.html', text: '¿Cómo funciona Bitcoin?' },
        { href: '/nivel-1/bitcoin-vs-dinero-fiat.html', text: 'Bitcoin vs dinero fiat' },
        { href: '/nivel-1/quien-controla-bitcoin.html', text: '¿Quién controla Bitcoin?' },
        { href: '/nivel-1/el-problema-del-kyc.html', text: 'El problema del KYC' },
        { href: '/nivel-1/donde-comprar-bitcoin.html', text: '¿Dónde comprar Bitcoin?' },
        { href: '/nivel-1/primera-compra.html', text: 'Tu primera compra' },
        { href: '/nivel-1/que-es-una-wallet.html', text: '¿Qué es una wallet?' },
        { href: '/nivel-1/satoshis-y-unidades.html', text: 'Satoshis y unidades' },
        { href: '/nivel-1/preguntas-frecuentes.html', text: 'Preguntas frecuentes' },
      ]
    },
    {
      id: 'nivel-2',
      label: 'Nivel 2',
      sublabel: 'Soberano',
      href: '/nivel-2/',
      pages: [
        { sectionTitle: 'Autocustodia' },
        { href: '/nivel-2/crear-tu-wallet.html', text: 'Paso 1: Crea tu wallet propia' },
        { href: '/nivel-2/retirar-del-exchange.html', text: 'Paso 2: Retirar del exchange' },
        { href: '/nivel-2/protege-tu-seed-phrase.html', text: 'Paso 3: Protege tu seed phrase' },
        { href: '/nivel-2/backup-y-recuperacion.html', text: 'Cómo hacer backup correctamente' },
        { href: '/nivel-2/wallets-software.html', text: 'Wallets recomendadas' },

        { sectionTitle: 'Comprar Bitcoin' },
        { href: '/nivel-2/exchanges-comparativa.html', text: 'Comparativa de exchanges' },
        { href: '/nivel-2/comprar-dex-p2p.html', text: 'Comprar en DEX/P2P' },
        { href: '/nivel-2/comprar-sin-kyc.html', text: 'Wallet y seed (no-KYC)' },
        { href: '/nivel-2/cajeros-bitcoin.html', text: 'Cajeros Bitcoin' },

        { sectionTitle: 'Lightning Network' },
        { href: '/nivel-2/que-es-lightning.html', text: 'Lightning: qué es' },
        { href: '/nivel-2/como-usar-lightning.html', text: 'Cómo usar Lightning' },
        { href: '/nivel-2/wallets-lightning.html', text: 'Wallets Lightning recomendadas' },
        { href: '/nivel-2/lightning-address-e-invoices.html', text: 'Lightning Address e invoices' },
      ]
    },
    {
      id: 'nivel-3',
      label: 'Nivel 3',
      sublabel: 'Analista',
      href: '/nivel-3/',
      pages: [
        { sectionTitle: 'Transacciones' },
        { href: '/nivel-3/utxo-el-modelo-de-bitcoin.html', text: 'El modelo UTXO' },
        { href: '/nivel-3/anatomia-de-una-transaccion.html', text: 'Anatomía de una transacción' },
        { href: '/nivel-3/fees-y-mempool.html', text: 'La mempool' },
        { href: '/nivel-3/rbf-y-cpfp.html', text: 'RBF y CPFP' },
        { href: '/nivel-3/utxos-y-privacidad.html', text: 'Tus UTXOs y tu privacidad' },

        { sectionTitle: 'Claves y direcciones' },
        { href: '/nivel-3/clave-privada.html', text: 'Clave privada' },
        { href: '/nivel-3/clave-publica.html', text: 'Clave pública' },
        { href: '/nivel-3/tipos-de-direcciones.html', text: 'Tipos de direcciones Bitcoin' },
        { href: '/nivel-3/hd-wallets-y-derivation-paths.html', text: 'HD wallets y derivation paths' },
        { href: '/nivel-3/firma-digital.html', text: 'Firma digital' },

        { sectionTitle: 'Nodos y minería' },
        { href: '/nivel-3/que-es-un-nodo.html', text: 'Qué es un nodo' },
        { href: '/nivel-3/instalar-nodo.html', text: 'Monta tu propio nodo' },
        { href: '/nivel-3/mineria-en-detalle.html', text: 'Minería en detalle' },
        { href: '/nivel-3/el-halving.html', text: 'El halving' },

        { sectionTitle: 'Hardware wallets' },
        { href: '/nivel-3/configurar-hardware-wallet.html', text: 'Configura tu hardware wallet' },
        { href: '/nivel-3/comparativa-hardware-wallets.html', text: 'Comparativa hardware wallets' },
        { href: '/nivel-3/coin-control.html', text: 'Coin control' },

        { sectionTitle: 'Seguridad' },
        { href: '/nivel-3/seguridad-operativa.html', text: 'Seguridad operativa (OpSec)' },
        { href: '/nivel-3/fiscalidad-bitcoin.html', text: 'Fiscalidad de Bitcoin' },
      ]
    },
    {
      id: 'nivel-4',
      label: 'Nivel 4',
      sublabel: 'En la madriguera',
      href: '/nivel-4/',
      pages: [
        { sectionTitle: 'Privacidad' },
        { href: '/nivel-4/coinjoin.html', text: 'CoinJoin: privacidad colaborativa' },

        { sectionTitle: 'Custodia avanzada' },
        { href: '/nivel-4/que-es-multisig.html', text: '¿Qué es multisig?' },
        { href: '/nivel-4/configurar-multisig.html', text: 'Configurar multisig con Sparrow' },
        { href: '/nivel-4/distribucion-claves.html', text: 'Distribución geográfica de claves' },
        { href: '/nivel-4/herencia-bitcoin.html', text: 'Herencia de Bitcoin' },
        { href: '/nivel-4/guia-herencia-paso-a-paso.html', text: 'Guía de herencia paso a paso' },
        { href: '/nivel-4/herencia-con-multisig.html', text: 'Herencia con multisig' },

        { sectionTitle: 'Lightning avanzado' },
        { href: '/nivel-4/canales-lightning.html', text: 'Canales Lightning' },
        { href: '/nivel-4/routing-lightning.html', text: 'Routing Lightning' },
        { href: '/nivel-4/liquidez-lightning.html', text: 'Liquidez Lightning' },
        { href: '/nivel-4/tu-nodo-lightning.html', text: 'Tu nodo Lightning' },

        { sectionTitle: 'Minería casera' },
        { href: '/nivel-4/mineria-casera.html', text: 'Minería casera' },
        { href: '/nivel-4/mineria-con-bitaxe.html', text: 'Minería con Bitaxe' },
        { href: '/nivel-4/hardware-de-mineria.html', text: 'Hardware de minería' },
        { href: '/nivel-4/pools-de-mineria.html', text: 'Pools de minería' },
        { href: '/nivel-4/calefaccion-con-bitcoin.html', text: 'Calefacción con Bitcoin' },

        { sectionTitle: 'Sidechains y capas' },
        { href: '/nivel-4/que-son-las-sidechains.html', text: '¿Qué son las sidechains?' },
        { href: '/nivel-4/rootstock-rsk.html', text: 'Rootstock (RSK)' },
        { href: '/nivel-4/liquid-network.html', text: 'Liquid Network' },
        { href: '/nivel-4/fedimint-y-cashu.html', text: 'Fedimint y Cashu' },
      ]
    },
    {
      id: 'nivel-5',
      label: 'Nivel 5',
      sublabel: 'Mentor',
      href: '/nivel-5/',
      pages: [
        { href: '/nivel-5/criptografia-clave-publica.html', text: 'Criptografía de clave pública' },
        { href: '/nivel-5/curva-eliptica-secp256k1.html', text: 'Curva elíptica secp256k1' },
        { href: '/nivel-5/ecdsa-en-detalle.html', text: 'ECDSA en detalle' },
        { href: '/nivel-5/schnorr-y-musig.html', text: 'Schnorr y MuSig' },
        { href: '/nivel-5/proof-of-work.html', text: 'Proof of Work' },
        { href: '/nivel-5/merkle-tree.html', text: 'Merkle Tree' },
        { href: '/nivel-5/bitcoin-script-avanzado.html', text: 'Bitcoin Script avanzado' },
        { href: '/nivel-5/psbt.html', text: 'PSBT' },
        { href: '/nivel-5/mineria-tecnica.html', text: 'Minería técnica' },
        { href: '/nivel-5/gossip-y-p2p.html', text: 'Protocolo P2P y gossip' },
        { href: '/nivel-5/lightning-htlc.html', text: 'Lightning: HTLCs' },
        { href: '/nivel-5/lightning-onion.html', text: 'Lightning: onion routing' },
        { href: '/nivel-5/sidechains.html', text: 'Sidechains' },
        { href: '/nivel-5/covenant-opcodes.html', text: 'Covenants y nuevos opcodes' },
      ]
    },
    {
      id: 'nivel-6',
      label: 'Nivel 6',
      sublabel: 'Satoshi',
      href: '/nivel-6/',
      pages: [
        { href: '/nivel-6/bitcoin-y-libertad.html', text: 'Bitcoin y libertad financiera' },
        { href: '/nivel-6/contribuir-bitcoin-core.html', text: 'Contribuir a Bitcoin Core' },
        { href: '/nivel-6/bips-y-gobernanza.html', text: 'BIPs y gobernanza de Bitcoin' },
        { href: '/nivel-6/bitcoin-como-capa-base.html', text: 'Bitcoin como capa base' },
        { href: '/nivel-6/full-stack-bitcoiner.html', text: 'El full-stack bitcoiner' },
      ]
    },
    {
      id: 'base',
      label: 'Base de Conocimiento',
      sublabel: '',
      href: '/base/',
      pages: [
        { sectionTitle: 'Fundamentos Bitcoin' },
        { href: '/base/que-es-bitcoin.html', text: 'Qué es Bitcoin' },
        { href: '/base/como-funciona-bitcoin.html', text: 'Cómo funciona Bitcoin' },
        { href: '/base/que-es-la-blockchain.html', text: 'Qué es la blockchain' },
        { href: '/base/que-es-la-mineria.html', text: 'Qué es la minería' },
        { href: '/base/los-21-millones.html', text: 'Los 21 millones y la oferta fija' },
        { href: '/base/que-es-un-satoshi.html', text: 'Qué es un satoshi' },
        { href: '/base/que-es-una-confirmacion.html', text: 'Qué es una confirmación' },
        { href: '/base/que-son-las-fees.html', text: 'Qué son las fees' },
        { href: '/base/que-es-una-direccion.html', text: 'Qué es una dirección' },
        { href: '/base/que-es-seed-phrase.html', text: 'Qué es seed phrase' },

        { sectionTitle: 'Historia y personas' },
        { href: '/base/historia-de-bitcoin.html', text: 'Historia de Bitcoin' },
        { href: '/base/quien-es-satoshi-nakamoto.html', text: 'Quién es Satoshi Nakamoto' },
        { href: '/base/el-whitepaper.html', text: 'El whitepaper' },
        { href: '/base/historia-del-dinero.html', text: 'Historia del dinero' },

        { sectionTitle: 'Dinero y economía' },
        { href: '/base/problema-del-dinero-tradicional.html', text: 'Problema del dinero tradicional' },
        { href: '/base/inflacion-y-bitcoin.html', text: 'Inflación y Bitcoin' },
        { href: '/base/bitcoin-vs-dinero-tradicional.html', text: 'Bitcoin vs dinero tradicional' },
        { href: '/base/bitcoin-vs-oro.html', text: 'Bitcoin vs oro' },
        { href: '/base/bitcoin-como-reserva-de-valor.html', text: 'Bitcoin como reserva de valor' },
        { href: '/base/economia-austriaca.html', text: 'Economía austríaca' },
        { href: '/base/dca-compras-periodicas.html', text: 'DCA: compras periódicas' },

        { sectionTitle: 'Exchanges y compra' },
        { href: '/base/que-es-un-exchange.html', text: 'Qué es un exchange' },
        { href: '/base/exchange-centralizado.html', text: 'Exchange centralizado (CEX)' },
        { href: '/base/exchange-descentralizado.html', text: 'Exchange descentralizado (DEX)' },
        { href: '/base/kyc-vs-no-kyc.html', text: 'KYC vs no-KYC' },
        { href: '/base/estafas-comunes.html', text: 'Estafas comunes' },
        { href: '/base/on-chain-vs-lightning.html', text: 'On-chain vs Lightning' },

        { sectionTitle: 'Wallets y seguridad' },
        { href: '/base/que-es-una-wallet.html', text: 'Qué es una wallet' },
        { href: '/base/tipos-de-wallet.html', text: 'Tipos de wallet' },
        { href: '/base/que-es-la-autocustodia.html', text: 'Qué es la autocustodia' },
        { href: '/base/seguridad-basica.html', text: 'Seguridad básica' },
        { href: '/base/bitcoin-vs-altcoins.html', text: 'Bitcoin vs altcoins' },
      ]
    },
    {
      id: 'la-madriguera',
      label: 'La Madriguera',
      sublabel: '',
      href: '/la-madriguera/',
      pages: [
        { sectionTitle: 'PRECURSORES', accent: true },
        { href: '/la-madriguera/polis-paralela-vaclav-benda.html', text: 'La Polis Paralela — Benda (1978)' },
        { href: '/la-madriguera/manifiesto-gnu-richard-stallman.html', text: 'El Manifiesto GNU — Stallman (1985)' },
        { href: '/la-madriguera/manifiesto-cypherpunk.html', text: 'El Manifiesto Cypherpunk — Hughes (1993)' },
        { href: '/la-madriguera/efectivo-digital-y-privacidad-hal-finney.html', text: 'Efectivo Digital y Privacidad — Finney (1993)' },
        { href: '/la-madriguera/declaracion-independencia-ciberespacio.html', text: 'Declaración del Ciberespacio — Barlow (1996)' },
        { href: '/la-madriguera/hashcash-adam-back.html', text: 'Hashcash — Adam Back (1997)' },
        { href: '/la-madriguera/b-money-wei-dai.html', text: 'B-Money — Wei Dai (1998)' },
        { href: '/la-madriguera/bit-gold-nick-szabo.html', text: 'Bit Gold — Nick Szabo (1998/2005)' },
        { href: '/la-madriguera/el-whitepaper-de-bitcoin.html', text: 'El Whitepaper — Satoshi (2008)' },

        { sectionTitle: 'HISTORIA', accent: true },
        { href: '/la-madriguera/los-primeros-dias-de-bitcoin.html', text: 'Los primeros días de Bitcoin (2009)' },
        { href: '/la-madriguera/bitcoin-y-wikileaks.html', text: 'Bitcoin y WikiLeaks (2010)' },
        { href: '/la-madriguera/silk-road-y-ross-ulbricht.html', text: 'Silk Road y Ross Ulbricht (2013)' },
        { href: '/la-madriguera/mt-gox.html', text: 'Mt. Gox (2014)' },
        { href: '/la-madriguera/guerra-tamano-de-bloque.html', text: 'Guerra del tamaño de bloque (2015-17)' },
        { href: '/la-madriguera/crisis-terra-luna.html', text: 'Crisis Terra/Luna (2022)' },
        { href: '/la-madriguera/colapso-ftx.html', text: 'Colapso de FTX (2022)' },
        { href: '/la-madriguera/ordinals-e-inscriptions.html', text: 'Ordinals e Inscriptions (2023)' },
        { href: '/la-madriguera/el-caso-samourai-wallet.html', text: 'Caso Samourai Wallet (2024)' },
        { href: '/la-madriguera/etfs-de-bitcoin.html', text: 'ETFs de Bitcoin (2024)' },

        { sectionTitle: 'FUNDAMENTOS', accent: true },
        { href: '/la-madriguera/el-ataque-del-51.html', text: 'El ataque del 51%' },
        { href: '/la-madriguera/bloques-huerfanos-y-reorgs.html', text: 'Bloques huérfanos y reorgs' },
        { href: '/la-madriguera/el-problema-del-general-bizantino.html', text: 'El Problema del General Bizantino' },
        { href: '/la-madriguera/el-doble-gasto.html', text: 'El doble gasto' },
        { href: '/la-madriguera/politica-monetaria-de-bitcoin.html', text: 'La política monetaria de Bitcoin' },
        { href: '/la-madriguera/los-soft-forks-de-bitcoin.html', text: 'Los soft forks de Bitcoin' },
        { href: '/la-madriguera/multisig-y-herencia-segun-satoshi.html', text: 'Multisig y herencia según Satoshi' },
        { href: '/la-madriguera/economia-austriaca-para-bitcoiners.html', text: 'Economía austríaca para bitcoiners' },

        { sectionTitle: 'ANÁLISIS', accent: true },
        { href: '/la-madriguera/bitcoin-y-energia.html', text: 'Bitcoin y energía' },
        { href: '/la-madriguera/geopolitica-de-la-mineria.html', text: 'Geopolítica de la minería' },
        { href: '/la-madriguera/lightning-network-estado-actual.html', text: 'Lightning Network: estado actual' },
        { href: '/la-madriguera/privacidad-en-bitcoin-estado-actual.html', text: 'Privacidad: estado actual' },
        { href: '/la-madriguera/puede-un-gobierno-prohibir-bitcoin.html', text: '¿Puede un gobierno prohibir Bitcoin?' },
        { href: '/la-madriguera/el-debate-de-la-osificacion.html', text: 'El debate de la osificación' },
        { href: '/la-madriguera/medio-de-pago-o-reserva-de-valor.html', text: '¿Medio de pago o reserva de valor?' },
        { href: '/la-madriguera/hiperinflaciones-y-bitcoin.html', text: 'Hiperinflaciones y Bitcoin' },
        { href: '/la-madriguera/el-halving-y-los-ciclos-de-precio.html', text: 'El halving y los ciclos de precio' },
      ]
    },
    {
      id: 'herramientas',
      label: 'Herramientas',
      sublabel: '',
      href: '/herramientas/',
      pages: [
        { href: '/herramientas/hash.html', text: 'Funciones hash (SHA-256, RIPEMD-160)' },
        { href: '/herramientas/private-key.html', text: 'Generador de clave privada' },
        { href: '/herramientas/public-key.html', text: 'Derivar clave pública' },
        { href: '/herramientas/wif.html', text: 'Conversor WIF' },
        { href: '/herramientas/mnemonic-seed.html', text: 'Generador semilla BIP39' },
        { href: '/herramientas/seed-validator.html', text: 'Validador semilla BIP39' },
        { href: '/herramientas/entropy-analyzer.html', text: 'Analizador de entropía' },
        { href: '/herramientas/hd-wallet.html', text: 'Explorador HD Wallet' },
        { href: '/herramientas/derivation-paths.html', text: 'Rutas de derivación BIP32/44/84/86' },
        { href: '/herramientas/extended-keys.html', text: 'Claves extendidas (xpub/xprv)' },
        { href: '/herramientas/address-base58.html', text: 'Generador direcciones Base58' },
        { href: '/herramientas/address-bech32.html', text: 'Generador direcciones Bech32' },
        { href: '/herramientas/address-from-xpub.html', text: 'Derivar direcciones desde xpub' },
        { href: '/herramientas/checksum-base58.html', text: 'Verificador checksum Base58' },
        { href: '/herramientas/ec-calculator.html', text: 'Calculadora curva elíptica' },
        { href: '/herramientas/ecdsa-schnorr.html', text: 'Firma ECDSA y Schnorr' },
        { href: '/herramientas/script-interpreter.html', text: 'Intérprete Bitcoin Script' },
        { href: '/herramientas/tx-decoder.html', text: 'Decodificador de transacciones' },
        { href: '/herramientas/tx-builder.html', text: 'Constructor de transacciones' },
        { href: '/herramientas/tx-splitter.html', text: 'Splitter de transacciones' },
        { href: '/herramientas/psbt-decoder.html', text: 'Decodificador PSBT' },
        { href: '/herramientas/timelock-decoder.html', text: 'Decodificador timelocks' },
        { href: '/herramientas/multisig-address.html', text: 'Generador direcciones multisig' },
        { href: '/herramientas/merkle-tree.html', text: 'Visualizador Merkle Tree' },
        { href: '/herramientas/block-tools.html', text: 'Herramientas de bloques' },
        { href: '/herramientas/mining-simulator.html', text: 'Simulador de minería' },
        { href: '/herramientas/difficulty-converter.html', text: 'Conversor de dificultad' },
        { href: '/herramientas/lightning-invoice.html', text: 'Decodificador invoices Lightning' },
        { href: '/herramientas/calculadora-fees.html', text: 'Calculadora de comisiones' },
        { href: '/herramientas/calculadora-herencia.html', text: 'Calculadora de herencia' },
        { href: '/herramientas/calculadora-impuestos.html', text: 'Calculadora de impuestos' },
        { href: '/herramientas/conversor.html', text: 'Conversor BTC/sats/fiat' },
        { href: '/herramientas/ascii-hex.html', text: 'Conversor ASCII/Hex' },
        { href: '/herramientas/compact-size.html', text: 'Conversor CompactSize' },
        { href: '/herramientas/unix-time.html', text: 'Conversor Unix Timestamp' },
      ]
    },
    {
      id: 'lightning',
      label: 'Lightning',
      sublabel: '',
      href: '/lightning/',
      pages: [
        { sectionTitle: 'Fundamentos' },
        { href: '/lightning/que-es-lightning.html', text: '¿Qué es Lightning Network?' },
        { href: '/lightning/como-funciona-un-pago.html', text: 'Cómo funciona un pago Lightning' },
        { href: '/lightning/wallets-lightning.html', text: 'Wallets Lightning: tipos y trade-offs' },
        { href: '/lightning/ventajas-y-limites.html', text: 'Ventajas y límites reales de Lightning' },
        { href: '/lightning/glosario-lightning.html', text: 'Glosario Lightning' },

        { sectionTitle: 'Protocolos' },
        { href: '/lightning/bolt11-y-bolt12.html', text: 'BOLT11 y BOLT12' },
        { href: '/lightning/lnurl.html', text: 'LNURL' },
        { href: '/lightning/lightning-address.html', text: 'Lightning Address' },
        { href: '/lightning/keysend-mpp-amp.html', text: 'Keysend, MPP y AMP' },
        { href: '/lightning/nwc.html', text: 'Nostr Wallet Connect (NWC)' },
        { href: '/lightning/webln.html', text: 'WebLN' },

        { sectionTitle: 'Infraestructura' },
        { href: '/lightning/lsp-y-liquidez.html', text: 'LSP, liquidez y canales JIT' },
        { href: '/lightning/submarine-swaps.html', text: 'Submarine swaps y chain swaps' },
        { href: '/lightning/splicing-y-channel-factories.html', text: 'Splicing y channel factories' },
        { href: '/lightning/watchtowers.html', text: 'Watchtowers' },
        { href: '/lightning/ptlcs-y-futuro.html', text: 'PTLCs y evolución técnica' },

        { sectionTitle: 'Aplicaciones' },
        { href: '/lightning/l402.html', text: 'L402' },
        { href: '/lightning/agentes-ia-y-lightning.html', text: 'Agentes de IA y Lightning' },
        { href: '/lightning/podcasting-value4value.html', text: 'Podcasting 2.0 y Value4Value' },
        { href: '/lightning/nostr-zaps-y-lightning.html', text: 'Nostr, Zaps y Lightning' },
        { href: '/lightning/gaming-streaming-comercio.html', text: 'Gaming, streaming y comercio' },
        { href: '/lightning/micropagos-web.html', text: 'Micropagos web y paywalls' },

        { sectionTitle: 'Extensiones' },
        { href: '/lightning/taproot-assets.html', text: 'Taproot Assets' },
        { href: '/lightning/ecash-cashu-fedimint.html', text: 'eCash: Cashu y Fedimint' },
        { href: '/lightning/ark.html', text: 'Ark' },
        { href: '/lightning/mas-que-sats.html', text: 'Cuando Lightning mueve más que sats' },

        { sectionTitle: 'Seguridad' },
        { href: '/lightning/seguridad-y-riesgos.html', text: 'Riesgos reales y privacidad' },
        { href: '/lightning/custodia-vs-autocustodia.html', text: 'Custodia en Lightning' },
        { href: '/lightning/errores-comunes.html', text: 'Errores comunes y scams' },
      ]
    },
    {
      id: 'comunidad',
      label: 'Comunidad',
      sublabel: '',
      href: '/comunidad/',
      pages: [
        { href: '/comunidad/comunidades-online.html', text: 'Comunidades online' },
        { href: '/comunidad/meetups.html', text: 'Meetups presenciales' },
        { href: '/comunidad/conferencias.html', text: 'Conferencias' },
        { href: '/comunidad/nostr-y-bitcoin.html', text: 'Nostr y Bitcoin' },
      ]
    },
    {
      id: 'glosario',
      label: 'Glosario',
      sublabel: '',
      href: '/glosario.html',
      pages: []
    },
    {
      id: 'recursos',
      label: 'Recursos',
      sublabel: '',
      href: '/recursos.html',
      pages: [
        { href: '/recursos/libros.html', text: 'Libros' },
        { href: '/recursos/podcasts.html', text: 'Podcasts' },
        { href: '/recursos/documentales.html', text: 'Documentales' },
        { href: '/recursos/webs-referencia.html', text: 'Webs de referencia' },
        { href: '/recursos/herramientas.html', text: 'Herramientas recomendadas' },
        { href: '/recursos/hardware-wallets.html', text: 'Hardware wallets' },
        { href: '/recursos/otros-recursos.html', text: 'Otros recursos' },
      ]
    },
  ];

  // ============================================================
  // Renderer del sidebar — detecta sectionTitle y accent
  // ============================================================
  // El renderer debe implementar esta lógica al construir los <li>:
  //
  // pages.forEach(page => {
  //   if (page.sectionTitle) {
  //     const cls = page.accent
  //       ? 'nav-section-title nav-section-title--accent'
  //       : 'nav-section-title';
  //     li.className = cls;
  //     li.textContent = page.sectionTitle;
  //     // NO añadir href ni event listeners
  //   } else {
  //     // render normal de enlace
  //     const a = document.createElement('a');
  //     a.href = page.href;
  //     a.textContent = page.text;
  //     li.appendChild(a);
  //   }
  // });
  // ============================================================

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
    if (path === '/lightning' || path.startsWith('/lightning/')) return 'Lightning';
    if (path === '/glosario.html') return 'Glosario';
    if (path === '/recursos.html' || path.startsWith('/recursos/')) return 'Recursos';
    if (path === '/sobre.html' || path === '/actualizaciones.html' || path === '/donar.html') return 'Proyecto';

    return 'Contenido';
  }

  function collapseWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function textScore(value) {
    const ok = (value.match(/[A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü¿¡]/g) || []).length;
    const bad = (value.match(/[\u00C3\u00C2\u00E2\uFFFD]/g) || []).length;
    return ok - (bad * 3);
  }

  function maybeDecodeMojibake(value) {
    const raw = collapseWhitespace(value);
    if (!raw) return raw;
    if (!/[\u00C3\u00C2\u00E2]/.test(raw)) return raw;

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
      .replace(/\s*—\s*/g, ' - ')
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
    document.querySelectorAll('.sidebar__section-title, .sidebar__link, .sidebar__subgroup-title, .nav-section-title').forEach((node) => {
      const cleaned = sanitizeLabel(node.textContent);
      if (cleaned) node.textContent = cleaned;
    });

    document.querySelectorAll('.breadcrumb__item, .breadcrumb__current').forEach((node) => {
      const cleaned = sanitizeLabel(node.textContent);
      if (cleaned) node.textContent = cleaned;
    });
  }

  function isLevelNode(item) {
    return /^nivel-[1-6]$/.test(String(item && item.id ? item.id : ''));
  }

  function splitPrimaryTree() {
    const levels = [];
    const pillars = [];

    LEVEL_TREE.forEach((item) => {
      if (isLevelNode(item)) {
        levels.push(item);
      } else {
        pillars.push(item);
      }
    });

    return { levels, pillars };
  }

  function getItemTitle(item) {
    const parts = [item && item.label ? item.label : '', item && item.sublabel ? item.sublabel : '']
      .map((value) => collapseWhitespace(value))
      .filter(Boolean);

    return parts.join(' - ');
  }

  function createSidebarSection(item, sectionClass, rootLabel) {
    const section = document.createElement('div');
    section.className = `sidebar__section ${sectionClass || ''}`.trim();

    const titleNode = document.createElement('div');
    titleNode.className = 'sidebar__section-title';
    titleNode.textContent = sanitizeLabel(getItemTitle(item));
    section.appendChild(titleNode);

    const rootLink = document.createElement('a');
    rootLink.className = 'sidebar__link';
    rootLink.href = item.href;
    rootLink.textContent = sanitizeLabel(rootLabel);
    section.appendChild(rootLink);

    let insideSubsection = false;

    (item.pages || []).forEach((page) => {
      if (!page) return;

      if (page.sectionTitle) {
        insideSubsection = true;

        const sectionTitle = document.createElement('div');
        sectionTitle.className = page.accent
          ? 'nav-section-title nav-section-title--accent'
          : 'nav-section-title';
        sectionTitle.textContent = sanitizeLabel(page.sectionTitle);
        section.appendChild(sectionTitle);
        return;
      }

      if (!page.href || !page.text) return;

      const link = document.createElement('a');
      link.className = insideSubsection
        ? 'sidebar__link sidebar__link--subgroup'
        : 'sidebar__link';
      link.href = page.href;
      link.textContent = sanitizeLabel(page.text);
      section.appendChild(link);
    });

    return section;
  }

  function createLevelSidebarSection(levelItem) {
    const levelMatch = String(levelItem.id || '').match(/^nivel-(\d)$/);
    const levelClass = levelMatch ? ` sidebar__section--nivel-${levelMatch[1]}` : '';
    return createSidebarSection(levelItem, `sidebar__section--primary sidebar__section--level${levelClass}`, 'Indice del nivel');
  }

  function createPillarSidebarSection(pillarItem) {
    return createSidebarSection(pillarItem, 'sidebar__section--primary sidebar__section--pillar', 'Indice del pilar');
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
      const { levels, pillars } = splitPrimaryTree();

      levels.forEach((levelItem) => {
        fragment.appendChild(createLevelSidebarSection(levelItem));
      });

      if (pillars.length > 0) {
        fragment.appendChild(createSidebarGroupHeading('Pilares', 'sidebar__section--primary sidebar__section--pillars-heading'));

        pillars.forEach((pillarItem) => {
          fragment.appendChild(createPillarSidebarSection(pillarItem));
        });
      }

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
    const { levels, pillars } = splitPrimaryTree();

    const groups = [
      {
        title: 'Niveles',
        items: levels.map((item) => {
          const levelMatch = String(item.id || '').match(/^nivel-(\d)$/);
          return {
            title: getItemTitle(item),
            levelNum: levelMatch ? levelMatch[1] : '',
            indexHref: item.href,
            indexText: 'Indice del nivel',
            pages: item.pages || []
          };
        })
      },
      {
        title: 'Pilares',
        items: pillars.map((item) => ({
          title: getItemTitle(item),
          levelNum: '',
          indexHref: item.href,
          indexText: 'Indice del pilar',
          pages: item.pages || []
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
        let insideSubsection = false;

        const appendMobileTreeLink = (linkData, extraClass) => {
          const link = document.createElement('a');
          link.className = `mobile-tree__link ${extraClass || ''}`.trim();
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
        };

        appendMobileTreeLink({ href: item.indexHref, text: item.indexText });

        item.pages.forEach((entry) => {
          if (!entry) return;

          if (entry.sectionTitle) {
            insideSubsection = true;

            const subgroupTitle = document.createElement('div');
            subgroupTitle.className = entry.accent
              ? 'mobile-tree__subgroup-title nav-section-title--accent'
              : 'mobile-tree__subgroup-title';
            subgroupTitle.textContent = sanitizeLabel(entry.sectionTitle);
            itemChildren.appendChild(subgroupTitle);
            return;
          }

          if (!entry.href || !entry.text) return;
          appendMobileTreeLink(entry, insideSubsection ? 'mobile-tree__link--subgroup' : '');
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








