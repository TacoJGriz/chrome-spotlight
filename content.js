const container = document.createElement('div');
container.id = 'custom-spotlight-container';
container.style.display = 'none';

const input = document.createElement('input');
input.id = 'custom-spotlight-input';
input.placeholder = 'Search bookmarks, history, tabs, or use !g ...';

const resultsDiv = document.createElement('div');
resultsDiv.id = 'custom-spotlight-results';

container.appendChild(input);
container.appendChild(resultsDiv);
document.body.appendChild(container);

const BANGS = {
  '!g': 'https://google.com/search?q=',
  '!w': 'https://en.wikipedia.org/wiki/Special:Search?search=',
  '!y': 'https://www.youtube.com/results?search_query='
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggle") {
    if (container.style.display === 'none') {
      container.style.display = 'block';
      input.focus();
    } else {
      container.style.display = 'none';
      input.value = '';
      resultsDiv.innerHTML = '';
    }
  }
});

input.addEventListener('input', async (e) => {
  const query = e.target.value.toLowerCase();
  
  if (query.length < 2) {
    resultsDiv.innerHTML = '';
    return;
  }

  const bangMatch = query.match(/^(![a-z])\s+(.*)/);
  if (bangMatch) {
    resultsDiv.innerHTML = `<div class="result-item">Press Enter to search web using ${bangMatch[1]}</div>`;
    return;
  }

  chrome.runtime.sendMessage({ action: "search", query: query }, (results) => {
    resultsDiv.innerHTML = '';
    
    const renderItems = (items, category) => {
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `<strong>[${category}]</strong> ${item.title || item.name}`;
        
        div.onclick = () => {
          if (item.url) window.location.href = item.url;
          else if (category === 'Tab') chrome.tabs.update(item.id, { active: true });
        };
        resultsDiv.appendChild(div);
      });
    };

    renderItems(results.tabs, 'Tab');
    renderItems(results.bookmarks, 'Bookmark');
    renderItems(results.history, 'History');
    renderItems(results.extensions, 'Extension');
  });
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const query = input.value;
    const bangMatch = query.match(/^(![a-z])\s+(.*)/);
    
    if (bangMatch && BANGS[bangMatch[1]]) {
      const searchUrl = BANGS[bangMatch[1]] + encodeURIComponent(bangMatch[2]);
      window.location.href = searchUrl;
    }
  }
  if (e.key === 'Escape') {
      container.style.display = 'none';
  }
});