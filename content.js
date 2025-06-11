// PhishGuard Content Script
// Simplified version that handles warnings and simulations

let simulationActive = false; //<------------- weird bug
let currentSimulation = null;

// Initialize content script
function initialize() {
  console.log('PhishGuard: Content script initialized on', window.location.hostname);
  
  // Skip initialization for certain URLs
  if (shouldSkipUrl(window.location.href)) {
    return;
  }
  
  checkCurrentUrlForPhishing();
  // Basic page analysis
  analyzePageContent();
}

// Check if URL should be skipped
function shouldSkipUrl(url) {
  const skipPatterns = [
    /^chrome:/i, /^chrome-extension:/i, /^moz-extension:/i,
    /^about:/i, /^file:/i, /^data:/i
  ];
  return skipPatterns.some(pattern => pattern.test(url));
}

// Basic page content analysis
function analyzePageContent() {
  try {
    // Check for login forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const passwordFields = form.querySelectorAll('input[type="password"]');
      const emailFields = form.querySelectorAll('input[type="email"], input[name*="email"]');
      
      if (passwordFields.length > 0 && emailFields.length > 0) {
        checkLoginFormSecurity(form);
      }
    });
    
    // Check for suspicious content
    checkForSuspiciousContent();
  } catch (error) {
    console.error('PhishGuard: Error analyzing page content:', error);
  }
}

async function checkCurrentUrlForPhishing() {
  try {
    console.log('PhishGuard: Checking current URL for phishing threats...');
    
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeUrl',
      url: window.location.href
    });
    
    console.log('PhishGuard: URL analysis result:', response);
    
    if (response && response.isPhishing) {
      showPhishingWarning(response);
    }
    
  } catch (error) {
    console.error('PhishGuard: Error checking URL:', error);
  }
}

function showPhishingWarning(result) {
  const warning = document.createElement('div');
  warning.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; background: red; color: white; 
                padding: 15px; text-align: center; z-index: 999999; font-weight: bold;">
      ⚠️ PHISHING ALERT: ${result.reason} (${Math.round(result.confidence * 100)}% confidence)
      <button onclick="this.parentElement.parentElement.remove()" style="margin-left: 20px;">X</button>
    </div>
  `;
  document.body.insertBefore(warning, document.body.firstChild);
}
// Check login form security
function checkLoginFormSecurity(form) {
  const action = form.getAttribute('action');
  if (action && action.startsWith('http:')) {
    reportSecurityIssue('Login form submits data over insecure HTTP');
  }
  
  if (action && action.includes('://')) {
    try {
      const actionUrl = new URL(action);
      const currentUrl = new URL(window.location.href);
      
      if (actionUrl.hostname !== currentUrl.hostname) {
        reportSecurityIssue('Login form submits to a different domain');
      }
    } catch (e) {
      console.error('PhishGuard: Error parsing form action URL:', e);
    }
  }
}

// Check for suspicious content
function checkForSuspiciousContent() {
  const pageText = document.body.innerText.toLowerCase();
  
  const urgencyKeywords = [
    'urgent', 'immediately', 'alert', 'warning', 'limited time',
    'account suspended', 'unauthorized', 'suspicious activity'
  ];
  
  const foundKeywords = urgencyKeywords.filter(keyword => pageText.includes(keyword));
  
  if (foundKeywords.length > 2) {
    reportSecurityIssue(`Page contains urgency language: ${foundKeywords.slice(0, 3).join(', ')}`);
  }
}

// Report security issue
function reportSecurityIssue(issue) {
  chrome.runtime.sendMessage({
    action: 'reportSecurityIssue',
    url: window.location.href,
    issue: issue
  });
}

// Show phishing warning
function showPhishingWarning(data) {
  removePhishingWarning(); // Remove any existing warning
  
  const banner = document.createElement('div');
  banner.id = 'phishguard-warning-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #ff3b30;
    color: white;
    padding: 15px;
    text-align: center;
    z-index: 9999;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  `;
  
  banner.innerHTML = `
    <h2 style="margin: 0; font-size: 18px;">⚠️ Potential Phishing Site Detected</h2>
    <p style="margin: 10px 0; font-size: 14px;">
      ${data.reason} (Confidence: ${Math.round(data.confidence * 100)}%)
    </p>
    <div>
      <button id="phishguard-warning-continue" style="
        background-color: white;
        color: #ff3b30;
        border: none;
        padding: 8px 15px;
        margin-right: 10px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">Continue Anyway</button>
      <button id="phishguard-warning-back" style="
        background-color: #0078d7;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">Go Back to Safety</button>
    </div>
  `;
  
  document.body.prepend(banner);
  
  // Add event listeners
  document.getElementById('phishguard-warning-continue')?.addEventListener('click', () => {
    removePhishingWarning();
  });
  
  document.getElementById('phishguard-warning-back')?.addEventListener('click', () => {
    window.history.back();
  });
}

// Remove phishing warning
function removePhishingWarning() {
  const banner = document.getElementById('phishguard-warning-banner');
  if (banner) {
    banner.remove();
  }
}

// Show training simulation
function showTrainingSimulation(simulation) {
  if (simulationActive) return;
  
  simulationActive = true;
  currentSimulation = simulation;
  
  const overlay = document.createElement('div');
  overlay.id = 'phishguard-simulation-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  const simulationContent = getSimulationContent(simulation.type);
  overlay.innerHTML = simulationContent;
  
  document.body.appendChild(overlay);
  
  // Set up event listeners
  setupSimulationEventListeners();
}

// Get simulation content based on type
function getSimulationContent(type) {
  const templates = {
    urgencyTactics: () => `
      <div style="background-color: white; max-width: 500px; margin: 50px auto; border-radius: 8px; box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3); overflow: hidden; font-family: Arial, sans-serif;">
        <div style="background-color: #d32f2f; color: white; padding: 15px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">⚠️ URGENT: Security Alert</h2>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">
            Your account has been temporarily limited due to suspicious activity. Immediate action is required to prevent account suspension.
          </p>
          <div style="margin-top: 25px; text-align: center;">
            <button class="phishguard-simulation-action-button" style="background-color: #d32f2f; color: white; border: none; padding: 12px 20px; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer;">
              Verify Account Now
            </button>
          </div>
        </div>
      </div>
    `,
    
    loginFormSpoofing: () => `
      <div style="background-color: white; max-width: 400px; margin: 50px auto; border-radius: 8px; box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3); overflow: hidden; font-family: Arial, sans-serif;">
        <div style="background-color: #4285f4; padding: 20px; text-align: center; color: white;">
          <div style="font-size: 20px; font-weight: bold;">Sign In</div>
        </div>
        <div style="padding: 20px;">
          <form id="phishguard-simulation-login-form">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #5f6368;">Email</label>
              <input type="email" style="width: 100%; padding: 10px; border: 1px solid #dadce0; border-radius: 4px; font-size: 16px; box-sizing: border-box;" placeholder="Enter your email">
            </div>
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #5f6368;">Password</label>
              <input type="password" style="width: 100%; padding: 10px; border: 1px solid #dadce0; border-radius: 4px; font-size: 16px; box-sizing: border-box;" placeholder="Enter your password">
            </div>
            <div style="text-align: center;">
              <button type="submit" class="phishguard-simulation-action-button" style="background-color: #4285f4; color: white; border: none; padding: 12px 20px; width: 100%; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer;">
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    `,
    
    financialBait: () => `
      <div style="background-color: white; max-width: 450px; margin: 50px auto; border-radius: 8px; box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3); overflow: hidden; font-family: Arial, sans-serif;">
        <div style="background-color: #4caf50; padding: 15px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 22px;">🎉 Congratulations! You've Won! 🎉</h2>
        </div>
        <div style="padding: 25px; text-align: center;">
          <div style="font-size: 64px; margin-bottom: 15px;">💰</div>
          <div style="font-size: 28px; font-weight: bold; margin-bottom: 15px; color: #2e7d32;">
            YOU'VE WON $1,000!
          </div>
          <p style="font-size: 15px; line-height: 1.5; margin-bottom: 25px; color: #333;">
            You've been selected as our lucky visitor! Click below to claim your prize now.
          </p>
          <button class="phishguard-simulation-action-button" style="background-color: #4caf50; color: white; border: none; padding: 12px 30px; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer;">
            Claim Your Prize
          </button>
        </div>
      </div>
    `
  };
  
  const template = templates[type] || templates.urgencyTactics;
  return template();
}

// Set up simulation event listeners
function setupSimulationEventListeners() {
  const overlay = document.getElementById('phishguard-simulation-overlay');
  if (!overlay) return;
  
  // Click outside to close (safe action)
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      endSimulation(false);
    }
  });
  
  // Action buttons (dangerous actions)
  const actionButtons = overlay.querySelectorAll('.phishguard-simulation-action-button');
  actionButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      endSimulation(true);
    });
  });
  
  // Form submission (dangerous action)
  const loginForm = document.getElementById('phishguard-simulation-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      endSimulation(true);
    });
  }
  
  // ESC key to close (safe action)
  document.addEventListener('keydown', handleEscKey);
}

// Handle ESC key
function handleEscKey(event) {
  if (event.key === 'Escape' && simulationActive) {
    endSimulation(false);
  }
}

// End simulation
function endSimulation(fellForIt) {
  try {
    // Remove simulation overlay
    const overlay = document.getElementById('phishguard-simulation-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', handleEscKey);
    
    // Show feedback
    showSimulationFeedback(fellForIt);
    
    // Report results to background script
    chrome.runtime.sendMessage({
      action: 'trainingResult',
      simulationType: currentSimulation?.type || 'unknown',
      fell: fellForIt
    });
    
    console.log('PhishGuard: Simulation ended -', fellForIt ? 'User fell for it' : 'User avoided it');
    
  } catch (error) {
    console.error('PhishGuard: Error ending simulation:', error);
  } finally {
    simulationActive = false;
    currentSimulation = null;
  }
}

// Show simulation feedback
function showSimulationFeedback(fellForIt) {
  const feedbackBanner = document.createElement('div');
  feedbackBanner.id = 'phishguard-simulation-feedback';
  feedbackBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: ${fellForIt ? '#ff3b30' : '#34c759'};
    color: white;
    padding: 15px;
    text-align: center;
    z-index: 9999;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  `;
  
  feedbackBanner.innerHTML = `
    <h2 style="margin: 0; font-size: 18px;">
      ${fellForIt ? '⚠️ Phishing Simulation - You Clicked!' : '✓ Good Job! You Avoided the Phishing Attempt'}
    </h2>
    <p style="margin: 10px 0; font-size: 14px;">
      ${fellForIt 
        ? 'This was a training simulation by PhishGuard. In a real phishing attempt, your information could have been stolen.' 
        : 'This was a training simulation by PhishGuard. You correctly avoided interacting with suspicious content.'}
    </p>
    <div>
      <button id="phishguard-simulation-learn" style="
        background-color: white;
        color: ${fellForIt ? '#ff3b30' : '#34c759'};
        border: none;
        padding: 8px 15px;
        margin-right: 10px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">Learn More</button>
      <button id="phishguard-simulation-dismiss" style="
        background-color: transparent;
        color: white;
        border: 1px solid white;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">Dismiss</button>
    </div>
  `;
  
  document.body.prepend(feedbackBanner);
  
  // Add event listeners
  document.getElementById('phishguard-simulation-learn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: 'openLearningResource',
      simulationType: currentSimulation?.type || 'urgencyTactics'
    });
    removeFeedbackBanner();
  });
  
  document.getElementById('phishguard-simulation-dismiss')?.addEventListener('click', () => {
    removeFeedbackBanner();
  });
  
  // Auto-remove feedback after delay
  setTimeout(() => {
    removeFeedbackBanner();
  }, 8000);
}

// Remove feedback banner
function removeFeedbackBanner() {
  const banner = document.getElementById('phishguard-simulation-feedback');
  if (banner) {
    banner.remove();
  }
}

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.action) {
      case 'showWarning':
        showPhishingWarning(message.data);
        sendResponse({ success: true });
        break;
        
      case 'showTrainingSimulation':
        showTrainingSimulation(message.data);
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
  
  return true; // Keep message channel open
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

console.log('PhishGuard: Content script loaded');