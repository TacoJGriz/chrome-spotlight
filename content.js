let currentResults = [];
let selectedIndex = 0;

const hostElement = document.createElement('div');
hostElement.id = 'custom-spotlight-host';
hostElement.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647; pointer-events: none;';
document.body.appendChild(hostElement);

const shadow = hostElement.attachShadow({ mode: 'open' });

const styles = document.createElement('style');
styles.textContent = `
  #custom-spotlight-container {
    position: absolute;
    top: 20vh;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    background: #1e1e2e;
    border: 2px solid #b4befe;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #cdd6f4;
    overflow: hidden;
    pointer-events: auto;
    display: none;
  }
  #custom-spotlight-input {
    width: 100%;
    padding: 20px;
    font-size: 20px;
    background: transparent;
    border: none;
    color: #cdd6f4;
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
    fill: #cdd6f4;
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
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .result-subtitle {
    font-size: 12px;
    color: #a6adc8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }
  .badge {
    font-size: 11px;
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
shadow.appendChild(styles);

const container = document.createElement('div');
container.id = 'custom-spotlight-container';

const input = document.createElement('input');
input.id = 'custom-spotlight-input';
input.placeholder = 'Search or use /t, /b, /h, /e, or !d ...';
input.autocomplete = 'off';
input.spellcheck = false;

const resultsDiv = document.createElement('div');
resultsDiv.id = 'custom-spotlight-results';

container.appendChild(input);
container.appendChild(resultsDiv);
shadow.appendChild(container);

const BANGS = {
  '!g': 'https://google.com/search?q=',
  '!w': 'https://en.wikipedia.org/wiki/Special:Search?search=',
  '!y': 'https://www.youtube.com/results?search_query=',
  '!d': 'https://duckduckgo.com/?q='
};

function calculateMath(query) {
  let trimmed = query.trim().toLowerCase().replace(/x/g, '*');
  if (!/\d/.test(trimmed)) return null;

  const factMatch = trimmed.match(/^(\d+)\s*!$/);
  if (factMatch) {
    const n = parseInt(factMatch[1], 10);
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity; 
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  const pctMatch = trimmed.match(/^(-?\d*\.?\d+)\s*%\s*of\s*(-?\d*\.?\d+)$/);
  if (pctMatch) return parseFloat(pctMatch[1]) * parseFloat(pctMatch[2]) / 100;

  const singlePctMatch = trimmed.match(/^(-?\d*\.?\d+)\s*%$/);
  if (singlePctMatch) return parseFloat(singlePctMatch[1]) / 100;

  const mathMatch = trimmed.match(/^(-?\d*\.?\d+)\s*(%?)\s*([-+*/^]|\*\*)\s*(-?\d*\.?\d+)\s*(%?)$/);
  if (mathMatch) {
    let a = parseFloat(mathMatch[1]);
    if (mathMatch[2] === '%') a = a / 100;
    const op = mathMatch[3];
    let b = parseFloat(mathMatch[4]);
    if (mathMatch[5] === '%') b = b / 100;
    switch(op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : null;
      case '^': case '**': return Math.pow(a, b);
    }
  }
  return null; 
}

function scoreItem(target, query) {
  if (!target || !query) return 0;
  const t = target.toLowerCase();
  const q = query.toLowerCase();

  if (t === q) return 1000;
  if (t.startsWith(q)) return 500 + (100 / t.length);

  const words = t.split(/[\s\-_/.]+/);
  for (const word of words) {
    if (word.startsWith(q)) return 400 + (50 / t.length);
  }

  if (t.includes(q)) return 200 + (50 / t.length);

  let score = 0, tIdx = 0, qIdx = 0, consecutiveMatches = 0;
  while (tIdx < t.length && qIdx < q.length) {
    if (t[tIdx] === q[qIdx]) {
      qIdx++; consecutiveMatches++;
      score += 10 + (consecutiveMatches * 5); 
    } else {
      consecutiveMatches = 0;
    }
    tIdx++;
  }
  if (qIdx === q.length) return score - (t.length * 0.1); 
  return 0; 
}

function openSpotlight() {
  container.style.display = 'block';
  input.focus();
}

function closeSpotlight() {
  container.style.display = 'none';
  input.value = '';
  resultsDiv.innerHTML = '';
  currentResults = [];
  selectedIndex = 0;
}

function executeItem(itemObj) {
  const { item, category } = itemObj;
  
  if (category === 'Tab') {
    chrome.runtime.sendMessage({ action: "switchToTab", tabId: item.id, windowId: item.windowId });
    closeSpotlight();
  } else if (category === 'Calculator') {
    navigator.clipboard.writeText(item.value.toString());
    input.value = item.value.toString();
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

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggle") {
    container.style.display === 'block' ? closeSpotlight() : openSpotlight();
  }
});

input.addEventListener('input', (e) => {
  let rawQuery = e.target.value;
  let filter = null;

  if (rawQuery.startsWith('/t ')) { filter = 'Tab'; rawQuery = rawQuery.slice(3); }
  else if (rawQuery.startsWith('/b ')) { filter = 'Bookmark'; rawQuery = rawQuery.slice(3); }
  else if (rawQuery.startsWith('/h ')) { filter = 'History'; rawQuery = rawQuery.slice(3); }
  else if (rawQuery.startsWith('/e ')) { filter = 'Extension'; rawQuery = rawQuery.slice(3); }

  const trimmedQuery = rawQuery.trim();

  if (trimmedQuery.length === 0 && !filter) {
    resultsDiv.innerHTML = '';
    currentResults = [];
    return;
  }

  const bangMatch = trimmedQuery.match(/^(![a-z])\s+(.*)/);
  if (bangMatch) {
    resultsDiv.innerHTML = `<div class="result-item selected"><div class="result-content"><div class="result-title">Press Enter to search web using ${bangMatch[1]}</div></div></div>`;
    currentResults = [];
    return;
  }

  chrome.runtime.sendMessage({ action: "search", query: trimmedQuery }, (data) => {
    if (!data) return;

    let pool = [];
    const pushItems = (items, category) => {
      (items || []).forEach(item => {
        const title = item.title || item.name || '';
        const url = item.url || '';
        const titleScore = scoreItem(title, trimmedQuery);
        const urlScore = scoreItem(url, trimmedQuery) * 0.5;
        const totalScore = Math.max(titleScore, urlScore);

        if (totalScore > 0 || trimmedQuery.length === 0) {
          pool.push({ item, category, score: totalScore });
        }
      });
    };

    if (!filter || filter === 'Tab') pushItems(data.tabs, 'Tab');
    if (!filter || filter === 'Bookmark') pushItems(data.bookmarks, 'Bookmark');
    if (!filter || filter === 'History') pushItems(data.history, 'History');
    if (!filter || filter === 'Extension') pushItems(data.extensions, 'Extension');

    pool.sort((a, b) => b.score - a.score);

    const mathResult = calculateMath(trimmedQuery);
    if (mathResult !== null) {
      pool.unshift({
        category: 'Calculator',
        item: { equation: trimmedQuery, value: mathResult },
        score: 9999
      });
    }

    currentResults = pool.slice(0, 10);
    selectedIndex = 0;

    resultsDiv.innerHTML = '';
    currentResults.forEach((obj, index) => {
      const { item, category } = obj;
      const div = document.createElement('div');
      div.className = 'result-item';

      if (category === 'Calculator') {
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

      div.onmouseenter = () => { selectedIndex = index; updateSelection(); };
      div.onclick = () => executeItem(obj);
      resultsDiv.appendChild(div);
    });

    updateSelection();
  });
});

input.addEventListener('keydown', (e) => {
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
    const queryStr = input.value.trim();
    const bangMatch = queryStr.match(/^(![a-z])\s+(.*)/);
    
    if (bangMatch && BANGS[bangMatch[1]]) {
      window.open(BANGS[bangMatch[1]] + encodeURIComponent(bangMatch[2]), '_blank');
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
  if (e.key === 'Escape' && container.style.display === 'block') {
    closeSpotlight();
  }
});

document.addEventListener('mousedown', (e) => {
  if (container.style.display === 'block' && e.target !== hostElement) {
    closeSpotlight();
  }
});