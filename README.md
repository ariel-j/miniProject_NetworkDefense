# PhishGuard - Anti-Phishing Browser Extension with Training Mode

PhishGuard is a comprehensive browser extension that protects users from phishing attacks while simultaneously training them to identify and avoid such threats. It combines real-time phishing detection with safe simulated phishing scenarios to build security awareness.

![PhishGuard Logo](icons/icon128.png)

## Key Features

- **Real-time Phishing Detection**: Block dangerous sites with URL and content analysis
- **Personalized Training**: Test users with safe phishing simulations tailored to their vulnerabilities
- **Security Analytics**: Track progress and identify specific areas to improve
- **Education Center**: Learn about different phishing techniques through interactive guides

## Installation Instructions

### Developer Mode Installation

1. **Download or Clone the Repository**
   ```
   git clone https://github.com/yourusername/phishguard.git
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions` in your Chrome browser
   - Alternatively, access through menu: Settings → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to the directory where you downloaded/cloned the repository
   - Select the root folder of the extension

5. **Verify Installation**
   - The PhishGuard icon should appear in your extensions toolbar
   - Click the icon to see the popup interface

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store page for PhishGuard
2. Click "Add to Chrome"
3. Confirm the installation when prompted

## Using PhishGuard

### Basic Features

- **Automatic Protection**: PhishGuard runs in the background, monitoring websites for phishing indicators
- **Warnings**: When a potential phishing site is detected, a warning banner will appear
- **Training Simulations**: Occasionally, safe simulations will appear to test your phishing awareness
- **Statistics**: View your performance and vulnerability areas by clicking the extension icon

### Dashboard

Access the full dashboard for detailed statistics and learning resources:

1. Click the PhishGuard icon in your browser toolbar
2. Click "View Full Dashboard" in the popup
3. Explore your performance metrics, training history, and vulnerability areas

### Learning Resources

Improve your phishing awareness with our educational content:

1. Open the dashboard
2. Scroll to the "Learning Resources" section
3. Click on any topic to view detailed guides and interactive quizzes

### Settings

Customize your PhishGuard experience:

1. Click the PhishGuard icon in your browser toolbar
2. Toggle the "Training Mode" switch to enable/disable training simulations
3. Click "Run Practice Simulation" to manually trigger a training scenario

## Project Structure

```
phishguard/
├── manifest.json       # Extension configuration
├── background.js       # Background service worker
├── content.js          # Content scripts for web pages
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality
├── dashboard.html      # Full analytics dashboard
├── dashboard.js        # Dashboard functionality
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── learning/           # Educational resources
    ├── urgencyTactics.html
    ├── loginFormSpoofing.html
    └── ...
```

## Privacy & Security

- **No Data Collection**: PhishGuard does not collect or transmit any personal data
- **Local Processing**: All analysis happens locally in your browser
- **No Permissions Abuse**: The extension only uses permissions necessary for its functionality
- **Safe Simulations**: Training scenarios are completely safe and never put your data at risk

## Contributing

Contributions are welcome! If you'd like to help improve PhishGuard:

1. Fork the repository
2. Create a feature branch: `git checkout -b new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icon designs by [Freepik](https://www.freepik.com)
- Phishing detection techniques based on [OWASP](https://owasp.org) best practices
- Training methodology informed by research in security awareness training

---

Created with ❤️ to make the web a safer place.
