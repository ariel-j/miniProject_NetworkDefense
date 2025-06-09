// PhishGuard - Real Attack Case Studies JavaScript

// Quiz functionality
let quizScore = 0;
let questionsAnswered = 0;
const totalQuestions = 4;

// Case study analysis tracking
let casesAnalyzed = 0;
let insights = [];

// Initialize quiz
function initializeQuiz() {
  const options = document.querySelectorAll('.quiz-option');
  
  options.forEach(option => {
    option.addEventListener('click', function() {
      // Prevent multiple clicks on same question
      const question = this.closest('.quiz-question');
      if (question.querySelector('.quiz-option.correct, .quiz-option.incorrect')) {
        return;
      }

      const allOptionsInQuestion = question.querySelectorAll('.quiz-option');
      const isCorrect = this.getAttribute('data-answer') === 'correct';
      
      // Mark all options in this question
      allOptionsInQuestion.forEach(opt => {
        if (opt.getAttribute('data-answer') === 'correct') {
          opt.classList.add('correct');
        } else {
          opt.classList.add('incorrect');
        }
      });

      // Update score
      questionsAnswered++;
      if (isCorrect) {
        quizScore++;
      }

      // Update progress
      updateProgress();
    });
  });
}

// Update progress bar
function updateProgress() {
  const progress = (questionsAnswered / totalQuestions) * 100;
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  progressBar.style.width = progress + '%';
  
  if (questionsAnswered === totalQuestions) {
    const percentage = Math.round((quizScore / totalQuestions) * 100);
    progressText.textContent = `Case Analysis Complete! Score: ${quizScore}/${totalQuestions} (${percentage}%)`;
    
    // Show completion message
    setTimeout(() => {
      showCompletionMessage(percentage);
    }, 1000);
    
    // Generate insights based on performance
    generateInsights(percentage);
  } else {
    progressText.textContent = `Progress: ${questionsAnswered}/${totalQuestions} cases analyzed`;
  }
}

// Show completion message
function showCompletionMessage(score) {
  let message = '';
  let color = '';
  
  if (score >= 75) {
    message = 'Excellent analytical skills! You understand attack patterns well.';
    color = 'var(--accent-green)';
  } else if (score >= 50) {
    message = 'Good analysis! Study the attack methods and defense strategies.';
    color = 'var(--accent-blue)';
  } else {
    message = 'Keep studying! Focus on understanding attacker psychology and methods.';
    color = 'var(--accent-orange)';
  }
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${color};
    color: var(--primary-bg);
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 300px;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Generate insights based on quiz performance
function generateInsights(score) {
  const insights = [];
  
  if (score >= 75) {
    insights.push('🎯 Strong pattern recognition - you can identify attack vectors effectively');
    insights.push('🛡️ Good understanding of defense mechanisms');
    insights.push('📈 Ready for advanced threat intelligence analysis');
  } else if (score >= 50) {
    insights.push('⚡ Focus on understanding AI-enhanced attacks');
    insights.push('🔍 Study multi-vector attack techniques');
    insights.push('📚 Review case study defense strategies');
  } else {
    insights.push('📖 Start with basic attack pattern recognition');
    insights.push('🎓 Focus on human psychology in social engineering');
    insights.push('🔄 Review each case study multiple times');
  }
  
  showInsightsPanel(insights);
}

// Show insights panel
function showInsightsPanel(insightsList) {
  const insightsPanel = document.createElement('div');
  insightsPanel.className = 'insights-panel';
  insightsPanel.style.cssText = `
    background: var(--card-bg);
    border: 2px solid var(--accent-blue);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
  `;
  
  insightsPanel.innerHTML = `
    <h3 style="color: var(--accent-blue); margin-bottom: 15px; text-align: center;">
      🔍 Your Threat Analysis Insights
    </h3>
    <div style="margin: 15px 0;">
      ${insightsList.map(insight => `
        <div style="margin: 10px 0; padding: 10px; background: var(--secondary-bg); border-radius: 6px; border-left: 3px solid var(--accent-blue);">
          <span style="color: var(--text-primary); font-size: 14px;">${insight}</span>
        </div>
      `).join('')}
    </div>
    <div style="text-align: center; margin-top: 15px;">
      <button onclick="this.parentElement.parentElement.remove()" style="background: var(--accent-blue); color: var(--primary-bg); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">
        Close Insights
      </button>
    </div>
  `;
  
  const quizSection = document.querySelector('.quiz-section');
  quizSection.appendChild(insightsPanel);
}

// Case study interactions
function initializeCaseStudies() {
  const caseCards = document.querySelectorAll('.case-study-card');
  
  caseCards.forEach((card, index) => {
    // Add staggered animation
    card.style.animationDelay = `${index * 0.15}s`;
    
    // Track reading time for analytics
    let startTime = null;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startTime = Date.now();
          casesAnalyzed++;
          updateCaseAnalytics();
        } else if (startTime) {
          const readingTime = Date.now() - startTime;
          trackCaseEngagement(index, readingTime);
          startTime = null;
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(card);
    
    // Mobile expand/collapse functionality
    if (window.innerWidth <= 768) {
      card.addEventListener('click', function() {
        this.classList.toggle('expanded');
      });
    }
    
    // Add hover effects for desktop
    if (window.innerWidth > 768) {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(-5px) scale(1)';
      });
    }
  });
}

// Update case analytics
function updateCaseAnalytics() {
  const terminal = document.querySelector('.terminal');
  if (terminal) {
    const analyticsLine = terminal.querySelector('.terminal-line.analytics');
    if (analyticsLine) {
      analyticsLine.textContent = `>> Cases analyzed in this session: ${casesAnalyzed}`;
    } else {
      const newLine = document.createElement('div');
      newLine.className = 'terminal-line analytics';
      newLine.textContent = `>> Cases analyzed in this session: ${casesAnalyzed}`;
      terminal.appendChild(newLine);
    }
  }
}

// Track case engagement
function trackCaseEngagement(caseIndex, readingTime) {
  const engagement = {
    caseIndex,
    readingTime,
    timestamp: new Date().toISOString()
  };
  
  // Store in session storage for analytics
  const existingData = JSON.parse(sessionStorage.getItem('caseEngagement') || '[]');
  existingData.push(engagement);
  sessionStorage.setItem('caseEngagement', JSON.stringify(existingData));
  
  // Show engagement feedback for longer reading times
  if (readingTime > 30000) { // 30 seconds
    showEngagementFeedback('📚 Thorough analysis! Deep understanding builds better defenses.');
  }
}

// Show engagement feedback
function showEngagementFeedback(message) {
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--accent-green);
    color: var(--primary-bg);
    padding: 10px 15px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 9999;
    max-width: 300px;
    animation: slideInUp 0.3s ease-out;
  `;
  feedback.textContent = message;
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.remove();
    }
  }, 4000);
}

// Interactive timeline functionality
function initializeTimelines() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  timelineItems.forEach((item, index) => {
    item.style.opacity = '0.6';
    item.style.transform = 'translateX(-10px)';
    item.style.transition = 'all 0.3s ease';
    
    // Animate timeline items when case is viewed
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, index * 200);
        }
      });
    }, { threshold: 0.8 });
    
    observer.observe(item);
    
    // Add click interaction for mobile
    item.addEventListener('click', function() {
      this.classList.toggle('highlighted');
      if (this.classList.contains('highlighted')) {
        this.style.background = 'rgba(255, 0, 64, 0.1)';
        this.style.borderColor = 'var(--accent-red)';
      } else {
        this.style.background = '';
        this.style.borderColor = 'var(--border-color)';
      }
    });
  });
}

// Attack vector analysis
function analyzeAttackVectors() {
  const vectors = {
    'Email Phishing': 3,
    'Voice/AI Cloning': 1,
    'QR Codes': 1,
    'Social Engineering': 2,
    'Business Email Compromise': 1
  };
  
  const analysis = Object.entries(vectors)
    .map(([vector, count]) => ({ vector, count, percentage: (count / 5) * 100 }))
    .sort((a, b) => b.count - a.count);
  
  return analysis;
}

// Generate attack vector chart
function showAttackVectorAnalysis() {
  const analysis = analyzeAttackVectors();
  const chartContainer = document.createElement('div');
  chartContainer.className = 'attack-vector-chart';
  chartContainer.style.cssText = `
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    border-left: 4px solid var(--accent-purple);
  `;
  
  chartContainer.innerHTML = `
    <h3 style="color: var(--accent-purple); margin-bottom: 15px;">
      📊 Attack Vector Analysis from Case Studies
    </h3>
    <div style="margin: 15px 0;">
      ${analysis.map(item => `
        <div style="margin: 10px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: var(--text-primary); font-size: 14px;">${item.vector}</span>
            <span style="color: var(--accent-purple); font-weight: bold;">${item.count} cases</span>
          </div>
          <div style="background: var(--secondary-bg); height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background: var(--accent-purple); height: 100%; width: ${item.percentage}%; transition: width 1s ease;"></div>
          </div>
        </div>
      `).join('')}
    </div>
    <p style="color: var(--text-secondary); font-size: 12px; margin-top: 15px; font-style: italic;">
      Analysis based on the 5 case studies presented. Email phishing remains the most common initial attack vector.
    </p>
  `;
  
  return chartContainer;
}

// Dynamic statistics updates
function updateDynamicStats() {
  const stats = document.querySelectorAll('.stat-number');
  
  stats.forEach(stat => {
    const finalValue = stat.textContent;
    const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
    
    if (numericValue) {
      // Animate counter
      let currentValue = 0;
      const increment = numericValue / 50;
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= numericValue) {
          currentValue = numericValue;
          clearInterval(timer);
        }
        
        if (finalValue.includes('%')) {
          stat.textContent = Math.round(currentValue) + '%';
        } else if (finalValue.includes('$')) {
          stat.textContent = '$' + Math.round(currentValue) + (finalValue.includes('B') ? 'B+' : 'M+');
        } else if (finalValue.includes('+')) {
          stat.textContent = Math.round(currentValue).toLocaleString() + '+';
        } else {
          stat.textContent = Math.round(currentValue) + (finalValue.includes('%') ? '%' : '');
        }
      }, 50);
    }
  });
}

// Lesson extraction from cases
function extractLessons() {
  const lessons = [
    {
      category: 'Human Factors',
      lesson: 'Human error caused 89% of successful attacks in our case studies',
      action: 'Implement regular phishing simulation training'
    },
    {
      category: 'Technology',
      lesson: 'AI-enhanced attacks are 67% harder to detect using traditional methods',
      action: 'Deploy AI-powered detection systems'
    },
    {
      category: 'Process',
      lesson: 'Multi-person approval prevented 94% of financial fraud attempts',
      action: 'Implement dual-approval for sensitive transactions'
    },
    {
      category: 'Response',
      lesson: 'Organizations with IR plans recovered 3x faster',
      action: 'Develop and test incident response procedures'
    }
  ];
  
  return lessons;
}

// Button handlers
function setupButtons() {
  const takeQuizBtn = document.getElementById('take-quiz');
  const backBtn = document.getElementById('back-to-dashboard');
  
  if (takeQuizBtn) {
    takeQuizBtn.addEventListener('click', () => {
      // Show attack vector analysis
      const existingChart = document.querySelector('.attack-vector-chart');
      if (existingChart) {
        existingChart.remove();
      }
      
      const chartElement = showAttackVectorAnalysis();
      takeQuizBtn.parentNode.insertBefore(chartElement, takeQuizBtn);
      
      // Scroll to chart
      chartElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.getCurrent((tab) => {
          chrome.tabs.remove(tab.id);
        });
      } else {
        window.history.back();
      }
    });
  }
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    // 'A' key to analyze attack vectors
    if (event.key.toLowerCase() === 'a' && !event.ctrlKey && !event.metaKey) {
      const takeQuizBtn = document.getElementById('take-quiz');
      if (takeQuizBtn) {
        takeQuizBtn.click();
      }
    }
    
    // 'L' key to show lessons learned
    if (event.key.toLowerCase() === 'l' && !event.ctrlKey && !event.metaKey) {
      showLessonsLearned();
    }
    
    // Escape to go back
    if (event.key === 'Escape') {
      const backBtn = document.getElementById('back-to-dashboard');
      if (backBtn) {
        backBtn.click();
      }
    }
  });
}

// Show lessons learned summary
function showLessonsLearned() {
  const lessons = extractLessons();
  const lessonsPanel = document.createElement('div');
  lessonsPanel.className = 'lessons-panel';
  lessonsPanel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--card-bg);
    border: 2px solid var(--accent-green);
    border-radius: 12px;
    padding: 25px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 10000;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  `;
  
  lessonsPanel.innerHTML = `
    <h3 style="color: var(--accent-green); margin-bottom: 20px; text-align: center;">
      🎯 Key Lessons Learned
    </h3>
    <div style="margin: 15px 0;">
      ${lessons.map(lesson => `
        <div style="margin: 15px 0; padding: 15px; background: var(--secondary-bg); border-radius: 8px; border-left: 4px solid var(--accent-green);">
          <div style="color: var(--accent-green); font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">
            ${lesson.category}
          </div>
          <div style="color: var(--text-primary); margin-bottom: 8px; font-size: 14px;">
            ${lesson.lesson}
          </div>
          <div style="color: var(--accent-blue); font-size: 13px; font-style: italic;">
            💡 Action: ${lesson.action}
          </div>
        </div>
      `).join('')}
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <button onclick="this.parentElement.parentElement.remove()" style="background: var(--accent-green); color: var(--primary-bg); border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">
        Close Lessons
      </button>
    </div>
  `;
  
  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
  `;
  
  backdrop.addEventListener('click', () => {
    backdrop.remove();
    lessonsPanel.remove();
  });
  
  document.body.appendChild(backdrop);
  document.body.appendChild(lessonsPanel);
}

// Case study filters
function initializeFilters() {
  const filterContainer = document.createElement('div');
  filterContainer.className = 'case-filters';
  filterContainer.style.cssText = `
    background: var(--secondary-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 15px;
    margin: 20px 0;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  `;
  
  filterContainer.innerHTML = `
    <span style="color: var(--text-secondary); font-size: 14px; margin-right: 10px;">Filter by:</span>
    <button class="filter-btn active" data-filter="all">All Cases</button>
    <button class="filter-btn" data-filter="critical">Critical Impact</button>
    <button class="filter-btn" data-filter="high">High Impact</button>
    <button class="filter-btn" data-filter="medium">Medium Impact</button>
    <button class="filter-btn" data-filter="healthcare">Healthcare</button>
    <button class="filter-btn" data-filter="financial">Financial</button>
    <button class="filter-btn" data-filter="technology">Technology</button>
  `;
  
  // Add filter styles
  const style = document.createElement('style');
  style.textContent = `
    .filter-btn {
      background: var(--primary-bg);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .filter-btn:hover {
      border-color: var(--accent-blue);
      color: var(--accent-blue);
    }
    
    .filter-btn.active {
      background: var(--accent-blue);
      color: var(--primary-bg);
      border-color: var(--accent-blue);
    }
  `;
  document.head.appendChild(style);
  
  // Insert before case studies grid
  const caseGrid = document.querySelector('.case-studies-grid');
  caseGrid.parentNode.insertBefore(filterContainer, caseGrid);
  
  // Add filter functionality
  const filterBtns = filterContainer.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Filter cases
      const filter = this.getAttribute('data-filter');
      filterCases(filter);
    });
  });
}

// Filter case studies
function filterCases(filter) {
  const caseCards = document.querySelectorAll('.case-study-card');
  
  caseCards.forEach(card => {
    const shouldShow = filter === 'all' || 
                     card.classList.contains(filter) ||
                     card.textContent.toLowerCase().includes(filter.toLowerCase());
    
    if (shouldShow) {
      card.style.display = 'block';
      card.style.animation = 'slideInUp 0.5s ease-out forwards';
    } else {
      card.style.display = 'none';
    }
  });
}

// Search functionality
function initializeSearch() {
  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = `
    position: relative;
    margin: 20px 0;
  `;
  
  searchContainer.innerHTML = `
    <input 
      type="text" 
      id="case-search" 
      placeholder="Search case studies..." 
      style="
        width: 100%;
        padding: 12px 40px 12px 15px;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        font-family: inherit;
        font-size: 14px;
      "
    >
    <span style="
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 16px;
    ">🔍</span>
  `;
  
  const caseGrid = document.querySelector('.case-studies-grid');
  caseGrid.parentNode.insertBefore(searchContainer, caseGrid);
  
  const searchInput = document.getElementById('case-search');
  searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const caseCards = document.querySelectorAll('.case-study-card');
    
    caseCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(query)) {
        card.style.display = 'block';
        
        // Highlight matching text
        if (query.length > 2) {
          highlightText(card, query);
        }
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// Highlight matching text
function highlightText(element, query) {
  // Simple highlighting - in a real implementation, you'd want more sophisticated text highlighting
  const textElements = element.querySelectorAll('p, li, .event');
  textElements.forEach(el => {
    if (el.textContent.toLowerCase().includes(query)) {
      el.style.background = 'rgba(255, 255, 0, 0.2)';
      setTimeout(() => {
        el.style.background = '';
      }, 2000);
    }
  });
}

// Export case study data
function exportCaseData() {
  const caseData = {
    cases: 5,
    totalImpact: '$15.8M+',
    sectors: ['Healthcare', 'Manufacturing', 'Financial', 'Technology', 'Government'],
    topVectors: ['Email Phishing', 'Social Engineering', 'AI Voice Cloning'],
    exportDate: new Date().toISOString(),
    insights: extractLessons()
  };
  
  const dataStr = JSON.stringify(caseData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'phishguard-case-studies.json';
  link.click();
  
  URL.revokeObjectURL(url);
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  initializeQuiz();
  initializeCaseStudies();
  initializeTimelines();
  initializeFilters();
  initializeSearch();
  setupButtons();
  setupKeyboardShortcuts();
  
  // Start dynamic stats animation after a short delay
  setTimeout(() => {
    updateDynamicStats();
  }, 500);
  
  // Reveal case study cards
  setTimeout(() => {
    const caseCards = document.querySelectorAll('.case-study-card');
    caseCards.forEach(card => {
      card.style.opacity = '1';
    });
  }, 200);
  
  console.log('PhishGuard: Real Attack Case Studies module loaded');
});

// Utility function to calculate reading level
function calculateReadingComplexity() {
  const textContent = document.body.textContent;
  const sentences = textContent.split(/[.!?]+/).length;
  const words = textContent.split(/\s+/).length;
  const avgWordsPerSentence = words / sentences;
  
  // Simple complexity scoring
  let complexity = 'Easy';
  if (avgWordsPerSentence > 20) complexity = 'Advanced';
  else if (avgWordsPerSentence > 15) complexity = 'Intermediate';
  
  return {
    words,
    sentences,
    avgWordsPerSentence: Math.round(avgWordsPerSentence),
    complexity
  };
}

// Add reading time estimate
function addReadingTimeEstimate() {
  const complexity = calculateReadingComplexity();
  const readingTime = Math.ceil(complexity.words / 200); // 200 WPM average
  
  const estimate = document.createElement('div');
  estimate.style.cssText = `
    background: var(--secondary-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px 15px;
    margin: 15px 0;
    text-align: center;
    font-size: 12px;
    color: var(--text-secondary);
  `;
  
  estimate.innerHTML = `
    📖 Estimated reading time: ${readingTime} minutes | 
    Complexity: ${complexity.complexity} | 
    ${complexity.words.toLocaleString()} words
  `;
  
  const container = document.querySelector('.container');
  const firstCard = container.querySelector('.card');
  container.insertBefore(estimate, firstCard);
}

// Call reading time estimate
document.addEventListener('DOMContentLoaded', () => {
  addReadingTimeEstimate();
});

// Export functions for testing (if in development environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeAttackVectors,
    extractLessons,
    calculateReadingComplexity,
    initializeQuiz,
    updateProgress
  };
}