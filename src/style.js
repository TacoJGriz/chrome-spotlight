const SPOTLIGHT_CSS = `
  :host {
    --bg-color: #1e1e2e;
    --border-color: #b4befe;
    --text-color: #cdd6f4;
    --border-radius: 16px;
    --width: 600px;
    --font-size: 15px;
  }
  #custom-spotlight-container {
    position: absolute;
    top: 20vh;
    left: 50%;
    transform: translateX(-50%);
    width: var(--width);
    background: var(--bg-color);
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--text-color);
    overflow: hidden;
    pointer-events: auto;
    display: none;
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
    border-top: 1px solid #313244;
  }
  .result-item {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    cursor: pointer;
  }
  .result-item.selected {
    background: #313244;
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
  }
  .result-item.selected .badge {
    background: #585b70;
  }
  .calc-result-text {
    color: #a6e3a1;
    font-weight: 600;
  }
`;