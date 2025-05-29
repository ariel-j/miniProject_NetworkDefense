// PhishGuard Urgency Tactics Learning Module

// Quiz data with correct answers and explanations
const quizData = {
  1: {
    correctAnswer: 0, // Index of correct answer
    explanation: "Correct! Phishers use urgency tactics to trigger emotional responses that bypass critical thinking. When people feel rushed, they're more likely to make poor decisions without properly verifying the legitimacy of a message."
  },
  2: {
    correctAnswer: 2,
    explanation: "Excellent! The safest approach is always to verify through official channels. Never click links in suspicious emails - instead, open a new browser tab and navigate directly to the official website to check your account status."
  },
  3: {
    correctAnswer: 2,
    explanation: "Correct! Legitimate organizations typically use courteous, non-urgent language like 'at your convenience'. Phrases that create artificial urgency are red flags for phishing attempts."
  }
};

// Track user's quiz progress
let userAnswers = {};
let quizCompleted = false;

// Initialize the page
function initialize() {
  setupQuizEventListeners();
  loadUserProgress();
}

// Set up event listeners for quiz questions
function setupQuizEventListeners() {
  const quizOptions = document.querySelectorAll('.quiz-option');
  
  quizOptions.forEach(option => {
    option.addEventListener('click', function() {
      const questionContainer = this.closest('.quiz-question');
      const questionNumber = this.closest('.quiz-options').dataset.question;
      const optionIndex = Array.from(this.parentNode.children).indexOf(this);
      
      // Remove previous selections
      questionContainer.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
      });
      
      // Mark this option as selected
      this.classList.add('selected');
      
      // Store user's answer
      userAnswers[questionNumber] = optionIndex;
      
      // Show feedback after a short delay
      setTimeout(() => {
        showQuizFeedback(questionNumber, optionIndex);
      }, 500);
    });
  });
}

// Show feedback for quiz questions
function showQuizFeedback(questionNumber, selectedIndex) {
  const feedbackElement = document.getElementById(`feedback-${questionNumber}`);
  const questionData = quizData[questionNumber];
  const isCorrect = selectedIndex === questionData.correctAnswer;
  
  // Update option styling
  const questionContainer = document.querySelector(`[data-question="${questionNumber}"]`);
  const options = questionContainer.querySelectorAll('.quiz-option');
  
  options.forEach((option, index) => {
    if (index === questionData.correctAnswer) {
      option.classList.add('correct');
    } else if (index === selectedIndex && !isCorrect) {
      option.classList.add('incorrect');
    }
  });
  
  // Show feedback message
  feedbackElement.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  feedbackElement.textContent = questionData.explanation;
  
  // Save progress
  saveUserProgress();
  
  // Check if quiz is completed
  if (Object.keys(userAnswers).length === Object.keys(quizData).length) {
    completeQuiz();
  }
}

// Save user progress to storage
function saveUserProgress() {
  const progressData = {
    topic: 'urgencyTactics',
    answers: userAnswers,
    completed: quizCompleted,
    timestamp: new Date().toISOString()
  };
  
  // If running in extension context
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['learningProgress'], function(result) {
      const progress = result.learningProgress || {};
      progress.urgencyTactics = progressData;
      chrome.storage.local.set({ learningProgress: progress });
    });
  } else {
    // Fallback to localStorage for testing
    localStorage.setItem('phishguard_urgency_progress', JSON.stringify(progressData));
  }
}

// Load user progress from storage
function loadUserProgress() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['learningProgress'], function(result) {
      const progress = result.learningProgress;
      if (progress && progress.urgencyTactics) {
        restoreQuizState(progress.urgencyTactics);
      }
    });
  } else {
    // Fallback to localStorage for testing
    const saved = localStorage.getItem('phishguard_urgency_progress');
    if (saved) {
      try {
        const progressData = JSON.parse(saved);
        restoreQuizState(progressData);
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }
}

// Restore previous quiz state
function restoreQuizState(progressData) {
  userAnswers = progressData.answers || {};
  quizCompleted = progressData.completed || false;
  
  // Restore visual state of answered questions
  Object.entries(userAnswers).forEach(([questionNumber, answerIndex]) => {
    const questionContainer = document.querySelector(`[data-question="${questionNumber}"]`);
    if (questionContainer) {
      const options = questionContainer.querySelectorAll('.quiz-option');
      const selectedOption = options[answerIndex];
      
      if (selectedOption) {
        selectedOption.classList.add('selected');
        showQuizFeedback(questionNumber, answerIndex);
      }
    }
  });
}

// Complete the quiz and update extension stats
function completeQuiz() {
  quizCompleted = true;
  
  // Calculate score
  const totalQuestions = Object.keys(quizData).length;
  let correctAnswers = 0;
  
  Object.entries(userAnswers).forEach(([questionNumber, answerIndex]) => {
    if (answerIndex === quizData[questionNumber].correctAnswer) {
      correctAnswers++;
    }
  });
  
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Report completion to extension if available
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({
      action: 'learningModuleComplete',
      module: 'urgencyTactics',
      score: score,
      totalQuestions: totalQuestions,
      correctAnswers: correctAnswers
    });
  }
  
  // Show completion message
  showCompletionMessage(score);
  
  saveUserProgress();
}

// Show quiz completion message
function showCompletionMessage(score) {
  const completionMessage = document.createElement('div');
  completionMessage.className = 'lesson-content';
  completionMessage.innerHTML = `
    <h2>🎉 Quiz Completed!</h2>
    <p>Your score: <strong>${score}%</strong></p>
    <p>
      ${score >= 80 
        ? 'Excellent work! You have a strong understanding of how to recognize and avoid urgency tactics in phishing attempts.' 
        : score >= 60 
        ? 'Good job! You have a solid foundation. Consider reviewing the material above to strengthen your knowledge.' 
        : 'Keep learning! Review the content above and try to understand why urgency tactics are effective manipulation techniques.'}
    </p>
    <div style="margin-top: 20px;">
      <button class="button" onclick="resetQuiz()">Retake Quiz</button>
      <button class="button button-secondary" onclick="returnToDashboard()">Return to Dashboard</button>
    </div>
  `;
  
  // Insert after the quiz section
  const quizSection = document.querySelector('.quiz-section');
  quizSection.parentNode.insertBefore(completionMessage, quizSection.nextSibling);
}

// Reset quiz to allow retaking
function resetQuiz() {
  userAnswers = {};
  quizCompleted = false;
  
  // Clear all quiz styling
  document.querySelectorAll('.quiz-option').forEach(option => {
    option.classList.remove('selected', 'correct', 'incorrect');
  });
  
  // Hide all feedback
  document.querySelectorAll('.quiz-feedback').forEach(feedback => {
    feedback.style.display = 'none';
  });
  
  // Remove completion message
  const completionMessages = document.querySelectorAll('.lesson-content');
  completionMessages.forEach(msg => {
    if (msg.innerHTML.includes('Quiz Completed!')) {
      msg.remove();
    }
  });
  
  // Clear saved progress
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['learningProgress'], function(result) {
      const progress = result.learningProgress || {};
      delete progress.urgencyTactics;
      chrome.storage.local.set({ learningProgress: progress });
    });
  } else {
    localStorage.removeItem('phishguard_urgency_progress');
  }
}

// Return to dashboard
function returnToDashboard() {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/index.html') });
    window.close();
  } else {
    // Fallback for testing environment
    window.history.back();
  }
}

// Add smooth scrolling for better UX
function smoothScrollToElement(element) {
  element.scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
}

// Add keyboard navigation for accessibility
function handleKeyNavigation(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    const focusedElement = document.activeElement;
    if (focusedElement.classList.contains('quiz-option')) {
      focusedElement.click();
      event.preventDefault();
    }
  }
}

// Make quiz options keyboard accessible
function makeQuizAccessible() {
  document.querySelectorAll('.quiz-option').forEach((option, index) => {
    option.setAttribute('tabindex', '0');
    option.setAttribute('role', 'button');
    option.setAttribute('aria-describedby', `Option ${index + 1}`);
    
    option.addEventListener('keydown', handleKeyNavigation);
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initialize();
  makeQuizAccessible();
});