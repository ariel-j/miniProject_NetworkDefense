// PhishGuard Phishing Detector
// Analyzes URLs and content for phishing indicators

class PhishingDetector {
  constructor(config, storageManager) {
    this.config = config;
    this.storage = storageManager;
    this.phishingDomains = [];
    this.popularDomains = config.popularDomains;
    this.patterns = config.phishingPatterns;
    this.confidenceThreshold = config.phishing.confidenceThreshold;
  }

  // Initialize the detector
  async initialize() {
    try {
      await this.updatePhishingDatabase();
      console.log('PhishGuard: Phishing detector initialized');
      return true;
    } catch (error) {
      console.error('PhishGuard: Failed to initialize phishing detector:', error);
      return false;
    }
  }

  // Update the database of known phishing domains
  async updatePhishingDatabase() {
    try {
      // In a production environment, this would fetch from a real API
      // For now, we'll use a curated list of common phishing patterns
      const knownPhishingDomains = [
        // Typosquatting examples
        'amaz0n.com', 'amazom.com', 'amazone.com',
        'faceb00k.com', 'facebook-login.com', 'fb-secure.com',
        'paypa1.com', 'paypal-verify.com', 'paypal-security.com',
        'goog1e.com', 'google-verify.com', 'googIe.com',
        'app1e.com', 'apple-id.com', 'appleid-verify.com',
        'microsft.com', 'microsoft-security.com', 'office365-login.com',
        
        // Generic phishing domains
        'secure-banking-login.com',
        'verify-account-now.com',
        'urgent-security-alert.com',
        'account-suspended-verify.com',
        'login-verification-required.com',
        'security-update-needed.com',
        'confirm-identity-now.com',
        'update-payment-info.com',
        'claim-reward-now.com',
        'winner-notification.com'
      ];

      this.phishingDomains = knownPhishingDomains;
      await this.storage.savePhishingDomains(knownPhishingDomains);
      
      if (this.config.debug.enabled) {
        console.log('PhishGuard: Updated phishing database with', knownPhishingDomains.length, 'domains');
      }
      
      return true;
    } catch (error) {
      console.error('PhishGuard: Failed to update phishing database:', error);
      return false;
    }
  }

  // Main analysis function - analyzes a URL for phishing indicators
  async analyzeUrl(url) {
    try {
      if (!url || typeof url !== 'string') {
        return this.createAnalysisResult(false, 0, 'Invalid URL');
      }

      // Skip analysis for certain URLs
      if (this.shouldSkipAnalysis(url)) {
        return this.createAnalysisResult(false, 0, 'URL skipped from analysis');
      }

      const domain = this.extractDomain(url);
      if (!domain) {
        return this.createAnalysisResult(false, 0, 'Could not extract domain');
      }

      // Run all detection methods
      const results = await Promise.all([
        this.checkKnownPhishingDomains(domain),
        this.checkTyposquatting(domain),
        this.checkSuspiciousPatterns(url),
        this.checkDomainAge(domain),
        this.checkSSLCertificate(url)
      ]);

      // Calculate overall confidence and determine if phishing
      const analysis = this.aggregateResults(results, url, domain);
      
      if (this.config.debug.enabled) {
        console.log('PhishGuard: URL analysis for', url, ':', analysis);
      }

      return analysis;
    } catch (error) {
      console.error('PhishGuard: Error analyzing URL:', error);
      return this.createAnalysisResult(false, 0, 'Analysis error');
    }
  }

  // Check if URL matches known phishing domains
  async checkKnownPhishingDomains(domain) {
    const isKnown = this.phishingDomains.includes(domain);
    return {
      method: 'knownDomains',
      isPhishing: isKnown,
      confidence: isKnown ? 0.95 : 0.1,
      reason: isKnown ? 'Known phishing domain' : 'Not in known phishing domains',
      details: { domain }
    };
  }

  // Check for typosquatting against popular domains
  async checkTyposquatting(domain) {
    for (const popularDomain of this.popularDomains) {
      const distance = this.levenshteinDistance(domain, popularDomain);
      const similarity = 1 - (distance / Math.max(domain.length, popularDomain.length));
      
      // Check for character substitution (0 for o, 1 for l, etc.)
      const hasCharacterSubstitution = this.checkCharacterSubstitution(domain, popularDomain);
      
      if (distance <= this.config.phishing.typosquattingDistance && domain !== popularDomain) {
        return {
          method: 'typosquatting',
          isPhishing: true,
          confidence: Math.min(0.9, 0.5 + similarity * 0.4),
          reason: `Possible typosquatting of ${popularDomain}`,
          details: { 
            targetDomain: popularDomain, 
            distance, 
            similarity: Math.round(similarity * 100),
            hasCharacterSubstitution
          }
        };
      }
      
      if (hasCharacterSubstitution) {
        return {
          method: 'typosquatting',
          isPhishing: true,
          confidence: 0.8,
          reason: `Character substitution attack on ${popularDomain}`,
          details: { targetDomain: popularDomain, hasCharacterSubstitution: true }
        };
      }
    }

    return {
      method: 'typosquatting',
      isPhishing: false,
      confidence: 0.2,
      reason: 'No typosquatting detected'
    };
  }

  // Check for suspicious URL patterns
  async checkSuspiciousPatterns(url) {
    const suspiciousCount = this.patterns.suspiciousUrlPatterns.reduce((count, pattern) => {
      return count + (pattern.test(url) ? 1 : 0);
    }, 0);

    if (suspiciousCount > 0) {
      const confidence = Math.min(0.8, 0.3 + (suspiciousCount * 0.2));
      return {
        method: 'suspiciousPatterns',
        isPhishing: true,
        confidence,
        reason: `Suspicious URL patterns detected (${suspiciousCount} matches)`,
        details: { patternMatches: suspiciousCount }
      };
    }

    return {
      method: 'suspiciousPatterns',
      isPhishing: false,
      confidence: 0.1,
      reason: 'No suspicious patterns detected'
    };
  }

  // Check domain age (placeholder - would require external API)
  async checkDomainAge(domain) {
    // This would typically query a WHOIS API or domain age service
    // For now, we'll use heuristics based on domain structure
    
    const hasNumbers = /\d/.test(domain);
    const hasHyphens = domain.includes('-');
    const isLongDomain = domain.length > 20;
    const hasMultipleSubdomains = (domain.match(/\./g) || []).length > 2;

    let suspiciousFactors = 0;
    if (hasNumbers) suspiciousFactors++;
    if (hasHyphens) suspiciousFactors++;
    if (isLongDomain) suspiciousFactors++;
    if (hasMultipleSubdomains) suspiciousFactors++;

    const confidence = suspiciousFactors > 2 ? 0.6 : 0.2;
    
    return {
      method: 'domainAge',
      isPhishing: suspiciousFactors > 2,
      confidence,
      reason: suspiciousFactors > 2 ? 'Domain has suspicious characteristics' : 'Domain appears normal',
      details: { 
        suspiciousFactors,
        hasNumbers,
        hasHyphens,
        isLongDomain,
        hasMultipleSubdomains
      }
    };
  }

  // Check SSL certificate (basic check)
  async checkSSLCertificate(url) {
    const isHttps = url.startsWith('https://');
    
    return {
      method: 'sslCertificate',
      isPhishing: !isHttps,
      confidence: isHttps ? 0.1 : 0.4,
      reason: isHttps ? 'HTTPS connection' : 'Insecure HTTP connection',
      details: { isHttps }
    };
  }

  // Content analysis for pages
  analyzePageContent(content, url) {
    try {
      const lowerContent = content.toLowerCase();
      let indicators = [];
      let totalScore = 0;

      // Check for urgency keywords
      const urgencyMatches = this.patterns.urgencyKeywords.filter(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      );
      if (urgencyMatches.length > 0) {
        const score = Math.min(0.4, urgencyMatches.length * 0.1);
        totalScore += score;
        indicators.push({
          type: 'urgency',
          keywords: urgencyMatches,
          score
        });
      }

      // Check for security keywords
      const securityMatches = this.patterns.securityKeywords.filter(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      );
      if (securityMatches.length > 0) {
        const score = Math.min(0.3, securityMatches.length * 0.1);
        totalScore += score;
        indicators.push({
          type: 'security',
          keywords: securityMatches,
          score
        });
      }

      // Check for financial keywords
      const financialMatches = this.patterns.financialKeywords.filter(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      );
      if (financialMatches.length > 0) {
        const score = Math.min(0.3, financialMatches.length * 0.1);
        totalScore += score;
        indicators.push({
          type: 'financial',
          keywords: financialMatches,
          score
        });
      }

      // Check for multiple login forms
      const loginFormCount = (content.match(/type=["']password["']/gi) || []).length;
      if (loginFormCount > 1) {
        totalScore += 0.3;
        indicators.push({
          type: 'multipleForms',
          count: loginFormCount,
          score: 0.3
        });
      }

      const isPhishing = totalScore >= 0.5;
      const confidence = Math.min(0.9, totalScore);

      return {
        isPhishing,
        confidence,
        reason: indicators.length > 0 ? `Content analysis: ${indicators.map(i => i.type).join(', ')}` : 'No suspicious content detected',
        details: { indicators, totalScore }
      };
    } catch (error) {
      console.error('PhishGuard: Error analyzing page content:', error);
      return {
        isPhishing: false,
        confidence: 0,
        reason: 'Content analysis error'
      };
    }
  }

  // Helper methods
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.toLowerCase();
    } catch (error) {
      return null;
    }
  }

  shouldSkipAnalysis(url) {
    const skipPatterns = [
      /^chrome:/i,
      /^chrome-extension:/i,
      /^moz-extension:/i,
      /^about:/i,
      /^file:/i,
      /^data:/i,
      /^blob:/i
    ];

    return skipPatterns.some(pattern => pattern.test(url));
  }

  checkCharacterSubstitution(domain, target) {
    const substitutions = {
      '0': 'o',
      '1': 'l',
      '3': 'e',
      '5': 's',
      '6': 'g',
      '7': 't',
      '8': 'b',
      '9': 'g',
      'vv': 'w',
      'rn': 'm'
    };

    // Check if domain is similar to target with character substitutions
    let normalizedDomain = domain;
    let substitutionCount = 0;

    for (const [fake, real] of Object.entries(substitutions)) {
      if (normalizedDomain.includes(fake)) {
        normalizedDomain = normalizedDomain.replace(new RegExp(fake, 'g'), real);
        substitutionCount++;
      }
    }

    return normalizedDomain === target && substitutionCount > 0;
  }

  levenshteinDistance(a, b) {
    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  aggregateResults(results, url, domain) {
    let maxConfidence = 0;
    let isPhishing = false;
    let primaryReason = 'No phishing indicators detected';
    let allReasons = [];
    let detectionMethods = [];

    // Process each detection method result
    results.forEach(result => {
      if (result.confidence > maxConfidence) {
        maxConfidence = result.confidence;
        primaryReason = result.reason;
      }

      if (result.isPhishing) {
        isPhishing = true;
        allReasons.push(result.reason);
        detectionMethods.push({
          method: result.method,
          confidence: result.confidence,
          details: result.details
        });
      }
    });

    // Override if confidence is below threshold
    if (maxConfidence < this.confidenceThreshold) {
      isPhishing = false;
    }

    // Check for debug simulation
    if (this.config.debug.simulatePhishingSites.includes(url)) {
      isPhishing = true;
      maxConfidence = 0.95;
      primaryReason = 'Debug simulation - treated as phishing';
    }

    return this.createAnalysisResult(
      isPhishing,
      maxConfidence,
      primaryReason,
      {
        url,
        domain,
        allReasons,
        detectionMethods,
        threshold: this.confidenceThreshold
      }
    );
  }

  createAnalysisResult(isPhishing, confidence, reason, details = {}) {
    return {
      isPhishing: Boolean(isPhishing),
      confidence: Math.max(0, Math.min(1, confidence)),
      reason: String(reason),
      timestamp: new Date().toISOString(),
      details
    };
  }

  // Batch analysis for multiple URLs
  async analyzeUrls(urls) {
    try {
      const analyses = await Promise.all(
        urls.map(url => this.analyzeUrl(url))
      );

      return urls.map((url, index) => ({
        url,
        analysis: analyses[index]
      }));
    } catch (error) {
      console.error('PhishGuard: Error in batch URL analysis:', error);
      return urls.map(url => ({
        url,
        analysis: this.createAnalysisResult(false, 0, 'Batch analysis error')
      }));
    }
  }

  // Get detection statistics
  async getDetectionStats() {
    try {
      const stats = await this.storage.getUserStats();
      const phishingDomains = await this.storage.getPhishingDomains();

      return {
        phishingSitesBlocked: stats.phishingSitesBlocked,
        knownPhishingDomains: phishingDomains.length,
        lastDatabaseUpdate: stats.lastDatabaseUpdate || null,
        detectionMethods: {
          knownDomains: { enabled: true, weight: 0.95 },
          typosquatting: { enabled: true, weight: 0.8 },
          suspiciousPatterns: { enabled: true, weight: 0.6 },
          domainAge: { enabled: true, weight: 0.4 },
          sslCertificate: { enabled: true, weight: 0.3 }
        }
      };
    } catch (error) {
      console.error('PhishGuard: Error getting detection stats:', error);
      return null;
    }
  }

  // Update detection settings
  updateSettings(newSettings) {
    try {
      if (newSettings.confidenceThreshold !== undefined) {
        this.confidenceThreshold = Math.max(0, Math.min(1, newSettings.confidenceThreshold));
      }

      if (newSettings.debug !== undefined) {
        this.config.debug = { ...this.config.debug, ...newSettings.debug };
      }

      if (this.config.debug.enabled) {
        console.log('PhishGuard: Detection settings updated:', newSettings);
      }

      return true;
    } catch (error) {
      console.error('PhishGuard: Error updating detection settings:', error);
      return false;
    }
  }

  // Manual domain reporting
  async reportPhishingDomain(domain, reportedBy = 'user') {
    try {
      if (!domain || typeof domain !== 'string') {
        return false;
      }

      const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
      
      if (!this.phishingDomains.includes(cleanDomain)) {
        this.phishingDomains.push(cleanDomain);
        await this.storage.savePhishingDomains(this.phishingDomains);
        
        console.log(`PhishGuard: Added reported phishing domain: ${cleanDomain}`);
        return true;
      }

      return false; // Already in list
    } catch (error) {
      console.error('PhishGuard: Error reporting phishing domain:', error);
      return false;
    }
  }

  // Whitelist management
  async addToWhitelist(domain) {
    try {
      // Implementation for whitelisting trusted domains
      // This would prevent false positives for known safe sites
      const whitelist = await this.storage.getWhitelist() || [];
      
      if (!whitelist.includes(domain)) {
        whitelist.push(domain);
        await this.storage.saveWhitelist(whitelist);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PhishGuard: Error adding to whitelist:', error);
      return false;
    }
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhishingDetector;
} else if (typeof window !== 'undefined') {
  window.PhishingDetector = PhishingDetector;
}

export default PhishingDetector;