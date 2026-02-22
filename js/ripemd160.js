/**
 * RIPEMD-160 - Implementación en JavaScript puro
 * Para uso educativo en aprendebtc.com
 * 
 * RIPEMD-160 produce un hash de 160 bits (20 bytes / 40 hex chars)
 * Se usa en Bitcoin combinado con SHA-256 para crear HASH160
 */

(function(global) {
  'use strict';

  // Constantes RIPEMD-160
  const K1 = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e];
  const K2 = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000];

  // Orden de las palabras en cada ronda
  const R1 = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
    3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
    1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
    4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
  ];

  const R2 = [
    5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
    6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
    15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
    8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
    12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
  ];

  // Cantidad de rotación en cada ronda
  const S1 = [
    11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
    7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
    11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
    11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
    9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
  ];

  const S2 = [
    8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
    9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
    9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
    15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
    8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
  ];

  /**
   * Rotación circular a la izquierda
   */
  function rotl(x, n) {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }

  /**
   * Funciones no lineales para cada ronda
   */
  function f1(x, y, z) { return (x ^ y ^ z) >>> 0; }
  function f2(x, y, z) { return ((x & y) | (~x & z)) >>> 0; }
  function f3(x, y, z) { return ((x | ~y) ^ z) >>> 0; }
  function f4(x, y, z) { return ((x & z) | (y & ~z)) >>> 0; }
  function f5(x, y, z) { return (x ^ (y | ~z)) >>> 0; }

  const F1 = [f1, f2, f3, f4, f5];
  const F2 = [f5, f4, f3, f2, f1];

  /**
   * Procesa un bloque de 64 bytes (512 bits)
   */
  function processBlock(H, block) {
    // Parsear bloque en 16 palabras de 32 bits (little-endian)
    const X = new Array(16);
    for (let i = 0; i < 16; i++) {
      X[i] = (block[i * 4]) |
             (block[i * 4 + 1] << 8) |
             (block[i * 4 + 2] << 16) |
             (block[i * 4 + 3] << 24);
      X[i] = X[i] >>> 0;
    }

    // Inicializar variables de trabajo
    let al = H[0], bl = H[1], cl = H[2], dl = H[3], el = H[4];
    let ar = H[0], br = H[1], cr = H[2], dr = H[3], er = H[4];

    // 80 rondas
    for (let j = 0; j < 80; j++) {
      const round = Math.floor(j / 16);
      
      // Rama izquierda
      let tl = (al + F1[round](bl, cl, dl) + X[R1[j]] + K1[round]) >>> 0;
      tl = (rotl(tl, S1[j]) + el) >>> 0;
      al = el;
      el = dl;
      dl = rotl(cl, 10);
      cl = bl;
      bl = tl;

      // Rama derecha
      let tr = (ar + F2[round](br, cr, dr) + X[R2[j]] + K2[round]) >>> 0;
      tr = (rotl(tr, S2[j]) + er) >>> 0;
      ar = er;
      er = dr;
      dr = rotl(cr, 10);
      cr = br;
      br = tr;
    }

    // Actualizar estado
    const t = (H[1] + cl + dr) >>> 0;
    H[1] = (H[2] + dl + er) >>> 0;
    H[2] = (H[3] + el + ar) >>> 0;
    H[3] = (H[4] + al + br) >>> 0;
    H[4] = (H[0] + bl + cr) >>> 0;
    H[0] = t;
  }

  /**
   * Calcula RIPEMD-160 de un Uint8Array
   * @param {Uint8Array} message - Datos de entrada
   * @returns {Uint8Array} - Hash de 20 bytes
   */
  function ripemd160(message) {
    // Estado inicial
    const H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

    // Padding del mensaje
    const msgLen = message.length;
    const bitLen = msgLen * 8;
    
    // Calcular longitud con padding
    // Mensaje + 1 byte (0x80) + padding + 8 bytes de longitud
    // Tras a?adir 0x80 (1 byte), rellenamos con ceros hasta que queden 8 bytes libres
    // para la longitud final en bits (little-endian).
    const padLen = (msgLen % 64 < 56) ? (55 - (msgLen % 64)) : (119 - (msgLen % 64));
    const totalLen = msgLen + 1 + padLen + 8;
    
    const padded = new Uint8Array(totalLen);
    padded.set(message);
    padded[msgLen] = 0x80;
    
    // Longitud en bits (little-endian, 64 bits)
    const lenPos = totalLen - 8;
    padded[lenPos] = bitLen & 0xff;
    padded[lenPos + 1] = (bitLen >>> 8) & 0xff;
    padded[lenPos + 2] = (bitLen >>> 16) & 0xff;
    padded[lenPos + 3] = (bitLen >>> 24) & 0xff;
    // Los bytes superiores serían para mensajes > 512MB, dejamos en 0

    // Procesar bloques de 64 bytes
    for (let i = 0; i < totalLen; i += 64) {
      processBlock(H, padded.subarray(i, i + 64));
    }

    // Convertir estado a bytes (little-endian)
    const hash = new Uint8Array(20);
    for (let i = 0; i < 5; i++) {
      hash[i * 4] = H[i] & 0xff;
      hash[i * 4 + 1] = (H[i] >>> 8) & 0xff;
      hash[i * 4 + 2] = (H[i] >>> 16) & 0xff;
      hash[i * 4 + 3] = (H[i] >>> 24) & 0xff;
    }

    return hash;
  }

  /**
   * Calcula RIPEMD-160 y devuelve string hexadecimal
   * @param {Uint8Array} message - Datos de entrada
   * @returns {string} - Hash en hexadecimal (40 caracteres)
   */
  function ripemd160Hex(message) {
    const hash = ripemd160(message);
    return Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Exportar
  global.RIPEMD160 = {
    hash: ripemd160,
    hashHex: ripemd160Hex
  };

})(typeof window !== 'undefined' ? window : global);