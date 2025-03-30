/**
 * PhishGuard - Phishing Simulator
 * Creates controlled, safe phishing simulations for training
 */

class PhishingSimulator {
  constructor() {
    this.simulationTypes = {
      FAKE_LOGIN: 'fake_login',
      LOOKALIKE_DOMAIN: 'lookalike_domain',
      SUSPICIOUS_ATTACHMENT: 'suspicious_attachment',
      URGENT_ACTION: 'urgent_action',
      DATA_ENTRY: 'data_entry'
    };
    
    this.simulationActive = false;
    this.currentSimulation = null;
    this.simulationResults = [];
  }
  
  /**
   * Initialize the simulator and register message handlers
   */
  initialize() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'startSimulation') {
        this.startSimulation(message.type, message.config);
        sendResponse({ success: true });
        return true;
      } else if (message.action === 'stopSimulation') {
        this.stopSimulation();
        sendResponse({ success: true });
        return true;
      } else if (message.action === 'getSimulationStatus') {
        sendResponse({
          active: this.simulationActive,
          currentSimulation: this.currentSimulation,
          results: this.simulationResults
        });
        return true;
      }
    });
  }
  
  /**
   * Start a new phishing simulation
   * @param {string} type - Type of simulation from this.simulationTypes
   * @param {Object} config - Configuration for the simulation
   */
  async startSimulation(type, config = {}) {
    if (this.simulationActive) {
      console.warn('A simulation is already active. Stop it first.');
      return false;
    }
    
    this.simulationActive = true;
    this.currentSimulation = {
      id: this.generateSimulationId(),
      type,
      startTime: Date.now(),
      config,
      status: 'active'
    };
    
    try {
      // Store simulation state
      await this.saveSimulationState();
      
      // Schedule simulation if delay specified
      if (config.delayMinutes) {
        chrome.alarms.create(`simulation_${this.currentSimulation.id}`, {
          delayInMinutes: config.delayMinutes
        });
        return true;
      }
      
      // Otherwise execute immediately
      await this.executeSimulation(type, config);
      return true;
    } catch (error) {
      console.error('Error starting simulation:', error);
      this.simulationActive = false;
      this.currentSimulation = null;
      return false;
    }
  }
  
  /**
   * Execute the specified simulation
   * @param {string} type - Type of simulation
   * @param {Object} config - Configuration
   */
  async executeSimulation(type, config) {
    switch (type) {
      case this.simulationTypes.FAKE_LOGIN:
        await this.executeFakeLoginSimulation(config);
        break;
      case this.simulationTypes.LOOKALIKE_DOMAIN:
        await this.executeLookalikeSimulation(config);
        break;
      case this.simulationTypes.SUSPICIOUS_ATTACHMENT:
        await this.executeSuspiciousAttachmentSimulation(config);
        break;
      case this.simulationTypes.URGENT_ACTION:
        await this.executeUrgentActionSimulation(config);
        break;
      case this.simulationTypes.DATA_ENTRY:
        await this.executeDataEntrySimulation(config);
        break;
      default:
        throw new Error(`Unknown simulation type: ${type}`);
    }
  }
  
  /**
   * Execute a fake login page simulation
   * @param {Object} config 
   */
  async executeFakeLoginSimulation(config) {
    // Get active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;
    
    const tab = tabs[0];
    
    // Get simulation template
    const templateUrl = chrome.runtime.getURL('assets/templates/fake-login.html');
    const response = await fetch(templateUrl);
    let template = await response.text();
    
    // Customize template based on config
    if (config.brand) {
      template = template.replace(/{{BRAND}}/g, config.brand);
      template = template.replace(/{{LOGO_URL}}/g, 
        chrome.runtime.getURL(`assets/templates/logos/${config.brand.toLowerCase()}.png`));
    }
    
    // Inject the simulation overlay
    await chrome.tabs.sendMessage(tab.id, {
      action: 'simulatePhishing',
      simulationType: this.simulationTypes.FAKE_LOGIN,
      template
    });
    
    // Start monitoring user response
    await chrome.tabs.sendMessage(tab.id, {
      action: 'monitorSimulation',
      simulationId: this.currentSimulation.id
    });
  }
  
  /**
   * Execute a lookalike domain simulation
   * @param {Object} config 
   */
  async executeLookalikeSimulation(config) {
    // Create a notification about a critical security issue
    chrome.notifications.create(`simulation_${this.currentSimulation.id}`, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('assets/icons/warning.png'),
      title: 'Security Alert',
      message: `Please verify your account information at ${config.domain} immediately.`,
      buttons: [
        { title: 'Visit Site' },
        { title: 'Ignore' }
      ],
      priority: 2
    });
    
    // Listen for notification click
    const handleNotificationClick = (notificationId, buttonIndex) => {
      if (notificationId === `simulation_${this.currentSimulation.id}`) {
        if (buttonIndex === 0) {
          // User clicked "Visit Site" - record as failure
          this.recordSimulationResult({
            action: 'clicked_phishing_link',
            success: false,
            timestamp: Date.now()
          });
          
          // Open the educational page instead of actual phishing site
          chrome.tabs.create({
            url: chrome.runtime.getURL(`education/modules/lookalike_domain.html?sim=${this.currentSimulation.id}`)
          });
        } else {
          // User clicked "Ignore" - record as success
          this.recordSimulationResult({
            action: 'ignored_phishing_attempt',
            success: true,
            timestamp: Date.now()
          });
          
          // Show success notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('assets/icons/success.png'),
            title: 'Good job!',
            message: 'You correctly identified and avoided a phishing attempt.',
            priority: 2
          });
        }
        
        // Clean up the listener
        chrome.notifications.onButtonClicked.removeListener(handleNotificationClick);
      }
    };
    
    chrome.notifications.onButtonClicked.addListener(handleNotificationClick);
  }
  
  /**
   * Execute a suspicious attachment simulation
   * @param {Object} config 
   */
  async executeSuspiciousAttachmentSimulation(config) {
    // Will be implemented
    console.log('Suspicious attachment simulation not yet implemented');
  }
  
  /**
   * Execute an urgent action simulation
   * @param {Object} config 
   */
  async executeUrgentActionSimulation(config) {
    // Will be implemented
    console.log('Urgent action simulation not yet implemented');
  }
  
  /**
   * Execute a data entry simulation
   * @param {Object} config 
   */
  async executeDataEntrySimulation(config) {
    // Will be implemented
    console.log('Data entry simulation not yet implemented');
  }
  
  /**
   * Stop the current simulation
   */
  async stopSimulation() {
    if (!this.simulationActive) {
      return false;
    }
    
    try {
      // Update simulation status
      this.currentSimulation.status = 'completed';
      this.currentSimulation.endTime = Date.now();
      
      // Save to results
      this.simulationResults.push(this.currentSimulation);
      
      // Clear current simulation
      this.simulationActive = false;
      this.currentSimulation = null;
      
      // Save updated state
      await this.saveSimulationState();
      return true;
    } catch (error) {
      console.error('Error stopping simulation:', error);
      return false;
    }
  }
  
  /**
   * Record a result/action during the simulation
   * @param {Object} result 
   */
  async recordSimulationResult(result) {
    if (!this.simulationActive || !this.currentSimulation) {
      return false;
    }
    
    if (!this.currentSimulation.results) {
      this.currentSimulation.results = [];
    }
    
    this.currentSimulation.results.push(result);
    await this.saveSimulationState();
    
    // Check if this result should end the simulation
    if (result.endSimulation) {
      await this.stopSimulation();
    }
    
    return true;
  }
  
  /**
   * Save the current simulation state to storage
   */
  async saveSimulationState() {
    await chrome.storage.local.set({
      simulationActive: this.simulationActive,
      currentSimulation: this.currentSimulation
    });
    
    // Only keep the last 50 simulation results
    if (this.simulationResults.length > 50) {
      this.simulationResults = this.simulationResults.slice(-50);
    }
    
    await chrome.storage.local.set({
      simulationResults: this.simulationResults
    });
  }
  
  /**
   * Load simulation state from storage
   */
  async loadSimulationState() {
    const data = await chrome.storage.local.get([
      'simulationActive',
      'currentSimulation',
      'simulationResults'
    ]);
    
    this.simulationActive = data.simulationActive || false;
    this.currentSimulation = data.currentSimulation || null;
    this.simulationResults = data.simulationResults || [];
  }
  
  /**
   * Generate a unique ID for a simulation
   * @returns {string} Unique ID
   */
  generateSimulationId() {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export the simulator
export default PhishingSimulator;
