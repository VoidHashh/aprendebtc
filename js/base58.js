/**
 * BASE58.JS — Base58 y Base58Check encoding/decoding
 * Proyecto: aprendebtc.com
 * 
 * Base58 es el encoding usado por Bitcoin para direcciones y WIF.
 * Elimina caracteres ambiguos: 0, O, I, l
 * 
 * Base58Check añade un checksum de 4 bytes para detectar errores.
 */

(function(global) {
  'use strict';

  // Alfabeto Base58 de Bitcoin
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const ALPHABET_MAP = {};
  
  // Crear mapa inverso para decodificación
  for (let i = 0; i < ALPHABET.length; i++) {
    ALPHABET_MAP[ALPHABET[i]] = BigInt(i);
  }

  const BASE = BigInt(58);

  // === BASE58 ENCODE/DECODE ===

  /**
   * Codifica bytes a string Base58
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  function base58Encode(bytes) {
    if (bytes.length === 0) return '';

    // Contar ceros iniciales
    let leadingZeros = 0;
    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
      leadingZeros++;
    }

    // Convertir bytes a BigInt
    let num = 0n;
    for (const byte of bytes) {
      num = num * 256n + BigInt(byte);
    }

    // Convertir a Base58
    let encoded = '';
    while (num > 0n) {
      const remainder = num % BASE;
      num = num / BASE;
      encoded = ALPHABET[Number(remainder)] + encoded;
    }

    // Añadir '1' por cada cero inicial (1 = 0 en Base58)
    return '1'.repeat(leadingZeros) + encoded;
  }

  /**
   * Decodifica string Base58 a bytes
   * @param {string} str
   * @returns {Uint8Array}
   */
  function base58Decode(str) {
    if (str.length === 0) return new Uint8Array(0);

    // Validar caracteres
    for (const char of str) {
      if (!(char in ALPHABET_MAP)) {
        throw new Error(`Carácter inválido en Base58: '${char}'`);
      }
    }

    // Contar '1' iniciales (representan bytes cero)
    let leadingOnes = 0;
    for (let i = 0; i < str.length && str[i] === '1'; i++) {
      leadingOnes++;
    }

    // Convertir Base58 a BigInt
    let num = 0n;
    for (const char of str) {
      num = num * BASE + ALPHABET_MAP[char];
    }

    // Convertir BigInt a bytes
    const bytes = [];
    while (num > 0n) {
      bytes.unshift(Number(num % 256n));
      num = num / 256n;
    }

    // Añadir ceros iniciales
    const result = new Uint8Array(leadingOnes + bytes.length);
    result.set(bytes, leadingOnes);
    
    return result;
  }

  // === BASE58CHECK ENCODE/DECODE ===

  /**
   * Calcula checksum (primeros 4 bytes de doble SHA-256)
   * @param {Uint8Array} payload
   * @returns {Promise<Uint8Array>}
   */
  async function calculateChecksum(payload) {
    const hash1 = await crypto.subtle.digest('SHA-256', payload);
    const hash2 = await crypto.subtle.digest('SHA-256', hash1);
    return new Uint8Array(hash2).slice(0, 4);
  }

  /**
   * Codifica datos con version byte y checksum (Base58Check)
   * @param {number|Uint8Array} version - Version byte(s)
   * @param {Uint8Array} data - Datos a codificar
   * @returns {Promise<string>}
   */
  async function base58CheckEncode(version, data) {
    // Convertir version a bytes si es número
    let versionBytes;
    if (typeof version === 'number') {
      versionBytes = new Uint8Array([version]);
    } else if (version instanceof Uint8Array) {
      versionBytes = version;
    } else {
      throw new Error('Version debe ser número o Uint8Array');
    }

    // Construir payload: version + data
    const payload = new Uint8Array(versionBytes.length + data.length);
    payload.set(versionBytes);
    payload.set(data, versionBytes.length);

    // Calcular checksum
    const checksum = await calculateChecksum(payload);

    // Concatenar payload + checksum
    const result = new Uint8Array(payload.length + 4);
    result.set(payload);
    result.set(checksum, payload.length);

    // Codificar en Base58
    return base58Encode(result);
  }

  /**
   * Decodifica string Base58Check
   * @param {string} str
   * @returns {Promise<{version: Uint8Array, data: Uint8Array, checksum: Uint8Array, valid: boolean}>}
   */
  async function base58CheckDecode(str) {
    const bytes = base58Decode(str);
    
    if (bytes.length < 5) {
      throw new Error('Base58Check string demasiado corto');
    }

    // Separar payload y checksum
    const payload = bytes.slice(0, -4);
    const checksum = bytes.slice(-4);

    // Verificar checksum
    const calculatedChecksum = await calculateChecksum(payload);
    let valid = true;
    for (let i = 0; i < 4; i++) {
      if (checksum[i] !== calculatedChecksum[i]) {
        valid = false;
        break;
      }
    }

    // El primer byte es la versión (puede ser más para xpub/xprv)
    // Para simplificar, asumimos 1 byte de versión para la mayoría de casos
    const version = payload.slice(0, 1);
    const data = payload.slice(1);

    return {
      version,
      data,
      checksum,
      calculatedChecksum,
      valid
    };
  }

  /**
   * Verifica si un string Base58Check es válido
   * @param {string} str
   * @returns {Promise<boolean>}
   */
  async function isValidBase58Check(str) {
    try {
      const result = await base58CheckDecode(str);
      return result.valid;
    } catch {
      return false;
    }
  }

  // === EXPORTAR ===

  global.Base58 = {
    ALPHABET,
    encode: base58Encode,
    decode: base58Decode,
    checkEncode: base58CheckEncode,
    checkDecode: base58CheckDecode,
    isValidCheck: isValidBase58Check,
    calculateChecksum
  };

})(typeof window !== 'undefined' ? window : global);