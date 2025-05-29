// PhishGuard popup.js - Simplified version

// DOM elements
const elements = {
  currentStatus: document.getElementById('current-status'),
  simulationsShown: document.getElementById('simulations-shown'),
  simulationsPassed: document.getElementById('simulations-passed'),
  threatsBlocked: document.getElementById('threats-blocked'),
  protectionScore: document.getElementById('protection-score'),
  trainingToggle: document.getElementById('training-toggle-checkbox'),
  runSimulationBtn: document.getElementById('run-simulation-btn'),
  viewDashboardBtn: document.getElementById('view-dashboard-btn')
};

// Initialize popup
function initialize() {
  loadUserStats();
  checkCurrentTabStatus();
  setupEventListeners();
}

// Load and display user stats
function loadUserStats() {
  chrome.runtime.sendMessage({ action: 'getUserStats' }, (response) => {
    if (response && !response.error) {
      const stats = response;
      
      // Update count displays
      elements.simulationsShown.textContent = stats.simulationsShown || 0;
      
      const passedCount = (stats.simulationsShown || 0) - (stats.simulationsFallen || 0);
      elements.simulationsPassed.textContent = passedCount;
      
      elements.threatsBlocked.textContent = stats.phishingSitesBlocked || 0;
      
      // Calculate and update protection score
      let protectionScore = 0;
      if (stats.simulationsShown > 0) {
        protectionScore = Math.round((passedCount / stats.simulationsShown) * 100);
      }
      elements.protectionScore.textContent = `${protectionScore}%`;
    }
  });
  
  // Check if training mode is enabled
  chrome.storage.local.get(['trainingEnabled'], function(result) {
    if (result.hasOwnProperty('trainingEnabled')) {
      elements.trainingToggle.checked = result.trainingEnabled;
    } else {
      // Default to enabled
      chrome.storage.local.set({ trainingEnabled: true });
    }
  });
}

// Check the safety status of the current tab
function checkCurrentTabStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length > 0) {
      const currentUrl = tabs[0].url;
      
      // Skip chrome:// urls
      if (currentUrl.startsWith('chrome://')) {
        updateStatusDisplay({
          safe: true,
          icon: '⚠️',
          title: 'Browser Page',
          message: 'PhishGuard doesn\'t analyze browser pages'
        });
        return;
      }
      
      // Analyze the current URL
      chrome.runtime.sendMessage({
        action: 'analyzeUrl',
        url: currentUrl
      }, function(response) {
        if (response && !response.error) {
          if (response.isPhishing && response.confidence > 0.7) {
            updateStatusDisplay({
              safe: false,
              icon: '⚠️',
              title: 'Potential Phishing Site',
              message: response.reason
            });
          } else if (response.isPhishing) {
            updateStatusDisplay({
              safe: 'warning',
              icon: '⚠️',
              title: 'Suspicious Site',
              message: 'Some phishing indicators detected'
            });
          } else {
            updateStatusDisplay({
              safe: true,
              icon: '✓',
              title: 'Protection Active',
              message: 'This site appears to be safe'
            });
          }
        }
      });
    }
  });
}

// Update the status display
function updateStatusDisplay(status) {
  // Set background color based on status
  let bgColor = '#e8f0fe'; // default blue
  if (status.safe === false) {
    bgColor = '#fce8e6'; // red
  } else if (status.safe === 'warning') {
    bgColor = '#fef7e0'; // yellow
  }
  
  elements.currentStatus.style.backgroundColor = bgColor;
  
  // Update status content
  elements.currentStatus.innerHTML = `
    <div class="status-icon">${status.icon}</div>
    <div class="status-text">
      <h2>${status.title}</h2>
      <p>${status.message}</p>
    </div>
  `;
}

// Set up event listeners
function setupEventListeners() {
  // Training mode toggle
  elements.trainingToggle.addEventListener('change', function() {
    const isEnabled = this.checked;
    chrome.storage.local.set({ trainingEnabled: isEnabled });
  });
  
  // Run simulation button
  elements.runSimulationBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length > 0) {
        chrome.runtime.sendMessage({
          action: 'runManualSimulation',
          tabId: tabs[0].id
        });
        window.close(); // Close the popup
      }
    });
  });
  
  // View dashboard button
  elements.viewDashboardBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);