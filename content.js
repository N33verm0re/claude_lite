(function() {
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.type === 'GET_STATS') {
      var handler = function(e) {
        if (e.data && e.data.source === 'cc-interceptor' && e.data.type === 'CC_STATS') {
          window.removeEventListener('message', handler);
          var stats = e.data.stats || {};
          if (performance && performance.memory) {
            stats.ram = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
          }
          sendResponse(stats);
        }
      };
      window.addEventListener('message', handler);
      window.postMessage({ source: 'cc-content', type: 'CC_GET_STATS' }, '*');
      setTimeout(function() {
        window.removeEventListener('message', handler);
        try { sendResponse({ removed: 0, kept: 0, ram: 0 }); } catch(e) {}
      }, 500);
      return true;
    }
    
    if (msg.type === 'SET_KEEP') {
      window.postMessage({ source: 'cc-content', type: 'CC_SET_CONFIG', keep: msg.value }, '*');
      sendResponse({ ok: true });
      return false;
    }
    
    if (msg.type === 'SET_PAUSED') {
      window.postMessage({ source: 'cc-content', type: 'CC_SET_CONFIG', paused: msg.paused }, '*');
      sendResponse({ ok: true });
      return false;
    }
    
    if (msg.type === 'SET_SHOW_INDICATOR') {
      window.postMessage({ source: 'cc-content', type: 'CC_SET_CONFIG', showIndicator: msg.show }, '*');
      sendResponse({ ok: true });
      return false;
    }
    
    if (msg.type === 'SET_LANG') {
      window.postMessage({ source: 'cc-content', type: 'CC_SET_CONFIG', lang: msg.lang }, '*');
      sendResponse({ ok: true });
      return false;
    }
    
    if (msg.type === 'SET_MODE') {
      window.postMessage({ source: 'cc-content', type: 'CC_SET_CONFIG', displayMode: msg.displayMode }, '*');
      sendResponse({ ok: true });
      return false;
    }
    
    sendResponse({ ok: false, error: 'unknown message type' });
    return false;
  });
  
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
    var sendConfig = function() { window.postMessage(config, '*'); };
    sendConfig();
    setTimeout(sendConfig, 500);
    setTimeout(sendConfig, 1500);
  });
})();
