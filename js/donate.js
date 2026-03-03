/**
 * Donation widget for aprendebtc.com
 * - Lightning via LNURL-pay (LUD-06 / LUD-16)
 * - On-chain fallback
 * - Nostr profile link managed in HTML
 */
(function () {
  'use strict';

  const CONFIG = {
    lightningAddress: 'applealpaca64@phoenixwallet.me',
    onchainAddress: 'bc1qqqnmg5yfxjyskqamyvwu3l33dtcjhrq6reuwxj',
    presets: [1000, 5000, 21000],
    defaultPresetIndex: 1,
    qrCellSize: 4,
    qrMargin: 2,
    invoiceExpiryMinutes: 10,
    copyFeedbackDuration: 2000
  };

  const state = {
    selectedAmount: CONFIG.presets[CONFIG.defaultPresetIndex],
    customAmount: '',
    lnurlParams: null,
    currentInvoice: null,
    phase: 'select',
    errorMessage: ''
  };

  let lightningContainer = null;
  let onchainContainer = null;

  function formatSats(sats) {
    return Number(sats).toLocaleString('es-ES');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  function createQrImage(data) {
    try {
      if (typeof qrcode === 'undefined') return null;
      const qr = qrcode(0, 'M');
      qr.addData(data);
      qr.make();

      const img = document.createElement('img');
      img.src = qr.createDataURL(CONFIG.qrCellSize, CONFIG.qrMargin);
      img.alt = 'Codigo QR para pago Bitcoin';
      return img;
    } catch (err) {
      console.error('createQrImage:', err);
      return null;
    }
  }

  function truncate(value, startChars, endChars) {
    const text = String(value || '');
    if (text.length <= startChars + endChars + 3) return text;
    return text.slice(0, startChars) + '...' + text.slice(-endChars);
  }

  function resolveLightningAddress(address) {
    const [user, domain] = String(address).split('@');
    return 'https://' + domain + '/.well-known/lnurlp/' + user;
  }

  async function fetchLnurlParams() {
    const url = resolveLightningAddress(CONFIG.lightningAddress);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('No se pudo conectar con el servidor Lightning (HTTP ' + response.status + ')');
    }

    const data = await response.json();
    if (data.status === 'ERROR') {
      throw new Error(data.reason || 'Error del servidor Lightning');
    }
    if (!data.callback || !data.minSendable || !data.maxSendable) {
      throw new Error('Respuesta LNURL incompleta');
    }

    return {
      callback: data.callback,
      minSats: Math.ceil(data.minSendable / 1000),
      maxSats: Math.floor(data.maxSendable / 1000)
    };
  }

  async function requestInvoice(callback, sats) {
    const amountMsat = Number(sats) * 1000;
    const sep = callback.includes('?') ? '&' : '?';
    const url = callback + sep + 'amount=' + amountMsat;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('No se pudo generar la factura (HTTP ' + response.status + ')');
    }

    const data = await response.json();
    if (data.status === 'ERROR') {
      throw new Error(data.reason || 'Error al generar la factura');
    }
    if (!data.pr) {
      throw new Error('El servidor no devolvio una factura valida');
    }

    return data.pr;
  }

  function renderAmountSelection() {
    state.phase = 'select';
    state.currentInvoice = null;

    let html = '';
    html += '<p class="donate__instruction">Elige un monto en satoshis:</p>';
    html += '<div class="donate__presets" role="group" aria-label="Montos predefinidos">';
    CONFIG.presets.forEach((amount) => {
      const selected = amount === state.selectedAmount;
      html += '<button class="donate__preset' + (selected ? ' donate__preset--selected' : '') + '" data-amount="' + amount + '" aria-pressed="' + (selected ? 'true' : 'false') + '">';
      html += formatSats(amount) + ' sats';
      html += '</button>';
    });
    html += '</div>';

    html += '<div class="donate__custom-input">';
    html += '<input type="number" id="donate-custom-amount" placeholder="Otro monto" min="1" value="' + escapeHtml(state.customAmount || '') + '" aria-label="Monto personalizado en satoshis">';
    html += '<span>sats</span>';
    html += '</div>';

    html += '<button class="donate__generate-btn" id="donate-generate-btn">Generar factura Lightning</button>';
    lightningContainer.innerHTML = html;

    bindAmountSelectionEvents();
  }

  function renderLoading() {
    state.phase = 'loading';
    lightningContainer.innerHTML =
      '<div class="donate__loading">' +
        '<div class="donate__spinner"></div>' +
        '<p>Generando factura Lightning...</p>' +
      '</div>';
  }

  function renderInvoice(invoice, amount) {
    state.phase = 'invoice';
    state.currentInvoice = invoice;

    let html = '';
    html += '<p class="donate__amount-confirm">Factura por <strong>' + formatSats(amount) + ' sats</strong></p>';
    html += '<div class="donate__qr-container"><div class="donate__qr" id="donate-ln-qr"></div></div>';
    html += '<p class="donate__scan-hint">Escanea con tu wallet Lightning</p>';
    html += '<div class="donate__invoice-display">';
    html += '<div class="donate__address-row">';
    html += '<code class="donate__address-text" title="' + escapeHtml(invoice) + '">' + escapeHtml(truncate(invoice, 20, 10)) + '</code>';
    html += '<button class="donate__copy-btn" id="donate-copy-invoice">Copiar invoice</button>';
    html += '</div>';
    html += '<a href="lightning:' + encodeURIComponent(invoice) + '" class="donate__wallet-link">Abrir con wallet</a>';
    html += '<p class="donate__expiry">La factura expira en ~' + CONFIG.invoiceExpiryMinutes + ' minutos</p>';
    html += '</div>';
    html += '<button class="donate__generate-new-btn" id="donate-generate-new">Generar otra factura</button>';
    lightningContainer.innerHTML = html;

    const qrContainer = document.getElementById('donate-ln-qr');
    const qrImg = createQrImage('lightning:' + String(invoice).toUpperCase());
    if (qrContainer) {
      if (qrImg) {
        qrContainer.appendChild(qrImg);
      } else {
        qrContainer.textContent = 'QR no disponible';
      }
    }

    const copyButton = document.getElementById('donate-copy-invoice');
    if (copyButton) {
      copyButton.addEventListener('click', function () {
        copyToClipboard(invoice, this);
      });
    }

    const regenerateButton = document.getElementById('donate-generate-new');
    if (regenerateButton) {
      regenerateButton.addEventListener('click', renderAmountSelection);
    }
  }

  function renderError(message) {
    state.phase = 'error';
    state.errorMessage = message;

    let html = '';
    html += '<div class="donate__error">';
    html += '<p>' + escapeHtml(message) + '</p>';
    html += '<button class="donate__retry-btn" id="donate-retry">Reintentar</button>';
    html += '</div>';
    html += '<div class="donate__fallback">';
    html += '<p class="donate__fallback-hint">O copia esta Lightning Address y pegala en tu wallet:</p>';
    html += '<div class="donate__address-row">';
    html += '<code class="donate__address-text">' + escapeHtml(CONFIG.lightningAddress) + '</code>';
    html += '<button class="donate__copy-btn" id="donate-copy-lnaddress">Copiar</button>';
    html += '</div>';
    html += '</div>';
    lightningContainer.innerHTML = html;

    const retry = document.getElementById('donate-retry');
    if (retry) retry.addEventListener('click', renderAmountSelection);

    const copyLnAddress = document.getElementById('donate-copy-lnaddress');
    if (copyLnAddress) {
      copyLnAddress.addEventListener('click', function () {
        copyToClipboard(CONFIG.lightningAddress, this);
      });
    }
  }

  function renderFallback() {
    state.phase = 'fallback';

    let html = '';
    html += '<div class="donate__fallback">';
    html += '<p class="donate__fallback-text">Copia esta Lightning Address y pegala en tu wallet compatible (Phoenix, Zeus, BlueWallet, Wallet of Satoshi...):</p>';
    html += '<div class="donate__qr-container"><div class="donate__qr" id="donate-ln-fallback-qr"></div></div>';
    html += '<div class="donate__address-row">';
    html += '<code class="donate__address-text">' + escapeHtml(CONFIG.lightningAddress) + '</code>';
    html += '<button class="donate__copy-btn" id="donate-copy-lnaddress-fallback">Copiar</button>';
    html += '</div>';
    html += '<p class="donate__fallback-hint">Tu wallet resolvera la direccion y te permitira elegir el monto.</p>';
    html += '</div>';
    lightningContainer.innerHTML = html;

    const qrContainer = document.getElementById('donate-ln-fallback-qr');
    const qrImg = createQrImage('lightning:' + CONFIG.lightningAddress);
    if (qrContainer && qrImg) {
      qrContainer.appendChild(qrImg);
    }

    const copyButton = document.getElementById('donate-copy-lnaddress-fallback');
    if (copyButton) {
      copyButton.addEventListener('click', function () {
        copyToClipboard(CONFIG.lightningAddress, this);
      });
    }
  }

  function renderOnchain() {
    if (!onchainContainer) return;

    let html = '';
    html += '<div class="donate__privacy-note">';
    html += '<span aria-hidden="true">i</span>';
    html += '<span>Por privacidad, preferimos donaciones via Lightning. Cada pago Lightning genera una factura unica. Usa on-chain solo para montos grandes.</span>';
    html += '</div>';
    html += '<div class="donate__qr-container"><div class="donate__qr" id="donate-onchain-qr"></div></div>';
    html += '<div class="donate__address-row">';
    html += '<code class="donate__address-text" title="' + escapeHtml(CONFIG.onchainAddress) + '">' + escapeHtml(CONFIG.onchainAddress) + '</code>';
    html += '<button class="donate__copy-btn" id="donate-copy-onchain">Copiar direccion</button>';
    html += '</div>';
    html += '<div class="donate__invoice-display">';
    html += '<a href="bitcoin:' + encodeURIComponent(CONFIG.onchainAddress) + '" class="donate__wallet-link">Abrir con wallet</a>';
    html += '</div>';
    onchainContainer.innerHTML = html;

    const qrContainer = document.getElementById('donate-onchain-qr');
    const qrImg = createQrImage('bitcoin:' + CONFIG.onchainAddress);
    if (qrContainer && qrImg) {
      qrContainer.appendChild(qrImg);
    }

    const copyButton = document.getElementById('donate-copy-onchain');
    if (copyButton) {
      copyButton.addEventListener('click', function () {
        copyToClipboard(CONFIG.onchainAddress, this);
      });
    }
  }

  function bindAmountSelectionEvents() {
    const presets = lightningContainer.querySelectorAll('.donate__preset');
    presets.forEach((preset) => {
      preset.addEventListener('click', function () {
        const amount = Number(this.dataset.amount);
        state.selectedAmount = amount;
        state.customAmount = '';

        presets.forEach((item) => {
          item.classList.remove('donate__preset--selected');
          item.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('donate__preset--selected');
        this.setAttribute('aria-pressed', 'true');

        const customInput = document.getElementById('donate-custom-amount');
        if (customInput) customInput.value = '';
      });
    });

    const customInput = document.getElementById('donate-custom-amount');
    if (customInput) {
      customInput.addEventListener('input', function () {
        const value = Number(this.value);
        if (value > 0) {
          state.selectedAmount = value;
          state.customAmount = this.value;
          presets.forEach((item) => {
            item.classList.remove('donate__preset--selected');
            item.setAttribute('aria-pressed', 'false');
          });
        } else if (this.value === '') {
          state.selectedAmount = CONFIG.presets[CONFIG.defaultPresetIndex];
          state.customAmount = '';
          const defaultPreset = presets[CONFIG.defaultPresetIndex];
          if (defaultPreset) {
            defaultPreset.classList.add('donate__preset--selected');
            defaultPreset.setAttribute('aria-pressed', 'true');
          }
        }
      });

      customInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          generateInvoiceFlow();
        }
      });
    }

    const generateButton = document.getElementById('donate-generate-btn');
    if (generateButton) {
      generateButton.addEventListener('click', generateInvoiceFlow);
    }
  }

  async function generateInvoiceFlow() {
    const amount = Number(state.selectedAmount);
    if (!amount || amount < 1) {
      renderError('Introduce un monto valido en satoshis.');
      return;
    }

    renderLoading();

    try {
      if (!state.lnurlParams) {
        state.lnurlParams = await fetchLnurlParams();
      }

      if (amount < state.lnurlParams.minSats) {
        renderError('El monto minimo es ' + formatSats(state.lnurlParams.minSats) + ' sats.');
        return;
      }
      if (amount > state.lnurlParams.maxSats) {
        renderError('El monto maximo es ' + formatSats(state.lnurlParams.maxSats) + ' sats.');
        return;
      }

      const invoice = await requestInvoice(state.lnurlParams.callback, amount);
      renderInvoice(invoice, amount);
    } catch (err) {
      console.error('generateInvoiceFlow:', err);
      if (!state.lnurlParams) {
        renderFallback();
      } else {
        renderError('No se pudo generar la factura. ' + (err && err.message ? err.message : 'Intenta de nuevo.'));
      }
    }
  }

  function init() {
    lightningContainer = document.getElementById('donate-lightning-content');
    onchainContainer = document.getElementById('donate-onchain-content');

    if (!lightningContainer && !onchainContainer) return;
    if (typeof qrcode === 'undefined') {
      console.error('donate.js: qrcode.min.js no esta cargado');
    }

    if (lightningContainer) renderAmountSelection();
    if (onchainContainer) renderOnchain();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
