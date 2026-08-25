chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-spotlight") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "toggle" });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "search") {
    const query = request.query;

    Promise.all([
      chrome.bookmarks.search(query.length > 0 ? query : {}),
      chrome.history.search({ text: query, maxResults: 25 }),
      chrome.tabs.query({}),
      chrome.management.getAll()
    ]).then(([bookmarks, history, tabs, extensions]) => {
      sendResponse({
        bookmarks: bookmarks.filter(b => b.url), // Ignore folders
        history: history,
        tabs: tabs,
        extensions: extensions
      });
    });
    return true;
  }

  if (request.action === "switchToTab") {
    chrome.tabs.update(request.tabId, { active: true });
    if (request.windowId) {
      chrome.windows.update(request.windowId, { focused: true });
    }
  }

  if (request.action === "defaultSearch") {
    chrome.search.query({ 
      text: request.query, 
      disposition: "NEW_TAB" 
    });
  }
});