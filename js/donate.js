/**
 * Donation widget for aprendebtc.com
 * Phoenix-compatible mode:
 * - Reusable BOLT12 offer
 * - Lightning Address (BIP353) fallback
 * - On-chain fallback
 */
(function () {
  'use strict';

  const CONFIG = {
    lightningAddress: 'applealpaca64@phoenixwallet.me',
    bolt12Offer: 'lno1pgqppmsrse80qf0aara4slvcjxrvu6j2rp5ftmjy4yntlsmsutpkvkt6878s85p4demrjltmy3axsgfdp8zse2xjsv7gq8d2u5yy2sffraqnlurqqgp5vl09rcaykeh35gf3f3q5t98ztzh02wvy2jcpzh47q68k9nq97tcqxduy3a6l6rfdkjetndksasc3xv76arqwc83azxegd9see6625r6am9tfx2x7r73tfxd5v3x6rgq6xer4nu7sy4rw9x6f9vthw56whqnyendx8m8kfau9ren78y5s9vcvkeh9cd35qqev8rs9ds5qt0w0t8nu0ju3wedlktsjw33zu54mhszy8a04njza3zppnr549u85n8yslqgvjxa7chgygrwq',
    onchainAddress: 'bc1qqqnmg5yfxjyskqamyvwu3l33dtcjhrq6reuwxj',
    qrCellSize: 4,
    qrMargin: 2,
    copyFeedbackDuration: 2000
  };

  let lightningContainer = null;
  let onchainContainer = null;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function truncate(value, startChars, endChars) {
    const text = String(value || '');
    if (text.length <= startChars + endChars + 3) return text;
    return text.slice(0, startChars) + '...' + text.slice(-endChars);
  }

  function showCopiedFeedback(button) {
    if (!button) return;
    const originalLabel = button.textContent;
    button.textContent = 'Copiado';
    button.classList.add('donate__copy-btn--copied');
    window.setTimeout(() => {
      button.textContent = originalLabel;
      button.classList.remove('donate__copy-btn--copied');
    }, CONFIG.copyFeedbackDuration);
  }

  async function copyToClipboard(text, button) {
    const value = String(text || '').trim();
    if (!value) return;

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(value);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      showCopiedFeedback(button);
    } catch (_) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.setAttribute('readonly', 'readonly');
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showCopiedFeedback(button);
      } catch (err) {
        console.error('copyToClipboard:', err);
      }
    }
  }

  function createQrImage(data, altText) {
    try {
      if (typeof qrcode === 'undefined') return null;
      const qr = qrcode(0, 'M');
      qr.addData(String(data));
      qr.make();

      const img = document.createElement('img');
      img.src = qr.createDataURL(CONFIG.qrCellSize, CONFIG.qrMargin);
      img.alt = altText || 'Codigo QR para pago Bitcoin';
      return img;
    } catch (err) {
      console.error('createQrImage:', err);
      return null;
    }
  }

  function renderLightning() {
    if (!lightningContainer) return;

    let html = '';
    html += '<p class="donate__instruction">Donacion Lightning reutilizable (BOLT12):</p>';
    html += '<div class="donate__qr-container"><div class="donate__qr" id="donate-bolt12-qr"></div></div>';

    html += '<div class="donate__address-row">';
    html += '<code class="donate__address-text" title="' + escapeHtml(CONFIG.bolt12Offer) + '">' + escapeHtml(truncate(CONFIG.bolt12Offer, 28, 16)) + '</code>';
    html += '<button class="donate__copy-btn" id="donate-copy-bolt12">Copiar BOLT12</button>';
    html += '</div>';

    html += '<p class="donate__fallback-hint">Si tu wallet no soporta BOLT12, usa esta Lightning Address:</p>';
    html += '<div class="donate__address-row">';
    html += '<code class="donate__address-text">' + escapeHtml(CONFIG.lightningAddress) + '</code>';
    html += '<button class="donate__copy-btn" id="donate-copy-lnaddress">Copiar direccion</button>';
    html += '</div>';

    html += '<div class="donate__invoice-display">';
    html += '<a href="lightning:' + CONFIG.lightningAddress + '" class="donate__wallet-link">Abrir con wallet</a>';
    html += '</div>';

    html += '<div class="donate__qr-container"><div class="donate__qr" id="donate-lnaddr-qr"></div></div>';

    lightningContainer.innerHTML = html;

    const bolt12QrWrap = document.getElementById('donate-bolt12-qr');
    const bolt12Qr = createQrImage(CONFIG.bolt12Offer, 'Codigo QR de oferta BOLT12');
    if (bolt12QrWrap) {
      if (bolt12Qr) {
        bolt12QrWrap.appendChild(bolt12Qr);
      } else {
        bolt12QrWrap.textContent = 'QR no disponible';
      }
    }

    const lnAddrQrWrap = document.getElementById('donate-lnaddr-qr');
    const lnAddrQr = createQrImage('lightning:' + CONFIG.lightningAddress, 'Codigo QR de Lightning Address');
    if (lnAddrQrWrap) {
      if (lnAddrQr) {
        lnAddrQrWrap.appendChild(lnAddrQr);
      } else {
        lnAddrQrWrap.textContent = 'QR no disponible';
      }
    }

    const copyBolt12Button = document.getElementById('donate-copy-bolt12');
    if (copyBolt12Button) {
      copyBolt12Button.addEventListener('click', function () {
        copyToClipboard(CONFIG.bolt12Offer, this);
      });
    }

    const copyAddressButton = document.getElementById('donate-copy-lnaddress');
    if (copyAddressButton) {
      copyAddressButton.addEventListener('click', function () {
        copyToClipboard(CONFIG.lightningAddress, this);
      });
    }
  }

  function renderOnchain() {
    if (!onchainContainer) return;

    let html = '';
    html += '<div class="donate__privacy-note">';
    html += '<span aria-hidden="true">i</span>';
    html += '<span>Por privacidad, preferimos donaciones via Lightning. Cada pago Lightning usa una identidad separada. Usa on-chain solo para montos grandes.</span>';
    html += '</div>';

    html += '<div class="donate__qr-container"><div class="donate__qr" id="donate-onchain-qr"></div></div>';

    html += '<div class="donate__address-row">';
    html += '<code class="donate__address-text" title="' + escapeHtml(CONFIG.onchainAddress) + '">' + escapeHtml(CONFIG.onchainAddress) + '</code>';
    html += '<button class="donate__copy-btn" id="donate-copy-onchain">Copiar direccion</button>';
    html += '</div>';

    html += '<div class="donate__invoice-display">';
    html += '<a href="bitcoin:' + CONFIG.onchainAddress + '" class="donate__wallet-link">Abrir con wallet</a>';
    html += '</div>';

    onchainContainer.innerHTML = html;

    const qrContainer = document.getElementById('donate-onchain-qr');
    const qrImg = createQrImage('bitcoin:' + CONFIG.onchainAddress, 'Codigo QR para direccion on-chain');
    if (qrContainer) {
      if (qrImg) {
        qrContainer.appendChild(qrImg);
      } else {
        qrContainer.textContent = 'QR no disponible';
      }
    }

    const copyButton = document.getElementById('donate-copy-onchain');
    if (copyButton) {
      copyButton.addEventListener('click', function () {
        copyToClipboard(CONFIG.onchainAddress, this);
      });
    }
  }

  function init() {
    lightningContainer = document.getElementById('donate-lightning-content');
    onchainContainer = document.getElementById('donate-onchain-content');

    if (!lightningContainer && !onchainContainer) return;
    if (typeof qrcode === 'undefined') {
      console.error('donate.js: qrcode.min.js no esta cargado');
    }

    renderLightning();
    renderOnchain();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
