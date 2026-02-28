/**
 * aprendebtc.com - search.js
 * Client-side search with static fallback + dynamic site/base indexes.
 */

(function () {
  'use strict';

  const staticIndex = [
    { title: 'Inicio', url: '/', tags: ['home', 'landing'], section: 'General' },

    { title: 'Nivel 1 - Explorador', url: '/nivel-1/', tags: ['nivel 1', 'principiante'], section: 'Niveles', nivel: 1 },
    { title: 'Antes de empezar', url: '/nivel-1/antes-de-empezar.html', tags: ['nivel 1', 'inicio'], section: 'Nivel 1', nivel: 1 },
    { title: 'El problema del KYC', url: '/nivel-1/el-problema-del-kyc.html', tags: ['kyc', 'privacidad'], section: 'Nivel 1', nivel: 1 },
    { title: 'Dos caminos: KYC o no-KYC', url: '/nivel-1/dos-caminos.html', tags: ['kyc', 'no-kyc'], section: 'Nivel 1', nivel: 1 },
    { title: 'Registrarte en un exchange', url: '/nivel-1/registrarte-en-un-exchange.html', tags: ['exchange', 'registro'], section: 'Nivel 1', nivel: 1 },
    { title: 'Tu primera compra', url: '/nivel-1/tu-primera-compra.html', tags: ['compra', 'sats'], section: 'Nivel 1', nivel: 1 },
    { title: 'Qu\u00e9 acabas de hacer', url: '/nivel-1/que-has-hecho.html', tags: ['custodia', 'keys'], section: 'Nivel 1', nivel: 1 },

    { title: 'Nivel 2 - Soberano', url: '/nivel-2/', tags: ['nivel 2', 'autocustodia', 'lightning'], section: 'Niveles', nivel: 2 },
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

    { title: 'Nivel 3 - Analista', url: '/nivel-3/', tags: ['nivel 3', 'utxo', 'transacciones'], section: 'Niveles', nivel: 3 },
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
    { title: 'Miner\u00eda en detalle', url: '/nivel-3/mineria-en-detalle.html', tags: ['nivel 3', 'minería', 'pow'], section: 'Nivel 3', nivel: 3 },
    { title: 'El halving', url: '/nivel-3/halving.html', tags: ['nivel 3', 'halving', 'emision'], section: 'Nivel 3', nivel: 3 },
    { title: 'Configura tu hardware wallet', url: '/nivel-3/configurar-hardware-wallet.html', tags: ['nivel 3', 'hardware wallet', 'custodia'], section: 'Nivel 3', nivel: 3 },
    { title: 'Comparativa de hardware wallets', url: '/nivel-3/comparativa-hardware-wallets.html', tags: ['nivel 3', 'hardware wallet', 'comparativa'], section: 'Nivel 3', nivel: 3 },
    { title: 'Coin control: gestiona tus UTXOs', url: '/nivel-3/coin-control.html', tags: ['nivel 3', 'coin control', 'utxo'], section: 'Nivel 3', nivel: 3 },



    { title: 'Nivel 4 - En la madriguera', url: '/nivel-4/', tags: ['nivel 4', 'privacidad', 'multisig', 'herencia', 'lightning', 'minería'], section: 'Niveles', nivel: 4 },
    { title: 'Distribución geográfica de claves', url: '/nivel-4/distribucion-claves.html', tags: ['nivel 4', 'multisig', 'claves'], section: 'Nivel 4', nivel: 4 },
    { title: 'Herencia de Bitcoin', url: '/nivel-4/herencia-bitcoin.html', tags: ['nivel 4', 'herencia', 'planificacion'], section: 'Nivel 4', nivel: 4 },
    { title: 'Guía de herencia paso a paso', url: '/nivel-4/guia-herencia.html', tags: ['nivel 4', 'herencia', 'guia'], section: 'Nivel 4', nivel: 4 },
    { title: 'Herencia con multisig', url: '/nivel-4/herencia-multisig.html', tags: ['nivel 4', 'herencia', 'multisig'], section: 'Nivel 4', nivel: 4 },
    { title: 'Canales de pago', url: '/nivel-4/canales-lightning.html', tags: ['nivel 4', 'lightning', 'canales'], section: 'Nivel 4', nivel: 4 },
    { title: 'Gestión de liquidez', url: '/nivel-4/liquidez-lightning.html', tags: ['nivel 4', 'lightning', 'liquidez'], section: 'Nivel 4', nivel: 4 },
    { title: 'Routing de pagos', url: '/nivel-4/routing-lightning.html', tags: ['nivel 4', 'lightning', 'routing'], section: 'Nivel 4', nivel: 4 },
    { title: 'Montar tu nodo Lightning', url: '/nivel-4/nodo-lightning.html', tags: ['nivel 4', 'lightning', 'nodo'], section: 'Nivel 4', nivel: 4 },
    { title: 'Minería casera: tiene sentido', url: '/nivel-4/mineria-casera.html', tags: ['nivel 4', 'minería', 'casa'], section: 'Nivel 4', nivel: 4 },
    { title: 'Hardware de minería', url: '/nivel-4/hardware-mineria.html', tags: ['nivel 4', 'minería', 'asic'], section: 'Nivel 4', nivel: 4 },
    { title: 'Pools de minería', url: '/nivel-4/pools-mineria.html', tags: ['nivel 4', 'minería', 'pools'], section: 'Nivel 4', nivel: 4 },
    { title: 'Minería con Bitaxe', url: '/nivel-4/mineria-bitaxe.html', tags: ['nivel 4', 'bitaxe', 'minería'], section: 'Nivel 4', nivel: 4 },
    { title: 'Bitcoin como calefacción', url: '/nivel-4/calefaccion-bitcoin.html', tags: ['nivel 4', 'minería', 'calefaccion'], section: 'Nivel 4', nivel: 4 },

    { title: 'Nivel 5 - Mentor', url: '/nivel-5/', tags: ['nivel 5', 'criptografia', 'script', 'protocolo'], section: 'Niveles', nivel: 5 },

    { title: 'Nivel 6 - Satoshi', url: '/nivel-6/', tags: ['nivel 6', 'filosofia', 'contribucion', 'educacion'], section: 'Niveles', nivel: 6 },
    { title: 'Por que Bitcoin importa de verdad', url: '/nivel-6/por-que-bitcoin-importa.html', tags: ['nivel 6', 'filosofia'], section: 'Nivel 6', nivel: 6 },
    { title: 'Bitcoin y libertad financiera', url: '/nivel-6/bitcoin-y-libertad.html', tags: ['nivel 6', 'libertad', 'soberania'], section: 'Nivel 6', nivel: 6 },
    { title: 'Teoría de juegos de Bitcoin', url: '/nivel-6/bitcoin-game-theory.html', tags: ['nivel 6', 'game theory', 'incentivos'], section: 'Nivel 6', nivel: 6 },
    { title: 'Las críticas a Bitcoin y las respuestas', url: '/nivel-6/criticas-a-bitcoin.html', tags: ['nivel 6', 'criticas', 'objeciones'], section: 'Nivel 6', nivel: 6 },
    { title: 'Cómo contribuir a Bitcoin Core', url: '/nivel-6/contribuir-bitcoin-core.html', tags: ['nivel 6', 'bitcoin core', 'contribuir'], section: 'Nivel 6', nivel: 6 },
    { title: 'Qué es un BIP', url: '/nivel-6/que-es-un-bip.html', tags: ['nivel 6', 'bip', 'protocolo'], section: 'Nivel 6', nivel: 6 },
    { title: 'Soft fork vs Hard fork', url: '/nivel-6/soft-fork-hard-fork.html', tags: ['nivel 6', 'fork', 'consenso'], section: 'Nivel 6', nivel: 6 },
    { title: 'Contribuir a Bitcoin sin saber programar', url: '/nivel-6/contribuir-sin-codigo.html', tags: ['nivel 6', 'contribuir', 'comunidad'], section: 'Nivel 6', nivel: 6 },
    { title: 'Cómo explicar Bitcoin sin que te miren raro', url: '/nivel-6/como-explicar-bitcoin.html', tags: ['nivel 6', 'educacion', 'comunicacion'], section: 'Nivel 6', nivel: 6 },
    { title: 'Cómo bitcoinizar tu entorno', url: '/nivel-6/bitcoinizar-tu-entorno.html', tags: ['nivel 6', 'adopcion', 'educacion'], section: 'Nivel 6', nivel: 6 },

    { title: 'Funciones hash', url: '/nivel-5/funciones-hash.html', tags: ['nivel 5', 'hash', 'sha-256'], section: 'Nivel 5', nivel: 5 },
    { title: 'Criptografia de curva eliptica', url: '/nivel-5/curva-eliptica.html', tags: ['nivel 5', 'criptografia', 'secp256k1'], section: 'Nivel 5', nivel: 5 },
    { title: 'ECDSA', url: '/nivel-5/ecdsa.html', tags: ['nivel 5', 'ecdsa', 'firmas'], section: 'Nivel 5', nivel: 5 },
    { title: 'Firmas Schnorr', url: '/nivel-5/schnorr.html', tags: ['nivel 5', 'schnorr', 'taproot'], section: 'Nivel 5', nivel: 5 },
    { title: 'Estructura de una transaccion', url: '/nivel-5/estructura-transaccion.html', tags: ['nivel 5', 'transaccion', 'raw'], section: 'Nivel 5', nivel: 5 },
    { title: 'SegWit por dentro', url: '/nivel-5/segwit-internals.html', tags: ['nivel 5', 'segwit', 'witness'], section: 'Nivel 5', nivel: 5 },
    { title: 'Taproot por dentro', url: '/nivel-5/taproot-internals.html', tags: ['nivel 5', 'taproot', 'p2tr'], section: 'Nivel 5', nivel: 5 },
    { title: 'PSBT', url: '/nivel-5/psbt.html', tags: ['nivel 5', 'psbt', 'firmas'], section: 'Nivel 5', nivel: 5 },
    { title: 'Locktime y Sequence', url: '/nivel-5/locktime-sequence.html', tags: ['nivel 5', 'locktime', 'sequence'], section: 'Nivel 5', nivel: 5 },
    { title: 'Bitcoin Script', url: '/nivel-5/bitcoin-script.html', tags: ['nivel 5', 'script', 'opcodes'], section: 'Nivel 5', nivel: 5 },
    { title: 'P2PKH', url: '/nivel-5/p2pkh.html', tags: ['nivel 5', 'p2pkh', 'scriptpubkey'], section: 'Nivel 5', nivel: 5 },
    { title: 'P2SH', url: '/nivel-5/p2sh.html', tags: ['nivel 5', 'p2sh', 'redeemscript'], section: 'Nivel 5', nivel: 5 },
    { title: 'P2WPKH y P2WSH', url: '/nivel-5/p2wpkh-p2wsh.html', tags: ['nivel 5', 'segwit', 'p2wpkh', 'p2wsh'], section: 'Nivel 5', nivel: 5 },
    { title: 'P2TR', url: '/nivel-5/p2tr.html', tags: ['nivel 5', 'taproot', 'p2tr'], section: 'Nivel 5', nivel: 5 },
    { title: 'OP_RETURN', url: '/nivel-5/op-return.html', tags: ['nivel 5', 'op_return', 'datos'], section: 'Nivel 5', nivel: 5 },
    { title: 'Estructura de un bloque', url: '/nivel-5/estructura-bloque.html', tags: ['nivel 5', 'bloques', 'header'], section: 'Nivel 5', nivel: 5 },
    { title: 'Arbol de Merkle', url: '/nivel-5/merkle-tree.html', tags: ['nivel 5', 'merkle', 'root'], section: 'Nivel 5', nivel: 5 },
    { title: 'Proof of Work en detalle', url: '/nivel-5/proof-of-work.html', tags: ['nivel 5', 'pow', 'minería'], section: 'Nivel 5', nivel: 5 },
    { title: 'Protocolo P2P', url: '/nivel-5/protocolo-p2p.html', tags: ['nivel 5', 'p2p', 'red'], section: 'Nivel 5', nivel: 5 },

    { title: 'Base de Conocimiento', url: '/base/', tags: ['base', 'referencia'], section: 'Pilares' },
    { title: 'Quién es Satoshi Nakamoto', url: '/base/quien-es-satoshi.html', tags: ['satoshi', 'creador de bitcoin', 'identidad'], section: 'Base' },
    { title: 'El whitepaper de Bitcoin', url: '/base/el-whitepaper.html', tags: ['whitepaper', 'peer to peer electronic cash system', 'paper original'], section: 'Base' },
    { title: 'La Madriguera', url: '/la-madriguera/', tags: ['análisis', 'profundidad', 'historia bitcoin'], section: 'Pilares' },
    { title: 'La guerra del tamaño de bloque', url: '/la-madriguera/la-guerra-del-tamano-de-bloque.html', tags: ['madriguera', 'blocksize war', 'segwit', 'uasf'], section: 'La Madriguera' },
    { title: 'El colapso de FTX', url: '/la-madriguera/el-colapso-de-ftx.html', tags: ['madriguera', 'ftx', 'custodia', 'riesgo contraparte'], section: 'La Madriguera' },
    { title: 'Bitcoin y energia', url: '/la-madriguera/bitcoin-y-energia.html', tags: ['madriguera', 'energia', 'minería', 'pow'], section: 'La Madriguera' },
    { title: 'El caso Samourai Wallet', url: '/la-madriguera/el-caso-samourai-wallet.html', tags: ['madriguera', 'privacidad', 'samourai', 'coinjoin'], section: 'La Madriguera' },
    { title: 'Lightning: estado actual', url: '/la-madriguera/lightning-network-estado-actual.html', tags: ['madriguera', 'lightning', 'liquidez'], section: 'La Madriguera' },
    { title: 'Soft forks de Bitcoin', url: '/la-madriguera/soft-forks-de-bitcoin.html', tags: ['madriguera', 'soft fork', 'consenso'], section: 'La Madriguera' },
    { title: 'Puede un gobierno prohibir Bitcoin', url: '/la-madriguera/puede-un-gobierno-prohibir-bitcoin.html', tags: ['madriguera', 'regulacion', 'censura'], section: 'La Madriguera' },
    { title: 'Halving y ciclos de precio', url: '/la-madriguera/halving-y-ciclos-de-precio.html', tags: ['madriguera', 'halving', 'ciclos'], section: 'La Madriguera' },
    { title: 'Empieza aqu?', url: '/empezar.html', tags: ['empezar', 'por donde empiezo', 'test de nivel', 'frase semilla', 'seed phrase', 'wallet', 'utxo', 'nodo', 'lightning'], section: 'Proyecto' },
    { title: 'Sobre aprendeBTC', url: '/sobre.html', tags: ['proyecto', 'sobre nosotros'], section: 'Proyecto' },
    { title: 'Actualizaciones y changelog', url: '/actualizaciones.html', tags: ['proyecto', 'changelog', 'actualizaciones'], section: 'Proyecto' },
    { title: 'Glosario', url: '/glosario.html', tags: ['terminos', 'definiciones'], section: 'Pilares' },
    { title: 'Recursos', url: '/recursos.html', tags: ['libros', 'podcasts', 'documentales', 'webs', 'herramientas'], section: 'Pilares' },
    { title: 'Libros recomendados sobre Bitcoin', url: '/recursos/libros.html', tags: ['recursos', 'libros', 'amazon', 'lecturas bitcoin'], section: 'Recursos' },
    { title: 'Podcasts de Bitcoin', url: '/recursos/podcasts.html', tags: ['recursos', 'podcasts', 'audio', 'entrevistas'], section: 'Recursos' },
    { title: 'Documentales sobre Bitcoin', url: '/recursos/documentales.html', tags: ['recursos', 'documentales', 'historia bitcoin', 'videos'], section: 'Recursos' },
    { title: 'Webs de referencia sobre Bitcoin', url: '/recursos/webs-referencia.html', tags: ['recursos', 'referencia', 'documentacion', 'webs'], section: 'Recursos' },
    { title: 'Herramientas recomendadas', url: '/recursos/herramientas.html', tags: ['recursos', 'herramientas', 'mempool', 'lightning'], section: 'Recursos' },
    { title: 'Hardware wallets recomendadas', url: '/recursos/hardware-wallets.html', tags: ['recursos', 'hardware wallet', 'autocustodia', 'seguridad'], section: 'Recursos' },
    { title: 'Otros recursos de Bitcoin', url: '/recursos/otros-recursos.html', tags: ['recursos', 'whitepaper', 'comunidad', 'bitcoin core'], section: 'Recursos' },
    { title: 'Herramientas', url: '/herramientas/', tags: ['tools', 'hash'], section: 'Pilares' },
    { title: 'Conversor BTC / EUR / sats', url: '/herramientas/conversor.html', tags: ['herramientas', 'conversor', 'sats', 'eur', 'usd'], section: 'Herramientas' },
    { title: 'Calculadora de fees', url: '/herramientas/calculadora-fees.html', tags: ['herramientas', 'fees', 'mempool', 'sat/vb'], section: 'Herramientas' },
    { title: 'Calculadora DCA', url: '/herramientas/calculadora-dca.html', tags: ['herramientas', 'dca', 'compras periodicas'], section: 'Herramientas' },
    { title: 'Calculadora de impuestos (ES)', url: '/herramientas/calculadora-impuestos.html', tags: ['herramientas', 'impuestos', 'irpf', 'espana'], section: 'Herramientas' },
    { title: 'Comparador de exchanges', url: '/herramientas/comparador-exchanges.html', tags: ['herramientas', 'exchanges', 'comparativa', 'kyc'], section: 'Herramientas' },
    { title: 'Calculadora de herencia', url: '/herramientas/calculadora-herencia.html', tags: ['herramientas', 'herencia', 'multisig', 'planificacion'], section: 'Herramientas' },
    { title: 'Calculadora de hash', url: '/herramientas/hash.html', tags: ['herramientas', 'hash', 'sha256', 'hash160', 'ripemd160'], section: 'Herramientas' },
    { title: 'Simulador de minería', url: '/herramientas/mining-simulator.html', tags: ['herramientas', 'minería', 'pow', 'nonce'], section: 'Herramientas' },
    { title: 'Conversor de dificultad y target', url: '/herramientas/difficulty-converter.html', tags: ['herramientas', 'dificultad', 'target', 'bits'], section: 'Herramientas' },
    { title: 'Generador de Merkle Tree', url: '/herramientas/merkle-tree.html', tags: ['herramientas', 'merkle', 'txid', 'arbol'], section: 'Herramientas' },
    { title: 'Herramientas de bloques', url: '/herramientas/block-tools.html', tags: ['herramientas', 'block header', 'bloques', 'hash'], section: 'Herramientas' },
    { title: 'Generador de clave privada', url: '/herramientas/private-key.html', tags: ['herramientas', 'clave privada', 'wif', 'hex'], section: 'Herramientas' },
    { title: 'Derivar clave pública', url: '/herramientas/public-key.html', tags: ['herramientas', 'clave pública', 'secp256k1', 'comprimida'], section: 'Herramientas' },
    { title: 'Codificador/decodificador WIF', url: '/herramientas/wif.html', tags: ['herramientas', 'wif', 'wallet import format', 'base58check'], section: 'Herramientas' },
    { title: 'Dirección Bitcoin (Base58)', url: '/herramientas/address-base58.html', tags: ['herramientas', 'direccion', 'p2pkh', 'p2sh', 'base58'], section: 'Herramientas' },
    { title: 'Dirección Bitcoin (Bech32)', url: '/herramientas/address-bech32.html', tags: ['herramientas', 'direccion', 'bech32', 'bech32m', 'segwit', 'taproot'], section: 'Herramientas' },
    { title: 'Base58Check y checksum', url: '/herramientas/checksum-base58.html', tags: ['herramientas', 'base58', 'base58check', 'checksum'], section: 'Herramientas' },
    { title: 'Generador de dirección multisig', url: '/herramientas/multisig-address.html', tags: ['herramientas', 'multisig', 'p2sh', 'p2wsh', 'n-de-m'], section: 'Herramientas' },
    { title: 'Mnemonic y seed (BIP39)', url: '/herramientas/mnemonic-seed.html', tags: ['herramientas', 'mnemonic', 'seed', 'bip39'], section: 'Herramientas' },
    { title: 'Extended keys (xpub/xprv)', url: '/herramientas/extended-keys.html', tags: ['herramientas', 'xpub', 'xprv', 'bip32'], section: 'Herramientas' },
    { title: 'Derivation paths (BIP32)', url: '/herramientas/derivation-paths.html', tags: ['herramientas', 'derivation path', 'bip32'], section: 'Herramientas' },
    { title: 'Direcciones desde xpub', url: '/herramientas/address-from-xpub.html', tags: ['herramientas', 'xpub', 'direcciones', 'wallet'], section: 'Herramientas' },
    { title: 'HD Wallet explorer', url: '/herramientas/hd-wallet.html', tags: ['herramientas', 'hd wallet', 'derivation'], section: 'Herramientas' },
    { title: 'Decodificador de transacciones', url: '/herramientas/tx-decoder.html', tags: ['herramientas', 'transacciones', 'raw', 'tx'], section: 'Herramientas' },
    { title: 'TX splitter (byte a byte)', url: '/herramientas/tx-splitter.html', tags: ['herramientas', 'tx', 'byte', 'varint'], section: 'Herramientas' },
    { title: 'Constructor de transacciones (raw)', url: '/herramientas/tx-builder.html', tags: ['herramientas', 'transacciones', 'raw', 'builder'], section: 'Herramientas' },
    { title: 'Interprete de Bitcoin Script', url: '/herramientas/script-interpreter.html', tags: ['herramientas', 'script', 'stack', 'opcodes'], section: 'Herramientas' },
    { title: 'Decodificador PSBT (BIP174)', url: '/herramientas/psbt-decoder.html', tags: ['herramientas', 'psbt', 'bip174', 'wallet'], section: 'Herramientas' },
    { title: 'Firma digital: ECDSA y Schnorr', url: '/herramientas/ecdsa-schnorr.html', tags: ['herramientas', 'firma', 'ecdsa', 'schnorr'], section: 'Herramientas' },
    { title: 'Calculadora de curva eliptica', url: '/herramientas/ec-calculator.html', tags: ['herramientas', 'secp256k1', 'curva', 'modular'], section: 'Herramientas' },
    { title: 'Compact Size (VarInt)', url: '/herramientas/compact-size.html', tags: ['herramientas', 'varint', 'compact size', 'transacciones'], section: 'Herramientas' },
    { title: 'ASCII y hexadecimal', url: '/herramientas/ascii-hex.html', tags: ['herramientas', 'ascii', 'hex', 'bytes'], section: 'Herramientas' },
    { title: 'Tiempo Unix', url: '/herramientas/unix-time.html', tags: ['herramientas', 'timestamp', 'unix', 'bloques'], section: 'Herramientas' },
    { title: 'Decodificador de timelocks', url: '/herramientas/timelock-decoder.html', tags: ['herramientas', 'timelock', 'locktime', 'sequence'], section: 'Herramientas' },
    { title: 'Decodificador de factura Lightning', url: '/herramientas/lightning-invoice.html', tags: ['herramientas', 'lightning', 'bolt11', 'invoice'], section: 'Herramientas' },
    { title: 'Analizador de entrop\u00eda', url: '/herramientas/entropy-analyzer.html', tags: ['herramientas', 'entropia', 'entrop\u00eda', 'aleatoriedad', 'seguridad'], section: 'Herramientas' },
    { title: 'Validador de seed phrase', url: '/herramientas/seed-validator.html', tags: ['herramientas', 'seed', 'bip39', 'mnemonic'], section: 'Herramientas' },



    { title: 'Comunidad', url: '/comunidad/', tags: ['meetups', 'eventos'], section: 'Pilares' }
  ];

  const nivelLabels = { 1: 'N1', 2: 'N2', 3: 'N3', 4: 'N4', 5: 'N5', 6: 'N6' };
  const synonymMap = {
    'frase semilla': ['seed phrase', 'seed', 'semilla', 'mnemonic', 'bip39', 'palabras de recuperación'],
    'seed phrase': ['frase semilla', 'seed', 'mnemonic', 'bip39'],
    semilla: ['seed', 'mnemonic', 'bip39'],
    mnemonic: ['frase semilla', 'seed', 'semilla', 'bip39'],
    wallet: ['billetera', 'cartera'],
    billetera: ['wallet', 'cartera'],
    cartera: ['wallet', 'billetera']
  };
  const stopWords = new Set([
    'a', 'al', 'con', 'de', 'del', 'el', 'en', 'es', 'la', 'las', 'lo', 'los', 'o', 'para', 'por', 'que', 'un', 'una', 'y'
  ]);

  let baseIndex = [];
  let siteIndex = [];
  let mergedIndex = [];
  let indexLoaded = false;

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function tokenize(text) {
    return normalize(text)
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 1 && !stopWords.has(token));
  }

  function expandTerms(query) {
    const q = normalize(query);
    if (!q) return [];

    const terms = new Set([q]);
    const tokens = tokenize(q);

    tokens.forEach((token) => terms.add(token));

    if (synonymMap[q]) {
      synonymMap[q].forEach((term) => terms.add(normalize(term)));
    }

    tokens.forEach((token) => {
      if (synonymMap[token]) {
        synonymMap[token].forEach((term) => terms.add(normalize(term)));
      }
    });

    if (tokens.length > 1) {
      for (let i = 0; i < tokens.length - 1; i += 1) {
        const bigram = `${tokens[i]} ${tokens[i + 1]}`;
        terms.add(bigram);
        if (synonymMap[bigram]) {
          synonymMap[bigram].forEach((term) => terms.add(normalize(term)));
        }
      }
    }

    return Array.from(terms).filter(Boolean);
  }

  function detectNivelFromUrl(url) {
    const match = String(url || '').match(/\/nivel-(\d)\//);
    return match ? Number(match[1]) : undefined;
  }

  function prepareItem(raw) {
    const title = String(raw?.title || 'Sin titulo').trim();
    const url = String(raw?.url || '#').trim();
    const tags = Array.isArray(raw?.tags) ? raw.tags.map((tag) => String(tag).trim()).filter(Boolean) : [];
    const section = String(raw?.section || 'Contenido').trim();
    const nivel = Number(raw?.nivel) || detectNivelFromUrl(url);
    const keywords = String(raw?.keywords || '').trim();

    const titleNorm = normalize(title);
    const tagsNorm = normalize(tags.join(' '));
    const keywordsNorm = normalize(keywords);
    const sectionNorm = normalize(section);
    const corpus = `${titleNorm} ${tagsNorm} ${keywordsNorm} ${sectionNorm}`.replace(/\s+/g, ' ').trim();

    return {
      title,
      url,
      tags,
      section,
      ...(nivel ? { nivel } : {}),
      ...(keywords ? { keywords } : {}),
      _titleNorm: titleNorm,
      _tagsNorm: tagsNorm,
      _keywordsNorm: keywordsNorm,
      _corpus: corpus
    };
  }

  function mergeIndexes(sources) {
    const byUrl = new Map();

    sources.flat().forEach((rawItem) => {
      if (!rawItem || !rawItem.url || !rawItem.title) return;

      const item = prepareItem(rawItem);
      const key = item.url;

      if (!byUrl.has(key)) {
        byUrl.set(key, item);
        return;
      }

      const existing = byUrl.get(key);
      const mergedTags = Array.from(new Set([...(existing.tags || []), ...(item.tags || [])]));
      const mergedKeywords = `${existing.keywords || ''} ${item.keywords || ''}`.replace(/\s+/g, ' ').trim();

      byUrl.set(
        key,
        prepareItem({
          ...existing,
          title: existing.title || item.title,
          url: existing.url,
          tags: mergedTags,
          section: existing.section && existing.section !== 'Contenido' ? existing.section : item.section,
          nivel: existing.nivel || item.nivel,
          keywords: mergedKeywords
        })
      );
    });

    return Array.from(byUrl.values());
  }

  function scoreItem(item, query) {
    const q = normalize(query);
    if (q.length < 2) return 0;

    const terms = expandTerms(q);
    let score = 0;

    if (item._titleNorm.startsWith(q)) score += 20;
    if (item._titleNorm.includes(q)) score += 12;
    if (item._tagsNorm.includes(q)) score += 8;
    if (item._keywordsNorm.includes(q)) score += 6;

    const queryTokens = tokenize(q);
    const tokenHits = queryTokens.filter((token) => item._corpus.includes(token)).length;
    if (queryTokens.length > 0) {
      if (tokenHits === queryTokens.length) score += 10;
      else score += tokenHits * 2;
    }

    terms.forEach((term) => {
      if (!term || term === q) return;
      if (item._titleNorm.includes(term)) score += 5;
      else if (item._tagsNorm.includes(term)) score += 3;
      else if (item._keywordsNorm.includes(term)) score += 2;
    });

    return score;
  }

  function search(query) {
    const q = normalize(query);
    if (q.length < 2) return [];

    const source = mergedIndex.length ? mergedIndex : mergeIndexes([staticIndex]);

    return source
      .map((item) => ({ item, score: scoreItem(item, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.item.title.localeCompare(b.item.title, 'es');
      })
      .slice(0, 12)
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
      container.innerHTML = '<p class="search-hint">Escribe para buscar artículos, conceptos y niveles...</p>';
      return;
    }

    if (results.length === 0) {
      container.innerHTML = `<p class="search-hint">Sin resultados para "<strong>${escapeHtml(cleanQuery)}</strong>"</p>`;
      return;
    }

    container.innerHTML = results
      .map((item) => {
        const badgeLabel = item.nivel ? nivelLabels[item.nivel] : 'DOC';
        const badgeClass = item.nivel
          ? `search-result-item__badge search-result-item__badge--nivel-${item.nivel}`
          : 'search-result-item__badge';
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
      })
      .join('');
  }

  async function fetchIndexFile(filename) {
    const basePath = document.documentElement.dataset.basePath || '';
    const url = `${basePath}js/${filename}`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  }

  async function loadIndexes() {
    const [siteData, baseData] = await Promise.all([
      fetchIndexFile('search-index.site.json'),
      fetchIndexFile('search-index.base.json')
    ]);

    siteIndex = siteData;
    baseIndex = baseData;
    mergedIndex = mergeIndexes([siteIndex, baseIndex, staticIndex]);
  }

  function bindInput() {
    const input = document.getElementById('search-input');
    if (!input) return;
    if (input.dataset.searchBound === '1') return;

    input.dataset.searchBound = '1';
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
    if (!indexLoaded) {
      await loadIndexes();
      indexLoaded = true;
    }

    bindInput();
  }

  document.addEventListener('includes:loaded', init);
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 150));
})();


