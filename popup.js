// PhishGuard popup.js - FIXED VERSION with proper statistics tracking

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

// FIXED: Load and display user stats with proper counters
function loadUserStats() {
  chrome.runtime.sendMessage({ action: 'getUserStats' }, (response) => {
    if (response && !response.error) {
      const stats = response;
      
      // Update count displays
      elements.simulationsShown.textContent = stats.simulationsShown || 0;
      
      // FIXED: Use the dedicated simulationsPassed counter
      elements.simulationsPassed.textContent = stats.simulationsPassed || 0;
      
      elements.threatsBlocked.textContent = stats.phishingSitesBlocked || 0;
      
      // FIXED: Calculate protection score based on actual counters
      let protectionScore = 0;
      const totalSimulations = stats.simulationsShown || 0;
      const passedSimulations = stats.simulationsPassed || 0;
      
      if (totalSimulations > 0) {
        protectionScore = Math.round((passedSimulations / totalSimulations) * 100);
      }
      elements.protectionScore.textContent = `${protectionScore}%`;
      
      // Add debug info to console
      console.log('PhishGuard Stats:', {
        shown: totalSimulations,
        passed: passedSimulations,
        fallen: stats.simulationsFallen || 0,
        blocked: stats.phishingSitesBlocked || 0,
        score: protectionScore
      });
    }
  });
  
  // Check if training mode is enabled
  chrome.storage.local.get(['trainingEnabled'], function(result) {
    if (result.hasOwnProperty('trainingEnabled')) {
      elements.trainingToggle.checked = result.trainingEnabled;
    } else {
      // Default to enabled
      elements.trainingToggle.checked = true;
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
    console.log('PhishGuard: Training mode', isEnabled ? 'enabled' : 'disabled');
  });
  
  // Run simulation button
  elements.runSimulationBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length > 0) {
        const currentTab = tabs[0];
        
        // Check if tab URL is valid for content script injection
        if (currentTab.url.startsWith('chrome://') || 
            currentTab.url.startsWith('chrome-extension://') ||
            currentTab.url.startsWith('moz-extension://') ||
            currentTab.url.startsWith('about:') ||
            currentTab.url.startsWith('file://')) {
          alert('Cannot run simulation on this page. Please navigate to a regular website first.');
          return;
        }
        
        // First, ensure content script is injected
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          files: ['content.js']
        }).then(() => {
          // Now send the simulation message
          chrome.runtime.sendMessage({
            action: 'runManualSimulation',
            tabId: currentTab.id
          }, function(response) {
            if (response && response.success) {
              console.log('PhishGuard: Manual simulation triggered');
              // Refresh stats after simulation
              setTimeout(loadUserStats, 1000);
            } else {
              console.error('PhishGuard: Failed to trigger simulation:', response?.error);
              alert('Failed to run simulation. Make sure you\'re on a regular website.');
            }
          });
        }).catch((error) => {
          console.error('PhishGuard: Failed to inject content script:', error);
          alert('Cannot inject content script on this page. Try a different website.');
        });
        
        window.close(); // Close the popup
      }
    });
  });
  
  // View dashboard button
  elements.viewDashboardBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  });
  
  // FIXED: Add double-click on logo to reset stats (for testing)
  const header = document.querySelector('.header');
  if (header) {
    let clickCount = 0;
    header.addEventListener('click', function() {
      clickCount++;
      setTimeout(() => { clickCount = 0; }, 1000);
      
      if (clickCount === 3) {
        if (confirm('Reset all PhishGuard statistics? This cannot be undone.')) {
          chrome.runtime.sendMessage({ action: 'resetStats' }, function(response) {
            if (response && response.success) {
              console.log('PhishGuard: Stats reset successfully');
              loadUserStats(); // Refresh display
            }
          });
        }
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);