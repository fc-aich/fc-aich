/**
 * FC Aich Google Drive Integration
 * Google Drive API v3 für Galerien und Dateilisten
 *
 * Features:
 * - Google Drive API v3 integration
 * - Galerie-Ansicht mit GLightbox
 * - Dateiliste für PDFs/Dokumente
 * - Responsive Grid-Layout
 * - Lazy Loading
 * - Deutsche Lokalisierung
 */

(function() {
  'use strict';

  // Konfiguration
  const CONFIG = {
    // API Endpunkt
    apiBase: 'https://www.googleapis.com/drive/v3/files',
    // Felder die wir abfragen
    fields: 'files(id,name,mimeType,thumbnailLink,webContentLink,size,createdTime,modifiedTime)',
    // Unterstützte Bildformate
    imageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    // Unterstützte Dokumentformate
    documentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    // Container-Selektoren
    gallerySelector: '[data-drive-gallery]',
    filesSelector: '[data-drive-files]',
  };

  // Datei-Icons nach MIME-Type
  const FILE_ICONS = {
    'application/pdf': '📄',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'application/zip': '📦',
    'default': '📁'
  };

  // State
  let apiKey = '';

  /**
   * Initialisierung
   */
  function init() {
    // API-Key aus config holen (wird in Hugo-Shortcode gesetzt)
    const configEl = document.querySelector('[data-drive-api-key]');
    if (configEl) {
      apiKey = configEl.dataset.driveApiKey;
    }

    if (!apiKey) {
      console.warn('FC Drive: Kein API-Key konfiguriert');
      return;
    }

    // Alle Galerie-Container initialisieren
    document.querySelectorAll(CONFIG.gallerySelector).forEach(initGallery);

    // Alle Datei-Container initialisieren
    document.querySelectorAll(CONFIG.filesSelector).forEach(initFileList);
  }

  /**
   * Galerie-Container initialisieren
   */
  async function initGallery(container) {
    const folderId = container.dataset.driveGallery;
    if (!folderId) {
      showError(container, 'Keine Ordner-ID angegeben');
      return;
    }

    showLoading(container, 'Bilder werden geladen...');

    try {
      const files = await fetchFolderContents(folderId, 'image');
      if (files.length === 0) {
        showEmpty(container, 'Keine Bilder gefunden');
        return;
      }

      renderGallery(container, files);

      // GLightbox initialisieren wenn verfügbar
      if (typeof GLightbox !== 'undefined') {
        const galleryId = container.dataset.galleryId || 'drive-gallery-' + folderId.slice(0, 8);
        GLightbox({
          selector: `.${galleryId}`,
          touchNavigation: true,
          loop: true,
          closeButton: true,
        });
      }
    } catch (error) {
      console.error('FC Drive Gallery Error:', error);
      showError(container, 'Bilder konnten nicht geladen werden');
    }
  }

  /**
   * Dateiliste-Container initialisieren
   */
  async function initFileList(container) {
    const folderId = container.dataset.driveFiles;
    if (!folderId) {
      showError(container, 'Keine Ordner-ID angegeben');
      return;
    }

    showLoading(container, 'Dateien werden geladen...');

    try {
      const files = await fetchFolderContents(folderId, 'document');
      if (files.length === 0) {
        showEmpty(container, 'Keine Dateien gefunden');
        return;
      }

      renderFileList(container, files);
    } catch (error) {
      console.error('FC Drive Files Error:', error);
      showError(container, 'Dateien konnten nicht geladen werden');
    }
  }

  /**
   * Ordnerinhalt von Google Drive API abrufen
   */
  async function fetchFolderContents(folderId, type = 'all') {
    // MIME-Type Filter erstellen
    let mimeQuery = '';
    if (type === 'image') {
      const mimeTypes = CONFIG.imageTypes.map(t => `mimeType='${t}'`).join(' or ');
      mimeQuery = ` and (${mimeTypes})`;
    } else if (type === 'document') {
      const mimeTypes = CONFIG.documentTypes.map(t => `mimeType='${t}'`).join(' or ');
      mimeQuery = ` and (${mimeTypes})`;
    }

    const query = encodeURIComponent(`'${folderId}' in parents and trashed=false${mimeQuery}`);
    const url = `${CONFIG.apiBase}?q=${query}&fields=${CONFIG.fields}&orderBy=name&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
  }

  /**
   * Galerie rendern
   */
  function renderGallery(container, files) {
    const galleryId = container.dataset.galleryId || 'drive-gallery-' + Date.now();
    const isLogos = container.dataset.logos !== undefined;

    let html = `<div class="drive-gallery-grid${isLogos ? ' drive-gallery-logos' : ''}">`;

    files.forEach((file, index) => {
      // Thumbnail-URL anpassen für bessere Qualität
      const thumbnailUrl = file.thumbnailLink
        ? file.thumbnailLink.replace(/=s\d+/, '=s400')
        : '';

      // Volle Bild-URL (via Drive)
      const fullUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;

      html += `
        <a href="${fullUrl}"
           class="${galleryId} glightbox"
           data-gallery="${galleryId}"
           data-title="${escapeHtml(file.name)}">
          <img
            src="${thumbnailUrl || fullUrl}"
            alt="${escapeHtml(file.name)}"
            loading="lazy"
            onerror="this.src='${fullUrl}'"
          />
        </a>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
    container.classList.add('drive-loaded');
  }

  /**
   * Dateiliste rendern
   */
  function renderFileList(container, files) {
    let html = '<div class="drive-files-list">';

    files.forEach(file => {
      const icon = FILE_ICONS[file.mimeType] || FILE_ICONS.default;
      const size = formatFileSize(file.size);
      const date = formatDate(file.modifiedTime || file.createdTime);

      // Download-URL
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
      // Vorschau-URL (für PDFs)
      const previewUrl = `https://drive.google.com/file/d/${file.id}/preview`;

      html += `
        <div class="drive-file-item">
          <span class="drive-file-icon">${icon}</span>
          <div class="drive-file-info">
            <a href="${downloadUrl}" class="drive-file-name" download>
              ${escapeHtml(file.name)}
            </a>
            <div class="drive-file-meta">
              <span class="drive-file-size">${size}</span>
              <span class="drive-file-date">${date}</span>
            </div>
          </div>
          <div class="drive-file-actions">
            ${file.mimeType === 'application/pdf' ? `
              <a href="${previewUrl}" target="_blank" class="drive-btn drive-btn-preview" title="Vorschau">
                👁️
              </a>
            ` : ''}
            <a href="${downloadUrl}" class="drive-btn drive-btn-download" download title="Download">
              ⬇️
            </a>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
    container.classList.add('drive-loaded');
  }

  /**
   * Dateigröße formatieren
   */
  function formatFileSize(bytes) {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = parseInt(bytes, 10);
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
  }

  /**
   * Datum formatieren (DD.MM.YYYY)
   */
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Loading-Anzeige
   */
  function showLoading(container, message) {
    container.innerHTML = `
      <div class="drive-loading">
        <div class="drive-loading-spinner"></div>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  /**
   * Fehler-Anzeige
   */
  function showError(container, message) {
    container.innerHTML = `
      <div class="drive-error">
        <span class="drive-error-icon">⚠️</span>
        <p>${escapeHtml(message)}</p>
        <p class="drive-error-contact">Bei Problemen: <a href="mailto:info@fc-aich.de">info@fc-aich.de</a></p>
      </div>
    `;
    container.classList.add('drive-error-state');
  }

  /**
   * Leere Anzeige
   */
  function showEmpty(container, message) {
    container.innerHTML = `
      <div class="drive-empty">
        <span class="drive-empty-icon">📂</span>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  /**
   * HTML escapen
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Öffentliche API für manuelle Initialisierung
   */
  window.FCDrive = {
    init: init,
    initGallery: function(container) {
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      if (container) initGallery(container);
    },
    initFileList: function(container) {
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      if (container) initFileList(container);
    },
    setApiKey: function(key) {
      apiKey = key;
    }
  };

  // Automatische Initialisierung
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
