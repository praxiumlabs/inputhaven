/**
 * InputHaven Embed Script
 * 
 * Usage:
 * <script src="https://cdn.inputhaven.com/embed.js"></script>
 * <div data-inputhaven-form="FORM_ID"></div>
 * 
 * Options:
 * - data-inputhaven-form="FORM_ID" (required)
 * - data-theme="light|dark|auto"
 * - data-mode="inline|popup|slide"
 * - data-width="100%|500px|etc"
 * - data-button-text="Open Form"
 * - data-button-class="my-button-class"
 */

(function() {
  'use strict';

  const INPUTHAVEN_BASE = 'https://inputhaven.com';
  const EMBED_VERSION = '1.0.0';

  // Styles for the embed
  const STYLES = `
    .ih-embed-container {
      width: 100%;
      border: none;
      background: transparent;
    }
    .ih-embed-iframe {
      width: 100%;
      border: none;
      min-height: 200px;
      background: transparent;
    }
    .ih-embed-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #6b7280;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .ih-embed-loading-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #e5e7eb;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: ih-spin 0.8s linear infinite;
      margin-right: 12px;
    }
    @keyframes ih-spin {
      to { transform: rotate(360deg); }
    }
    .ih-embed-error {
      padding: 20px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
    }
    .ih-popup-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
    }
    .ih-popup-overlay.ih-active {
      opacity: 1;
      visibility: visible;
    }
    .ih-popup-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      transform: scale(0.95);
      transition: transform 0.2s;
    }
    .ih-popup-overlay.ih-active .ih-popup-container {
      transform: scale(1);
    }
    .ih-popup-header {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    .ih-popup-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: #6b7280;
      border-radius: 8px;
      transition: background 0.15s, color 0.15s;
    }
    .ih-popup-close:hover {
      background: #f3f4f6;
      color: #1f2937;
    }
    .ih-popup-body {
      padding: 0;
      overflow-y: auto;
      max-height: calc(90vh - 60px);
    }
    .ih-slide-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 480px;
      background: white;
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
      z-index: 99999;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }
    .ih-slide-panel.ih-active {
      transform: translateX(0);
    }
    .ih-slide-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 99998;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
    }
    .ih-slide-overlay.ih-active {
      opacity: 1;
      visibility: visible;
    }
    .ih-trigger-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 15px;
      cursor: pointer;
      font-family: system-ui, -apple-system, sans-serif;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .ih-trigger-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
  `;

  // Inject styles
  function injectStyles() {
    if (document.getElementById('ih-embed-styles')) return;
    const style = document.createElement('style');
    style.id = 'ih-embed-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  // Create iframe for form
  function createIframe(formId, options) {
    const iframe = document.createElement('iframe');
    iframe.className = 'ih-embed-iframe';
    iframe.setAttribute('title', 'InputHaven Form');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allow', 'clipboard-write');
    
    const params = new URLSearchParams({
      embed: 'true',
      v: EMBED_VERSION
    });
    
    if (options.theme) params.set('theme', options.theme);
    
    iframe.src = `${INPUTHAVEN_BASE}/f/${formId}?${params.toString()}`;
    
    if (options.width) {
      iframe.style.width = options.width;
    }
    
    return iframe;
  }

  // Setup iframe auto-resize
  function setupAutoResize(iframe) {
    window.addEventListener('message', (event) => {
      if (event.origin !== INPUTHAVEN_BASE) return;
      
      const data = event.data;
      if (data.type === 'ih-resize' && data.height) {
        iframe.style.height = `${data.height}px`;
      }
      if (data.type === 'ih-submit-success') {
        iframe.dispatchEvent(new CustomEvent('ih:success', { detail: data.payload }));
      }
    });
  }

  // Render inline form
  function renderInline(container, formId, options) {
    container.innerHTML = `
      <div class="ih-embed-loading">
        <div class="ih-embed-loading-spinner"></div>
        Loading form...
      </div>
    `;
    
    const iframe = createIframe(formId, options);
    
    iframe.onload = () => {
      container.innerHTML = '';
      container.appendChild(iframe);
    };
    
    iframe.onerror = () => {
      container.innerHTML = `
        <div class="ih-embed-error">
          Failed to load form. Please try again later.
        </div>
      `;
    };
    
    setupAutoResize(iframe);
    
    // Start loading
    const temp = document.createElement('div');
    temp.style.display = 'none';
    temp.appendChild(iframe);
    document.body.appendChild(temp);
  }

  // Create popup modal
  function createPopup(formId, options) {
    const overlay = document.createElement('div');
    overlay.className = 'ih-popup-overlay';
    overlay.innerHTML = `
      <div class="ih-popup-container">
        <div class="ih-popup-header">
          <button class="ih-popup-close" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="ih-popup-body"></div>
      </div>
    `;
    
    const body = overlay.querySelector('.ih-popup-body');
    const iframe = createIframe(formId, options);
    iframe.style.height = '500px';
    body.appendChild(iframe);
    
    // Close handlers
    const close = () => {
      overlay.classList.remove('ih-active');
      setTimeout(() => overlay.remove(), 200);
    };
    
    overlay.querySelector('.ih-popup-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    }, { once: true });
    
    setupAutoResize(iframe);
    
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('ih-active'));
    
    return { close };
  }

  // Create slide panel
  function createSlidePanel(formId, options) {
    const overlay = document.createElement('div');
    overlay.className = 'ih-slide-overlay';
    
    const panel = document.createElement('div');
    panel.className = 'ih-slide-panel';
    panel.innerHTML = `
      <div class="ih-popup-header">
        <button class="ih-popup-close" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="ih-popup-body" style="height: calc(100% - 60px);"></div>
    `;
    
    const body = panel.querySelector('.ih-popup-body');
    const iframe = createIframe(formId, options);
    iframe.style.height = '100%';
    body.appendChild(iframe);
    
    // Close handlers
    const close = () => {
      overlay.classList.remove('ih-active');
      panel.classList.remove('ih-active');
      setTimeout(() => {
        overlay.remove();
        panel.remove();
      }, 300);
    };
    
    panel.querySelector('.ih-popup-close').addEventListener('click', close);
    overlay.addEventListener('click', close);
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    }, { once: true });
    
    setupAutoResize(iframe);
    
    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    requestAnimationFrame(() => {
      overlay.classList.add('ih-active');
      panel.classList.add('ih-active');
    });
    
    return { close };
  }

  // Render trigger button
  function renderTriggerButton(container, formId, options) {
    const button = document.createElement('button');
    button.className = options.buttonClass || 'ih-trigger-button';
    button.textContent = options.buttonText || 'Open Form';
    
    button.addEventListener('click', () => {
      if (options.mode === 'slide') {
        createSlidePanel(formId, options);
      } else {
        createPopup(formId, options);
      }
    });
    
    container.appendChild(button);
  }

  // Initialize all forms on page
  function initForms() {
    injectStyles();
    
    const containers = document.querySelectorAll('[data-inputhaven-form]');
    
    containers.forEach((container) => {
      const formId = container.getAttribute('data-inputhaven-form');
      if (!formId) return;
      
      const options = {
        theme: container.getAttribute('data-theme') || 'auto',
        mode: container.getAttribute('data-mode') || 'inline',
        width: container.getAttribute('data-width'),
        buttonText: container.getAttribute('data-button-text'),
        buttonClass: container.getAttribute('data-button-class')
      };
      
      if (options.mode === 'inline') {
        renderInline(container, formId, options);
      } else {
        renderTriggerButton(container, formId, options);
      }
    });
  }

  // Public API
  window.InputHaven = {
    version: EMBED_VERSION,
    
    init: initForms,
    
    open: function(formId, options = {}) {
      if (options.mode === 'slide') {
        return createSlidePanel(formId, options);
      }
      return createPopup(formId, options);
    },
    
    embed: function(element, formId, options = {}) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      if (!element) return;
      
      renderInline(element, formId, options);
    }
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForms);
  } else {
    initForms();
  }
})();
