/**
 * FC Aich Kalender Integration
 * FullCalendar v6 + Google Calendar API
 *
 * Features:
 * - Google Calendar API integration
 * - Desktop: Month grid + Agenda sidebar
 * - Mobile: Month grid only (responsive)
 * - Event click modal with details
 * - Event categorization for future filtering
 * - German localization
 */

(function() {
  'use strict';

  // Konfiguration
  const CONFIG = {
    calendarEl: '#fc-calendar',
    agendaEl: '#fc-agenda',
    locale: 'de',
    firstDay: 1, // Montag
    initialView: 'dayGridMonth',
    timeZone: 'Europe/Berlin',
    breakpoint: 960, // 60em = Tachyons -l
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,listMonth'
    },
    buttonText: {
      today: 'Heute',
      month: 'Monat',
      list: 'Liste'
    },
    noEventsContent: 'Keine Termine',
    height: 'auto'
  };

  // State
  let calendar = null;
  let agendaCalendar = null;
  let apiKey = '';
  let calendarId = '';

  /**
   * Initialisierung
   */
  function init() {
    const container = document.getElementById('fc-calendar-container');
    if (!container) return;

    // Konfiguration aus data-attributes holen
    apiKey = container.dataset.apiKey;
    calendarId = container.dataset.calendarId;

    if (!apiKey || !calendarId) {
      showError('Kalender-Konfiguration fehlt');
      return;
    }

    initMainCalendar();

    if (window.innerWidth >= CONFIG.breakpoint) {
      initAgendaCalendar();
    }

    window.addEventListener('resize', debounce(handleResize, 250));
  }

  /**
   * Hauptkalender (Monatsansicht)
   */
  function initMainCalendar() {
    const calendarEl = document.querySelector(CONFIG.calendarEl);
    if (!calendarEl) return;

    calendar = new FullCalendar.Calendar(calendarEl, {
      ...CONFIG,
      googleCalendarApiKey: apiKey,
      events: {
        googleCalendarId: calendarId,
        className: 'fc-event-google',
        failure: handleEventLoadError
      },
      eventClick: handleEventClick,
      eventDidMount: prepareEventForFiltering,
      loading: handleLoading
    });

    calendar.render();
  }

  /**
   * Agenda-Sidebar (kommende Termine)
   */
  function initAgendaCalendar() {
    const agendaEl = document.querySelector(CONFIG.agendaEl);
    if (!agendaEl) return;

    agendaCalendar = new FullCalendar.Calendar(agendaEl, {
      ...CONFIG,
      initialView: 'listMonth',
      headerToolbar: {
        left: '',
        center: 'title',
        right: ''
      },
      height: 'auto',
      googleCalendarApiKey: apiKey,
      events: {
        googleCalendarId: calendarId,
        failure: handleEventLoadError
      },
      eventClick: handleEventClick
    });

    agendaCalendar.render();
  }

  /**
   * Event-Click Handler - Modal anzeigen
   */
  function handleEventClick(info) {
    info.jsEvent.preventDefault();

    const event = info.event;
    showEventModal({
      title: event.title,
      start: event.start,
      end: event.end,
      description: event.extendedProps.description || '',
      location: event.extendedProps.location || '',
      url: event.url
    });
  }

  /**
   * Event-Kategorisierung für spätere Filter vorbereiten
   * Extrahiert Mannschaft/Typ aus Event-Titel
   */
  function prepareEventForFiltering(info) {
    const event = info.event;
    const title = event.title.toLowerCase();

    // Kategorien für spätere Filterung
    const categories = [];

    // Mannschaften erkennen
    if (title.includes('herren 1') || title.includes('1. mannschaft')) {
      categories.push('herren1');
    } else if (title.includes('herren 2') || title.includes('2. mannschaft')) {
      categories.push('herren2');
    } else if (title.includes('damen')) {
      categories.push('damen');
    } else if (title.includes('jugend') || title.match(/[a-g]-jugend/)) {
      categories.push('jugend');
    } else if (title.includes('a-herren') || title.includes('ah')) {
      categories.push('ah');
    }

    // Event-Typen erkennen
    if (title.includes('training')) {
      categories.push('training');
    } else if (title.includes('spiel') || title.includes('match')) {
      categories.push('spiel');
    } else if (title.includes('vorstand') || title.includes('meeting')) {
      categories.push('meeting');
    }

    // Als data-attribute speichern für spätere Filterung
    if (categories.length > 0) {
      info.el.setAttribute('data-categories', categories.join(','));
    }
  }

  /**
   * Event-Modal anzeigen
   */
  function showEventModal(eventData) {
    // Backdrop erstellen
    const backdrop = document.createElement('div');
    backdrop.className = 'fc-event-modal-backdrop';

    // Modal erstellen
    const modal = document.createElement('div');
    modal.className = 'fc-event-modal';

    // Datum formatieren
    const dateFormatter = new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Berlin'
    });

    const dateStr = dateFormatter.format(eventData.start);

    // Modal Content
    const titleHtml = escapeHtml(eventData.title);
    const locationHtml = eventData.location ? `<div class="fc-event-modal-location">📍 ${escapeHtml(eventData.location)}</div>` : '';
    const descriptionHtml = eventData.description ? `<div class="fc-event-modal-description">${escapeHtml(eventData.description)}</div>` : '';
    const linkHtml = eventData.url ? `<a href="${eventData.url}" target="_blank" rel="noopener noreferrer" class="fc-event-modal-link">Mehr Informationen</a>` : '';

    modal.innerHTML = `
      <button class="fc-event-modal-close" aria-label="Schließen">&times;</button>
      <h2 class="fc-event-modal-title">${titleHtml}</h2>
      <div class="fc-event-modal-time">${dateStr}</div>
      ${locationHtml}
      ${descriptionHtml}
      ${linkHtml}
    `;

    // Event Listeners
    const closeBtn = modal.querySelector('.fc-event-modal-close');
    closeBtn.addEventListener('click', closeModal);

    backdrop.addEventListener('click', closeModal);

    // ESC zum Schließen
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Funktion zum Schließen
    function closeModal() {
      if (document.body.contains(backdrop)) {
        document.body.removeChild(backdrop);
      }
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
  }

  /**
   * Responsive Breakpoint Handler
   */
  function handleResize() {
    const width = window.innerWidth;

    if (width < CONFIG.breakpoint) {
      // Mobile: Agenda ausblenden
      if (agendaCalendar) {
        agendaCalendar.destroy();
        agendaCalendar = null;
      }
    } else {
      // Desktop: Agenda anzeigen
      if (!agendaCalendar) {
        initAgendaCalendar();
      }
    }
  }

  /**
   * Loading-State Handler
   */
  function handleLoading(isLoading) {
    const calendarEl = document.querySelector(CONFIG.calendarEl);
    if (!calendarEl) return;

    if (isLoading) {
      calendarEl.classList.add('fc-calendar-loading');
    } else {
      calendarEl.classList.remove('fc-calendar-loading');
    }
  }

  /**
   * Fehlerbehandlung
   */
  function showError(message) {
    const container = document.getElementById('fc-calendar-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fc-error-message">
        <h3>⚠️ ${escapeHtml(message)}</h3>
        <p>Bitte kontaktieren Sie <a href="mailto:info@fc-aich.de">info@fc-aich.de</a></p>
      </div>
    `;
  }

  function handleEventLoadError(error) {
    console.error('Event loading failed:', error);
    showError('Termine konnten nicht geladen werden');
  }

  /**
   * Utilities
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialisierung
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
