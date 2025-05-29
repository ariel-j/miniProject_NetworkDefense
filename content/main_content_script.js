// PhishGuard Main Content Script
// Orchestrates all content script functionality

class PhishGuardContent {
  constructor() {
    this.pageAnalyzer = null;
    this.warningManager = null;
    this.simulationManager = null;
    this.initialized = false;
    this.currentUrl = window.location.href;
  }

  // Initialize all content script components
  async initialize() {
    try {
      console.log('PhishGuard: Initializing content script on', window.location.hostname);

      // Skip initialization for certain URLs
      if (this.shouldSkipInitialization()) {
        console.log('PhishGuard: Skipping initialization for this URL type');
        return false;
      }

      // Initialize component modules
      this.pageAnalyzer = new PageAnalyzer();
      this.warningManager = new WarningManager();
      this.simulationManager = new SimulationManager();

      // Initialize each component
      const initResults = await Promise.all([
        this.pageAnalyzer.initialize(),
        this.warningManager.initialize(),
        this.simulationManager.initialize()
      ]);

      // Check if all components initialized successfully
      if (initResults.every(result => result)) {
        this.setupMessageListeners();
        this.setupPageChangeDetection();
        this.initialized = true;
        
        console.log('PhishGuard: Content script initialized successfully');
        return true;
      } else {
        console.error('PhishGuard: Some components failed to initialize');
        return false;
      }

    } catch (error) {
      console.error('PhishGuard: Failed to initialize content script:', error);
      return false;
    }
  }

  // Set up message listeners for communication with background script
  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });
  }

  // Handle messages from background script
  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'showWarning':
          await this.handleShowWarning(message.data);
          sendResponse({ success: true });
          break;

        case 'showTrainingSimulation':
          await this.handleShowTrainingSimulation(message.data);
          sendResponse({ success: true });
          break;

        case 'getPageAnalysis':
          const analysis = this.pageAnalyzer ? this.pageAnalyzer.getAnalysisResults() : [];
          sendResponse({ analysis });
          break;

        case 'getPageContent':
          const pageContent = {
            url: window.location.href,
            title: document.title,
            content: document.body.innerText.substring(0, 5000), // First 5000 chars
            hasLoginForms: !!document.querySelector('form input[type="password"]'),
            formCount: document.querySelectorAll('form').length
          };
          sendResponse(pageContent);
          break;

        case 'analyzeCurrentPage':
          if (this.pageAnalyzer) {
            this.pageAnalyzer.analyzeCurrentPage();
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'Page analyzer not initialized' });
          }
          break;

        case 'hideWarnings':
          if (this.warningManager) {
            this.warningManager.removeWarning();
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'Warning manager not initialized' });
          }
          break;

        case 'getSimulationStats':
          const stats = this.simulationManager ? this.simulationManager.getSimulationStats() : null;
          sendResponse({ stats });
          break;

        case 'cleanup':
          this.cleanup();
          sendResponse({ success: true });
          break;

        default:
          console.warn('PhishGuard: Unknown message action:', message.action);
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('PhishGuard: Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  // Handle showing phishing warning
  async handleShowWarning(warningData) {
    try {
      if (!this.warningManager) {
        console.error('PhishGuard: Warning manager not initialized');
        return;
      }

      this.warningManager.showPhishingWarning(warningData);
      
      // Log warning for debugging
      console.log('PhishGuard: Phishing warning displayed:', warningData.reason);

    } catch (error) {
      console.error('PhishGuard: Error showing warning:', error);
    }
  }

  // Handle showing training simulation
  async handleShowTrainingSimulation(simulationData) {
    try {
      if (!this.simulationManager) {
        console.error('PhishGuard: Simulation manager not initialized');
        return;
      }

      this.simulationManager.showTrainingSimulation(simulationData);
      
      // Log simulation for debugging
      console.log('PhishGuard: Training simulation shown:', simulationData.type);

    } catch (error) {
      console.error('PhishGuard: Error showing training simulation:', error);
    }
  }

  // Set up detection for page changes (SPA navigation)
  setupPageChangeDetection() {
    // Watch for URL changes (important for SPAs)
    let lastUrl = window.location.href;
    
    const checkUrlChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        this.handlePageChange();
      }
    };

    // Check for URL changes periodically
    setInterval(checkUrlChange, 1000);

    // Listen for history changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => this.handlePageChange(), 100);
    }.bind(this);

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => this.handlePageChange(), 100);
    }.bind(this);

    // Listen for popstate events
    window.addEventListener('popstate', () => {
      setTimeout(() => this.handlePageChange(), 100);
    });
  }

  // Handle page changes (for SPAs)
  handlePageChange() {
    if (!this.initialized) return;

    const newUrl = window.location.href;
    if (newUrl !== this.currentUrl) {
      console.log('PhishGuard: Page changed to', newUrl);
      this.currentUrl = newUrl;

      // Clean up existing warnings/simulations
      this.cleanup(false); // Don't full cleanup, just clear current items

      // Re-analyze the new page
      if (this.pageAnalyzer) {
        setTimeout(() => {
          this.pageAnalyzer.analyzeCurrentPage();
        }, 500); // Small delay to let page content load
      }

      // Notify background script of page change
      chrome.runtime.sendMessage({
        action: 'pageChanged',
        url: newUrl,
        previousUrl: this.currentUrl
      });
    }
  }

  // Check if initialization should be skipped for certain URLs
  shouldSkipInitialization() {
    const url = window.location.href;
    const skipPatterns = [
      /^chrome:/i,
      /^chrome-extension:/i,
      /^moz-extension:/i,
      /^about:/i,
      /^file:/i,
      /^data:/i,
      /^blob:/i
    ];

    return skipPatterns.some(pattern => pattern.test(url));
  }

  // Perform periodic health checks on components
  performHealthCheck() {
    const health = {
      pageAnalyzer: this.pageAnalyzer && typeof this.pageAnalyzer.getAnalysisResults === 'function',
      warningManager: this.warningManager && typeof this.warningManager.showPhishingWarning === 'function', 
      simulationManager: this.simulationManager && typeof this.simulationManager.showTrainingSimulation === 'function',
      initialized: this.initialized,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Report health status to background script occasionally
    if (Math.random() < 0.1) { // 10% chance
      chrome.runtime.sendMessage({
        action: 'healthCheck',
        health
      });
    }

    return health;
  }

  // Get comprehensive status information
  getStatus() {
    return {
      initialized: this.initialized,
      currentUrl: this.currentUrl,
      components: {
        pageAnalyzer: {
          available: !!this.pageAnalyzer,
          analysisResults: this.pageAnalyzer ? this.pageAnalyzer.getAnalysisResults().length : 0
        },
        warningManager: {
          available: !!this.warningManager,
          warningActive: this.warningManager ? this.warningManager.isWarningActive : false
        },
        simulationManager: {
          available: !!this.simulationManager,
          simulationActive: this.simulationManager ? this.simulationManager.isSimulationActive : false
        }
      },
      pageInfo: {
        title: document.title,
        hasLoginForms: !!document.querySelector('form input[type="password"]'),
        formCount: document.querySelectorAll('form').length,
        isHTTPS: window.location.protocol === 'https:'
      }
    };
  }

  // Clean up all components
  cleanup(fullCleanup = true) {
    try {
      // Clean up component resources
      if (this.pageAnalyzer && typeof this.pageAnalyzer.cleanup === 'function') {
        this.pageAnalyzer.cleanup();
      }

      if (this.warningManager && typeof this.warningManager.cleanup === 'function') {
        this.warningManager.cleanup();
      }

      if (this.simulationManager && typeof this.simulationManager.cleanup === 'function') {
        this.simulationManager.cleanup();
      }

      if (fullCleanup) {
        // Full cleanup - reset everything
        this.pageAnalyzer = null;
        this.warningManager = null;
        this.simulationManager = null;
        this.initialized = false;
        
        console.log('PhishGuard: Content script fully cleaned up');
      } else {
        // Partial cleanup - just clear current warnings/simulations
        console.log('PhishGuard: Content script partially cleaned up');
      }

    } catch (error) {
      console.error('PhishGuard: Error during cleanup:', error);
    }
  }

  // Handle page unload
  handlePageUnload() {
    // Send any pending data to background script
    const status = this.getStatus();
    
    chrome.runtime.sendMessage({
      action: 'pageUnload',
      status,
      url: window.location.href
    });

    // Quick cleanup
    this.cleanup();
  }

  // Emergency fallback function for critical errors
  emergencyFallback(error) {
    console.error('PhishGuard: Emergency fallback triggered:', error);
    
    try {
      // Remove any visible PhishGuard elements that might be broken
      const phishguardElements = document.querySelectorAll('[id^="phishguard-"]');
      phishguardElements.forEach(element => {
        element.remove();
      });

      // Reset initialization state
      this.initialized = false;

      // Notify background script of the error
      chrome.runtime.sendMessage({
        action: 'emergencyFallback',
        error: error.message,
        stack: error.stack,
        url: window.location.href
      });

    } catch (fallbackError) {
      console.error('PhishGuard: Emergency fallback also failed:', fallbackError);
    }
  }

  // Debug function to get detailed information
  getDebugInfo() {
    return {
      version: chrome.runtime.getManifest().version,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      status: this.getStatus(),
      health: this.performHealthCheck(),
      pageInfo: {
        title: document.title,
        readyState: document.readyState,
        characterSet: document.characterSet,
        contentType: document.contentType,
        lastModified: document.lastModified,
        referrer: document.referrer
      },
      domInfo: {
        forms: document.querySelectorAll('form').length,
        inputs: document.querySelectorAll('input').length,
        links: document.querySelectorAll('a').length,
        scripts: document.querySelectorAll('script').length,
        iframes: document.querySelectorAll('iframe').length
      }
    };
  }
}

// Global error handler for content script
window.addEventListener('error', (event) => {
  console.error('PhishGuard: Global error in content script:', event.error);
  
  if (window.phishGuardContent && typeof window.phishGuardContent.emergencyFallback === 'function') {
    window.phishGuardContent.emergencyFallback(event.error);
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('PhishGuard: Unhandled promise rejection in content script:', event.reason);
  
  if (window.phishGuardContent && typeof window.phishGuardContent.emergencyFallback === 'function') {
    window.phishGuardContent.emergencyFallback(new Error(event.reason));
  }
});

// Initialize PhishGuard content script
async function initializePhishGuard() {
  try {
    // Wait for required classes to be available
    if (typeof PageAnalyzer === 'undefined' || 
        typeof WarningManager === 'undefined' || 
        typeof SimulationManager === 'undefined') {
      console.error('PhishGuard: Required classes not loaded');
      return;
    }

    // Create and initialize the main content script
    const phishGuardContent = new PhishGuardContent();
    const initialized = await phishGuardContent.initialize();

    if (initialized) {
      // Make globally available for debugging
      window.phishGuardContent = phishGuardContent;

      // Set up page unload handler
      window.addEventListener('beforeunload', () => {
        phishGuardContent.handlePageUnload();
      });

      // Periodic health checks (every 5 minutes)
      setInterval(() => {
        if (phishGuardContent.initialized) {
          phishGuardContent.performHealthCheck();
        }
      }, 5 * 60 * 1000);

      console.log('PhishGuard: Successfully initialized and ready');

    } else {
      console.error('PhishGuard: Failed to initialize content script');
    }

  } catch (error) {
    console.error('PhishGuard: Critical error during initialization:', error);
  }
}

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePhishGuard);
} else {
  // DOM is already loaded
  initializePhishGuard();
}

// Also initialize when all resources are loaded (fallback)
if (document.readyState !== 'complete') {
  window.addEventListener('load', () => {
    // Only initialize if not already done
    if (!window.phishGuardContent || !window.phishGuardContent.initialized) {
      console.log('PhishGuard: Fallback initialization on window load');
      initializePhishGuard();
    }
  });
}

// Debug helper functions (available in console)
window.phishGuardDebug = {
  getStatus: () => window.phishGuardContent ? window.phishGuardContent.getStatus() : 'Not initialized',
  getDebugInfo: () => window.phishGuardContent ? window.phishGuardContent.getDebugInfo() : 'Not initialized',
  cleanup: () => window.phishGuardContent ? window.phishGuardContent.cleanup() : 'Not initialized',
  reinitialize: () => initializePhishGuard()
};