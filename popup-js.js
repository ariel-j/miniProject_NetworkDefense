/**
 * PhishGuard Training Extension Popup
 */

// DOM Elements
const extensionToggle = document.getElementById('extensionToggle');
const trainingToggle = document.getElementById('trainingToggle');
const trainingSettings = document.getElementById('trainingSettings');
const frequencySelect = document.getElementById('frequencySelect');
const difficultySelect = document.getElementById('difficultySelect');
const simulationTypeCheckboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
const urlCheckInput = document.getElementById('urlCheckInput');
const urlCheckButton = document.getElementById('urlCheckButton');
const urlCheckResult = document.getElementById('urlCheckResult');
const viewDashboardButton = document.getElementById('viewDashboardButton');
const startSimulationButton = document.getElementById('startSimulationButton');
const blockedCountElement = document.getElementById('blockedCount');
const simulationCountElement = document.getElementById('simulationCount');
const successRateElement = document.getElementById('successRate');
const lastCheckTimeElement = document.getElementById('lastCheckTime');

// Initial setup
document.addEventListener('DOMContentLoaded', async () => {
  // Load extension state
  const state = await chrome.storage.local.get([
    'extensionEnabled',
    'trainingModeEnabled',
    'trainingSettings',
    'lastCheckTime'
  ]);
  
  // Set toggle states
  extensionToggle.checked = state.extensionEnabled !== false;
  trainingToggle.checked = state.trainingModeEnabled === true;
  
  // Show/hide training settings
  if (trainingToggle.checked) {
    trainingSettings.classList.add('visible');
  }
  
  // Set training settings values if available
  if (state.trainingSettings) {
    frequencySelect.value = state.trainingSettings.frequency || 'weekly';
    difficultySelect.value = state.trainingSettings.difficulty || 'medium';
    
    // Set simulation type checkboxes
    if (state.trainingSettings.simulationTypes) {
      simulationTypeCheckboxes.forEach(checkbox => {
        checkbox.checked = state.trainingSettings.simulationTypes.includes(checkbox.value);
      });
    }
  }
  
  // Set last check time
  if (state.lastCheckTime) {
    const date = new Date(state.lastCheckTime);
    lastCheckTimeElement.textContent = date.toLocaleString();
  }
  
  // Load stats
  loadStats();
});

// Toggle extension functionality
extensionToggle.addEventListener('change', async () => {
  const enabled = extensionToggle.checked;
  
  await chrome.runtime.sendMessage({
    action: 'toggleExtension',
    enabled
  });
  
  // Update UI based on state
  if (!enabled && trainingToggle.checked) {
    trainingToggle.checked = false;
    trainingSettings.classList.remove('visible');
    
    await chrome.runtime.sendMessage({
      action: 'toggleTrainingMode',
      enabled: false
    });
  }
});

// Toggle training mode
trainingToggle.addEventListener('change', async () => {
  const enabled = trainingToggle.checked;
  
  // Toggle visibility of training settings
  if (enabled) {
    trainingSettings.classList.add('visible');
  } else {
    trainingSettings.classList.remove('visible');
  }
  
  // Send message to background script
  await chrome.runtime.sendMessage({
    action: 'toggleTrainingMode',
    enabled
  });
});

// Handle training settings changes
const updateTrainingSettings = async () => {
  // Get selected simulation types
  const simulationTypes = Array.from(simulationTypeCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);
  
  // Create settings object
  const settings = {
    frequency: frequencySelect.value,
    difficulty: difficultySelect.value,
    simulationTypes
  };
  
  // Send to background script
  await chrome.runtime.sendMessage({
    action: 'updateTrainingSettings',
    settings
  });
};

// Add event listeners for settings changes
frequencySelect.addEventListener('change', updateTrainingSettings);
difficultySelect.addEventListener('change', updateTrainingSettings);
simulationTypeCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', updateTrainingSettings);
});

// URL Check functionality
urlCheckButton.addEventListener('click', async () => {
  const url = urlCheckInput.value.trim();
  
  if (!url) {
    showUrlCheckResult('Please enter a URL to check', 'warning');
    return;
  }
  
  try {
    // Clear previous result
    urlCheckResult.className = 'url-check-result';
    urlCheckResult.textContent = 'Checking URL...';
    urlCheckResult.classList.add('visible');
    
    // Send check request to background script
    const response = await chrome.runtime.sendMessage({
      action: 'manualCheck',
      url
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to check URL');
    }
    
    // Show result based on risk level
    const analysis = response.analysis;
    let resultClass = 'safe';
    let resultMessage = `This URL appears to be safe. Risk score: ${analysis.riskScore}/100`;
    
    if (analysis.riskLevel === 'critical') {
      resultClass = 'danger';
      resultMessage = `High-risk phishing URL detected! Risk score: ${analysis.riskScore}/100`;
    } else if (analysis.riskLevel === 'high') {
      resultClass = 'danger';
      resultMessage = `Potential phishing URL detected. Risk score: ${analysis.riskScore}/100`;
    } else if (analysis.riskLevel === 'medium') {
      resultClass = 'warning';
      resultMessage = `URL has some suspicious elements. Risk score: ${analysis.riskScore}/100`;
    } else if (analysis.riskLevel === 'low') {
      resultClass = 'warning';
      resultMessage = `Low risk detected. Exercise caution. Risk score: ${analysis.riskScore}/100`;
    }
    
    // Add reasons if available
    if (analysis.reasons && analysis.reasons.length > 0) {
      resultMessage += '<ul class="reasons">';
      analysis.reasons.forEach(reason => {
        resultMessage += `<li>${reason}</li>`;
      });
      resultMessage += '</ul>';
    }
    
    showUrlCheckResult(resultMessage, resultClass);
    
  } catch (error) {
    showUrlCheckResult(`Error: ${error.message}`, 'warning');
  }
});

// Display URL check result
function showUrlCheckResult(message, type = 'safe') {
  urlCheckResult.innerHTML = message;
  urlCheckResult.className = 'url-check-result visible ' + type;
}

// View dashboard button
viewDashboardButton.addEventListener('click', () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('dashboard/dashboard.html')
  });
});

// Run test simulation button
startSimulationButton.addEventListener('click', async () => {
  const confirmed = confirm('This will run a phishing simulation test on your current tab. Continue?');
  
  if (confirmed) {
    try {
      // Get current active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tabs.length === 0) {
        alert('No active tab found');
        return;
      }
      
      // Get random simulation type
      const enabledTypes = Array.from(simulationTypeCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
      
      if (enabledTypes.length === 0) {
        alert('Please enable at least one simulation type in the training settings');
        return;
      }
      
      const simulationType = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
      
      // Configure simulation based on type
      let config = {
        difficulty: difficultySelect.value
      };
      
      if (simulationType === 'fake_login') {
        const brands = ['Google', 'Microsoft', 'Facebook', 'Amazon', 'Apple', 'Netflix'];
        config.brand = brands[Math.floor(Math.random() * brands.length)];
      } else if (simulationType === 'lookalike_domain') {
        const domains = ['google.com', 'microsoft.com', 'facebook.com', 'amazon.com'];
        config.targetDomain = domains[Math.floor(Math.random() * domains.length)];
        config.domain = config.targetDomain.replace('.com', '-secure.com');
      }
      
      // Start simulation
      await chrome.tabs.sendMessage(tabs[0].id, {
        action: 'simulatePhishing',
        simulationType,
        config
      });
      
      // Close popup
      window.close();
      
    } catch (error) {
      alert(`Error starting simulation: ${error.message}`);
    }
  }
});

// Load statistics
async function loadStats() {
  try {
    // Get detection history
    const response = await chrome.runtime.sendMessage({
      action: 'getDetectionHistory'
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to load detection history');
    }
    
    const history = response.history || [];
    
    // Count blocked phishing attempts
    const blockedCount = history.length;
    
    // Get simulation results
    const simulationData = await chrome.storage.local.get('simulationResults');
    const simulations = simulationData.simulationResults || [];
    
    // Count successful simulations (user avoided the phishing)
    let successfulSimulations = 0;
    
    simulations.forEach(simulation => {
      if (simulation.results) {
        const successful = simulation.results.some(result => 
          result.action === 'ignored_phishing_attempt' || 
          result.action === 'reported_phishing' ||
          result.success === true
        );
        
        if (successful) {
          successfulSimulations++;
        }
      }
    });
    
    // Calculate success rate
    const successRate = simulations.length > 0 
      ? Math.round((successfulSimulations / simulations.length) * 100) 
      : 0;
    
    // Update UI
    blockedCountElement.textContent = blockedCount;
    simulationCountElement.textContent = simulations.length;
    successRateElement.textContent = `${successRate}%`;
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}
