/**
 * HEX-UTILS.JS — Utilidades compartidas para herramientas criptográficas
 * Proyecto: aprendebtc.com
 * 
 * Funciones para conversión hex/bytes, hashing y operaciones comunes
 */

(function(global) {
  'use strict';

  // === CONVERSIÓN HEX ↔ BYTES ===

  /**
   * Convierte string hexadecimal a Uint8Array
   * @param {string} hex - String hexadecimal (longitud par)
   * @returns {Uint8Array}
   */
  function hexToBytes(hex) {
    if (typeof hex !== 'string') {
      throw new Error('Input debe ser string');
    }
    
    hex = hex.replace(/\s/g, '').toLowerCase();
    
    if (!/^[0-9a-f]*$/.test(hex)) {
      throw new Error('Caracteres hexadecimales inválidos');
    }
    
    if (hex.length % 2 !== 0) {
      hex = '0' + hex;
    }
    
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  /**
   * Convierte Uint8Array a string hexadecimal
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  function bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Invierte el orden de los bytes en un string hex
   * Usado para TXIDs, block hashes (little-endian ↔ big-endian)
   * @param {string} hex
   * @returns {string}
   */
  function reverseBytes(hex) {
    if (hex.length % 2 !== 0) {
      hex = '0' + hex;
    }
    const pairs = hex.match(/.{2}/g);
    return pairs ? pairs.reverse().join('') : '';
  }

  /**
   * Concatena múltiples Uint8Array en uno solo
   * @param  {...Uint8Array} arrays
   * @returns {Uint8Array}
   */
  function concatBytes(...arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }

  // === FUNCIONES DE HASHING ===

  /**
   * SHA-256 usando Web Crypto API
   * @param {Uint8Array} data
   * @returns {Promise<Uint8Array>}
   */
  async function sha256(data) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  }

  /**
   * HASH256 = SHA-256(SHA-256(data))
   * Usado en TXIDs, block hashes, checksums
   * @param {Uint8Array} data
   * @returns {Promise<Uint8Array>}
   */
  async function hash256(data) {
    const first = await sha256(data);
    return await sha256(first);
  }

  /**
   * HASH160 = RIPEMD-160(SHA-256(data))
   * Usado en direcciones P2PKH, P2SH
   * Requiere que RIPEMD160 esté cargado globalmente
   * @param {Uint8Array} data
   * @returns {Promise<Uint8Array>}
   */
  async function hash160(data) {
    const sha = await sha256(data);
    if (typeof RIPEMD160 === 'undefined') {
      throw new Error('RIPEMD160 no está cargado. Incluye js/ripemd160.js');
    }
    return RIPEMD160.hash(sha);
  }

  // === UTILIDADES ADICIONALES ===

  /**
   * Convierte un número a bytes little-endian
   * @param {number|bigint} num
   * @param {number} byteLength
   * @returns {Uint8Array}
   */
  function numberToLittleEndian(num, byteLength) {
    const bytes = new Uint8Array(byteLength);
    let n = BigInt(num);
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Number(n & 0xffn);
      n >>= 8n;
    }
    return bytes;
  }

  /**
   * Convierte bytes little-endian a número
   * @param {Uint8Array} bytes
   * @returns {bigint}
   */
  function littleEndianToNumber(bytes) {
    let result = 0n;
    for (let i = bytes.length - 1; i >= 0; i--) {
      result = (result << 8n) | BigInt(bytes[i]);
    }
    return result;
  }

  /**
   * Convierte texto UTF-8 a Uint8Array
   * @param {string} text
   * @returns {Uint8Array}
   */
  function textToBytes(text) {
    return new TextEncoder().encode(text);
  }

  /**
   * Convierte Uint8Array a texto UTF-8
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  function bytesToText(bytes) {
    return new TextDecoder().decode(bytes);
  }

  /**
   * Genera bytes aleatorios criptográficamente seguros
   * @param {number} length
   * @returns {Uint8Array}
   */
  function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  /**
   * Compara dos Uint8Array
   * @param {Uint8Array} a
   * @param {Uint8Array} b
   * @returns {boolean}
   */
  function bytesEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * Formatea bytes como string con separadores para visualización
   * @param {string} hex - String hexadecimal
   * @param {number} groupSize - Caracteres por grupo (default 2)
   * @param {string} separator - Separador (default espacio)
   * @returns {string}
   */
  function formatHex(hex, groupSize = 2, separator = ' ') {
    const regex = new RegExp(`.{1,${groupSize}}`, 'g');
    const groups = hex.match(regex);
    return groups ? groups.join(separator) : hex;
  }

  // === EXPORTAR ===

  global.HexUtils = {
    // Conversión
    hexToBytes,
    bytesToHex,
    reverseBytes,
    concatBytes,
    textToBytes,
    bytesToText,
    
    // Hashing
    sha256,
    hash256,
    hash160,
    
    // Números
    numberToLittleEndian,
    littleEndianToNumber,
    
    // Utilidades
    randomBytes,
    bytesEqual,
    formatHex
  };

})(typeof window !== 'undefined' ? window : global);