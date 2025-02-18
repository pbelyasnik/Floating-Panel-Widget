document.getElementById('readBookmarks').addEventListener('click', async () => {
  const bookmarks = await getJavaScriptBookmarks();
  await chrome.storage.local.set({ jsBookmarks: bookmarks });
  window.close();
});

async function getJavaScriptBookmarks() {
  const bookmarks = [];
  
  function traverseBookmarks(bookmarkNodes) {
    for (const node of bookmarkNodes) {
      if (node.url && node.url.startsWith('javascript:')) {
        bookmarks.push({
          title: node.title,
          code: node.url.substring(11) // Remove 'javascript:' prefix
        });
      }
      if (node.children) {
        traverseBookmarks(node.children);
      }
    }
  }

  const tree = await chrome.bookmarks.getTree();
  traverseBookmarks(tree);
  return bookmarks;
}
