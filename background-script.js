/**
 * PhishGuard - Background Service Worker
 * Coordinates all extension functionality
 */

import PhishingEngine from './phishing-engine.js';
import PhishingSimulator from '../content/simulator.js';
import { saveDetection, getDetectionHistory } from '../utils/storage.js';
import { trackAnalyticsEvent } from '../utils/analytics.js';

// Initialize the phishing detection engine
const phishingEngine = new PhishingEngine();

// Initialize the phishing simulator
const phishingSimulator = new PhishingSimulator();

// Extension state
let extensionEnabled = true;
let trainingModeEnabled = false;
let trainingSettings = {
  frequency: 'weekly',  // 'daily', 'weekly', 'monthly'
  difficultly: 'medium', // 'easy', 'medium', 'hard'
  simulationTypes: ['fake_login', 'lookalike_domain'] // Default enabled simulations
};

// Initialize the extension
async function initializeExtension() {
  console.log('PhishGuard: Initializing extension...');
  
  // Load settings from storage
  const storedSettings = await chrome.storage.local.get([
    'extensionEnabled',
    'trainingModeEnabled',
    'trainingSettings'
  ]);
  
  extensionEnabled = storedSettings.extensionEnabled !== undefined 
    ? storedSettings.extensionEnabled 
    : true;
  
  trainingModeEnabled = storedSettings.trainingModeEnabled || false;
  
  if (storedSettings.trainingSettings) {
    trainingSettings = {
      ...trainingSettings,
      ...storedSettings.trainingSettings
    };
  }
  
  // Initialize the simulator
  await phishingSimulator.initialize();
  await phishingSimulator.loadSimulationState();
  
  // Set up training schedule if enabled
  if (trainingModeEnabled) {
    scheduleTraining();
  }
  
  // Update the extension icon based on enabled state
  updateExtensionIcon();
  
  console.log('PhishGuard: Extension initialized successfully');
}

// Update the extension icon based on state
function updateExtensionIcon() {
  const iconPath = extensionEnabled 
    ? 'assets/icons/icon48.png'
    : 'assets/icons/icon48_disabled.png';
  
  chrome.action.setIcon({ path: iconPath });
}

// Schedule phishing training simulations
function scheduleTraining() {
  if (!trainingModeEnabled) return;
  
  // Clear any existing alarms
  chrome.alarms.clear('trainingSimulation');
  
  // Set frequency in minutes (for testing, would be longer in production)
  let frequencyMinutes;
  switch (trainingSettings.frequency) {
    case 'daily':
      frequencyMinutes = 60 * 24; // 24 hours
      break;
    case 'weekly':
      frequencyMinutes = 60 * 24 * 7; // 7 days
      break;
    case 'monthly':
      frequencyMinutes = 60 * 24 * 30; // ~30 days
      break;
    default:
      frequencyMinutes = 60 * 24 * 7; // Default to weekly
  }
  
  // Add some randomness to avoid predictability
  const randomOffset = Math.floor(Math.random() * 60 * 12); // Random offset up to 12 hours
  
  // Create alarm with randomization
  chrome.alarms.create('trainingSimulation', {
    delayInMinutes: frequencyMinutes + randomOffset,
    periodInMinutes: frequencyMinutes
  });
  
  console.log(`Training scheduled with frequency: ${trainingSettings.frequency}, ` +
    `next simulation in approximately ${Math.round((frequencyMinutes + randomOffset) / 60)} hours`);
}

// Execute a training simulation
async function executeTrainingSimulation() {
  if (!trainingModeEnabled || !extensionEnabled) return;
  
  // Get the available simulation types based on user settings
  const simulationTypes = trainingSettings.simulationTypes;
  
  if (simulationTypes.length === 0) {
    console.warn('No simulation types enabled in training settings');
    return;
  }
  
  // Pick a random simulation type
  const randomType = simulationTypes[Math.floor(Math.random() * simulationTypes.length)];
  
  // Configure simulation based on difficulty
  let simulationConfig = {};
  
  switch (randomType) {
    case 'fake_login':
      const brands = ['Google', 'Microsoft', 'Facebook', 'Amazon', 'Apple', 'Netflix'];
      simulationConfig = {
        brand: brands[Math.floor(Math.random() * brands.length)],
        difficulty: trainingSettings.difficulty
      };
      break;
    
    case 'lookalike_domain':
      const targetDomains = ['google.com', 'microsoft.com', 'facebook.com', 'amazon.com'];
      const targetDomain = targetDomains[Math.floor(Math.random() * targetDomains.length)];
      
      // Create lookalike domain based on difficulty
      let lookalikeDomain;
      if (trainingSettings.difficulty === 'easy') {
        // Obvious typo
        lookalikeDomain = targetDomain.replace('.com', '-secure.com');
      } else if (trainingSettings.difficulty === 'medium') {
        // Letter substitution
        lookalikeDomain = targetDomain.replace('o', '0');
      } else {
        // Very subtle - IDN homograph
        lookalikeDomain = targetDomain.replace('o', 'ο'); // Using Greek omicron
      }
      
      simulationConfig = {
        domain: lookalikeDomain,
        targetDomain: targetDomain,
        difficulty: trainingSettings.difficulty
      };
      break;
    
    // Other simulation types would be configured here
  }
  
  // Start the simulation
  await phishingSimulator.startSimulation(randomType, simulationConfig);
  
  // Track for analytics
  trackAnalyticsEvent('training_simulation_started', {
    type: randomType,
    difficulty: trainingSettings.difficulty,
    config: simulationConfig
  });
}

// Handle navigation events to check URLs
chrome.webNavigation.onCommitted.addListener(async (details) => {
  // Only check main frame navigations
  if (details.frameId !== 0 || !extensionEnabled) return;
  
  try {
    // Analyze the URL
    const analysis = await phishingEngine.analyzeUrl(details.url);
    
    // Handle detection of high-risk sites
    if (analysis.riskLevel === 'high' || analysis.riskLevel === 'critical') {
      // Save the detection
      await saveDetection(analysis);
      
      // Track for analytics
      trackAnalyticsEvent('phishing_detected', {
        url: details.url,
        riskLevel: analysis.riskLevel,
        riskScore: analysis.riskScore
      });
      
      // Show warning to user
      await showPhishingWarning(details.tabId, analysis);
    }
  } catch (error) {
    console.error('Error analyzing URL:', error);
  }
});

// Show phishing warning
async function showPhishingWarning(tabId, analysis) {
  try {
    // Update tab with warning page
    await chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL(`/popup/warning.html?risk=${analysis.riskLevel}&score=${analysis.riskScore}&url=${encodeURIComponent(analysis.url)}`)
    });
    
    // Add to detection history
    await saveDetection({
      url: analysis.url,
      domain: analysis.domain,
      riskLevel: analysis.riskLevel,
      riskScore: analysis.riskScore,
      reasons: analysis.reasons,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error showing phishing warning:', error);
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'pageAnalysis') {
    // Analyze page features from content script
    analyzePageFeatures(sender.tab.id, sender.tab.url, message.features)
      .then(results => {
        sendResponse({ success: true, results });
      })
      .catch(error => {
        console.error('Error analyzing page features:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Indicate async response
  } else if (message.action === 'toggleExtension') {
    toggleExtension(message.enabled)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  } else if (message.action === 'toggleTrainingMode') {
    toggleTrainingMode(message.enabled)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  } else if (message.action === 'updateTrainingSettings') {
    updateTrainingSettings(message.settings)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  } else if (message.action === 'getDetectionHistory') {
    getDetectionHistory()
      .then(history => sendResponse({ success: true, history }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  } else if (message.action === 'manualCheck') {
    // Manual check requested from popup
    manualCheckUrl(message.url)
      .then(analysis => sendResponse({ success: true, analysis }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  }
});

// Analyze page features
async function analyzePageFeatures(tabId, url, features) {
  // Get initial URL analysis
  const urlAnalysis = await phishingEngine.analyzeUrl(url);
  
  // Combine with page features analysis
  const contentAnalysis = await phishingEngine.analyzePageContent(features);
  
  // Combine scores
  const combinedRiskScore = Math.min(100, urlAnalysis.riskScore + contentAnalysis.score);
  
  // Determine combined risk level
  let combinedRiskLevel;
  if (combinedRiskScore >= 80) {
    combinedRiskLevel = 'critical';
  } else if (combinedRiskScore >= 60) {
    combinedRiskLevel = 'high';
  } else if (combinedRiskScore >= 40) {
    combinedRiskLevel = 'medium';
  } else if (combinedRiskScore >= 20) {
    combinedRiskLevel = 'low';
  } else {
    combinedRiskLevel = 'safe';
  }
  
  // Combine reasons
  const combinedReasons = [...urlAnalysis.reasons, ...contentAnalysis.reasons];
  
  // Create final analysis
  const finalAnalysis = {
    url,
    domain: urlAnalysis.domain,
    riskScore: combinedRiskScore,
    riskLevel: combinedRiskLevel, 
    reasons: combinedReasons,
    urlScore: urlAnalysis.riskScore,
    contentScore: contentAnalysis.score,
    timestamp: Date.now()
  };
  
  // If risk is high or critical, save the detection and show warning
  if (finalAnalysis.riskLevel === 'high' || finalAnalysis.riskLevel === 'critical') {
    await saveDetection(finalAnalysis);
    
    if (extensionEnabled) {
      await showPhishingWarning(tabId, finalAnalysis);
    }
  }
  
  return finalAnalysis;
}

// Manual URL check
async function manualCheckUrl(url) {
  try {
    // Try to normalize URL if it doesn't have a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const analysis = await phishingEngine.analyzeUrl(url);
    
    // Track for analytics
    trackAnalyticsEvent('manual_url_check', {
      url,
      riskLevel: analysis.riskLevel,
      riskScore: analysis.riskScore
    });
    
    return analysis;
  } catch (error) {
    console.error('Error in manual URL check:', error);
    throw error;
  }
}

// Toggle extension enabled state
async function toggleExtension(enabled) {
  extensionEnabled = enabled;
  await chrome.storage.local.set({ extensionEnabled });
  updateExtensionIcon();
  
  // Track for analytics
  trackAnalyticsEvent('extension_toggled', { enabled });
}

// Toggle training mode
async function toggleTrainingMode(enabled) {
  trainingModeEnabled = enabled;
  await chrome.storage.local.set({ trainingModeEnabled });
  
  if (enabled) {
    scheduleTraining();
  } else {
    chrome.alarms.clear('trainingSimulation');
  }
  
  // Track for analytics
  trackAnalyticsEvent('training_mode_toggled', { enabled });
}

// Update training settings
async function updateTrainingSettings(settings) {
  trainingSettings = {
    ...trainingSettings,
    ...settings
  };
  
  await chrome.storage.local.set({ trainingSettings });
  
  // Reschedule based on new settings
  if (trainingModeEnabled) {
    scheduleTraining();
  }
  
  // Track for analytics
  trackAnalyticsEvent('training_settings_updated', { settings: trainingSettings });
}

// Listen for alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'trainingSimulation') {
    executeTrainingSimulation();
  }
});

// Initialize the extension when the service worker starts
initializeExtension().catch(error => {
  console.error('Error initializing extension:', error);
});
