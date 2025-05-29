// PhishGuard Training Manager
// Handles training simulation generation, scheduling, and user progress tracking

class TrainingManager {
  constructor(config, storageManager) {
    this.config = config;
    this.storage = storageManager;
    this.simulationTypes = config.simulationTypes;
    this.trainingSettings = config.training;
  }

  // Initialize the training manager
  async initialize() {
    try {
      await this.storage.checkAndResetDailyCounters();
      console.log('PhishGuard: Training manager initialized');
      return true;
    } catch (error) {
      console.error('PhishGuard: Failed to initialize training manager:', error);
      return false;
    }
  }

  // Check if we should show a training simulation
  async shouldShowTraining(tabId) {
    try {
      // Check if training is enabled
      const trainingEnabled = await this.storage.isTrainingEnabled();
      if (!trainingEnabled) {
        return { shouldShow: false, reason: 'Training disabled' };
      }

      // Get user stats to check timing and limits
      const stats = await this.storage.getUserStats();
      
      // Check daily simulation limit
      if (stats.dailySimulationCount >= this.trainingSettings.maxSimulationsPerDay) {
        return { shouldShow: false, reason: 'Daily limit reached' };
      }

      // Check minimum gap between simulations
      if (stats.lastTrainingDate) {
        const daysSinceLastTraining = this.calculateDaysSince(stats.lastTrainingDate);
        if (daysSinceLastTraining < this.trainingSettings.minimumGap) {
          return { shouldShow: false, reason: 'Too soon since last training' };
        }
      }

      // Check probability threshold
      const randomChance = Math.random();
      if (randomChance > this.trainingSettings.simulationProbability) {
        return { shouldShow: false, reason: 'Random probability not met' };
      }

      return { shouldShow: true, reason: 'All conditions met' };
    } catch (error) {
      console.error('PhishGuard: Error checking training eligibility:', error);
      return { shouldShow: false, reason: 'Error in eligibility check' };
    }
  }

  // Generate a training simulation based on user's vulnerability profile
  async generateTrainingSimulation(tabId) {
    try {
      const stats = await this.storage.getUserStats();
      const simulationType = this.selectSimulationType(stats.vulnerabilityAreas);
      const simulation = this.createSimulation(simulationType);

      // Update statistics
      await this.updateTrainingStats();

      if (this.config.debug.enabled) {
        console.log('PhishGuard: Generated training simulation:', simulation);
      }

      return simulation;
    } catch (error) {
      console.error('PhishGuard: Error generating training simulation:', error);
      return null;
    }
  }

  // Select simulation type based on user vulnerabilities and weights
  selectSimulationType(vulnerabilityAreas) {
    // Calculate vulnerability scores (higher score = more vulnerable)
    const vulnerabilityScores = Object.entries(vulnerabilityAreas);
    vulnerabilityScores.sort((a, b) => b[1] - a[1]); // Sort by vulnerability (highest first)

    // If user has significant vulnerabilities, focus on those
    if (vulnerabilityScores[0][1] > 3) {
      // 70% chance to target the highest vulnerability
      if (Math.random() < 0.7) {
        return vulnerabilityScores[0][0];
      }
      // 20% chance to target second highest
      if (vulnerabilityScores.length > 1 && Math.random() < 0.9) {
        return vulnerabilityScores[1][0];
      }
    }

    // Otherwise, use weighted random selection
    return this.weightedRandomSelection();
  }

  // Weighted random selection based on simulation type weights
  weightedRandomSelection() {
    const types = Object.keys(this.simulationTypes);
    const weights = types.map(type => this.simulationTypes[type].weight);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < types.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return types[i];
      }
    }
    
    // Fallback to first type
    return types[0];
  }

  // Create simulation object with specific type configuration
  createSimulation(simulationType) {
    const typeConfig = this.simulationTypes[simulationType];
    
    return {
      id: this.generateSimulationId(),
      type: simulationType,
      title: typeConfig.title,
      description: typeConfig.description,
      template: `${simulationType}.html`,
      timestamp: new Date().toISOString(),
      parameters: this.getSimulationParameters(simulationType)
    };
  }

  // Get specific parameters for each simulation type
  getSimulationParameters(simulationType) {
    const baseParams = {
      urgencyTactics: {
        urgencyLevel: Math.random() > 0.5 ? 'high' : 'medium',
        timeLimit: Math.random() > 0.7 ? '24 hours' : '48 hours',
        actionRequired: ['verify account', 'update information', 'confirm identity'][Math.floor(Math.random() * 3)]
      },
      
      loginFormSpoofing: {
        targetService: ['Google', 'Microsoft', 'Apple', 'Facebook'][Math.floor(Math.random() * 4)],
        formType: Math.random() > 0.5 ? 'popup' : 'fullpage',
        hasSSLIndicator: Math.random() > 0.3 // Most have fake SSL indicators
      },
      
      misspelledDomains: {
        targetBrand: ['Amazon', 'PayPal', 'eBay', 'Netflix'][Math.floor(Math.random() * 4)],
        offerType: ['gift card', 'discount', 'free trial', 'cashback'][Math.floor(Math.random() * 4)],
        urgencyTimer: Math.random() > 0.6
      },
      
      securityFalseClaims: {
        alertType: ['virus detection', 'account breach', 'suspicious activity'][Math.floor(Math.random() * 3)],
        actionRequired: ['scan system', 'verify identity', 'update security'][Math.floor(Math.random() * 3)],
        authorityLevel: Math.random() > 0.5 ? 'high' : 'medium'
      },
      
      financialBait: {
        rewardType: ['lottery', 'survey reward', 'cashback', 'inheritance'][Math.floor(Math.random() * 4)],
        amount: [100, 500, 1000, 5000][Math.floor(Math.random() * 4)],
        claimMethod: ['form', 'email', 'phone'][Math.floor(Math.random() * 3)]
      }
    };

    return baseParams[simulationType] || {};
  }

  // Process training simulation result
  async processTrainingResult(result) {
    try {
      const { simulationType, fell, tabId, responseTime, userActions } = result;

      // Update vulnerability areas
      if (fell) {
        await this.storage.updateVulnerabilityArea(simulationType, 1);
      }

      // Add to training history
      await this.storage.addTrainingHistoryEntry({
        simulationType,
        fell,
        responseTime,
        userActions: userActions || [],
        tabId
      });

      // Update overall statistics
      const stats = await this.storage.getUserStats();
      const updates = {
        simulationsFallen: fell ? stats.simulationsFallen + 1 : stats.simulationsFallen
      };

      await this.storage.updateUserStats(updates);

      // Generate learning recommendations
      const recommendations = await this.generateLearningRecommendations(simulationType, fell);

      if (this.config.debug.enabled) {
        console.log('PhishGuard: Processed training result:', { result, recommendations });
      }

      return {
        success: true,
        recommendations,
        nextSteps: this.getNextTrainingSteps(simulationType, fell)
      };
    } catch (error) {
      console.error('PhishGuard: Error processing training result:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate personalized learning recommendations
  async generateLearningRecommendations(simulationType, fell) {
    const recommendations = [];

    if (fell) {
      // User fell for the simulation
      switch (simulationType) {
        case 'urgencyTactics':
          recommendations.push({
            type: 'learning',
            priority: 'high',
            title: 'Learn about Urgency Tactics',
            description: 'Take time to understand how urgency is used to pressure decisions',
            action: 'open_learning_module',
            module: 'urgencyTactics'
          });
          break;

        case 'loginFormSpoofing':
          recommendations.push({
            type: 'learning',
            priority: 'high',
            title: 'Practice Identifying Fake Login Forms',
            description: 'Learn to spot the signs of spoofed login pages',
            action: 'open_learning_module',
            module: 'loginFormSpoofing'
          });
          break;

        case 'misspelledDomains':
          recommendations.push({
            type: 'tip',
            priority: 'medium',
            title: 'Always Check URLs Carefully',
            description: 'Look for misspellings and suspicious domains before clicking',
            action: 'show_tip'
          });
          break;

        case 'securityFalseClaims':
          recommendations.push({
            type: 'learning',
            priority: 'high',
            title: 'Verify Security Claims',
            description: 'Learn how to properly verify security alerts and warnings',
            action: 'open_learning_module',
            module: 'securityFalseClaims'
          });
          break;

        case 'financialBait':
          recommendations.push({
            type: 'principle',
            priority: 'medium',
            title: 'Remember: If it seems too good to be true...',
            description: 'Legitimate rewards rarely require personal information upfront',
            action: 'show_principle'
          });
          break;
      }
    } else {
      // User successfully avoided the phishing attempt
      recommendations.push({
        type: 'congratulations',
        priority: 'low',
        title: 'Well Done!',
        description: `You successfully identified and avoided a ${simulationType} simulation`,
        action: 'positive_reinforcement'
      });
    }

    return recommendations;
  }

  // Get next training steps based on performance
  getNextTrainingSteps(simulationType, fell) {
    if (fell) {
      return {
        immediate: `Review the ${simulationType} learning module`,
        shortTerm: 'Practice with similar scenarios in the learning center',
        longTerm: 'Continue regular training to build recognition skills'
      };
    } else {
      return {
        immediate: 'No immediate action needed - great job!',
        shortTerm: 'Continue with diverse training scenarios',
        longTerm: 'Help others learn by sharing your knowledge'
      };
    }
  }

  // Manual simulation trigger for practice
  async triggerManualSimulation(tabId, specificType = null) {
    try {
      const simulationType = specificType || this.weightedRandomSelection();
      const simulation = this.createSimulation(simulationType);
      
      // Don't count manual simulations against daily limits
      simulation.isManual = true;
      
      return simulation;
    } catch (error) {
      console.error('PhishGuard: Error triggering manual simulation:', error);
      return null;
    }
  }

  // Get training statistics and progress
  async getTrainingProgress() {
    try {
      const stats = await this.storage.getUserStats();
      const learningProgress = await this.storage.getLearningProgress();

      const totalSimulations = stats.simulationsShown;
      const passedSimulations = totalSimulations - stats.simulationsFallen;
      const successRate = totalSimulations > 0 ? (passedSimulations / totalSimulations) * 100 : 0;

      // Calculate improvement over time
      const recentHistory = stats.trainingHistory.slice(-10); // Last 10 simulations
      const recentSuccessRate = recentHistory.length > 0 
        ? (recentHistory.filter(h => !h.fell).length / recentHistory.length) * 100 
        : 0;

      return {
        overall: {
          totalSimulations,
          passedSimulations,
          successRate: Math.round(successRate),
          recentSuccessRate: Math.round(recentSuccessRate),
          improvement: Math.round(recentSuccessRate - successRate)
        },
        vulnerabilities: this.analyzeVulnerabilities(stats.vulnerabilityAreas),
        learningModules: this.analyzeLearningProgress(learningProgress),
        recommendations: await this.getPersonalizedRecommendations(stats)
      };
    } catch (error) {
      console.error('PhishGuard: Error getting training progress:', error);
      return null;
    }
  }

  // Analyze user vulnerabilities
  analyzeVulnerabilities(vulnerabilityAreas) {
    const total = Object.values(vulnerabilityAreas).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(vulnerabilityAreas).map(([area, count]) => ({
      area,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      risk: count > 5 ? 'high' : count > 2 ? 'medium' : 'low'
    })).sort((a, b) => b.count - a.count);
  }

  // Analyze learning module progress
  analyzeLearningProgress(learningProgress) {
    return Object.entries(learningProgress).map(([module, progress]) => ({
      module,
      completed: progress.completed || false,
      score: progress.score || 0,
      lastAccessed: progress.lastUpdated || progress.timestamp,
      needsReview: progress.score < 80
    }));
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(stats) {
    const recommendations = [];

    // Check for high vulnerability areas
    const vulnerabilities = Object.entries(stats.vulnerabilityAreas);
    const highestVulnerability = vulnerabilities.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );

    if (highestVulnerability[1] > 3) {
      recommendations.push({
        type: 'focus_area',
        priority: 'high',
        area: highestVulnerability[0],
        message: `Focus on improving your ${highestVulnerability[0]} recognition skills`
      });
    }

    // Check for low overall success rate
    const successRate = stats.simulationsShown > 0 
      ? ((stats.simulationsShown - stats.simulationsFallen) / stats.simulationsShown) * 100 
      : 100;

    if (successRate < 60) {
      recommendations.push({
        type: 'general_improvement',
        priority: 'high',
        message: 'Consider reviewing fundamental phishing recognition principles'
      });
    }

    return recommendations;
  }

  // Helper methods
  calculateDaysSince(dateString) {
    const then = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - then);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  generateSimulationId() {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async updateTrainingStats() {
    const stats = await this.storage.getUserStats();
    const updates = {
      simulationsShown: stats.simulationsShown + 1,
      lastTrainingDate: new Date().toISOString(),
      dailySimulationCount: stats.dailySimulationCount + 1
    };
    await this.storage.updateUserStats(updates);
  }

  // Schedule regular training checks
  setupTrainingSchedule() {
    // This would set up periodic checks for training opportunities
    chrome.alarms.create(this.config.alarms.checkTrainingOpportunity, { 
      periodInMinutes: 60 
    });
  }

  // Clean up old training data
  async cleanupTrainingData() {
    try {
      await this.storage.cleanupOldData();
      console.log('PhishGuard: Training data cleanup completed');
    } catch (error) {
      console.error('PhishGuard: Error cleaning up training data:', error);
    }
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrainingManager;
} else if (typeof window !== 'undefined') {
  window.TrainingManager = TrainingManager;
}

export default TrainingManager;