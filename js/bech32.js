/**
 * BECH32.JS â€” Bech32 y Bech32m encoding/decoding
 * Proyecto: aprendebtc.com
 * 
 * Bech32 (BIP 173): usado para direcciones SegWit v0 (P2WPKH, P2WSH)
 * Bech32m (BIP 350): usado para direcciones SegWit v1+ (Taproot)
 * 
 * Formato: hrp + "1" + data (en base32) + checksum (6 chars)
 * HRP para Bitcoin mainnet: "bc"
 * HRP para Bitcoin testnet: "tb"
 */

(function(global) {
  'use strict';

  // Alfabeto Bech32 (32 caracteres, sin 1, b, i, o)
  const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  const CHARSET_MAP = {};
  
  for (let i = 0; i < CHARSET.length; i++) {
    CHARSET_MAP[CHARSET[i]] = i;
  }

  // Constantes para checksum
  const BECH32_CONST = 1;        // Bech32 (BIP 173)
  const BECH32M_CONST = 0x2bc830a3; // Bech32m (BIP 350)

  // Generador polinomial para checksum
  const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

  // === FUNCIONES INTERNAS ===

  /**
   * Expande el HRP para el cÃ¡lculo del checksum
   */
  function hrpExpand(hrp) {
    const result = [];
    for (let i = 0; i < hrp.length; i++) {
      result.push(hrp.charCodeAt(i) >> 5);
    }
    result.push(0);
    for (let i = 0; i < hrp.length; i++) {
      result.push(hrp.charCodeAt(i) & 31);
    }
    return result;
  }

  /**
   * Calcula el polymod para el checksum
   */
  function polymod(values) {
    let chk = 1;
    for (const v of values) {
      const top = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ v;
      for (let i = 0; i < 5; i++) {
        if ((top >> i) & 1) {
          chk ^= GENERATOR[i];
        }
      }
    }
    return chk;
  }

  /**
   * Verifica el checksum
   */
  function verifyChecksum(hrp, data, spec) {
    const constant = spec === 'bech32m' ? BECH32M_CONST : BECH32_CONST;
    return polymod(hrpExpand(hrp).concat(data)) === constant;
  }

  /**
   * Crea el checksum
   */
  function createChecksum(hrp, data, spec) {
    const constant = spec === 'bech32m' ? BECH32M_CONST : BECH32_CONST;
    const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
    const mod = polymod(values) ^ constant;
    const result = [];
    for (let i = 0; i < 6; i++) {
      result.push((mod >> (5 * (5 - i))) & 31);
    }
    return result;
  }

  /**
   * Convierte bits entre bases (ej: 8 bits a 5 bits)
   */
  function convertBits(data, fromBits, toBits, pad = true) {
    let acc = 0;
    let bits = 0;
    const result = [];
    const maxv = (1 << toBits) - 1;
    
    for (const value of data) {
      if (value < 0 || value >> fromBits !== 0) {
        throw new Error('Valor fuera de rango');
      }
      acc = (acc << fromBits) | value;
      bits += fromBits;
      while (bits >= toBits) {
        bits -= toBits;
        result.push((acc >> bits) & maxv);
      }
    }
    
    if (pad) {
      if (bits > 0) {
        result.push((acc << (toBits - bits)) & maxv);
      }
    } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
      throw new Error('Bits sobrantes invÃ¡lidos');
    }
    
    return result;
  }

  // === BECH32 ENCODE/DECODE ===

  /**
   * Codifica en Bech32 o Bech32m
   * @param {string} hrp - Human Readable Part (ej: "bc" para mainnet)
   * @param {number} witnessVersion - VersiÃ³n del witness (0 para SegWit, 1 para Taproot)
   * @param {Uint8Array} program - Witness program (20 o 32 bytes)
   * @param {string} spec - 'bech32' o 'bech32m'
   * @returns {string}
   */
  function encode(hrp, witnessVersion, program, spec = 'bech32') {
    // Validar versiÃ³n
    if (witnessVersion < 0 || witnessVersion > 16) {
      throw new Error('Witness version debe ser 0-16');
    }

    // Validar longitud del programa
    if (program.length < 2 || program.length > 40) {
      throw new Error('Witness program debe tener 2-40 bytes');
    }

    // Validar especificaciÃ³n segÃºn versiÃ³n
    if (witnessVersion === 0 && spec !== 'bech32') {
      console.warn('Witness version 0 deberÃ­a usar bech32, no bech32m');
    }
    if (witnessVersion > 0 && spec !== 'bech32m') {
      console.warn('Witness version > 0 deberÃ­a usar bech32m');
    }

    // Convertir programa de 8 bits a 5 bits
    const programBits = convertBits(Array.from(program), 8, 5);
    
    // Data = version + programa en 5 bits
    const data = [witnessVersion].concat(programBits);
    
    // Crear checksum
    const checksum = createChecksum(hrp, data, spec);
    
    // Construir resultado
    let result = hrp + '1';
    for (const d of data.concat(checksum)) {
      result += CHARSET[d];
    }
    
    return result;
  }

  /**
   * Decodifica string Bech32 o Bech32m
   * @param {string} str
   * @returns {{hrp: string, version: number, program: Uint8Array, spec: string}}
   */
  function decode(str) {
    // Convertir a minÃºsculas (Bech32 es case-insensitive, pero no mezcla)
    const lower = str.toLowerCase();
    const upper = str.toUpperCase();
    
    if (str !== lower && str !== upper) {
      throw new Error('Mezcla de mayÃºsculas y minÃºsculas no permitida');
    }
    
    str = lower;

    // Encontrar el separador '1'
    const sepPos = str.lastIndexOf('1');
    if (sepPos < 1 || sepPos + 7 > str.length) {
      throw new Error('Formato Bech32 invÃ¡lido');
    }

    const hrp = str.slice(0, sepPos);
    const dataStr = str.slice(sepPos + 1);

    // Validar y convertir data
    const data = [];
    for (const char of dataStr) {
      if (!(char in CHARSET_MAP)) {
        throw new Error(`CarÃ¡cter invÃ¡lido: '${char}'`);
      }
      data.push(CHARSET_MAP[char]);
    }

    // Determinar especificaciÃ³n verificando con ambas constantes
    let spec = null;
    if (verifyChecksum(hrp, data, 'bech32')) {
      spec = 'bech32';
    } else if (verifyChecksum(hrp, data, 'bech32m')) {
      spec = 'bech32m';
    } else {
      throw new Error('Checksum invÃ¡lido');
    }

    // Separar version y programa (quitar checksum de 6 chars)
    const version = data[0];
    const programBits = data.slice(1, -6);

    // Validar versiÃ³n
    if (version > 16) {
      throw new Error('Witness version invÃ¡lida');
    }

    // Convertir de 5 bits a 8 bits
    const program = convertBits(programBits, 5, 8, false);

    // Validar longitud segÃºn versiÃ³n
    if (version === 0 && program.length !== 20 && program.length !== 32) {
      throw new Error('Witness version 0 requiere programa de 20 o 32 bytes');
    }

    return {
      hrp,
      version,
      program: new Uint8Array(program),
      spec
    };
  }

  // === FUNCIONES ESPECÃFICAS PARA BITCOIN ===

  /**
   * Codifica direcciÃ³n P2WPKH (Native SegWit)
   * @param {Uint8Array} pubkeyHash - HASH160 de la public key (20 bytes)
   * @param {string} network - 'mainnet' o 'testnet'
   * @returns {string}
   */
  function encodeP2WPKH(pubkeyHash, network = 'mainnet') {
    if (pubkeyHash.length !== 20) {
      throw new Error('P2WPKH requiere hash de 20 bytes');
    }
    const hrp = network === 'mainnet' ? 'bc' : 'tb';
    return encode(hrp, 0, pubkeyHash, 'bech32');
  }

  /**
   * Codifica direcciÃ³n P2WSH (Native SegWit Script Hash)
   * @param {Uint8Array} scriptHash - SHA-256 del witness script (32 bytes)
   * @param {string} network - 'mainnet' o 'testnet'
   * @returns {string}
   */
  function encodeP2WSH(scriptHash, network = 'mainnet') {
    if (scriptHash.length !== 32) {
      throw new Error('P2WSH requiere hash de 32 bytes');
    }
    const hrp = network === 'mainnet' ? 'bc' : 'tb';
    return encode(hrp, 0, scriptHash, 'bech32');
  }

  /**
   * Codifica direcciÃ³n P2TR (Taproot)
   * @param {Uint8Array} xOnlyPubkey - Coordenada X de la public key (32 bytes)
   * @param {string} network - 'mainnet' o 'testnet'
   * @returns {string}
   */
  function encodeP2TR(xOnlyPubkey, network = 'mainnet') {
    if (xOnlyPubkey.length !== 32) {
      throw new Error('P2TR requiere x-only pubkey de 32 bytes');
    }
    const hrp = network === 'mainnet' ? 'bc' : 'tb';
    return encode(hrp, 1, xOnlyPubkey, 'bech32m');
  }

  // === EXPORTAR ===

  global.Bech32 = {
    CHARSET,
    encode,
    decode,
    encodeP2WPKH,
    encodeP2WSH,
    encodeP2TR,
    convertBits
  };

})(typeof window !== 'undefined' ? window : global);
