// Mock TrainingSimulation Entity
class TrainingSimulation {
  static mockData = [
    {
      id: 1,
      simulation_type: 'email_phishing',
      difficulty_level: 'easy',
      scenario_title: 'Fake PayPal Security Alert',
      scenario_description: 'You received a suspicious email claiming to be from PayPal.',
      content: 'Your PayPal account has been compromised. Click here to secure your account immediately.',
      correct_action: 'Block and report as phishing',
      threat_indicators: ['Urgent language', 'Suspicious sender', 'Generic greeting'],
      user_action: 'Block and Report',
      success: true,
      response_time: 8.5,
      feedback_given: 'Excellent! You correctly identified this as a phishing attempt.',
      learning_points: ['Always verify sender authenticity', 'Be suspicious of urgent requests'],
      created_by: 'john.doe@company.com',
      created_date: '2024-05-28T14:30:00Z'
    },
    {
      id: 2,
      simulation_type: 'fake_website',
      difficulty_level: 'medium',
      scenario_title: 'Fake Netflix Login Page',
      scenario_description: 'You were redirected to what appears to be a Netflix login page.',
      content: 'This is a fake Netflix login page designed to steal credentials. URL: netfliix-login.com',
      correct_action: 'Do not enter credentials. Check the URL carefully.',
      threat_indicators: ['Misspelled domain', 'Poor page quality', 'No HTTPS'],
      user_action: 'Click Link',
      success: false,
      response_time: 12.3,
      feedback_given: 'This was a phishing attempt. Always check URLs carefully before entering credentials.',
      learning_points: ['Verify URL spelling', 'Look for HTTPS', 'Check page quality'],
      created_by: 'john.doe@company.com',
      created_date: '2024-05-27T16:45:00Z'
    },
    {
      id: 3,
      simulation_type: 'social_engineering',
      difficulty_level: 'hard',
      scenario_title: 'IT Support Impersonation',
      scenario_description: 'Someone claiming to be from IT support called asking for your password.',
      content: 'Hi, this is John from IT. We need to verify your account password for a security update.',
      correct_action: 'Verify through official channels before providing any information.',
      threat_indicators: ['Unsolicited contact', 'Password request', 'Pressure tactics'],
      user_action: 'Verify Through Official Channels',
      success: true,
      response_time: 45.2,
      feedback_given: 'Great job! You correctly verified before sharing sensitive information.',
      learning_points: ['Never give passwords over phone', 'Verify caller identity', 'Use official channels'],
      created_by: 'john.doe@company.com',
      created_date: '2024-05-26T10:15:00Z'
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
    if (criteria.simulation_type) {
      results = results.filter(item => item.simulation_type === criteria.simulation_type);
    }
    if (criteria.difficulty_level) {
      results = results.filter(item => item.difficulty_level === criteria.difficulty_level);
    }
    if (criteria.success !== undefined) {
      results = results.filter(item => item.success === criteria.success);
    }
    
    // Apply ordering
    if (orderBy) {
      const [field, direction] = orderBy.startsWith('-') 
        ? [orderBy.slice(1), 'desc'] 
        : [orderBy, 'asc'];
      
      results.sort((a, b) => {
        if (field === 'created_date') {
          if (direction === 'desc') {
            return new Date(b[field]) - new Date(a[field]);
          }
          return new Date(a[field]) - new Date(b[field]);
        }
        
        // For other fields, do string comparison
        if (direction === 'desc') {
          return b[field] > a[field] ? 1 : -1;
        }
        return a[field] > b[field] ? 1 : -1;
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
      throw new Error('TrainingSimulation not found');
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
    this.mockData.unshift(newItem); // Add to beginning for recent first
    return newItem;
  }

  static async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.mockData.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('TrainingSimulation not found');
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
      throw new Error('TrainingSimulation not found');
    }
    
    this.mockData.splice(index, 1);
    return { success: true };
  }

  static generateScenario(difficulty = 'medium') {
    const scenarios = {
      easy: [
        {
          type: 'email_phishing',
          title: 'Suspicious Bank Email',
          description: 'You received an email claiming to be from your bank asking you to verify your account.',
          content: 'Dear Customer, We have detected unusual activity on your account. Please click here to verify your identity immediately: http://secure-bank-verify.com/login',
          correct_action: 'Do not click the link. Contact the bank directly.',
          indicators: ['Suspicious URL', 'Urgent language', 'Generic greeting']
        },
        {
          type: 'fake_website',
          title: 'Suspicious Download Site',
          description: 'You found a website offering free software downloads.',
          content: 'Download premium software for free! Click here to get started: free-software-downloads.net',
          correct_action: 'Do not download. Use official sources only.',
          indicators: ['Too good to be true', 'Suspicious domain', 'No official affiliation']
        }
      ],
      medium: [
        {
          type: 'fake_website',
          title: 'Fake Microsoft Login',
          description: 'You were redirected to what appears to be a Microsoft login page.',
          content: 'Microsoft Office 365 Login - URL: microsoff-office365.net/login',
          correct_action: 'Do not enter credentials. Check the URL carefully.',
          indicators: ['Misspelled domain', 'No HTTPS', 'Poor page quality']
        },
        {
          type: 'email_phishing',
          title: 'Fake Security Alert',
          description: 'You received a security alert email from your email provider.',
          content: 'Security Alert: Suspicious login detected. Secure your account now: gmail-security-check.net',
          correct_action: 'Verify through official channels.',
          indicators: ['Fake domain', 'Urgent tone', 'Suspicious link']
        }
      ],
      hard: [
        {
          type: 'social_engineering',
          title: 'CEO Impersonation',
          description: 'You received an urgent email from someone claiming to be your CEO.',
          content: 'From: CEO@company.com\nSubject: URGENT - Confidential Wire Transfer\n\nI need you to process an immediate wire transfer for $50,000 for a confidential acquisition.',
          correct_action: 'Verify through official channels before taking action.',
          indicators: ['Urgency tactics', 'Request for money', 'Bypassing procedures']
        },
        {
          type: 'advanced_phishing',
          title: 'Sophisticated Spear Phishing',
          description: 'You received a personalized email that appears to be from a colleague.',
          content: 'Hi! I found this document that might interest you for the Johnson project. Can you review it? [attachment: project_analysis.pdf.exe]',
          correct_action: 'Verify with colleague before opening attachment.',
          indicators: ['Double extension', 'Personalized content', 'Suspicious attachment']
        }
      ]
    };

    const difficultyScenarios = scenarios[difficulty] || scenarios.medium;
    return difficultyScenarios[Math.floor(Math.random() * difficultyScenarios.length)];
  }
}

export { TrainingSimulation };