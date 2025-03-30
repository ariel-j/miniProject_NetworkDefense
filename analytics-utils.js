/**
 * PhishGuard - Analytics Utilities
 * Tracks user actions and performance for the dashboard
 */

// Store analytics events in local storage
const ANALYTICS_STORAGE_KEY = 'analyticsEvents';
const MAX_STORED_EVENTS = 1000;

/**
 * Track an analytics event
 * @param {string} eventName - Name of the event
 * @param {Object} eventData - Additional data for the event
 * @returns {Promise<void>}
 */
export async function trackAnalyticsEvent(eventName, eventData = {}) {
  try {
    // Create event object
    const event = {
      eventName,
      eventData,
      timestamp: Date.now()
    };
    
    // Get existing events
    const data = await chrome.storage.local.get(ANALYTICS_STORAGE_KEY);
    let events = data[ANALYTICS_STORAGE_KEY] || [];
    
    // Add new event
    events.unshift(event);
    
    // Limit size
    if (events.length > MAX_STORED_EVENTS) {
      events = events.slice(0, MAX_STORED_EVENTS);
    }
    
    // Save updated events
    await chrome.storage.local.set({ [ANALYTICS_STORAGE_KEY]: events });
    
    // Update aggregated metrics
    await updateAggregatedMetrics(event);
    
    return true;
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return false;
  }
}

/**
 * Get analytics events
 * @param {number} limit - Maximum number of events to return
 * @returns {Promise<Array>}
 */
export async function getAnalyticsEvents(limit = 100) {
  try {
    const data = await chrome.storage.local.get(ANALYTICS_STORAGE_KEY);
    const events = data[ANALYTICS_STORAGE_KEY] || [];
    
    return events.slice(0, limit);
  } catch (error) {
    console.error('Error getting analytics events:', error);
    return [];
  }
}

/**
 * Update aggregated metrics based on the event
 * @param {Object} event - The event that occurred
 * @returns {Promise<void>}
 */
async function updateAggregatedMetrics(event) {
  try {
    // Get current metrics
    const data = await chrome.storage.local.get('analyticsMetrics');
    let metrics = data.analyticsMetrics || {
      phishingDetected: 0,
      simulationsStarted: 0,
      simulationsPassed: 0,
      simulationsFailed: 0,
      urlChecks: 0,
      lastActiveDate: null,
      activeDays: 0,
      simulationTypeBreakdown: {
        fake_login: 0,
        lookalike_domain: 0,
        suspicious_attachment: 0,
        urgent_action: 0,
        data_entry: 0
      }
    };
    
    // Check if this is a new active day
    const today = new Date().toDateString();
    if (metrics.lastActiveDate !== today) {
      metrics.lastActiveDate = today;
      metrics.activeDays++;
    }
    
    // Update metrics based on event type
    switch (event.eventName) {
      case 'phishing_detected':
        metrics.phishingDetected++;
        break;
        
      case 'training_simulation_started':
        metrics.simulationsStarted++;
        // Update simulation type breakdown
        if (event.eventData.type && metrics.simulationTypeBreakdown[event.eventData.type] !== undefined) {
          metrics.simulationTypeBreakdown[event.eventData.type]++;
        }
        break;
        
      case 'simulation_passed':
        metrics.simulationsPassed++;
        break;
        
      case 'simulation_failed':
        metrics.simulationsFailed++;
        break;
        
      case 'manual_url_check':
        metrics.urlChecks++;
        break;
    }
    
    // Save updated metrics
    await chrome.storage.local.set({ analyticsMetrics: metrics });
  } catch (error) {
    console.error('Error updating aggregated metrics:', error);
  }
}

/**
 * Get aggregated analytics metrics
 * @returns {Promise<Object>}
 */
export async function getAnalyticsMetrics() {
  try {
    const data = await chrome.storage.local.get('analyticsMetrics');
    return data.analyticsMetrics || {
      phishingDetected: 0,
      simulationsStarted: 0,
      simulationsPassed: 0,
      simulationsFailed: 0,
      urlChecks: 0,
      lastActiveDate: null,
      activeDays: 0,
      simulationTypeBreakdown: {
        fake_login: 0,
        lookalike_domain: 0,
        suspicious_attachment: 0,
        urgent_action: 0,
        data_entry: 0
      }
    };
  } catch (error) {
    console.error('Error getting analytics metrics:', error);
    return {};
  }
}

/**
 * Generate a report for the dashboard
 * @returns {Promise<Object>} The report data
 */
export async function generateDashboardReport() {
  try {
    // Get metrics
    const metrics = await getAnalyticsMetrics();
    
    // Get recent events
    const events = await getAnalyticsEvents(50);
    
    // Calculate success rate
    const totalSimulations = metrics.simulationsPassed + metrics.simulationsFailed;
    const successRate = totalSimulations > 0 
      ? (metrics.simulationsPassed / totalSimulations) * 100 
      : 0;
    
    // Get training progress
    const progressData = await chrome.storage.local.get('trainingProgress');
    const progress = progressData.trainingProgress || {
      skills: {
        urlAnalysis: 0,
        socialEngineering: 0,
        securityAwareness: 0,
        passwordSecurity: 0,
        overallScore: 0
      }
    };
    
    // Get detection history for timeline
    const historyData = await chrome.storage.local.get('detectionHistory');
    const history = historyData.detectionHistory || [];
    
    // Build report
    return {
      summary: {
        phishingDetected: metrics.phishingDetected,
        totalSimulations: totalSimulations,
        successRate: successRate.toFixed(1),
        urlChecks: metrics.urlChecks,
        activeDays: metrics.activeDays
      },
      skills: progress.skills,
      simulationTypeBreakdown: metrics.simulationTypeBreakdown,
      recentEvents: events,
      detectionHistory: history.slice(0, 20)
    };
  } catch (error) {
    console.error('Error generating dashboard report:', error);
    return {};
  }
}

/**
 * Clear analytics data
 * @returns {Promise<void>}
 */
export async function clearAnalyticsData() {
  try {
    await chrome.storage.local.remove([ANALYTICS_STORAGE_KEY, 'analyticsMetrics']);
    return true;
  } catch (error) {
    console.error('Error clearing analytics data:', error);
    return false;
  }
}
