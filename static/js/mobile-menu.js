/**
 * Mobile Off-Canvas Menu
 * FC Aich Website
 *
 * Features:
 * - Toggle mobile menu overlay
 * - Handle dropdown submenus on mobile
 * - Focus trapping when menu is open
 * - Keyboard navigation (ESC to close)
 * - Prevent body scroll when menu is open
 * - Accessible ARIA attributes
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    breakpoint: 960, // 60em = 960px (Tachyons -l breakpoint)
    transitionDuration: 400, // Must match CSS transition duration
    focusTrapEnabled: true,
    closeOnLinkClick: true,
  };

  // State
  let isMenuOpen = false;
  let focusableElements = [];
  let firstFocusableElement = null;
  let lastFocusableElement = null;

  // DOM Elements (initialized after DOM loaded)
  let menuToggleButton = null;
  let menuCloseButton = null;
  let menuOverlay = null;
  let dropdownToggles = [];

  /**
   * Initialize the mobile menu
   */
  function init() {
    // Get DOM elements
    menuToggleButton = document.getElementById('mobile-menu-toggle');
    menuCloseButton = document.getElementById('mobile-menu-close');
    menuOverlay = document.getElementById('mobile-menu-overlay');

    // Exit if elements not found
    if (!menuToggleButton || !menuCloseButton || !menuOverlay) {
      console.warn('Mobile menu elements not found');
      return;
    }

    // Setup event listeners
    setupEventListeners();

    // Setup dropdown toggles
    setupDropdownToggles();

    // Handle window resize
    handleResize();
    window.addEventListener('resize', debounce(handleResize, 150));
  }

  /**
   * Setup event listeners for menu controls
   */
  function setupEventListeners() {
    // Toggle button click
    menuToggleButton.addEventListener('click', handleToggleClick);

    // Close button click
    menuCloseButton.addEventListener('click', handleCloseClick);

    // Overlay click (close when clicking outside menu content)
    menuOverlay.addEventListener('click', handleOverlayClick);

    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);

    // Menu links click (optional: close menu on navigation)
    if (CONFIG.closeOnLinkClick) {
      const menuLinks = menuOverlay.querySelectorAll('a[href]');
      menuLinks.forEach(link => {
        link.addEventListener('click', handleLinkClick);
      });
    }
  }

  /**
   * Setup dropdown toggle buttons
   */
  function setupDropdownToggles() {
    const dropdownItems = menuOverlay.querySelectorAll('.nav-item.has-dropdown');

    dropdownItems.forEach(item => {
      const toggleButton = item.querySelector('.dropdown-toggle-mobile');

      if (toggleButton) {
        toggleButton.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          toggleDropdown(item, toggleButton);
        });

        dropdownToggles.push({ item, button: toggleButton });
      }
    });
  }

  /**
   * Toggle dropdown open/closed
   */
  function toggleDropdown(item, button) {
    const isOpen = item.classList.contains('is-open');

    // Close other dropdowns
    dropdownToggles.forEach(dropdown => {
      if (dropdown.item !== item) {
        dropdown.item.classList.remove('is-open');
        dropdown.button.setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle current dropdown
    if (isOpen) {
      item.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', button.getAttribute('aria-label').replace('schließen', 'öffnen'));
    } else {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', button.getAttribute('aria-label').replace('öffnen', 'schließen'));
    }
  }

  /**
   * Handle toggle button click
   */
  function handleToggleClick(e) {
    e.preventDefault();
    openMenu();
  }

  /**
   * Handle close button click
   */
  function handleCloseClick(e) {
    e.preventDefault();
    closeMenu();
  }

  /**
   * Handle overlay click (close if clicking backdrop)
   */
  function handleOverlayClick(e) {
    // Only close if clicking directly on overlay (not menu content)
    if (e.target === menuOverlay) {
      closeMenu();
    }
  }

  /**
   * Handle keyboard events
   */
  function handleKeyDown(e) {
    // ESC key closes menu
    if (e.key === 'Escape' && isMenuOpen) {
      closeMenu();
      menuToggleButton.focus();
    }

    // Tab key for focus trapping
    if (e.key === 'Tab' && isMenuOpen && CONFIG.focusTrapEnabled) {
      handleFocusTrap(e);
    }
  }

  /**
   * Handle menu link clicks
   */
  function handleLinkClick(e) {
    // Close menu after short delay (allow navigation to start)
    setTimeout(() => {
      closeMenu();
    }, 100);
  }

  /**
   * Open the mobile menu
   */
  function openMenu() {
    if (isMenuOpen) return;

    isMenuOpen = true;

    // Update button state
    menuToggleButton.classList.add('is-active');
    menuToggleButton.setAttribute('aria-expanded', 'true');

    // Show overlay
    menuOverlay.classList.add('is-active');
    menuOverlay.setAttribute('aria-hidden', 'false');

    // Prevent body scroll
    document.body.classList.add('mobile-menu-open');

    // Setup focus trap
    if (CONFIG.focusTrapEnabled) {
      setupFocusTrap();
    }

    // Focus first element after animation
    setTimeout(() => {
      if (firstFocusableElement) {
        firstFocusableElement.focus();
      }
    }, CONFIG.transitionDuration);
  }

  /**
   * Close the mobile menu
   */
  function closeMenu() {
    if (!isMenuOpen) return;

    isMenuOpen = false;

    // Update button state
    menuToggleButton.classList.remove('is-active');
    menuToggleButton.setAttribute('aria-expanded', 'false');

    // Hide overlay
    menuOverlay.classList.remove('is-active');
    menuOverlay.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.classList.remove('mobile-menu-open');

    // Close all dropdowns
    dropdownToggles.forEach(dropdown => {
      dropdown.item.classList.remove('is-open');
      dropdown.button.setAttribute('aria-expanded', 'false');
    });
  }

  /**
   * Setup focus trap for accessibility
   */
  function setupFocusTrap() {
    // Get all focusable elements in menu
    focusableElements = menuOverlay.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      firstFocusableElement = focusableElements[0];
      lastFocusableElement = focusableElements[focusableElements.length - 1];
    }
  }

  /**
   * Handle focus trapping with Tab key
   */
  function handleFocusTrap(e) {
    if (focusableElements.length === 0) return;

    if (e.shiftKey) {
      // Shift + Tab: going backwards
      if (document.activeElement === firstFocusableElement) {
        e.preventDefault();
        lastFocusableElement.focus();
      }
    } else {
      // Tab: going forwards
      if (document.activeElement === lastFocusableElement) {
        e.preventDefault();
        firstFocusableElement.focus();
      }
    }
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    const windowWidth = window.innerWidth;

    // Close menu if resizing to desktop view
    if (windowWidth >= CONFIG.breakpoint && isMenuOpen) {
      closeMenu();
    }
  }

  /**
   * Debounce utility function
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

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
