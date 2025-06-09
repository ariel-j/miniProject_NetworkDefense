  // PhishGuard - Threat Intelligence JavaScript

// Quiz functionality
let quizScore = 0;
let questionsAnswered = 0;
const totalQuestions = 6;

// Intelligence tracking
let intelligenceProgress = {
  lifecycleStagesViewed: 0,
  pyramidLevelsExplored: 0,
  frameworksStudied: 0,
  lastActivity: new Date().toISOString()
};

// Initialize the threat intelligence page
function initialize() {
  initializeQuiz();
  initializeIntelligenceTracking();
  initializeInteractiveElements();
  initializeProgressTracking();
  loadUserProgress();
  setupAnimations();
  setupButtons();
  setupKeyboardShortcuts();
  console.log('PhishGuard: Threat Intelligence module loaded');
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
    
    // Show score display
    const scoreDisplay = document.getElementById('score-display');
    const scoreNumber = document.getElementById('score-number');
    if (scoreDisplay && scoreNumber) {
      scoreDisplay.style.display = 'block';
      scoreNumber.textContent = `${quizScore}/${totalQuestions}`;
    }
    
    // Show completion message
    setTimeout(() => {
      showQuizCompletionMessage(percentage);
    }, 1000);
    
    // Generate intelligence assessment
    generateIntelligenceAssessment(percentage);
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
  
  if (score >= 85) {
    message = 'Excellent! You have advanced threat intelligence knowledge and understand current attack trends.';
    color = 'var(--accent-green)';
  } else if (score >= 70) {
    message = 'Good work! You understand threat intelligence fundamentals. Review AI-enhanced attacks and current trends.';
    color = 'var(--accent-blue)';
  } else if (score >= 50){}; else if (score >= 50) {
    message = 'Keep studying! Focus on the threat intelligence lifecycle and current threat landscape statistics.';
    color = 'var(--accent-yellow)';
  } else {
    message = 'Study the fundamentals! Review the lifecycle, frameworks, and 2024 threat statistics.';
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
    max-width: 400px;
    animation: slideInRight 0.5s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 6000);
}

// Generate intelligence assessment based on quiz performance
function generateIntelligenceAssessment(score) {
  const assessment = {
    score: score,
    level: getIntelligenceLevel(score),
    strengths: [],
    improvements: [],
    recommendations: []
  };
  
  if (score >= 85) {
    assessment.strengths.push('Advanced understanding of threat intelligence lifecycle');
    assessment.strengths.push('Strong knowledge of current threat landscape');
    assessment.strengths.push('Excellent grasp of frameworks and standards');
    assessment.recommendations.push('Consider pursuing advanced CTI certifications');
    assessment.recommendations.push('Explore threat hunting methodologies');
  } else if (score >= 70) {
    assessment.strengths.push('Good understanding of fundamental concepts');
    assessment.strengths.push('Awareness of current threat trends');
    assessment.improvements.push('Study AI-enhanced attack techniques');
    assessment.improvements.push('Review STIX/TAXII implementation details');
    assessment.recommendations.push('Practice with real threat intelligence tools');
  } else if (score >= 50) {
    assessment.strengths.push('Basic threat intelligence awareness');
    assessment.improvements.push('Study the complete intelligence lifecycle');
    assessment.improvements.push('Learn current threat actor categories');
    assessment.improvements.push('Understand the Pyramid of Pain framework');
    assessment.recommendations.push('Take foundational CTI training courses');
  } else {
    assessment.improvements.push('Study fundamental threat intelligence concepts');
    assessment.improvements.push('Learn about threat actor motivations');
    assessment.improvements.push('Understand basic intelligence frameworks');
    assessment.recommendations.push('Start with introductory cybersecurity courses');
  }
  
  showIntelligenceAssessment(assessment);
}

// Get intelligence level based on score
function getIntelligenceLevel(score) {
  if (score >= 85) return { level: 'Expert Analyst', color: 'var(--accent-green)', icon: '🧠' };
  if (score >= 70) return { level: 'Advanced Practitioner', color: 'var(--accent-blue)', icon: '🎯' };
  if (score >= 50) return { level: 'Intermediate Student', color: 'var(--accent-yellow)', icon: '📚' };
  return { level: 'Beginner', color: 'var(--accent-orange)', icon: '🔰' };
}

// Show intelligence assessment
function showIntelligenceAssessment(assessment) {
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
      border: 2px solid ${assessment.level.color};
      border-radius: 12px;
      padding: 30px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
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
      
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="font-size: 48px; margin-bottom: 10px;">${assessment.level.icon}</div>
        <h3 style="color: ${assessment.level.color}; margin-bottom: 10px;">
          Threat Intelligence Assessment
        </h3>
        <div style="color: var(--accent-blue); font-size: 24px; font-weight: bold; margin-bottom: 5px;">
          ${assessment.score}% - ${assessment.level.level}
        </div>
      </div>
      
      ${assessment.strengths.length > 0 ? `
        <div style="margin: 20px 0;">
          <h4 style="color: var(--accent-green); margin-bottom: 10px; display: flex; align-items: center;">
            <span style="margin-right: 8px;">✅</span> Strengths
          </h4>
          ${assessment.strengths.map(strength => `
            <div style="background: rgba(0, 255, 65, 0.1); padding: 8px 12px; margin: 5px 0; border-radius: 4px; border-left: 3px solid var(--accent-green);">
              <span style="color: var(--text-primary); font-size: 14px;">${strength}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${assessment.improvements.length > 0 ? `
        <div style="margin: 20px 0;">
          <h4 style="color: var(--accent-yellow); margin-bottom: 10px; display: flex; align-items: center;">
            <span style="margin-right: 8px;">📈</span> Areas for Improvement
          </h4>
          ${assessment.improvements.map(improvement => `
            <div style="background: rgba(255, 255, 0, 0.1); padding: 8px 12px; margin: 5px 0; border-radius: 4px; border-left: 3px solid var(--accent-yellow);">
              <span style="color: var(--text-primary); font-size: 14px;">${improvement}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div style="margin: 20px 0;">
        <h4 style="color: var(--accent-blue); margin-bottom: 10px; display: flex; align-items: center;">
          <span style="margin-right: 8px;">💡</span> Recommendations
        </h4>
        ${assessment.recommendations.map(recommendation => `
          <div style="background: rgba(0, 212, 255, 0.1); padding: 8px 12px; margin: 5px 0; border-radius: 4px; border-left: 3px solid var(--accent-blue);">
            <span style="color: var(--text-primary); font-size: 14px;">${recommendation}</span>
          </div>
        `).join('')}
      </div>
      
      <div style="text-align: center; margin-top: 25px;">
        <button style="
          background: var(--accent-green);
          color: var(--primary-bg);
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          margin-right: 10px;
        " onclick="exportAssessment(${JSON.stringify(assessment).replace(/"/g, '&quot;')})">
          📊 Export Assessment
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

// Export assessment
function exportAssessment(assessment) {
  const assessmentData = {
    timestamp: new Date().toISOString(),
    score: assessment.score,
    level: assessment.level.level,
    strengths: assessment.strengths,
    improvements: assessment.improvements,
    recommendations: assessment.recommendations,
    totalQuestions: totalQuestions,
    correctAnswers: quizScore
  };
  
  const dataStr = JSON.stringify(assessmentData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'threat-intelligence-assessment.json';
  link.click();
  
  URL.revokeObjectURL(url);
  showNotification('Assessment exported successfully!', 'success');
}

// Initialize intelligence tracking
function initializeIntelligenceTracking() {
  // Load existing progress
  const saved = localStorage.getItem('phishguard_intel_progress');
  if (saved) {
    try {
      intelligenceProgress = { ...intelligenceProgress, ...JSON.parse(saved) };
    } catch (error) {
      console.warn('PhishGuard: Could not load intelligence progress:', error);
    }
  }
  
  // Track lifecycle stage interactions
  const lifecycleStages = document.querySelectorAll('.lifecycle-stage');
  lifecycleStages.forEach((stage, index) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          intelligenceProgress.lifecycleStagesViewed++;
          trackInteraction('lifecycle_stage_viewed', stage.getAttribute('data-stage'));
          saveProgress();
          observer.unobserve(stage);
        }
      });
    }, { threshold: 0.7 });
    
    observer.observe(stage);
  });
  
  // Track pyramid level interactions
  const pyramidLevels = document.querySelectorAll('.pyramid-level');
  pyramidLevels.forEach((level, index) => {
    level.addEventListener('click', function() {
      intelligenceProgress.pyramidLevelsExplored++;
      trackInteraction('pyramid_level_explored', this.getAttribute('data-level'));
      saveProgress();
    });
  });
  
  // Track framework study
  const frameworkCards = document.querySelectorAll('.framework-card');
  frameworkCards.forEach((card, index) => {
    card.addEventListener('click', function() {
      intelligenceProgress.frameworksStudied++;
      trackInteraction('framework_studied', this.querySelector('h3').textContent);
      saveProgress();
    });
  });
}

// Initialize interactive elements
function initializeInteractiveElements() {
  // Stage header interactions
  const stageHeaders = document.querySelectorAll('.stage-header');
  stageHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const stage = this.closest('.lifecycle-stage');
      const content = stage.querySelector('.stage-content');
      
      // Toggle expanded state
      stage.classList.toggle('expanded');
      
      if (stage.classList.contains('expanded')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        this.style.background = 'rgba(0, 212, 255, 0.1)';
      } else {
        content.style.maxHeight = '';
        this.style.background = '';
      }
    });
  });
  
  // Pyramid level hover effects
  const pyramidLevels = document.querySelectorAll('.pyramid-level');
  pyramidLevels.forEach(level => {
    level.addEventListener('mouseenter', function() {
      this.querySelector('.level-content').style.transform = 'translateX(10px)';
    });
    
    level.addEventListener('mouseleave', function() {
      this.querySelector('.level-content').style.transform = 'translateX(0)';
    });
  });
  
  // Intelligence type card interactions
  const intelTypeCards = document.querySelectorAll('.intel-type-card');
  intelTypeCards.forEach(card => {
    card.addEventListener('click', function() {
      showIntelligenceTypeDetails(this);
    });
  });
  
  // Threat actor category interactions
  const actorCategories = document.querySelectorAll('.actor-category');
  actorCategories.forEach(category => {
    category.addEventListener('click', function() {
      showThreatActorDetails(this);
    });
  });
}

// Show intelligence type details
function showIntelligenceTypeDetails(card) {
  const title = card.querySelector('h3').textContent;
  const audience = card.querySelector('.intel-audience').textContent;
  const description = card.querySelector('.intel-description').textContent;
  const characteristics = Array.from(card.querySelectorAll('.intel-characteristics li')).map(li => li.textContent);
  
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
      border: 2px solid var(--accent-blue);
      border-radius: 12px;
      padding: 25px;
      max-width: 500px;
      width: 90%;
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
      
      <h3 style="color: var(--accent-blue); margin-bottom: 10px;">${title}</h3>
      <div style="color: var(--accent-cyan); font-size: 12px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase;">
        Target Audience: ${audience}
      </div>
      
      <p style="color: var(--text-secondary); margin-bottom: 20px; line-height: 1.6;">
        ${description}
      </p>
      
      <h4 style="color: var(--accent-cyan); margin-bottom: 10px; font-size: 14px;">Key Characteristics:</h4>
      <ul style="margin: 0; padding-left: 20px;">
        ${characteristics.map(char => `
          <li style="color: var(--text-primary); font-size: 13px; margin: 5px 0;">${char}</li>
        `).join('')}
      </ul>
      
      <div style="text-align: center; margin-top: 20px;">
        <button style="
          background: var(--accent-blue);
          color: var(--primary-bg);
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        " onclick="this.parentElement.parentElement.remove();">
          Close Details
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Auto-remove after 30 seconds
  setTimeout(() => {
    if (modal.parentNode) {
      modal.remove();
    }
  }, 30000);
}

// Show threat actor details
function showThreatActorDetails(category) {
  const title = category.querySelector('h3').textContent;
  const count = category.querySelector('.actor-count').textContent;
  const description = category.querySelector('.actor-description').textContent;
  const characteristics = Array.from(category.querySelectorAll('.actor-characteristics li')).map(li => li.textContent);
  const targets = category.querySelector('.actor-targets').textContent.replace('Primary Targets: ', '');
  
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
      border: 2px solid var(--accent-red);
      border-radius: 12px;
      padding: 25px;
      max-width: 500px;
      width: 90%;
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
      
      <h3 style="color: var(--accent-red); margin-bottom: 10px;">${title}</h3>
      <div style="color: var(--accent-orange); font-size: 12px; font-weight: bold; margin-bottom: 15px;">
        Currently Tracked: ${count}
      </div>
      
      <p style="color: var(--text-secondary); margin-bottom: 20px; line-height: 1.6;">
        ${description}
      </p>
      
      <h4 style="color: var(--accent-orange); margin-bottom: 10px; font-size: 14px;">Characteristics:</h4>
      <ul style="margin: 0 0 15px 0; padding-left: 20px;">
        ${characteristics.map(char => `
          <li style="color: var(--text-primary); font-size: 13px; margin: 5px 0;">${char}</li>
        `).join('')}
      </ul>
      
      <div style="background: rgba(255, 0, 64, 0.1); padding: 10px; border-radius: 6px; border-left: 3px solid var(--accent-red);">
        <strong style="color: var(--accent-red); font-size: 12px;">Primary Targets:</strong>
        <span style="color: var(--text-secondary); font-size: 12px;"> ${targets}</span>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button style="
          background: var(--accent-red);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        " onclick="this.parentElement.parentElement.remove();">
          Close Details
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Initialize progress tracking
function initializeProgressTracking() {
  // Track page engagement time
  const startTime = Date.now();
  
  window.addEventListener('beforeunload', function() {
    const sessionTime = Date.now() - startTime;
    intelligenceProgress.totalTimeSpent = (intelligenceProgress.totalTimeSpent || 0) + sessionTime;
    saveProgress();
  });
  
  // Track scroll progress
  let maxScrollProgress = 0;
  window.addEventListener('scroll', function() {
    const scrollProgress = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    if (scrollProgress > maxScrollProgress) {
      maxScrollProgress = scrollProgress;
      intelligenceProgress.maxScrollProgress = Math.round(maxScrollProgress);
    }
  });
}

// Load user progress
function loadUserProgress() {
  // Update UI based on saved progress
  if (intelligenceProgress.lifecycleStagesViewed > 0) {
    console.log(`PhishGuard: Viewed ${intelligenceProgress.lifecycleStagesViewed} lifecycle stages`);
  }
  
  if (intelligenceProgress.pyramidLevelsExplored > 0) {
    console.log(`PhishGuard: Explored ${intelligenceProgress.pyramidLevelsExplored} pyramid levels`);
  }
}

// Save progress
function saveProgress() {
  try {
    intelligenceProgress.lastActivity = new Date().toISOString();
    localStorage.setItem('phishguard_intel_progress', JSON.stringify(intelligenceProgress));
  } catch (error) {
    console.warn('PhishGuard: Could not save progress:', error);
  }
}

// Track interactions for analytics
function trackInteraction(action, data) {
  const interaction = {
    action: action,
    data: data,
    timestamp: new Date().toISOString(),
    page: 'threat_intelligence'
  };
  
  console.log('PhishGuard: Tracked interaction:', interaction);
  
  // In a real implementation, this would send to analytics service
}

// Setup animations
function setupAnimations() {
  // Animate stats counters
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
  
  // Reveal cards with staggered animation
  setTimeout(() => {
    const cards = document.querySelectorAll('.lifecycle-stage, .intel-type-card, .actor-category, .framework-card');
    cards.forEach(card => {
      card.style.opacity = '1';
    });
  }, 200);
}

// Animate individual counter
function animateCounter(element) {
  const finalValue = element.textContent;
  const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
  
  if (numericValue && numericValue > 0) {
    let currentValue = 0;
    const increment = numericValue / 60;
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= numericValue) {
        currentValue = numericValue;
        clearInterval(timer);
      }
      
      if (finalValue.includes('%')) {
        element.textContent = Math.round(currentValue) + '%';
      } else if (finalValue.includes('+')) {
        element.textContent = Math.round(currentValue).toLocaleString() + '+';
      } else {
        element.textContent = Math.round(currentValue).toLocaleString();
      }
    }, 25);
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

// Generate threat intelligence report
function generateIntelligenceReport() {
  const report = {
    reportType: 'Threat Intelligence Overview',
    generatedAt: new Date().toISOString(),
    executiveSummary: {
      keyFindings: [
        '67.4% of 2024 attacks use AI-enhanced techniques',
        'Manufacturing has overtaken technology as most targeted sector',
        'Valid account abuse is primary initial access method (30%)',
        'Microsoft tracks 1,500+ unique threat groups'
      ],
      threatLandscape: {
        topSectors: ['Manufacturing', 'Technology', 'Financial Services'],
        attackVectors: ['Valid Account Abuse (30%)', 'Phishing', 'Vulnerability Exploitation'],
        emergingThreats: ['AI-Enhanced Attacks', 'Voice/SMS Phishing (442% growth)', 'Deepfake Fraud']
      }
    },
    threatActors: {
      nationState: '600+ groups tracked',
      cybercrime: '300+ groups tracked',
      influence: '200+ groups tracked',
      hacktivist: '400+ groups tracked'
    },
    recommendations: [
      'Implement advanced MFA to counter credential abuse',
      'Deploy AI-powered detection for AI-enhanced attacks',
      'Focus on behavioral analytics over traditional IOCs',
      'Enhance supply chain security for manufacturing sector'
    ],
    intelligence: {
      frameworks: ['MITRE ATT&CK', 'Diamond Model', 'Cyber Kill Chain', 'STIX/TAXII'],
      pyramidOfPain: 'Focus on TTPs for maximum adversary impact',
      lifecycle: 'Implement continuous intelligence cycle'
    },
    userProgress: intelligenceProgress
  };
  
  return report;
}

// Export threat intelligence report
function exportThreatReport() {
  const report = generateIntelligenceReport();
  const dataStr = JSON.stringify(report, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'threat-intelligence-report.json';
  link.click();
  
  URL.revokeObjectURL(url);
  showNotification('Threat intelligence report exported successfully!', 'success');
}

// Show threat intelligence resources
function showIntelligenceResources() {
  const resources = [
    {
      category: 'Government Sources',
      items: [
        'CISA - Cybersecurity and Infrastructure Security Agency',
        'FBI IC3 - Internet Crime Complaint Center',
        'NSA/CSS - National Security Agency',
        'NIST - National Institute of Standards and Technology'
      ]
    },
    {
      category: 'Commercial Feeds',
      items: [
        'CrowdStrike Falcon Intelligence',
        'Microsoft Defender Threat Intelligence',
        'IBM X-Force',
        'Recorded Future'
      ]
    },
    {
      category: 'Open Source Intelligence',
      items: [
        'MITRE ATT&CK',
        'VirusTotal',
        'Shodan',
        'Have I Been Pwned'
      ]
    },
    {
      category: 'Industry Sharing',
      items: [
        'FS-ISAC (Financial Services)',
        'MS-ISAC (Multi-State)',
        'ICS-CERT (Industrial Control Systems)',
        'ONG-ISAC (Oil & Natural Gas)'
      ]
    }
  ];
  
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
      border: 2px solid var(--accent-blue);
      border-radius: 12px;
      padding: 30px;
      max-width: 700px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
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
      
      <h3 style="color: var(--accent-blue); margin-bottom: 20px; text-align: center;">
        🔍 Threat Intelligence Resources
      </h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        ${resources.map(resource => `
          <div style="background: var(--secondary-bg); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
            <h4 style="color: var(--accent-cyan); margin-bottom: 10px; font-size: 14px; text-transform: uppercase;">
              ${resource.category}
            </h4>
            <ul style="margin: 0; padding-left: 15px;">
              ${resource.items.map(item => `
                <li style="color: var(--text-primary); font-size: 13px; margin: 5px 0;">${item}</li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
      
      <div style="text-align: center; margin-top: 25px;">
        <button style="
          background: var(--accent-green);
          color: var(--primary-bg);
          border: none;
          padding: 12px 24px;
          border-radius: 6// PhishGuard - Threat Intelligence JavaScript

// Quiz functionality
let quizScore = 0;
let questionsAnswered = 0;
const totalQuestions = 6;

// Intelligence tracking
let intelligenceProgress = {
  lifecycleStagesViewed: 0,
  pyramidLevelsExplored: 0,
  frameworksStudied: 0,
  lastActivity: new Date().toISOString()
};

// Initialize the threat intelligence page
function initialize() {
  initializeQuiz();
  initializeIntelligenceTracking();
  initializeInteractiveElements();
  initializeProgressTracking();
  loadUserProgress();
  setupAnimations();
  setupButtons();
  setupKeyboardShortcuts();
  console.log('PhishGuard: Threat Intelligence module loaded');
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
    
    // Show score display
    const scoreDisplay = document.getElementById('score-display');
    const scoreNumber = document.getElementById('score-number');
    if (scoreDisplay && scoreNumber) {
      scoreDisplay.style.display = 'block';
      scoreNumber.textContent = `${quizScore}/${totalQuestions}`;
    }
    
    // Show completion message
    setTimeout(() => {
      showQuizCompletionMessage(percentage);
    }, 1000);
    
    // Generate intelligence assessment
    generateIntelligenceAssessment(percentage);
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
  
  if (score >= 85) {
    message = 'Excellent! You have advanced threat intelligence knowledge and understand current attack trends.';
    color = 'var(--accent-green)';
  } else if (score >= 70) {
    message = 'Good work! You understand threat intelligence fundamentals. Review AI-enhanced attacks and current trends.';
    color = 'var(--accent-blue)';
  } else if (score >= 50)