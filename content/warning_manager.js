// PhishGuard Warning Manager
// Handles display and interaction of phishing warnings

class WarningManager {
  constructor() {
    this.currentWarning = null;
    this.warningHistory = [];
    this.isWarningActive = false;
  }

  // Initialize the warning manager
  initialize() {
    try {
      console.log('PhishGuard: Warning manager initialized');
      return true;
    } catch (error) {
      console.error('PhishGuard: Failed to initialize warning manager:', error);
      return false;
    }
  }

  // Show phishing warning
  showPhishingWarning(analysisData) {
    try {
      // Don't show multiple warnings
      if (this.isWarningActive) {
        this.updateExistingWarning(analysisData);
        return;
      }

      const warning = this.createWarningElement(analysisData);
      this.displayWarning(warning, analysisData);
      
      // Track warning
      this.trackWarning(analysisData, 'shown');
      
      console.log('PhishGuard: Phishing warning displayed');
    } catch (error) {
      console.error('PhishGuard: Error showing phishing warning:', error);
    }
  }

  // Create warning element
  createWarningElement(analysisData) {
    const warningContainer = document.createElement('div');
    warningContainer.id = 'phishguard-warning-banner';
    warningContainer.style.cssText = styles.warningBanner;

    // Create warning content based on analysis
    const warningContent = this.generateWarningContent(analysisData);
    warningContainer.innerHTML = warningContent;

    return warningContainer;
  }

  // Generate warning content based on analysis data
  generateWarningContent(analysisData) {
    const confidence = Math.round(analysisData.confidence * 100);
    const riskLevel = this.getRiskLevel(analysisData.confidence);
    const warningIcon = this.getWarningIcon(riskLevel);
    
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto;">
        <div style="display: flex; align-items: center;">
          <div style="font-size: 24px; margin-right: 15px;">${warningIcon}</div>
          <div>
            <h2 style="margin: 0; font-size: 18px; font-weight: bold;">
              ${this.getWarningTitle(riskLevel)} (${confidence}% confidence)
            </h2>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">
              ${analysisData.reason}
            </p>
          </div>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="phishguard-warning-details" style="${this.getButtonStyle('secondary')}">
            More Info
          </button>
          <button id="phishguard-warning-continue" style="${this.getButtonStyle('danger')}">
            Continue Anyway
          </button>
          <button id="phishguard-warning-back" style="${this.getButtonStyle('safe')}">
            Go Back to Safety
          </button>
        </div>
      </div>
    `;
  }

  // Display warning and set up event listeners
  displayWarning(warningElement, analysisData) {
    // Remove any existing warning
    this.removeWarning();

    // Add warning to page
    document.body.insertBefore(warningElement, document.body.firstChild);
    
    // Adjust page layout to accommodate warning
    this.adjustPageLayout(true);
    
    // Set up event listeners
    this.setupWarningEventListeners(analysisData);
    
    // Auto-hide after timeout if configured
    this.setupAutoHide();
    
    this.currentWarning = warningElement;
    this.isWarningActive = true;
  }

  // Set up event listeners for warning buttons
  setupWarningEventListeners(analysisData) {
    // More info button
    const detailsBtn = document.getElementById('phishguard-warning-details');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', () => {
        this.showDetailedWarning(analysisData);
        this.trackWarning(analysisData, 'details_viewed');
      });
    }

    // Continue anyway button
    const continueBtn = document.getElementById('phishguard-warning-continue');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.handleContinueAnyway(analysisData);
      });
    }

    // Go back button
    const backBtn = document.getElementById('phishguard-warning-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.handleGoBack(analysisData);
      });
    }

    // Close button (X)
    const closeBtn = document.getElementById('phishguard-warning-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.removeWarning();
        this.trackWarning(analysisData, 'dismissed');
      });
    }

    // ESC key to close
    this.escKeyListener = (event) => {
      if (event.key === 'Escape' && this.isWarningActive) {
        this.removeWarning();
        this.trackWarning(analysisData, 'dismissed_esc');
      }
    };
    document.addEventListener('keydown', this.escKeyListener);
  }

  // Show detailed warning information
  showDetailedWarning(analysisData) {
    const detailsOverlay = document.createElement('div');
    detailsOverlay.id = 'phishguard-warning-details-overlay';
    detailsOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const detailsContent = document.createElement('div');
    detailsContent.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 30px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      color: #333;
    `;

    detailsContent.innerHTML = this.generateDetailedWarningContent(analysisData);
    detailsOverlay.appendChild(detailsContent);
    document.body.appendChild(detailsOverlay);

    // Close overlay when clicking outside
    detailsOverlay.addEventListener('click', (event) => {
      if (event.target === detailsOverlay) {
        detailsOverlay.remove();
      }
    });

    // Close button
    const closeBtn = detailsContent.querySelector('#phishguard-details-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        detailsOverlay.remove();
      });
    }
  }

  // Generate detailed warning content
  generateDetailedWarningContent(analysisData) {
    const detectionMethods = analysisData.details?.detectionMethods || [];
    const allReasons = analysisData.details?.allReasons || [analysisData.reason];

    return `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #d32f2f; margin: 0;">⚠️ Security Warning Details</h2>
        <p style="color: #666; margin: 10px 0;">This page has been flagged for potential phishing</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px;">Recommended Actions</h3>
        <div style="background: #e8f5e9; padding: 15px; border-radius: 4px; border-left: 4px solid #4caf50;">
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Go back to safety</strong> - Close this page and return to a trusted site</li>
            <li><strong>Verify independently</strong> - If this claims to be from a company you use, visit their official website directly</li>
            <li><strong>Don't enter personal information</strong> - Never provide passwords, credit card numbers, or other sensitive data</li>
            <li><strong>Report if suspicious</strong> - Help others by reporting potential phishing sites</li>
          </ul>
        </div>
      </div>

      <div style="text-align: center;">
        <button id="phishguard-details-close" style="${this.getButtonStyle('primary')}">
          Close Details
        </button>
      </div>
    `;
  }

  // Handle "Continue Anyway" action
  handleContinueAnyway(analysisData) {
    // Show additional confirmation for high-confidence detections
    if (analysisData.confidence > 0.8) {
      this.showContinueConfirmation(analysisData);
    } else {
      this.proceedWithContinue(analysisData);
    }
  }

  // Show confirmation dialog for high-risk continues
  showContinueConfirmation(analysisData) {
    const confirmationOverlay = document.createElement('div');
    confirmationOverlay.id = 'phishguard-continue-confirmation';
    confirmationOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 10002;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const confirmationContent = document.createElement('div');
    confirmationContent.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 30px;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      color: #333;
    `;

    confirmationContent.innerHTML = `
      <div style="font-size: 48px; color: #d32f2f; margin-bottom: 20px;">⚠️</div>
      <h2 style="color: #d32f2f; margin-bottom: 15px;">Are you absolutely sure?</h2>
      <p style="margin-bottom: 20px; line-height: 1.6;">
        This site has a <strong>${Math.round(analysisData.confidence * 100)}% probability</strong> of being a phishing attack.
        Continuing could put your personal information, passwords, and financial data at serious risk.
      </p>
      <div style="background: #ffebee; padding: 15px; border-radius: 4px; margin-bottom: 20px; text-align: left;">
        <strong>Detected risks:</strong><br>
        ${analysisData.reason}
      </div>
      <div style="display: flex; gap: 15px; justify-content: center;">
        <button id="phishguard-confirm-back" style="${this.getButtonStyle('safe')}" style="flex: 1;">
          Take Me Back to Safety
        </button>
        <button id="phishguard-confirm-continue" style="${this.getButtonStyle('danger')}" style="flex: 1;">
          I Understand the Risk - Continue
        </button>
      </div>
    `;

    confirmationOverlay.appendChild(confirmationContent);
    document.body.appendChild(confirmationOverlay);

    // Event listeners
    document.getElementById('phishguard-confirm-back')?.addEventListener('click', () => {
      confirmationOverlay.remove();
      this.handleGoBack(analysisData);
    });

    document.getElementById('phishguard-confirm-continue')?.addEventListener('click', () => {
      confirmationOverlay.remove();
      this.proceedWithContinue(analysisData);
    });
  }

  // Proceed with continue action
  proceedWithContinue(analysisData) {
    this.trackWarning(analysisData, 'continued_anyway');
    this.removeWarning();
    
    // Show a persistent small warning at the top
    this.showPersistentWarning(analysisData);
  }

  // Show persistent small warning
  showPersistentWarning(analysisData) {
    const persistentWarning = document.createElement('div');
    persistentWarning.id = 'phishguard-persistent-warning';
    persistentWarning.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #ff6b6b, #ee5a52);
      color: white;
      padding: 8px 15px;
      font-size: 14px;
      font-weight: 500;
      z-index: 9999;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      border-bottom: 2px solid rgba(255,255,255,0.3);
    `;

    persistentWarning.innerHTML = `
      <span style="margin-right: 10px;">⚠️</span>
      <span>PhishGuard Warning: This site may be dangerous - avoid entering personal information</span>
      <button id="phishguard-persistent-close" style="
        background: none;
        border: none;
        color: white;
        margin-left: 15px;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
      ">×</button>
    `;

    document.body.appendChild(persistentWarning);

    // Close button
    document.getElementById('phishguard-persistent-close')?.addEventListener('click', () => {
      persistentWarning.remove();
    });

    // Auto-remove after extended time
    setTimeout(() => {
      if (persistentWarning.parentNode) {
        persistentWarning.remove();
      }
    }, 30000); // 30 seconds
  }

  // Handle "Go Back" action
  handleGoBack(analysisData) {
    this.trackWarning(analysisData, 'went_back');
    
    // Try different methods to go back
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If no history, redirect to a safe page
      window.location.href = 'about:blank';
    }
  }

  // Remove current warning
  removeWarning() {
    if (this.currentWarning) {
      this.currentWarning.remove();
      this.currentWarning = null;
    }

    // Remove event listeners
    if (this.escKeyListener) {
      document.removeEventListener('keydown', this.escKeyListener);
      this.escKeyListener = null;
    }

    // Restore page layout
    this.adjustPageLayout(false);
    
    this.isWarningActive = false;
  }

  // Update existing warning with new data
  updateExistingWarning(analysisData) {
    if (!this.currentWarning) return;

    // Only update if new analysis has higher confidence
    const currentConfidence = this.getCurrentWarningConfidence();
    if (analysisData.confidence > currentConfidence) {
      const warningContent = this.generateWarningContent(analysisData);
      this.currentWarning.innerHTML = warningContent;
      this.setupWarningEventListeners(analysisData);
    }
  }

  // Adjust page layout to accommodate warning
  adjustPageLayout(hasWarning) {
    const body = document.body;
    const html = document.documentElement;

    if (hasWarning) {
      // Add top margin to push content down
      body.style.marginTop = '60px';
      html.style.marginTop = '60px';
    } else {
      // Remove top margin
      body.style.marginTop = '';
      html.style.marginTop = '';
    }
  }

  // Set up auto-hide functionality
  setupAutoHide() {
    // Only auto-hide for low-confidence warnings
    const confidence = this.getCurrentWarningConfidence();
    if (confidence < 0.6) {
      setTimeout(() => {
        if (this.isWarningActive) {
          this.removeWarning();
        }
      }, 10000); // 10 seconds
    }
  }

  // Track warning interactions
  trackWarning(analysisData, action) {
    const trackingData = {
      url: window.location.href,
      confidence: analysisData.confidence,
      reason: analysisData.reason,
      action: action,
      timestamp: new Date().toISOString()
    };

    // Add to warning history
    this.warningHistory.push(trackingData);

    // Send to background script for statistics
    chrome.runtime.sendMessage({
      action: 'trackWarningInteraction',
      data: trackingData
    });

    console.log('PhishGuard: Warning interaction tracked:', action);
  }

  // Helper methods
  getRiskLevel(confidence) {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }

  getWarningIcon(riskLevel) {
    const icons = {
      high: '🚨',
      medium: '⚠️',
      low: '🔍'
    };
    return icons[riskLevel] || '⚠️';
  }

  getWarningTitle(riskLevel) {
    const titles = {
      high: 'DANGER: Potential Phishing Site Detected',
      medium: 'WARNING: Suspicious Site Detected',
      low: 'NOTICE: Site Has Some Suspicious Indicators'
    };
    return titles[riskLevel] || 'Security Warning';
  }

  getButtonStyle(type) {
    const styles = {
      primary: `
        background-color: #4285f4;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      `,
      secondary: `
        background-color: transparent;
        color: white;
        border: 1px solid rgba(255,255,255,0.7);
        padding: 10px 20px;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      `,
      danger: `
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      `,
      safe: `
        background-color: #28a745;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      `
    };
    return styles[type] || styles.primary;
  }

  getCurrentWarningConfidence() {
    // Extract confidence from current warning if possible
    // This is a simplified version - in reality you'd store this data
    return 0.7; // Default assumption
  }

  // Get warning statistics
  getWarningStats() {
    return {
      totalWarnings: this.warningHistory.length,
      actions: this.warningHistory.reduce((acc, warning) => {
        acc[warning.action] = (acc[warning.action] || 0) + 1;
        return acc;
      }, {}),
      averageConfidence: this.warningHistory.length > 0 
        ? this.warningHistory.reduce((sum, w) => sum + w.confidence, 0) / this.warningHistory.length 
        : 0
    };
  }

  // Clean up resources
  cleanup() {
    this.removeWarning();
    
    // Remove persistent warnings
    const persistentWarning = document.getElementById('phishguard-persistent-warning');
    if (persistentWarning) {
      persistentWarning.remove();
    }

    // Remove detail overlays
    const detailsOverlay = document.getElementById('phishguard-warning-details-overlay');
    if (detailsOverlay) {
      detailsOverlay.remove();
    }

    const confirmationOverlay = document.getElementById('phishguard-continue-confirmation');
    if (confirmationOverlay) {
      confirmationOverlay.remove();
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.WarningManager = WarningManager;
}px;">
        <h3 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px;">Detection Summary</h3>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 10px 0;">
          <p><strong>URL:</strong> ${analysisData.details?.url || window.location.href}</p>
          <p><strong>Confidence:</strong> ${Math.round(analysisData.confidence * 100)}%</p>
          <p><strong>Primary Reason:</strong> ${analysisData.reason}</p>
        </div>
      </div>

      ${detectionMethods.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px;">Detection Methods</h3>
          ${detectionMethods.map(method => `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 5px 0; border-radius: 4px;">
              <strong>${method.method}:</strong> ${Math.round(method.confidence * 100)}% confidence
              ${method.details ? `<br><small style="color: #666;">${JSON.stringify(method.details)}</small>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px;">What This Means</h3>
        <div style="background: #fff3cd; padding: 15px; border-radius: 4px; border-left: 4px solid #ff9f00;">
          <p>This website has characteristics commonly associated with phishing attacks:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${allReasons.map(reason => `<li>${reason}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div style="margin-bottom: 20