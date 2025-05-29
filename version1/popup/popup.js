const elements = {
    currentStatus: document.getElementById('current-status'),
    simulationsShown: document.getElementById('simulations-shown'),
    simulationsPassed: document.getElementById('simulations-passed'),
    threatsBlocked: document.getElementById('threats-blocked'),
    protectionScore: document.getElementById('protection-score'),
    trainingToggle: document.getElementById('training-toggle-checkbox'),
    vulnerabilityContainer: document.getElementById('vulnerability-container'),
    runSimulationBtn: document.getElementById('run-simulation-btn'),
    viewDashboardBtn: document.getElementById('view-dashboard-btn')
  };
  
  // Initialize popup
  function initialize() {
    loadUserStats();
    checkCurrentTabStatus();    
    setupEventListeners();
  }
  
  function loadUserStats() {
    chrome.storage.local.get(['userStats'], function(result) {
      if (result.userStats) {
        const stats = result.userStats;
        
        // Update count displays
        elements.simulationsShown.textContent = stats.simulationsShown;   
        const passedCount = stats.simulationsShown - stats.simulationsFallen;
        elements.simulationsPassed.textContent = passedCount;       
        elements.threatsBlocked.textContent = stats.phishingSitesBlocked;
        
        // Calculate and update protection score
        let protectionScore = 0;
        if (stats.simulationsShown > 0) {
          protectionScore = Math.round((passedCount / stats.simulationsShown) * 100);
        }
        elements.protectionScore.textContent = `${protectionScore}%`;
        
        // Populate vulnerability chart
        updateVulnerabilityChart(stats.vulnerabilityAreas);
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
  
  function updateVulnerabilityChart(vulnerabilityAreas) {
    // Clear existing content
    elements.vulnerabilityContainer.innerHTML = '';
    
    // Get all vulnerability scores and find the max
    const scores = Object.values(vulnerabilityAreas);
    const maxScore = Math.max(...scores, 1); // Ensure we don't divide by zero
    
    // Create HTML for each vulnerability
    const vulnerabilityLabels = {
      urgencyTactics: 'Urgency Tactics',
      loginFormSpoofing: 'Login Form Spoofing',
      misspelledDomains: 'Misspelled Domains',
      securityFalseClaims: 'Security False Claims',
      financialBait: 'Financial Bait'
    };
    
    // Sort vulnerabilities by score (highest first)
    const sortedVulnerabilities = Object.entries(vulnerabilityAreas)
      .sort((a, b) => b[1] - a[1]);
    
    // Add each vulnerability to the chart
    for (const [key, score] of sortedVulnerabilities) {
      const percentage = (score / maxScore) * 100;
      const label = vulnerabilityLabels[key] || key;
      
      const vulnerabilityItem = document.createElement('div');
      vulnerabilityItem.className = 'vulnerability-item';
      vulnerabilityItem.innerHTML = `
        <div class="vulnerability-label">${label}</div>
        <div class="vulnerability-bar-container">
          <div class="vulnerability-bar" style="width: ${percentage}%"></div>
        </div>
      `;
      
      elements.vulnerabilityContainer.appendChild(vulnerabilityItem);
    }
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
          if (response) {
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
  
  function updateStatusDisplay(status) {
    let bgColor = '#e8f0fe'; 
    if (status.safe === false) {
      bgColor = '#fce8e6'; 
    } else if (status.safe === 'warning') {
      bgColor = '#fef7e0'; 
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
  
  function setupEventListeners() {
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
          window.close(); 
        }
      });
    });
    
    // View dashboard button
    elements.viewDashboardBtn.addEventListener('click', function() {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/index.html') });
    });
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', initialize);