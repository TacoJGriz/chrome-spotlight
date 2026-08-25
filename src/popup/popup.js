const darkDefaults = { 
  bgColor: '#1e1e2e', 
  borderColor: '#b4befe', 
  textColor: '#cdd6f4', 
  accentColor: '#313244',
  borderRadius: '16px', 
  width: '600px', 
  fontSize: '15px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  opacity: '1',
  backdropBlur: '0px',
  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)',
  borderWidth: '2px'
};

const lightDefaults = { 
  bgColor: '#ffffff', 
  borderColor: '#0055ff', 
  textColor: '#111111', 
  accentColor: '#e0e0e0',
  borderRadius: '16px', 
  width: '600px', 
  fontSize: '15px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  opacity: '1',
  backdropBlur: '0px',
  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
  borderWidth: '2px'
};

const inputs = [
  'bgColor', 'borderColor', 'textColor', 'accentColor', 
  'borderRadius', 'width', 'fontSize', 'fontFamily', 
  'opacity', 'backdropBlur', 'boxShadow', 'borderWidth'
];

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
    const el = document.getElementById(id);
    if (el) el.value = theme[id] !== undefined ? theme[id] : (isCurrentDark ? darkDefaults[id] : lightDefaults[id]);
  });
  
  applyThemeToPopup(theme);
});

inputs.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', saveSettings);
});

function saveSettings() {
  const newTheme = {};
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) newTheme[id] = el.value;
  });
  chrome.storage.sync.set({ themeConfig: newTheme });
  applyThemeToPopup(newTheme); 
}

function applyPreset(themeObj) {
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = themeObj[id];
  });
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

document.getElementById('optionsBtn').addEventListener('click', () => chrome.runtime.openOptionsPage());

chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "forceOpen"}).catch(() => {});
  }
});