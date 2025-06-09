// PhishGuard - Quick Security Tips JavaScript

// Quiz functionality
let quizScore = 0;
let questionsAnswered = 0;
const totalQuestions = 4;

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
    progressText.textContent = `Knowledge Check Complete! Score: ${quizScore}/${totalQuestions} (${percentage}%)`;
    
    // Show completion message
    setTimeout(() => {
      showCompletionMessage(percentage);
    }, 1000);
  } else {
    progressText.textContent = `Progress: ${questionsAnswered}/${totalQuestions} questions answered`;
  }
}

// Show completion message
function showCompletionMessage(score) {
  let message = '';
  let color = '';
  
  if (score >= 75) {
    message = 'Excellent! You understand essential security practices well.';
    color = 'var(--accent-green)';
  } else if (score >= 50) {
    message = 'Good progress! Review the tips and practice implementing them.';
    color = 'var(--accent-yellow)';
  } else {
    message = 'Keep learning! Focus on the high-priority security tips first.';
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

// Checklist functionality
function initializeChecklist() {
  const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
  
  checkboxes.forEach(checkbox => {
    // Load saved state
    const savedState = localStorage.getItem(`checklist_${checkbox.id}`);
    if (savedState === 'true') {
      checkbox.checked = true;
    }
    
    // Save state on change
    checkbox.addEventListener('change', function() {
      localStorage.setItem(`checklist_${this.id}`, this.checked);
      
      // Show encouragement when item is checked
      if (this.checked) {
        showChecklistFeedback('✓ Great progress on your security journey!');
      }
    });
  });
}

// Show checklist feedback
function showChecklistFeedback(message) {
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
    animation: slideInUp 0.3s ease-out;
  `;
  feedback.textContent = message;
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.remove();
    }
  }, 3000);
}

// Tip card interactions
function initializeTipCards() {
  const tipCards = document.querySelectorAll('.tip-card');
  
  tipCards.forEach((card, index) => {
    // Add staggered animation
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Add click handler for mobile devices
    card.addEventListener('click', function() {
      this.classList.toggle('expanded');
    });
    
    // Add priority-based glow effect
    const priorityBadge = card.querySelector('.priority-badge');
    if (priorityBadge) {
      if (priorityBadge.classList.contains('high')) {
        card.addEventListener('mouseenter', () => {
          card.style.boxShadow = '0 0 20px rgba(255, 0, 64, 0.3)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.boxShadow = '';
        });
      }
    }
  });
}

// Interactive security score calculator
function calculateSecurityScore() {
  const checkedItems = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
  const totalItems = document.querySelectorAll('.checklist-item input[type="checkbox"]').length;
  const quizPercentage = questionsAnswered > 0 ? (quizScore / questionsAnswered) * 100 : 0;
  
  const checklistScore = (checkedItems / totalItems) * 50; // 50% weight
  const knowledgeScore = quizPercentage * 0.5; // 50% weight
  
  const totalScore = Math.round(checklistScore + knowledgeScore);
  
  return {
    total: totalScore,
    checklist: Math.round(checklistScore),
    knowledge: Math.round(knowledgeScore),
    level: getSecurityLevel(totalScore)
  };
}

// Get security level based on score
function getSecurityLevel(score) {
  if (score >= 90) return { level: 'Expert', color: 'var(--accent-green)', icon: '🛡️' };
  if (score >= 75) return { level: 'Advanced', color: 'var(--accent-blue)', icon: '🔒' };
  if (score >= 50) return { level: 'Intermediate', color: 'var(--accent-yellow)', icon: '⚡' };
  if (score >= 25) return { level: 'Beginner', color: 'var(--accent-orange)', icon: '🔑' };
  return { level: 'Getting Started', color: 'var(--accent-red)', icon: '📚' };
}

// Dynamic security tips based on user progress
function showPersonalizedTips() {
  const score = calculateSecurityScore();
  const tipContainer = document.createElement('div');
  tipContainer.className = 'personalized-tips';
  tipContainer.style.cssText = `
    background: var(--card-bg);
    border: 2px solid ${score.level.color};
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
  `;
  
  tipContainer.innerHTML = `
    <h3 style="color: ${score.level.color}; margin-bottom: 15px;">
      ${score.level.icon} Your Security Level: ${score.level.level}
    </h3>
    <p style="color: var(--text-secondary); margin-bottom: 15px;">
      Current Security Score: ${score.total}/100
    </p>
    <div style="display: flex; justify-content: space-around; margin: 15px 0;">
      <div>
        <div style="color: var(--accent-blue); font-weight: bold;">${score.checklist}%</div>
        <div style="color: var(--text-muted); font-size: 12px;">Implementation</div>
      </div>
      <div>
        <div style="color: var(--accent-green); font-weight: bold;">${score.knowledge}%</div>
        <div style="color: var(--text-muted); font-size: 12px;">Knowledge</div>
      </div>
    </div>
    ${getPersonalizedRecommendation(score)}
  `;
  
  return tipContainer;
}

// Get personalized recommendation
function getPersonalizedRecommendation(score) {
  if (score.total >= 90) {
    return '<p style="color: var(--accent-green);">🎉 Outstanding! You\'re a security champion. Consider mentoring others!</p>';
  } else if (score.total >= 75) {
    return '<p style="color: var(--accent-blue);">💪 Great work! Focus on advanced topics like threat intelligence and incident response.</p>';
  } else if (score.total >= 50) {
    return '<p style="color: var(--accent-yellow);">⚡ Good progress! Prioritize implementing MFA and password management.</p>';
  } else if (score.total >= 25) {
    return '<p style="color: var(--accent-orange);">🔑 Getting started! Focus on the "Critical" priority items first.</p>';
  } else {
    return '<p style="color: var(--accent-red);">📚 Just beginning! Start with strong passwords and software updates.</p>';
  }
}

// Weekly challenge tracker
function initializeWeeklyChallenge() {
  const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % 4 + 1;
  const weekSections = document.querySelectorAll('.week-section');
  
  weekSections.forEach((section, index) => {
    const weekNumber = index + 1;
    if (weekNumber === currentWeek) {
      section.style.borderLeftColor = 'var(--accent-green)';
      section.style.background = 'rgba(0, 255, 65, 0.05)';
      
      const header = section.querySelector('h3');
      header.innerHTML += ' <span style="color: var(--accent-green);">← Current Week</span>';
    } else if (weekNumber < currentWeek) {
      section.style.opacity = '0.7';
    }
  });
}

// Button handlers
function setupButtons() {
  const takeQuizBtn = document.getElementById('take-quiz');
  const backBtn = document.getElementById('back-to-dashboard');
  
  if (takeQuizBtn) {
    takeQuizBtn.addEventListener('click', () => {
      // Show personalized tips based on current progress
      const existingTips = document.querySelector('.personalized-tips');
      if (existingTips) {
        existingTips.remove();
      }
      
      const tipsElement = showPersonalizedTips();
      takeQuizBtn.parentNode.insertBefore(tipsElement, takeQuizBtn);
      
      // Scroll to the new tips
      tipsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    // Ctrl/Cmd + Enter to take quiz
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      const takeQuizBtn = document.getElementById('take-quiz');
      if (takeQuizBtn) {
        takeQuizBtn.click();
      }
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

// Print-friendly checklist
function createPrintableChecklist() {
  const printBtn = document.createElement('button');
  printBtn.textContent = '🖨️ Print Checklist';
  printBtn.className = 'cyber-button secondary';
  printBtn.style.fontSize = '14px';
  printBtn.style.padding = '8px 16px';
  
  printBtn.addEventListener('click', () => {
    const printWindow = window.open('', '_blank');
    const checklistHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PhishGuard Security Checklist</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .checklist-item { margin: 10px 0; }
          .checklist-item input { margin-right: 10px; }
          h1 { color: #333; }
          .priority { font-weight: bold; }
          .high { color: #ff0040; }
          .medium { color: #ff8800; }
          .low { color: #00ff41; }
        </style>
      </head>
      <body>
        <h1>🛡️ PhishGuard Security Checklist</h1>
        <p>Complete these essential security tasks to protect yourself online:</p>
        
        <h2>Critical Priority</h2>
        <div class="checklist-item">☐ Install and configure password manager</div>
        <div class="checklist-item">☐ Enable MFA on all important accounts</div>
        <div class="checklist-item">☐ Update all software and operating systems</div>
        
        <h2>Important Priority</h2>
        <div class="checklist-item">☐ Secure mobile devices with locks and settings</div>
        <div class="checklist-item">☐ Configure secure Wi-Fi and use VPN for public networks</div>
        <div class="checklist-item">☐ Practice safe browsing habits</div>
        
        <h2>Recommended</h2>
        <div class="checklist-item">☐ Set up automated data backups</div>
        <div class="checklist-item">☐ Monitor accounts regularly</div>
        <div class="checklist-item">☐ Limit personal information sharing</div>
        <div class="checklist-item">☐ Develop email security awareness</div>
        
        <p style="margin-top: 30px; font-style: italic;">
          Generated by PhishGuard Training Platform - 
          Remember: Progress, not perfection!
        </p>
      </body>
      </html>
    `;
    
    printWindow.document.write(checklistHTML);
    printWindow.document.close();
    printWindow.print();
  });
  
  const referenceCard = document.querySelector('.reference-card');
  if (referenceCard) {
    referenceCard.appendChild(printBtn);
  }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  initializeQuiz();
  initializeChecklist();
  initializeTipCards();
  initializeWeeklyChallenge();
  setupButtons();
  setupKeyboardShortcuts();
  createPrintableChecklist();
  
  console.log('PhishGuard: Quick Security Tips module loaded');
  
  // Add subtle tip card reveal animation
  setTimeout(() => {
    const tipCards = document.querySelectorAll('.tip-card');
    tipCards.forEach(card => {
      card.style.opacity = '1';
    });
  }, 100);
});

// Export functions for testing (if in development environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateSecurityScore,
    getSecurityLevel,
    initializeQuiz,
    updateProgress
  };
}