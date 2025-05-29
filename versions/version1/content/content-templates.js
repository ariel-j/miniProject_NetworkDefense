// PhishGuard HTML Templates for Content Script

const templates = {
  // Phishing warning template
  phishingWarning: (data) => `
    <h2 style="margin: 0; font-size: 18px;">⚠️ Potential Phishing Site Detected</h2>
    <p style="margin: 10px 0; font-size: 14px;">
      ${data.reason} (Confidence: ${Math.round(data.confidence * 100)}%)
    </p>
    <div>
      <button id="phishguard-warning-continue" style="
        background-color: white;
        color: #ff3b30;
        border: none;
        padding: 8px 15px;
        margin-right: 10px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">Continue Anyway</button>
      <button id="phishguard-warning-back" style="
        background-color: #0078d7;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">Go Back to Safety</button>
    </div>
  `,

  // Simulation feedback template
  simulationFeedback: (fellForIt, simulationType) => `
    <h2 style="margin: 0; font-size: 18px;">
      ${fellForIt ? '⚠️ Phishing Simulation - You Clicked!' : '✓ Good Job! You Avoided the Phishing Attempt'}
    </h2>
    <p style="margin: 10px 0; font-size: 14px;">
      ${fellForIt
      ? 'This was a training simulation by PhishGuard. In a real phishing attempt, your information could have been stolen.'
      : 'This was a training simulation by PhishGuard. You correctly avoided interacting with suspicious content.'}
    </p>
    <p style="margin: 5px 0; font-size: 14px;">
      <strong>Simulation type:</strong> ${simulationType}
    </p>
    <div>
      <button id="phishguard-simulation-learn" style="
        background-color: white;
        color: ${fellForIt ? '#ff3b30' : '#34c759'};
        border: none;
        padding: 8px 15px;
        margin-right: 10px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">Learn More</button>
      <button id="phishguard-simulation-dismiss" style="
        background-color: transparent;
        color: white;
        border: 1px solid white;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">Dismiss</button>
    </div>
  `,

  // Simulation templates
  urgencySimulation: () => `
    <div class="phishguard-simulation-container" style="
      background-color: white;
      max-width: 500px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: #d32f2f;
        color: white;
        padding: 15px;
        text-align: center;
      ">
        <h2 style="margin: 0; font-size: 20px;">⚠️ URGENT: Security Alert</h2>
      </div>
      <div style="padding: 20px;">
        <p style="
          font-size: 16px;
          line-height: 1.5;
          margin-top: 0;
        ">
          Your account has been temporarily limited due to suspicious activity.
          Immediate action is required to prevent account suspension.
        </p>
        <p style="
          font-size: 16px;
          line-height: 1.5;
        ">
          Please verify your identity within the next <strong>24 hours</strong> to restore full access.
        </p>
        <div style="
          margin-top: 25px;
          text-align: center;
        ">
          <button class="phishguard-simulation-action-button" style="
            background-color: #d32f2f;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          ">Verify Account Now</button>
        </div>
      </div>
    </div>
  `,

  loginFormSimulation: () => `
    <div class="phishguard-simulation-container" style="
      background-color: white;
      max-width: 400px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: #4285f4;
        padding: 20px;
        text-align: center;
      ">
        <img src="${chrome.runtime.getURL('images/generic_logo.png')}" 
             onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%2232%22><rect width=%22100%22 height=%2232%22 fill=%22%23fff%22 /><text x=%2250%22 y=%2220%22 font-family=%22Arial%22 font-size=%2216%22 text-anchor=%22middle%22 fill=%22%234285f4%22>YourAccount</text></svg>'"
             alt="Logo" width="150" style="margin-bottom: 10px;">
      </div>
      <div style="padding: 20px;">
        <h2 style="
          margin-top: 0;
          margin-bottom: 20px;
          color: #4285f4;
          font-size: 18px;
          text-align: center;
        ">Sign in to continue</h2>
        <form id="phishguard-simulation-login-form">
          <div style="margin-bottom: 15px;">
            <label style="
              display: block;
              margin-bottom: 5px;
              font-size: 14px;
              color: #5f6368;
            ">Email</label>
            <input type="email" class="phishguard-simulation-input" style="
              width: 100%;
              padding: 10px;
              border: 1px solid #dadce0;
              border-radius: 4px;
              font-size: 16px;
              box-sizing: border-box;
            " placeholder="Enter your email">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="
              display: block;
              margin-bottom: 5px;
              font-size: 14px;
              color: #5f6368;
            ">Password</label>
            <input type="password" class="phishguard-simulation-input" style="
              width: 100%;
              padding: 10px;
              border: 1px solid #dadce0;
              border-radius: 4px;
              font-size: 16px;
              box-sizing: border-box;
            " placeholder="Enter your password">
          </div>
          <div style="
            margin-top: 25px;
            text-align: center;
          ">
            <button type="submit" class="phishguard-simulation-action-button" style="
              background-color: #4285f4;
              color: white;
              border: none;
              padding: 12px 20px;
              width: 100%;
              border-radius: 4px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
            ">Sign In</button>
          </div>
        </form>
      </div>
    </div>
  `,

  misspelledDomainSimulation: () => `
    <div class="phishguard-simulation-container" style="
      background-color: white;
      max-width: 450px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: #ff9900;
        padding: 15px;
        text-align: center;
        color: white;
      ">
        <h2 style="margin: 0; font-size: 20px;">Special Limited Offer!</h2>
      </div>
      <div style="padding: 20px;">
        <div style="
          text-align: center;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: bold;
          color: #333;
        ">
          <span style="color: #ff9900;">Amaz<span style="color: #333;">0</span>n</span> Gift Card Giveaway
        </div>
        <p style="
          font-size: 15px;
          line-height: 1.5;
          margin-top: 0;
          color: #333;
        ">
          Congratulations! You've been selected to receive a $50 gift card.
          Complete a short survey to claim your reward.
        </p>
        <div style="
          background-color: #f8f8f8;
          border: 1px dashed #ddd;
          padding: 10px;
          text-align: center;
          margin: 15px 0;
          color: #333;
        ">
          <span style="font-size: 14px;">Offer expires in:</span>
          <div style="
            font-size: 20px;
            font-weight: bold;
            color: #d32f2f;
          ">23:59:41</div>
        </div>
        <div style="
          margin-top: 20px;
          text-align: center;
        ">
          <button class="phishguard-simulation-action-button" style="
            background-color: #ff9900;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          ">Claim Gift Card Now</button>
        </div>
        <div style="
          margin-top: 15px;
          text-align: center;
          font-size: 12px;
          color: #777;
        ">
          * Terms and conditions apply. Visit amaz0n.com/giftcards for details.
        </div>
      </div>
    </div>
  `,

  securityClaimsSimulation: () => `
    <div class="phishguard-simulation-container" style="
      background-color: white;
      max-width: 450px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: #0078d7;
        padding: 15px;
        text-align: center;
        color: white;
      ">
        <h2 style="margin: 0; font-size: 20px;">Security Verification Required</h2>
      </div>
      <div style="padding: 20px;">
        <div style="
          margin-bottom: 15px;
          text-align: center;
        ">
          <span style="
            font-size: 40px;
            color: #0078d7;
          ">🔒</span>
        </div>
        <p style="
          font-size: 15px;
          line-height: 1.5;
          margin-top: 0;
          color: #333;
        ">
          Our security system has detected unusual activity on your account. To ensure your
          account's security, please verify your identity.
        </p>
        <div style="
          background-color: #f0f7ff;
          border: 1px solid #d0e5ff;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
        ">
          <div style="
            font-size: 14px;
            color: #333;
            margin-bottom: 8px;
          ">
            <strong>Why this is happening:</strong>
          </div>
          <ul style="
            margin: 0;
            padding-left: 20px;
            color: #333;
            font-size: 14px;
          ">
            <li>Login attempt from a new location</li>
            <li>Multiple failed login attempts</li>
            <li>Recent password change request</li>
          </ul>
        </div>
        <div style="
          margin-top: 20px;
          text-align: center;
        ">
          <button class="phishguard-simulation-action-button" style="
            background-color: #0078d7;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          ">Verify Account</button>
        </div>
      </div>
    </div>
  `,

  financialBaitSimulation: () => `
    <div class="phishguard-simulation-container" style="
      background-color: white;
      max-width: 450px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: #4caf50;
        padding: 15px;
        text-align: center;
        color: white;
      ">
        <h2 style="margin: 0; font-size: 22px;">🎉 Congratulations! You've Won! 🎉</h2>
      </div>
      <div style="padding: 20px;">
        <div style="
          text-align: center;
          margin-bottom: 15px;
        ">
          <span style="
            font-size: 36px;
            color: #ffc107;
          ">💰</span>
        </div>
        <p style="
          font-size: 18px;
          line-height: 1.4;
          margin-top: 0;
          color: #333;
          text-align: center;
          font-weight: bold;
        ">
          You've been selected as our lucky visitor!
        </p>
        <p style="
          font-size: 15px;
          line-height: 1.5;
          color: #333;
          text-align: center;
        ">
          You've won a $1,000 gift card or the latest smartphone.
          Claim your prize now before time runs out!
        </p>
        <div style="
          background-color: #fff9c4;
          border: 1px solid #ffd54f;
          padding: 12px;
          margin: 15px 0;
          border-radius: 4px;
          text-align: center;
        ">
          <div style="
            font-size: 14px;
            color: #ff6d00;
            font-weight: bold;
          ">
            Limited Time Offer: Only 3 prizes left today!
          </div>
        </div>
        <div style="
          margin-top: 20px;
          text-align: center;
        ">
          <button class="phishguard-simulation-action-button" style="
            background-color: #4caf50;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          ">Claim Your Prize</button>
        </div>
        <div style="
          margin-top: 15px;
          text-align: center;
          font-size: 12px;
          color: #777;
        ">
          * No purchase necessary. See terms and conditions for details.
        </div>
      </div>
    </div>
  `,

  genericSimulation: () => `
    <div class="phishguard-simulation-container" style="
      background-color: white;
      max-width: 450px;
      margin: 50px auto;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: #2196f3;
        padding: 15px;
        text-align: center;
        color: white;
      ">
        <h2 style="margin: 0; font-size: 20px;">Important Notification</h2>
      </div>
      <div style="padding: 20px;">
        <p style="
          font-size: 15px;
          line-height: 1.5;
          margin-top: 0;
          color: #333;
        ">
          Your attention is required for an important update regarding your account.
          Please review the information below and take action as needed.
        </p>
        <div style="
          margin-top: 20px;
          text-align: center;
        ">
          <button class="phishguard-simulation-action-button" style="
            background-color: #2196f3;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          ">Continue</button>
        </div>
      </div>
    </div>
  `
};