const BANGS = {
  // --- Search Engines ---
  '!g': { name: 'Google', url: 'https://google.com/search?q=' },
  '!d': { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  '!b': { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  '!br': { name: 'Brave Search', url: 'https://search.brave.com/search?q=' },
  '!eco': { name: 'Ecosia', url: 'https://www.ecosia.org/search?q=' },
  '!k': { name: 'Kagi', url: 'https://kagi.com/search?q=' },
  '!y': { name: 'Yahoo', url: 'https://search.yahoo.com/search?p=' },

  // --- Video & Audio ---
  '!yt': { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=' },
  '!tw': { name: 'Twitch', url: 'https://www.twitch.tv/search?term=' },
  '!sp': { name: 'Spotify', url: 'https://open.spotify.com/search/' },
  '!sc': { name: 'SoundCloud', url: 'https://soundcloud.com/search?q=' },
  
  // --- Social & Forums ---
  '!r': { name: 'Reddit', url: 'https://www.reddit.com/search?q=' },
  '!x': { name: 'Twitter', url: 'https://twitter.com/search?q=' },
  '!li': { name: 'LinkedIn', url: 'https://www.linkedin.com/search/results/all/?keywords=' },
  '!pin': { name: 'Pinterest', url: 'https://www.pinterest.com/search/pins/?q=' },

  // --- Shopping ---
  '!a': { name: 'Amazon', url: 'https://www.amazon.com/s?k=' },
  '!eb': { name: 'eBay', url: 'https://www.ebay.com/sch/i.html?_nkw=' },
  '!ali': { name: 'AliExpress', url: 'https://www.aliexpress.com/wholesale?SearchText=' },
  '!wm': { name: 'Walmart', url: 'https://www.walmart.com/search?q=' },

  // --- Reference & Utilities ---
  '!w': { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Search?search=' },
  '!imdb': { name: 'IMDb', url: 'https://www.imdb.com/find?q=' },
  '!map': { name: 'Google Maps', url: 'https://www.google.com/maps/search/' },
  '!gif': { name: 'Giphy', url: 'https://giphy.com/search/' },
  '!th': { name: 'Thesaurus', url: 'https://www.thesaurus.com/browse/' },

  // --- Developer & Tech ---
  '!gh': { name: 'GitHub', url: 'https://github.com/search?q=' },
  '!so': { name: 'Stack Overflow', url: 'https://stackoverflow.com/search?q=' },
  '!m': { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/search?q=' },
  '!npm': { name: 'NPM', url: 'https://www.npmjs.com/search?q=' },
  '!py': { name: 'PyPI (Python)', url: 'https://pypi.org/search/?q=' },
  '!rs': { name: 'Crates.io (Rust)', url: 'https://crates.io/search?q=' },
  '!docker': { name: 'Docker Hub', url: 'https://hub.docker.com/search?q=' },
  '!aws': { name: 'AWS Docs', url: 'https://aws.amazon.com/search/?searchQuery=' },
  '!gcp': { name: 'Google Cloud', url: 'https://cloud.google.com/s/results?q=' },
  '!hn': { name: 'Hacker News', url: 'https://hn.algolia.com/?q=' },

  // --- AI Tools ---
  '!px': { name: 'Perplexity AI', url: 'https://www.perplexity.ai/search?q=' },
  '!gpt': { name: 'ChatGPT', url: 'https://chatgpt.com/?q=' },
  '!ph': { name: 'Phind', url: 'https://www.phind.com/search?q=' },
  '!hf': { name: 'Hugging Face', url: 'https://huggingface.co/search/full-text?q=' },
  '!poe': { name: 'Poe', url: 'https://poe.com/search?q=' },
  '!wmo': { name: 'Wolfram Alpha', url: 'https://www.wolframalpha.com/input/?i=' },
};