// PhishGuard Dashboard JavaScript - FIXED CSP VERSION
// This file must be separate from HTML to comply with Content Security Policy

// Load and display user stats
function loadUserStats() {
  chrome.runtime.sendMessage({ action: 'getUserStats' }, (response) => {
    if (response && !response.error) {
      const stats = response;
      
      // Update count displays
      const simulationsShownEl = document.getElementById('simulations-shown');
      const simulationsPassedEl = document.getElementById('simulations-passed');
      const threatsBlockedEl = document.getElementById('threats-blocked');
      const protectionScoreEl = document.getElementById('protection-score');
      
      if (simulationsShownEl) simulationsShownEl.textContent = stats.simulationsShown || 0;
      
      const passedCount = (stats.simulationsShown || 0) - (stats.simulationsFallen || 0);
      if (simulationsPassedEl) simulationsPassedEl.textContent = passedCount;
      
      if (threatsBlockedEl) threatsBlockedEl.textContent = stats.phishingSitesBlocked || 0;
      
      // Calculate and update protection score
      let protectionScore = 0;
      if (stats.simulationsShown > 0) {
        protectionScore = Math.round((passedCount / stats.simulationsShown) * 100);
      }
      if (protectionScoreEl) protectionScoreEl.textContent = protectionScore + '%';
      
      // Update training history
      updateTrainingHistory(stats.trainingHistory || []);
      
      // Update recent activity
      updateRecentActivity(stats.trainingHistory || []);
    } else {
      console.error('PhishGuard: Error loading user stats:', response?.error);
    }
  });
}

// Update training history table
function updateTrainingHistory(history) {
  const tableBody = document.getElementById('history-table-body');
  if (!tableBody) return;
  
  if (!history || history.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; color: #5f6368; padding: 40px;">
          No training history yet. Start browsing to see training simulations appear!
        </td>
      </tr>
    `;
    return;
  }
  
  // Clear existing content
  tableBody.innerHTML = '';
  
  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Show only last 10 entries
  const recentHistory = sortedHistory.slice(0, 10);
  
  // Add each history entry to the table
  recentHistory.forEach(entry => {
    const formattedDate = new Date(entry.date).toLocaleString();
    
    // Format simulation type nicely
    const simulationTypeLabels = {
      urgencyTactics: 'Urgency Tactics',
      loginFormSpoofing: 'Login Form Spoofing',
      misspelledDomains: 'Misspelled Domains',
      securityFalseClaims: 'Security False Claims',
      financialBait: 'Financial Bait'
    };
    const simulationType = simulationTypeLabels[entry.simulationType] || entry.simulationType || 'Unknown';
    
    const historyRow = document.createElement('tr');
    historyRow.innerHTML = `
      <td>${formattedDate}</td>
      <td>${simulationType}</td>
      <td class="${entry.fell ? 'simulation-result-fail' : 'simulation-result-success'}">
        ${entry.fell ? 'Failed' : 'Passed'}
      </td>
    `;
    
    tableBody.appendChild(historyRow);
  });
}

// Update recent activity section
function updateRecentActivity(history) {
  const recentActivityEl = document.getElementById('recent-activity');
  if (!recentActivityEl) return;
  
  if (!history || history.length === 0) {
    recentActivityEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p>No recent training activity</p>
        <p style="font-size: 14px;">Training simulations will appear here as you browse</p>
      </div>
    `;
    return;
  }
  
  // Get last 3 activities
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recentActivities = sortedHistory.slice(0, 3);
  
  let activitiesHTML = '';
  recentActivities.forEach(activity => {
    const timeAgo = getTimeAgo(new Date(activity.date));
    const icon = activity.fell ? '❌' : '✅';
    const status = activity.fell ? 'Failed' : 'Passed';
    const statusClass = activity.fell ? 'simulation-result-fail' : 'simulation-result-success';
    
    activitiesHTML += `
      <div style="padding: 10px; border-bottom: 1px solid #e8eaed; display: flex; align-items: center;">
        <span style="font-size: 18px; margin-right: 10px;">${icon}</span>
        <div style="flex: 1;">
          <div style="font-weight: 500;">${activity.simulationType || 'Training Simulation'}</div>
          <div style="font-size: 12px; color: #5f6368;">${timeAgo}</div>
        </div>
        <div class="${statusClass}" style="font-weight: 500;">${status}</div>
      </div>
    `;
  });
  
  recentActivityEl.innerHTML = activitiesHTML;
}

// Helper function to get time ago string
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

// Test phishing detection function
function testPhishingDetection() {
  const testUrls = [
    'http://secure-login-verify.com',
    'https://amaz0n.com',
    'https://paypa1.com',
    'https://google.com',
    'http://192.168.1.1'
  ];
  
  console.log('PhishGuard: Testing phishing detection...');
  
  testUrls.forEach(url => {
    chrome.runtime.sendMessage({ action: 'analyzeUrl', url }, (response) => {
      if (response && !response.error) {
        console.log(`URL: ${url}`);
        console.log(`- Is Phishing: ${response.isPhishing}`);
        console.log(`- Confidence: ${Math.round(response.confidence * 100)}%`);
        console.log(`- Reason: ${response.reason}`);
        console.log('---');
      }
    });
  });
}

// Run manual simulation for testing
function runTestSimulation() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length > 0) {
      chrome.runtime.sendMessage({
        action: 'runManualSimulation',
        tabId: tabs[0].id
      }, (response) => {
        if (response && response.success) {
          console.log('PhishGuard: Test simulation triggered');
        } else {
          console.error('PhishGuard: Failed to trigger test simulation:', response?.error);
        }
      });
    }
  });
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('PhishGuard: Dashboard loaded');
  
  // Load user stats immediately
  loadUserStats();
  
  // Refresh stats every 30 seconds
  setInterval(loadUserStats, 30000);
  
  // Add test buttons for debugging (only in development)
  if (chrome.runtime.getManifest().name.includes('Training')) {
    const container = document.querySelector('.container');
    if (container) {
      const testSection = document.createElement('div');
      testSection.style.cssText = 'margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px;';
      testSection.innerHTML = `
        <h3>Testing Tools (Development)</h3>
        <button onclick="testPhishingDetection()" style="margin-right: 10px; padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Test Phishing Detection
        </button>
        <button onclick="runTestSimulation()" style="padding: 8px 16px; background: #34a853; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Run Test Simulation
        </button>
        <p style="font-size: 12px; color: #5f6368; margin-top: 10px;">
          Check browser console for test results
        </p>
      `;
      container.appendChild(testSection);
    }
  }
});

// Make functions available globally for onclick handlers
window.testPhishingDetection = testPhishingDetection;
window.runTestSimulation = runTestSimulation;