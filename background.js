// Trigger the UI when the shortcut is pressed
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-spotlight") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggle" });
    });
  }
});

// Handle data requests from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "search") {
    const query = request.query;
    
    Promise.all([
      chrome.bookmarks.search(query),
      chrome.history.search({ text: query, maxResults: 5 }),
      chrome.tabs.query({}),
      chrome.management.getAll()
    ]).then(([bookmarks, history, allTabs, extensions]) => {
      
      const filteredTabs = allTabs.filter(t => t.title.toLowerCase().includes(query) || t.url.toLowerCase().includes(query));
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
});