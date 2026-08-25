const darkDefaults = { bgColor: '#1e1e2e', borderColor: '#b4befe', textColor: '#cdd6f4', borderRadius: '16px', width: '600px', fontSize: '15px' };
const lightDefaults = { bgColor: '#ffffff', borderColor: '#0055ff', textColor: '#111111', borderRadius: '16px', width: '600px', fontSize: '15px' };

const inputs = ['bgColor', 'borderColor', 'textColor', 'borderRadius', 'width', 'fontSize'];
let isCurrentDark = true;

function applyThemeToPopup(theme) {
  document.documentElement.style.setProperty('--bg-color', theme.bgColor);
  document.documentElement.style.setProperty('--border-color', theme.borderColor);
  document.documentElement.style.setProperty('--text-color', theme.textColor);
}

chrome.storage.sync.get('themeConfig', (data) => {
  let theme = data.themeConfig;
  const isSysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (!theme) {
    theme = isSysDark ? darkDefaults : lightDefaults;
    chrome.storage.sync.set({ themeConfig: theme });
  }

  isCurrentDark = theme.bgColor === darkDefaults.bgColor || isSysDark;

  inputs.forEach(id => {
    document.getElementById(id).value = theme[id] || (isCurrentDark ? darkDefaults[id] : lightDefaults[id]);
  });
  
  applyThemeToPopup(theme);
});

inputs.forEach(id => {
  document.getElementById(id).addEventListener('input', saveSettings);
});

function saveSettings() {
  const newTheme = {};
  inputs.forEach(id => newTheme[id] = document.getElementById(id).value);
  chrome.storage.sync.set({ themeConfig: newTheme });
  applyThemeToPopup(newTheme); 
}

function applyPreset(themeObj) {
  inputs.forEach(id => document.getElementById(id).value = themeObj[id]);
  saveSettings();
}

document.getElementById('toggleModeBtn').addEventListener('click', () => {
  isCurrentDark = !isCurrentDark;
  applyPreset(isCurrentDark ? darkDefaults : lightDefaults);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  isCurrentDark = isDark;
  applyPreset(isDark ? darkDefaults : lightDefaults);
});

document.getElementById('exportBtn').addEventListener('click', () => {
  chrome.storage.sync.get('themeConfig', (data) => {
    const blob = new Blob([JSON.stringify(data.themeConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spotlight-theme.json';
    a.click();
  });
});

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedTheme = JSON.parse(event.target.result);
      chrome.storage.sync.set({ themeConfig: importedTheme }, () => {
        applyPreset(importedTheme);
        alert('Theme imported successfully!');
      });
    } catch (err) {
      alert('Invalid JSON file');
    }
  };
  reader.readAsText(file);
});