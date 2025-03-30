// PhishGuard dashboard.js

// DOM elements
const elements = {
    simulationsShown: document.getElementById('simulations-shown'),
    simulationsPassed: document.getElementById('simulations-passed'),
    threatsBlocked: document.getElementById('threats-blocked'),
    protectionScore: document.getElementById('protection-score'),
    vulnerabilityContainer: document.getElementById('vulnerability-container'),
    historyTableBody: document.getElementById('history-table-body'),
    progressChart: document.getElementById('progress-chart'),
    learnUrgency: document.getElementById('learn-urgency'),
    learnLogin: document.getElementById('learn-login'),
    learnUrl: document.getElementById('learn-url'),
    learnFinancial: document.getElementById('learn-financial')
  };
  
  let userStats = null;  
  function initialize() {
    loadUserStats();
    setupEventListeners();
  }
  
  // Load and display user stats
  function loadUserStats() {
    chrome.storage.local.get(['userStats'], function(result) {
      if (result.userStats) {
        userStats = result.userStats;
        
        // Update count displays
        elements.simulationsShown.textContent = userStats.simulationsShown;
        
        const passedCount = userStats.simulationsShown - userStats.simulationsFallen;
        elements.simulationsPassed.textContent = passedCount;
        
        elements.threatsBlocked.textContent = userStats.phishingSitesBlocked;
        
        // Calculate and update protection score
        let protectionScore = 0;
        if (userStats.simulationsShown > 0) {
          protectionScore = Math.round((passedCount / userStats.simulationsShown) * 100);
        }
        elements.protectionScore.textContent = `${protectionScore}%`;
        
        // Populate vulnerability chart
        updateVulnerabilityChart(userStats.vulnerabilityAreas);
        
        // Populate training history
        updateTrainingHistory(userStats.trainingHistory);
        
        // Generate progress chart
        if (userStats.trainingHistory && userStats.trainingHistory.length > 1) {
          generateProgressChart(userStats.trainingHistory);
        }
      }
    });
  }
  
  // Update the vulnerability chart
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
      
      const vulnerabilityItem = document.createElement('li');
      vulnerabilityItem.className = 'vulnerability-item';
      vulnerabilityItem.innerHTML = `
        <div class="vulnerability-label">${label}</div>
        <div class="vulnerability-bar-container">
          <div class="vulnerability-bar" style="width: ${percentage}%"></div>
        </div>
        <div class="vulnerability-score">${score}</div>
      `;
      
      elements.vulnerabilityContainer.appendChild(vulnerabilityItem);
    }
  }
  
  // Update the training history table
  function updateTrainingHistory(history) {
    if (!history || history.length === 0) {
      elements.historyTableBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: #5f6368;">No training history yet</td>
        </tr>
      `;
      return;
    }
    
    // Clear existing content
    elements.historyTableBody.innerHTML = '';
    
    // Sort history by date (newest first)
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Create HTML for each history entry
    const simulationTypeLabels = {
      urgencyTactics: 'Urgency Tactics',
      loginFormSpoofing: 'Login Form Spoofing',
      misspelledDomains: 'Misspelled Domains',
      securityFalseClaims: 'Security False Claims',
      financialBait: 'Financial Bait'
    };
    
    // Badge classes for each simulation type
    const simulationTypeBadges = {
      urgencyTactics: 'badge-urgency',
      loginFormSpoofing: 'badge-login',
      misspelledDomains: 'badge-misspelled',
      securityFalseClaims: 'badge-security',
      financialBait: 'badge-financial'
    };
    
    // Add each history entry to the table
    for (const entry of sortedHistory) {
      const formattedDate = new Date(entry.date).toLocaleString();
      const typeLabel = simulationTypeLabels[entry.simulationType] || entry.simulationType;
      const typeBadgeClass = simulationTypeBadges[entry.simulationType] || '';
      
      const historyRow = document.createElement('tr');
      historyRow.innerHTML = `
        <td>${formattedDate}</td>
        <td><span class="badge ${typeBadgeClass}">${typeLabel}</span></td>
        <td class="${entry.fell ? 'simulation-result-fail' : 'simulation-result-success'}">
          ${entry.fell ? 'Failed' : 'Passed'}
        </td>
      `;
      
      elements.historyTableBody.appendChild(historyRow);
    }
  }
  
  // Generate progress chart
  function generateProgressChart(history) {
    // We'll use a simple placeholder for now
    // In a real implementation, you'd use a charting library like Chart.js
    
    elements.progressChart.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <p style="margin-bottom: 15px; color: #5f6368;">Success rate over time:</p>
        <div style="height: 200px; display: flex; align-items: flex-end; justify-content: space-between; padding: 0 30px;">
          <!-- Simplified chart bars -->
          <div style="
            width: 30px;
            height: 60%; 
            background-color: #4285f4;
            position: relative;
          ">
            <span style="
              position: absolute;
              bottom: -25px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 12px;
              color: #5f6368;
            ">Week 1</span>
          </div>
          <div style="
            width: 30px;
            height: 40%; 
            background-color: #4285f4;
            position: relative;
          ">
            <span style="
              position: absolute;
              bottom: -25px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 12px;
              color: #5f6368;
            ">Week 2</span>
          </div>
          <div style="
            width: 30px;
            height: 70%; 
            background-color: #4285f4;
            position: relative;
          ">
            <span style="
              position: absolute;
              bottom: -25px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 12px;
              color: #5f6368;
            ">Week 3</span>
          </div>
          <div style="
            width: 30px;
            height: 85%; 
            background-color: #4285f4;
            position: relative;
          ">
            <span style="
              position: absolute;
              bottom: -25px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 12px;
              color: #5f6368;
            ">Current</span>
          </div>
        </div>
      </div>
    `;
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Learning resource links
    elements.learnUrgency.addEventListener('click', function(e) {
      e.preventDefault();
      openLearningResource('urgencyTactics');
    });
    
    elements.learnLogin.addEventListener('click', function(e) {
      e.preventDefault();
      openLearningResource('loginFormSpoofing');
    });
    
    elements.learnUrl.addEventListener('click', function(e) {
      e.preventDefault();
      openLearningResource('misspelledDomains');
    });
    
    elements.learnFinancial.addEventListener('click', function(e) {
      e.preventDefault();
      openLearningResource('financialBait');
    });
  }
  
  // Open a learning resource page
  function openLearningResource(resourceType) {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL(`learning/${resourceType}.html`) 
    });
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', initialize);