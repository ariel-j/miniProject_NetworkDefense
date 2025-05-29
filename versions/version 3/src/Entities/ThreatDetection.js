// Mock ThreatDetection Entity
class ThreatDetection {
  static mockData = [
    {
      id: 1,
      url: 'phishing-bank.com/secure-login',
      threat_type: 'phishing',
      confidence_score: 95,
      threat_indicators: ['Suspicious domain', 'Fake SSL certificate', 'Credential harvesting'],
      user_response: 'blocked',
      is_simulation: false,
      response_time: 8.5,
      created_by: 'john.doe@company.com',
      created_date: '2024-05-29T11:34:00Z'
    },
    {
      id: 2,
      url: 'microsoft-office365-login.net',
      threat_type: 'phishing',
      confidence_score: 88,
      threat_indicators: ['Domain typosquatting', 'Fake login page', 'No proper SSL'],
      user_response: 'reported',
      is_simulation: false,
      response_time: 12.3,
      created_by: 'john.doe@company.com',
      created_date: '2024-05-29T11:34:00Z'
    },
    {
      id: 3,
      url: 'legitimate-bank.com',
      threat_type: 'safe',
      confidence_score: 98,
      threat_indicators: [],
      user_response: 'proceeded',
      is_simulation: false,
      response_time: 5.2,
      created_by: 'john.doe@company.com',
      created_date: '2024-05-29T11:34:00Z'
    },
    {
      id: 4,
      url: 'secure-update-required.org',
      threat_type: 'suspicious',
      confidence_score: 72,
      threat_indicators: ['Unusual redirect', 'Suspicious pop-ups'],
      user_response: 'blocked',
      is_simulation: false,
      response_time: 15.7,
      created_by: 'john.doe@company.com',
      created_date: '2024-05-29T11:34:00Z'
    },
    {
      id: 5,
      url: 'malware-download-site.net',
      threat_type: 'malware',
      confidence_score: 99,
      threat_indicators: ['Known malware host', 'Suspicious file downloads', 'Blacklisted domain'],
      user_response: 'blocked',
      is_simulation: false,
      response_time: 3.1,
      created_by: 'john.doe@company.com',
      created_date: '2024-05-28T15:22:00Z'
    }
  ];

  static async filter(criteria = {}, orderBy = null, limit = null) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let results = [...this.mockData];
    
    // Apply criteria filter
    if (criteria.created_by) {
      results = results.filter(item => item.created_by === criteria.created_by);
    }
    if (criteria.threat_type) {
      results = results.filter(item => item.threat_type === criteria.threat_type);
    }
    if (criteria.is_simulation !== undefined) {
      results = results.filter(item => item.is_simulation === criteria.is_simulation);
    }
    
    // Apply ordering
    if (orderBy) {
      const [field, direction] = orderBy.startsWith('-') 
        ? [orderBy.slice(1), 'desc'] 
        : [orderBy, 'asc'];
      
      results.sort((a, b) => {
        if (direction === 'desc') {
          return new Date(b[field]) - new Date(a[field]);
        }
        return new Date(a[field]) - new Date(b[field]);
      });
    }
    
    // Apply limit
    if (limit) {
      results = results.slice(0, limit);
    }
    
    return results;
  }

  static async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const item = this.mockData.find(item => item.id === id);
    if (!item) {
      throw new Error('ThreatDetection not found');
    }
    return { ...item };
  }

  static async create(data) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newItem = {
      id: Date.now(),
      ...data,
      created_by: data.created_by || 'john.doe@company.com',
      created_date: new Date().toISOString()
    };
    this.mockData.push(newItem);
    return newItem;
  }

  static async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.mockData.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('ThreatDetection not found');
    }
    
    this.mockData[index] = {
      ...this.mockData[index],
      ...updates,
      updated_date: new Date().toISOString()
    };
    
    return { ...this.mockData[index] };
  }

  static async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.mockData.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('ThreatDetection not found');
    }
    
    this.mockData.splice(index, 1);
    return { success: true };
  }

  static async generateMockThreat() {
    const threatTypes = ['phishing', 'malware', 'suspicious', 'safe'];
    const urls = [
      'suspicious-bank-login.net',
      'fake-microsoft-office.com',
      'malware-download.org',
      'phishing-paypal.net',
      'legitimate-google.com'
    ];
    
    const mockThreat = {
      url: urls[Math.floor(Math.random() * urls.length)],
      threat_type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
      confidence_score: Math.floor(Math.random() * 40) + 60, // 60-100
      threat_indicators: ['Suspicious domain', 'Fake SSL certificate', 'Credential harvesting'].slice(0, Math.floor(Math.random() * 3) + 1),
      user_response: null,
      is_simulation: true,
      response_time: null
    };
    
    return await this.create(mockThreat);
  }
}

export { ThreatDetection };