// PhishGuard Storage Manager
// Handles all storage operations with proper error handling and data validation

class StorageManager {
  constructor(config) {
    this.config = config;
    this.storageKeys = config.storage;
  }

  // Initialize storage with default values
  async initialize() {
    try {
      const result = await chrome.storage.local.get([this.storageKeys.userStatsKey]);
      
      if (!result[this.storageKeys.userStatsKey]) {
        await this.saveUserStats(this.config.defaultUserStats);
        console.log('PhishGuard: Initialized default user statistics');
      }

      // Initialize training enabled state
      const trainingResult = await chrome.storage.local.get([this.storageKeys.trainingEnabledKey]);
      if (!trainingResult.hasOwnProperty(this.storageKeys.trainingEnabledKey)) {
        await chrome.storage.local.set({ [this.storageKeys.trainingEnabledKey]: true });
      }

      return true;
    } catch (error) {
      console.error('PhishGuard: Storage initialization failed:', error);
      return false;
    }
  }

  // User Statistics Operations
  async getUserStats() {
    try {
      const result = await chrome.storage.local.get([this.storageKeys.userStatsKey]);
      return result[this.storageKeys.userStatsKey] || this.config.defaultUserStats;
    } catch (error) {
      console.error('PhishGuard: Failed to get user stats:', error);
      return this.config.defaultUserStats;
    }
  }

  async saveUserStats(stats) {
    try {
      // Validate stats structure
      const validatedStats = this.validateUserStats(stats);
      await chrome.storage.local.set({ [this.storageKeys.userStatsKey]: validatedStats });
      return true;
    } catch (error) {
      console.error('PhishGuard: Failed to save user stats:', error);
      return false;
    }
  }

  async updateUserStats(updates) {
    try {
      const currentStats = await this.getUserStats();
      const updatedStats = { ...currentStats, ...updates };
      return await this.saveUserStats(updatedStats);
    } catch (error) {
      console.error('PhishGuard: Failed to update user stats:', error);
      return false;
    }
  }

  // Training History Operations
  async addTrainingHistoryEntry(entry) {
    try {
      const stats = await this.getUserStats();
      const historyEntry = {
        date: new Date().toISOString(),
        simulationType: entry.simulationType,
        fell: entry.fell,
        confidence: entry.confidence || null,
        ...entry
      };
      
      stats.trainingHistory.push(historyEntry);
      
      // Keep only last 100 entries to prevent storage bloat
      if (stats.trainingHistory.length > 100) {
        stats.trainingHistory = stats.trainingHistory.slice(-100);
      }
      
      return await this.saveUserStats(stats);
    } catch (error) {
      console.error('PhishGuard: Failed to add training history entry:', error);
      return false;
    }
  }

  // Vulnerability Areas Operations
  async updateVulnerabilityArea(area, increment = 1) {
    try {
      const stats = await this.getUserStats();
      if (stats.vulnerabilityAreas.hasOwnProperty(area)) {
        stats.vulnerabilityAreas[area] += increment;
        return await this.saveUserStats(stats);
      }
      return false;
    } catch (error) {
      console.error('PhishGuard: Failed to update vulnerability area:', error);
      return false;
    }
  }

  // Phishing Domains Operations
  async getPhishingDomains() {
    try {
      const result = await chrome.storage.local.get([this.storageKeys.phishingDomainsKey]);
      return result[this.storageKeys.phishingDomainsKey] || [];
    } catch (error) {
      console.error('PhishGuard: Failed to get phishing domains:', error);
      return [];
    }
  }

  async savePhishingDomains(domains) {
    try {
      const validatedDomains = Array.isArray(domains) ? domains : [];
      await chrome.storage.local.set({ [this.storageKeys.phishingDomainsKey]: validatedDomains });
      return true;
    } catch (error) {
      console.error('PhishGuard: Failed to save phishing domains:', error);
      return false;
    }
  }

  // Training Settings Operations
  async isTrainingEnabled() {
    try {
      const result = await chrome.storage.local.get([this.storageKeys.trainingEnabledKey]);
      return result[this.storageKeys.trainingEnabledKey] !== false; // Default to true
    } catch (error) {
      console.error('PhishGuard: Failed to check training enabled state:', error);
      return true; // Default to enabled on error
    }
  }

  async setTrainingEnabled(enabled) {
    try {
      await chrome.storage.local.set({ [this.storageKeys.trainingEnabledKey]: Boolean(enabled) });
      return true;
    } catch (error) {
      console.error('PhishGuard: Failed to set training enabled state:', error);
      return false;
    }
  }

  // Learning Progress Operations
  async getLearningProgress() {
    try {
      const result = await chrome.storage.local.get([this.storageKeys.learningProgressKey]);
      return result[this.storageKeys.learningProgressKey] || {};
    } catch (error) {
      console.error('PhishGuard: Failed to get learning progress:', error);
      return {};
    }
  }

  async saveLearningProgress(topic, progressData) {
    try {
      const allProgress = await this.getLearningProgress();
      allProgress[topic] = {
        ...progressData,
        lastUpdated: new Date().toISOString()
      };
      await chrome.storage.local.set({ [this.storageKeys.learningProgressKey]: allProgress });
      return true;
    } catch (error) {
      console.error('PhishGuard: Failed to save learning progress:', error);
      return false;
    }
  }

  // Daily Reset Operations (for simulation limits)
  async checkAndResetDailyCounters() {
    try {
      const stats = await this.getUserStats();
      const today = new Date().toDateString();
      const lastReset = stats.lastResetDate;

      if (lastReset !== today) {
        stats.dailySimulationCount = 0;
        stats.lastResetDate = today;
        await this.saveUserStats(stats);
        return true;
      }
      return false;
    } catch (error) {
      console.error('PhishGuard: Failed to check daily counters:', error);
      return false;
    }
  }

  // Data Cleanup Operations
  async cleanupOldData() {
    try {
      const stats = await this.getUserStats();
      let modified = false;

      // Remove training history older than 1 year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const originalLength = stats.trainingHistory.length;
      stats.trainingHistory = stats.trainingHistory.filter(entry => 
        new Date(entry.date) > oneYearAgo
      );
      
      if (stats.trainingHistory.length !== originalLength) {
        modified = true;
        console.log(`PhishGuard: Cleaned up ${originalLength - stats.trainingHistory.length} old training history entries`);
      }

      if (modified) {
        await this.saveUserStats(stats);
      }

      return true;
    } catch (error) {
      console.error('PhishGuard: Failed to cleanup old data:', error);
      return false;
    }
  }

  // Data Export/Import Operations
  async exportAllData() {
    try {
      const result = await chrome.storage.local.get(null);
      return {
        exportDate: new Date().toISOString(),
        version: chrome.runtime.getManifest().version,
        data: result
      };
    } catch (error) {
      console.error('PhishGuard: Failed to export data:', error);
      return null;
    }
  }

  async importData(importData) {
    try {
      if (!importData.data || typeof importData.data !== 'object') {
        throw new Error('Invalid import data format');
      }

      // Validate critical data structures before importing
      if (importData.data[this.storageKeys.userStatsKey]) {
        this.validateUserStats(importData.data[this.storageKeys.userStatsKey]);
      }

      await chrome.storage.local.clear();
      await chrome.storage.local.set(importData.data);
      
      console.log('PhishGuard: Data import completed successfully');
      return true;
    } catch (error) {
      console.error('PhishGuard: Failed to import data:', error);
      return false;
    }
  }

  // Data Validation Helpers
  validateUserStats(stats) {
    const defaultStats = this.config.defaultUserStats;
    const validated = { ...defaultStats };

    // Validate numeric fields
    const numericFields = ['simulationsShown', 'simulationsFallen', 'phishingSitesBlocked', 'dailySimulationCount'];
    numericFields.forEach(field => {
      if (typeof stats[field] === 'number' && stats[field] >= 0) {
        validated[field] = stats[field];
      }
    });

    // Validate string/date fields
    if (typeof stats.lastTrainingDate === 'string' || stats.lastTrainingDate === null) {
      validated.lastTrainingDate = stats.lastTrainingDate;
    }
    if (typeof stats.lastResetDate === 'string' || stats.lastResetDate === null) {
      validated.lastResetDate = stats.lastResetDate;
    }

    // Validate vulnerability areas
    if (stats.vulnerabilityAreas && typeof stats.vulnerabilityAreas === 'object') {
      Object.keys(defaultStats.vulnerabilityAreas).forEach(area => {
        if (typeof stats.vulnerabilityAreas[area] === 'number' && stats.vulnerabilityAreas[area] >= 0) {
          validated.vulnerabilityAreas[area] = stats.vulnerabilityAreas[area];
        }
      });
    }

    // Validate training history
    if (Array.isArray(stats.trainingHistory)) {
      validated.trainingHistory = stats.trainingHistory.filter(entry =>
        entry && 
        typeof entry === 'object' &&
        typeof entry.date === 'string' &&
        typeof entry.simulationType === 'string' &&
        typeof entry.fell === 'boolean'
      );
    }

    return validated;
  }

  // Get storage usage statistics
  async getStorageInfo() {
    try {
      const usage = await chrome.storage.local.getBytesInUse();
      const allData = await chrome.storage.local.get(null);
      
      return {
        totalBytes: usage,
        totalItems: Object.keys(allData).length,
        breakdown: {
          userStats: await chrome.storage.local.getBytesInUse([this.storageKeys.userStatsKey]),
          phishingDomains: await chrome.storage.local.getBytesInUse([this.storageKeys.phishingDomainsKey]),
          learningProgress: await chrome.storage.local.getBytesInUse([this.storageKeys.learningProgressKey])
        }
      };
    } catch (error) {
      console.error('PhishGuard: Failed to get storage info:', error);
      return null;
    }
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
} else if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}

export default StorageManager;