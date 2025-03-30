// PhishGuard background service worker

// Configuration
const CONFIG = {
    trainingFrequency: 7, // Days between training simulations
    phishingDatabaseUpdateInterval: 24, // Hours between updates
    simulationProbability: 0.3, // Chance of simulation when eligible
    minimumTrainingGap: 2 // Minimum days between training simulations
  };
  
  // State variables
  let phishingDomains = []; // Will be populated from API/local storage
  let userStats = {
    simulationsShown: 0,
    simulationsFallen: 0,
    phishingSitesBlocked: 0,
    lastTrainingDate: null,
    vulnerabilityAreas: {
      urgencyTactics: 0,
      loginFormSpoofing: 0,
      misspelledDomains: 0,
      securityFalseClaims: 0,
      financialBait: 0
    },
    trainingHistory: []
  };
  
  // Initialize extension
  async function initialize() {
    // Load user stats from storage
    chrome.storage.local.get(['userStats'], function(result) {
      if (result.userStats) {
        userStats = result.userStats;
      } else {
        // First time use - save default stats
        chrome.storage.local.set({ userStats });
      }
    });
  
    // Load phishing domains
    await updatePhishingDatabase();
    
    // Set up alarms for recurring tasks
    chrome.alarms.create('updatePhishingDatabase', { 
      periodInMinutes: CONFIG.phishingDatabaseUpdateInterval * 60 
    });
    
    chrome.alarms.create('checkForTrainingOpportunity', { periodInMinutes: 60 });
  }
  
  // Update the database of known phishing domains
  async function updatePhishingDatabase() {
    // In a real implementation, this would call an API
    // For prototype, we'll use a small sample list
    
    phishingDomains = [
      'amaz0n.com',
      'faceb00k.com',
      'paypa1.com',
      'goog1e.com',
      'appleid-verify.com',
      'secure-banking-login.com',
      'verify-account-now.com'
    ];
    
    // Store in local storage for faster access
    chrome.storage.local.set({ phishingDomains });
    
    console.log('Phishing database updated with', phishingDomains.length, 'domains');
  }
  
  // Check if a URL is potentially a phishing site
  function analyzePotentialPhishing(url) {
    try {
      const domain = new URL(url).hostname;
      
      // Check against known phishing domains
      if (phishingDomains.includes(domain)) {
        return {
          isPhishing: true,
          confidence: 0.95,
          reason: 'Known phishing domain'
        };
      }
      
      // Implement additional checks:
      // 1. Check for misspelled domains of popular sites
      const popularDomains = ['google', 'facebook', 'amazon', 'apple', 'microsoft', 'paypal'];
      for (const popularDomain of popularDomains) {
        if (domain.includes(popularDomain) && domain !== `${popularDomain}.com`) {
          if (levenshteinDistance(domain, `${popularDomain}.com`) <= 3) {
            return {
              isPhishing: true,
              confidence: 0.8,
              reason: 'Possible typosquatting domain'
            };
          }
        }
      }
      
      // 2. Check for suspicious URL patterns
      if (domain.includes('secure') && domain.includes('login')) {
        return {
          isPhishing: true,
          confidence: 0.6,
          reason: 'Suspicious URL pattern'
        };
      }
      
      // No phishing indicators found
      return {
        isPhishing: false,
        confidence: 0.2,
        reason: 'No known indicators'
      };
      
    } catch (error) {
      console.error('Error analyzing URL:', error);
      return {
        isPhishing: false,
        confidence: 0,
        reason: 'Error in analysis'
      };
    }
  }
  
  // Helper function to calculate Levenshtein distance for string similarity
  function levenshteinDistance(a, b) {
    const matrix = [];
  
    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
  
    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
  
    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
  
    return matrix[b.length][a.length];
  }
  
  // Check if we should show a training simulation
  function shouldShowTraining() {
    // Don't train if last training was too recent
    if (userStats.lastTrainingDate) {
      const daysSinceLastTraining = 
        (new Date() - new Date(userStats.lastTrainingDate)) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastTraining < CONFIG.minimumTrainingGap) {
        return false;
      }
    }
    
    // Random chance based on configuration
    return Math.random() < CONFIG.simulationProbability;
  }
  
  // Generate a training simulation
  function generateTrainingSimulation() {
    // Determine which type of simulation to show based on user's vulnerability history
    const vulnerabilityScores = Object.entries(userStats.vulnerabilityAreas);
    
    // Sort vulnerabilities by score (highest first)
    vulnerabilityScores.sort((a, b) => b[1] - a[1]);
    
    // Pick one of the top vulnerabilities, with some randomness
    const vulnerabilityIndex = Math.floor(Math.random() * Math.min(3, vulnerabilityScores.length));
    const vulnerabilityType = vulnerabilityScores[vulnerabilityIndex][0];
    
    // Generate simulation based on vulnerability type
    const simulations = {
      urgencyTactics: {
        type: 'urgencyTactics',
        title: 'Account Security Alert',
        template: 'urgent_action.html',
        description: 'Simulation of an urgent security alert requiring immediate action'
      },
      loginFormSpoofing: {
        type: 'loginFormSpoofing',
        title: 'Sign in to continue',
        template: 'fake_login.html',
        description: 'Simulation of a spoofed login form'
      },
      misspelledDomains: {
        type: 'misspelledDomains',
        title: 'Special Offer',
        template: 'misspelled_domain.html',
        description: 'Simulation of a misspelled domain offering a special deal'
      },
      securityFalseClaims: {
        type: 'securityFalseClaims',
        title: 'Security Verification',
        template: 'security_verification.html',
        description: 'Simulation claiming security issues that need verification'
      },
      financialBait: {
        type: 'financialBait',
        title: 'You\'ve Won!',
        template: 'financial_bait.html',
        description: 'Simulation of a financial reward or prize notification'
      }
    };
    
    return simulations[vulnerabilityType];
  }
  
  // Event listeners
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only analyze when the URL has changed and page has loaded
    if (changeInfo.status === 'complete' && tab.url) {
      const analysis = analyzePotentialPhishing(tab.url);
      
      if (analysis.isPhishing && analysis.confidence > 0.7) {
        // Real phishing site detected - show warning
        chrome.tabs.sendMessage(tabId, {
          action: 'showWarning',
          data: analysis
        });
        
        // Update stats
        userStats.phishingSitesBlocked++;
        chrome.storage.local.set({ userStats });
      } else if (shouldShowTraining()) {
        // Show training simulation
        const simulation = generateTrainingSimulation();
        
        chrome.tabs.sendMessage(tabId, {
          action: 'showTrainingSimulation',
          data: simulation
        });
        
        // Update stats
        userStats.simulationsShown++;
        userStats.lastTrainingDate = new Date().toISOString();
        chrome.storage.local.set({ userStats });
      }
    }
  });
  
  // Listen for messages from content script or popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'analyzeUrl') {
      const analysis = analyzePotentialPhishing(message.url);
      sendResponse(analysis);
    } else if (message.action === 'trainingResult') {
      // Record training result
      if (message.fell) {
        userStats.simulationsFallen++;
        userStats.vulnerabilityAreas[message.simulationType]++;
      }
      
      // Add to training history
      userStats.trainingHistory.push({
        date: new Date().toISOString(),
        simulationType: message.simulationType,
        fell: message.fell
      });
      
      // Save updated stats
      chrome.storage.local.set({ userStats });
      sendResponse({ success: true });
    } else if (message.action === 'getUserStats') {
      sendResponse(userStats);
    }
    
    return true; // Required for async sendResponse
  });
  
  // Handle alarms
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updatePhishingDatabase') {
      updatePhishingDatabase();
    } else if (alarm.name === 'checkForTrainingOpportunity') {
      // This will be checked when users navigate to new pages
      console.log('Checking for training opportunity...');
    }
  });
  
  // Initialize on install or update
  chrome.runtime.onInstalled.addListener(initialize);