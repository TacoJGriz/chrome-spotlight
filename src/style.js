const SPOTLIGHT_CSS = `
  @keyframes spotlightSlideIn {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(-15px) scale(0.98);
    }
    100% {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  @keyframes spotlightSlideOut {
    0% {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px) scale(0.96);
    }
  }

  @keyframes resultsFade {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  :host {
    --bg-color: rgba(30, 30, 46, 0.85); /* Example of using rgba for background opacity */
    --border-color: #b4befe;
    --text-color: #cdd6f4;
    --border-radius: 16px;
    --width: 600px;
    --font-size: 15px;
    
    --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
    --backdrop-blur: 10px;
    --accent-color: #313244;
    --container-opacity: 1;
  }
  
  #custom-spotlight-container {
    position: absolute;
    top: 20vh;
    left: 50%;
    transform: translateX(-50%);
    width: var(--width);
    
    background: color-mix(in srgb, var(--bg-color) calc(var(--container-opacity, 1) * 100%), transparent);
    
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    font-family: var(--font-family);
    
    backdrop-filter: blur(var(--backdrop-blur));
    -webkit-backdrop-filter: blur(var(--backdrop-blur));
    
    color: var(--text-color);
    overflow: hidden;
    pointer-events: auto;
    display: none;
    
    transition: height 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    animation: spotlightSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  #custom-spotlight-container.closing {
    display: block !important;
    animation: spotlightSlideOut 0.15s ease-in forwards;
  }

  #custom-spotlight-input {
    width: 100%;
    padding: 20px;
    font-size: calc(var(--font-size) + 5px);
    background: transparent;
    border: none;
    color: var(--text-color);
    outline: none;
    box-sizing: border-box;
  }

  #custom-spotlight-results {
    max-height: 400px;
    overflow-y: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    animation: resultsFade 0.15s ease-out forwards;
  }

  .result-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    transition: background-color 0.1s ease, transform 0.1s ease;
  }

  .result-item.selected {
    background: var(--accent-color);
    padding-left: 24px; 
  }

  .result-icon, .result-icon-placeholder {
    width: 20px;
    height: 20px;
    margin-right: 12px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .result-icon-placeholder {
    background: #45475a;
  }

  .calc-icon {
    fill: var(--text-color);
    width: 20px;
    height: 20px;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .result-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-grow: 1;
  }

  .result-title {
    font-size: var(--font-size);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-subtitle {
    font-size: calc(var(--font-size) - 3px);
    color: #a6adc8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }

  .badge {
    font-size: calc(var(--font-size) - 4px);
    background: #45475a;
    padding: 3px 8px;
    border-radius: 6px;
    color: #bac2de;
    margin-left: 10px;
    flex-shrink: 0;
    transition: background-color 0.1s ease;
  }

  .result-item.selected .badge {
    background: #585b70;
  }

  .calc-result-text {
    color: #a6e3a1;
    font-weight: 600;
  }
`;