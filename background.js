// === INSTALL / UPDATE ===
var SUPPORTED_LANGS = ['en', 'ru', 'uk', 'de', 'fr', 'es', 'it', 'pt', 'zh', 'ja', 'ko', 'tr', 'pl', 'nl', 'ar', 'hi', 'vi', 'th', 'id', 'sv', 'cs', 'ro', 'hu', 'el', 'he', 'da', 'fi', 'no'];

function detectLang() {
  var browserLang = (chrome.i18n.getUILanguage() || navigator.language || 'en').toLowerCase();
  var short = browserLang.split('-')[0];
  if (SUPPORTED_LANGS.indexOf(short) !== -1) return short;
  return 'en';
}

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      keepLast: 150,
      paused: false,
      showIndicator: true,
      displayMode: 'all',
      lang: detectLang()
    });
    console.log('[CC] Extension installed, defaults set');
  } else if (details.reason === 'update') {
    // Merge: only set keys that don't exist yet (new features in updates)
    chrome.storage.local.get(['keepLast', 'paused', 'showIndicator', 'displayMode', 'lang'], function(existing) {
      var defaults = { keepLast: 150, paused: false, showIndicator: true, displayMode: 'all', lang: detectLang() };
      var merged = {};
      var hasNew = false;
      Object.keys(defaults).forEach(function(key) {
        if (existing[key] === undefined) {
          merged[key] = defaults[key];
          hasNew = true;
        }
      });
      if (hasNew) {
        chrome.storage.local.set(merged);
        console.log('[CC] Extension updated, new defaults merged:', merged);
      }
    });
  }
});

// === BADGE ===
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateBadge' && sender.tab) {
    chrome.action.setBadgeText({
      text: request.count > 0 ? String(request.count) : '',
      tabId: sender.tab.id
    });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId: sender.tab.id });
    return false;
  }
});
