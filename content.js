let currentResults = [];
let selectedIndex = 0;

const container = document.createElement('div');
container.id = 'custom-spotlight-container';
container.style.display = 'none';

const input = document.createElement('input');
input.id = 'custom-spotlight-input';
input.placeholder = 'Search or use /t, /b, /h, /e, or !d ...';
input.autocomplete = 'off';
input.spellcheck = false;

const resultsDiv = document.createElement('div');
resultsDiv.id = 'custom-spotlight-results';

container.appendChild(input);
container.appendChild(resultsDiv);
document.body.appendChild(container);

const BANGS = {
  '!g': 'https://google.com/search?q=',
  '!w': 'https://en.wikipedia.org/wiki/Special:Search?search=',
  '!y': 'https://www.youtube.com/results?search_query=',
  '!d': 'https://duckduckgo.com/?q='
};

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

  let score = 0;
  let tIdx = 0;
  let qIdx = 0;
  let consecutiveMatches = 0;

  while (tIdx < t.length && qIdx < q.length) {
    if (t[tIdx] === q[qIdx]) {
      qIdx++;
      consecutiveMatches++;
      score += 10 + (consecutiveMatches * 5);
    } else {
      consecutiveMatches = 0;
    }
    tIdx++;
  }

  if (qIdx === q.length) {
    return score - (t.length * 0.1);
  }

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

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggle") {
    if (container.style.display === 'none') {
      openSpotlight();
    } else {
      closeSpotlight();
    }
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
    resultsDiv.innerHTML = `<div class="result-item selected">Press Enter to search web using ${bangMatch[1]}</div>`;
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
    currentResults = pool.slice(0, 10);
    selectedIndex = 0;

    resultsDiv.innerHTML = '';
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
  if (e.key === 'Tab') {
    e.preventDefault();
    if (currentResults.length > 0) {
      if (e.shiftKey) {
        selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
      } else {
        selectedIndex = (selectedIndex + 1) % currentResults.length;
      }
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
    const bangMatch = input.value.trim().match(/^(![a-z])\s+(.*)/);
    if (bangMatch && BANGS[bangMatch[1]]) {
      window.open(BANGS[bangMatch[1]] + encodeURIComponent(bangMatch[2]), '_blank');
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