// PhishGuard CSS Styles for Content Script

const styles = {
  // Warning banner styles
  warningBanner: `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #ff3b30;
    color: white;
    padding: 15px;
    text-align: center;
    z-index: 9999;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  `,

  // Simulation overlay styles
  simulationOverlay: `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  // Simulation banner styles for success
  simulationBannerSuccess: `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #34c759;
    color: white;
    padding: 15px;
    text-align: center;
    z-index: 9999;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  `,

  // Simulation banner styles for failure
  simulationBannerFail: `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #ff3b30;
    color: white;
    padding: 15px;
    text-align: center;
    z-index: 9999;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  `,

  // Action button styles
  actionButton: `
    background-color: #4285f4;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
  `,

  // Container styles
  simulationContainer: `
    background-color: white;
    max-width: 450px;
    margin: 50px auto;
    border-radius: 8px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    font-family: Arial, sans-serif;
  `,

  // Input field styles
  inputField: `
    width: 100%;
    padding: 10px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
  `
};