(function() {
  var ORIGIN = window.location.origin;
  var statsResponseSent = false;

  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.type === 'GET_STATS') {
      statsResponseSent = false;
      var handler = function(e) {
        if (e.source !== window || !e.data || e.data.source !== 'cc-interceptor') return;
        if (e.origin !== ORIGIN) return;
        if (e.data.type === 'CC_STATS') {
          window.removeEventListener('message', handler);
          if (statsResponseSent) return;
          statsResponseSent = true;
          var stats = e.data.stats || {};
          // Read JS heap if available
          try {
            if (performance && typeof performance.memory !== 'undefined' && performance.memory) {
              stats.ram = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            }
          } catch(ignore) {}
          sendResponse(stats);
        }
      };
      window.addEventListener('message', handler);
      window.postMessage({ source: 'cc-content', type: 'CC_GET_STATS' }, ORIGIN);
      setTimeout(function() {
        window.removeEventListener('message', handler);
        if (statsResponseSent) return;
        statsResponseSent = true;
        try { sendResponse({ removed: 0, kept: 0, ram: 0 }); } catch(e) {}
      }, 500);
      return true;
    }

    if (msg.type === 'SET_KEEP') {
      window.postMessage({ source: 'cc-content', type: 'CC_SET_CONFIG', keep: msg.value }, ORIGIN);
      sendResponse({ ok: true });
      return false;
    }

    if (msg.type === 'SET_PAUSED') {
      window.postMessage({ source: 'cc-content', type: 'CC_SET_CONFIG', paused: msg.paused }, ORIGIN);
      sendResponse({ ok: true });
      return false;
    }

    if (msg.type === 'SET_SHOW_INDICATOR') {
      window.postMessage({ source: 'cc-content', type: 'CC_SET_CONFIG', showIndicator: msg.show }, ORIGIN);
      sendResponse({ ok: true });
      return false;
    }

    if (msg.type === 'SET_LANG') {
      window.postMessage({ source: 'cc-content', type: 'CC_SET_CONFIG', lang: msg.lang }, ORIGIN);
      sendResponse({ ok: true });
      return false;
    }

    if (msg.type === 'SET_MODE') {
      window.postMessage({ source: 'cc-content', type: 'CC_SET_CONFIG', displayMode: msg.displayMode }, ORIGIN);
      sendResponse({ ok: true });
      return false;
    }

    sendResponse({ ok: false, error: 'unknown message type' });
    return false;
  });

  // Wait for interceptor ready, then send saved config
  var configSent = false;

  function sendConfig() {
    if (configSent) return;
    chrome.storage.local.get(['keepLast', 'paused', 'showIndicator', 'lang', 'displayMode'], function(data) {
      var config = {
        source: 'cc-content',
        type: 'CC_SET_CONFIG',
        keep: data.keepLast || 150,
        paused: data.paused || false,
        showIndicator: data.showIndicator !== false,
        lang: data.lang || 'en',
        displayMode: data.displayMode || 'all'
      };
      window.postMessage(config, ORIGIN);
      configSent = true;
    });
  }

  window.addEventListener('message', function(e) {
    if (e.source !== window || !e.data) return;
    if (e.origin !== ORIGIN) return;
    if (e.data.source === 'cc-interceptor' && e.data.type === 'CC_READY') {
      sendConfig();
    }
  });

  // Fallback: if interceptor loaded before content script, send after short delay
  setTimeout(function() {
    if (!configSent) sendConfig();
  }, 800);
})();
