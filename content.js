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

  const content = document.createElement('div');
  content.innerHTML = `
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

  banner.appendChild(content);
  document.body.prepend(banner);

  // Add event listeners to buttons
  document.getElementById('phishguard-warning-continue').addEventListener('click', () => {
    removePhishingWarning();
  });

  document.getElementById('phishguard-warning-back').addEventListener('click', () => {
    window.history.back();
  });
}

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

  // Choose a simulation template based on the type
  let simulationContent = '';

  switch (simulation.type) {
    case 'urgencyTactics':
      simulationContent = createUrgencySimulation();
      break;
    case 'loginFormSpoofing':
      simulationContent = createLoginFormSimulation();
      break;
    case 'misspelledDomains':
      simulationContent = createMisspelledDomainSimulation();
      break;
    case 'securityFalseClaims':
      simulationContent = createSecurityClaimsSimulation();
      break;
    case 'financialBait':
      simulationContent = createFinancialBaitSimulation();
      break;
    default:
      simulationContent = createGenericSimulation();
      break;
  }

  overlay.innerHTML = simulationContent;
  document.body.appendChild(overlay);

  // Add event listeners to simulation elements
  setupSimulationEventListeners(simulation.type);
}

// Create a simulation for urgency tactics
function createUrgencySimulation() {
  return `
    <div class="phishguard-simulation-container" style="
      background-color: white;
      max-width: 500px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: #d32f2f;
        color: white;
        padding: 15px;
        text-align: center;
      ">
        <h2 style="margin: 0; font-size: 20px;">⚠️ URGENT: Security Alert</h2>
      </div>
      <div style="padding: 20px;">
        <p style="
          font-size: 16px;
          line-height: 1.5;
          margin-top: 0;
        ">
          Your account has been temporarily limited due to suspicious activity.
          Immediate action is required to prevent account suspension.
        </p>
        <p style="
          font-size: 16px;
          line-height: 1.5;
        ">
          Please verify your identity within the next <strong>24 hours</strong> to restore full access.
        </p>
        <div style="
          margin-top: 25px;
          text-align: center;
        ">
          <button class="phishguard-simulation-action-button" style="
            background-color: #d32f2f;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          ">Verify Account Now</button>
        </div>
      </div>
    </div>
  `;
}

// Create a simulation for login form spoofing
function createLoginFormSimulation() {
  return `
    <div class="phishguard-simulation-container" style="
      background-color: white;
      max-width: 400px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: #4285f4;
        padding: 20px;
        text-align: center;
      ">
        <img src="${chrome.runtime.getURL('images/generic_logo.png')}" 
             onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%2232%22><rect width=%22100%22 height=%2232%22 fill=%22%23fff%22 /><text x=%2250%22 y=%2220%22 font-family=%22Arial%22 font-size=%2216%22 text-anchor=%22middle%22 fill=%22%234285f4%22>YourAccount</text></svg>'"
             alt="Logo" width="150" style="margin-bottom: 10px;">
      </div>
      <div style="padding: 20px;">
        <h2 style="
          margin-top: 0;
          margin-bottom: 20px;
          color: #4285f4;
          font-size: 18px;
          text-align: center;
        ">Sign in to continue</h2>
        <form id="phishguard-simulation-login-form">
          <div style="margin-bottom: 15px;">
            <label style="
              display: block;
              margin-bottom: 5px;
              font-size: 14px;
              color: #5f6368;
            ">Email</label>
            <input type="email" class="phishguard-simulation-input" style="
              width: 100%;
              padding: 10px;
              border: 1px solid #dadce0;
              border-radius: 4px;
              font-size: 16px;
              box-sizing: border-box;
            " placeholder="Enter your email">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="
              display: block;
              margin-bottom: 5px;
              font-size: 14px;
              color: #5f6368;
            ">Password</label>
            <input type="password" class="phishguard-simulation-input" style="
              width: 100%;
              padding: 10px;
              border: 1px solid #dadce0;
              border-radius: 4px;
              font-size: 16px;
              box-sizing: border-box;
            " placeholder="Enter your password">
          </div>
          <div style="
            margin-top: 25px;
            text-align: center;
          ">
            <button type="submit" class="phishguard-simulation-action-button" style="
              background-color: #4285f4;
              color: white;
              border: none;
              padding: 12px 20px;
              width: 100%;
              border-radius: 4px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
            ">Sign In</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Create a simulation for misspelled domains
function createMisspelledDomainSimulation() {
  return `
    <div class="phishguard-simulation-container" style="
      background-color: white;
      max-width: 450px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: #ff9900;
        padding: 15px;
        text-align: center;
        color: white;
      ">
        <h2 style="margin: 0; font-size: 20px;">Special Limited Offer!</h2>
      </div>
      <div style="padding: 20px;">
        <div style="
          text-align: center;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: bold;
          color: #333;
        ">
          <span style="color: #ff9900;">Amaz<span style="color: #333;">0</span>n</span> Gift Card Giveaway
        </div>
        <p style="
          font-size: 15px;
          line-height: 1.5;
          margin-top: 0;
          color: #333;
        ">
          Congratulations! You've been selected to receive a $50 gift card.
          Complete a short survey to claim your reward.
        </p>
        <div style="
          background-color: #f8f8f8;
          border: 1px dashed #ddd;
          padding: 10px;
          text-align: center;
          margin: 15px 0;
          color: #333;
        ">
          <span style="font-size: 14px;">Offer expires in:</span>
          <div style="
            font-size: 20px;
            font-weight: bold;
            color: #d32f2f;
          ">23:59:41</div>
        </div>
        <div style="
          margin-top: 20px;
          text-align: center;
        ">
          <button class="phishguard-simulation-action-button" style="
            background-color: #ff9900;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          ">Claim Gift Card Now</button>
        </div>
        <div style="
          margin-top: 15px;
          text-align: center;
          font-size: 12px;
          color: #777;
        ">
          * Terms and conditions apply. Visit amaz0n.com/giftcards for details.
        </div>
      </div>
    </div>
  `;
}

// Create a simulation for security false claims
function createSecurityClaimsSimulation() {
  return `
    <div class="phishguard-simulation-container" style="
      background-color: white;
      max-width: 450px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: #0078d7;
        padding: 15px;
        text-align: center;
        color: white;
      ">
        <h2 style="margin: 0; font-size: 20px;">Security Verification Required</h2>
      </div>
      <div style="padding: 20px;">
        <div style="
          margin-bottom: 15px;
          text-align: center;
        ">
          <span style="
            font-size: 40px;
            color: #0078d7;
          ">🔒</span>
        </div>
        <p style="
          font-size: 15px;
          line-height: 1.5;
          margin-top: 0;
          color: #333;
        ">
          Our security system has detected unusual activity on your account. To ensure your
          account's security, please verify your identity.
        </p>
        <div style="
          background-color: #f0f7ff;
          border: 1px solid #d0e5ff;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
        ">
          <div style="
            font-size: 14px;
            color: #333;
            margin-bottom: 8px;
          ">
            <strong>Why this is happening:</strong>
          </div>
          <ul style="
            margin: 0;
            padding-left: 20px;
            color: #333;
            font-size: 14px;
          ">
            <li>Login attempt from a new location</li>
            <li>Multiple failed login attempts</li>
            <li>Recent password change request</li>
          </ul>
        </div>
        <div style="
          margin-top: 20px;
          text-align: center;
        ">
          <button class="phishguard-simulation-action-button" style="
            background-color: #0078d7;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          ">Verify Account</button>
        </div>
      </div>
    </div>
  `;
}

// Create a simulation for financial bait
function createFinancialBaitSimulation() {
  return `
    <div class="phishguard-simulation-container" style="
      background-color: white;
      max-width: 450px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: #4caf50;
        padding: 15px;
        text-align: center;
        color: white;
      ">
        <h2 style="margin: 0; font-size: 22px;">🎉 Congratulations! You've Won! 🎉</h2>
      </div>
      <div style="padding: 20px;">
        <div style="
          text-align: center;
          margin-bottom: 15px;
        ">
          <span style="
            font-size: 36px;
            color: #ffc107;
          ">💰</span>
        </div>
        <p style="
          font-size: 18px;
          line-height: 1.4;
          margin-top: 0;
          color: #333;
          text-align: center;
          font-weight: bold;
        ">
          You've been selected as our lucky visitor!
        </p>
        <p style="
          font-size: 15px;
          line-height: 1.5;
          color: #333;
          text-align: center;
        ">
          You've won a $1,000 gift card or the latest smartphone.
          Claim your prize now before time runs out!
        </p>
        <div style="
          background-color: #fff9c4;
          border: 1px solid #ffd54f;
          padding: 12px;
          margin: 15px 0;
          border-radius: 4px;
          text-align: center;
        ">
          <div style="
            font-size: 14px;
            color: #ff6d00;
            font-weight: bold;
          ">
            Limited Time Offer: Only 3 prizes left today!
          </div>
        </div>
        <div style="
          margin-top: 20px;
          text-align: center;
        ">
          <button class="phishguard-simulation-action-button" style="
            background-color: #4caf50;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          ">Claim Your Prize</button>
        </div>
        <div style="
          margin-top: 15px;
          text-align: center;
          font-size: 12px;
          color: #777;
        ">
          * No purchase necessary. See terms and conditions for details.
        </div>
      </div>
    </div>
  `;
}

// Create a generic simulation as fallback
function createGenericSimulation() {
  return `
    <div class="phishguard-simulation-container" style="
      background-color: white;
      max-width: 450px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: #2196f3;
        padding: 15px;
        text-align: center;
        color: white;
      ">
        <h2 style="margin: 0; font-size: 20px;">Important Notification</h2>
      </div>
      <div style="padding: 20px;">
        <p style="
          font-size: 15px;
          line-height: 1.5;
          margin-top: 0;
          color: #333;
        ">
          Your attention is required for an important update regarding your account.
          Please review the information below and take action as needed.
        </p>
        <div style="
          margin-top: 20px;
          text-align: center;
        ">
          <button class="phishguard-simulation-action-button" style="
            background-color: #2196f3;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          ">Continue</button>
        </div>
      </div>
    </div>
  `;
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
  banner.style.cssText = `
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

  const content = document.createElement('div');
  content.innerHTML = `
    <h2 style="margin: 0; font-size: 18px;">
      ${fellForIt ? '⚠️ Phishing Simulation - You Clicked!' : '✓ Good Job! You Avoided the Phishing Attempt'}
    </h2>
    <p style="margin: 10px 0; font-size: 14px;">
      ${fellForIt
      ? 'This was a training simulation by PhishGuard. In a real phishing attempt, your information could have been stolen.'
      : 'This was a training simulation by PhishGuard. You correctly avoided interacting with suspicious content.'}
    </p>
    <p style="margin: 5px 0; font-size: 14px;">
      <strong>Simulation type:</strong> ${currentSimulation.type}
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