// PhishGuard Enhanced Background Service Worker - FIXED TRACKING VERSION
// Fixed simulation tracking to properly count passed and failed simulations

// Enhanced Configuration
const CONFIG = {
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
  popularDomains: [
    'google.com', 'facebook.com', 'amazon.com', 'apple.com', 
    'microsoft.com', 'paypal.com', 'netflix.com'
  ],
  defaultUserStats: {
    simulationsShown: 0,
    simulationsPassed: 0,    // FIXED: Added dedicated counter
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
  }
};

// Enhanced phishing domains database
let phishingDomains = [];
let userStats = CONFIG.defaultUserStats;

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('PhishGuard: Enhanced extension initializing...');
  
  try {
    // Load user stats from storage
    const result = await chrome.storage.local.get(['userStats']);
    if (result.userStats) {
      userStats = result.userStats;
      
      // FIXED: Migrate old stats format if needed
      if (typeof userStats.simulationsPassed === 'undefined') {
        userStats.simulationsPassed = Math.max(0, (userStats.simulationsShown || 0) - (userStats.simulationsFallen || 0));
        await chrome.storage.local.set({ userStats });
        console.log('PhishGuard: Migrated user stats to new format');
      }
    } else {
      await chrome.storage.local.set({ userStats: CONFIG.defaultUserStats });
    }
    
    // Initialize enhanced phishing database
    await updatePhishingDatabase();
    
    // Set up alarms for maintenance tasks
    setupAlarms();
    
    console.log('PhishGuard: Enhanced initialization completed successfully');
  } catch (error) {
    console.error('PhishGuard: Enhanced initialization failed:', error);
  }
});

// Enhanced phishing database
async function updatePhishingDatabase() {
  try {
    phishingDomains = [
      // Typosquatting examples
      'amaz0n.com', 'amazom.com', 'faceb00k.com', 'paypa1.com',
      'goog1e.com', 'app1e.com', 'microsft.com', 'netfl1x.com',
      
      // Generic phishing domains
      'secure-banking-login.com', 'verify-account-now.com',
      'urgent-security-alert.com', 'account-suspended-verify.com',
      'login-verification-required.com', 'security-update-needed.com'
    ];
    
    await chrome.storage.local.set({ phishingDomains });
    console.log('PhishGuard: Enhanced phishing database updated with', phishingDomains.length, 'domains');
    return true;
  } catch (error) {
    console.error('PhishGuard: Failed to update enhanced phishing database:', error);
    return false;
  }
}

// Enhanced URL analysis with multiple detection methods
function analyzeUrl(url) {
  try {
    if (!url || typeof url !== 'string') {
      return createAnalysisResult(false, 0, 'Invalid URL');
    }

    // Skip certain URLs
    if (shouldSkipUrl(url)) {
      return createAnalysisResult(false, 0, 'URL skipped from analysis');
    }

    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    // Check against known phishing domains
    if (phishingDomains.includes(domain)) {
      return createAnalysisResult(true, 0.95, 'Known phishing domain');
    }
    
    // Check for typosquatting
    for (const popularDomain of CONFIG.popularDomains) {
      const distance = levenshteinDistance(domain, popularDomain);
      if (distance <= CONFIG.phishing.typosquattingDistance && domain !== popularDomain) {
        return createAnalysisResult(true, 0.8, `Possible typosquatting of ${popularDomain}`);
      }
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /secure.*login/i, /verify.*account/i, /update.*payment/i, /urgent.*action/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        return createAnalysisResult(true, 0.6, 'Suspicious URL pattern detected');
      }
    }
    
    // Check for IP addresses
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
      return createAnalysisResult(true, 0.9, 'Domain uses IP address instead of domain name');
    }
    
    // Check SSL status
    if (!url.startsWith('https://')) {
      return createAnalysisResult(false, 0.4, 'Insecure HTTP connection (consider HTTPS)');
    }
    
    return createAnalysisResult(false, 0.2, 'No phishing indicators detected');
    
  } catch (error) {
    console.error('PhishGuard: Error in enhanced URL analysis:', error);
    return createAnalysisResult(false, 0, 'Analysis error');
  }
}

// Enhanced Levenshtein distance calculation
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Create standardized analysis result
function createAnalysisResult(isPhishing, confidence, reason, details = {}) {
  return {
    isPhishing: Boolean(isPhishing),
    confidence: Math.max(0, Math.min(1, confidence)),
    reason: String(reason),
    timestamp: new Date().toISOString(),
    details
  };
}

// Utility functions
function shouldSkipUrl(url) {
  const skipPatterns = [
    /^chrome:/i, /^chrome-extension:/i, /^moz-extension:/i,
    /^about:/i, /^file:/i, /^data:/i, /^blob:/i
  ];
  return skipPatterns.some(pattern => pattern.test(url));
}

// Enhanced training simulation generator
function generateTrainingSimulation() {
  const simulationTypes = ['urgencyTactics', 'loginFormSpoofing', 'misspelledDomains', 'securityFalseClaims', 'financialBait'];
  const randomType = simulationTypes[Math.floor(Math.random() * simulationTypes.length)];
  
  return {
    id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: randomType,
    title: getSimulationTitle(randomType),
    timestamp: new Date().toISOString()
  };
}

function getSimulationTitle(type) {
  const titles = {
    urgencyTactics: 'URGENT: Account Security Alert',
    loginFormSpoofing: 'Sign in to continue',
    misspelledDomains: 'Special Limited Offer!',
    securityFalseClaims: 'Security Verification Required',
    financialBait: 'Congratulations! You\'ve Won!'
  };
  return titles[type] || 'Important Notification';
}

// Enhanced training eligibility check
async function shouldShowTraining() {
  try {
    const trainingEnabled = await isTrainingEnabled();
    if (!trainingEnabled) return false;
    
    const stats = await getUserStats();
    
    // Reset daily counters if needed
    await checkAndResetDailyCounters();
    
    // Check daily limit
    if (stats.dailySimulationCount >= CONFIG.training.maxSimulationsPerDay) {
      return false;
    }
    
    // Check minimum gap
    if (stats.lastTrainingDate) {
      const daysSince = calculateDaysSince(stats.lastTrainingDate);
      if (daysSince < CONFIG.training.minimumGap) {
        return false;
      }
    }
    
    // Random probability
    return Math.random() < CONFIG.training.simulationProbability;
  } catch (error) {
    console.error('PhishGuard: Error checking enhanced training eligibility:', error);
    return false;
  }
}

// Storage helper functions with better error handling
async function getUserStats() {
  try {
    const result = await chrome.storage.local.get(['userStats']);
    const stats = result.userStats || CONFIG.defaultUserStats;
    
    // FIXED: Ensure simulationsPassed exists
    if (typeof stats.simulationsPassed === 'undefined') {
      stats.simulationsPassed = 0;
    }
    
    return stats;
  } catch (error) {
    console.error('PhishGuard: Error getting user stats:', error);
    return CONFIG.defaultUserStats;
  }
}

async function updateUserStats(updates) {
  try {
    const currentStats = await getUserStats();
    const updatedStats = { ...currentStats, ...updates };
    await chrome.storage.local.set({ userStats: updatedStats });
    userStats = updatedStats;
    return true;
  } catch (error) {
    console.error('PhishGuard: Error updating user stats:', error);
    return false;
  }
}

async function isTrainingEnabled() {
  try {
    const result = await chrome.storage.local.get(['trainingEnabled']);
    return result.trainingEnabled !== false;
  } catch (error) {
    console.error('PhishGuard: Error checking training enabled:', error);
    return true;
  }
}

async function checkAndResetDailyCounters() {
  try {
    const stats = await getUserStats();
    const today = new Date().toDateString();
    
    if (stats.lastResetDate !== today) {
      await updateUserStats({
        dailySimulationCount: 0,
        lastResetDate: today
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('PhishGuard: Error resetting daily counters:', error);
    return false;
  }
}

function calculateDaysSince(dateString) {
  const then = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - then);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Set up maintenance alarms
function setupAlarms() {
  try {
    chrome.alarms.create('updatePhishingDatabase', {
      periodInMinutes: CONFIG.phishing.databaseUpdateInterval * 60
    });
    console.log('PhishGuard: Enhanced alarms set up successfully');
  } catch (error) {
    console.error('PhishGuard: Error setting up enhanced alarms:', error);
  }
}

// Enhanced tab update handler
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      // Skip certain URLs
      if (shouldSkipUrl(tab.url)) {
        return;
      }
      
      // Enhanced URL analysis
      const analysis = analyzeUrl(tab.url);
      
      if (analysis.isPhishing && analysis.confidence > CONFIG.phishing.confidenceThreshold) {
        // Show phishing warning
        try {
          await chrome.tabs.sendMessage(tabId, {
            action: 'showWarning',
            data: analysis
          });
          
          // Update stats
          const stats = await getUserStats();
          await updateUserStats({
            phishingSitesBlocked: stats.phishingSitesBlocked + 1
          });
          
          console.log('PhishGuard: Blocked phishing site:', tab.url);
        } catch (msgError) {
          console.log('PhishGuard: Could not send warning message to tab:', msgError.message);
        }
      } else if (await shouldShowTraining()) {
        // Show training simulation
        const simulation = generateTrainingSimulation();
        try {
          await chrome.tabs.sendMessage(tabId, {
            action: 'showTrainingSimulation',
            data: simulation
          });
          
          // Update stats
          const stats = await getUserStats();
          await updateUserStats({
            simulationsShown: stats.simulationsShown + 1,
            lastTrainingDate: new Date().toISOString(),
            dailySimulationCount: stats.dailySimulationCount + 1
          });
          
          console.log('PhishGuard: Showed enhanced training simulation:', simulation.type);
        } catch (msgError) {
          console.log('PhishGuard: Could not send simulation message to tab:', msgError.message);
        }
      }
    } catch (error) {
      console.error('PhishGuard: Error in tab update handler:', error);
    }
  }
});

// FIXED: Enhanced message handler with proper simulation tracking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle the message asynchronously
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async responses
});

async function handleMessage(message, sender, sendResponse) {
  try {
    if (!message || !message.action) {
      sendResponse({ error: 'Invalid message format' });
      return;
    }

    switch (message.action) {
      case 'analyzeUrl':
        if (!message.url) {
          sendResponse({ error: 'URL is required' });
          return;
        }
        const analysis = analyzeUrl(message.url);
        sendResponse(analysis);
        break;
        
      case 'trainingResult':
        // FIXED: Proper tracking of passed and failed simulations
        const stats = await getUserStats();
        const updates = {};
        
        if (message.fell) {
          // User fell for the simulation
          updates.simulationsFallen = stats.simulationsFallen + 1;
          
          // Update vulnerability area
          if (message.simulationType) {
            const currentVuln = stats.vulnerabilityAreas[message.simulationType] || 0;
            updates.vulnerabilityAreas = {
              ...stats.vulnerabilityAreas,
              [message.simulationType]: currentVuln + 1
            };
          }
        } else {
          // User passed the simulation (avoided it)
          updates.simulationsPassed = stats.simulationsPassed + 1;
        }
        
        // Add to enhanced training history
        const historyEntry = {
          date: new Date().toISOString(),
          simulationType: message.simulationType || 'unknown',
          fell: message.fell || false,
          responseTime: message.responseTime || null
        };
        updates.trainingHistory = [...(stats.trainingHistory || []), historyEntry];
        
        // Keep only last 100 entries
        if (updates.trainingHistory.length > 100) {
          updates.trainingHistory = updates.trainingHistory.slice(-100);
        }
        
        await updateUserStats(updates);
        console.log('PhishGuard: Training result recorded -', message.fell ? 'Failed' : 'Passed');
        sendResponse({ success: true });
        break;
        
      case 'getUserStats':
        const currentStats = await getUserStats();
        sendResponse(currentStats);
        break;
        
      case 'runManualSimulation':
        const simulation = generateTrainingSimulation();
        if (message.tabId) {
          try {
            // First check if tab exists and is valid
            const tab = await chrome.tabs.get(message.tabId);
            
            if (shouldSkipUrl(tab.url)) {
              sendResponse({ success: false, error: 'Cannot run simulation on this type of page' });
              return;
            }
            
            // Try to inject content script first (in case it's not loaded)
            try {
              await chrome.scripting.executeScript({
                target: { tabId: message.tabId },
                files: ['content.js']
              });
            } catch (injectError) {
              // Content script might already be loaded, continue
              console.log('PhishGuard: Content script injection failed (might already be loaded):', injectError.message);
            }
            
            // Small delay to ensure content script is ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Send simulation message
            await chrome.tabs.sendMessage(message.tabId, {
              action: 'showTrainingSimulation',
              data: simulation
            });
            
            // FIXED: Also increment simulationsShown for manual simulations
            const stats = await getUserStats();
            await updateUserStats({
              simulationsShown: stats.simulationsShown + 1,
              lastTrainingDate: new Date().toISOString(),
              dailySimulationCount: stats.dailySimulationCount + 1
            });
            
            console.log('PhishGuard: Manual simulation sent successfully:', simulation.type);
            sendResponse({ success: true, simulationType: simulation.type });
          } catch (msgError) {
            console.error('PhishGuard: Error sending manual simulation:', msgError);
            sendResponse({ success: false, error: 'Could not send simulation to tab: ' + msgError.message });
          }
        } else {
          sendResponse({ success: false, error: 'Tab ID required' });
        }
        break;
        
      case 'openLearningResource':
        if (message.simulationType) {
          const url = chrome.runtime.getURL(`learning/${message.simulationType}.html`);
          await chrome.tabs.create({ url });
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'Simulation type required' });
        }
        break;
        
      case 'getPhishingStats':
        sendResponse({
          domainsInDatabase: phishingDomains.length,
          lastUpdate: new Date().toISOString(),
          detectionMethods: ['knownDomains', 'typosquatting', 'suspiciousPatterns', 'domainCharacteristics', 'sslStatus']
        });
        break;
        
      // FIXED: Add debug action to reset stats
      case 'resetStats':
        await chrome.storage.local.set({ userStats: CONFIG.defaultUserStats });
        userStats = CONFIG.defaultUserStats;
        console.log('PhishGuard: User stats reset to defaults');
        sendResponse({ success: true });
        break;
        
      default:
        console.warn('PhishGuard: Unknown enhanced message action:', message.action);
        sendResponse({ error: 'Unknown action: ' + message.action });
    }
  } catch (error) {
    console.error('PhishGuard: Error handling enhanced message:', error);
    sendResponse({ error: error.message || 'Unknown error occurred' });
  }
}

// Enhanced alarm handler
chrome.alarms.onAlarm.addListener(async (alarm) => {
  try {
    switch (alarm.name) {
      case 'updatePhishingDatabase':
        await updatePhishingDatabase();
        console.log('PhishGuard: Scheduled phishing database update completed');
        break;
        
      default:
        console.log('PhishGuard: Unknown alarm:', alarm.name);
    }
  } catch (error) {
    console.error('PhishGuard: Error handling alarm:', error);
  }
});

console.log('PhishGuard: Enhanced background service worker loaded and ready');