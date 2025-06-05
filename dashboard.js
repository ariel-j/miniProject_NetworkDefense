// PhishGuard Dashboard JavaScript - FIXED VERSION with working tab navigation

// Track if event listeners have been added to prevent duplicates
let eventListenersAdded = false;

// Tab Navigation System
function initializeTabNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Add click event listeners to all nav tabs
  navTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      
      // Remove active class from all tabs and content
      navTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Show corresponding content
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
      }
      
      console.log('PhishGuard: Switched to tab:', targetTab);
      
      // Load specific content based on tab
      switch(targetTab) {
        case 'analytics':
          initializeAnalytics();
          break;
        case 'training':
          initializeTrainingLab();
          break;
        case 'resources':
          initializeResources();
          break;
        case 'dashboard':
        default:
          loadUserStats();
          break;
      }
    });
  });
  
  console.log('PhishGuard: Tab navigation initialized');
}

// Training Lab Initialization
function initializeTrainingLab() {
  console.log('PhishGuard: Training Lab initialized');
  
  // Only add event listeners once to prevent duplicates
  if (eventListenersAdded) {
    console.log('PhishGuard: Event listeners already added, skipping');
    return;
  }
  
  // Hide the Execute Training Simulation button since it doesn't work on extension pages
  const runTrainingBtn = document.getElementById('run-training-simulation');
  if (runTrainingBtn) {
    runTrainingBtn.style.display = 'none';
    
    // Add helpful explanation instead
    const explanation = document.createElement('div');
    explanation.style.cssText = `
      padding: 15px;
      background: rgba(0, 212, 255, 0.1);
      border: 1px solid var(--accent-blue);
      border-radius: 8px;
      color: var(--text-secondary);
      text-align: center;
      margin-bottom: 20px;
    `;
    explanation.innerHTML = `
      <p><strong>🎯 Automatic Training Simulations</strong></p>
      <p style="font-size: 14px; margin-top: 8px;">
        Training simulations appear automatically while browsing regular websites based on your settings. 
        Use the training modules below to learn about specific phishing techniques.
      </p>
    `;
    runTrainingBtn.parentNode.insertBefore(explanation, runTrainingBtn);
  }
  
  // Add event listeners for training modules
  const moduleButtons = document.querySelectorAll('[data-module]');
  moduleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const module = this.getAttribute('data-module');
      launchTrainingModule(module);
    });
  });
  
  // Mark that event listeners have been added
  eventListenersAdded = true;
}

// Launch specific training module
function launchTrainingModule(moduleType) {
  // Map module types to learning resources (only working modules)
  const moduleMap = {
    'urgency': 'urgencyTactics',
    'login': 'loginFormSpoofing', 
    'financial': 'financialBait'
    // Removed: domain, email, mobile (no proper learning materials yet)
  };
  
  const resourceFile = moduleMap[moduleType];
  if (!resourceFile) {
    showNotification('This training module is coming soon!', 'info');
    return;
  }
  
  const url = chrome.runtime.getURL(`learning/${resourceFile}.html`);
  
  chrome.tabs.create({ url: url }, function(tab) {
    console.log(`PhishGuard: Opened training module ${moduleType}`);
    showNotification(`Opening ${moduleType} training module...`, 'info');
  });
}

// Resources Tab Initialization
function initializeResources() {
  console.log('PhishGuard: Resources initialized');
  
  // Only add event listeners once to prevent duplicates
  if (eventListenersAdded) {
    console.log('PhishGuard: Event listeners already added for resources, skipping');
    return;
  }
  
  // Add event listeners for resource items
  const resourceItems = document.querySelectorAll('[data-resource]');
  resourceItems.forEach(item => {
    item.addEventListener('click', function() {
      const resource = this.getAttribute('data-resource');
      openResource(resource);
    });
  });
  
  // Add event listeners for external resources
  const externalItems = document.querySelectorAll('[data-external]');
  externalItems.forEach(item => {
    item.addEventListener('click', function() {
      const url = this.getAttribute('data-external');
      chrome.tabs.create({ url: url });
    });
  });
}

// Open internal resource
function openResource(resourceType) {
  // Map resources to actual files or actions
  const resourceActions = {
    'phishing-guide': () => openLearningResource('urgencyTactics'),
    'social-engineering': () => openLearningResource('loginFormSpoofing'),
    'incident-response': () => showNotification('Incident response guide coming soon!', 'info'),
    'security-tools': () => showNotification('Security tools guide coming soon!', 'info'),
    'quick-tips': () => showNotification('Quick tips guide coming soon!', 'info'),
    'case-studies': () => showNotification('Case studies coming soon!', 'info'),
    'videos': () => showNotification('Training videos coming soon!', 'info'),
    'updates': () => showNotification('Threat intelligence updates coming soon!', 'info')
  };
  
  const action = resourceActions[resourceType];
  if (action) {
    action();
  } else {
    showNotification('Resource not yet available', 'info');
  }
}

// Open learning resource
function openLearningResource(resourceType) {
  const url = chrome.runtime.getURL(`learning/${resourceType}.html`);
  chrome.tabs.create({ url: url });
}

// Show notification (simple version)
function showNotification(message, type = 'info') {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;
  
  // Set color based on type
  switch(type) {
    case 'success':
      notification.style.background = 'linear-gradient(135deg, #00ff41, #00d4ff)';
      break;
    case 'error':
      notification.style.background = 'linear-gradient(135deg, #ff0040, #ff6600)';
      break;
    case 'info':
    default:
      notification.style.background = 'linear-gradient(135deg, #00d4ff, #00ff41)';
      break;
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 4000);
}

// FIXED: Load and display user stats with proper counters
function loadUserStats() {
  chrome.runtime.sendMessage({ action: 'getUserStats' }, (response) => {
    if (response && !response.error) {
      const stats = response;
      
      // Update count displays for dashboard
      const simulationsShownEl = document.getElementById('simulations-shown');
      const simulationsPassedEl = document.getElementById('simulations-passed');
      const threatsBlockedEl = document.getElementById('threats-blocked');
      const protectionScoreEl = document.getElementById('protection-score');
      
      if (simulationsShownEl) simulationsShownEl.textContent = stats.simulationsShown || 0;
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
      
      // Update recent activity for analytics
      updateRecentActivity(stats.trainingHistory || []);
      
      // Update defense level in terminal
      updateDefenseLevel(protectionScore);
      
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

// Update defense level based on protection score
function updateDefenseLevel(score) {
  const defenseLevelEl = document.getElementById('defense-level');
  if (defenseLevelEl) {
    if (score >= 90) {
      defenseLevelEl.textContent = 'MAXIMUM';
      defenseLevelEl.style.color = '#00ff41';
    } else if (score >= 70) {
      defenseLevelEl.textContent = 'HIGH';
      defenseLevelEl.style.color = '#00d4ff';
    } else if (score >= 50) {
      defenseLevelEl.textContent = 'MODERATE';
      defenseLevelEl.style.color = '#ffff00';
    } else {
      defenseLevelEl.textContent = 'LOW';
      defenseLevelEl.style.color = '#ff0040';
    }
  }
}

// Update training history table
function updateTrainingHistory(history) {
  const tableBody = document.getElementById('history-table-body');
  if (!tableBody) return;
  
  if (!history || history.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 40px;">
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
  const recentActivityEl = document.getElementById('recent-activity-analytics');
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
  
  // Get last 5 activities
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recentActivities = sortedHistory.slice(0, 5);
  
  let activitiesHTML = '';
  recentActivities.forEach(activity => {
    const timeAgo = getTimeAgo(new Date(activity.date));
    const resultClass = activity.fell ? 'result-fail' : 'result-success';
    const resultIcon = activity.fell ? '✗' : '✓';
    const score = activity.fell ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 30) + 70;
    
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
      <div class="activity-item ${resultClass}">
        <div class="activity-icon">${resultIcon}</div>
        <div class="activity-info">
          <div class="activity-title">${simulationType}</div>
          <div class="activity-time">${timeAgo}</div>
        </div>
        <div class="activity-score">Score: ${score}</div>
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

// Enhanced Analytics Tab JavaScript
function initializeAnalytics() {
  console.log('PhishGuard: Analytics initialized');
  
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
  
  if (chartPeriod) {
    chartPeriod.textContent = periodNames[period] || 'Last 30 Days';
  }
  
  console.log('PhishGuard: Updated chart for period:', period);
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
  // Update performance metrics with real data
  const successRateEl = document.getElementById('analytics-success-rate');
  const trainingHoursEl = document.getElementById('analytics-training-hours');
  const threatsAnalyzedEl = document.getElementById('analytics-threats-analyzed');
  const securityScoreEl = document.getElementById('analytics-security-score');
  
  if (successRateEl) {
    const successRate = stats.simulationsShown > 0 ? Math.round((stats.simulationsPassed / stats.simulationsShown) * 100) : 0;
    successRateEl.textContent = successRate + '%';
    
    // Update trend arrow dynamically
    const trendEl = successRateEl.closest('.stat-item').querySelector('.stat-trend');
    if (trendEl) {
      if (successRate >= 80) {
        trendEl.className = 'stat-trend positive';
        trendEl.textContent = '↗ Excellent';
      } else if (successRate >= 60) {
        trendEl.className = 'stat-trend positive';
        trendEl.textContent = '↗ Good';
      } else if (successRate >= 40) {
        trendEl.className = 'stat-trend neutral';
        trendEl.textContent = '→ Fair';
      } else {
        trendEl.className = 'stat-trend negative';
        trendEl.textContent = '↘ Needs Work';
      }
    }
  }
  
  if (trainingHoursEl) {
    const hours = Math.round((stats.simulationsShown || 0) * 0.5);
    trainingHoursEl.textContent = hours;
    
    // Update trend arrow dynamically
    const trendEl = trainingHoursEl.closest('.stat-item').querySelector('.stat-trend');
    if (trendEl) {
      if (hours >= 10) {
        trendEl.className = 'stat-trend positive';
        trendEl.textContent = '↗ Expert';
      } else if (hours >= 5) {
        trendEl.className = 'stat-trend positive';
        trendEl.textContent = '↗ +' + Math.floor(hours/2) + 'h';
      } else if (hours > 0) {
        trendEl.className = 'stat-trend neutral';
        trendEl.textContent = '→ Getting Started';
      } else {
        trendEl.className = 'stat-trend neutral';
        trendEl.textContent = '→ Begin Training';
      }
    }
  }
  
  if (threatsAnalyzedEl) {
    const threats = (stats.simulationsShown || 0) + (stats.phishingSitesBlocked || 0);
    threatsAnalyzedEl.textContent = threats;
    
    // Update trend arrow dynamically  
    const trendEl = threatsAnalyzedEl.closest('.stat-item').querySelector('.stat-trend');
    if (trendEl) {
      if (threats >= 20) {
        trendEl.className = 'stat-trend positive';
        trendEl.textContent = '↗ High Activity';
      } else if (threats >= 10) {
        trendEl.className = 'stat-trend positive';
        trendEl.textContent = '↗ Active';
      } else if (threats > 0) {
        trendEl.className = 'stat-trend neutral';
        trendEl.textContent = '→ ' + threats + ' analyzed';
      } else {
        trendEl.className = 'stat-trend neutral';
        trendEl.textContent = '→ No activity';
      }
    }
  }
  
  if (securityScoreEl) {
    const score = calculateSecurityScore(stats);
    securityScoreEl.textContent = score;
    
    // Update trend arrow dynamically
    const trendEl = securityScoreEl.closest('.stat-item').querySelector('.stat-trend');
    if (trendEl) {
      if (score === 'A+') {
        trendEl.className = 'stat-trend positive';
        trendEl.textContent = '↗ Perfect';
      } else if (score === 'A' || score === 'B+') {
        trendEl.className = 'stat-trend positive';
        trendEl.textContent = '↗ Strong';
      } else if (score === 'B') {
        trendEl.className = 'stat-trend neutral';
        trendEl.textContent = '→ Good';
      } else {
        trendEl.className = 'stat-trend negative';
        trendEl.textContent = '↘ Improve';
      }
    }
  }
  
  // Update vulnerability analysis with real data
  updateRealVulnerabilityAnalysis(stats);
  
  // Update achievements with real data
  updateRealAchievements(stats);
  
  // Update training progress chart with real data
  updateRealProgressChart(stats);
  
  // Update recent activity
  updateRecentActivity(stats.trainingHistory || []);
}

// Update training progress chart with real user data
function updateRealProgressChart(stats) {
  const chartContainer = document.querySelector('.ascii-chart');
  if (!chartContainer) return;
  
  const history = stats.trainingHistory || [];
  const successRate = stats.simulationsShown > 0 ? Math.round((stats.simulationsPassed / stats.simulationsShown) * 100) : 0;
  
  // Generate realistic progress data based on user's actual performance
  let chartHTML = '';
  
  if (history.length === 0) {
    // No data yet
    chartHTML = `
      <div class="chart-header">
        <span>Success Rate %</span>
        <span class="chart-period">No Training Data Yet</span>
      </div>
      <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <p>📊 Complete some training simulations to see your progress chart!</p>
        <p style="font-size: 14px; margin-top: 10px;">Your improvement over time will be displayed here.</p>
      </div>
    `;
  } else {
    // Show real progress based on performance
    const progressLevels = [
      { label: '100%', bar: '████████████████████████████████████████', current: successRate >= 95 },
      { label: ' 80%', bar: '████████████████████████████████░░░░░░░░', current: successRate >= 75 && successRate < 95 },
      { label: ' 60%', bar: '████████████████████████░░░░░░░░░░░░░░░░', current: successRate >= 45 && successRate < 75 },
      { label: ' 40%', bar: '████████████████░░░░░░░░░░░░░░░░░░░░░░░░', current: successRate >= 25 && successRate < 45 },
      { label: ' 20%', bar: '████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░', current: successRate >= 5 && successRate < 25 },
      { label: '  0%', bar: '░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░', current: successRate < 5 }
    ];
    
    chartHTML = `
      <div class="chart-header">
        <span>Success Rate %</span>
        <span class="chart-period">Current Performance: ${successRate}%</span>
      </div>
      <div class="chart-grid">
    `;
    
    progressLevels.forEach(level => {
      const currentClass = level.current ? ' current' : '';
      const indicator = level.current ? ' <span class="chart-indicator">◄ Your Level</span>' : '';
      
      chartHTML += `
        <div class="chart-line${currentClass}">
          <span class="chart-label">${level.label}</span>
          <span class="chart-bar">${level.bar}</span>${indicator}
        </div>
      `;
    });
    
    chartHTML += `
      </div>
      <div class="chart-footer">
        <span>Simulations: ${stats.simulationsShown || 0}</span>
        <span>Passed: ${stats.simulationsPassed || 0}</span>
        <span>Failed: ${stats.simulationsFallen || 0}</span>
        <span>Score: ${successRate}%</span>
      </div>
    `;
  }
  
  chartContainer.innerHTML = chartHTML;
}

// Update vulnerability analysis with real user data
function updateRealVulnerabilityAnalysis(stats) {
  const vulnerabilities = stats.vulnerabilityAreas || {};
  const totalSimulations = stats.simulationsShown || 0;
  
  // Calculate real percentages for each vulnerability type
  const vulnerabilityData = [
    {
      id: 'urgency',
      name: 'Urgency Tactics',
      icon: '⏰',
      failures: vulnerabilities.urgencyTactics || 0,
      total: totalSimulations
    },
    {
      id: 'login',
      name: 'Login Spoofing', 
      icon: '🔐',
      failures: vulnerabilities.loginFormSpoofing || 0,
      total: totalSimulations
    },
    {
      id: 'financial',
      name: 'Financial Bait',
      icon: '💰', 
      failures: vulnerabilities.financialBait || 0,
      total: totalSimulations
    },
    {
      id: 'domain',
      name: 'Domain Spoofing',
      icon: '🌐',
      failures: vulnerabilities.misspelledDomains || 0,
      total: totalSimulations
    }
  ];
  
  vulnerabilityData.forEach(vuln => {
    // Calculate success rate (higher = better)
    let successRate = 0;
    if (vuln.total > 0) {
      successRate = Math.round(((vuln.total - vuln.failures) / vuln.total) * 100);
    } else if (vuln.failures === 0) {
      successRate = 100; // No failures = perfect score
    }
    
    // Update the progress bar and percentage
    const progressEl = document.getElementById(vuln.id + '-progress');
    const percentageEl = document.getElementById(vuln.id + '-percentage');
    
    if (progressEl && percentageEl) {
      progressEl.style.width = successRate + '%';
      percentageEl.textContent = successRate + '%';
      
      // Update risk level based on success rate
      const riskSpan = progressEl.closest('.vulnerability-item').querySelector('.vulnerability-risk');
      if (riskSpan) {
        riskSpan.className = 'vulnerability-risk ';
        if (successRate >= 80) {
          riskSpan.className += 'low';
          riskSpan.textContent = 'Low Risk';
        } else if (successRate >= 60) {
          riskSpan.className += 'medium'; 
          riskSpan.textContent = 'Medium Risk';
        } else {
          riskSpan.className += 'high';
          riskSpan.textContent = 'High Risk';
        }
      }
      
      // Update trend based on recent performance
      const trendSpan = progressEl.closest('.vulnerability-item').querySelector('.vulnerability-trend');
      if (trendSpan) {
        // Simple trend: if success rate is high, show improving
        if (successRate >= 75) {
          trendSpan.className = 'vulnerability-trend improving';
          trendSpan.textContent = 'Improving';
        } else if (successRate >= 50) {
          trendSpan.className = 'vulnerability-trend stable';
          trendSpan.textContent = 'Stable'; 
        } else {
          trendSpan.className = 'vulnerability-trend declining';
          trendSpan.textContent = 'Needs Attention';
        }
      }
    }
  });
}

// Update achievements based on real user progress
function updateRealAchievements(stats) {
  const achievementContainer = document.querySelector('.achievement-grid');
  if (!achievementContainer) return;
  
  const achievements = [
    {
      id: 'first-defense',
      icon: '🛡️',
      name: 'First Defense',
      desc: 'Completed first training simulation',
      unlocked: (stats.simulationsShown || 0) > 0
    },
    {
      id: 'sharp-eye', 
      icon: '🎯',
      name: 'Sharp Eye',
      desc: 'Passed 5 simulations successfully',
      unlocked: (stats.simulationsPassed || 0) >= 5
    },
    {
      id: 'security-expert',
      icon: '🏅', 
      name: 'Security Expert',
      desc: 'Achieve 90% success rate',
      unlocked: stats.simulationsShown > 0 && ((stats.simulationsPassed / stats.simulationsShown) >= 0.9)
    },
    {
      id: 'cyber-guardian',
      icon: '👑',
      name: 'Cyber Guardian', 
      desc: 'Block 10 real phishing attempts',
      unlocked: (stats.phishingSitesBlocked || 0) >= 10
    },
    {
      id: 'training-veteran',
      icon: '🎖️',
      name: 'Training Veteran',
      desc: 'Complete 20 training simulations', 
      unlocked: (stats.simulationsShown || 0) >= 20
    },
    {
      id: 'perfect-defense',
      icon: '⭐',
      name: 'Perfect Defense',
      desc: 'Pass 10 simulations in a row',
      unlocked: checkConsecutivePasses(stats.trainingHistory || [], 10)
    }
  ];
  
  let achievementsHTML = '';
  achievements.forEach(achievement => {
    const statusClass = achievement.unlocked ? 'unlocked' : 'locked';
    const statusText = achievement.unlocked ? 'Unlocked' : 'Locked';
    
    achievementsHTML += `
      <div class="achievement-item ${statusClass}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.desc}</div>
        </div>
        <div class="achievement-status">${statusText}</div>
      </div>
    `;
  });
  
  achievementContainer.innerHTML = achievementsHTML;
}

// Helper function to check consecutive passes
function checkConsecutivePasses(history, targetCount) {
  if (history.length < targetCount) return false;
  
  // Sort by date and get recent entries
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let consecutivePasses = 0;
  for (let i = 0; i < Math.min(targetCount, sortedHistory.length); i++) {
    if (!sortedHistory[i].fell) {
      consecutivePasses++;
    } else {
      break; // Streak broken
    }
  }
  
  return consecutivePasses >= targetCount;
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

// FIXED: Reset stats function for testing
function resetStats() {
  if (confirm('Are you sure you want to reset all PhishGuard statistics? This cannot be undone.')) {
    chrome.runtime.sendMessage({ action: 'resetStats' }, (response) => {
      if (response && response.success) {
        console.log('PhishGuard: Stats reset successfully');
        loadUserStats(); // Refresh display
        showNotification('Statistics have been reset successfully!', 'success');
      } else {
        console.error('PhishGuard: Failed to reset stats:', response?.error);
        showNotification('Failed to reset statistics. Check console for details.', 'error');
      }
    });
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('PhishGuard: Dashboard loaded');
  
  // Initialize tab navigation FIRST
  initializeTabNavigation();
  
  // Load user stats immediately
  loadUserStats();
  
  // Refresh stats every 30 seconds
  setInterval(loadUserStats, 30000);
  
  // Add simplified development tools (reset stats only)
  if (chrome.runtime.getManifest().name.includes('Training')) {
    const container = document.querySelector('.container');
    if (container) {
      const testSection = document.createElement('div');
      testSection.style.cssText = `
        margin-top: 20px; 
        padding: 15px; 
        background: var(--card-bg); 
        border: 1px solid var(--border-color); 
        border-radius: 8px; 
        text-align: center;
        opacity: 0.8;
      `;
      testSection.innerHTML = `
        <h3 style="color: var(--accent-green); margin-bottom: 10px; font-size: 14px;">🔧 Development Tools</h3>
        <button id="reset-stats-btn" style="padding: 8px 16px; background: var(--accent-red); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 12px;">
          Reset Statistics
        </button>
        <p style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
          Reset all training statistics and history
        </p>
      `;
      container.appendChild(testSection);
      
      // Add event listener for reset button only
      document.getElementById('reset-stats-btn')?.addEventListener('click', resetStats);
    }
  }
});

console.log('PhishGuard: Enhanced Dashboard JavaScript loaded and ready');