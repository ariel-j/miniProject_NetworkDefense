    // Scroll to top function
    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // Add animation effects when page loads
    document.addEventListener('DOMContentLoaded', () => {
      // Animate attack cards
      const attackCards = document.querySelectorAll('.attack-card');
      attackCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'fadeInUp 0.6s ease-out forwards';
      });

      // Animate defense cards
      const defenseCards = document.querySelectorAll('.defense-card');
      defenseCards.forEach((card, index) => {
        card.style.animationDelay = `${(index * 0.1) + 0.3}s`;
        card.style.animation = 'fadeInUp 0.6s ease-out forwards';
      });

      // Animate stats
      const statItems = document.querySelectorAll('.stat-item');
      statItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.15}s`;
        item.style.animation = 'fadeInScale 0.8s ease-out forwards';
      });

      console.log('PhishGuard: Complete Phishing Guide loaded');
    });

    // Add some interactive hover effects
    document.addEventListener('DOMContentLoaded', () => {
      const attackCards = document.querySelectorAll('.attack-card');
      attackCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0) scale(1)';
        });
      });
    });

    // CSS for animations
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
      
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .attack-card, .defense-card {
        opacity: 0;
      }
      
      .stat-item {
        opacity: 0;
      }
    `;
    document.head.appendChild(style);