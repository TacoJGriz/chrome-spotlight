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
      chrome.bookmarks.search(query),
      chrome.history.search({ text: query, maxResults: 10 }),
      chrome.tabs.query({}),
      chrome.management.getAll()
    ]).then(([bookmarks, history, allTabs, extensions]) => {
      
      const filteredTabs = allTabs.filter(t => t.title.toLowerCase().includes(query) || (t.url && t.url.toLowerCase().includes(query)));
      const filteredExts = extensions.filter(e => e.name.toLowerCase().includes(query));

      sendResponse({
        bookmarks: bookmarks.slice(0, 5),
        history: history,
        tabs: filteredTabs.slice(0, 5),
        extensions: filteredExts.slice(0, 5)
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
});