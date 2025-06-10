// PhishGuard - Incident Response Guide JavaScript

// Global state management
let emergencyModeActive = false;
let quizScore = 0;
let questionsAnswered = 0;
const totalQuestions = 4;
let stepProgress = {
  phase1: 0,
  phase2: 0,
  phase3: 0,
  totalSteps: 15
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('PhishGuard: Incident Response module initializing...');
  initializeEmergencyResponse();
  initializeQuiz();
  initializeStepTracking();
  initializeButtons();
  initializeTemplateSystem();
  console.log('PhishGuard: Incident Response module fully loaded');
});

// Emergency Response System
function initializeEmergencyResponse() {
  const emergencyBtn = document.getElementById('emergency-action');
  
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', function() {
      startEmergencyResponse();
    });
  }
}

function startEmergencyResponse() {
  emergencyModeActive = true;
  
  // Create emergency overlay
  const overlay = document.createElement('div');
  overlay.id = 'emergency-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 0, 64, 0.95);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: emergencyPulse 2s ease-in-out infinite;
    overflow-y: auto;
  `;
  
  overlay.innerHTML = `
    <div style="
      background: white;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      max-width: 600px;
      margin: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      max-height: 90vh;
      overflow-y: auto;
    ">
      <div style="font-size: 60px; margin-bottom: 20px;">🚨</div>
      <h2 style="color: #ff0040; margin-bottom: 20px; font-size: 24px;">EMERGENCY RESPONSE ACTIVATED</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
        <h3 style="color: #ff0040; margin-bottom: 15px;">IMMEDIATE ACTIONS REQUIRED:</h3>
        <ol style="color: #333; font-size: 16px; line-height: 1.6;">
          <li><strong>Disconnect from network NOW</strong> (unplug ethernet or disable Wi-Fi)</li>
          <li><strong>Document what happened</strong> (write down what you clicked/entered)</li>
          <li><strong>Alert IT/Security team immediately</strong></li>
          <li><strong>Keep computer powered on</strong> (don't shut down)</li>
          <li><strong>Take photos with phone</strong> (screenshot any error messages)</li>
        </ol>
      </div>
      <div style="margin: 20px 0;">
        <button id="network-disconnected-btn" style="
          background: #ff0040;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          margin: 5px;
        ">✅ Network Disconnected</button>
        <button id="incident-documented-btn" style="
          background: #0066cc;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          margin: 5px;
        ">✅ Incident Documented</button>
      </div>
      <button id="close-emergency-btn" style="
        background: #666;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 10px;
      ">Close Emergency Mode</button>
    </div>
  `;
  
  // Add emergency animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes emergencyPulse {
      0%, 100% { opacity: 0.95; }
      50% { opacity: 0.85; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(overlay);
  
  // Add event listeners to the buttons
  document.getElementById('network-disconnected-btn').addEventListener('click', function() {
    confirmEmergencyAction('network');
  });
  
  document.getElementById('incident-documented-btn').addEventListener('click', function() {
    confirmEmergencyAction('documented');
  });
  
  document.getElementById('close-emergency-btn').addEventListener('click', function() {
    closeEmergencyOverlay();
  });
  
  // Play emergency sound notification if available (optional)
  if (confirm('🔊 Play emergency alert sound?')) {
    try {
      // Simple beep sound using Web Audio API (CSP-compliant)
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio notification not supported');
    }
  }
}

function confirmEmergencyAction(action) {
  // Find the button that was clicked by looking for the active emergency overlay
  const overlay = document.getElementById('emergency-overlay');
  if (!overlay) return;
  
  const buttons = overlay.querySelectorAll('button[onclick*="confirmEmergencyAction"]');
  buttons.forEach(button => {
    if (button.textContent.includes(action === 'network' ? 'Network' : 'Documented')) {
      button.style.background = '#00ff41';
      button.textContent = button.textContent.replace('✅', '✓ COMPLETED');
      button.disabled = true;
    }
  });
  
  // Track emergency response actions
  localStorage.setItem(`emergency_${action}`, new Date().toISOString());
  
  console.log(`Emergency action confirmed: ${action}`);
}

function closeEmergencyOverlay() {
  const overlay = document.getElementById('emergency-overlay');
  if (overlay) {
    overlay.remove();
  }
  emergencyModeActive = false;
  
  // Show completion message
  showNotification('Emergency response protocol completed. Continue with assessment phase.', 'success');
}

// Step Tracking System
function initializeStepTracking() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      updateStepProgress(this);
    });
  });
}

function updateStepProgress(checkbox) {
  const stepId = checkbox.id;
  const isChecked = checkbox.checked;
  
  // Determine which phase this step belongs to
  let phase = 'phase1';
  if (stepId.includes('step2-')) phase = 'phase2';
  else if (stepId.includes('step3-')) phase = 'phase3';
  
  // Update progress tracking
  if (isChecked) {
    stepProgress[phase]++;
    checkbox.parentElement.style.opacity = '0.7';
    checkbox.parentElement.style.textDecoration = 'line-through';
  } else {
    stepProgress[phase]--;
    checkbox.parentElement.style.opacity = '1';
    checkbox.parentElement.style.textDecoration = 'none';
  }
  
  // Update visual progress indicators
  updatePhaseProgress();
  
  // Show encouraging feedback
  if (isChecked) {
    showNotification(`Step completed! Progress: ${getTotalCompletedSteps()}/${stepProgress.totalSteps}`, 'success');
  }
}

function updatePhaseProgress() {
  const totalCompleted = getTotalCompletedSteps();
  const progressPercentage = (totalCompleted / stepProgress.totalSteps) * 100;
  
  // Update any progress bars if they exist
  const progressBar = document.querySelector('.progress-fill');
  if (progressBar) {
    progressBar.style.width = progressPercentage + '%';
  }
  
  // Update terminal status
  updateTerminalStatus(totalCompleted);
}

function getTotalCompletedSteps() {
  return stepProgress.phase1 + stepProgress.phase2 + stepProgress.phase3;
}

function updateTerminalStatus(completedSteps) {
  const terminal = document.querySelector('.terminal');
  if (terminal && completedSteps > 0) {
    const statusLine = document.createElement('div');
    statusLine.className = 'terminal-line success';
    statusLine.textContent = `> Steps completed: ${completedSteps}/${stepProgress.totalSteps} (${Math.round((completedSteps/stepProgress.totalSteps)*100)}%)`;
    terminal.appendChild(statusLine);
    
    // Keep only last 10 status updates
    const statusLines = terminal.querySelectorAll('.terminal-line.success');
    if (statusLines.length > 10) {
      statusLines[0].remove();
    }
  }
}

// Quiz System
function initializeQuiz() {
  const options = document.querySelectorAll('.quiz-option');
  
  options.forEach(option => {
    option.addEventListener('click', function() {
      handleQuizAnswer(this);
    });
  });
}

function handleQuizAnswer(selectedOption) {
  // Prevent multiple clicks on same question
  const question = selectedOption.closest('.quiz-question');
  if (question.querySelector('.quiz-option.correct, .quiz-option.incorrect')) {
    return;
  }

  const allOptionsInQuestion = question.querySelectorAll('.quiz-option');
  const isCorrect = selectedOption.getAttribute('data-answer') === 'correct';
  
  // Mark all options in this question
  allOptionsInQuestion.forEach(opt => {
    if (opt.getAttribute('data-answer') === 'correct') {
      opt.classList.add('correct');
      opt.style.borderColor = 'var(--accent-green)';
      opt.style.background = 'rgba(0, 255, 65, 0.1)';
    } else {
      opt.classList.add('incorrect');
      opt.style.borderColor = 'var(--accent-red)';
      opt.style.background = 'rgba(255, 0, 64, 0.1)';
    }
  });

  // Update score
  questionsAnswered++;
  if (isCorrect) {
    quizScore++;
  }

  // Update progress
  updateQuizProgress();
  
  // Provide immediate feedback
  const feedback = isCorrect ? 
    '✅ Correct! Good incident response knowledge.' : 
    '❌ Review the guidelines and try to understand the correct approach.';
  
  showNotification(feedback, isCorrect ? 'success' : 'warning');
}

function updateQuizProgress() {
  const progress = (questionsAnswered / totalQuestions) * 100;
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  if (progressBar) {
    progressBar.style.width = progress + '%';
  }
  
  if (questionsAnswered === totalQuestions) {
    const percentage = Math.round((quizScore / totalQuestions) * 100);
    if (progressText) {
      progressText.textContent = `Quiz Complete! Score: ${quizScore}/${totalQuestions} (${percentage}%)`;
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

function showQuizCompletionMessage(score) {
  let message = '';
  let type = 'info';
  
  if (score >= 75) {
    message = '🎉 Excellent! You understand incident response protocols well.';
    type = 'success';
  } else if (score >= 50) {
    message = '👍 Good work! Review the response procedures for better preparedness.';
    type = 'info';
  } else {
    message = '📚 Keep studying! Practice incident response scenarios regularly.';
    type = 'warning';
  }
  
  showNotification(message, type);
  
  // Store quiz results
  localStorage.setItem('incident_response_quiz_score', score);
  localStorage.setItem('incident_response_quiz_date', new Date().toISOString());
}

// Template System
function initializeTemplateSystem() {
  const templateButtons = document.querySelectorAll('.copy-template');
  
  templateButtons.forEach(button => {
    button.addEventListener('click', function() {
      copyTemplate(this);
    });
  });
}

function copyTemplate(button) {
  const templateCard = button.closest('.template-card');
  const templateContent = templateCard.querySelector('.template-content');
  
  if (templateContent) {
    const text = templateContent.textContent || templateContent.innerText;
    
    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        button.textContent = '✅ Copied!';
        button.style.background = 'var(--accent-green)';
        
        setTimeout(() => {
          button.textContent = '📋 Copy Template';
          button.style.background = '';
        }, 2000);
        
        showNotification('Template copied to clipboard', 'success');
      }).catch(err => {
        console.error('Could not copy text: ', err);
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    showNotification('Template copied to clipboard', 'success');
  } catch (err) {
    console.error('Fallback copy failed: ', err);
    showNotification('Could not copy template. Please copy manually.', 'error');
  }
  
  document.body.removeChild(textArea);
}

// Button Handlers
function initializeButtons() {
  // Print card button
  const printBtn = document.getElementById('print-card');
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      window.print();
    });
  }
  
  // Take quiz button
  const takeQuizBtn = document.getElementById('take-quiz');
  if (takeQuizBtn) {
    takeQuizBtn.addEventListener('click', function() {
      document.querySelector('.quiz-section').scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  // Create plan button
  const createPlanBtn = document.getElementById('create-plan');
  if (createPlanBtn) {
    createPlanBtn.addEventListener('click', function() {
      showPersonalPlanDialog();
    });
  }
  
  // Back to dashboard button
  const backBtn = document.getElementById('back-to-dashboard');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '../dashboard.html';
      }
    });
  }
}

function showPersonalPlanDialog() {
  const dialog = document.createElement('div');
  dialog.id = 'personal-plan-dialog';
  dialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  `;
  
  dialog.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 12px;
      max-width: 500px;
      margin: 20px;
      text-align: center;
    ">
      <h3 style="color: #333; margin-bottom: 20px;">📋 Personal Response Plan</h3>
      <p style="color: #666; margin-bottom: 20px;">
        Create a customized incident response plan tailored to your specific environment and contacts.
      </p>
      <div style="margin: 20px 0;">
        <button id="generate-plan-btn" style="
          background: linear-gradient(135deg, #00ff41, #00d4ff);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          margin: 5px;
        ">Generate My Plan</button>
        <button id="close-plan-dialog" style="
          background: #666;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          margin: 5px;
        ">Close</button>
      </div>
    </div>
  `;
  
  // Add event listeners to the new buttons
  document.body.appendChild(dialog);
  
  document.getElementById('generate-plan-btn').addEventListener('click', function() {
    generatePersonalPlan();
    dialog.remove();
  });
  
  document.getElementById('close-plan-dialog').addEventListener('click', function() {
    dialog.remove();
  });
  
  // Close on backdrop click
  dialog.addEventListener('click', function(e) {
    if (e.target === dialog) {
      dialog.remove();
    }
  });
}

function generatePersonalPlan() {
  const plan = `
PERSONAL INCIDENT RESPONSE PLAN
===============================

Generated: ${new Date().toLocaleDateString()}

EMERGENCY CONTACTS:
------------------
IT Help Desk: [Fill in your IT contact]
Security Team: [Fill in security team contact]
Manager: [Fill in manager contact]
FBI IC3: www.ic3.gov

IMMEDIATE RESPONSE CHECKLIST:
----------------------------
□ Disconnect from network (unplug/disable Wi-Fi)
□ Document what happened (time, what you clicked)
□ Contact IT/Security team immediately
□ Keep computer powered on for analysis
□ Take photos with phone of any error messages
□ Alert manager about potential incident

ASSESSMENT PHASE:
-----------------
□ List all accounts that might be compromised
□ Check recent login activity on all accounts
□ Review browser history for malicious sites
□ Check downloads folder for suspicious files
□ Document all systems that were accessed

RECOVERY ACTIONS:
-----------------
□ Change all passwords after system is clean
□ Enable 2FA on all accounts
□ Run full system security scan
□ Review and update security software
□ Monitor accounts for suspicious activity

PREVENTION MEASURES:
-------------------
□ Install reputable anti-phishing extension
□ Enable advanced email security features
□ Schedule regular security training
□ Keep software and systems updated
□ Create regular backup schedule

Remember: Speed is critical - 62 minutes average containment time!
  `;
  
  // Download as text file
  const blob = new Blob([plan], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'personal_incident_response_plan.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  // Close dialog
  const dialog = document.querySelector('[style*="position: fixed"]');
  if (dialog) {
    dialog.remove();
  }
  
  showNotification('Personal response plan generated and downloaded!', 'success');
}

// Notification System
function showNotification(message, type = 'info') {
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
    max-width: 350px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Set color based on type
  switch(type) {
    case 'success':
      notification.style.background = 'linear-gradient(135deg, #00ff41, #00d4ff)';
      break;
    case 'error':
      notification.style.background = 'linear-gradient(135deg, #ff0040, #ff6600)';
      break;
    case 'warning':
      notification.style.background = 'linear-gradient(135deg, #ffaa00, #ff6600)';
      break;
    case 'info':
    default:
      notification.style.background = 'linear-gradient(135deg, #00d4ff, #0099ff)';
      break;
  }
  
  notification.textContent = message;
  
  // Add slide-in animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 4000);
}

// Utility Functions
function resetQuiz() {
  quizScore = 0;
  questionsAnswered = 0;
  
  const options = document.querySelectorAll('.quiz-option');
  options.forEach(option => {
    option.classList.remove('correct', 'incorrect');
    option.style.borderColor = '';
    option.style.background = '';
  });
  
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  if (progressBar) progressBar.style.width = '0%';
  if (progressText) progressText.textContent = 'Test your incident response knowledge';
}

function resetStepProgress() {
  stepProgress = { phase1: 0, phase2: 0, phase3: 0, totalSteps: 15 };
  
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
    checkbox.parentElement.style.opacity = '1';
    checkbox.parentElement.style.textDecoration = 'none';
  });
  
  updatePhaseProgress();
}

// Export functions for debugging (not needed for CSP compliance)
// All functions are now properly bound to event listeners
console.log('PhishGuard: Incident Response JavaScript module loaded successfully');