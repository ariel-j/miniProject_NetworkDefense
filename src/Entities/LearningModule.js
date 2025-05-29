// Mock LearningModule Entity
class LearningModule {
  static mockData = [
    {
      id: 1,
      title: 'Introduction to Phishing',
      category: 'basics',
      difficulty: 'beginner',
      content: `# Introduction to Phishing

## What is Phishing?

Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information like passwords, credit card numbers, or personal data. These attacks typically come through email, text messages, or phone calls.

## How Phishing Works

1. **Deception**: Attackers create fake communications that appear to come from trusted sources
2. **Urgency**: They create false sense of urgency to pressure victims into quick actions
3. **Information Theft**: Once victims provide information, attackers use it for malicious purposes

## Common Types of Phishing

- **Email Phishing**: Fraudulent emails asking for personal information
- **Spear Phishing**: Targeted attacks against specific individuals or organizations
- **Smishing**: Phishing via SMS text messages
- **Vishing**: Voice phishing through phone calls

## Red Flags to Watch For

- Generic greetings like "Dear Customer"
- Urgent language demanding immediate action
- Suspicious email addresses or domains
- Requests for personal or financial information
- Poor grammar or spelling mistakes
- Threatening consequences for not responding

## Protection Strategies

1. Always verify the sender through official channels
2. Never click suspicious links or download unexpected attachments
3. Keep software and security systems updated
4. Use multi-factor authentication when available
5. Report suspected phishing attempts to your IT department`,
      key_points: [
        'Phishing attacks impersonate trusted organizations to steal information',
        'Attackers use urgency and fear tactics to pressure victims',
        'Always verify suspicious communications through official channels',
        'Look for red flags like generic greetings and urgent language',
        'Use multi-factor authentication and keep systems updated',
        'Report suspicious communications to your IT department'
      ],
      quiz_questions: [
        {
          question: 'What is the primary goal of phishing attacks?',
          options: [
            'To damage computer systems',
            'To steal sensitive information like passwords and personal data',
            'To send spam emails',
            'To slow down internet connections'
          ],
          correct_answer: 1,
          explanation: 'Phishing attacks are designed to steal sensitive information by impersonating trusted organizations.'
        },
        {
          question: 'Which of these is a common red flag of phishing emails?',
          options: [
            'Personalized greeting with your name',
            'Professional email signature',
            'Generic greeting like "Dear Customer"',
            'Clear company logo'
          ],
          correct_answer: 2,
          explanation: 'Generic greetings are common in phishing emails because attackers often send mass emails without knowing recipients\' names.'
        },
        {
          question: 'What should you do if you receive a suspicious email asking for your password?',
          options: [
            'Reply with your password immediately',
            'Click the link to verify your account',
            'Verify through official channels before responding',
            'Forward it to all your contacts'
          ],
          correct_answer: 2,
          explanation: 'Always verify suspicious requests through official channels like calling the organization directly.'
        }
      ],
      completion_time: 15,
      is_published: true,
      created_date: '2024-05-01T10:00:00Z'
    },
    {
      id: 2,
      title: 'Email Security Best Practices',
      category: 'email_security',
      difficulty: 'intermediate',
      content: `# Email Security Best Practices

## Understanding Email Threats

Email remains one of the most common attack vectors for cybercriminals. Understanding how to secure your email communication is crucial for personal and organizational security.

## Email Authentication

### SPF (Sender Policy Framework)
- Prevents email spoofing by verifying sender IP addresses
- Organizations publish SPF records in DNS
- Helps identify legitimate vs. fraudulent emails

### DKIM (DomainKeys Identified Mail)
- Uses cryptographic signatures to verify email authenticity
- Ensures email content hasn't been tampered with
- Provides non-repudiation for email communications

### DMARC (Domain-based Message Authentication)
- Builds on SPF and DKIM for comprehensive protection
- Provides policy instructions for handling failed authentication
- Enables reporting on email authentication results

## Safe Email Practices

### Before Opening Emails
1. Check the sender's email address carefully
2. Look for misspellings in domain names
3. Be suspicious of unexpected attachments
4. Verify urgent requests through other channels

### When Reading Emails
1. Don't click suspicious links immediately
2. Hover over links to see actual destinations
3. Be wary of emails requesting personal information
4. Look for poor grammar or spelling mistakes

### Handling Attachments
1. Only open attachments from trusted sources
2. Scan attachments with antivirus software
3. Be cautious of executable files (.exe, .scr, .bat)
4. Verify unexpected attachments with the sender

## Advanced Security Measures

### Email Encryption
- **End-to-End Encryption**: Ensures only intended recipients can read messages
- **S/MIME**: Standard for encrypting and digitally signing email
- **PGP/GPG**: Popular encryption tools for secure communication

### Email Filtering
- **Spam Filters**: Automatically detect and quarantine unwanted emails
- **Content Filtering**: Block emails containing specific keywords or patterns
- **Attachment Filtering**: Prevent dangerous file types from reaching users

### Multi-Factor Authentication
- Adds extra security layer beyond passwords
- Common methods: SMS codes, authenticator apps, hardware tokens
- Significantly reduces risk of account compromise

## Organizational Email Security

### Email Policies
1. Define acceptable use guidelines
2. Establish incident reporting procedures
3. Regular security awareness training
4. Clear consequences for policy violations

### Technical Controls
1. Email gateway security solutions
2. Data Loss Prevention (DLP) systems
3. Email archiving and retention policies
4. Regular security audits and assessments

## Response to Email Security Incidents

### If You Suspect Phishing
1. Do not click any links or download attachments
2. Report the email to your IT security team
3. Delete the email after reporting
4. Change passwords if you may have been compromised

### If You've Been Compromised
1. Immediately change all passwords
2. Enable multi-factor authentication
3. Check for unauthorized account activities
4. Report the incident to relevant authorities

## Emerging Email Threats

### Business Email Compromise (BEC)
- Sophisticated attacks targeting businesses
- Often involve CEO fraud or vendor impersonation
- Require careful verification of financial requests

### AI-Powered Attacks
- Machine learning used to create convincing phishing emails
- Personalized attacks based on social media data
- Increased sophistication in language and targeting`,
      key_points: [
        'Email authentication (SPF, DKIM, DMARC) helps verify legitimate emails',
        'Always verify suspicious emails through alternative channels',
        'Use email encryption for sensitive communications',
        'Implement multi-factor authentication for email accounts',
        'Be cautious with attachments, especially executable files',
        'Report suspected phishing attempts immediately',
        'Keep email security software updated and configured properly'
      ],
      quiz_questions: [
        {
          question: 'Which email authentication method uses cryptographic signatures?',
          options: ['SPF', 'DKIM', 'DMARC', 'SMTP'],
          correct_answer: 1,
          explanation: 'DKIM (DomainKeys Identified Mail) uses cryptographic signatures to verify email authenticity and ensure content integrity.'
        },
        {
          question: 'What should you do before opening an unexpected attachment?',
          options: [
            'Open it immediately to see what it contains',
            'Verify with the sender through another communication method',
            'Forward it to colleagues for their opinion',
            'Save it to your desktop for later'
          ],
          correct_answer: 1,
          explanation: 'Always verify unexpected attachments with the sender through a different communication method to ensure authenticity.'
        },
        {
          question: 'What is Business Email Compromise (BEC)?',
          options: [
            'A technical email server failure',
            'Sophisticated attacks targeting businesses often involving CEO fraud',
            'A type of spam email filter',
            'An email encryption standard'
          ],
          correct_answer: 1,
          explanation: 'BEC is a sophisticated cybercrime where attackers impersonate executives or vendors to trick employees into transferring money or revealing information.'
        }
      ],
      completion_time: 25,
      is_published: true,
      created_date: '2024-05-02T10:00:00Z'
    },
    {
      id: 3,
      title: 'Web Safety and Browser Security',
      category: 'web_safety',
      difficulty: 'intermediate',
      content: `# Web Safety and Browser Security

## Understanding Web Threats

The internet is filled with various threats that can compromise your security and privacy. Understanding these threats and how to protect yourself is essential for safe browsing.

## Common Web Threats

### Malicious Websites
- **Malware Distribution**: Sites that automatically download malicious software
- **Phishing Sites**: Fake websites designed to steal credentials
- **Drive-by Downloads**: Automatic malware installation without user knowledge
- **Scareware**: Fake security warnings to trick users into installing malware

### Browser-Based Attacks
- **Cross-Site Scripting (XSS)**: Malicious scripts injected into legitimate websites
- **Cross-Site Request Forgery (CSRF)**: Unauthorized actions performed on behalf of users
- **Clickjacking**: Tricking users into clicking hidden elements
- **Man-in-the-Middle**: Intercepting communications between user and website

## Browser Security Features

### HTTPS and SSL/TLS
- **Encryption**: Protects data transmitted between browser and server
- **Authentication**: Verifies website identity through certificates
- **Integrity**: Ensures data hasn't been tampered with during transmission
- **Look for**: Green padlock icon and "https://" in address bar

### Same-Origin Policy
- Prevents scripts from one website accessing data from another
- Fundamental security mechanism in modern browsers
- Helps prevent cross-site scripting attacks

### Content Security Policy (CSP)
- Allows websites to specify which content sources are trusted
- Helps prevent XSS attacks by controlling script execution
- Implemented through HTTP headers or meta tags

## Safe Browsing Practices

### URL Verification
1. **Check for HTTPS**: Ensure sensitive sites use encrypted connections
2. **Verify Domain Spelling**: Look for typosquatting attempts
3. **Avoid Suspicious TLDs**: Be cautious of unusual top-level domains
4. **Use Bookmarks**: Access important sites through saved bookmarks

### Download Safety
1. **Official Sources Only**: Download software from official websites
2. **Verify File Integrity**: Check checksums when available
3. **Scan Downloads**: Use antivirus software to scan all downloads
4. **Avoid Executable Files**: Be especially cautious with .exe, .scr, .bat files

### Social Engineering on the Web
1. **Pop-up Warnings**: Ignore fake security alerts and scan warnings
2. **Survey Scams**: Avoid "free" offers requiring personal information
3. **Tech Support Calls**: Legitimate companies don't call unsolicited
4. **Prize Notifications**: Be skeptical of unexpected winnings

## Browser Configuration

### Security Settings
- **Enable automatic updates** for security patches
- **Configure pop-up blockers** to prevent unwanted windows
- **Disable auto-execution** of downloaded files
- **Enable safe browsing** warnings and phishing protection

### Privacy Settings
- **Clear browsing data** regularly (history, cookies, cache)
- **Use private/incognito mode** for sensitive browsing
- **Manage cookies** and tracking preferences
- **Control location sharing** and other permissions

### Extensions and Add-ons
- **Install only necessary extensions** from official stores
- **Review permissions** carefully before installing
- **Keep extensions updated** to latest versions
- **Remove unused extensions** to reduce attack surface

## Advanced Protection

### Virtual Private Networks (VPNs)
- Encrypts internet traffic between device and VPN server
- Masks IP address and location
- Useful on public Wi-Fi networks
- Choose reputable VPN providers with no-log policies

### DNS Security
- **DNS over HTTPS (DoH)**: Encrypts DNS queries
- **DNS Filtering**: Blocks access to known malicious domains
- **Custom DNS Servers**: Use security-focused DNS providers
- **DNS Monitoring**: Watch for suspicious DNS queries

### Browser Isolation
- **Virtual Machines**: Browse in isolated environments
- **Container-based Browsing**: Isolate web sessions
- **Dedicated Browsing Devices**: Use separate devices for sensitive activities
- **Browser Profiles**: Separate work and personal browsing

## Mobile Browser Security

### Mobile-Specific Threats
- **Malicious Apps**: Fake browsers or security apps
- **SMS Phishing**: Links in text messages leading to malicious sites
- **QR Code Attacks**: Malicious QR codes leading to harmful websites
- **App Store Impersonation**: Fake mobile websites mimicking app stores

### Mobile Protection
- **Keep OS Updated**: Install security patches promptly
- **Use Official App Stores**: Avoid sideloading browsers
- **Enable Screen Locks**: Protect device access
- **Review App Permissions**: Monitor what apps can access

## Incident Response

### If You Suspect Compromise
1. **Disconnect from Internet**: Stop potential data exfiltration
2. **Run Security Scans**: Use updated antivirus software
3. **Change Passwords**: Update all important account passwords
4. **Monitor Accounts**: Watch for unauthorized activities
5. **Report Incidents**: Notify relevant authorities if necessary

### Recovery Steps
1. **Clean Browser**: Clear all data and reset to defaults
2. **Update Everything**: Browser, OS, and security software
3. **Restore from Backup**: Use clean backups if available
4. **Monitor Credit**: Watch for identity theft signs`,
      key_points: [
        'Always verify HTTPS encryption on sensitive websites',
        'Download software only from official, trusted sources',
        'Keep browsers and extensions updated with latest security patches',
        'Use VPNs on public Wi-Fi networks for additional protection',
        'Be skeptical of pop-up warnings and unexpected security alerts',
        'Configure browsers with security and privacy settings enabled',
        'Clear browsing data regularly to protect privacy'
      ],
      quiz_questions: [
        {
          question: 'What does HTTPS provide for web browsing?',
          options: [
            'Faster loading speeds',
            'Encryption, authentication, and data integrity',
            'Better search engine rankings',
            'Automatic software updates'
          ],
          correct_answer: 1,
          explanation: 'HTTPS provides encryption of data in transit, authentication of website identity, and ensures data integrity during transmission.'
        },
        {
          question: 'What should you do if you see a pop-up claiming your computer is infected?',
          options: [
            'Click "Scan Now" to fix the problem',
            'Call the phone number provided for help',
            'Close the pop-up and ignore it',
            'Download the recommended security software'
          ],
          correct_answer: 2,
          explanation: 'Pop-up security warnings are usually scareware attempts. Close them and use your legitimate security software instead.'
        },
        {
          question: 'Why should you be cautious about browser extensions?',
          options: [
            'They slow down your browser',
            'They can access browsing data and pose security risks',
            'They cost money to install',
            'They are difficult to uninstall'
          ],
          correct_answer: 1,
          explanation: 'Browser extensions can have extensive permissions and access to your browsing data, making them potential security risks if malicious.'
        }
      ],
      completion_time: 30,
      is_published: true,
      created_date: '2024-05-03T10:00:00Z'
    },
    {
      id: 4,
      title: 'Advanced Social Engineering Tactics',
      category: 'social_engineering',
      difficulty: 'advanced',
      content: `# Advanced Social Engineering Tactics

## Understanding Social Engineering

Social engineering is the art of manipulating people to divulge confidential information or perform actions that compromise security. It exploits human psychology rather than technical vulnerabilities.

## Psychological Principles

### Authority
- Attackers impersonate figures of authority (executives, IT staff, government officials)
- People tend to comply with requests from perceived authority figures
- **Defense**: Always verify authority through independent channels

### Urgency and Scarcity
- Creating false time pressure to bypass normal verification processes
- Claims of limited-time offers or immediate consequences
- **Defense**: Slow down and think critically about urgent requests

### Social Proof
- "Everyone else is doing it" mentality
- Fake testimonials and reviews to build credibility
- **Defense**: Verify claims through independent sources

### Reciprocity
- Creating sense of obligation through small favors or gifts
- "Quid pro quo" attacks offering help in exchange for information
- **Defense**: Be suspicious of unsolicited help or favors

## Advanced Attack Vectors

### Pretexting
- Creating fabricated scenarios to engage targets
- Extensive research to make interactions seem legitimate
- Often involves multiple contacts over time to build trust
- **Example**: Fake IT support calls referencing real company information

### Baiting
- Offering something enticing to trigger desired action
- Physical baiting: USB drives left in parking lots
- Digital baiting: Free software downloads, exclusive content
- **Defense**: Be skeptical of "too good to be true" offers

### Tailgating and Piggybacking
- Physical security bypass by following authorized personnel
- Exploits courtesy and social norms (holding doors open)
- **Defense**: Implement proper access controls and training

### Watering Hole Attacks
- Compromising websites frequently visited by targets
- Targeting specific industries or organizations
- **Defense**: Keep browsers updated, use security software

## Business Email Compromise (BEC)

### CEO Fraud
- Impersonating company executives to authorize wire transfers
- Targeting finance and accounting departments
- Often researched through social media and public information
- **Red Flags**: Unusual urgency, bypassing normal procedures

### Vendor Email Compromise
- Compromising legitimate vendor email accounts
- Sending fake invoices or payment redirect requests
- **Defense**: Verification through known contact methods

### Attorney Impersonation
- Claiming to represent company in legal matters
- Requesting confidential information for "legal proceedings"
- **Defense**: Verify through company legal department

## Advanced Phishing Techniques

### Spear Phishing
- Highly targeted attacks against specific individuals
- Extensive reconnaissance using social media and public records
- Personalized content increases success rates significantly
- **Defense**: Be suspicious even of personalized communications

### Whaling
- Spear phishing targeting high-value individuals (executives)
- Often involves business-related scenarios and urgent requests
- **Defense**: Executive training and verification procedures

### Clone Phishing
- Copying legitimate emails and replacing links with malicious ones
- Claiming to be "resending" or "updating" previous communications
- **Defense**: Verify all links independently

## Voice-Based Social Engineering (Vishing)

### Caller ID Spoofing
- Displaying fake phone numbers to appear legitimate
- Impersonating banks, government agencies, or company IT
- **Defense**: Don't trust caller ID; verify through known numbers

### Interactive Voice Response (IVR) Attacks
- Fake automated phone systems to collect information
- Often triggered by phishing emails or text messages
- **Defense**: Hang up and call official numbers directly

## SMS and Text-Based Attacks (Smishing)

### Account Verification Scams
- Fake security alerts requiring immediate action
- Links to fake login pages or malicious downloads
- **Defense**: Contact service providers through official channels

### Package Delivery Scams
- Fake shipping notifications with malicious links
- Exploiting online shopping trends and expectations
- **Defense**: Track packages through official carrier websites

## Physical Social Engineering

### Dumpster Diving
- Searching through discarded documents for sensitive information
- Finding passwords, employee lists, and organizational information
- **Defense**: Proper document destruction policies

### Shoulder Surfing
- Observing sensitive information being entered (passwords, PINs)
- Can occur in public places, offices, or through surveillance
- **Defense**: Be aware of surroundings when entering sensitive data

### Badge Cloning
- Copying access cards or badges to gain physical access
- Using RFID readers to capture card information
- **Defense**: Use modern security cards with encryption

## Digital Age Social Engineering

### Social Media Reconnaissance
- Gathering information from public social media profiles
- Building detailed target profiles for personalized attacks
- **Defense**: Review privacy settings and limit public information

### Artificial Intelligence Enhanced Attacks
- Using AI to create convincing fake voices (deepfakes)
- Automated personalization of phishing messages
- **Defense**: Verify through multiple communication channels

### Search Engine Optimization (SEO) Poisoning
- Creating fake websites that rank high in search results
- Targeting specific search terms related to target organizations
- **Defense**: Verify website authenticity through official channels

## Organizational Defenses

### Security Awareness Training
- Regular training on current social engineering tactics
- Simulated phishing exercises to test and educate
- Creating security-conscious organizational culture

### Technical Controls
- Email filtering and anti-phishing solutions
- Multi-factor authentication for all accounts
- Network segmentation and access controls
- Call-back verification procedures for sensitive requests

### Policy and Procedures
- Clear escalation procedures for suspicious contacts
- Verification requirements for sensitive information requests
- Regular security policy updates and communication
- Incident reporting and response procedures

## Response and Recovery

### If You've Been Targeted
1. **Stop the interaction** immediately if suspicious
2. **Document everything** - save emails, record call details
3. **Report to security team** or relevant authorities
4. **Change credentials** if potentially compromised
5. **Monitor accounts** for unauthorized activity

### Organizational Response
1. **Assess the scope** of potential compromise
2. **Implement containment** measures
3. **Communicate with stakeholders** appropriately
4. **Review and improve** security measures
5. **Provide additional training** if needed`,
      key_points: [
        'Social engineering exploits human psychology rather than technical vulnerabilities',
        'Authority, urgency, and social proof are common manipulation tactics',
        'Business Email Compromise (BEC) targets financial processes and executives',
        'Verification through independent channels is crucial for all suspicious requests',
        'Physical security is just as important as digital security measures',
        'Social media provides extensive information for targeted attacks',
        'Regular security awareness training is essential for organizational defense'
      ],
      quiz_questions: [
        {
          question: 'What is the primary goal of social engineering attacks?',
          options: [
            'To damage computer systems',
            'To manipulate people into revealing information or performing actions',
            'To steal physical property',
            'To slow down network performance'
          ],
          correct_answer: 1,
          explanation: 'Social engineering attacks primarily aim to manipulate human behavior to gain unauthorized access to information or systems.'
        },
        {
          question: 'Which psychological principle involves creating false time pressure?',
          options: [
            'Authority',
            'Social Proof',
            'Urgency and Scarcity',
            'Reciprocity'
          ],
          correct_answer: 2,
          explanation: 'Urgency and scarcity tactics create false time pressure to bypass normal verification processes and decision-making.'
        },
        {
          question: 'What should you do if you receive an urgent financial request from someone claiming to be your CEO?',
          options: [
            'Process the request immediately to avoid delays',
            'Verify through independent channels before taking action',
            'Forward the request to your colleagues',
            'Ignore the request completely'
          ],
          correct_answer: 1,
          explanation: 'Always verify urgent financial requests through independent channels, as CEO fraud is a common social engineering tactic.'
        }
      ],
      completion_time: 35,
      is_published: true,
      created_date: '2024-05-04T10:00:00Z'
    }
  ];

  static async filter(criteria = {}, orderBy = null, limit = null) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let results = [...this.mockData];
    
    // Apply criteria filter
    if (criteria.category) {
      results = results.filter(item => item.category === criteria.category);
    }
    if (criteria.difficulty) {
      results = results.filter(item => item.difficulty === criteria.difficulty);
    }
    if (criteria.is_published !== undefined) {
      results = results.filter(item => item.is_published === criteria.is_published);
    }
    
    // Apply ordering
    if (orderBy) {
      const [field, direction] = orderBy.startsWith('-') 
        ? [orderBy.slice(1), 'desc'] 
        : [orderBy, 'asc'];
      
      results.sort((a, b) => {
        if (field === 'difficulty') {
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          if (direction === 'desc') {
            return difficultyOrder[b[field]] - difficultyOrder[a[field]];
          }
          return difficultyOrder[a[field]] - difficultyOrder[b[field]];
        }
        
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
      throw new Error('LearningModule not found');
    }
    return { ...item };
  }

  static async create(data) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newItem = {
      id: Date.now(),
      ...data,
      created_date: new Date().toISOString(),
      is_published: data.is_published !== undefined ? data.is_published : true
    };
    this.mockData.push(newItem);
    return newItem;
  }

  static async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.mockData.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('LearningModule not found');
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
      throw new Error('LearningModule not found');
    }
    
    this.mockData.splice(index, 1);
    return { success: true };
  }
}

export { LearningModule };