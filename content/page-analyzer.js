// PhishGuard Page Analyzer
// Analyzes page content for phishing indicators and security issues

class PageAnalyzer {
  constructor() {
    this.analysisResults = [];
    this.observer = null;
    this.isAnalyzing = false;
  }

  // Initialize the page analyzer
  initialize() {
    try {
      this.analyzeCurrentPage();
      this.setupMutationObserver();
      console.log('PhishGuard: Page analyzer initialized');
      return true;
    } catch (error) {
      console.error('PhishGuard: Failed to initialize page analyzer:', error);
      return false;
    }
  }

  // Analyze the current page content
  analyzeCurrentPage() {
    if (this.isAnalyzing) return;
    
    this.isAnalyzing = true;
    this.analysisResults = [];

    try {
      // Analyze different aspects of the page
      this.analyzeLoginForms();
      this.analyzePageContent();
      this.analyzeURLStructure();
      this.analyzeSSLStatus();
      this.analyzeDOMStructure();

      // Report findings to background script
      this.reportFindings();

    } catch (error) {
      console.error('PhishGuard: Error during page analysis:', error);
    } finally {
      this.isAnalyzing = false;
    }
  }

  // Analyze login forms for security issues
  analyzeLoginForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach((form, index) => {
      const passwordFields = form.querySelectorAll('input[type="password"]');
      const emailFields = form.querySelectorAll('input[type="email"], input[name*="email"], input[id*="email"], input[placeholder*="email" i]');
      const usernameFields = form.querySelectorAll('input[type="text"][name*="user"], input[type="text"][id*="user"], input[placeholder*="username" i]');

      // Check if this is a login form
      if (passwordFields.length > 0 && (emailFields.length > 0 || usernameFields.length > 0)) {
        this.analyzeLoginForm(form, index);
      }
    });
  }

  // Analyze individual login form
  analyzeLoginForm(form, index) {
    const issues = [];
    const formData = {
      index,
      action: form.getAttribute('action'),
      method: form.getAttribute('method') || 'GET',
      hasSSL: window.location.protocol === 'https:',
      fieldCount: form.querySelectorAll('input').length
    };

    // Check form action security
    const action = form.getAttribute('action');
    if (action) {
      try {
        const actionUrl = new URL(action, window.location.href);
        
        // Check if form submits over HTTP
        if (actionUrl.protocol === 'http:') {
          issues.push({
            type: 'insecure_submission',
            severity: 'high',
            message: 'Login form submits credentials over insecure HTTP'
          });
        }

        // Check if form submits to different domain
        if (actionUrl.hostname !== window.location.hostname) {
          issues.push({
            type: 'cross_domain_submission',
            severity: 'high',
            message: `Login form submits to different domain: ${actionUrl.hostname}`
          });
        }

        // Check for suspicious domains in action
        if (this.isSuspiciousDomain(actionUrl.hostname)) {
          issues.push({
            type: 'suspicious_action_domain',
            severity: 'high',
            message: `Form action points to suspicious domain: ${actionUrl.hostname}`
          });
        }

      } catch (e) {
        // Invalid URL in action
        issues.push({
          type: 'invalid_action_url',
          severity: 'medium',
          message: 'Form has invalid action URL'
        });
      }
    }

    // Check for multiple password fields (unusual)
    const passwordFields = form.querySelectorAll('input[type="password"]');
    if (passwordFields.length > 2) {
      issues.push({
        type: 'multiple_password_fields',
        severity: 'medium',
        message: `Form has ${passwordFields.length} password fields (unusual for login)`
      });
    }

    // Check for hidden fields with suspicious names
    const hiddenFields = form.querySelectorAll('input[type="hidden"]');
    hiddenFields.forEach(field => {
      const name = field.name.toLowerCase();
      const suspiciousNames = ['token', 'session', 'auth', 'key', 'secret'];
      if (suspiciousNames.some(suspicious => name.includes(suspicious))) {
        issues.push({
          type: 'suspicious_hidden_field',
          severity: 'low',
          message: `Hidden field with suspicious name: ${field.name}`
        });
      }
    });

    // Store results if issues found
    if (issues.length > 0) {
      this.analysisResults.push({
        type: 'login_form_analysis',
        formData,
        issues,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Analyze page content for phishing indicators
  analyzePageContent() {
    const pageText = document.body.innerText.toLowerCase();
    const pageHTML = document.body.innerHTML.toLowerCase();
    const issues = [];

    // Check for urgency keywords
    const urgencyKeywords = [
      'urgent', 'immediately', 'alert', 'warning', 'limited time',
      'account suspended', 'unauthorized', 'suspicious activity',
      'expire', 'deadline', 'final notice', 'act now', 'click here now',
      'verify now', 'update immediately', 'secure your account now'
    ];

    const foundUrgencyKeywords = urgencyKeywords.filter(keyword => 
      pageText.includes(keyword)
    );

    if (foundUrgencyKeywords.length > 2) {
      issues.push({
        type: 'urgency_language',
        severity: 'medium',
        message: `Page contains multiple urgency keywords: ${foundUrgencyKeywords.slice(0, 3).join(', ')}`,
        details: { keywords: foundUrgencyKeywords }
      });
    }

    // Check for security claim keywords
    const securityKeywords = [
      'verify your account', 'confirm your identity', 'security check',
      'secure your account', 'update your information', 'validation required',
      'unusual activity', 'login attempt', 'security alert', 'account locked',
      'suspicious login', 'verify identity', 'confirm ownership'
    ];

    const foundSecurityKeywords = securityKeywords.filter(keyword => 
      pageText.includes(keyword)
    );

    if (foundSecurityKeywords.length > 1) {
      issues.push({
        type: 'security_claims',
        severity: 'medium',
        message: `Page makes multiple security claims: ${foundSecurityKeywords.slice(0, 2).join(', ')}`,
        details: { keywords: foundSecurityKeywords }
      });
    }

    // Check for financial bait keywords
    const financialKeywords = [
      'you won', 'congratulations', 'claim your prize', 'free offer',
      'lottery', 'winner', 'reward', 'gift card', 'discount',
      'refund', 'tax return', 'inheritance', 'million dollars',
      'cash prize', 'free money', 'claim now', 'limited offer'
    ];

    const foundFinancialKeywords = financialKeywords.filter(keyword => 
      pageText.includes(keyword)
    );

    if (foundFinancialKeywords.length > 1) {
      issues.push({
        type: 'financial_bait',
        severity: 'medium',
        message: `Page contains financial bait language: ${foundFinancialKeywords.slice(0, 2).join(', ')}`,
        details: { keywords: foundFinancialKeywords }
      });
    }

    // Check for fake countdown timers
    const countdownElements = document.querySelectorAll('[id*="countdown"], [class*="countdown"], [id*="timer"], [class*="timer"]');
    if (countdownElements.length > 0) {
      issues.push({
        type: 'countdown_pressure',
        severity: 'low',
        message: 'Page contains countdown timer elements (often used to create pressure)',
        details: { count: countdownElements.length }
      });
    }

    // Check for excessive exclamation marks
    const exclamationCount = (pageText.match(/!/g) || []).length;
    if (exclamationCount > 10) {
      issues.push({
        type: 'excessive_exclamation',
        severity: 'low',
        message: `Page contains ${exclamationCount} exclamation marks (may indicate emotional manipulation)`
      });
    }

    // Check for all caps text (shouting)
    const allCapsText = pageText.match(/\b[A-Z]{4,}\b/g) || [];
    if (allCapsText.length > 5) {
      issues.push({
        type: 'excessive_caps',
        severity: 'low',
        message: `Page contains excessive capitalized text: ${allCapsText.slice(0, 3).join(', ')}`
      });
    }

    // Store results if issues found
    if (issues.length > 0) {
      this.analysisResults.push({
        type: 'content_analysis',
        issues,
        timestamp: new Date().toISOString(),
        stats: {
          urgencyKeywords: foundUrgencyKeywords.length,
          securityKeywords: foundSecurityKeywords.length,
          financialKeywords: foundFinancialKeywords.length,
          exclamationMarks: exclamationCount,
          capsWords: allCapsText.length
        }
      });
    }
  }

  // Analyze URL structure for suspicious patterns
  analyzeURLStructure() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    const issues = [];

    // Check for suspicious URL patterns
    const suspiciousPatterns = [
      { pattern: /secure.*login/i, message: 'URL contains "secure" and "login" - often used in phishing' },
      { pattern: /verify.*account/i, message: 'URL contains "verify" and "account" - common phishing pattern' },
      { pattern: /update.*payment/i, message: 'URL contains "update" and "payment" - suspicious pattern' },
      { pattern: /confirm.*identity/i, message: 'URL contains "confirm" and "identity" - phishing indicator' },
      { pattern: /urgent.*action/i, message: 'URL contains "urgent" and "action" - pressure tactic' }
    ];

    suspiciousPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(url)) {
        issues.push({
          type: 'suspicious_url_pattern',
          severity: 'medium',
          message,
          details: { pattern: pattern.source }
        });
      }
    });

    // Check for long URLs (often used to hide suspicious parts)
    if (url.length > 150) {
      issues.push({
        type: 'unusually_long_url',
        severity: 'low',
        message: `URL is unusually long (${url.length} characters)`,
        details: { length: url.length }
      });
    }

    // Check for multiple subdomains (potential subdomain spoofing)
    const subdomainCount = (hostname.match(/\./g) || []).length;
    if (subdomainCount > 3) {
      issues.push({
        type: 'excessive_subdomains',
        severity: 'medium',
        message: `Domain has ${subdomainCount} levels (may indicate subdomain spoofing)`,
        details: { subdomainCount }
      });
    }

    // Check for IP addresses instead of domain names
    const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      issues.push({
        type: 'ip_address_hostname',
        severity: 'high',
        message: 'Site uses IP address instead of domain name - highly suspicious',
        details: { ip: hostname }
      });
    }

    // Store results if issues found
    if (issues.length > 0) {
      this.analysisResults.push({
        type: 'url_analysis',
        url,
        hostname,
        issues,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Analyze SSL/TLS status
  analyzeSSLStatus() {
    const issues = [];
    const isHTTPS = window.location.protocol === 'https:';

    if (!isHTTPS) {
      // Check if page has login forms over HTTP
      const hasLoginForm = document.querySelector('form input[type="password"]');
      if (hasLoginForm) {
        issues.push({
          type: 'http_login_form',
          severity: 'high',
          message: 'Page contains login form but uses insecure HTTP connection'
        });
      } else {
        issues.push({
          type: 'http_connection',
          severity: 'medium',
          message: 'Page uses insecure HTTP connection'
        });
      }
    }

    // Store results if issues found
    if (issues.length > 0) {
      this.analysisResults.push({
        type: 'ssl_analysis',
        protocol: window.location.protocol,
        issues,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Analyze DOM structure for suspicious elements
  analyzeDOMStructure() {
    const issues = [];

    // Check for hidden iframes (often used for malicious purposes)
    const hiddenIframes = document.querySelectorAll('iframe[style*="display:none"], iframe[style*="visibility:hidden"], iframe[width="0"], iframe[height="0"]');
    if (hiddenIframes.length > 0) {
      issues.push({
        type: 'hidden_iframes',
        severity: 'high',
        message: `Page contains ${hiddenIframes.length} hidden iframe(s) - potential security risk`,
        details: { count: hiddenIframes.length }
      });
    }

    // Check for forms with suspicious autocomplete settings
    const formsWithAutocompleteOff = document.querySelectorAll('form[autocomplete="off"]');
    if (formsWithAutocompleteOff.length > 0) {
      formsWithAutocompleteOff.forEach((form, index) => {
        const hasPasswordField = form.querySelector('input[type="password"]');
        if (hasPasswordField) {
          issues.push({
            type: 'autocomplete_disabled',
            severity: 'low',
            message: `Login form ${index + 1} has autocomplete disabled - may prevent password managers`,
            details: { formIndex: index }
          });
        }
      });
    }

    // Check for excessive external scripts
    const externalScripts = document.querySelectorAll('script[src]');
    const externalDomains = new Set();
    
    externalScripts.forEach(script => {
      try {
        const url = new URL(script.src);
        if (url.hostname !== window.location.hostname) {
          externalDomains.add(url.hostname);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });

    if (externalDomains.size > 5) {
      issues.push({
        type: 'excessive_external_scripts',
        severity: 'low',
        message: `Page loads scripts from ${externalDomains.size} external domains`,
        details: { domains: Array.from(externalDomains).slice(0, 5) }
      });
    }

    // Store results if issues found
    if (issues.length > 0) {
      this.analysisResults.push({
        type: 'dom_analysis',
        issues,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Set up mutation observer to detect dynamic content changes
  setupMutationObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      let shouldReanalyze = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if added element is significant enough to warrant re-analysis
              if (this.isSignificantElement(node)) {
                shouldReanalyze = true;
                break;
              }
            }
          }
        }
        if (shouldReanalyze) break;
      }

      if (shouldReanalyze) {
        // Debounce re-analysis to avoid excessive processing
        clearTimeout(this.reanalyzeTimeout);
        this.reanalyzeTimeout = setTimeout(() => {
          this.analyzeCurrentPage();
        }, 1000);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Check if an element is significant enough to trigger re-analysis
  isSignificantElement(element) {
    // Check for forms
    if (element.tagName === 'FORM' || element.querySelector('form')) {
      return true;
    }

    // Check for iframes
    if (element.tagName === 'IFRAME' || element.querySelector('iframe')) {
      return true;
    }

    // Check for large content additions
    if (element.textContent && element.textContent.length > 500) {
      return true;
    }

    return false;
  }

  // Check if a domain appears suspicious
  isSuspiciousDomain(domain) {
    const suspiciousPatterns = [
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
      /[0-9]+[a-z]+\.com/i, // Numbers mixed with letters
      /secure.*login/i,
      /verify.*account/i,
      /update.*payment/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(domain));
  }

  // Report findings to background script
  reportFindings() {
    if (this.analysisResults.length === 0) return;

    // Send each finding to the background script
    this.analysisResults.forEach(result => {
      result.issues.forEach(issue => {
        chrome.runtime.sendMessage({
          action: 'reportSecurityIssue',
          url: window.location.href,
          issue: issue.message,
          type: result.type,
          severity: issue.severity,
          details: issue.details
        });
      });
    });

    // Log for debugging
    console.log('PhishGuard: Page analysis complete, found', this.analysisResults.length, 'categories of issues');
  }

  // Get current analysis results
  getAnalysisResults() {
    return this.analysisResults;
  }

  // Clean up resources
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.reanalyzeTimeout) {
      clearTimeout(this.reanalyzeTimeout);
    }
  }

  // Get analysis statistics
  getAnalysisStats() {
    const stats = {
      totalIssues: 0,
      severityBreakdown: { high: 0, medium: 0, low: 0 },
      typeBreakdown: {}
    };

    this.analysisResults.forEach(result => {
      result.issues.forEach(issue => {
        stats.totalIssues++;
        stats.severityBreakdown[issue.severity]++;
        
        if (!stats.typeBreakdown[result.type]) {
          stats.typeBreakdown[result.type] = 0;
        }
        stats.typeBreakdown[result.type]++;
      });
    });

    return stats;
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.PageAnalyzer = PageAnalyzer;
}