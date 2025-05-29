// PhishGuard Simulation Manager
// Handles display and interaction of training simulations

class SimulationManager {
  constructor() {
    this.currentSimulation = null;
    this.simulationHistory = [];
    this.isSimulationActive = false;
    this.simulationStartTime = null;
    this.userActions = [];
  }

  // Initialize the simulation manager
  initialize() {
    try {
      console.log('PhishGuard: Simulation manager initialized');
      return true;
    } catch (error) {
      console.error('PhishGuard: Failed to initialize simulation manager:', error);
      return false;
    }
  }

  // Show training simulation
  showTrainingSimulation(simulationData) {
    try {
      // Don't show multiple simulations
      if (this.isSimulationActive) {
        console.log('PhishGuard: Simulation already active, skipping');
        return;
      }

      console.log('PhishGuard: Showing training simulation:', simulationData.type);
      
      this.currentSimulation = simulationData;
      this.simulationStartTime = Date.now();
      this.userActions = [];
      this.isSimulationActive = true;

      // Create and display simulation
      const simulationElement = this.createSimulationElement(simulationData);
      this.displaySimulation(simulationElement);
      
      // Track simulation start
      this.trackUserAction('simulation_started');
      
    } catch (error) {
      console.error('PhishGuard: Error showing training simulation:', error);
    }
  }

  // Create simulation element based on type
  createSimulationElement(simulationData) {
    const overlay = document.createElement('div');
    overlay.id = 'phishguard-simulation-overlay';
    overlay.style.cssText = styles.simulationOverlay;

    // Generate simulation content based on type
    const simulationContent = this.generateSimulationContent(simulationData);
    overlay.innerHTML = simulationContent;

    return overlay;
  }

  // Generate simulation content based on simulation type
  generateSimulationContent(simulationData) {
    const templates = {
      urgencyTactics: () => this.createUrgencySimulation(simulationData),
      loginFormSpoofing: () => this.createLoginFormSimulation(simulationData),
      misspelledDomains: () => this.createMisspelledDomainSimulation(simulationData),
      securityFalseClaims: () => this.createSecurityClaimsSimulation(simulationData),
      financialBait: () => this.createFinancialBaitSimulation(simulationData),
    };

    const templateFunction = templates[simulationData.type];
    if (templateFunction) {
      return templateFunction();
    } else {
      return this.createGenericSimulation(simulationData);
    }
  }

  // Create urgency tactics simulation
  createUrgencySimulation(simulationData) {
    const params = simulationData.parameters || {};
    const urgencyLevel = params.urgencyLevel || 'high';
    const timeLimit = params.timeLimit || '24 hours';
    const actionRequired = params.actionRequired || 'verify account';

    const urgencyColor = urgencyLevel === 'high' ? '#d32f2f' : '#ff9800';
    const urgencyText = urgencyLevel === 'high' ? 'URGENT' : 'IMPORTANT';

    return `
      <div class="phishguard-simulation-container" style="${this.getContainerStyle()}">
        <div style="background-color: ${urgencyColor}; color: white; padding: 15px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">${urgencyText}: Security Alert</h2>
        </div>
        <div style="padding: 25px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 48px; color: ${urgencyColor};">⚠️</span>
          </div>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px; color: #333;">
            Your account has been temporarily limited due to suspicious activity detected from an unknown location.
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #333;">
            Immediate action is required to ${actionRequired} within the next <strong style="color: ${urgencyColor};">${timeLimit}</strong> 
            to prevent permanent account suspension.
          </p>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 4px;">
            <strong style="color: #856404;">Recent Activity:</strong><br>
            <small style="color: #856404;">
              • Login attempt from ${this.getRandomLocation()}<br>
              • ${Math.floor(Math.random() * 5) + 2} failed password attempts<br>
              • Account access from new device
            </small>
          </div>
          <div style="text-align: center; margin-top: 25px;">
            <button class="phishguard-simulation-action-button" data-action="verify" style="${this.getActionButtonStyle(urgencyColor)}">
              ${actionRequired.charAt(0).toUpperCase() + actionRequired.slice(1)} Now
            </button>
          </div>
          <div style="text-align: center; margin-top: 15px;">
            <small style="color: #666;">
              If you did not attempt to access your account, please secure it immediately.
            </small>
          </div>
        </div>
      </div>
    `;
  }

  // Create login form spoofing simulation
  createLoginFormSimulation(simulationData) {
    const params = simulationData.parameters || {};
    const targetService = params.targetService || 'Google';
    const hasSSLIndicator = params.hasSSLIndicator !== false;

    return `
      <div class="phishguard-simulation-container" style="${this.getContainerStyle()}">
        <div style="background-color: #4285f4; padding: 20px; text-align: center; color: white;">
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${targetService}</div>
          ${hasSSLIndicator ? '<div style="font-size: 12px; opacity: 0.8;">🔒 Secure Connection</div>' : ''}
        </div>
        <div style="padding: 30px;">
          <h2 style="text-align: center; margin-top: 0; margin-bottom: 25px; color: #333; font-size: 18px;">
            Sign in to continue
          </h2>
          <form id="phishguard-simulation-login-form" class="phishguard-simulation-form">
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-size: 14px; color: #5f6368; font-weight: 500;">
                Email or phone
              </label>
              <input type="text" class="phishguard-simulation-input" style="${this.getInputStyle()}" 
                     placeholder="Enter your email" data-track="email_field">
            </div>
            <div style="margin-bottom: 25px;">
              <label style="display: block; margin-bottom: 8px; font-size: 14px; color: #5f6368; font-weight: 500;">
                Password
              </label>
              <input type="password" class="phishguard-simulation-input" style="${this.getInputStyle()}" 
                     placeholder="Enter your password" data-track="password_field">
            </div>
            <div style="margin-bottom: 20px;">
              <label style="display: flex; align-items: center; font-size: 14px; color: #5f6368; cursor: pointer;">
                <input type="checkbox" style="margin-right: 8px;" data-track="remember_me">
                Remember me
              </label>
            </div>
            <div style="text-align: center;">
              <button type="submit" class="phishguard-simulation-action-button" data-action="login" 
                      style="${this.getActionButtonStyle('#4285f4')}">
                Sign In
              </button>
            </div>
          </form>
          <div style="text-align: center; margin-top: 20px;">
            <a href="#" class="phishguard-simulation-link" data-action="forgot_password" 
               style="color: #4285f4; text-decoration: none; font-size: 14px;">
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Create misspelled domain simulation
  createMisspelledDomainSimulation(simulationData) {
    const params = simulationData.parameters || {};
    const targetBrand = params.targetBrand || 'Amazon';
    const offerType = params.offerType || 'gift card';
    const hasTimer = params.urgencyTimer !== false;

    const misspelledBrand = this.createMisspelledBrand(targetBrand);
    const offerAmount = [25, 50, 100, 200][Math.floor(Math.random() * 4)];

    return `
      <div class="phishguard-simulation-container" style="${this.getContainerStyle()}">
        <div style="background-color: #ff9900; padding: 15px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px;">🎉 Special ${targetBrand} Offer! 🎉</h2>
        </div>
        <div style="padding: 25px; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 15px;">🎁</div>
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #333;">
            Congratulations! You've won a $${offerAmount} ${misspelledBrand} ${offerType}!
          </div>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #333;">
            You've been selected as our lucky visitor! Claim your exclusive ${offerType} 
            before this limited-time offer expires.
          </p>
          ${hasTimer ? `
            <div style="background-color: #fff3cd; border: 2px dashed #ffc107; padding: 15px; margin: 20px 0; border-radius: 8px;">
              <div style="font-size: 14px; color: #856404; margin-bottom: 5px;">⏰ Offer expires in:</div>
              <div id="phishguard-countdown" style="font-size: 24px; font-weight: bold; color: #d32f2f;">
                23:59:47
              </div>
            </div>
          ` : ''}
          <div style="background-color: #e8f5e9; border: 1px solid #c8e6c9; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <div style="color: #2e7d32; font-size: 14px;">
              ✓ No purchase necessary<br>
              ✓ Instant delivery<br>
              ✓ Valid at all ${targetBrand} locations
            </div>
          </div>
          <button class="phishguard-simulation-action-button" data-action="claim_prize" 
                  style="${this.getActionButtonStyle('#ff9900')}">
            Claim Your ${offerType.charAt(0).toUpperCase() + offerType.slice(1)} Now!
          </button>
          <div style="margin-top: 15px; font-size: 12px; color: #777;">
            * Visit ${misspelledBrand.toLowerCase()}.com for terms and conditions
          </div>
        </div>
      </div>
    `;
  }

  // Create security false claims simulation
  createSecurityClaimsSimulation(simulationData) {
    const params = simulationData.parameters || {};
    const alertType = params.alertType || 'account breach';
    const actionRequired = params.actionRequired || 'verify identity';

    return `
      <div class="phishguard-simulation-container" style="${this.getContainerStyle()}">
        <div style="background-color: #0078d7; padding: 15px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px;">🔒 Security Verification Center</h2>
        </div>
        <div style="padding: 25px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 48px; color: #0078d7;">🛡️</span>
          </div>
          <div style="background-color: #fff4e6; border-left: 4px solid #ff9800; padding: 15px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #e65100; font-size: 16px;">Security Alert Detected</h3>
            <p style="margin: 0; color: #bf360c; font-size: 14px;">
              We've detected potential ${alertType} on your account that requires immediate attention.
            </p>
          </div>
          <p style="font-size: 15px; line-height: 1.6; margin-bottom: 15px; color: #333;">
            Our security systems have identified the following suspicious activities:
          </p>
          <ul style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <li style="margin-bottom: 8px; color: #333;">Unusual login patterns from ${this.getRandomLocation()}</li>
            <li style="margin-bottom: 8px; color: #333;">Multiple failed authentication attempts</li>
            <li style="margin-bottom: 8px; color: #333;">Potential unauthorized access detected</li>
            <li style="color: #333;">Account settings modification attempts</li>
          </ul>
          <p style="font-size: 15px; line-height: 1.6; margin-bottom: 25px; color: #333;">
            To protect your account and personal information, please ${actionRequired} immediately 
            by clicking the button below.
          </p>
          <div style="text-align: center;">
            <button class="phishguard-simulation-action-button" data-action="verify_security" 
                    style="${this.getActionButtonStyle('#0078d7')}">
              ${actionRequired.charAt(0).toUpperCase() + actionRequired.slice(1)}
            </button>
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 13px; color: #666;">
            This security check is required to maintain account access
          </div>
        </div>
      </div>
    `;
  }

  // Create financial bait simulation
  createFinancialBaitSimulation(simulationData) {
    const params = simulationData.parameters || {};
    const rewardType = params.rewardType || 'lottery';
    const amount = params.amount || 1000;

    const rewardEmojis = {
      lottery: '🎰',
      'survey reward': '📋',
      cashback: '💰',
      inheritance: '💼'
    };

    return `
      <div class="phishguard-simulation-container" style="${this.getContainerStyle()}">
        <div style="background: linear-gradient(135deg, #4caf50, #45a049); padding: 15px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 22px;">🎊 CONGRATULATIONS! 🎊</h2>
        </div>
        <div style="padding: 25px; text-align: center;">
          <div style="font-size: 64px; margin-bottom: 15px;">
            ${rewardEmojis[rewardType] || '💰'}
          </div>
          <div style="font-size: 28px; font-weight: bold; margin-bottom: 15px; color: #2e7d32;">
            YOU'VE WON $${amount.toLocaleString()}!
          </div>
          <p style="font-size: 18px; line-height: 1.5; margin-bottom: 20px; color: #333; font-weight: 500;">
            You are our lucky ${rewardType} winner!
          </p>
          <div style="background: linear-gradient(135deg, #fff9c4, #fff59d); border: 2px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <div style="font-size: 16px; color: #f57f17; margin-bottom: 10px; font-weight: bold;">
              🏆 ${rewardType.toUpperCase()} WINNER #${Math.floor(Math.random() * 9000) + 1000}
            </div>
            <div style="font-size: 14px; color: #f57f17;">
              Selected from ${Math.floor(Math.random() * 100000) + 50000} participants
            </div>
          </div>
          <p style="font-size: 15px; line-height: 1.5; margin-bottom: 25px; color: #333;">
            Click below to claim your prize! This offer is only valid for the next 
            <strong style="color: #d32f2f;">24 hours</strong> and cannot be transferred.
          </p>
          <div style="margin-bottom: 20px;">
            <div style="background-color: #ffebee; border: 1px solid #ffcdd2; padding: 10px; border-radius: 4px; font-size: 13px; color: #c62828;">
              ⚠️ Only 3 prizes remaining today!
            </div>
          </div>
          <button class="phishguard-simulation-action-button" data-action="claim_money" 
                  style="${this.getActionButtonStyle('#4caf50')}">
            Claim My ${amount.toLocaleString()} Prize Now!
          </button>
          <div style="margin-top: 20px; font-size: 12px; color: #777;">
            * No purchase necessary. See terms for details.
          </div>
        </div>
      </div>
    `;
  }

  // Create generic simulation fallback
  createGenericSimulation(simulationData) {
    return `
      <div class="phishguard-simulation-container" style="${this.getContainerStyle()}">
        <div style="background-color: #2196f3; padding: 15px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px;">Important Notification</h2>
        </div>
        <div style="padding: 25px;">
          <p style="font-size: 16px; line-height: 1.5; margin-top: 0; color: #333;">
            Your immediate attention is required for an important update regarding your account.
            Please review the information below and take the necessary action.
          </p>
          <div style="text-align: center; margin-top: 25px;">
            <button class="phishguard-simulation-action-button" data-action="generic_action" 
                    style="${this.getActionButtonStyle('#2196f3')}">
              Continue
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Display simulation and set up interactions
  displaySimulation(simulationElement) {
    document.body.appendChild(simulationElement);
    
    // Set up event listeners
    this.setupSimulationEventListeners();
    
    // Start countdown timer if present
    this.startCountdownTimer();
    
    // Set up auto-timeout
    this.setupSimulationTimeout();
  }

  // Set up event listeners for simulation interactions
  setupSimulationEventListeners() {
    const overlay = document.getElementById('phishguard-simulation-overlay');
    if (!overlay) return;

    // Click outside to close (safe action)
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        this.endSimulation(false, 'clicked_outside');
      }
    });

    // Action buttons (dangerous actions)
    const actionButtons = overlay.querySelectorAll('.phishguard-simulation-action-button');
    actionButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const action = button.getAttribute('data-action') || 'unknown';
        this.trackUserAction('clicked_action_button', { action });
        this.endSimulation(true, 'clicked_action_button');
      });
    });

    // Form submission (dangerous action)
    const forms = overlay.querySelectorAll('.phishguard-simulation-form');
    forms.forEach(form => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.trackUserAction('submitted_form');
        this.endSimulation(true, 'submitted_form');
      });
    });

    // Input field interactions (tracking user engagement)
    const inputs = overlay.querySelectorAll('.phishguard-simulation-input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        const fieldType = input.getAttribute('data-track') || 'unknown_field';
        this.trackUserAction('focused_input', { fieldType });
      });

      input.addEventListener('input', () => {
        const fieldType = input.getAttribute('data-track') || 'unknown_field';
        this.trackUserAction('typed_in_input', { fieldType, hasContent: input.value.length > 0 });
      });
    });

    // Link clicks (potentially dangerous)
    const links = overlay.querySelectorAll('.phishguard-simulation-link');
    links.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const action = link.getAttribute('data-action') || 'unknown_link';
        this.trackUserAction('clicked_link', { action });
        this.endSimulation(true, 'clicked_link');
      });
    });

    // ESC key to close (safe action)
    this.escKeyListener = (event) => {
      if (event.key === 'Escape' && this.isSimulationActive) {
        this.endSimulation(false, 'pressed_escape');
      }
    };
    document.addEventListener('keydown', this.escKeyListener);
  }

  // Start countdown timer for urgency simulations
  startCountdownTimer() {
    const countdownElement = document.getElementById('phishguard-countdown');
    if (!countdownElement) return;

    let timeRemaining = 23 * 3600 + 59 * 60 + Math.floor(Math.random() * 60); // Random seconds

    const updateCountdown = () => {
      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      const seconds = timeRemaining % 60;

      countdownElement.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      timeRemaining--;
      
      if (timeRemaining >= 0 && this.isSimulationActive) {
        setTimeout(updateCountdown, 1000);
      }
    };

    updateCountdown();
  }

  // Set up simulation timeout
  setupSimulationTimeout() {
    // Auto-close simulation after 30 seconds if no interaction
    this.simulationTimeout = setTimeout(() => {
      if (this.isSimulationActive) {
        this.endSimulation(false, 'timeout');
      }
    }, 30000);
  }

  // Track user actions during simulation
  trackUserAction(action, details = {}) {
    const actionData = {
      action,
      timestamp: Date.now(),
      timeFromStart: Date.now() - this.simulationStartTime,
      details
    };

    this.userActions.push(actionData);
    console.log('PhishGuard: Simulation action tracked:', action);
  }

  // End simulation and show results
  endSimulation(fellForIt, reason = 'unknown') {
    try {
      if (!this.isSimulationActive) return;

      // Calculate response time
      const responseTime = Date.now() - this.simulationStartTime;
      
      // Track final action
      this.trackUserAction('simulation_ended', { fellForIt, reason, responseTime });

      // Remove simulation overlay
      this.removeSimulationOverlay();

      // Show feedback
      this.showSimulationFeedback(fellForIt, responseTime);

      // Report results to background script
      this.reportSimulationResult(fellForIt, responseTime);

      // Add to history
      this.addToSimulationHistory(fellForIt, responseTime, reason);

      console.log('PhishGuard: Simulation ended -', fellForIt ? 'User fell for it' : 'User avoided it');

    } catch (error) {
      console.error('PhishGuard: Error ending simulation:', error);
    } finally {
      this.cleanupSimulation();
    }
  }

  // Remove simulation overlay
  removeSimulationOverlay() {
    const overlay = document.getElementById('phishguard-simulation-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  // Show simulation feedback
  showSimulationFeedback(fellForIt, responseTime) {
    const feedbackBanner = document.createElement('div');
    feedbackBanner.id = 'phishguard-simulation-feedback';
    feedbackBanner.style.cssText = fellForIt ? styles.simulationBannerFail : styles.simulationBannerSuccess;

    const simulationType = this.currentSimulation?.type || 'unknown';
    feedbackBanner.innerHTML = this.generateFeedbackContent(fellForIt, simulationType, responseTime);

    document.body.prepend(feedbackBanner);

    // Set up feedback event listeners
    this.setupFeedbackEventListeners(fellForIt, simulationType);

    // Auto-remove feedback after delay
    setTimeout(() => {
      if (feedbackBanner.parentNode) {
        feedbackBanner.remove();
      }
    }, 8000);
  }

  // Generate feedback content
  generateFeedbackContent(fellForIt, simulationType, responseTime) {
    const responseTimeSeconds = Math.round(responseTime / 1000);
    const simulationTypeLabels = {
      urgencyTactics: 'Urgency Tactics',
      loginFormSpoofing: 'Login Form Spoofing', 
      misspelledDomains: 'Misspelled Domains',
      securityFalseClaims: 'Security False Claims',
      financialBait: 'Financial Bait'
    };

    const typeLabel = simulationTypeLabels[simulationType] || simulationType;

    if (fellForIt) {
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; align-items: center;">
            <div style="font-size: 24px; margin-right: 15px;">⚠️</div>
            <div>
              <h2 style="margin: 0; font-size: 18px; font-weight: bold;">
                PhishGuard Training: You Clicked the Simulation!
              </h2>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">
                This was a ${typeLabel} training simulation. In a real attack, your information could have been stolen.
                Response time: ${responseTimeSeconds}s
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button id="phishguard-feedback-learn" style="${this.getFeedbackButtonStyle('learn')}">
              Learn More
            </button>
            <button id="phishguard-feedback-dismiss" style="${this.getFeedbackButtonStyle('dismiss')}">
              Dismiss
            </button>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; align-items: center;">
            <div style="font-size: 24px; margin-right: 15px;">✅</div>
            <div>
              <h2 style="margin: 0; font-size: 18px; font-weight: bold;">
                Excellent! You Avoided the Phishing Simulation
              </h2>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">
                You correctly identified and avoided a ${typeLabel} simulation. 
                Response time: ${responseTimeSeconds}s
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button id="phishguard-feedback-continue" style="${this.getFeedbackButtonStyle('continue')}">
              Continue Training
            </button>
            <button id="phishguard-feedback-dismiss" style="${this.getFeedbackButtonStyle('dismiss')}">
              Dismiss
            </button>
          </div>
        </div>
      `;
    }
  }

  // Set up feedback event listeners
  setupFeedbackEventListeners(fellForIt, simulationType) {
    const learnBtn = document.getElementById('phishguard-feedback-learn');
    if (learnBtn) {
      learnBtn.addEventListener('click', () => {
        this.openLearningResource(simulationType);
        this.removeFeedbackBanner();
      });
    }

    const continueBtn = document.getElementById('phishguard-feedback-continue');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.openTrainingDashboard();
        this.removeFeedbackBanner();
      });
    }

    const dismissBtn = document.getElementById('phishguard-feedback-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        this.removeFeedbackBanner();
      });
    }
  }

  // Remove feedback banner
  removeFeedbackBanner() {
    const banner = document.getElementById('phishguard-simulation-feedback');
    if (banner) {
      banner.remove();
    }
  }

  // Report simulation result to background script
  reportSimulationResult(fellForIt, responseTime) {
    chrome.runtime.sendMessage({
      action: 'trainingResult',
      simulationType: this.currentSimulation?.type || 'unknown',
      fell: fellForIt,
      responseTime,
      userActions: this.userActions,
      simulationId: this.currentSimulation?.id
    });
  }

  // Add simulation to history
  addToSimulationHistory(fellForIt, responseTime, reason) {
    const historyEntry = {
      simulationId: this.currentSimulation?.id,
      type: this.currentSimulation?.type,
      fellForIt,
      responseTime,
      reason,
      userActions: this.userActions.length,
      timestamp: new Date().toISOString()
    };

    this.simulationHistory.push(historyEntry);

    // Keep only last 50 entries
    if (this.simulationHistory.length > 50) {
      this.simulationHistory = this.simulationHistory.slice(-50);
    }
  }

  // Clean up simulation resources
  cleanupSimulation() {
    this.currentSimulation = null;
    this.isSimulationActive = false;
    this.simulationStartTime = null;
    this.userActions = [];

    // Clear timeouts
    if (this.simulationTimeout) {
      clearTimeout(this.simulationTimeout);
      this.simulationTimeout = null;
    }

    // Remove event listeners
    if (this.escKeyListener) {
      document.removeEventListener('keydown', this.escKeyListener);
      this.escKeyListener = null;
    }
  }

  // Helper methods
  getContainerStyle() {
    return `
      background-color: white;
      max-width: 500px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
  }

  getInputStyle() {
    return `
      width: 100%;
      padding: 12px;
      border: 1px solid #dadce0;
      border-radius: 4px;
      font-size: 16px;
      box-sizing: border-box;
      transition: border-color 0.2s;
    `;
  }

  getActionButtonStyle(color) {
    return `
      background-color: ${color};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
  }

  getFeedbackButtonStyle(type) {
    const styles = {
      learn: 'background-color: #fff; color: #d32f2f; border: 1px solid rgba(255,255,255,0.3);',
      continue: 'background-color: #fff; color: #4caf50; border: 1px solid rgba(255,255,255,0.3);',
      dismiss: 'background-color: transparent; color: white; border: 1px solid rgba(255,255,255,0.7);'
    };

    return `
      ${styles[type] || styles.dismiss}
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    `;
  }

  getRandomLocation() {
    const locations = [
      'Moscow, Russia', 'Beijing, China', 'Lagos, Nigeria', 'Mumbai, India',
      'São Paulo, Brazil', 'Cairo, Egypt', 'Bangkok, Thailand', 'Istanbul, Turkey'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  createMisspelledBrand(brand) {
    const misspellings = {
      'Amazon': ['Amaz0n', 'Amazom', 'Amazone'],
      'PayPal': ['PayPa1', 'Pay-Pal', 'PaypaI'],
      'eBay': ['e-Bay', 'eBaY', 'ebay'],
      'Netflix': ['Netfl1x', 'NetFlix', 'Netflik']
    };
    
    const options = misspellings[brand] || [brand];
    return options[Math.floor(Math.random() * options.length)];
  }

  openLearningResource(simulationType) {
    chrome.runtime.sendMessage({
      action: 'openLearningResource',
      simulationType
    });
  }

  openTrainingDashboard() {
    chrome.runtime.sendMessage({
      action: 'openTrainingDashboard'
    });
  }

  // Get simulation statistics
  getSimulationStats() {
    const totalSimulations = this.simulationHistory.length;
    const failedSimulations = this.simulationHistory.filter(s => s.fellForIt).length;
    const successRate = totalSimulations > 0 ? ((totalSimulations - failedSimulations) / totalSimulations * 100) : 0;

    return {
      total: totalSimulations,
      failed: failedSimulations,
      passed: totalSimulations - failedSimulations,
      successRate: Math.round(successRate),
      averageResponseTime: totalSimulations > 0 
        ? Math.round(this.simulationHistory.reduce((sum, s) => sum + s.responseTime, 0) / totalSimulations / 1000)
        : 0
    };
  }

  // Clean up all simulation-related elements
  cleanup() {
    this.cleanupSimulation();
    this.removeSimulationOverlay();
    this.removeFeedbackBanner();
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.SimulationManager = SimulationManager;
}