let currentResults = [];
let selectedIndex = 0;

const container = document.createElement('div');
container.id = 'custom-spotlight-container';
container.style.display = 'none';

const input = document.createElement('input');
input.id = 'custom-spotlight-input';
input.placeholder = 'Search or use /t (tabs), /b (bookmarks), /h (history) or !d ...';
input.autocomplete = 'off';

const resultsDiv = document.createElement('div');
resultsDiv.id = 'custom-spotlight-results';

container.appendChild(input);
container.appendChild(resultsDiv);
document.body.appendChild(container);

const BANGS = {
  '!g': 'https://google.com/search?q=',
  '!w': 'https://en.wikipedia.org/wiki/Special:Search?search=',
  '!y': 'https://www.youtube.com/results?search_query=',
  '!d': 'https://duckduckgo.com/?q=' // NEW: DuckDuckGo Bang
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggle") {
    if (container.style.display === 'none') {
      container.style.display = 'block';
      input.focus();
    } else {
      closeSpotlight();
    }
  }
});

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
  } else if (item.url) {
    window.open(item.url, '_blank');
  }
  closeSpotlight();
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

input.addEventListener('input', (e) => {
  let rawQuery = e.target.value.toLowerCase();
  let filter = null;

  if (rawQuery.startsWith('/t ')) { filter = 'Tab'; rawQuery = rawQuery.slice(3); }
  else if (rawQuery.startsWith('/b ')) { filter = 'Bookmark'; rawQuery = rawQuery.slice(3); }
  else if (rawQuery.startsWith('/h ')) { filter = 'History'; rawQuery = rawQuery.slice(3); }
  else if (rawQuery.startsWith('/e ')) { filter = 'Extension'; rawQuery = rawQuery.slice(3); }

  if (rawQuery.length < 2 && !filter) {
    resultsDiv.innerHTML = '';
    currentResults = [];
    return;
  }

  const bangMatch = rawQuery.match(/^(![a-z])\s+(.*)/);
  if (bangMatch) {
    resultsDiv.innerHTML = `<div class="result-item selected">Press Enter to search using ${bangMatch[1]}</div>`;
    currentResults = [];
    return;
  }

  chrome.runtime.sendMessage({ action: "search", query: rawQuery }, (results) => {
    resultsDiv.innerHTML = '';
    currentResults = [];
    selectedIndex = 0;

    const addItems = (items, category) => {
      items.forEach(item => {
        currentResults.push({ item, category });
      });
    };

    if (!filter || filter === 'Tab') addItems(results.tabs, 'Tab');
    if (!filter || filter === 'Bookmark') addItems(results.bookmarks, 'Bookmark');
    if (!filter || filter === 'History') addItems(results.history, 'History');
    if (!filter || filter === 'Extension') addItems(results.extensions, 'Extension');

    currentResults.forEach((obj, index) => {
      const { item, category } = obj;
      const div = document.createElement('div');
      div.className = 'result-item';
      
      let iconUrl = '';
      if (category === 'Tab' && item.favIconUrl) {
          iconUrl = item.favIconUrl;
      } else if (item.url) {
          iconUrl = `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(item.url)}`;
      }

      const imgHtml = iconUrl ? `<img src="${iconUrl}" class="result-icon">` : `<div class="result-icon-placeholder"></div>`;
      
      div.innerHTML = `${imgHtml} <span class="result-text"><strong>[${category}]</strong> ${item.title || item.name}</span>`;
      
      div.onmouseenter = () => {
        selectedIndex = index;
        updateSelection();
      };
      
      div.onclick = () => executeItem(obj);
      resultsDiv.appendChild(div);
    });

    updateSelection();
  });
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
    updateSelection();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex = Math.max(selectedIndex - 1, 0);
    updateSelection();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    
    const bangMatch = input.value.match(/^(![a-z])\s+(.*)/);
    if (bangMatch && BANGS[bangMatch[1]]) {
      const searchUrl = BANGS[bangMatch[1]] + encodeURIComponent(bangMatch[2]);
      window.open(searchUrl, '_blank');
      closeSpotlight();
      return;
    }

    if (currentResults.length > 0 && selectedIndex >= 0) {
      executeItem(currentResults[selectedIndex]);
    }
  } else if (e.key === 'Escape') {
      closeSpotlight();
  }
});