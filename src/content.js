let currentResults = [];
let selectedIndex = 0;

let lastHoverX = 0;
let lastHoverY = 0;

let lastTargetHeight = 0;

const hostElement = document.createElement('div');
hostElement.id = 'custom-spotlight-host';
hostElement.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647; pointer-events: none;';
document.body.appendChild(hostElement);

const shadow = hostElement.attachShadow({ mode: 'open' });

const styles = document.createElement('style');
styles.textContent = SPOTLIGHT_CSS; 
shadow.appendChild(styles);

const container = document.createElement('div');
container.id = 'custom-spotlight-container';

const inputWrapper = document.createElement('div');
inputWrapper.className = 'input-wrapper';

const pillDiv = document.createElement('div');
pillDiv.className = 'command-pill';

const input = document.createElement('input');
input.id = 'custom-spotlight-input';
input.placeholder = 'Search...';
input.autocomplete = 'off';
input.spellcheck = false;

const resultsDiv = document.createElement('div');
resultsDiv.id = 'custom-spotlight-results';

inputWrapper.appendChild(pillDiv);
inputWrapper.appendChild(input);

container.appendChild(inputWrapper);
container.appendChild(resultsDiv);
shadow.appendChild(container);

let activeCommandKey = '';

let customBangs = {};
let customAliases = {};

chrome.storage.sync.get(['themeConfig', 'customBangs', 'customAliases'], (data) => {
  if (data.themeConfig) applyTheme(data.themeConfig);
  if (data.customBangs) customBangs = data.customBangs;
  if (data.customAliases) customAliases = data.customAliases;
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.themeConfig) applyTheme(changes.themeConfig.newValue);
    if (changes.customBangs) customBangs = changes.customBangs.newValue;
    if (changes.customAliases) customAliases = changes.customAliases.newValue;
  }
});

function getCombinedBangs() {
  return { ...BANGS, ...customBangs };
}

function applyTheme(theme) {
  hostElement.style.setProperty('--bg-color', theme.bgColor);
  hostElement.style.setProperty('--border-color', theme.borderColor);
  hostElement.style.setProperty('--text-color', theme.textColor);
  hostElement.style.setProperty('--border-radius', theme.borderRadius);
  hostElement.style.setProperty('--width', theme.width);
  hostElement.style.setProperty('--font-size', theme.fontSize || '15px');
  hostElement.style.setProperty('--font-family', theme.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif');
  hostElement.style.setProperty('--box-shadow', theme.boxShadow || '0 15px 40px rgba(0, 0, 0, 0.6)');
  hostElement.style.setProperty('--backdrop-blur', theme.backdropBlur || '0px');
  hostElement.style.setProperty('--accent-color', theme.accentColor || '#313244');
  hostElement.style.setProperty('--container-opacity', theme.opacity || '1');
  hostElement.style.setProperty('--border-width', theme.borderWidth || '2px');
}

function openSpotlight() {
  container.classList.remove('closing');
  container.style.display = 'block';
  container.style.height = 'auto';
  lastTargetHeight = container.offsetHeight;
  input.focus();
}

function closeSpotlight() {
  container.classList.add('closing');
  
  setTimeout(() => {
    if (container.classList.contains('closing')) {
      container.style.display = 'none';
      container.style.height = 'auto';
      container.classList.remove('closing');
      input.value = '';
      activeCommandKey = '';
      pillDiv.style.display = 'none';
      pillDiv.textContent = '';
      resultsDiv.innerHTML = '';
      currentResults = [];
      selectedIndex = 0;
    }
  }, 150);
}

function executeItem(itemObj) {
  const { item, category } = itemObj;
  
  if (category === 'Autocomplete') {
    input.value = item.value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  
  if (category === 'Tab') {
    chrome.runtime.sendMessage({ action: "switchToTab", tabId: item.id, windowId: item.windowId });
    closeSpotlight();
  } else if (category === 'Calculator') {
    navigator.clipboard.writeText(item.value.toString());
    input.value = item.value.toString();
  } else if (category === 'Extension') {
    window.open(`chrome://extensions/?id=${item.id}`, '_blank');
    closeSpotlight();
  } else if (category === 'Alias' || item.url) {
    window.open(item.url, '_blank');
    closeSpotlight();
  } else if (item.url) {
    window.open(item.url, '_blank');
    closeSpotlight();
  }
}

function updateSelection() {
  const items = resultsDiv.querySelectorAll('.result-item');
  items.forEach((el, index) => {
    if (index === selectedIndex) {
      el.classList.add('selected');
      el.scrollIntoView({ block: 'nearest' });
    } else {
      el.classList.remove('selected');
    }
  });
}

function renderResultsList() {
  const currentVisualHeight = container.offsetHeight;
  const previousInlineHeight = container.style.height;
  const previousTransition = container.style.transition;

  resultsDiv.innerHTML = '';
  currentResults.forEach((obj, index) => {
    const { item, category } = obj;
    const div = document.createElement('div');
    div.className = 'result-item';

    if (category === 'Autocomplete') {
      const parts = item.name.split('-');
      div.innerHTML = `
        <div class="result-icon-placeholder" style="background: transparent; display: flex; align-items: center; justify-content: center; font-size: 18px;">⚡</div>
        <div class="result-content">
          <div class="result-title"><strong>[${parts[0].trim()}]</strong> ${parts[1].trim()}</div>
        </div>
        <div class="badge">Enter to select</div>
      `;
    } else if (category === 'Calculator') {
      const calcIcon = `<svg class="calc-icon" viewBox="0 0 24 24"><path d="M19 2H5C3.9 2 3 2.9 3 4V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2ZM13 19.99H11V17.99H13V19.99ZM13 15.99H11V13.99H13V15.99ZM17 19.99H15V17.99H17V19.99ZM17 15.99H15V13.99H17V15.99ZM19 11.99H5V5.99H19V11.99ZM9 19.99H7V17.99H9V19.99ZM9 15.99H7V13.99H9V15.99Z"/></svg>`;
      div.innerHTML = `
        ${calcIcon}
        <div class="result-content">
          <div class="result-title"><strong>[Math]</strong> ${item.equation} = <span class="calc-result-text">${item.value}</span></div>
        </div>
        <div class="badge">Enter to copy</div>
      `;
    } else {
      let iconUrl = '';
      let cleanUrl = '';
      if (item.url) {
        try { cleanUrl = new URL(item.url).hostname.replace(/^www\./, ''); } catch(e) {}
      }

      if (category === 'Tab' && item.favIconUrl) {
        iconUrl = item.favIconUrl;
      } else if (item.url) {
        iconUrl = `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(item.url)}`;
      }

      const imgHtml = iconUrl ? `<img src="${iconUrl}" class="result-icon">` : `<div class="result-icon-placeholder"></div>`;
      div.innerHTML = `
        ${imgHtml} 
        <div class="result-content">
          <div class="result-title"><strong>[${category}]</strong> ${item.title || item.name}</div>
          ${cleanUrl ? `<div class="result-subtitle">${cleanUrl}</div>` : ''}
        </div>
      `;
    }

    div.addEventListener('mousemove', (e) => {
      if (e.clientX !== lastHoverX || e.clientY !== lastHoverY) {
        lastHoverX = e.clientX;
        lastHoverY = e.clientY;
        if (selectedIndex !== index) {
          selectedIndex = index;
          updateSelection();
        }
      }
    });    
    div.onclick = () => executeItem(obj);
    resultsDiv.appendChild(div);
  });

  updateSelection();

  container.style.transition = 'none';
  container.style.height = 'auto';
  const targetHeight = container.offsetHeight;

  if (targetHeight === lastTargetHeight) {
    container.style.height = previousInlineHeight;
    container.style.transition = previousTransition;
    return; 
  }

  container.style.height = currentVisualHeight + 'px';
  void container.offsetHeight; // Force reflow

  container.style.transition = '';
  container.style.height = targetHeight + 'px';
  lastTargetHeight = targetHeight;
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggle") {
    container.style.display === 'block' ? closeSpotlight() : openSpotlight();
  } else if (request.action === "forceOpen") {
    openSpotlight();
  }
});

input.addEventListener('input', (e) => {
  const ALL_BANGS = getCombinedBangs();

  const pillMatch = input.value.match(/^(\/(t|tabs|b|bookmarks|h|history)|(![a-zA-Z0-9]+))\s+/i);
  if (pillMatch && !activeCommandKey) {
    const trigger = pillMatch[1].toLowerCase();
    
    let pillName = '';
    if (trigger.startsWith('/')) {
      if (trigger === '/t' || trigger === '/tabs') pillName = 'Tabs';
      if (trigger === '/b' || trigger === '/bookmarks') pillName = 'Bookmarks';
      if (trigger === '/h' || trigger === '/history') pillName = 'History';
    } else if (trigger.startsWith('!') && ALL_BANGS[trigger]) {
      pillName = ALL_BANGS[trigger].name;
    }

    if (pillName) {
      activeCommandKey = pillMatch[1];
      pillDiv.textContent = pillName;
      pillDiv.style.display = 'flex';
      input.value = input.value.slice(pillMatch[0].length);
    }
  }

  let rawQuery = activeCommandKey ? `${activeCommandKey} ${input.value}` : input.value;
  const trimmedQuery = rawQuery.trim();
  
  if (trimmedQuery.length === 0) {
    currentResults = [];
    renderResultsList();
    return;
  }

  const aliasMatch = Object.keys(customAliases).find(k => trimmedQuery === k || trimmedQuery.startsWith(k + ' '));
  if (aliasMatch) {
    let safeUrl = customAliases[aliasMatch].url;
    if (!safeUrl.startsWith('http')) safeUrl = 'https://' + safeUrl;

    currentResults = [{ 
      category: 'Alias', 
      item: { name: `Warp to ${customAliases[aliasMatch].name}`, url: safeUrl } 
    }];
    selectedIndex = 0;
    renderResultsList();
    return;
  }

  const bangMatch = trimmedQuery.match(/^(![a-zA-Z0-9]+)\s+(.*)/);
  if (bangMatch && ALL_BANGS[bangMatch[1]]) {
    currentResults = [{ 
      category: 'Bang', 
      item: { 
        name: `Search ${ALL_BANGS[bangMatch[1]].name} for "${bangMatch[2]}"`, 
        url: ALL_BANGS[bangMatch[1]].url + encodeURIComponent(bangMatch[2]) 
      } 
    }];
    selectedIndex = 0;
    renderResultsList();
    return;
  }

  if (trimmedQuery.startsWith('/') && !rawQuery.trimStart().includes(' ')) {
    const searchTerm = trimmedQuery.toLowerCase().slice(1);
    
    const nativeCmds = [
      { key: '/t', desc: 'Search Open Tabs' },
      { key: '/b', desc: 'Search Bookmarks' },
      { key: '/h', desc: 'Search History' },
      //{ key: '/e', desc: 'Search Extensions' }
    ].filter(c => c.key.startsWith(trimmedQuery) || c.desc.toLowerCase().includes(searchTerm));
    
    const customCmds = Object.keys(customAliases)
      .filter(k => k.startsWith(trimmedQuery) || customAliases[k].name.toLowerCase().includes(searchTerm))
      .filter(k => k !== trimmedQuery)
      .map(k => ({ key: k, desc: customAliases[k].name }));

    const cmds = [...nativeCmds, ...customCmds];
    
    if (cmds.length > 0) {
      cmds.sort((a, b) => {
        const aStarts = a.key.startsWith(trimmedQuery) ? 1 : 0;
        const bStarts = b.key.startsWith(trimmedQuery) ? 1 : 0;
        return bStarts - aStarts; 
      });

      const uniqueCmds = Array.from(new Map(cmds.map(item => [item.key, item])).values());

      currentResults = uniqueCmds.map(c => ({
        category: 'Autocomplete',
        item: { name: `${c.key} - ${c.desc}`, value: `${c.key} ` }
      }));
      selectedIndex = 0;
      renderResultsList();
      return;
    }
  }

  if (trimmedQuery.startsWith('!') && !rawQuery.trimStart().includes(' ')) {
    const searchTerm = trimmedQuery.toLowerCase().slice(1);
    
    const matchingBangs = Object.keys(ALL_BANGS).filter(k => 
      k.startsWith(trimmedQuery) || ALL_BANGS[k].name.toLowerCase().includes(searchTerm)
    );
    
    if (matchingBangs.length > 0) {
      matchingBangs.sort((a, b) => {
        const aStarts = a.startsWith(trimmedQuery) ? 1 : 0;
        const bStarts = b.startsWith(trimmedQuery) ? 1 : 0;
        return bStarts - aStarts;
      });

      currentResults = matchingBangs.map(k => ({
        category: 'Autocomplete',
        item: { name: `${k} - Search ${ALL_BANGS[k].name}`, value: `${k} ` }
      }));
      selectedIndex = 0;
      renderResultsList();
      return;
    }
  }
  
  let filter = null;
  let processedQuery = rawQuery.trimStart();
  
  const filterMatch = processedQuery.match(/^\/(t|tabs|b|bookmarks|h|history)\b\s*(.*)/i); //|e|extensions)\b\s*(.*)/i);
  
  if (filterMatch) {
    const f = filterMatch[1].toLowerCase();
    if (f === 't' || f === 'tabs') filter = 'Tab';
    if (f === 'b' || f === 'bookmarks') filter = 'Bookmark';
    if (f === 'h' || f === 'history') filter = 'History';
    //if (f === 'e' || f === 'extensions') filter = 'Extension';
    processedQuery = filterMatch[2].trim();
  } else {
    processedQuery = processedQuery.trim();
  }

  if (processedQuery.length === 0 && !filter) {
    resultsDiv.innerHTML = '';
    currentResults = [];
    return;
  }

  chrome.runtime.sendMessage({ action: "search", query: processedQuery }, (data) => {
    if (!data) return;

    let pool = [];
    const pushItems = (items, category) => {
      (items || []).forEach(item => {
        const title = item.title || item.name || '';
        const url = item.url || '';
        const titleScore = scoreItem(title, processedQuery); 
        const urlScore = scoreItem(url, processedQuery) * 0.5; 
        const totalScore = Math.max(titleScore, urlScore);

        if (totalScore > 0 || processedQuery.length === 0) pool.push({ item, category, score: totalScore });
      });
    };

    if (!filter || filter === 'Tab') pushItems(data.tabs, 'Tab');
    if (!filter || filter === 'Bookmark') pushItems(data.bookmarks, 'Bookmark');
    if (!filter || filter === 'History') pushItems(data.history, 'History');
    if (!filter || filter === 'Extension') pushItems(data.extensions, 'Extension');

    pool.sort((a, b) => b.score - a.score);

    const mathResult = calculateMath(processedQuery); 
    if (mathResult !== null) {
      pool.unshift({
        category: 'Calculator',
        item: { equation: processedQuery, value: mathResult },
        score: 9999
      });
    }

    currentResults = pool.slice(0, 10);
    selectedIndex = 0;
    renderResultsList();
  });
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace' && input.value === '' && activeCommandKey) {
    e.preventDefault();
    input.value = activeCommandKey; // Restores "/t" instead of "/t "
    activeCommandKey = '';
    pillDiv.style.display = 'none';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    if (currentResults.length > 0) {
      selectedIndex = e.shiftKey 
        ? (selectedIndex - 1 + currentResults.length) % currentResults.length 
        : (selectedIndex + 1) % currentResults.length;
      updateSelection();
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (currentResults.length > 0) {
      selectedIndex = (selectedIndex + 1) % currentResults.length;
      updateSelection();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (currentResults.length > 0) {
      selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
      updateSelection();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    
    const rawQuery = activeCommandKey ? `${activeCommandKey} ${input.value}` : input.value;
    const queryStr = rawQuery.trim();
    
    const ALL_BANGS = getCombinedBangs();
    const bangMatch = queryStr.match(/^(![a-zA-Z0-9]+)\s+(.*)/);
    
    if (bangMatch && ALL_BANGS[bangMatch[1]]) { 
      window.open(ALL_BANGS[bangMatch[1]].url + encodeURIComponent(bangMatch[2]), '_blank');
      closeSpotlight();
      return;
    }

    if (currentResults.length > 0 && selectedIndex >= 0) {
      executeItem(currentResults[selectedIndex]);
    } else if (queryStr.length > 0) {
      chrome.runtime.sendMessage({ action: "defaultSearch", query: queryStr });
      closeSpotlight();
    }
  } else if (e.key === 'Escape') {
    closeSpotlight();
  }
});

container.addEventListener('keydown', (e) => e.stopPropagation());
container.addEventListener('keyup', (e) => e.stopPropagation());
container.addEventListener('keypress', (e) => e.stopPropagation());

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && container.style.display === 'block') closeSpotlight();
});

document.addEventListener('mousedown', (e) => {
  if (container.style.display === 'block' && e.target !== hostElement) closeSpotlight();
});