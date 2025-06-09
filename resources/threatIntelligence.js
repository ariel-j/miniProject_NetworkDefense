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
  } else if (score >= 50) {
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
      showPyramidLevelDetails(this);
    });
  });
  
  // Track framework study
  const frameworkCards = document.querySelectorAll('.framework-card');
  frameworkCards.forEach((card, index) => {
    card.addEventListener('click', function() {
      intelligenceProgress.frameworksStudied++;
      trackInteraction('framework_studied', this.querySelector('h3').textContent);
      saveProgress();
      showFrameworkDetails(this);
    });
  });
}

// Show pyramid level details
function showPyramidLevelDetails(level) {
  const levelData = level.getAttribute('data-level');
  const title = level.querySelector('h3').textContent;
  const painLevel = level.querySelector('.pain-level').textContent;
  const description = level.querySelector('p').textContent;
  const examples = level.querySelector('.examples').textContent.replace('Examples: ', '');
  
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
  
  const levelColors = {
    '6': 'var(--accent-red)',
    '5': 'var(--accent-orange)', 
    '4': 'var(--accent-yellow)',
    '3': 'var(--accent-cyan)',
    '2': 'var(--accent-blue)',
    '1': 'var(--accent-green)'
  };
  
  modal.innerHTML = `
    <div style="
      background: var(--card-bg);
      border: 2px solid ${levelColors[levelData]};
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
      
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 32px; margin-bottom: 10px;">${level.querySelector('.level-icon').textContent}</div>
        <h3 style="color: ${levelColors[levelData]}; margin-bottom: 10px;">${title}</h3>
        <div style="
          display: inline-block;
          padding: 6px 12px;
          background: ${levelColors[levelData]};
          color: var(--primary-bg);
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
        ">${painLevel}</div>
      </div>
      
      <p style="color: var(--text-secondary); margin-bottom: 15px; line-height: 1.6;">
        ${description}
      </p>
      
      <div style="
        background: rgba(0, 212, 255, 0.1);
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid ${levelColors[levelData]};
      ">
        <strong style="color: ${levelColors[levelData]}; font-size: 12px;">Examples:</strong>
        <span style="color: var(--text-secondary); font-size: 12px;"> ${examples}</span>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button style="
          background: ${levelColors[levelData]};
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

// Show framework details
function showFrameworkDetails(card) {
  const title = card.querySelector('h3').textContent;
  const description = card.querySelector('p').textContent;
  const features = Array.from(card.querySelectorAll('.framework-features li')).map(li => li.textContent);
  
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
      
      <h3 style="color: var(--accent-purple); margin-bottom: 15px;">${title}</h3>
      <p style="color: var(--text-secondary); margin-bottom: 15px; line-height: 1.6;">
        ${description}
      </p>
      
      <h4 style="color: var(--accent-cyan); margin-bottom: 10px; font-size: 14px;">Key Features:</h4>
      <ul style="margin: 0 0 15px 0; padding-left: 20px;">
        ${features.map(feature => `
          <li style="color: var(--text-primary); font-size: 13px; margin: 5px 0;">${feature}</li>
        `).join('')}
      </ul>
      
      <div style="text-align: center; margin-top: 20px;">
        <button style="
          background: var(--accent-purple);
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
      <div style="
        color: var(--accent-cyan);
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 15px;
        text-transform: uppercase;
      ">
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
      
      <div style="
        background: rgba(255, 0, 64, 0.1);
        padding: 10px;
        border-radius: 6px;
        border-left: 3px solid var(--accent-red);
      ">
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