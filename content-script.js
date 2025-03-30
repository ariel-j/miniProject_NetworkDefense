/**
 * PhishGuard - Content Script
 * Analyzes page content for phishing indicators and communicates with the background script
 */

// Extract page features for phishing analysis
function extractPageFeatures() {
  const url = window.location.href;
  const domain = window.location.hostname;
  const isHttps = window.location.protocol === 'https:';
  
  // Check for login forms
  const forms = document.querySelectorAll('form');
  const hasLoginForm = Array.from(forms).some(form => {
    const inputs = form.querySelectorAll('input');
    return Array.from(inputs).some(input => 
      input.type === 'password' || 
      input.name?.toLowerCase().includes('pass') ||
      input.id?.toLowerCase().includes('pass')
    );
  });
  
  // Check if forms submit securely
  const isFormSecure = Array.from(forms).every(form => {
    const action = form.getAttribute('action');
    return !action || action.startsWith('https://') || action.startsWith('/');
  });
  
  // Check for password fields
  const hasPasswordField = document.querySelectorAll('input[type="password"]').length > 0;
  
  // Check for common brand logos
  const imgElements = document.querySelectorAll('img');
  const containsBrandLogos = Array.from(imgElements).some(img => {
    const src = img.src.toLowerCase();
    const alt = (img.alt || '').toLowerCase();
    
    // Check for common brand names in image URLs or alt text
    const brandNames = ['paypal', 'apple', 'microsoft', 'amazon', 'facebook', 'google', 'netflix'];
    return brandNames.some(brand => src.includes(brand) || alt.includes(brand));
  });
  
  // Check if domain matches the brand displayed in the content
  const pageText = document.body.innerText.toLowerCase();
  const domainMismatch = ['paypal', 'apple', 'microsoft', 'amazon', 'facebook', 'google', 'netflix']
    .some(brand => {
      return pageText.includes(brand) && !domain.includes(brand);
    });
  
  // Check for urgency or threatening language
  const urgencyTerms = [
    'urgent', 'immediately', 'alert', 'warning', 'limited time',
    'suspended', 'verify now', 'unauthorized', 'suspicious activity'
  ];
  const urgencyContent = urgencyTerms.some(term => pageText.includes(term));
  
  // Check for cloaked links (link text doesn't match href)
  const links = document.querySelectorAll('a[href]');
  let cloakedLinks = 0;
  
  Array.from(links).forEach(link => {
    const href = link.href.toLowerCase();
    const text = link.textContent.toLowerCase();
    
    // If link text contains a domain but the href points elsewhere
    if (text.includes('.com') || text.includes('.org') || text.includes('.net')) {
      const textDomain = text.match(/[a-zA-Z0-9-]+\.(com|org|net|edu|gov)/);
      if (textDomain && !href.includes(textDomain[0])) {
        cloakedLinks++;
      }
    }
  });
  
  // Check for favicon
  const hasFavicon = document.querySelector('link[rel="icon"]') !== null;
  
  // Return all extracted features
  return {
    url,
    domain,
    isHttps,
    hasLoginForm,
    isFormSecure,
    hasPasswordField,
    containsBrandLogos,
    domainMismatch,
    urgencyContent,
    cloakedLinks,
    hasFavicon,
    passwordFieldCount: document.querySelectorAll('input[type="password"]').length,
    formCount: forms.length,
    externalLinks: Array.from(links).filter(link => {
      try {
        return new URL(link.href).hostname !== domain;
      } catch (e) {
        return false;
      }
    }).length
  };
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractFeatures') {
    const features = extractPageFeatures();
    sendResponse({ features });
    return true;
  } else if (message.action === 'simulatePhishing') {
    // Will be implemented for the training mode
    initPhishingSimulation(message.simulationType);
    sendResponse({ success: true });
    return true;
  }
});

// Initialize phishing simulation (will be expanded)
function initPhishingSimulation(simulationType) {
  console.log(`Initializing phishing simulation: ${simulationType}`);
  // This will be implemented to inject the simulation UI
}

// Send features to background script when page loads
window.addEventListener('load', () => {
  // Small delay to ensure the page is fully loaded
  setTimeout(() => {
    const features = extractPageFeatures();
    chrome.runtime.sendMessage({
      action: 'pageAnalysis',
      features
    });
  }, 1000);
});

// Monitor for dynamic changes to catch any login forms that load after initial page load
const observer = new MutationObserver(() => {
  const features = extractPageFeatures();
  chrome.runtime.sendMessage({
    action: 'pageAnalysis',
    features
  });
});

// Start observing after a short delay
setTimeout(() => {
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
}, 2000);
