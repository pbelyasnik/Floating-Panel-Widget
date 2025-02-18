async function initializeBookmarks() {
  const { jsBookmarks = [] } = await chrome.storage.local.get('jsBookmarks');
  window.postMessage({
    type: 'BOOKMARKS_LOADED',
    bookmarks: jsBookmarks
  }, '*');
}

initializeBookmarks();
