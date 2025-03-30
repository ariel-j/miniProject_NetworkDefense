/**
 * PhishGuard - Storage utilities
 * Handles interactions with Chrome storage API
 */

// Maximum number of detections to keep in history
const MAX_DETECTION_HISTORY = 100;

/**
 * Save a phishing detection to history
 * @param {Object} detection - The phishing detection data
 * @returns {Promise<void>}
 */
export async function saveDetection(detection) {
  try {
    // Ensure timestamp is included
    if (!detection.timestamp) {
      detection.timestamp = Date.now();
    }
    
    // Get existing history
    const data = await chrome.storage.local.get('detectionHistory');
    let history = data.detectionHistory || [];
    
    // Add new detection
    history.unshift(detection);
    
    // Limit history size
    if (history.length > MAX_DETECTION_HISTORY) {
      history = history.slice(0, MAX_DETECTION_HISTORY);
    }
    
    // Save updated history
    await chrome.storage.local.set({ 
      detectionHistory: history,
      lastCheckTime: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error saving detection:', error);
    throw error;
  }
}

/**
 * Get phishing detection history
 * @param {number} limit - Maximum number of items to return
 * @returns {Promise<Array>} - Detection history
 */
export async function getDetectionHistory(limit = MAX_DETECTION_HISTORY) {
  try {
    const data = await chrome.storage.local.get('detectionHistory');
    const history = data.detectionHistory || [];
    
    return limit ? history.slice(0, limit) : history;
  } catch (error) {
    console.error('Error getting detection history:', error);
    throw error;
  }
}

/**
 * Clear detection history
 * @returns {Promise<void>}
 */
export async function clearDetectionHistory() {
  try {
    await chrome.storage.local.set({ detectionHistory: [] });
    return true;
  } catch (error) {
    console.error('Error clearing detection history:', error);
    throw error;
  }
}

/**
 * Save user preferences
 * @param {Object} preferences - User preferences
 * @returns {Promise<void>}
 */
export async function savePreferences(preferences) {
  try {
    await chrome.storage.local.set({ preferences });
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
}

/**
 * Get user preferences
 * @returns {Promise<Object>} - User preferences
 */
export async function getPreferences() {
  try {
    const data = await chrome.storage.local.get('preferences');
    return data.preferences || {};
  } catch (error) {
    console.error('Error getting preferences:', error);
    throw error;
  }
}

/**
 * Save user training progress
 * @param {Object} progress - Training progress data
 * @returns {Promise<void>}
 */
export async function saveTrainingProgress(progress) {
  try {
    // Get existing progress
    const data = await chrome.storage.local.get('trainingProgress');
    const existingProgress = data.trainingProgress || {
      totalSimulations: 0,
      successfulSimulations: 0,
      failedSimulations: 0,
      simulationsByType: {},
      simulationHistory: [],
      skills: {
        urlAnalysis: 0,
        socialEngineering: 0,
        securityAwareness: 0,
        passwordSecurity: 0,
        overallScore: 0
      }
    };
    
    // Merge with new progress
    const updatedProgress = {
      ...existingProgress,
      ...progress,
      // Special handling for nested objects
      skills: {
        ...existingProgress.skills,
        ...(progress.skills || {})
      },
      simulationsByType: {
        ...existingProgress.simulationsByType,
        ...(progress.simulationsByType || {})
      }
    };
    
    // Special handling for simulation history
    if (progress.simulationHistory) {
      updatedProgress.simulationHistory = [
        ...progress.simulationHistory,
        ...existingProgress.simulationHistory
      ].slice(0, 50); // Keep last 50 simulations
    }
    
    // Save updated progress
    await chrome.storage.local.set({ trainingProgress: updatedProgress });
    return true;
  } catch (error) {
    console.error('Error saving training progress:', error);
    throw error;
  }
}

/**
 * Get user training progress
 * @returns {Promise<Object>} - Training progress
 */
export async function getTrainingProgress() {
  try {
    const data = await chrome.storage.local.get('trainingProgress');
    return data.trainingProgress || {
      totalSimulations: 0,
      successfulSimulations: 0,
      failedSimulations: 0,
      simulationsByType: {},
      simulationHistory: [],
      skills: {
        urlAnalysis: 0,
        socialEngineering: 0,
        securityAwareness: 0,
        passwordSecurity: 0,
        overallScore: 0
      }
    };
  } catch (error) {
    console.error('Error getting training progress:', error);
    throw error;
  }
}

/**
 * Reset all storage
 * @returns {Promise<void>}
 */
export async function resetAllStorage() {
  try {
    await chrome.storage.local.clear();
    return true;
  } catch (error) {
    console.error('Error resetting storage:', error);
    throw error;
  }
}
