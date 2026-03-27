/**
 * Donation widget for aprendebtc.com
 * Source of truth aligned with the functional donation reference page.
 * - Primary method: reusable BOLT12 via bitcoin:?lno=...
 * - Secondary: Lightning Address fallback
 * - Universal fallback: on-chain
 */
(function () {
  'use strict';

  const CONFIG = {
    lightningAddress: 'applealpaca64@phoenixwallet.me',
    bolt12Offer: 'lno1pgqppmsrse80qf0aara4slvcjxrvu6j2rp5ftmjy4yntlsmsutpkvkt6878syhxgefxqe6tpwem3qz2ckm4u58wzf0qttasfff6vxuts6rev004cqgpz0p5gc4pp7k6e5czwtvn6aapuz3npjgp3t28n9wvh2xqxry959csqx0qy5trzw3qxfjmh0qd89zh4c3e8ympajkug7qsty7xhtqwyfj2syhhajpldvh8e9xwhxs4snjcdq883uteq96zmy7w6stwsjx9szxuj47u89cl6mwx9cu0xg2c245wztw476ul8qqerp5w6dulw6yshx95qjw7lerqanqfxkh0ahxfqp9qya57nydsspfy47ud6eju2djdlwpyf9qvlfc6z6guq',
    onchainAddress: 'bc1qqqnmg5yfxjyskqamyvwu3l33dtcjhrq6reuwxj',
    qrCellSize: 4,
    qrMargin: 2,
    copyFeedbackDuration: 2000
  };

  let lightningContainer = null;
  let onchainContainer = null;
  const bolt12Uri = 'bitcoin:?lno=' + CONFIG.bolt12Offer;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
    html += '<p class="donate__instruction">Este es el formato que queremos priorizar para Lightning. Escanea el QR, abre el enlace en tu wallet o copia la oferta si tu app prefiere pegarla manualmente.</p>';
    html += '<div class="donate__qr-container"><div class="donate__qr" id="donate-bolt12-qr"></div></div>';
    html += '<p class="donate__scan-hint">Escanealo desde una wallet Lightning moderna. Si no abre bien, usa el boton de copiar.</p>';

    html += '<div class="donate__address-row">';
    html += '<code class="donate__address-text donate__address-text--wrap" title="' + escapeHtml(CONFIG.bolt12Offer) + '">' + escapeHtml(CONFIG.bolt12Offer) + '</code>';
    html += '<button class="donate__copy-btn" id="donate-copy-bolt12">Copiar oferta</button>';
    html += '</div>';

    html += '<div class="donate__action-row">';
    html += '<a href="' + escapeHtml(bolt12Uri) + '" class="donate__wallet-link donate__wallet-link--button">Abrir wallet</a>';
    html += '<button class="donate__copy-btn" id="donate-copy-bolt12-uri">Copiar Bitcoin URI</button>';
    html += '</div>';

    html += '<p class="donate__inline-note">El QR usa un <code>bitcoin:?lno=...</code> para mejorar la deteccion en wallets que entienden Bolt12 a traves de Bitcoin URI.</p>';
    html += '<ul class="donate__checklist">';
    html += '<li>Usa este QR si tu wallet soporta Bolt12 o el parametro <code>lno=</code>.</li>';
    html += '<li>Si tu wallet no lo detecta, copia la oferta directamente o pasa al metodo on-chain.</li>';
    html += '<li>La Lightning Address queda como opcion secundaria porque la compatibilidad entre wallets sigue siendo desigual.</li>';
    html += '</ul>';

    html += '<p class="donate__fallback-hint">Alternativa Lightning Address:</p>';
    html += '<div class="donate__address-row">';
    html += '<code class="donate__address-text">' + escapeHtml(CONFIG.lightningAddress) + '</code>';
    html += '<button class="donate__copy-btn" id="donate-copy-lnaddress">Copiar direccion</button>';
    html += '</div>';
    html += '<p class="donate__inline-note">Si ves errores al pagarla, vuelve al QR Bolt12 o usa on-chain.</p>';

    lightningContainer.innerHTML = html;

    const bolt12QrWrap = document.getElementById('donate-bolt12-qr');
    const bolt12Qr = createQrImage(bolt12Uri, 'Codigo QR para donar por Lightning con Bolt12');
    if (bolt12QrWrap) {
      if (bolt12Qr) {
        bolt12QrWrap.appendChild(bolt12Qr);
      } else {
        bolt12QrWrap.textContent = 'QR no disponible';
      }
    }

    const copyBolt12Button = document.getElementById('donate-copy-bolt12');
    if (copyBolt12Button) {
      copyBolt12Button.addEventListener('click', function () {
        copyToClipboard(CONFIG.bolt12Offer, this);
      });
    }

    const copyBolt12UriButton = document.getElementById('donate-copy-bolt12-uri');
    if (copyBolt12UriButton) {
      copyBolt12UriButton.addEventListener('click', function () {
        copyToClipboard(bolt12Uri, this);
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
    html += '<span>Por privacidad, preferimos donaciones via Lightning. Cada pago Lightning genera una factura unica. Usa on-chain solo para montos grandes.</span>';
    html += '</div>';

    html += '<div class="donate__address-row">';
    html += '<code class="donate__address-text" title="' + escapeHtml(CONFIG.onchainAddress) + '">' + escapeHtml(CONFIG.onchainAddress) + '</code>';
    html += '<button class="donate__copy-btn" id="donate-copy-onchain">Copiar direccion</button>';
    html += '</div>';
    html += '<p class="donate__inline-note">Si puedes elegir, Lightning sigue siendo mejor para privacidad, coste y velocidad.</p>';

    onchainContainer.innerHTML = html;

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
