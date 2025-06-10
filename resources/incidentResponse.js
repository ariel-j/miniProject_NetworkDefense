// PhishGuard Incident Response JavaScript - Fixed Version

document.addEventListener('DOMContentLoaded', function() {
  console.log('PhishGuard: Incident Response page loaded');
  initializeIncidentResponse();
});

function initializeIncidentResponse() {
  setupEventListeners();
  initializeProgressTracker();
  setupTemplateActions();
  setupEmergencyActions();
  startTerminalAnimation();
  console.log('PhishGuard: Incident Response initialized');
}

function setupEventListeners() {
  // Emergency action button
  const emergencyBtn = document.getElementById('emergency-action');
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', startEmergencyResponse);
  }
  
  // Copy template buttons
  const copyButtons = document.querySelectorAll('.copy-template');
  copyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const templateType = this.getAttribute('data-template');
      copyTemplate(templateType);
    });
  });
  
  // Action buttons
  const takeQuizBtn = document.getElementById('take-quiz');
  if (takeQuizBtn) {
    takeQuizBtn.addEventListener('click', startKnowledgeQuiz);
  }
  
  const createPlanBtn = document.getElementById('create-plan');
  if (createPlanBtn) {
    createPlanBtn.addEventListener('click', createPersonalPlan);
  }
  
  const backBtn = document.getElementById('back-to-dashboard');
  if (backBtn) {
    backBtn.addEventListener('click', returnToDashboard);
  }
  
  const printBtn = document.getElementById('print-card');
  if (printBtn) {
    printBtn.addEventListener('click', printEmergencyCard);
  }
  
  // Save answers functionality
  const answerTextareas = document.querySelectorAll('.question-answer');
  answerTextareas.forEach(textarea => {
    textarea.addEventListener('blur', saveAnswer);
    textarea.addEventListener('input', autoResize);
  });
}

function startEmergencyResponse() {
  showNotification('🚨 Emergency response protocol activated!', 'emergency');
  
  // Scroll to immediate actions section
  const immediateActionsSection = document.querySelector('.card-title');
  if (immediateActionsSection) {
    const cardElement = immediateActionsSection.closest('.card');
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth' });
      
      // Highlight the emergency card
      const emergencyCard = document.querySelector('.emergency-card');
      if (emergencyCard) {
        emergencyCard.style.animation = 'emergencyHighlight 1s ease-in-out 3';
      }
    }
  }
  
  startEmergencyProgressTracker();
}

function startEmergencyProgressTracker() {
  const steps = [
    'Disconnect System',
    'Document Incident', 
    'Alert IT/Security',
    'Preserve Evidence',
    'Report Complete'
  ];
  
  let currentStep = 0;
  
  if (!document.getElementById('emergency-progress')) {
    createEmergencyProgressTracker(steps);
  }
  
  const stepInterval = setInterval(() => {
    if (currentStep < steps.length) {
      updateProgressStep(currentStep, 'current');
      showStepGuidance(steps[currentStep], currentStep);
      
      setTimeout(() => {
        updateProgressStep(currentStep, 'completed');
        currentStep++;
        
        if (currentStep >= steps.length) {
          clearInterval(stepInterval);
          showNotification('✅ Emergency response protocol completed!', 'success');
        }
      }, 30000);
    }
  }, 1000);
}

function createEmergencyProgressTracker(steps) {
  const trackerHTML = '<div id="emergency-progress" class="progress-tracker">' +
    '<h4>🎯 Emergency Response Progress</h4>' +
    '<div class="progress-steps">' +
    steps.map((step, index) => 
      '<div class="progress-step">' +
        '<div class="progress-circle" id="step-' + index + '">' + (index + 1) + '</div>' +
        '<div class="progress-label">' + step + '</div>' +
      '</div>'
    ).join('') +
    '</div>' +
    '<div id="step-guidance" class="step-guidance"></div>' +
    '</div>';
  
  const emergencyAlert = document.querySelector('.emergency-alert');
  if (emergencyAlert) {
    emergencyAlert.insertAdjacentHTML('afterend', trackerHTML);
  }
}

function updateProgressStep(stepIndex, status) {
  const stepCircle = document.getElementById('step-' + stepIndex);
  if (stepCircle) {
    stepCircle.className = 'progress-circle ' + status;
    
    if (status === 'completed') {
      stepCircle.textContent = '✓';
    }
  }
}

function showStepGuidance(stepName, stepIndex) {
  const guidance = {
    'Disconnect System': {
      icon: '🔌',
      title: 'Disconnect Your System',
      instructions: [
        'Unplug ethernet cable or disable Wi-Fi',
        'Keep the computer powered on',
        'Do not shut down or restart',
        'Document the current time'
      ]
    },
    'Document Incident': {
      icon: '📝',
      title: 'Document What Happened', 
      instructions: [
        'Write down exactly what you clicked',
        'Note the time of the incident',
        'Take screenshots if safe to do so',
        'Record any error messages'
      ]
    },
    'Alert IT/Security': {
      icon: '📞',
      title: 'Contact Your IT Team',
      instructions: [
        'Call IT help desk immediately',
        'Use the templates provided below',
        'Provide all documented details',
        'Ask for immediate assistance'
      ]
    },
    'Preserve Evidence': {
      icon: '🔍',
      title: 'Preserve Digital Evidence',
      instructions: [
        'Do not delete anything',
        'Keep browser windows open',
        'Save email if still accessible',
        'Note any system changes'
      ]
    },
    'Report Complete': {
      icon: '✅',
      title: 'Complete Incident Report',
      instructions: [
        'Fill out formal incident report',
        'Review timeline of events',
        'Submit to security team',
        'Follow up as requested'
      ]
    }
  };
  
  const stepInfo = guidance[stepName];
  const guidanceEl = document.getElementById('step-guidance');
  
  if (stepInfo && guidanceEl) {
    guidanceEl.innerHTML = 
      '<div class="current-step-card">' +
        '<div class="step-header">' +
          '<span class="step-icon">' + stepInfo.icon + '</span>' +
          '<h4>' + stepInfo.title + '</h4>' +
        '</div>' +
        '<ul class="step-instructions">' +
          stepInfo.instructions.map(instruction => '<li>' + instruction + '</li>').join('') +
        '</ul>' +
        '<button class="step-complete-btn" onclick="confirmStepComplete(' + stepIndex + ')">' +
          '✓ Mark Step Complete' +
        '</button>' +
      '</div>';
  }
}

function confirmStepComplete(stepIndex) {
  updateProgressStep(stepIndex, 'completed');
  showNotification('Step ' + (stepIndex + 1) + ' marked as complete!', 'success');
  
  const guidanceEl = document.getElementById('step-guidance');
  if (guidanceEl) {
    guidanceEl.innerHTML = '<p style="text-align: center; color: var(--accent-green); padding: 20px;">✅ Step completed! Proceeding to next step...</p>';
  }
}

function copyTemplate(templateType) {
  try {
    const templateElement = document.querySelector('[data-template="' + templateType + '"]');
    if (!templateElement) return;
    
    const templateContent = templateElement.parentElement.querySelector('.template-content');
    if (!templateContent) return;
    
    const templateText = templateContent.textContent;
    
    if (templateText && navigator.clipboard) {
      navigator.clipboard.writeText(templateText.trim()).then(() => {
        showNotification('✅ Template copied to clipboard!', 'success');
        
        const originalText = templateElement.textContent;
        templateElement.textContent = '✓ Copied!';
        templateElement.style.background = 'var(--accent-green)';
        
        setTimeout(() => {
          templateElement.textContent = originalText;
          templateElement.style.background = '';
        }, 2000);
      }).catch(() => {
        showNotification('❌ Failed to copy template', 'error');
      });
    }
  } catch (error) {
    console.error('Error copying template:', error);
    showNotification('❌ Failed to copy template', 'error');
  }
}

function printEmergencyCard() {
  const emergencyCard = document.querySelector('.emergency-card');
  if (emergencyCard) {
    const printWindow = window.open('', '_blank');
    const printContent = 
      '<html>' +
        '<head>' +
          '<title>PhishGuard Emergency Response Card</title>' +
          '<style>' +
            'body { font-family: Arial, sans-serif; padding: 20px; }' +
            '.emergency-card { border: 2px solid #ff0040; padding: 20px; }' +
            'h4 { color: #ff0040; margin-bottom: 10px; }' +
            'ol, ul { margin: 10px 0; padding-left: 20px; }' +
            '.contact-info { font-family: "Courier New", monospace; line-height: 1.6; }' +
          '</style>' +
        '</head>' +
        '<body>' +
          '<h1>🚨 PhishGuard Emergency Response Card</h1>' +
          emergencyCard.outerHTML +
          '<p style="margin-top: 30px; font-size: 12px; color: #666;">' +
            'Generated by PhishGuard on ' + new Date().toLocaleDateString() +
          '</p>' +
        '</body>' +
      '</html>';
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    showNotification('🖨️ Emergency card sent to printer!', 'success');
  }
}

function saveAnswer(event) {
  try {
    const questionIndex = Array.from(document.querySelectorAll('.question-answer')).indexOf(event.target);
    const answer = event.target.value;
    
    const answers = JSON.parse(localStorage.getItem('phishguard-incident-answers') || '{}');
    answers[questionIndex] = answer;
    localStorage.setItem('phishguard-incident-answers', JSON.stringify(answers));
    
    showNotification('💾 Answer saved automatically', 'info');
  } catch (error) {
    console.error('Error saving answer:', error);
  }
}

function loadSavedAnswers() {
  try {
    const answers = JSON.parse(localStorage.getItem('phishguard-incident-answers') || '{}');
    const textareas = document.querySelectorAll('.question-answer');
    
    textareas.forEach((textarea, index) => {
      if (answers[index]) {
        textarea.value = answers[index];
        autoResize({ target: textarea });
      }
    });
  } catch (error) {
    console.error('Error loading saved answers:', error);
  }
}

function autoResize(event) {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

function startKnowledgeQuiz() {
  const quizQuestions = [
    {
      question: "What should you do FIRST if you suspect you've fallen for a phishing attack?",
      options: [
        "Change all your passwords immediately",
        "Disconnect your device from the network", 
        "Call your manager",
        "Delete the suspicious email"
      ],
      correct: 1,
      explanation: "Disconnecting from the network prevents further data theft and stops malware from communicating with attackers."
    },
    {
      question: "How long do you typically have to contain a security incident effectively?",
      options: [
        "24 hours",
        "1 hour", 
        "15 minutes",
        "1 week"
      ],
      correct: 1,
      explanation: "Security experts recommend containing incidents within 1 hour to minimize damage and data theft."
    },
    {
      question: "What information should you NOT include in your initial incident report?",
      options: [
        "Time of the incident",
        "Your personal passwords",
        "Description of what happened", 
        "Systems potentially affected"
      ],
      correct: 1,
      explanation: "Never share your actual passwords in incident reports. Change them instead."
    }
  ];
  
  showQuiz(quizQuestions);
}

function showQuiz(questions) {
  let currentQuestion = 0;
  let score = 0;
  
  const quizHTML = 
    '<div id="knowledge-quiz" class="quiz-overlay">' +
      '<div class="quiz-container">' +
        '<div class="quiz-header">' +
          '<h3>🧠 Incident Response Knowledge Quiz</h3>' +
          '<div class="quiz-progress">' +
            '<span id="question-counter">1 of ' + questions.length + '</span>' +
            '<button id="close-quiz" class="close-btn">✕</button>' +
          '</div>' +
        '</div>' +
        '<div id="quiz-content"></div>' +
      '</div>' +
    '</div>';
  
  document.body.insertAdjacentHTML('beforeend', quizHTML);
  
  document.getElementById('close-quiz').addEventListener('click', closeQuiz);
  
  showQuestion(questions, currentQuestion, score);
}

function showQuestion(questions, currentQuestion, score) {
  const question = questions[currentQuestion];
  const quizContent = document.getElementById('quiz-content');
  
  quizContent.innerHTML = 
    '<div class="question-card">' +
      '<h4>Question ' + (currentQuestion + 1) + '</h4>' +
      '<p class="question-text">' + question.question + '</p>' +
      '<div class="options">' +
        question.options.map((option, index) => 
          '<button class="option-btn" data-index="' + index + '">' +
            String.fromCharCode(65 + index) + '. ' + option +
          '</button>'
        ).join('') +
      '</div>' +
    '</div>';
  
  const optionBtns = quizContent.querySelectorAll('.option-btn');
  optionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const selectedIndex = parseInt(this.getAttribute('data-index'));
      handleQuizAnswer(questions, currentQuestion, selectedIndex, score);
    });
  });
}

function handleQuizAnswer(questions, currentQuestion, selectedIndex, score) {
  const question = questions[currentQuestion];
  const isCorrect = selectedIndex === question.correct;
  
  if (isCorrect) score++;
  
  const quizContent = document.getElementById('quiz-content');
  quizContent.innerHTML = 
    '<div class="answer-feedback ' + (isCorrect ? 'correct' : 'incorrect') + '">' +
      '<div class="feedback-icon">' + (isCorrect ? '✅' : '❌') + '</div>' +
      '<h4>' + (isCorrect ? 'Correct!' : 'Incorrect') + '</h4>' +
      '<p class="explanation">' + question.explanation + '</p>' +
      '<button id="next-question" class="cyber-button">' +
        (currentQuestion + 1 < questions.length ? 'Next Question' : 'View Results') +
      '</button>' +
    '</div>';
  
  document.getElementById('next-question').addEventListener('click', () => {
    if (currentQuestion + 1 < questions.length) {
      showQuestion(questions, currentQuestion + 1, score);
      document.getElementById('question-counter').textContent = (currentQuestion + 2) + ' of ' + questions.length;
    } else {
      showQuizResults(score, questions.length);
    }
  });
}

function showQuizResults(score, totalQuestions) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const quizContent = document.getElementById('quiz-content');
  
  let feedback = '';
  let badgeColor = '';
  
  if (percentage >= 80) {
    feedback = 'Excellent! You have a strong understanding of incident response procedures.';
    badgeColor = 'var(--accent-green)';
  } else if (percentage >= 60) {
    feedback = 'Good job! Review the areas you missed to improve your response readiness.';
    badgeColor = 'var(--accent-blue)';
  } else {
    feedback = 'Consider reviewing the incident response guide to strengthen your knowledge.';
    badgeColor = 'var(--accent-orange)';
  }
  
  quizContent.innerHTML = 
    '<div class="quiz-results">' +
      '<div class="results-badge" style="border-color: ' + badgeColor + '; color: ' + badgeColor + ';">' +
        percentage + '%' +
      '</div>' +
      '<h4>Quiz Complete!</h4>' +
      '<p>You scored ' + score + ' out of ' + totalQuestions + ' questions correctly.</p>' +
      '<p class="feedback">' + feedback + '</p>' +
      '<div class="results-actions">' +
        '<button id="retake-quiz" class="cyber-button secondary">🔄 Retake Quiz</button>' +
        '<button id="close-results" class="cyber-button">📚 Back to Guide</button>' +
      '</div>' +
    '</div>';
  
  const quizResults = {
    score: score,
    total: totalQuestions,
    percentage: percentage,
    date: new Date().toISOString()
  };
  localStorage.setItem('phishguard-quiz-results', JSON.stringify(quizResults));
  
  document.getElementById('retake-quiz').addEventListener('click', () => {
    closeQuiz();
    startKnowledgeQuiz();
  });
  
  document.getElementById('close-results').addEventListener('click', closeQuiz);
}

function closeQuiz() {
  const quiz = document.getElementById('knowledge-quiz');
  if (quiz) {
    quiz.remove();
  }
}

function createPersonalPlan() {
  const planTemplate = 
    '# Personal Incident Response Plan\n\n' +
    '## Emergency Contacts\n' +
    '- IT Help Desk: ________________\n' +
    '- Security Team: ________________\n' +
    '- Manager: ________________\n' +
    '- Local IT Contact: ________________\n\n' +
    '## My Immediate Response Checklist\n' +
    '□ Disconnect from network (unplug/disable Wi-Fi)\n' +
    '□ Document time and what happened\n' +
    '□ Take screenshot if safe\n' +
    '□ Call IT Help Desk: ________________\n' +
    '□ Email manager using template\n' +
    '□ Keep system powered on\n' +
    '□ Do not delete anything\n\n' +
    '## My Prevention Measures\n' +
    '□ Enable 2FA on all accounts\n' +
    '□ Use password manager\n' +
    '□ Regular security training\n' +
    '□ Verify unexpected requests\n' +
    '□ Check URLs before clicking\n' +
    '□ Report suspicious emails\n\n' +
    '## Post-Incident Actions\n' +
    '□ Change all passwords\n' +
    '□ Review account activity\n' +
    '□ Update security settings\n' +
    '□ Complete incident report\n' +
    '□ Schedule security review\n' +
    '□ Learn from the experience\n\n' +
    'Generated by PhishGuard on ' + new Date().toLocaleDateString();
  
  const blob = new Blob([planTemplate], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-incident-response-plan.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('📋 Personal response plan downloaded!', 'success');
}

function returnToDashboard() {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.update(tabs[0].id, { url: chrome.runtime.getURL('dashboard.html') });
    });
  } else {
    window.location.href = '../dashboard.html';
  }
}

function initializeProgressTracker() {
  const savedProgress = localStorage.getItem('phishguard-incident-progress');
  if (savedProgress) {
    try {
      const progress = JSON.parse(savedProgress);
      const daysSinceLastIncident = (Date.now() - progress.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceLastIncident < 1) {
        showContinueOption(progress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
}

function setupTemplateActions() {
  const templates = document.querySelectorAll('.template-content');
  templates.forEach(template => {
    template.addEventListener('click', function() {
      this.contentEditable = true;
      this.focus();
      showNotification('✏️ Template is now editable. Click outside to save.', 'info');
    });
    
    template.addEventListener('blur', function() {
      this.contentEditable = false;
      showNotification('💾 Template changes saved', 'success');
    });
  });
}

function setupEmergencyActions() {
  document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'E') {
      event.preventDefault();
      startEmergencyResponse();
    }
  });
}

function startTerminalAnimation() {
  const terminalLines = document.querySelectorAll('.terminal-line');
  terminalLines.forEach((line, index) => {
    line.style.animationDelay = (index * 0.2) + 's';
  });
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = 'notification ' + (type || 'info');
  notification.textContent = message;
  
  notification.style.cssText = 
    'position: fixed;' +
    'top: 20px;' +
    'right: 20px;' +
    'padding: 15px 20px;' +
    'border-radius: 8px;' +
    'color: white;' +
    'font-weight: bold;' +
    'z-index: 10000;' +
    'max-width: 300px;' +
    'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);' +
    'font-size: 14px;' +
    'animation: slideInRight 0.3s ease-out;';
  
  const colors = {
    'success': 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))',
    'error': 'linear-gradient(135deg, var(--accent-red), var(--accent-orange))', 
    'emergency': 'linear-gradient(135deg, var(--accent-red), var(--accent-red))',
    'info': 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))'
  };
  
  notification.style.background = colors[type] || colors.info;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Load saved answers when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadSavedAnswers();
});

console.log('PhishGuard: Incident Response JavaScript loaded successfully');