// PhishGuard - Training Videos JavaScript

// Quiz functionality
let quizScore = 0;
let questionsAnswered = 0;
const totalQuestions = 5;

// Video tracking
let videosWatched = 0;
let completedModules = [];
let userProgress = {};

// Initialize the training videos page
function initialize() {
  initializeQuiz();
  initializeVideoInteractions();
  initializeProgressTracking();
  loadUserProgress();
  setupVideoPreviewHandlers();
  setupLearningPathInteractions();
  animateStatCounters();
  setupButtons();
  setupKeyboardShortcuts();
  console.log('PhishGuard: Training Videos module loaded');
}

// Initialize quiz functionality
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
      updateQuizProgress();
    });
  });
}

// Update quiz progress
function updateQuizProgress() {
  const progress = (questionsAnswered / totalQuestions) * 100;
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  if (progressBar) progressBar.style.width = progress + '%';
  
  if (questionsAnswered === totalQuestions) {
    const percentage = Math.round((quizScore / totalQuestions) * 100);
    if (progressText) {
      progressText.textContent = `Knowledge Assessment Complete! Score: ${quizScore}/${totalQuestions} (${percentage}%)`;
    }
    
    // Show completion message
    setTimeout(() => {
      showQuizCompletionMessage(percentage);
    }, 1000);
  } else {
    if (progressText) {
      progressText.textContent = `Progress: ${questionsAnswered}/${totalQuestions} questions answered`;
    }
  }
}

// Show quiz completion message
function showQuizCompletionMessage(score) {
  let message = '';
  let color = '';
  
  if (score >= 80) {
    message = 'Excellent! You have strong video training knowledge and understand effectiveness metrics.';
    color = 'var(--accent-green)';
  } else if (score >= 60) {
    message = 'Good work! Review the statistics and best practices for video-based training.';
    color = 'var(--accent-blue)';
  } else {
    message = 'Keep studying! Focus on understanding why video training is effective for cybersecurity.';
    color = 'var(--accent-purple)';
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
    max-width: 350px;
    animation: slideInRight 0.5s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Initialize video interaction handlers
function initializeVideoInteractions() {
  // Add click handlers to video category cards
  const videoCards = document.querySelectorAll('.video-category-card');
  
  videoCards.forEach((card, index) => {
    // Add staggered animation
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Add hover analytics
    card.addEventListener('mouseenter', function() {
      trackInteraction('video_card_hover', this.querySelector('.video-title').textContent);
    });
    
    // Add click handler for the whole card
    card.addEventListener('click', function(e) {
      // Don't trigger if clicking on preview button
      if (!e.target.closest('.preview-thumbnail')) {
        const videoTitle = this.querySelector('.video-title').textContent;
        showVideoModal(videoTitle);
      }
    });
  });
  
  // Module completion tracking
  const moduleItems = document.querySelectorAll('.module-item');
  moduleItems.forEach(item => {
    item.addEventListener('click', function() {
      this.classList.toggle('completed');
      updateModuleProgress();
    });
  });
}

// Video preview handlers
function setupVideoPreviewHandlers() {
  const previewThumbnails = document.querySelectorAll('.preview-thumbnail');
  
  previewThumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', function() {
      const videoTitle = this.querySelector('.preview-title').textContent;
      showVideoPreview(videoTitle);
    });
  });
}

// Show video modal (simulated)
function showVideoModal(videoTitle) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  `;
  
  modal.innerHTML = `
    <div style="
      background: var(--card-bg);
      border: 2px solid var(--accent-purple);
      border-radius: 12px;
      padding: 30px;
      max-width: 600px;
      width: 90%;
      text-align: center;
      position: relative;
    ">
      <button style="
        position: absolute;
        top: 15px;
        right: 20px;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 24px;
        cursor: pointer;
      " onclick="this.closest('.modal').remove()">×</button>
      
      <div style="
        background: var(--secondary-bg);
        border-radius: 8px;
        padding: 40px;
        margin-bottom: 20px;
        border: 2px dashed var(--border-color);
      ">
        <div style="font-size: 48px; margin-bottom: 15px;">🎬</div>
        <h3 style="color: var(--accent-purple); margin-bottom: 10px;">${videoTitle}</h3>
        <p style="color: var(--text-secondary); font-size: 14px;">
          Interactive video training would load here
        </p>
        <div style="
          background: var(--accent-purple);
          color: var(--primary-bg);
          padding: 8px 16px;
          border-radius: 20px;
          display: inline-block;
          margin-top: 15px;
          font-size: 12px;
          font-weight: bold;
        ">DEMO MODE</div>
      </div>
      
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button style="
          background: var(--accent-green);
          color: var(--primary-bg);
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        " onclick="markVideoComplete('${videoTitle}'); this.closest('.modal').remove();">
          Mark Complete
        </button>
        <button style="
          background: var(--accent-blue);
          color: var(--primary-bg);
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        " onclick="this.closest('.modal').remove();">
          Close
        </button>
      </div>
    </div>
  `;
  
  modal.className = 'modal';
  document.body.appendChild(modal);
  
  // Track video start
  trackInteraction('video_started', videoTitle);
}

// Show video preview
function showVideoPreview(previewTitle) {
  const previewModal = document.createElement('div');
  previewModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  `;
  
  previewModal.innerHTML = `
    <div style="
      background: var(--card-bg);
      border: 2px solid var(--accent-blue);
      border-radius: 12px;
      padding: 25px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      position: relative;
    ">
      <button style="
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 20px;
        cursor: pointer;
      " onclick="this.remove()">×</button>
      
      <div style="font-size: 32px; margin-bottom: 15px;">🎬</div>
      <h3 style="color: var(--accent-blue); margin-bottom: 15px;">${previewTitle}</h3>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">
        This 90-second preview demonstrates key concepts from the full training module.
      </p>
      
      <div style="
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 20px;
        margin: 15px 0;
      ">
        <div style="color: var(--accent-blue); font-size: 18px; margin-bottom: 10px;">▶️</div>
        <p style="color: var(--text-secondary); font-size: 13px;">
          Preview content would show real examples and key learning points
        </p>
      </div>
      
      <button style="
        background: var(--accent-blue);
        color: var(--primary-bg);
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
      " onclick="this.remove();">
        Close Preview
      </button>
    </div>
  `;
  
  document.body.appendChild(previewModal);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (previewModal.parentNode) {
      previewModal.remove();
    }
  }, 10000);
}

// Mark video as complete
function markVideoComplete(videoTitle) {
  if (!completedModules.includes(videoTitle)) {
    completedModules.push(videoTitle);
    videosWatched++;
    
    // Update progress in storage
    saveUserProgress();
    
    // Show completion feedback
    showCompletionFeedback(videoTitle);
    
    // Update any progress indicators
    updateOverallProgress();
  }
}

// Show completion feedback
function showCompletionFeedback(videoTitle) {
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--accent-green);
    color: var(--primary-bg);
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 9999;
    max-width: 300px;
    animation: slideInUp 0.3s ease-out;
  `;
  feedback.innerHTML = `
    <div style="display: flex; align-items: center;">
      <span style="font-size: 20px; margin-right: 10px;">✅</span>
      <div>
        <div style="font-size: 14px;">Module Complete!</div>
        <div style="font-size: 12px; opacity: 0.9;">${videoTitle}</div>
      </div>
    </div>
  `;
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.remove();
    }
  }, 4000);
}

// Learning path interactions
function setupLearningPathInteractions() {
  const pathCards = document.querySelectorAll('.path-card');
  
  pathCards.forEach(card => {
    card.addEventListener('click', function() {
      const pathTitle = this.querySelector('h4').textContent;
      showLearningPathModal(pathTitle);
    });
  });
}

// Show learning path modal
function showLearningPathModal(pathTitle) {
  const pathData = {
    '👤 End User Track': {
      description: 'Essential cybersecurity training for all employees',
      modules: ['Phishing Awareness', 'Password Security', 'Mobile Security', 'Social Engineering'],
      duration: '2-3 hours',
      difficulty: 'Beginner'
    },
    '👨‍💼 Manager Track': {
      description: 'Comprehensive training for security decision makers',
      modules: ['All End User Modules', 'AI Threats', 'Incident Response', 'BEC Prevention'],
      duration: '4-5 hours',
      difficulty: 'Advanced'
    },
    '⚡ Quick Refresher': {
      description: 'Monthly updates on latest security threats',
      modules: ['Threat Updates', 'New Techniques', 'Policy Changes', 'Assessment'],
      duration: '30-45 minutes',
      difficulty: 'All Levels'
    }
  };
  
  const data = pathData[pathTitle] || pathData['👤 End User Track'];
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  `;
  
  modal.innerHTML = `
    <div style="
      background: var(--card-bg);
      border: 2px solid var(--accent-purple);
      border-radius: 12px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      position: relative;
    ">
      <button style="
        position: absolute;
        top: 15px;
        right: 20px;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 24px;
        cursor: pointer;
      " onclick="this.closest('.modal').remove()">×</button>
      
      <h3 style="color: var(--accent-purple); margin-bottom: 15px;">${pathTitle}</h3>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">${data.description}</p>
      
      <div style="margin: 20px 0;">
        <div style="display: flex; gap: 20px; margin-bottom: 15px;">
          <div>
            <strong style="color: var(--accent-blue);">Duration:</strong>
            <span style="color: var(--text-secondary);"> ${data.duration}</span>
          </div>
          <div>
            <strong style="color: var(--accent-blue);">Level:</strong>
            <span style="color: var(--text-secondary);"> ${data.difficulty}</span>
          </div>
        </div>
        
        <h4 style="color: var(--accent-green); margin-bottom: 10px;">Included Modules:</h4>
        <ul style="margin-left: 20px;">
          ${data.modules.map(module => `
            <li style="color: var(--text-primary); margin: 5px 0;">${module}</li>
          `).join('')}
        </ul>
      </div>
      
      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 25px;">
        <button style="
          background: var(--accent-green);
          color: var(--primary-bg);
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        " onclick="startLearningPath('${pathTitle}'); this.closest('.modal').remove();">
          Start Path
        </button>
        <button style="
          background: var(--accent-blue);
          color: var(--primary-bg);
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        " onclick="this.closest('.modal').remove();">
          Close
        </button>
      </div>
    </div>
  `;
  
  modal.className = 'modal';
  document.body.appendChild(modal);
}

// Start learning path
function startLearningPath(pathTitle) {
  // Track learning path start
  trackInteraction('learning_path_started', pathTitle);
  
  // Show confirmation
  showNotification(`Started learning path: ${pathTitle}`, 'success');
  
  // In a real implementation, this would navigate to the first module
  console.log('PhishGuard: Started learning path:', pathTitle);
}

// Progress tracking functions
function initializeProgressTracking() {
  // Initialize user progress object
  userProgress = {
    videosWatched: 0,
    completedModules: [],
    quizScores: [],
    timeSpent: 0,
    lastActivity: new Date().toISOString(),
    learningPaths: []
  };
  
  // Load existing progress
  loadUserProgress();
}

// Load user progress from storage
function loadUserProgress() {
  try {
    const saved = localStorage.getItem('phishguard_video_progress');
    if (saved) {
      userProgress = { ...userProgress, ...JSON.parse(saved) };
      videosWatched = userProgress.videosWatched || 0;
      completedModules = userProgress.completedModules || [];
    }
  } catch (error) {
    console.warn('PhishGuard: Could not load user progress:', error);
  }
}

// Save user progress to storage
function saveUserProgress() {
  try {
    userProgress.videosWatched = videosWatched;
    userProgress.completedModules = completedModules;
    userProgress.lastActivity = new Date().toISOString();
    
    localStorage.setItem('phishguard_video_progress', JSON.stringify(userProgress));
  } catch (error) {
    console.warn('PhishGuard: Could not save user progress:', error);
  }
}

// Update module progress
function updateModuleProgress() {
  const totalModules = document.querySelectorAll('.module-item').length;
  const completedCount = document.querySelectorAll('.module-item.completed').length;
  const progressPercentage = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;
  
  // Update any progress indicators
  const progressBars = document.querySelectorAll('.module-progress-bar');
  progressBars.forEach(bar => {
    bar.style.width = progressPercentage + '%';
  });
  
  console.log(`PhishGuard: Module progress: ${completedCount}/${totalModules} (${Math.round(progressPercentage)}%)`);
}

// Update overall progress
function updateOverallProgress() {
  const totalVideos = document.querySelectorAll('.video-category-card').length;
  const progressPercentage = totalVideos > 0 ? (videosWatched / totalVideos) * 100 : 0;
  
  console.log(`PhishGuard: Overall progress: ${videosWatched}/${totalVideos} videos (${Math.round(progressPercentage)}%)`);
  
  // Save progress
  saveUserProgress();
}

// Track user interactions for analytics
function trackInteraction(action, data) {
  const interaction = {
    action: action,
    data: data,
    timestamp: new Date().toISOString(),
    page: 'training_videos'
  };
  
  console.log('PhishGuard: Tracked interaction:', interaction);
  
  // In a real implementation, this would send to analytics service
}

// Animate statistic counters
function animateStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  statNumbers.forEach(stat => {
    observer.observe(stat);
  });
}

// Animate individual counter
function animateCounter(element) {
  const finalValue = element.textContent;
  const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
  
  if (numericValue && numericValue > 0) {
    let currentValue = 0;
    const increment = numericValue / 50;
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= numericValue) {
        currentValue = numericValue;
        clearInterval(timer);
      }
      
      if (finalValue.includes('%')) {
        element.textContent = Math.round(currentValue) + '%';
      } else {
        element.textContent = Math.round(currentValue);
      }
    }, 30);
  }
}

// Show notification helper
function showNotification(message, type = 'info') {
  const colors = {
    info: 'var(--accent-blue)',
    success: 'var(--accent-green)',
    warning: 'var(--accent-yellow)',
    error: 'var(--accent-red)'
  };
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: var(--primary-bg);
    padding: 12px 20px;
    border-radius: 6px;
    font-weight: bold;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: slideInRight 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 4000);
}

// Video search functionality
function initializeVideoSearch() {
  const searchInput = document.getElementById('video-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      filterVideos(query);
    });
  }
}

// Filter videos based on search query
function filterVideos(query) {
  const videoCards = document.querySelectorAll('.video-category-card');
  
  videoCards.forEach(card => {
    const title = card.querySelector('.video-title').textContent.toLowerCase();
    const description = card.querySelector('.video-description').textContent.toLowerCase();
    
    if (title.includes(query) || description.includes(query)) {
      card.style.display = 'block';
      card.style.animation = 'fadeIn 0.3s ease-out';
    } else {
      card.style.display = 'none';
    }
  });
}

// Video difficulty filter
function initializeDifficultyFilter() {
  const filterButtons = document.querySelectorAll('.difficulty-filter');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const difficulty = this.getAttribute('data-difficulty');
      filterByDifficulty(difficulty);
    });
  });
}

// Filter videos by difficulty
function filterByDifficulty(difficulty) {
  const videoCards = document.querySelectorAll('.video-category-card');
  
  videoCards.forEach(card => {
    const cardDifficulty = card.getAttribute('data-difficulty');
    
    if (difficulty === 'all' || cardDifficulty === difficulty) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Generate progress report
function generateProgressReport() {
  const report = {
    totalVideos: document.querySelectorAll('.video-category-card').length,
    videosWatched: videosWatched,
    completionRate: videosWatched > 0 ? Math.round((videosWatched / document.querySelectorAll('.video-category-card').length) * 100) : 0,
    completedModules: completedModules,
    lastActivity: userProgress.lastActivity,
    timeSpent: userProgress.timeSpent || 0
  };
  
  return report;
}

// Export progress data
function exportProgressData() {
  const report = generateProgressReport();
  const dataStr = JSON.stringify(report, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'phishguard-video-progress.json';
  link.click();
  
  URL.revokeObjectURL(link.href);
  showNotification('Progress data exported successfully!', 'success');
}

// Reset progress data
function resetProgressData() {
  if (confirm('Are you sure you want to reset all video training progress? This cannot be undone.')) {
    // Clear local storage
    localStorage.removeItem('phishguard_video_progress');
    
    // Reset variables
    videosWatched = 0;
    completedModules = [];
    userProgress = {
      videosWatched: 0,
      completedModules: [],
      quizScores: [],
      timeSpent: 0,
      lastActivity: new Date().toISOString(),
      learningPaths: []
    };
    
    // Update UI
    document.querySelectorAll('.module-item.completed').forEach(item => {
      item.classList.remove('completed');
    });
    
    updateModuleProgress();
    showNotification('Progress data reset successfully!', 'success');
  }
}

// Button handlers
function setupButtons() {
  const takeQuizBtn = document.getElementById('take-quiz');
  const backBtn = document.getElementById('back-to-dashboard');
  const exportBtn = document.getElementById('export-progress');
  const resetBtn = document.getElementById('reset-progress');
  
  if (takeQuizBtn) {
    takeQuizBtn.addEventListener('click', () => {
      const report = generateProgressReport();
      showNotification(`Training Progress: ${report.completionRate}% complete (${report.videosWatched}/${report.totalVideos} videos)`, 'info');
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
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportProgressData);
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetProgressData);
  }
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    // 'S' key to focus search
    if (event.key.toLowerCase() === 's' && !event.ctrlKey && !event.metaKey && !event.target.matches('input, textarea')) {
      event.preventDefault();
      const searchInput = document.getElementById('video-search');
      if (searchInput) {
        searchInput.focus();
      }
    }
    
    // 'Escape' key to clear search or close modals
    if (event.key === 'Escape') {
      const searchInput = document.getElementById('video-search');
      if (searchInput && searchInput.value) {
        searchInput.value = '';
        filterVideos('');
      }
      
      // Close any open modals
      document.querySelectorAll('.modal').forEach(modal => modal.remove());
    }
    
    // 'R' key to generate progress report
    if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.metaKey) {
      const report = generateProgressReport();
      console.log('PhishGuard Progress Report:', report);
      showNotification('Progress report logged to console', 'info');
    }
  });
}

// Video accessibility enhancements
function enhanceVideoAccessibility() {
  const videoCards = document.querySelectorAll('.video-category-card');
  
  videoCards.forEach(card => {
    // Add keyboard navigation
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    const title = card.querySelector('.video-title')?.textContent || 'video';
    card.setAttribute('aria-label', `Open video: ${title}`);
    
    // Add keyboard event handlers
    card.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const videoTitle = this.querySelector('.video-title').textContent;
        showVideoModal(videoTitle);
      }
    });
  });
}

// Video completion tracking with analytics
function trackVideoCompletion(videoTitle, duration, timestamp) {
  const completionData = {
    videoTitle: videoTitle,
    duration: duration,
    completedAt: timestamp || new Date().toISOString(),
    userAgent: navigator.userAgent,
    sessionId: getSessionId()
  };
  
  // Store completion data
  const completions = JSON.parse(localStorage.getItem('video_completions') || '[]');
  completions.push(completionData);
  localStorage.setItem('video_completions', JSON.stringify(completions));
  
  console.log('PhishGuard: Video completion tracked:', completionData);
}

// Get or create session ID
function getSessionId() {
  let sessionId = sessionStorage.getItem('phishguard_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('phishguard_session_id', sessionId);
  }
  return sessionId;
}

// Video recommendation system
function getRecommendedVideos() {
  const allVideos = Array.from(document.querySelectorAll('.video-category-card'));
  const watchedTitles = completedModules;
  
  // Filter out already watched videos
  const unwatchedVideos = allVideos.filter(card => {
    const title = card.querySelector('.video-title').textContent;
    return !watchedTitles.includes(title);
  });
  
  // Simple recommendation: prioritize by difficulty and topic relevance
  const recommended = unwatchedVideos.slice(0, 3);
  
  return recommended.map(card => ({
    title: card.querySelector('.video-title').textContent,
    description: card.querySelector('.video-description')?.textContent || '',
    difficulty: card.getAttribute('data-difficulty') || 'beginner'
  }));
}

// Show recommended videos
function showRecommendations() {
  const recommendations = getRecommendedVideos();
  
  if (recommendations.length === 0) {
    showNotification('Great job! You\'ve completed all available videos.', 'success');
    return;
  }
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  `;
  
  modal.innerHTML = `
    <div style="
      background: var(--card-bg);
      border: 2px solid var(--accent-green);
      border-radius: 12px;
      padding: 30px;
      max-width: 600px;
      width: 90%;
      position: relative;
    ">
      <button style="
        position: absolute;
        top: 15px;
        right: 20px;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 24px;
        cursor: pointer;
      " onclick="this.closest('.modal').remove()">×</button>
      
      <h3 style="color: var(--accent-green); margin-bottom: 20px; text-align: center;">
        🎯 Recommended for You
      </h3>
      
      <div style="margin: 20px 0;">
        ${recommendations.map(video => `
          <div style="
            background: var(--secondary-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            cursor: pointer;
            transition: all 0.3s ease;
          " onclick="showVideoModal('${video.title}'); this.closest('.modal').remove();">
            <h4 style="color: var(--accent-blue); margin-bottom: 8px;">${video.title}</h4>
            <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">
              ${video.description}
            </p>
            <span style="
              background: var(--accent-purple);
              color: var(--primary-bg);
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 10px;
              text-transform: uppercase;
              font-weight: bold;
            ">${video.difficulty}</span>
          </div>
        `).join('')}
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button style="
          background: var(--accent-green);
          color: var(--primary-bg);
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        " onclick="this.closest('.modal').remove();">
          Close Recommendations
        </button>
      </div>
    </div>
  `;
  
  modal.className = 'modal';
  document.body.appendChild(modal);
}

// Video quality settings (simulated)
function showVideoSettings() {
  const settingsModal = document.createElement('div');
  settingsModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  `;
  
  settingsModal.innerHTML = `
    <div style="
      background: var(--card-bg);
      border: 2px solid var(--accent-blue);
      border-radius: 12px;
      padding: 30px;
      max-width: 400px;
      width: 90%;
      position: relative;
    ">
      <button style="
        position: absolute;
        top: 15px;
        right: 20px;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 24px;
        cursor: pointer;
      " onclick="this.remove()">×</button>
      
      <h3 style="color: var(--accent-blue); margin-bottom: 20px;">⚙️ Video Settings</h3>
      
      <div style="margin: 15px 0;">
        <label style="color: var(--text-primary); display: block; margin-bottom: 8px;">
          Video Quality:
        </label>
        <select style="
          width: 100%;
          padding: 8px;
          background: var(--secondary-bg);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
        ">
          <option value="auto">Auto (Recommended)</option>
          <option value="1080p">1080p HD</option>
          <option value="720p">720p HD</option>
          <option value="480p">480p SD</option>
        </select>
      </div>
      
      <div style="margin: 15px 0;">
        <label style="color: var(--text-primary); display: block; margin-bottom: 8px;">
          Playback Speed:
        </label>
        <select style="
          width: 100%;
          padding: 8px;
          background: var(--secondary-bg);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
        ">
          <option value="0.5">0.5x</option>
          <option value="0.75">0.75x</option>
          <option value="1" selected>1x (Normal)</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
      </div>
      
      <div style="margin: 15px 0;">
        <label style="
          color: var(--text-primary);
          display: flex;
          align-items: center;
          cursor: pointer;
        ">
          <input type="checkbox" style="margin-right: 8px;" checked>
          Enable subtitles/captions
        </label>
      </div>
      
      <div style="margin: 15px 0;">
        <label style="
          color: var(--text-primary);
          display: flex;
          align-items: center;
          cursor: pointer;
        ">
          <input type="checkbox" style="margin-right: 8px;">
          Auto-advance to next video
        </label>
      </div>
      
      <div style="text-align: center; margin-top: 25px;">
        <button style="
          background: var(--accent-green);
          color: var(--primary-bg);
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          margin-right: 10px;
        " onclick="saveVideoSettings(); this.remove();">
          Save Settings
        </button>
        <button style="
          background: var(--text-muted);
          color: var(--primary-bg);
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        " onclick="this.remove();">
          Cancel
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(settingsModal);
}

// Save video settings
function saveVideoSettings() {
  showNotification('Video settings saved successfully!', 'success');
  console.log('PhishGuard: Video settings saved');
}

// Video bookmark system
function bookmarkVideo(videoTitle) {
  const bookmarks = JSON.parse(localStorage.getItem('video_bookmarks') || '[]');
  
  if (!bookmarks.includes(videoTitle)) {
    bookmarks.push(videoTitle);
    localStorage.setItem('video_bookmarks', JSON.stringify(bookmarks));
    showNotification(`Bookmarked: ${videoTitle}`, 'success');
  } else {
    showNotification('Video already bookmarked', 'info');
  }
}

// Show bookmarked videos
function showBookmarks() {
  const bookmarks = JSON.parse(localStorage.getItem('video_bookmarks') || '[]');
  
  if (bookmarks.length === 0) {
    showNotification('No bookmarked videos yet', 'info');
    return;
  }
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  `;
  
  modal.innerHTML = `
    <div style="
      background: var(--card-bg);
      border: 2px solid var(--accent-yellow);
      border-radius: 12px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      position: relative;
      max-height: 80vh;
      overflow-y: auto;
    ">
      <button style="
        position: absolute;
        top: 15px;
        right: 20px;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 24px;
        cursor: pointer;
      " onclick="this.remove()">×</button>
      
      <h3 style="color: var(--accent-yellow); margin-bottom: 20px;">
        🔖 Bookmarked Videos
      </h3>
      
      <div style="margin: 20px 0;">
        ${bookmarks.map(title => `
          <div style="
            background: var(--secondary-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 12px;
            margin: 8px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <span style="color: var(--text-primary); cursor: pointer;" onclick="showVideoModal('${title}'); this.closest('.modal').remove();">
              ${title}
            </span>
            <button style="
              background: var(--accent-red);
              color: white;
              border: none;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
            " onclick="removeBookmark('${title}'); this.closest('div').remove();">
              Remove
            </button>
          </div>
        `).join('')}
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button style="
          background: var(--accent-blue);
          color: var(--primary-bg);
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        " onclick="this.remove();">
          Close
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Remove bookmark
function removeBookmark(videoTitle) {
  const bookmarks = JSON.parse(localStorage.getItem('video_bookmarks') || '[]');
  const filtered = bookmarks.filter(title => title !== videoTitle);
  localStorage.setItem('video_bookmarks', JSON.stringify(filtered));
  showNotification(`Removed bookmark: ${videoTitle}`, 'info');
}

// Performance monitoring
function initializePerformanceMonitoring() {
  // Track page load time
  window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`PhishGuard: Page loaded in ${Math.round(loadTime)}ms`);
    
    if (loadTime > 3000) {
      console.warn('PhishGuard: Slow page load detected');
    }
  });
  
  // Track memory usage (if available)
  if (performance.memory) {
    setInterval(() => {
      const memory = performance.memory;
      if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
        console.warn('PhishGuard: High memory usage detected');
      }
    }, 30000);
  }
}

// Error handling and recovery
function initializeErrorHandling() {
  window.addEventListener('error', function(event) {
    console.error('PhishGuard: JavaScript error:', event.error);
    
    // Show user-friendly error message for critical errors
    if (event.error && event.error.message) {
      showNotification('An error occurred. Please refresh the page if problems persist.', 'error');
    }
  });
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    console.error('PhishGuard: Unhandled promise rejection:', event.reason);
    event.preventDefault();
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  try {
    initialize();
    initializeVideoSearch();
    initializeDifficultyFilter();
    enhanceVideoAccessibility();
    initializePerformanceMonitoring();
    initializeErrorHandling();
    
    // Add additional interactive elements
    setTimeout(() => {
      const videoCards = document.querySelectorAll('.video-category-card');
      videoCards.forEach(card => {
        card.style.opacity = '1';
      });
    }, 100);
    
    console.log('PhishGuard: Training Videos module fully initialized');
  } catch (error) {
    console.error('PhishGuard: Initialization error:', error);
    showNotification('Failed to initialize training videos. Please refresh the page.', 'error');
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  // Save any pending progress
  saveUserProgress();
  
  // Clear any timers or intervals
  console.log('PhishGuard: Training Videos module cleanup completed');
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .video-category-card {
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .video-category-card:hover {
    transform: translateY(-5px);
  }
  
  .modal {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);

// Export functions for testing (if in development environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initialize,
    markVideoComplete,
    generateProgressReport,
    getRecommendedVideos,
    trackVideoCompletion,
    showNotification
  };
}