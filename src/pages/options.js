let customBangs = {};
let customAliases = {};

function loadData() {
  chrome.storage.sync.get(['customBangs', 'customAliases'], (data) => {
    customBangs = data.customBangs || {};
    customAliases = data.customAliases || {};
    renderList('bangsList', customBangs, 'customBangs');
    renderList('aliasesList', customAliases, 'customAliases');
  });
}

function renderList(containerId, dataObj, storageKey) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  for (const [trigger, item] of Object.entries(dataObj)) {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
      <div><span class="code">${trigger}</span> <strong>${item.name}</strong> <span style="color:#a6adc8; font-size: 13px; margin-left: 10px;">${item.url}</span></div>
      <button class="danger" data-trigger="${trigger}">Remove</button>
    `;
    div.querySelector('button').onclick = () => {
      delete dataObj[trigger];
      chrome.storage.sync.set({ [storageKey]: dataObj }, loadData);
    };
    container.appendChild(div);
  }
}

document.getElementById('addBangBtn').onclick = () => {
  let trigger = document.getElementById('b-trigger').value.trim();
  if (!trigger.startsWith('!')) trigger = '!' + trigger;
  
  customBangs[trigger] = {
    name: document.getElementById('b-name').value.trim(),
    url: document.getElementById('b-url').value.trim()
  };
  chrome.storage.sync.set({ customBangs }, loadData);
};

document.getElementById('addAliasBtn').onclick = () => {
  let trigger = document.getElementById('a-trigger').value.trim();
  if (!trigger.startsWith('/')) trigger = '/' + trigger;

  customAliases[trigger] = {
    name: document.getElementById('a-name').value.trim(),
    url: document.getElementById('a-url').value.trim()
  };
  chrome.storage.sync.set({ customAliases }, loadData);
};

document.getElementById('exportShortcutsBtn').onclick = () => {
  const exportData = { customBangs, customAliases };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'spotlight-shortcuts.json';
  a.click();
};

document.getElementById('importShortcutsBtn').onclick = () => document.getElementById('fileInputShortcuts').click();
document.getElementById('fileInputShortcuts').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (imported.customBangs) chrome.storage.sync.set({ customBangs: imported.customBangs });
      if (imported.customAliases) chrome.storage.sync.set({ customAliases: imported.customAliases });
      setTimeout(loadData, 100);
      alert('Shortcuts imported successfully!');
    } catch (err) {
      alert('Invalid JSON file');
    }
  };
  reader.readAsText(file);
};

loadData();