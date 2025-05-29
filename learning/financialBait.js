// PhishGuard - Financial Bait Learning Module JavaScript

// Quiz functionality
let quizScore = 0;
let questionsAnswered = 0;
const totalQuestions = 2;

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
    progressText.textContent = `Quiz Complete! Score: ${quizScore}/${totalQuestions} (${percentage}%)`;
    
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
  const message = score >= 80 ? 
    'Excellent! You can spot financial bait effectively.' :
    'Good start! Remember: if it sounds too good to be true, it is.';
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
    color: var(--primary-bg);
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0, 255, 65, 0.3);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

// Button handlers
function setupButtons() {
  const takeQuizBtn = document.getElementById('take-quiz');
  const backBtn = document.getElementById('back-to-dashboard');
  
  if (takeQuizBtn) {
    takeQuizBtn.addEventListener('click', () => {
      // Navigate to training lab section
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html#training') });
      } else {
        window.location.href = '../dashboard.html#training';
      }
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

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  initializeQuiz();
  setupButtons();
  console.log('PhishGuard: Financial Bait learning module loaded');
});