// PhishGuard content script
// This runs in the context of web pages

// Global state
let simulationActive = false;
let currentSimulation = null;
const DOM_IDS = {
  warningBanner: 'phishguard-warning-banner',
  simulationBanner: 'phishguard-simulation-banner',
  simulationOverlay: 'phishguard-simulation-overlay'
};

function initialize() {
  console.log('PhishGuard content script initialized');
  analyzePageContent();
  setupMutationObserver();
}

function analyzePageContent() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    const passwordFields = form.querySelectorAll('input[type="password"]');
    const emailFields = form.querySelectorAll('input[type="email"], input[name*="email"], input[id*="email"]');

    if (passwordFields.length > 0 && emailFields.length > 0) {
      checkLoginFormSecurity(form);
    }
  });
  checkForSuspiciousContent();
}

function checkLoginFormSecurity(form) {
  const action = form.getAttribute('action');
  if (action && action.startsWith('http:')) {
    reportSecurityIssue('Login form submits data over insecure HTTP');
  }

  // Check if the form goes to a different domain
  if (action && action.includes('://')) {
    try {
      const actionUrl = new URL(action);
      const currentUrl = new URL(window.location.href);

      if (actionUrl.hostname !== currentUrl.hostname) {
        reportSecurityIssue('Login form submits to a different domain');
      }
    } catch (e) {
      console.error('Error parsing form action URL:', e);
    }
  }
}

function checkForSuspiciousContent() {
  const pageText = document.body.innerText.toLowerCase();

  // Check for urgency keywords
  const urgencyKeywords = [
    'urgent', 'immediately', 'alert', 'warning', 'limited time',
    'account suspended', 'unauthorized', 'suspicious activity'
  ];

  for (const keyword of urgencyKeywords) {
    if (pageText.includes(keyword)) {
      reportSecurityIssue(`Page contains urgency language: "${keyword}"`);
      break;
    }
  }

  // Check for security claim keywords
  const securityKeywords = [
    'verify your account', 'confirm your identity', 'security check',
    'secure your account', 'update your information', 'validation required'
  ];

  for (const keyword of securityKeywords) {
    if (pageText.includes(keyword)) {
      reportSecurityIssue(`Page contains security claims: "${keyword}"`);
      break;
    }
  }

  // Check for financial bait keywords
  const financialKeywords = [
    'you won', 'congratulations', 'claim your prize', 'free offer',
    'lottery', 'winner', 'reward', 'gift card', 'discount'
  ];

  for (const keyword of financialKeywords) {
    if (pageText.includes(keyword)) {
      reportSecurityIssue(`Page contains financial bait: "${keyword}"`);
      break;
    }
  }
}

function reportSecurityIssue(issue) {
  chrome.runtime.sendMessage({
    action: 'reportSecurityIssue',
    url: window.location.href,
    issue: issue
  });
}

function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    // Check if significant changes were made that warrant re-analysis
    let shouldReanalyze = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added element is a form or contains a form
            if (node.tagName === 'FORM' || node.querySelector('form')) {
              shouldReanalyze = true;
              break;
            }
          }
        }
      }

      if (shouldReanalyze) break;
    }

    if (shouldReanalyze) {
      analyzePageContent();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function showPhishingWarning(data) {
  removePhishingWarning();

  // Create warning banner
  const banner = document.createElement('div');
  banner.id = DOM_IDS.warningBanner;
  banner.style.cssText = styles.warningBanner;

  const content = document.createElement('div');
  content.innerHTML = templates.simulationFeedback(fellForIt, currentSimulation.type);

  banner.appendChild(content);
  document.body.prepend(banner);

  // Add event listeners to buttons
  document.getElementById('phishguard-simulation-learn').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: 'openLearningResource',
      simulationType: currentSimulation.type
    });
    removeFeedbackBanner();
  });

  document.getElementById('phishguard-simulation-dismiss').addEventListener('click', () => {
    removeFeedbackBanner();
  });

  // Report the result to the background script
  chrome.runtime.sendMessage({
    action: 'trainingResult',
    simulationType: currentSimulation.type,
    fell: fellForIt
  });

  // Reset simulation state
  simulationActive = false;
  currentSimulation = null;
}

// Remove the feedback banner
function removeFeedbackBanner() {
  const banner = document.getElementById(DOM_IDS.simulationBanner);
  if (banner) {
    banner.remove();
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showWarning') {
    showPhishingWarning(message.data);
    sendResponse({ success: true });
  } else if (message.action === 'showTrainingSimulation') {
    showTrainingSimulation(message.data);
    sendResponse({ success: true });
  }

  return true; // Required for async sendResponse
});

// Initialize content script when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
  content.innerHTML = templates.phishingWarning(data);

  banner.appendChild(content);
  document.body.prepend(banner);

  // Add event listeners to buttons
  document.getElementById('phishguard-warning-continue').addEventListener('click', () => {
    removePhishingWarning();
  });

  document.getElementById('phishguard-warning-back').addEventListener('click', () => {
    window.history.back();
  });


function removePhishingWarning() {
  const banner = document.getElementById(DOM_IDS.warningBanner);
  if (banner) {
    banner.remove();
  }
}

function showTrainingSimulation(simulation) {
  // Don't show simulation if one is already active
  if (simulationActive) return;

  simulationActive = true;
  currentSimulation = simulation;

  // Create simulation overlay
  const overlay = document.createElement('div');
  overlay.id = DOM_IDS.simulationOverlay;
  overlay.style.cssText = styles.simulationOverlay;

  // Choose a simulation template based on the type
  let simulationContent = '';

  switch (simulation.type) {
    case 'urgencyTactics':
      simulationContent = templates.urgencySimulation();
      break;
    case 'loginFormSpoofing':
      simulationContent = templates.loginFormSimulation();
      break;
    case 'misspelledDomains':
      simulationContent = templates.misspelledDomainSimulation();
      break;
    case 'securityFalseClaims':
      simulationContent = templates.securityClaimsSimulation();
      break;
    case 'financialBait':
      simulationContent = templates.financialBaitSimulation();
      break;
    default:
      simulationContent = templates.genericSimulation();
      break;
  }

  overlay.innerHTML = simulationContent;
  document.body.appendChild(overlay);

  // Add event listeners to simulation elements
  setupSimulationEventListeners(simulation.type);
}

// Set up event listeners for the simulation
function setupSimulationEventListeners(simulationType) {
  // Add overlay click event to close it if clicked outside the container
  document.getElementById(DOM_IDS.simulationOverlay).addEventListener('click', (event) => {
    if (event.target.id === DOM_IDS.simulationOverlay) {
      endSimulation(false);
    }
  });

  // Add click events to all action buttons in the simulation
  const actionButtons = document.querySelectorAll('.phishguard-simulation-action-button');
  actionButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      endSimulation(true);
    });
  });

  // For login form simulations, add form submit handler
  const loginForm = document.getElementById('phishguard-simulation-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      endSimulation(true);
    });
  }
}

// End the simulation and show feedback
function endSimulation(fellForIt) {
  // Remove the simulation overlay
  const overlay = document.getElementById(DOM_IDS.simulationOverlay);
  if (overlay) {
    overlay.remove();
  }

  // Create feedback banner
  const banner = document.createElement('div');
  banner.id = DOM_IDS.simulationBanner;
  banner.style.cssText = fellForIt ? styles.simulationBannerFail : styles.simulationBannerSuccess;

  const content = document.createElement('div');
}
