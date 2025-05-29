// PhishGuard Main Background Script
// Orchestrates all background functionality

importScripts(
  'background/config.js',
  'background/storage-manager.js', 
  'background/phishing-detector.js',
  'background/training-manager.js'
);

class PhishGuardBackground {
  constructor() {
    this.config = null;
    this.storage = null;
    this.phishingDetector = null;
    this.trainingManager = null;
    this.initialized = false;
  }

  // Initialize all components
  async initialize() {
    try {
      console.log('PhishGuard: Starting initialization...');

      // Load configuration
      this.config = typeof PHISHGUARD_CONFIG !== 'undefined' ? PHISHGUARD_CONFIG : this.getDefaultConfig();
      
      // Initialize storage manager
      this.storage = new StorageManager(this.config);
      await this.storage.initialize();

      // Initialize phishing detector
      this.phishingDetector = new PhishingDetector(this.config, this.storage);
      await this.phishingDetector.initialize();

      // Initialize training manager
      this.trainingManager = new TrainingManager(this.config, this.storage);
      await this.trainingManager.initialize();

      // Set up event listeners
      this.setupEventListeners();

      // Set up alarms for periodic tasks
      this.setupAlarms();

      this.initialized = true;
      console.log('PhishGuard: Initialization completed successfully');

    } catch (error) {
      console.error('PhishGuard: Initialization failed:', error);
      this.initialized = false;
    }
  }

  // Set up all event listeners
  setupEventListeners() {
    // Tab navigation events
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // Message handling from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Alarm handling for periodic tasks
    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });

    // Extension lifecycle events
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstall(details);
    });

    chrome.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });
  }

  // Handle tab updates (navigation, loading, etc.)
  async handleTabUpdate(tabId, changeInfo, tab) {
    if (!this.initialized || !tab.url || changeInfo.status !== 'complete') {
      return;
    }

    try {
      // Skip certain URLs
      if (this.shouldSkipUrl(tab.url)) {
        return;
      }

      // Analyze URL for phishing
      const analysis = await this.phishingDetector.analyzeUrl(tab.url);
      
      if (analysis.isPhishing && analysis.confidence > this.config.phishing.confidenceThreshold) {
        // Real phishing site detected
        await this.handlePhishingDetection(tabId, analysis);
      } else {
        // Check if we should show training simulation
        const trainingCheck = await this.trainingManager.shouldShowTraining(tabId);
        
        if (trainingCheck.shouldShow) {
          await this.handleTrainingSimulation(tabId);
        }
      }

    } catch (error) {
      console.error('PhishGuard: Error handling tab update:', error);
    }
  }

  // Handle messages from content scripts and popup
  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'analyzeUrl':
          const analysis = await this.phishingDetector.analyzeUrl(message.url);
          sendResponse(analysis);
          break;

        case 'trainingResult':
          const result = await this.trainingManager.processTrainingResult({
            simulationType: message.simulationType,
            fell: message.fell,
            tabId: sender.tab?.id,
            responseTime: message.responseTime,
            userActions: message.userActions
          });
          sendResponse(result);
          break;

        case 'getUserStats':
          const stats = await this.storage.getUserStats();
          sendResponse(stats);
          break;

        case 'runManualSimulation':
          const simulation = await this.trainingManager.triggerManualSimulation(
            message.tabId, 
            message.simulationType
          );
          if (simulation) {
            await this.sendToTab(message.tabId, {
              action: 'showTrainingSimulation',
              data: simulation
            });
          }
          sendResponse({ success: !!simulation });
          break;

        case 'getTrainingProgress':
          const progress = await this.trainingManager.getTrainingProgress();
          sendResponse(progress);
          break;

        case 'updateSettings':
          const settingsUpdated = await this.updateSettings(message.settings);
          sendResponse({ success: settingsUpdated });
          break;

        case 'reportSecurityIssue':
          await this.handleSecurityIssueReport(message.url, message.issue, sender.tab?.id);
          sendResponse({ success: true });
          break;

        case 'openLearningResource':
          await this.openLearningResource(message.simulationType);
          sendResponse({ success: true });
          break;

        case 'learningModuleComplete':
          await this.handleLearningModuleComplete(message);
          sendResponse({ success: true });
          break;

        case 'exportData':
          const exportData = await this.storage.exportAllData();
          sendResponse(exportData);
          break;

        case 'importData':
          const importSuccess = await this.storage.importData(message.data);
          sendResponse({ success: importSuccess });
          break;

        case 'getDetectionStats':
          const detectionStats = await this.phishingDetector.getDetectionStats();
          sendResponse(detectionStats);
          break;

        case 'reportPhishingDomain':
          const reported = await this.phishingDetector.reportPhishingDomain(message.domain);
          sendResponse({ success: reported });
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

  // Handle alarm events for periodic tasks
  async handleAlarm(alarm) {
    try {
      switch (alarm.name) {
        case this.config.alarms.updatePhishingDatabase:
          await this.phishingDetector.updatePhishingDatabase();
          console.log('PhishGuard: Phishing database updated via alarm');
          break;

        case this.config.alarms.checkTrainingOpportunity:
          // This is handled per-tab in handleTabUpdate
          console.log('PhishGuard: Training opportunity check triggered');
          break;

        case this.config.alarms.cleanupOldData:
          await this.storage.cleanupOldData();
          await this.trainingManager.cleanupTrainingData();
          console.log('PhishGuard: Old data cleanup completed');
          break;

        default:
          console.warn('PhishGuard: Unknown alarm:', alarm.name);
      }
    } catch (error) {
      console.error('PhishGuard: Error handling alarm:', error);
    }
  }

  // Handle extension install/update
  async handleInstall(details) {
    try {
      if (details.reason === 'install') {
        console.log('PhishGuard: First time installation');
        
        // Show welcome notification
        chrome.notifications.create('phishguard-welcome', {
          type: 'basic',
          iconUrl: 'icons/Logo.png',
          title: 'PhishGuard Installed',
          message: 'Your anti-phishing training extension is now active!'
        });

        // Open onboarding page
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/index.html') });
        
      } else if (details.reason === 'update') {
        console.log('PhishGuard: Extension updated to version', chrome.runtime.getManifest().version);
        
        // Handle any migration needed for new version
        await this.handleVersionMigration(details.previousVersion);
      }
    } catch (error) {
      console.error('PhishGuard: Error handling install/update:', error);
    }
  }

  // Handle extension startup
  async handleStartup() {
    console.log('PhishGuard: Extension started');
    
    // Ensure initialization if not already done
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // Handle phishing site detection
  async handlePhishingDetection(tabId, analysis) {
    try {
      // Update statistics
      await this.storage.updateUserStats({ 
        phishingSitesBlocked: (await this.storage.getUserStats()).phishingSitesBlocked + 1 
      });

      // Send warning to content script
      await this.sendToTab(tabId, {
        action: 'showWarning',
        data: analysis
      });

      console.log('PhishGuard: Blocked phishing site:', analysis.details.url);
    } catch (error) {
      console.error('PhishGuard: Error handling phishing detection:', error);
    }
  }

  // Handle training simulation
  async handleTrainingSimulation(tabId) {
    try {
      const simulation = await this.trainingManager.generateTrainingSimulation(tabId);
      
      if (simulation) {
        await this.sendToTab(tabId, {
          action: 'showTrainingSimulation',
          data: simulation
        });

        console.log('PhishGuard: Showed training simulation:', simulation.type);
      }
    } catch (error) {
      console.error('PhishGuard: Error handling training simulation:', error);
    }
  }

  // Handle security issue reports from content script
  async handleSecurityIssueReport(url, issue, tabId) {
    try {
      // Log the security issue
      console.log('PhishGuard: Security issue reported:', { url, issue, tabId });

      // Could be used to improve phishing detection algorithms
      // For now, just log it for analysis
      
      // In a production environment, this could:
      // 1. Send anonymized data to improve detection
      // 2. Update local detection rules
      // 3. Notify security team if patterns emerge
      
    } catch (error) {
      console.error('PhishGuard: Error handling security issue report:', error);
    }
  }

  // Open learning resource
  async openLearningResource(simulationType) {
    try {
      const url = chrome.runtime.getURL(`learning/${simulationType}.html`);
      await chrome.tabs.create({ url });
    } catch (error) {
      console.error('PhishGuard: Error opening learning resource:', error);
    }
  }

  // Handle learning module completion
  async handleLearningModuleComplete(data) {
    try {
      const { module, score, totalQuestions, correctAnswers } = data;
      
      // Save learning progress
      await this.storage.saveLearningProgress(module, {
        completed: true,
        score,
        totalQuestions,
        correctAnswers,
        completedAt: new Date().toISOString()
      });

      // If user scored well, reduce their vulnerability in that area
      if (score >= 80) {
        const stats = await this.storage.getUserStats();
        const currentVulnerability = stats.vulnerabilityAreas[module] || 0;
        const reduction = Math.max(1, Math.floor(currentVulnerability * 0.2));
        
        await this.storage.updateVulnerabilityArea(module, -reduction);
        console.log(`PhishGuard: Reduced ${module} vulnerability by ${reduction} points due to good learning performance`);
      }

    } catch (error) {
      console.error('PhishGuard: Error handling learning module completion:', error);
    }
  }

  // Update extension settings
  async updateSettings(settings) {
    try {
      let updated = false;

      // Update phishing detector settings
      if (settings.phishing) {
        this.phishingDetector.updateSettings(settings.phishing);
        updated = true;
      }

      // Update training settings
      if (settings.training) {
        Object.assign(this.config.training, settings.training);
        updated = true;
      }

      // Update training enabled state
      if (settings.trainingEnabled !== undefined) {
        await this.storage.setTrainingEnabled(settings.trainingEnabled);
        updated = true;
      }

      // Update debug settings
      if (settings.debug) {
        Object.assign(this.config.debug, settings.debug);
        updated = true;
      }

      return updated;
    } catch (error) {
      console.error('PhishGuard: Error updating settings:', error);
      return false;
    }
  }

  // Set up periodic alarms
  setupAlarms() {
    try {
      // Clear existing alarms
      chrome.alarms.clearAll();

      // Set up phishing database updates
      chrome.alarms.create(this.config.alarms.updatePhishingDatabase, {
        periodInMinutes: this.config.phishing.databaseUpdateInterval * 60
      });

      // Set up training opportunity checks
      chrome.alarms.create(this.config.alarms.checkTrainingOpportunity, {
        periodInMinutes: 60
      });

      // Set up data cleanup (weekly)
      chrome.alarms.create(this.config.alarms.cleanupOldData, {
        periodInMinutes: 7 * 24 * 60 // 1 week
      });

      console.log('PhishGuard: Alarms set up successfully');
    } catch (error) {
      console.error('PhishGuard: Error setting up alarms:', error);
    }
  }

  // Handle version migration
  async handleVersionMigration(previousVersion) {
    try {
      const currentVersion = chrome.runtime.getManifest().version;
      console.log(`PhishGuard: Migrating from ${previousVersion} to ${currentVersion}`);

      // Add version-specific migration logic here
      // For example:
      // if (previousVersion < '1.1.0') {
      //   await this.migrateToV1_1_0();
      // }

      // Update version in storage
      await chrome.storage.local.set({ version: currentVersion });
    } catch (error) {
      console.error('PhishGuard: Error during version migration:', error);
    }
  }

  // Utility methods
  shouldSkipUrl(url) {
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

  async sendToTab(tabId, message) {
    try {
      await chrome.tabs.sendMessage(tabId, message);
    } catch (error) {
      // Tab might not have content script loaded yet or may be closed
      if (this.config.debug.enabled) {
        console.warn('PhishGuard: Could not send message to tab:', tabId, error.message);
      }
    }
  }

  // Get default configuration if config file not loaded
  getDefaultConfig() {
    return {
      training: {
        frequency: 7,
        minimumGap: 2,
        simulationProbability: 0.3,
        maxSimulationsPerDay: 3
      },
      phishing: {
        databaseUpdateInterval: 24,
        confidenceThreshold: 0.7,
        typosquattingDistance: 3
      },
      storage: {
        userStatsKey: 'userStats',
        phishingDomainsKey: 'phishingDomains',
        trainingEnabledKey: 'trainingEnabled',
        learningProgressKey: 'learningProgress'
      },
      alarms: {
        updatePhishingDatabase: 'updatePhishingDatabase',
        checkTrainingOpportunity: 'checkForTrainingOpportunity',
        cleanupOldData: 'cleanupOldData'
      },
      popularDomains: ['google.com', 'facebook.com', 'amazon.com', 'apple.com', 'microsoft.com', 'paypal.com'],
      simulationTypes: {
        urgencyTactics: { weight: 25, title: 'Account Security Alert' },
        loginFormSpoofing: { weight: 20, title: 'Sign in to continue' },
        misspelledDomains: { weight: 20, title: 'Special Offer' },
        securityFalseClaims: { weight: 20, title: 'Security Verification' },
        financialBait: { weight: 15, title: 'You\'ve Won!' }
      },
      defaultUserStats: {
        simulationsShown: 0,
        simulationsFallen: 0,
        phishingSitesBlocked: 0,
        lastTrainingDate: null,
        dailySimulationCount: 0,
        lastResetDate: null,
        vulnerabilityAreas: {
          urgencyTactics: 0,
          loginFormSpoofing: 0,
          misspelledDomains: 0,
          securityFalseClaims: 0,
          financialBait: 0
        },
        trainingHistory: []
      },
      debug: {
        enabled: false,
        verboseLogging: false,
        simulatePhishingSites: []
      }
    };
  }

  // Get extension status for debugging
  getStatus() {
    return {
      initialized: this.initialized,
      version: chrome.runtime.getManifest().version,
      components: {
        storage: !!this.storage,
        phishingDetector: !!this.phishingDetector,
        trainingManager: !!this.trainingManager
      }
    };
  }
}

// Initialize the background script
const phishGuard = new PhishGuardBackground();

// Start initialization when script loads
phishGuard.initialize().catch(error => {
  console.error('PhishGuard: Critical initialization error:', error);
});

// Export for testing or debugging
if (typeof window !== 'undefined') {
  window.phishGuard = phishGuard;
}