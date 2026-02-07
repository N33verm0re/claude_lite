(function() {
  var elements = {};
  var originalKeep = 150;
  var originalMode = 'all';
  
  function init() {
    elements = {
      keepInput: document.getElementById('keepInput'),
      pauseToggle: document.getElementById('pauseToggle'),
      indicatorToggle: document.getElementById('indicatorToggle'),
      langSelect: document.getElementById('langSelect'),
      confirmBar: document.getElementById('confirmBar'),
      confirmOldValue: document.getElementById('confirmOldValue'),
      confirmNewValue: document.getElementById('confirmNewValue'),
      confirmUndo: document.getElementById('confirmUndo'),
      confirmReload: document.getElementById('confirmReload'),
      profileBtns: document.querySelectorAll('.profile-btn'),
      modeOptions: document.querySelectorAll('.mode-option')
    };
    loadSettings();
    setupEventListeners();
  }
  
  function loadSettings() {
    chrome.storage.local.get(['keepLast', 'paused', 'showIndicator', 'lang', 'displayMode'], function(data) {
      originalKeep = data.keepLast || 150;
      originalMode = data.displayMode || 'all';
      elements.keepInput.value = originalKeep;
      elements.pauseToggle.checked = data.paused || false;
      elements.indicatorToggle.checked = data.showIndicator !== false;
      elements.langSelect.value = data.lang || 'en';
      updateProfileButtons(originalKeep);
      updateModeSelection(originalMode);
      applyTranslations(data.lang || 'en');
      document.body.className = 'mode-' + originalMode;
    });
  }
  
  function setupEventListeners() {
    elements.profileBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var keep = parseInt(this.dataset.keep);
        elements.keepInput.value = keep;
        updateProfileButtons(keep);
        checkForChanges(keep, getCurrentMode());
        chrome.storage.local.set({ keepLast: keep });
        sendToTab('SET_KEEP', { value: keep });
      });
    });
    
    elements.keepInput.addEventListener('change', function() {
      var keep = Math.max(2, Math.min(500, parseInt(this.value) || 150));
      this.value = keep;
      updateProfileButtons(keep);
      checkForChanges(keep, getCurrentMode());
      chrome.storage.local.set({ keepLast: keep });
      sendToTab('SET_KEEP', { value: keep });
    });
    
    elements.pauseToggle.addEventListener('change', function() {
      chrome.storage.local.set({ paused: this.checked });
      sendToTab('SET_PAUSED', { paused: this.checked });
    });
    
    elements.indicatorToggle.addEventListener('change', function() {
      chrome.storage.local.set({ showIndicator: this.checked });
      sendToTab('SET_SHOW_INDICATOR', { show: this.checked });
    });
    
    elements.langSelect.addEventListener('change', function() {
      var lang = this.value;
      chrome.storage.local.set({ lang: lang });
      sendToTab('SET_LANG', { lang: lang });
      applyTranslations(lang);
    });
    
    elements.modeOptions.forEach(function(opt) {
      opt.addEventListener('click', function() {
        var mode = this.dataset.mode;
        updateModeSelection(mode);
        document.body.className = 'mode-' + mode;
        checkForChanges(parseInt(elements.keepInput.value), mode);
        chrome.storage.local.set({ displayMode: mode });
        sendToTab('SET_MODE', { displayMode: mode });
      });
    });
    
    elements.confirmUndo.addEventListener('click', function() {
      elements.keepInput.value = originalKeep;
      updateProfileButtons(originalKeep);
      updateModeSelection(originalMode);
      document.body.className = 'mode-' + originalMode;
      chrome.storage.local.set({ keepLast: originalKeep, displayMode: originalMode });
      sendToTab('SET_KEEP', { value: originalKeep });
      sendToTab('SET_MODE', { displayMode: originalMode });
      hideConfirmBar();
    });
    
    elements.confirmReload.addEventListener('click', function() {
      originalKeep = parseInt(elements.keepInput.value);
      originalMode = getCurrentMode();
      hideConfirmBar();
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('claude.ai')) {
          chrome.tabs.reload(tabs[0].id);
          window.close();
        }
      });
    });
  }
  
  function getCurrentMode() {
    var active = document.querySelector('.mode-option.active');
    return active ? active.dataset.mode : 'all';
  }
  
  function updateProfileButtons(keep) {
    elements.profileBtns.forEach(function(btn) {
      btn.classList.toggle('active', parseInt(btn.dataset.keep) === keep);
    });
  }
  
  function updateModeSelection(mode) {
    elements.modeOptions.forEach(function(opt) {
      opt.classList.toggle('active', opt.dataset.mode === mode);
    });
  }
  
  function checkForChanges(keep, mode) {
    var keepChanged = keep !== originalKeep;
    var modeChanged = mode !== originalMode;
    
    if (keepChanged || modeChanged) {
      var oldText = '', newText = '';
      if (keepChanged && modeChanged) {
        oldText = originalKeep + '/' + getShortMode(originalMode);
        newText = keep + '/' + getShortMode(mode);
      } else if (keepChanged) {
        oldText = originalKeep;
        newText = keep;
      } else {
        oldText = getShortMode(originalMode);
        newText = getShortMode(mode);
      }
      showConfirmBar(oldText, newText);
    } else {
      hideConfirmBar();
    }
  }
  
  function getShortMode(mode) {
    var labels = { all: 'Full', limits_only: 'Lim', optimizer_only: 'Opt' };
    return labels[mode] || mode;
  }
  
  function showConfirmBar(oldVal, newVal) {
    elements.confirmOldValue.textContent = oldVal;
    elements.confirmNewValue.textContent = newVal;
    elements.confirmBar.classList.add('show');
  }
  
  function hideConfirmBar() {
    elements.confirmBar.classList.remove('show');
  }
  
  function sendToTab(type, data) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('claude.ai')) {
        chrome.tabs.sendMessage(tabs[0].id, Object.assign({ type: type }, data)).catch(function() {});
      }
    });
  }
  
  function applyTranslations(lang) {
    if (typeof i18n !== 'undefined' && i18n[lang]) {
      document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) el.textContent = i18n[lang][key];
      });
    }
  }
  
  document.addEventListener('DOMContentLoaded', init);
})();
