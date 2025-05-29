// PhishGuard Configuration
// Central configuration for all extension settings

const CONFIG = {
  // Training settings
  training: {
    frequency: 7, // Days between training simulations
    minimumGap: 2, // Minimum days between training simulations
    simulationProbability: 0.3, // Chance of simulation when eligible (0.0 - 1.0)
    maxSimulationsPerDay: 3, // Maximum simulations to show per day
  },

  // Phishing detection settings
  phishing: {
    databaseUpdateInterval: 24, // Hours between phishing database updates
    confidenceThreshold: 0.7, // Minimum confidence to show warning
    typosquattingDistance: 3, // Maximum Levenshtein distance for typosquatting detection
  },

  // Storage settings
  storage: {
    userStatsKey: 'userStats',
    phishingDomainsKey: 'phishingDomains',
    trainingEnabledKey: 'trainingEnabled',
    learningProgressKey: 'learningProgress',
  },

  // Alarm names for chrome.alarms
  alarms: {
    updatePhishingDatabase: 'updatePhishingDatabase',
    checkTrainingOpportunity: 'checkForTrainingOpportunity',
    cleanupOldData: 'cleanupOldData',
  },

  // Known popular domains for typosquatting detection
  popularDomains: [
    'google.com',
    'facebook.com', 
    'amazon.com',
    'apple.com',
    'microsoft.com',
    'paypal.com',
    'netflix.com',
    'instagram.com',
    'twitter.com',
    'linkedin.com',
    'github.com',
    'stackoverflow.com'
  ],

  // Simulation types and their weights (for random selection)
  simulationTypes: {
    urgencyTactics: {
      weight: 25,
      title: 'Account Security Alert',
      description: 'Simulation of an urgent security alert requiring immediate action'
    },
    loginFormSpoofing: {
      weight: 20,
      title: 'Sign in to continue',
      description: 'Simulation of a spoofed login form'
    },
    misspelledDomains: {
      weight: 20,
      title: 'Special Offer',
      description: 'Simulation of a misspelled domain offering a special deal'
    },
    securityFalseClaims: {
      weight: 20,
      title: 'Security Verification',
      description: 'Simulation claiming security issues that need verification'
    },
    financialBait: {
      weight: 15,
      title: 'You\'ve Won!',
      description: 'Simulation of a financial reward or prize notification'
    }
  },

  // Default user statistics structure
  defaultUserStats: {
    simulationsShown: 0,
    simulationsFallen: 0,
    phishingSitesBlocked: 0,
    lastTrainingDate: null,
    dailySimulationCount: 0,
    lastResetDate: null,
    vulnerabilityAreas: {
      urgencyTactics: 0,
      loginFormSpoofing: 0,
      misspelledDomains: 0,
      securityFalseClaims: 0,
      financialBait: 0
    },
    trainingHistory: []
  },

  // URLs and patterns for phishing detection
  phishingPatterns: {
    suspiciousUrlPatterns: [
      /secure.*login/i,
      /verify.*account/i,
      /update.*payment/i,
      /confirm.*identity/i,
      /urgent.*action/i
    ],
    
    urgencyKeywords: [
      'urgent', 'immediately', 'alert', 'warning', 'limited time',
      'account suspended', 'unauthorized', 'suspicious activity',
      'expire', 'deadline', 'final notice', 'act now'
    ],

    securityKeywords: [
      'verify your account', 'confirm your identity', 'security check',
      'secure your account', 'update your information', 'validation required',
      'unusual activity', 'login attempt', 'security alert'
    ],

    financialKeywords: [
      'you won', 'congratulations', 'claim your prize', 'free offer',
      'lottery', 'winner', 'reward', 'gift card', 'discount',
      'refund', 'tax return', 'inheritance', 'million dollars'
    ]
  },

  // UI Configuration
  ui: {
    warningDisplayTime: 5000, // Time to show warnings (ms)
    simulationDisplayTime: 30000, // Max time to show simulations (ms)
    feedbackDisplayTime: 8000, // Time to show feedback (ms)
  },

  // Debug settings
  debug: {
    enabled: false, // Set to true for debug logging
    verboseLogging: false,
    simulatePhishingSites: [], // URLs to treat as phishing for testing
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
  window.PHISHGUARD_CONFIG = CONFIG;
}

export default CONFIG;  