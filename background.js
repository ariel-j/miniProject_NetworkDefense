// Enhanced PhishGuard Background Script with Multi-API Detection
// Supports Google Safe Browsing, PhishTank, and VirusTotal APIs

// Enhanced Configuration
const CONFIG = {
  training: {
    frequency: 7,
    minimumGap: 2,
    simulationProbability: 0.3,
    maxSimulationsPerDay: 3
  },
  phishing: {
    databaseUpdateInterval: 24,
    confidenceThreshold: 0.7,
    typosquattingDistance: 3,
    cacheExpiration: 3600000, // 1 hour in milliseconds
    apiTimeout: 5000, // 5 seconds
    maxCacheSize: 10000
  },
  apis: {
    // Google Safe Browsing API v4 (Free tier: 10,000 requests/day) - INABLAED
    safeBrowsing: {
      enabled: false,
      apiKey: 'YOUR_GOOGLE_API_KEY', // Replace with actual API key
      endpoint: 'https://safebrowsing.googleapis.com/v4/threatMatches:find',
      weight: 0.9 // High confidence weight
    },
    // PhishTank API (Free, no key required)
    phishTank: {
      enabled: true,
      endpoint: 'https://checkurl.phishtank.com/checkurl/',
      weight: 0.8
    },
    // VirusTotal API (Free tier: 4 requests/minute)
    virusTotal: {
      enabled: false, // Disabled by default due to rate limits
      apiKey: 'YOUR_VIRUSTOTAL_API_KEY', // Replace with actual API key
      endpoint: 'https://www.virustotal.com/vtapi/v2/url/report',
      weight: 0.85
    }
  },
  popularDomains: [
    'google.com', 'facebook.com', 'amazon.com', 'apple.com', 
    'microsoft.com', 'paypal.com', 'netflix.com', 'instagram.com',
    'twitter.com', 'linkedin.com', 'github.com', 'youtube.com'
  ],
  defaultUserStats: {
    simulationsShown: 0,
    simulationsPassed: 0,
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
  }
};

// Enhanced phishing detection with API integration
let phishingDomains = [];
let userStats = CONFIG.defaultUserStats;
let urlCache = new Map(); // Cache for API results
let apiStats = {
  safeBrowsing: { requests: 0, hits: 0, errors: 0 },
  phishTank: { requests: 0, hits: 0, errors: 0 },
  virusTotal: { requests: 0, hits: 0, errors: 0 }
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('PhishGuard: Enhanced extension with multi-API detection initializing...');
  
  try {
    // Load user stats
    const result = await chrome.storage.local.get(['userStats']);
    if (result.userStats) {
      userStats = result.userStats;
      if (typeof userStats.simulationsPassed === 'undefined') {
        userStats.simulationsPassed = Math.max(0, (userStats.simulationsShown || 0) - (userStats.simulationsFallen || 0));
        await chrome.storage.local.set({ userStats });
      }
    } else {
      await chrome.storage.local.set({ userStats: CONFIG.defaultUserStats });
    }
    
    // Initialize enhanced phishing database
    await updatePhishingDatabase();
    
    // Load cached API results
    await loadAPICache();
    
    // Set up alarms
    setupAlarms();
    
    console.log('PhishGuard: Enhanced initialization completed successfully');
  } catch (error) {
    console.error('PhishGuard: Enhanced initialization failed:', error);
  }
});

// Enhanced URL analysis with multi-API integration
async function analyzeUrl(url) {
  try {
    if (!url || typeof url !== 'string') {
      return createAnalysisResult(false, 0, 'Invalid URL');
    }

    if (shouldSkipUrl(url)) {
      return createAnalysisResult(false, 0, 'URL skipped from analysis');
    }

    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    console.log(`PhishGuard: Analyzing URL: ${url}`);
    
    // Step 1: Check cache first for fast response
    const cacheKey = domain;
    if (urlCache.has(cacheKey)) {
      const cached = urlCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CONFIG.phishing.cacheExpiration) {
        console.log('PhishGuard: Cache hit for', domain);
        return cached.result;
      } else {
        urlCache.delete(cacheKey); // Remove expired cache
      }
    }
    
    // Step 2: Local analysis (fast checks)
    const localResult = await performLocalAnalysis(url, domain);
    if (localResult.confidence > 0.8) {
      // High confidence local detection, cache and return
      cacheResult(cacheKey, localResult);
      return localResult;
    }
    
    // Step 3: API-based analysis for authoritative checking
    const apiResult = await performAPIAnalysis(url, domain);
    
    // Step 4: Combine local and API results
    const combinedResult = combineAnalysisResults(localResult, apiResult);
    
    // Step 5: Cache the result
    cacheResult(cacheKey, combinedResult);
    
    return combinedResult;
    
  } catch (error) {
    console.error('PhishGuard: Error in enhanced URL analysis:', error);
    return createAnalysisResult(false, 0, 'Analysis error: ' + error.message);
  }
}

// Perform local analysis (existing logic enhanced)
async function performLocalAnalysis(url, domain) {
  const issues = [];
  let confidence = 0;
  
  // Check against known phishing domains
  if (phishingDomains.includes(domain)) {
    return createAnalysisResult(true, 0.95, 'Known phishing domain from local database');
  }
  
  // Enhanced typosquatting detection
  for (const popularDomain of CONFIG.popularDomains) {
    const distance = levenshteinDistance(domain, popularDomain);
    const threshold = Math.max(2, Math.floor(popularDomain.length * 0.15)); // Dynamic threshold
    
    if (distance <= threshold && domain !== popularDomain) {
      confidence = Math.max(confidence, 0.8 - (distance * 0.1));
      issues.push(`Possible typosquatting of ${popularDomain} (distance: ${distance})`);
    }
  }
  
  // Enhanced suspicious pattern detection
  const suspiciousPatterns = [
    { pattern: /secure.*login/i, weight: 0.6 },
    { pattern: /verify.*account/i, weight: 0.7 },
    { pattern: /update.*payment/i, weight: 0.6 },
    { pattern: /urgent.*action/i, weight: 0.5 },
    { pattern: /suspended.*account/i, weight: 0.7 },
    { pattern: /click.*here.*now/i, weight: 0.4 },
    { pattern: /limited.*time/i, weight: 0.3 },
    { pattern: /confirm.*identity/i, weight: 0.5 }
  ];
  
  for (const { pattern, weight } of suspiciousPatterns) {
    if (pattern.test(url)) {
      confidence = Math.max(confidence, weight);
      issues.push(`Suspicious URL pattern: ${pattern.source}`);
    }
  }
  
  // Domain characteristics analysis
  const domainIssues = analyzeDomainCharacteristics(domain);
  confidence = Math.max(confidence, domainIssues.confidence);
  issues.push(...domainIssues.issues);
  
  // Protocol security check
  if (!url.startsWith('https://') && issues.length > 0) {
    confidence += 0.2; // Boost confidence if other issues exist
    issues.push('Insecure HTTP connection with suspicious patterns');
  }
  
  const reason = issues.length > 0 ? issues.join('; ') : 'No local threats detected';
  return createAnalysisResult(confidence > CONFIG.phishing.confidenceThreshold, confidence, reason, {
    localAnalysis: true,
    issuesFound: issues.length,
    analysisType: 'local'
  });
}

// Analyze domain characteristics
function analyzeDomainCharacteristics(domain) {
  const issues = [];
  let confidence = 0;
  
  // IP address check
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
    confidence = 0.9;
    issues.push('Domain uses IP address instead of domain name');
  }
  
  // Suspicious TLD check
  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.click', '.download', '.zip'];
  const tld = domain.substring(domain.lastIndexOf('.'));
  if (suspiciousTlds.includes(tld)) {
    confidence = Math.max(confidence, 0.4);
    issues.push(`Suspicious top-level domain: ${tld}`);
  }
  
  // Domain length and character analysis
  if (domain.length > 50) {
    confidence = Math.max(confidence, 0.3);
    issues.push('Unusually long domain name');
  }
  
  // Excessive subdomain check
  const parts = domain.split('.');
  if (parts.length > 4) {
    confidence = Math.max(confidence, 0.4);
    issues.push('Excessive subdomains detected');
  }
  
  // Homograph attack detection (basic)
  const suspiciousChars = /[а-я]|[α-ω]|[\u0100-\u017F]/; // Cyrillic, Greek, Extended Latin
  if (suspiciousChars.test(domain)) {
    confidence = Math.max(confidence, 0.6);
    issues.push('Potential homograph attack (non-Latin characters)');
  }
  
  return { confidence, issues };
}

// Perform API-based analysis
async function performAPIAnalysis(url, domain) {
  const apiResults = [];
  const promises = [];
  
  // Google Safe Browsing API
  if (CONFIG.apis.safeBrowsing.enabled) {
    promises.push(
      checkSafeBrowsing(url).then(result => ({
        api: 'safeBrowsing',
        ...result
      })).catch(error => ({
        api: 'safeBrowsing',
        isPhishing: false,
        confidence: 0,
        error: error.message
      }))
    );
  }
  
  // PhishTank API
  if (CONFIG.apis.phishTank.enabled) {
    promises.push(
      checkPhishTank(url).then(result => ({
        api: 'phishTank',
        ...result
      })).catch(error => ({
        api: 'phishTank',
        isPhishing: false,
        confidence: 0,
        error: error.message
      }))
    );
  }
  
  // VirusTotal API (if enabled)
  if (CONFIG.apis.virusTotal.enabled) {
    promises.push(
      checkVirusTotal(url).then(result => ({
        api: 'virusTotal',
        ...result
      })).catch(error => ({
        api: 'virusTotal',
        isPhishing: false,
        confidence: 0,
        error: error.message
      }))
    );
  }
  
  // Wait for all API calls (with timeout)
  try {
    const results = await Promise.allSettled(
      promises.map(p => Promise.race([
        p,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), CONFIG.phishing.apiTimeout)
        )
      ]))
    );
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        apiResults.push(result.value);
      } else {
        console.warn(`PhishGuard: API ${index} failed:`, result.reason);
      }
    });
    
  } catch (error) {
    console.error('PhishGuard: API analysis error:', error);
  }
  
  // Combine API results
  return combineAPIResults(apiResults);
}

// Google Safe Browsing API check
async function checkSafeBrowsing(url) {
  apiStats.safeBrowsing.requests++;
  
  const payload = {
    client: {
      clientId: "phishguard-extension",
      clientVersion: "1.0.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url: url }]
    }
  };
  
  try {
    const response = await fetch(
      `${CONFIG.apis.safeBrowsing.endpoint}?key=${CONFIG.apis.safeBrowsing.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );
    
    if (!response.ok) {
      throw new Error(`Safe Browsing API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.matches && data.matches.length > 0) {
      apiStats.safeBrowsing.hits++;
      const threatType = data.matches[0].threatType;
      return {
        isPhishing: true,
        confidence: 0.95,
        reason: `Google Safe Browsing: ${threatType}`,
        details: { threatMatches: data.matches }
      };
    }
    
    return {
      isPhishing: false,
      confidence: 0.1,
      reason: 'Google Safe Browsing: Clean'
    };
    
  } catch (error) {
    apiStats.safeBrowsing.errors++;
    throw error;
  }
}

// PhishTank API check - FIXED VERSION
async function checkPhishTank(url) {
  apiStats.phishTank.requests++;
  
  try {
    // CHANGE: Use URLSearchParams instead of FormData
    const formData = new URLSearchParams();
    formData.append('url', url);
    formData.append('format', 'json');
    
    const response = await fetch(CONFIG.apis.phishTank.endpoint, {
      method: 'POST',
      headers: {
        // ADD: Proper Content-Type and User-Agent headers
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'PhishGuard/1.0'
      },
      body: formData
    });
    
    if (!response.ok) {
      // IMPROVED: Better error handling for no API key
      if (response.status === 403 || response.status === 509) {
        console.log('PhishGuard: PhishTank rate limited or no API key, this is normal for free usage');
        // Return a neutral result instead of throwing error
        return {
          isPhishing: false,
          confidence: 0,
          reason: 'PhishTank: API key required for higher limits'
        };
      }
      throw new Error(`PhishTank API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.in_database && data.results.valid) {
      apiStats.phishTank.hits++;
      return {
        isPhishing: true,
        confidence: 0.9,
        reason: 'PhishTank: Confirmed phishing site',
        details: { phishId: data.results.phish_id }
      };
    }
    
    return {
      isPhishing: false,
      confidence: 0.1,
      reason: 'PhishTank: Not in database'
    };
    
  } catch (error) {
    apiStats.phishTank.errors++;
    console.error('PhishGuard: PhishTank error:', error);
    // Return neutral result instead of throwing
    return {
      isPhishing: false,
      confidence: 0,
      reason: `PhishTank error: ${error.message}`
    };
  }
}

// VirusTotal API check (optional, rate limited)
async function checkVirusTotal(url) {
  apiStats.virusTotal.requests++;
  
  try {
    const params = new URLSearchParams({
      apikey: CONFIG.apis.virusTotal.apiKey,
      resource: url
    });
    
    const response = await fetch(`${CONFIG.apis.virusTotal.endpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.response_code === 1 && data.positives > 0) {
      apiStats.virusTotal.hits++;
      const confidence = Math.min(0.9, data.positives / data.total * 2); // Scale confidence
      return {
        isPhishing: confidence > 0.3,
        confidence: confidence,
        reason: `VirusTotal: ${data.positives}/${data.total} engines detected threat`,
        details: { positives: data.positives, total: data.total }
      };
    }
    
    return {
      isPhishing: false,
      confidence: 0.1,
      reason: 'VirusTotal: Clean'
    };
    
  } catch (error) {
    apiStats.virusTotal.errors++;
    throw error;
  }
}

// Combine API results using weighted scoring
function combineAPIResults(apiResults) {
  if (apiResults.length === 0) {
    return {
      isPhishing: false,
      confidence: 0,
      reason: 'No API results available',
      details: { apiAnalysis: true, apisUsed: 0 }
    };
  }
  
  let totalWeight = 0;
  let weightedScore = 0;
  const reasons = [];
  const details = { apiAnalysis: true, apisUsed: apiResults.length, results: {} };
  
  for (const result of apiResults) {
    if (!result.error) {
      const weight = CONFIG.apis[result.api]?.weight || 0.5;
      totalWeight += weight;
      
      if (result.isPhishing) {
        weightedScore += weight * result.confidence;
        reasons.push(result.reason);
      }
      
      details.results[result.api] = {
        isPhishing: result.isPhishing,
        confidence: result.confidence,
        reason: result.reason
      };
    }
  }
  
  const finalConfidence = totalWeight > 0 ? weightedScore / totalWeight : 0;
  const isPhishing = finalConfidence > CONFIG.phishing.confidenceThreshold;
  
  return createAnalysisResult(
    isPhishing,
    finalConfidence,
    reasons.length > 0 ? reasons.join('; ') : 'Clean by API analysis',
    details
  );
}

// Combine local and API analysis results
function combineAnalysisResults(localResult, apiResult) {
  // If API found a definitive threat, use that
  if (apiResult.confidence > 0.8) {
    return apiResult;
  }
  
  // If local analysis found high confidence threat, use that
  if (localResult.confidence > 0.8) {
    return localResult;
  }
  
  // Combine both results with weighted average
  const localWeight = 0.3;
  const apiWeight = 0.7;
  
  const combinedConfidence = (localResult.confidence * localWeight) + (apiResult.confidence * apiWeight);
  const isPhishing = combinedConfidence > CONFIG.phishing.confidenceThreshold;
  
  const reasons = [];
  if (localResult.confidence > 0.3) reasons.push(localResult.reason);
  if (apiResult.confidence > 0.3) reasons.push(apiResult.reason);
  
  return createAnalysisResult(
    isPhishing,
    combinedConfidence,
    reasons.length > 0 ? reasons.join('; ') : 'Clean by combined analysis',
    {
      combinedAnalysis: true,
      localConfidence: localResult.confidence,
      apiConfidence: apiResult.confidence,
      ...localResult.details,
      ...apiResult.details
    }
  );
}

// Cache management
function cacheResult(key, result) {
  // Implement LRU cache behavior
  if (urlCache.size >= CONFIG.phishing.maxCacheSize) {
    const firstKey = urlCache.keys().next().value;
    urlCache.delete(firstKey);
  }
  
  urlCache.set(key, {
    result: result,
    timestamp: Date.now()
  });
}

async function loadAPICache() {
  try {
    const result = await chrome.storage.local.get(['urlCache']);
    if (result.urlCache) {
      urlCache = new Map(result.urlCache);
      console.log(`PhishGuard: Loaded ${urlCache.size} cached results`);
    }
  } catch (error) {
    console.warn('PhishGuard: Could not load API cache:', error);
  }
}

async function saveAPICache() {
  try {
    await chrome.storage.local.set({ 
      urlCache: Array.from(urlCache.entries())
    });
  } catch (error) {
    console.warn('PhishGuard: Could not save API cache:', error);
  }
}

// Enhanced database update
async function updatePhishingDatabase() {
  try {
    // Enhanced local database
    phishingDomains = [
      // Typosquatting examples
      'amaz0n.com', 'amazom.com', 'faceb00k.com', 'paypa1.com',
      'goog1e.com', 'app1e.com', 'microsft.com', 'netfl1x.com',
      'g00gle.com', 'facebok.com', 'paypal-security.com',
      
      // Generic phishing domains
      'secure-banking-login.com', 'verify-account-now.com',
      'urgent-security-alert.com', 'account-suspended-verify.com',
      'login-verification-required.com', 'security-update-needed.com',
      'paypal-verification.com', 'amazon-security.com',
      'google-verification.net', 'microsoft-update.org'
    ];
    
    await chrome.storage.local.set({ phishingDomains });
    console.log(`PhishGuard: Enhanced phishing database updated with ${phishingDomains.length} domains`);
    return true;
  } catch (error) {
    console.error('PhishGuard: Failed to update enhanced phishing database:', error);
    return false;
  }
}

// Utility functions (keeping existing ones and adding new)
function createAnalysisResult(isPhishing, confidence, reason, details = {}) {
  return {
    isPhishing: Boolean(isPhishing),
    confidence: Math.max(0, Math.min(1, confidence)),
    reason: String(reason),
    timestamp: new Date().toISOString(),
    details: {
      version: '2.0-enhanced',
      ...details
    }
  };
}

function shouldSkipUrl(url) {
  const skipPatterns = [
    /^chrome:/i, /^chrome-extension:/i, /^moz-extension:/i,
    /^about:/i, /^file:/i, /^data:/i, /^blob:/i
  ];
  return skipPatterns.some(pattern => pattern.test(url));
}

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Enhanced message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true;
});

async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.action) {
      case 'analyzeUrl':
        if (!message.url) {
          sendResponse({ error: 'URL is required' });
          return;
        }
        const analysis = await analyzeUrl(message.url);
        sendResponse(analysis);
        break;
        
      case 'getAPIStats':
        sendResponse({
          apiStats: apiStats,
          cacheSize: urlCache.size,
          enabledAPIs: Object.keys(CONFIG.apis).filter(api => CONFIG.apis[api].enabled)
        });
        break;
        
      case 'clearCache':
        urlCache.clear();
        await chrome.storage.local.remove(['urlCache']);
        sendResponse({ success: true, message: 'Cache cleared' });
        break;
        
      // Keep all existing message handlers...
      case 'trainingResult':
        const stats = await getUserStats();
        const updates = {};
        
        if (message.fell) {
          updates.simulationsFallen = stats.simulationsFallen + 1;
          if (message.simulationType) {
            const currentVuln = stats.vulnerabilityAreas[message.simulationType] || 0;
            updates.vulnerabilityAreas = {
              ...stats.vulnerabilityAreas,
              [message.simulationType]: currentVuln + 1
            };
          }
        } else {
          updates.simulationsPassed = stats.simulationsPassed + 1;
        }
        
        const historyEntry = {
          date: new Date().toISOString(),
          simulationType: message.simulationType || 'unknown',
          fell: message.fell || false,
          responseTime: message.responseTime || null
        };
        updates.trainingHistory = [...(stats.trainingHistory || []), historyEntry];
        
        if (updates.trainingHistory.length > 100) {
          updates.trainingHistory = updates.trainingHistory.slice(-100);
        }
        
        await updateUserStats(updates);
        sendResponse({ success: true });
        break;
        
      case 'getUserStats':
        const currentStats = await getUserStats();
        sendResponse(currentStats);
        break;
        
      case 'runManualSimulation':
        const simulation = generateTrainingSimulation();
        if (message.tabId) {
          try {
            const tab = await chrome.tabs.get(message.tabId);
            
            if (shouldSkipUrl(tab.url)) {
              sendResponse({ success: false, error: 'Cannot run simulation on this type of page' });
              return;
            }
            
            try {
              await chrome.scripting.executeScript({
                target: { tabId: message.tabId },
                files: ['content.js']
              });
            } catch (injectError) {
              console.log('PhishGuard: Content script injection failed (might already be loaded):', injectError.message);
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await chrome.tabs.sendMessage(message.tabId, {
              action: 'showTrainingSimulation',
              data: simulation
            });
            
            const stats = await getUserStats();
            await updateUserStats({
              simulationsShown: stats.simulationsShown + 1,
              lastTrainingDate: new Date().toISOString(),
              dailySimulationCount: stats.dailySimulationCount + 1
            });
            
            sendResponse({ success: true, simulationType: simulation.type });
          } catch (msgError) {
            sendResponse({ success: false, error: 'Could not send simulation to tab: ' + msgError.message });
          }
        } else {
          sendResponse({ success: false, error: 'Tab ID required' });
        }
        break;
        
      case 'openLearningResource':
        if (message.simulationType) {
          const url = chrome.runtime.getURL(`learning/${message.simulationType}.html`);
          await chrome.tabs.create({ url });
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'Simulation type required' });
        }
        break;
        
      case 'resetStats':
        await chrome.storage.local.set({ userStats: CONFIG.defaultUserStats });
        userStats = CONFIG.defaultUserStats;
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ error: 'Unknown action: ' + message.action });
    }
  } catch (error) {
    console.error('PhishGuard: Error handling enhanced message:', error);
    sendResponse({ error: error.message || 'Unknown error occurred' });
  }
}

// Keep all existing helper functions
async function getUserStats() {
  try {
    const result = await chrome.storage.local.get(['userStats']);
    const stats = result.userStats || CONFIG.defaultUserStats;
    if (typeof stats.simulationsPassed === 'undefined') {
      stats.simulationsPassed = 0;
    }
    return stats;
  } catch (error) {
    console.error('PhishGuard: Error getting user stats:', error);
    return CONFIG.defaultUserStats;
  }
}

async function updateUserStats(updates) {
  try {
    const currentStats = await getUserStats();
    const updatedStats = { ...currentStats, ...updates };
    await chrome.storage.local.set({ userStats: updatedStats });
    userStats = updatedStats;
    return true;
  } catch (error) {
    console.error('PhishGuard: Error updating user stats:', error);
    return false;
  }
}

function generateTrainingSimulation() {
  const simulationTypes = ['urgencyTactics', 'loginFormSpoofing', 'misspelledDomains', 'securityFalseClaims', 'financialBait'];
  const randomType = simulationTypes[Math.floor(Math.random() * simulationTypes.length)];
  
  return {
    id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: randomType,
    title: getSimulationTitle(randomType),
    timestamp: new Date().toISOString()
  };
}

function getSimulationTitle(type) {
  const titles = {
    urgencyTactics: 'URGENT: Account Security Alert',
    loginFormSpoofing: 'Sign in to continue',
    misspelledDomains: 'Special Limited Offer!',
    securityFalseClaims: 'Security Verification Required',
    financialBait: 'Congratulations! You\'ve Won!'
  };
  return titles[type] || 'Important Notification';
}

async function shouldShowTraining() {
  try {
    const trainingEnabled = await isTrainingEnabled();
    if (!trainingEnabled) return false;
    
    const stats = await getUserStats();
    await checkAndResetDailyCounters();
    
    if (stats.dailySimulationCount >= CONFIG.training.maxSimulationsPerDay) {
      return false;
    }
    
    if (stats.lastTrainingDate) {
      const daysSince = calculateDaysSince(stats.lastTrainingDate);
      if (daysSince < CONFIG.training.minimumGap) {
        return false;
      }
    }
    
    return Math.random() < CONFIG.training.simulationProbability;
  } catch (error) {
    console.error('PhishGuard: Error checking enhanced training eligibility:', error);
    return false;
  }
}

async function isTrainingEnabled() {
  try {
    const result = await chrome.storage.local.get(['trainingEnabled']);
    return result.trainingEnabled !== false;
  } catch (error) {
    console.error('PhishGuard: Error checking training enabled:', error);
    return true;
  }
}

async function checkAndResetDailyCounters() {
  try {
    const stats = await getUserStats();
    const today = new Date().toDateString();
    
    if (stats.lastResetDate !== today) {
      await updateUserStats({
        dailySimulationCount: 0,
        lastResetDate: today
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('PhishGuard: Error resetting daily counters:', error);
    return false;
  }
}

function calculateDaysSince(dateString) {
  const then = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - then);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Enhanced tab update handler with improved API integration
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      if (shouldSkipUrl(tab.url)) {
        return;
      }
      
      console.log(`PhishGuard: Analyzing tab update for: ${tab.url}`);
      
      // Enhanced URL analysis with API integration
      const analysis = await analyzeUrl(tab.url);
      
      console.log(`PhishGuard: Analysis result - isPhishing: ${analysis.isPhishing}, confidence: ${analysis.confidence}`);
      
      if (analysis.isPhishing && analysis.confidence > CONFIG.phishing.confidenceThreshold) {
        // Show phishing warning
        try {
          await chrome.tabs.sendMessage(tabId, {
            action: 'showWarning',
            data: analysis
          });
          
          // Update stats
          const stats = await getUserStats();
          await updateUserStats({
            phishingSitesBlocked: stats.phishingSitesBlocked + 1
          });
          
          console.log(`PhishGuard: Blocked phishing site: ${tab.url} (confidence: ${analysis.confidence})`);
        } catch (msgError) {
          console.log('PhishGuard: Could not send warning message to tab:', msgError.message);
        }
      } else if (await shouldShowTraining()) {
        // Show training simulation
        const simulation = generateTrainingSimulation();
        try {
          await chrome.tabs.sendMessage(tabId, {
            action: 'showTrainingSimulation',
            data: simulation
          });
          
          // Update stats
          const stats = await getUserStats();
          await updateUserStats({
            simulationsShown: stats.simulationsShown + 1,
            lastTrainingDate: new Date().toISOString(),
            dailySimulationCount: stats.dailySimulationCount + 1
          });
          
          console.log('PhishGuard: Showed enhanced training simulation:', simulation.type);
        } catch (msgError) {
          console.log('PhishGuard: Could not send simulation message to tab:', msgError.message);
        }
      }
    } catch (error) {
      console.error('PhishGuard: Error in enhanced tab update handler:', error);
    }
  }
});

// Set up enhanced alarms
function setupAlarms() {
  try {
    chrome.alarms.create('updatePhishingDatabase', {
      periodInMinutes: CONFIG.phishing.databaseUpdateInterval * 60
    });
    chrome.alarms.create('saveAPICache', {
      periodInMinutes: 30 // Save cache every 30 minutes
    });
    chrome.alarms.create('cleanupCache', {
      periodInMinutes: 60 // Cleanup expired cache entries every hour
    });
    console.log('PhishGuard: Enhanced alarms set up successfully');
  } catch (error) {
    console.error('PhishGuard: Error setting up enhanced alarms:', error);
  }
}

// Enhanced alarm handler
chrome.alarms.onAlarm.addListener(async (alarm) => {
  try {
    switch (alarm.name) {
      case 'updatePhishingDatabase':
        await updatePhishingDatabase();
        console.log('PhishGuard: Scheduled phishing database update completed');
        break;
        
      case 'saveAPICache':
        await saveAPICache();
        console.log('PhishGuard: API cache saved');
        break;
        
      case 'cleanupCache':
        await cleanupExpiredCache();
        console.log('PhishGuard: Cache cleanup completed');
        break;
        
      default:
        console.log('PhishGuard: Unknown alarm:', alarm.name);
    }
  } catch (error) {
    console.error('PhishGuard: Error handling alarm:', error);
  }
});

// Cache cleanup function
async function cleanupExpiredCache() {
  const now = Date.now();
  let removedCount = 0;
  
  for (const [key, value] of urlCache.entries()) {
    if (now - value.timestamp > CONFIG.phishing.cacheExpiration) {
      urlCache.delete(key);
      removedCount++;
    }
  }
  
  console.log(`PhishGuard: Removed ${removedCount} expired cache entries`);
  
  // Save cleaned cache
  await saveAPICache();
}

// Enhanced initialization when extension starts
chrome.runtime.onStartup.addListener(async () => {
  console.log('PhishGuard: Extension startup - loading enhanced systems...');
  await loadAPICache();
  console.log('PhishGuard: Enhanced systems ready');
});

// Save cache when extension suspends
chrome.runtime.onSuspend.addListener(async () => {
  console.log('PhishGuard: Extension suspending - saving state...');
  await saveAPICache();
});

console.log('PhishGuard: Enhanced background service worker with multi-API detection loaded and ready');