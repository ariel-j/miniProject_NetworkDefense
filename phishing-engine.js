/**
 * PhishGuard - Phishing Detection Engine
 * Implements various heuristics to detect potential phishing attempts
 */

class PhishingEngine {
  constructor() {
    // Common phishing keywords
    this.suspiciousTerms = [
      'login', 'verify', 'verification', 'account', 'update', 'security',
      'password', 'confirm', 'banking', 'suspended', 'unusual', 'activity'
    ];
    
    // Well-known brands often targeted in phishing
    this.targetedBrands = [
      { name: 'paypal', domain: 'paypal.com' },
      { name: 'apple', domain: 'apple.com' },
      { name: 'microsoft', domain: 'microsoft.com' },
      { name: 'amazon', domain: 'amazon.com' },
      { name: 'facebook', domain: 'facebook.com' },
      { name: 'google', domain: 'google.com' },
      { name: 'banks', domains: ['chase.com', 'bankofamerica.com', 'wellsfargo.com'] }
    ];
    
    // Known phishing domains (would be regularly updated from a service)
    this.knownPhishingDomains = [];
    
    // Local cache for previously checked URLs
    this.urlCache = new Map();
  }

  /**
   * Main method to analyze a URL and page content
   * @param {string} url - The URL to check
   * @param {Object} pageFeatures - Features extracted from the page
   * @returns {Object} Analysis results with risk score and reasons
   */
  async analyzeUrl(url, pageFeatures = null) {
    // Check cache first
    if (this.urlCache.has(url)) {
      return this.urlCache.get(url);
    }
    
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    const results = {
      url: url,
      domain: domain,
      riskScore: 0,
      riskLevel: 'safe',
      reasons: [],
      timestamp: Date.now()
    };
    
    // 1. Check if URL is in known phishing list
    if (this.isKnownPhishingDomain(domain)) {
      results.riskScore = 100;
      results.riskLevel = 'critical';
      results.reasons.push('Domain is in known phishing list');
      this.urlCache.set(url, results);
      return results;
    }
    
    // 2. Check for lookalike domains (typosquatting)
    const lookalikeBrand = this.checkLookalikeDomain(domain);
    if (lookalikeBrand) {
      results.riskScore += 60;
      results.reasons.push(`Potential lookalike domain for ${lookalikeBrand.name}`);
    }
    
    // 3. Check URL for suspicious patterns
    const urlPatternScore = this.analyzeUrlPatterns(url);
    results.riskScore += urlPatternScore.score;
    results.reasons = results.reasons.concat(urlPatternScore.reasons);
    
    // 4. Analyze page content if available
    if (pageFeatures) {
      const contentScore = this.analyzePageContent(pageFeatures);
      results.riskScore += contentScore.score;
      results.reasons = results.reasons.concat(contentScore.reasons);
    }
    
    // Determine overall risk level
    if (results.riskScore >= 80) {
      results.riskLevel = 'critical';
    } else if (results.riskScore >= 60) {
      results.riskLevel = 'high';
    } else if (results.riskScore >= 40) {
      results.riskLevel = 'medium';
    } else if (results.riskScore >= 20) {
      results.riskLevel = 'low';
    }
    
    // Cache the result
    this.urlCache.set(url, results);
    return results;
  }
  
  /**
   * Check if domain is in the known phishing list
   * @param {string} domain 
   * @returns {boolean}
   */
  isKnownPhishingDomain(domain) {
    return this.knownPhishingDomains.includes(domain);
  }
  
  /**
   * Check if the domain is trying to look like a known brand
   * @param {string} domain 
   * @returns {Object|null} The matched brand or null
   */
  checkLookalikeDomain(domain) {
    for (const brand of this.targetedBrands) {
      // Check for the brand name in the domain
      if (domain.includes(brand.name) && domain !== brand.domain) {
        return brand;
      }
      
      // Check for typosquatting (simple version - would be enhanced in production)
      const levenshteinDistance = this.calculateLevenshteinDistance(domain, brand.domain);
      if (levenshteinDistance <= 3 && levenshteinDistance > 0) {
        return brand;
      }
    }
    return null;
  }
  
  /**
   * Analyze URL for suspicious patterns
   * @param {string} url 
   * @returns {Object} Score and reasons
   */
  analyzeUrlPatterns(url) {
    const result = { score: 0, reasons: [] };
    const urlObj = new URL(url);
    
    // Check for suspicious terms in URL
    for (const term of this.suspiciousTerms) {
      if (url.toLowerCase().includes(term)) {
        result.score += 5;
        result.reasons.push(`URL contains suspicious term: ${term}`);
        break; // Only count once
      }
    }
    
    // Check for IP address instead of domain name
    const ipAddressRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipAddressRegex.test(urlObj.hostname)) {
      result.score += 30;
      result.reasons.push('URL uses IP address instead of domain name');
    }
    
    // Check for excessive subdomains
    const subdomainCount = urlObj.hostname.split('.').length - 2;
    if (subdomainCount > 3) {
      result.score += 15;
      result.reasons.push('URL has an unusual number of subdomains');
    }
    
    // Check for HTTP instead of HTTPS
    if (urlObj.protocol === 'http:') {
      result.score += 15;
      result.reasons.push('Website uses insecure HTTP protocol');
    }
    
    // Check for suspicious TLD
    const suspiciousTLDs = ['.tk', '.top', '.xyz', '.online', '.club', '.site'];
    const domainParts = urlObj.hostname.split('.');
    const tld = '.' + domainParts[domainParts.length - 1];
    if (suspiciousTLDs.includes(tld)) {
      result.score += 10;
      result.reasons.push(`Domain uses potentially suspicious TLD: ${tld}`);
    }
    
    return result;
  }
  
  /**
   * Analyze page content for phishing indicators
   * @param {Object} pageFeatures 
   * @returns {Object} Score and reasons
   */
  analyzePageContent(pageFeatures) {
    const result = { score: 0, reasons: [] };
    
    // Check for login forms
    if (pageFeatures.hasLoginForm) {
      result.score += 10;
      
      // Check for secure form submission
      if (!pageFeatures.isFormSecure) {
        result.score += 20;
        result.reasons.push('Login form submits data insecurely');
      }
      
      // Check for password fields in an insecure page
      if (pageFeatures.hasPasswordField && !pageFeatures.isHttps) {
        result.score += 25;
        result.reasons.push('Password field present on an insecure (non-HTTPS) page');
      }
    }
    
    // Check for brand impersonation
    if (pageFeatures.containsBrandLogos && pageFeatures.domainMismatch) {
      result.score += 30;
      result.reasons.push('Page contains brand logos but domain doesn\'t match the brand');
    }
    
    // Check for suspicious content patterns
    if (pageFeatures.urgencyContent) {
      result.score += 15;
      result.reasons.push('Page contains urgent or threatening language');
    }
    
    // Check for cloaked links
    if (pageFeatures.cloakedLinks > 0) {
      result.score += 15;
      result.reasons.push('Page contains links that lead somewhere other than their text suggests');
    }
    
    return result;
  }
  
  /**
   * Update the known phishing domains list
   * In a real implementation, this would fetch from a service
   * @param {Array} domains 
   */
  updateKnownPhishingDomains(domains) {
    this.knownPhishingDomains = domains;
  }
  
  /**
   * Calculate Levenshtein distance between two strings
   * Used for detecting typosquatting domains
   * @param {string} a 
   * @param {string} b 
   * @returns {number}
   */
  calculateLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
    
    for (let i = 0; i <= a.length; i++) {
      matrix[i][0] = i;
    }
    
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost  // substitution
        );
      }
    }
    
    return matrix[a.length][b.length];
  }
}

export default PhishingEngine;
