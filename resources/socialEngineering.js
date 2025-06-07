    // Psychology test functionality
    let psychologyScore = 0;
    let questionsAnswered = 0;
    const totalQuestions = 2;

    // Initialize test
    function initializePsychologyTest() {
      const options = document.querySelectorAll('.response-option');
      
      options.forEach(option => {
        option.addEventListener('click', function() {
          const scenario = this.getAttribute('data-scenario');
          const allOptionsInScenario = document.querySelectorAll(`[data-scenario="${scenario}"]`);
          
          // Prevent multiple clicks on same scenario
          if (allOptionsInScenario[0].classList.contains('correct') || allOptionsInScenario[0].classList.contains('incorrect')) {
            return;
          }

          const isCorrect = this.getAttribute('data-answer') === 'correct';
          
          // Mark all options in this scenario
          allOptionsInScenario.forEach(opt => {
            if (opt.getAttribute('data-answer') === 'correct') {
              opt.classList.add('correct');
            } else {
              opt.classList.add('incorrect');
            }
          });

          // Update score
          questionsAnswered++;
          if (isCorrect) {
            psychologyScore++;
          }

          // Update progress
          updatePsychologyProgress();
        });
      });
    }

    // Update progress bar
    function updatePsychologyProgress() {
      const progress = (questionsAnswered / totalQuestions) * 100;
      const progressBar = document.getElementById('psychology-progress');
      const progressText = document.getElementById('psychology-progress-text');
      const scoreDisplay = document.getElementById('psychology-score');
      const scoreNumber = document.getElementById('score-number');
      
      progressBar.style.width = progress + '%';
      
      if (questionsAnswered === totalQuestions) {
        const percentage = Math.round((psychologyScore / totalQuestions) * 100);
        progressText.textContent = `Psychology Test Complete! Score: ${psychologyScore}/${totalQuestions} (${percentage}%)`;
        
        // Show score display
        scoreDisplay.style.display = 'block';
        scoreNumber.textContent = `${psychologyScore}/${totalQuestions}`;
        
        // Show completion message
        setTimeout(() => {
          showCompletionMessage(percentage);
        }, 1000);
      } else {
        progressText.textContent = `Progress: ${questionsAnswered}/${totalQuestions} scenarios analyzed`;
      }
    }

    // Show completion message
    function showCompletionMessage(score) {
      let message = '';
      let color = '';
      
      if (score >= 80) {
        message = 'Excellent! You can identify psychological manipulation tactics effectively.';
        color = 'var(--accent-green)';
      } else if (score >= 60) {
        message = 'Good work! Review the tactics and practice identifying combinations.';
        color = 'var(--accent-blue)';
      } else {
        message = 'Keep practicing! Understanding psychology is key to defense.';
        color = 'var(--accent-yellow)';
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

    // Retake test function
    function retakeTest() {
      // Reset variables
      psychologyScore = 0;
      questionsAnswered = 0;
      
      // Reset UI
      document.getElementById('psychology-progress').style.width = '0%';
      document.getElementById('psychology-progress-text').textContent = 'Complete the scenarios to advance';
      document.getElementById('psychology-score').style.display = 'none';
      
      // Reset all buttons
      const options = document.querySelectorAll('.response-option');
      options.forEach(option => {
        option.classList.remove('correct', 'incorrect');
      });
      
      // Scroll to test section
      document.querySelector('.test-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }

    // Initialize page
    document.addEventListener('DOMContentLoaded', () => {
      initializePsychologyTest();
      console.log('PhishGuard: Social Engineering Tactics module loaded');
    });

    // Add some dynamic effects
    document.addEventListener('DOMContentLoaded', () => {
      // Add hover effects to tactic cards
      const tacticCards = document.querySelectorAll('.tactic-card');
      tacticCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'fadeInUp 0.6s ease-out forwards';
      });
    });

    // CSS for fade in animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .tactic-card {
        opacity: 0;
      }
    `;
    document.head.appendChild(style);