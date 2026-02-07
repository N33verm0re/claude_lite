// === ИНИЦИАЛИЗАЦИЯ ПРИ УСТАНОВКЕ ===
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({
    keepLast: 150,
    autoClean: true,
    paused: false,
    lang: 'en',
    theme: 'light'
  });
  console.log('[CC] Extension installed, defaults set');
});

// === BADGE ===
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateBadge' && sender.tab) {
    chrome.action.setBadgeText({
      text: request.count > 0 ? String(request.count) : '', 
      tabId: sender.tab.id
    });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId: sender.tab.id });
  }
  return true;
});
