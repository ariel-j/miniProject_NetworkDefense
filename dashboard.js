// PhishGuard Dashboard JavaScript - FIXED VERSION with proper statistics tracking
// This file must be separate from HTML to comply with Content Security Policy

// FIXED: Load and display user stats with proper counters
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
      
      // FIXED: Use the dedicated simulationsPassed counter
      if (simulationsPassedEl) simulationsPassedEl.textContent = stats.simulationsPassed || 0;
      
      if (threatsBlockedEl) threatsBlockedEl.textContent = stats.phishingSitesBlocked || 0;
      
      // FIXED: Calculate protection score based on actual counters
      let protectionScore = 0;
      const totalSimulations = stats.simulationsShown || 0;
      const passedSimulations = stats.simulationsPassed || 0;
      
      if (totalSimulations > 0) {
        protectionScore = Math.round((passedSimulations / totalSimulations) * 100);
      }
      if (protectionScoreEl) protectionScoreEl.textContent = protectionScore + '%';
      
      // Update training history
      updateTrainingHistory(stats.trainingHistory || []);
      
      // Update recent activity
      updateRecentActivity(stats.trainingHistory || []);
      
      // Add debug info to console
      console.log('PhishGuard Dashboard Stats:', {
        shown: totalSimulations,
        passed: passedSimulations,
        fallen: stats.simulationsFallen || 0,
        blocked: stats.phishingSitesBlocked || 0,
        score: protectionScore
      });
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
    
    // Format simulation type nicely
    const simulationTypeLabels = {
      urgencyTactics: 'Urgency Tactics',
      loginFormSpoofing: 'Login Form Spoofing',
      misspelledDomains: 'Misspelled Domains',
      securityFalseClaims: 'Security False Claims',
      financialBait: 'Financial Bait'
    };
    const simulationType = simulationTypeLabels[activity.simulationType] || activity.simulationType || 'Training Simulation';
    
    activitiesHTML += `
      <div style="padding: 10px; border-bottom: 1px solid #e8eaed; display: flex; align-items: center;">
        <span style="font-size: 18px; margin-right: 10px;">${icon}</span>
        <div style="flex: 1;">
          <div style="font-weight: 500;">${simulationType}</div>
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

// FIXED: Reset stats function for testing
function resetStats() {
  if (confirm('Are you sure you want to reset all PhishGuard statistics? This cannot be undone.')) {
    chrome.runtime.sendMessage({ action: 'resetStats' }, (response) => {
      if (response && response.success) {
        console.log('PhishGuard: Stats reset successfully');
        loadUserStats(); // Refresh display
        alert('Statistics have been reset successfully!');
      } else {
        console.error('PhishGuard: Failed to reset stats:', response?.error);
        alert('Failed to reset statistics. Check console for details.');
      }
    });
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('PhishGuard: Dashboard loaded');
  
  // Load user stats immediately
  loadUserStats();
  
  // Refresh stats every 30 seconds
  setInterval(loadUserStats, 30000);
  
  // Add reset stats button
  if (chrome.runtime.getManifest().name.includes('Training')) {
    const container = document.querySelector('.container');
    if (container) {
      const testSection = document.createElement('div');
      testSection.style.cssText = 'margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;';
      testSection.innerHTML = `
        <h3>Statistics Management</h3>
        <button id="reset-stats-btn" style="padding: 10px 20px; background: #ea4335; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
          Reset All Stats
        </button>
        <p style="font-size: 12px; color: #5f6368; margin-top: 10px;">
          This will permanently clear all training history and statistics
        </p>
      `;
      container.appendChild(testSection);
      
      // Add event listener for the reset button (CSP compliant)
      document.getElementById('reset-stats-btn')?.addEventListener('click', resetStats);
    }
  }
});

// Enhanced Analytics Tab JavaScript
document.addEventListener('DOMContentLoaded', function() {
  initializeAnalytics();
});

function initializeAnalytics() {
  // Animate progress bars
  animateProgressBars();
  
  // Initialize chart controls
  initializeChartControls();
  
  // Load real data
  loadAnalyticsData();
  
  // Setup periodic updates
  setInterval(updateAnalytics, 5000);
}

function animateProgressBars() {
  const progressBars = document.querySelectorAll('.animated-progress .progress-fill');
  
  progressBars.forEach((bar, index) => {
    const target = parseInt(bar.getAttribute('data-target'));
    const percentageElement = bar.parentElement.parentElement.querySelector('.vulnerability-percentage');
    
    setTimeout(() => {
      bar.style.width = target + '%';
      
      // Animate percentage counter
      animateCounter(percentageElement, 0, target, 1500);
    }, index * 200);
  });
}

function animateCounter(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.round(current) + '%';
  }, 16);
}

function initializeChartControls() {
  const chartButtons = document.querySelectorAll('.chart-btn');
  
  chartButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      chartButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const period = this.getAttribute('data-period');
      updateChart(period);
    });
  });
}

function updateChart(period) {
  const chartPeriod = document.querySelector('.chart-period');
  const periodNames = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days', 
    '90d': 'Last 3 Months',
    '1y': 'Last Year'
  };
  
  chartPeriod.textContent = periodNames[period] || 'Last 30 Days';
  
  // Here you would typically fetch new data and update the chart
  console.log('Updating chart for period:', period);
}

function loadAnalyticsData() {
  // Load real user statistics
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ action: 'getUserStats' }, (response) => {
      if (response && !response.error) {
        updateAnalyticsDisplay(response);
      }
    });
  }
}

function updateAnalyticsDisplay(stats) {
  // Update performance metrics
  document.getElementById('analytics-success-rate').textContent = 
    stats.simulationsShown > 0 ? Math.round((stats.simulationsPassed / stats.simulationsShown) * 100) + '%' : '0%';
  
  document.getElementById('analytics-training-hours').textContent = 
    Math.round((stats.simulationsShown || 0) * 0.5); // Approximate training hours
  
  document.getElementById('analytics-threats-analyzed').textContent = 
    (stats.simulationsShown || 0) + (stats.phishingSitesBlocked || 0);
  
  document.getElementById('analytics-security-score').textContent = 
    calculateSecurityScore(stats);
  
  // Update recent activity
  updateRecentActivityAnalytics(stats.trainingHistory || []);
}

function calculateSecurityScore(stats) {
  const successRate = stats.simulationsShown > 0 ? (stats.simulationsPassed / stats.simulationsShown) : 0;
  const totalActivity = (stats.simulationsShown || 0) + (stats.phishingSitesBlocked || 0);
  
  let score = Math.round(successRate * 70 + Math.min(totalActivity * 2, 30));
  
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  return 'C';
}

function updateRecentActivityAnalytics(history) {
  const container = document.getElementById('recent-activity-analytics');
  
  if (!history || history.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <p>No training data available</p>
        <p style="font-size: 14px;">Complete some training simulations to see detailed analytics</p>
      </div>
    `;
    return;
  }
  
  const recent = history.slice(-5).reverse();
  let html = '';
  
  recent.forEach(activity => {
    const timeAgo = getTimeAgo(new Date(activity.date));
    const resultClass = activity.fell ? 'result-fail' : 'result-success';
    const resultIcon = activity.fell ? '✗' : '✓';
    const score = activity.fell ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 30) + 70;
    
    html += `
      <div class="activity-item ${resultClass}">
        <div class="activity-icon">${resultIcon}</div>
        <div class="activity-info">
          <div class="activity-title">${activity.simulationType || 'Training Simulation'}</div>
          <div class="activity-time">${timeAgo}</div>
        </div>
        <div class="activity-score">Score: ${score}</div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function updateAnalytics() {
  // Update next scan time
  const nextScanElement = document.getElementById('next-scan-time');
  if (nextScanElement) {
    const now = new Date();
    const nextScan = new Date(now.getTime() + Math.random() * 300000); // Random time within 5 minutes
    nextScanElement.textContent = nextScan.toLocaleTimeString();
  }
  
  // Refresh data
  loadAnalyticsData();
}

console.log('Enhanced Analytics Tab: JavaScript loaded');

console.log('PhishGuard: Dashboard JavaScript loaded and ready');