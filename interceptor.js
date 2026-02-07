(function() {
  if (window.__ccInterceptor) return;
  window.__ccInterceptor = true;
  
  var config = { keep: 150, paused: false, debug: true, showIndicator: true, lang: 'en', displayMode: 'all' };
  
  var i18n = {
    en: { ready: 'Ready', paused: 'Paused', msgs: 'msgs', removed: 'Removed', kept: 'Kept', sessionTrims: 'Session trims', storedSearch: 'Stored for search', searchPlaceholder: 'Search removed messages...', noResults: 'No results found', you: 'You', trimmed: 'Trimmed', jsHeap: 'JS Heap', dragTip: 'Drag to move', sessionLimit: 'Session', weeklyLimit: 'Weekly', resetsIn: 'Resets in', used: 'used', claudeLimits: 'Claude.ai Limits', extensionStats: 'Extension Stats', loading: '...' },
    ru: { ready: 'Готов', paused: 'Пауза', msgs: 'сообщ.', removed: 'Удалено', kept: 'Оставлено', sessionTrims: 'Очисток', storedSearch: 'Для поиска', searchPlaceholder: 'Поиск...', noResults: 'Не найдено', you: 'Вы', trimmed: 'Очищено', jsHeap: 'JS Heap', dragTip: 'Перетащите', sessionLimit: 'Сессия', weeklyLimit: 'Неделя', resetsIn: 'Сброс через', used: 'исп.', claudeLimits: 'Лимиты Claude.ai', extensionStats: 'Статистика', loading: '...' },
    uk: { ready: 'Готовий', paused: 'Пауза', msgs: 'повід.', removed: 'Видалено', kept: 'Залишено', sessionTrims: 'Очищень', storedSearch: 'Для пошуку', searchPlaceholder: 'Пошук...', noResults: 'Не знайдено', you: 'Ви', trimmed: 'Очищено', jsHeap: 'JS Heap', dragTip: 'Перетягніть', sessionLimit: 'Сесія', weeklyLimit: 'Тиждень', resetsIn: 'Скидання через', used: 'вик.', claudeLimits: 'Ліміти Claude.ai', extensionStats: 'Статистика', loading: '...' },
    de: { ready: 'Bereit', paused: 'Pause', msgs: 'Nachr.', removed: 'Entfernt', kept: 'Behalten', sessionTrims: 'Bereinigungen', storedSearch: 'Gespeichert', searchPlaceholder: 'Suchen...', noResults: 'Keine Ergebnisse', you: 'Sie', trimmed: 'Bereinigt', jsHeap: 'JS Heap', dragTip: 'Ziehen', sessionLimit: 'Sitzung', weeklyLimit: 'Woche', resetsIn: 'Reset in', used: 'genutzt', claudeLimits: 'Claude.ai Limits', extensionStats: 'Erweiterung', loading: '...' },
    fr: { ready: 'Prêt', paused: 'Pause', msgs: 'msgs', removed: 'Supprimés', kept: 'Gardés', sessionTrims: 'Nettoyages', storedSearch: 'Stockés', searchPlaceholder: 'Rechercher...', noResults: 'Aucun résultat', you: 'Vous', trimmed: 'Nettoyé', jsHeap: 'JS Heap', dragTip: 'Glisser', sessionLimit: 'Session', weeklyLimit: 'Semaine', resetsIn: 'Reset dans', used: 'utilisé', claudeLimits: 'Limites Claude.ai', extensionStats: 'Extension', loading: '...' },
    es: { ready: 'Listo', paused: 'Pausa', msgs: 'msgs', removed: 'Eliminados', kept: 'Mantenidos', sessionTrims: 'Limpiezas', storedSearch: 'Guardados', searchPlaceholder: 'Buscar...', noResults: 'Sin resultados', you: 'Tú', trimmed: 'Limpiado', jsHeap: 'JS Heap', dragTip: 'Arrastrar', sessionLimit: 'Sesión', weeklyLimit: 'Semana', resetsIn: 'Reinicia en', used: 'usado', claudeLimits: 'Límites Claude.ai', extensionStats: 'Extensión', loading: '...' },
    it: { ready: 'Pronto', paused: 'Pausa', msgs: 'msgs', removed: 'Rimossi', kept: 'Mantenuti', sessionTrims: 'Pulizie', storedSearch: 'Salvati', searchPlaceholder: 'Cerca...', noResults: 'Nessun risultato', you: 'Tu', trimmed: 'Pulito', jsHeap: 'JS Heap', dragTip: 'Trascina', sessionLimit: 'Sessione', weeklyLimit: 'Settimana', resetsIn: 'Reset tra', used: 'usato', claudeLimits: 'Limiti Claude.ai', extensionStats: 'Estensione', loading: '...' },
    pt: { ready: 'Pronto', paused: 'Pausa', msgs: 'msgs', removed: 'Removidos', kept: 'Mantidos', sessionTrims: 'Limpezas', storedSearch: 'Guardados', searchPlaceholder: 'Buscar...', noResults: 'Sem resultados', you: 'Você', trimmed: 'Limpo', jsHeap: 'JS Heap', dragTip: 'Arrastar', sessionLimit: 'Sessão', weeklyLimit: 'Semana', resetsIn: 'Reinicia em', used: 'usado', claudeLimits: 'Limites Claude.ai', extensionStats: 'Extensão', loading: '...' },
    zh: { ready: '就绪', paused: '暂停', msgs: '消息', removed: '已删除', kept: '已保留', sessionTrims: '清理次数', storedSearch: '已存储', searchPlaceholder: '搜索...', noResults: '无结果', you: '你', trimmed: '已清理', jsHeap: 'JS Heap', dragTip: '拖动', sessionLimit: '会话', weeklyLimit: '每周', resetsIn: '重置于', used: '已用', claudeLimits: 'Claude.ai 限额', extensionStats: '扩展统计', loading: '...' }
  };
  
  function t(key) { return (i18n[config.lang] || i18n.en)[key] || i18n.en[key] || key; }
  
  var CURRENT_LEAF = null, SESSION_STATS = { totalTrimmed: 0, trimCount: 0, estimatedRamSaved: 0 }, REMOVED_MESSAGES = [], MAX_REMOVED_STORAGE = 2000, DEBUG_LOG = [], MAX_LOG_ENTRIES = 100, currentRAM = 0, indicatorPos = { right: 20, bottom: 20 }, usageLimits = null, chatOrgUuid = null;
  
  var ICONS = {
    bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51L12.96 17.55 11 21z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    bot: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5z"/></svg>',
    grip: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>',
    claude: '<svg viewBox="0 0 24 24" fill="#D97757"><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill-rule="nonzero"/></svg>'
  };
  
  function addLog(type, data) { DEBUG_LOG.push({ time: new Date().toISOString(), type: type, data: data }); if (DEBUG_LOG.length > MAX_LOG_ENTRIES) DEBUG_LOG.shift(); try { sessionStorage.setItem('cc_debug_log', JSON.stringify(DEBUG_LOG)); } catch(e) {} }
  
  try { var savedLeaf = sessionStorage.getItem('cc_leaf'); if (savedLeaf) CURRENT_LEAF = savedLeaf; var savedSession = sessionStorage.getItem('cc_session'); if (savedSession) SESSION_STATS = JSON.parse(savedSession); var savedLog = sessionStorage.getItem('cc_debug_log'); if (savedLog) DEBUG_LOG = JSON.parse(savedLog); var savedRemoved = sessionStorage.getItem('cc_removed'); if (savedRemoved) REMOVED_MESSAGES = JSON.parse(savedRemoved); var savedPos = localStorage.getItem('cc_indicator_pos'); if (savedPos) indicatorPos = JSON.parse(savedPos); } catch(e) {}
  
  function log() { if (config.debug) console.log.apply(console, ['[CC]'].concat(Array.prototype.slice.call(arguments))); }
  function showLimits() { return config.displayMode === 'all' || config.displayMode === 'limits_only'; }
  function showOptimizer() { return config.displayMode === 'all' || config.displayMode === 'optimizer_only'; }
  
  function formatResetTime(resetAt) { var resetTime = new Date(resetAt); var now = new Date(); var diffMs = resetTime - now; if (diffMs < 0) return '0m'; var diffMins = Math.floor(diffMs / 60000); var hours = Math.floor(diffMins / 60); var mins = diffMins % 60; if (hours > 0) return hours + 'h ' + mins + 'm'; return mins + 'm'; }
  
  async function fetchUsageLimits() {
    if (!showLimits()) return null;
    try {
      if (!chatOrgUuid) { var orgs = await fetch('/api/organizations').then(function(r) { return r.json(); }); var chatOrg = orgs.find(function(o) { return o.capabilities && o.capabilities.includes('chat'); }); if (chatOrg) { chatOrgUuid = chatOrg.uuid; log('📊 Found chat org:', chatOrgUuid); } }
      if (!chatOrgUuid) return null;
      var usage = await fetch('/api/organizations/' + chatOrgUuid + '/usage').then(function(r) { return r.json(); });
      if (usage.type === 'error') { log('⚠️ Usage API error:', usage.error); return null; }
      usageLimits = { session: usage.five_hour ? { percent: usage.five_hour.utilization, resetsIn: formatResetTime(usage.five_hour.resets_at), resetsAt: usage.five_hour.resets_at } : null, weekly: usage.seven_day ? { percent: usage.seven_day.utilization, resetsIn: formatResetTime(usage.seven_day.resets_at), resetsAt: usage.seven_day.resets_at } : null };
      log('📊 Limits:', usageLimits); updateIndicatorLimits(); updatePanelLimits();
      return usageLimits;
    } catch(e) { log('⚠️ Failed to fetch limits:', e); return null; }
  }
  
  function scrollToBottom() {
    requestAnimationFrame(function() {
      setTimeout(function() {
        var selectors = ['[class*="scrollable"]', '[class*="conversation"]', '[class*="messages"]', 'main [style*="overflow"]', 'main > div > div'];
        var scrollContainer = null;
        for (var i = 0; i < selectors.length; i++) { var els = document.querySelectorAll(selectors[i]); for (var j = 0; j < els.length; j++) { var el = els[j]; var style = window.getComputedStyle(el); if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) { scrollContainer = el; break; } } if (scrollContainer) break; }
        if (scrollContainer) { scrollContainer.scrollTop = scrollContainer.scrollHeight; log('📜 Scrolled to bottom'); }
      }, 100);
    });
  }
  
  var indicator = null, panel = null, isDragging = false, dragStartX, dragStartY, startRight, startBottom, ramInterval = null, limitsInterval = null;
  
  function getCircleColor(percent) { if (percent >= 80) return '#ef4444'; if (percent >= 50) return '#f59e0b'; return '#10b981'; }
  function createCircularProgress(percent, size) { var radius = (size - 4) / 2; var circumference = 2 * Math.PI * radius; var offset = circumference - (percent / 100) * circumference; var color = getCircleColor(percent); return '<svg width="' + size + '" height="' + size + '" class="cc-circle-progress"><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + radius + '" fill="none" stroke="#2e2e4a" stroke-width="3"/><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + radius + '" fill="none" stroke="' + color + '" stroke-width="3" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '" stroke-linecap="round" transform="rotate(-90 ' + (size/2) + ' ' + (size/2) + ')" class="cc-circle-fill"/><text x="' + (size/2) + '" y="' + (size/2) + '" text-anchor="middle" dominant-baseline="central" fill="#f1f5f9" font-size="8" font-weight="600">' + percent + '%</text></svg>'; }
  
  function buildIndicatorHTML() {
    var html = '<span class="cc-grip" title="' + t('dragTip') + '">' + ICONS.grip + '</span>';
    html += '<div class="cc-indicator-content"><div class="cc-row">';
    if (showOptimizer()) { html += '<span class="cc-icon">' + ICONS.bolt + '</span><span class="cc-text">' + t('ready') + '</span><div class="cc-mini-ram"><div class="cc-mini-ram-fill"></div></div>'; }
    if (showLimits()) { html += '<span class="cc-circle-wrap" id="cc-session-circle">' + createCircularProgress(0, 28) + '</span>'; }
    html += '</div></div>';
    return html;
  }
  
  // Global mouse handlers for drag (attached once to document)
  var dragHandlersAttached = false;
  function attachGlobalDragHandlers() {
    if (dragHandlersAttached) return;
    dragHandlersAttached = true;
    
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var deltaX = dragStartX - e.clientX;
      var deltaY = dragStartY - e.clientY;
      indicatorPos.right = Math.max(10, Math.min(window.innerWidth - 150, startRight + deltaX));
      indicatorPos.bottom = Math.max(10, Math.min(window.innerHeight - 50, startBottom + deltaY));
      indicator.style.right = indicatorPos.right + 'px';
      indicator.style.bottom = indicatorPos.bottom + 'px';
    });
    
    document.addEventListener('mouseup', function() {
      if (!isDragging) return;
      isDragging = false;
      if (indicator) indicator.classList.remove('dragging');
      try { localStorage.setItem('cc_indicator_pos', JSON.stringify(indicatorPos)); } catch(e) {}
    });
  }
  
  function setupDragHandlers() {
    if (!indicator) return;
    var grip = indicator.querySelector('.cc-grip');
    if (!grip) return;
    
    grip.onmousedown = function(e) {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      startRight = indicatorPos.right;
      startBottom = indicatorPos.bottom;
      indicator.classList.add('dragging');
      if (panel) panel.classList.remove('show');
      log('🎯 Drag started');
    };
  }
  
  function createIndicator() {
    if (indicator || !config.showIndicator || !document.body) return;
    indicator = document.createElement('div'); indicator.id = 'cc-indicator'; indicator.innerHTML = buildIndicatorHTML();
    var style = document.createElement('style'); style.id = 'cc-indicator-style';
    style.textContent = '#cc-indicator{position:fixed;bottom:' + indicatorPos.bottom + 'px;right:' + indicatorPos.right + 'px;padding:8px 12px;background:#1e1e32;border:1px solid #2e2e4a;color:#f1f5f9;border-radius:14px;font-size:12px;font-weight:600;z-index:999998;cursor:pointer;user-select:none;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;transition:opacity 0.2s,transform 0.2s,box-shadow 0.2s;opacity:0.95}#cc-indicator:hover{opacity:1;box-shadow:0 6px 20px rgba(0,0,0,0.4)}#cc-indicator.dragging{opacity:1;transform:scale(1.05);cursor:grabbing;transition:none}#cc-indicator .cc-grip{width:14px;height:14px;display:flex;color:#64748b;cursor:grab;opacity:0.6;transition:opacity 0.2s,color 0.2s;flex-shrink:0}#cc-indicator:hover .cc-grip{opacity:1;color:#94a3b8}#cc-indicator.dragging .cc-grip{cursor:grabbing;opacity:1;color:#6366f1}#cc-indicator .cc-indicator-content{display:flex}#cc-indicator .cc-row{display:flex;align-items:center;gap:8px}#cc-indicator .cc-circle-wrap{display:flex;margin-left:4px}#cc-indicator .cc-circle-progress{display:block}#cc-indicator .cc-icon{width:16px;height:16px;display:flex;color:#6366f1;flex-shrink:0}#cc-indicator .cc-icon svg{width:100%;height:100%}#cc-indicator.paused{border-color:#f59e0b}#cc-indicator.paused .cc-icon{color:#f59e0b}#cc-indicator .cc-text{min-width:60px}#cc-indicator .cc-mini-ram{width:40px;height:4px;background:#0f0f1a;border-radius:2px;overflow:hidden}#cc-indicator .cc-mini-ram-fill{height:100%;background:linear-gradient(90deg,#10b981,#34d399);border-radius:2px;transition:width 0.3s}#cc-indicator .cc-mini-ram-fill.warn{background:linear-gradient(90deg,#f59e0b,#fbbf24)}#cc-indicator .cc-mini-ram-fill.danger{background:linear-gradient(90deg,#ef4444,#f87171)}#cc-indicator-panel{position:fixed;width:320px;background:#1e1e32;border:1px solid #2e2e4a;border-radius:16px;padding:16px;z-index:999999;display:none;box-shadow:0 8px 30px rgba(0,0,0,0.4)}#cc-indicator-panel.show{display:block;animation:ccSlideUp 0.2s ease}@keyframes ccSlideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}#cc-indicator-panel h4{margin:0 0 12px;color:#f1f5f9;font-size:14px;display:flex;align-items:center;gap:8px}#cc-indicator-panel h4 svg{width:18px;height:18px;color:#6366f1}#cc-indicator-panel .cc-section{margin-bottom:16px;padding:12px;background:#0f0f1a;border-radius:12px}#cc-indicator-panel .cc-section:last-of-type{margin-bottom:12px}#cc-indicator-panel .cc-section-title{font-size:11px;text-transform:uppercase;color:#64748b;margin-bottom:10px;letter-spacing:0.5px;display:flex;align-items:center;gap:6px}#cc-indicator-panel .cc-section-title svg{width:14px;height:14px}#cc-indicator-panel .cc-stat{display:flex;justify-content:space-between;padding:6px 0;color:#94a3b8;font-size:13px}#cc-indicator-panel .cc-stat span:last-child{color:#f1f5f9;font-weight:600}#cc-indicator-panel .cc-limit-row{margin-bottom:12px}#cc-indicator-panel .cc-limit-row:last-child{margin-bottom:0}#cc-indicator-panel .cc-limit-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}#cc-indicator-panel .cc-limit-label{color:#94a3b8;font-size:12px}#cc-indicator-panel .cc-limit-value{color:#f1f5f9;font-weight:600;font-size:13px}#cc-indicator-panel .cc-limit-bar{height:8px;background:#2e2e4a;border-radius:4px;overflow:hidden;margin-bottom:4px}#cc-indicator-panel .cc-limit-bar-fill{height:100%;border-radius:4px;transition:width 0.3s}#cc-indicator-panel .cc-limit-bar-fill.green{background:linear-gradient(90deg,#10b981,#34d399)}#cc-indicator-panel .cc-limit-bar-fill.yellow{background:linear-gradient(90deg,#f59e0b,#fbbf24)}#cc-indicator-panel .cc-limit-bar-fill.red{background:linear-gradient(90deg,#ef4444,#f87171)}#cc-indicator-panel .cc-limit-reset{color:#64748b;font-size:11px}#cc-indicator-panel .cc-ram-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}#cc-indicator-panel .cc-ram-label{color:#94a3b8;font-size:12px}#cc-indicator-panel .cc-ram-value{color:#f1f5f9;font-weight:600}#cc-indicator-panel .cc-ram-bar{height:6px;background:#2e2e4a;border-radius:3px;overflow:hidden}#cc-indicator-panel .cc-ram-bar-fill{height:100%;background:linear-gradient(90deg,#10b981,#34d399);border-radius:3px;transition:width 0.3s}#cc-indicator-panel .cc-ram-bar-fill.warn{background:linear-gradient(90deg,#f59e0b,#fbbf24)}#cc-indicator-panel .cc-ram-bar-fill.danger{background:linear-gradient(90deg,#ef4444,#f87171)}#cc-indicator-panel .cc-search-wrap{position:relative;margin-top:12px}#cc-indicator-panel .cc-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:#64748b}#cc-indicator-panel .cc-search{width:100%;padding:10px 12px 10px 36px;background:#0f0f1a;border:1px solid #2e2e4a;border-radius:10px;color:#f1f5f9;font-size:13px;box-sizing:border-box}#cc-indicator-panel .cc-search:focus{outline:none;border-color:#6366f1}#cc-indicator-panel .cc-search::placeholder{color:#64748b}#cc-indicator-panel .cc-results{max-height:180px;overflow-y:auto;margin-top:12px}#cc-indicator-panel .cc-result{padding:10px;background:#0f0f1a;border-radius:8px;margin-bottom:8px;font-size:12px;color:#94a3b8}#cc-indicator-panel .cc-result-sender{color:#6366f1;font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:6px}#cc-indicator-panel .cc-result-sender svg{width:14px;height:14px}#cc-indicator-panel .cc-result-text{color:#f1f5f9}#cc-indicator-panel .cc-result mark{background:#6366f1;color:white;padding:0 2px;border-radius:2px}';
    document.head.appendChild(style); document.body.appendChild(indicator);
    
    panel = document.createElement('div'); panel.id = 'cc-indicator-panel'; updatePanelHTML(); document.body.appendChild(panel);
    
    // Setup drag
    attachGlobalDragHandlers();
    setupDragHandlers();
    
    // Click to toggle panel
    indicator.addEventListener('click', function(e) {
      if (isDragging || e.target.closest('.cc-grip')) return;
      e.stopPropagation();
      panel.classList.toggle('show');
      updatePanel();
      updatePanelPosition();
    });
    
    document.addEventListener('click', function(e) {
      if (panel && !panel.contains(e.target) && !indicator.contains(e.target)) panel.classList.remove('show');
    });
    
    setupSearch(); startRAMUpdates(); startLimitsUpdates();
    log('✅ Indicator created (mode: ' + config.displayMode + ')');
  }
  
  function rebuildIndicator() {
    if (indicator) {
      indicator.innerHTML = buildIndicatorHTML();
      setupDragHandlers();
      updateIndicator();
      updateIndicatorLimits();
      updateIndicatorRAM();
    }
    updatePanelHTML();
  }
  
  function startRAMUpdates() { if (ramInterval) return; updateIndicatorRAM(); ramInterval = setInterval(function() { if (performance && performance.memory) { currentRAM = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024); updateIndicatorRAM(); updatePanelRAM(); } }, 2000); }
  function startLimitsUpdates() { if (limitsInterval) return; if (showLimits()) { fetchUsageLimits(); limitsInterval = setInterval(fetchUsageLimits, 60000); } }
  function getLimitColorClass(percent) { if (percent >= 80) return 'red'; if (percent >= 50) return 'yellow'; return 'green'; }
  function updateIndicatorLimits() { if (!indicator || !showLimits()) return; var circleWrap = document.getElementById('cc-session-circle'); if (circleWrap && usageLimits && usageLimits.session) circleWrap.innerHTML = createCircularProgress(usageLimits.session.percent, 28); }
  function updateIndicatorRAM() { if (!indicator || !showOptimizer()) return; var fill = indicator.querySelector('.cc-mini-ram-fill'); if (fill) { var percent = Math.min(100, Math.round(currentRAM / 8)); fill.style.width = percent + '%'; fill.classList.remove('warn', 'danger'); if (currentRAM > 500) fill.classList.add('danger'); else if (currentRAM > 300) fill.classList.add('warn'); } }
  function updatePanelLimits() { if (!showLimits() || !usageLimits) return; var sessionFill = document.getElementById('cc-panel-session-fill'); var sessionPercent = document.getElementById('cc-panel-session-percent'); var sessionReset = document.getElementById('cc-panel-session-reset'); if (usageLimits.session) { if (sessionFill) { sessionFill.style.width = usageLimits.session.percent + '%'; sessionFill.className = 'cc-limit-bar-fill ' + getLimitColorClass(usageLimits.session.percent); } if (sessionPercent) sessionPercent.textContent = usageLimits.session.percent + '% ' + t('used'); if (sessionReset) sessionReset.textContent = t('resetsIn') + ' ' + usageLimits.session.resetsIn; } var weeklyFill = document.getElementById('cc-panel-weekly-fill'); var weeklyPercent = document.getElementById('cc-panel-weekly-percent'); var weeklyReset = document.getElementById('cc-panel-weekly-reset'); if (usageLimits.weekly) { if (weeklyFill) { weeklyFill.style.width = usageLimits.weekly.percent + '%'; weeklyFill.className = 'cc-limit-bar-fill ' + getLimitColorClass(usageLimits.weekly.percent); } if (weeklyPercent) weeklyPercent.textContent = usageLimits.weekly.percent + '% ' + t('used'); if (weeklyReset) weeklyReset.textContent = t('resetsIn') + ' ' + usageLimits.weekly.resetsIn; } }
  function updatePanelPosition() { if (!panel || !indicator) return; var indicatorRect = indicator.getBoundingClientRect(); if (indicatorRect.top > 520) { panel.style.bottom = (window.innerHeight - indicatorRect.top + 10) + 'px'; panel.style.top = 'auto'; } else { panel.style.top = (indicatorRect.bottom + 10) + 'px'; panel.style.bottom = 'auto'; } panel.style.right = (indicatorPos.right < 180 ? indicatorPos.right : Math.max(10, indicatorPos.right - 160)) + 'px'; panel.style.left = 'auto'; }
  
  function updatePanelHTML() {
    if (!panel) return;
    var html = '<h4>' + ICONS.bolt + ' Claude Lite</h4>';
    if (showLimits()) { html += '<div class="cc-section"><div class="cc-section-title">' + ICONS.claude + ' ' + t('claudeLimits') + '</div><div class="cc-limit-row"><div class="cc-limit-header"><span class="cc-limit-label">' + t('sessionLimit') + '</span><span class="cc-limit-value" id="cc-panel-session-percent">' + t('loading') + '</span></div><div class="cc-limit-bar"><div class="cc-limit-bar-fill green" id="cc-panel-session-fill" style="width:0%"></div></div><div class="cc-limit-reset" id="cc-panel-session-reset"></div></div><div class="cc-limit-row"><div class="cc-limit-header"><span class="cc-limit-label">' + t('weeklyLimit') + '</span><span class="cc-limit-value" id="cc-panel-weekly-percent">' + t('loading') + '</span></div><div class="cc-limit-bar"><div class="cc-limit-bar-fill green" id="cc-panel-weekly-fill" style="width:0%"></div></div><div class="cc-limit-reset" id="cc-panel-weekly-reset"></div></div></div>'; }
    if (showOptimizer()) { html += '<div class="cc-section"><div class="cc-section-title">' + ICONS.bolt + ' ' + t('extensionStats') + '</div><div class="cc-stat"><span>' + t('removed') + '</span><span id="cc-panel-removed">0</span></div><div class="cc-stat"><span>' + t('kept') + '</span><span id="cc-panel-kept">0</span></div><div class="cc-stat"><span>' + t('sessionTrims') + '</span><span id="cc-panel-trims">0</span></div><div class="cc-stat"><span>' + t('storedSearch') + '</span><span id="cc-panel-stored">0</span></div><div style="margin-top:10px"><div class="cc-ram-row"><span class="cc-ram-label">' + t('jsHeap') + '</span><span class="cc-ram-value" id="cc-panel-ram">-- MB</span></div><div class="cc-ram-bar"><div class="cc-ram-bar-fill" id="cc-panel-ram-fill"></div></div></div></div><div class="cc-search-wrap"><span class="cc-search-icon">' + ICONS.search + '</span><input type="text" class="cc-search" placeholder="' + t('searchPlaceholder') + '" id="cc-search-input"></div><div class="cc-results" id="cc-search-results"></div>'; }
    panel.innerHTML = html; setupSearch(); updatePanelLimits(); updatePanelRAM();
  }
  
  function updatePanelRAM() { if (!showOptimizer()) return; var ramValue = document.getElementById('cc-panel-ram'); var ramFill = document.getElementById('cc-panel-ram-fill'); if (ramValue) ramValue.textContent = currentRAM + ' MB'; if (ramFill) { var percent = Math.min(100, Math.round(currentRAM / 8)); ramFill.style.width = percent + '%'; ramFill.classList.remove('warn', 'danger'); if (currentRAM > 500) ramFill.classList.add('danger'); else if (currentRAM > 300) ramFill.classList.add('warn'); } }
  function setupSearch() { var searchInput = document.getElementById('cc-search-input'); var searchResults = document.getElementById('cc-search-results'); if (!searchInput || !searchResults) return; var searchTimeout = null; searchInput.addEventListener('input', function() { clearTimeout(searchTimeout); searchTimeout = setTimeout(function() { var query = searchInput.value.trim().toLowerCase(); if (query.length < 2) { searchResults.innerHTML = ''; return; } var results = searchRemoved(query); if (results.length === 0) { searchResults.innerHTML = '<div class="cc-result">' + t('noResults') + '</div>'; return; } searchResults.innerHTML = results.slice(0, 20).map(function(msg) { var text = (msg.text || '').substring(0, 200); var highlighted = text.replace(new RegExp('(' + escapeRegex(query) + ')', 'gi'), '<mark>$1</mark>'); var senderIcon = msg.sender === 'human' ? ICONS.user : ICONS.bot; var senderName = msg.sender === 'human' ? t('you') : 'Claude'; return '<div class="cc-result"><div class="cc-result-sender">' + senderIcon + ' ' + senderName + ' • #' + msg.index + '</div><div class="cc-result-text">' + highlighted + '...</div></div>'; }).join(''); }, 300); }); }
  function escapeRegex(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function removeIndicator() { if (indicator) { indicator.remove(); indicator = null; } if (panel) { panel.remove(); panel = null; } var style = document.getElementById('cc-indicator-style'); if (style) style.remove(); if (ramInterval) { clearInterval(ramInterval); ramInterval = null; } if (limitsInterval) { clearInterval(limitsInterval); limitsInterval = null; } }
  function updateIndicator() { if (!config.showIndicator) { removeIndicator(); return; } if (!indicator && document.body) createIndicator(); if (!indicator || !showOptimizer()) return; var removed = window.__ccStats.removed || 0; var text = indicator.querySelector('.cc-text'); if (!text) return; if (config.paused) { text.textContent = t('paused'); indicator.classList.add('paused'); } else if (removed > 0) { text.textContent = '-' + removed + ' ' + t('msgs'); indicator.classList.remove('paused'); } else { text.textContent = t('ready'); indicator.classList.remove('paused'); } }
  function updatePanel() { if (!showOptimizer()) return; var removedEl = document.getElementById('cc-panel-removed'); var keptEl = document.getElementById('cc-panel-kept'); var trimsEl = document.getElementById('cc-panel-trims'); var storedEl = document.getElementById('cc-panel-stored'); if (removedEl) removedEl.textContent = window.__ccStats.removed || 0; if (keptEl) keptEl.textContent = window.__ccStats.kept || 0; if (trimsEl) trimsEl.textContent = SESSION_STATS.trimCount; if (storedEl) storedEl.textContent = REMOVED_MESSAGES.length; updatePanelRAM(); updatePanelLimits(); }
  function searchRemoved(query) { query = query.toLowerCase(); return REMOVED_MESSAGES.filter(function(msg) { return (msg.text || '').toLowerCase().indexOf(query) !== -1; }); }
  function storeRemovedMessages(messages) { messages.forEach(function(msg) { REMOVED_MESSAGES.push({ uuid: msg.uuid, text: msg.text || '', sender: msg.sender, index: msg.index, timestamp: msg.created_at || new Date().toISOString() }); }); if (REMOVED_MESSAGES.length > MAX_REMOVED_STORAGE) REMOVED_MESSAGES = REMOVED_MESSAGES.slice(-MAX_REMOVED_STORAGE); try { sessionStorage.setItem('cc_removed', JSON.stringify(REMOVED_MESSAGES)); } catch(e) { REMOVED_MESSAGES = REMOVED_MESSAGES.slice(-500); try { sessionStorage.setItem('cc_removed', JSON.stringify(REMOVED_MESSAGES)); } catch(e2) {} } }
  function showToast(message) { var existing = document.getElementById('cc-toast'); if (existing) existing.remove(); var toast = document.createElement('div'); toast.id = 'cc-toast'; toast.innerHTML = '<span style="width:16px;height:16px;display:inline-flex;margin-right:8px">' + ICONS.bolt + '</span>' + message; toast.style.cssText = 'position:fixed;bottom:' + (indicatorPos.bottom + 70) + 'px;right:' + indicatorPos.right + 'px;padding:12px 20px;background:#1e1e32;border:1px solid #2e2e4a;color:#f1f5f9;border-radius:12px;font-size:14px;font-weight:500;z-index:999999;box-shadow:0 4px 20px rgba(0,0,0,0.3);animation:ccFadeIn 0.3s ease;display:flex;align-items:center;'; var style = document.getElementById('cc-toast-style'); if (!style) { style = document.createElement('style'); style.id = 'cc-toast-style'; style.textContent = '@keyframes ccFadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}'; document.head.appendChild(style); } document.body.appendChild(toast); setTimeout(function() { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; toast.style.transition = 'all 0.3s ease'; setTimeout(function() { toast.remove(); }, 300); }, 3000); }
  
  window.addEventListener('message', function(e) { if (e.source !== window || !e.data || e.data.source !== 'cc-content') return; if (e.data.type === 'CC_SET_CONFIG') { if (e.data.keep !== undefined) config.keep = e.data.keep; if (e.data.paused !== undefined) config.paused = e.data.paused; if (e.data.showIndicator !== undefined) { config.showIndicator = e.data.showIndicator; if (config.showIndicator) createIndicator(); else removeIndicator(); } if (e.data.displayMode !== undefined) { var oldMode = config.displayMode; config.displayMode = e.data.displayMode; if (oldMode !== config.displayMode) { rebuildIndicator(); if (showLimits() && !limitsInterval) startLimitsUpdates(); else if (!showLimits() && limitsInterval) { clearInterval(limitsInterval); limitsInterval = null; } } } if (e.data.lang !== undefined) { config.lang = e.data.lang; rebuildIndicator(); } log('⚙️ Config:', config); addLog('CONFIG', config); updateIndicator(); } if (e.data.type === 'CC_GET_STATS') { window.postMessage({ source: 'cc-interceptor', type: 'CC_STATS', stats: Object.assign({}, window.__ccStats, { session: SESSION_STATS, removedCount: REMOVED_MESSAGES.length, limits: usageLimits, displayMode: config.displayMode }) }, '*'); } });
  
  window.__ccStats = { total: 0, kept: 0, removed: 0 };
  function updateStats(total, kept, doScroll) { var removed = total - kept; window.__ccStats = { total: total, kept: kept, removed: removed, timestamp: Date.now() }; if (doScroll && removed > 0) { SESSION_STATS.totalTrimmed += removed; SESSION_STATS.trimCount++; SESSION_STATS.estimatedRamSaved = Math.round(SESSION_STATS.totalTrimmed * 0.4 / 1024 * 100) / 100; sessionStorage.setItem('cc_session', JSON.stringify(SESSION_STATS)); if (showOptimizer()) showToast(t('trimmed') + ' ' + removed + ' ' + t('msgs')); scrollToBottom(); } updateIndicator(); window.postMessage({ source: 'cc-interceptor', type: 'CC_STATS_UPDATE', stats: Object.assign({}, window.__ccStats, { session: SESSION_STATS }) }, '*'); }
  
  var origFetch = window.fetch;
  window.fetch = function(input, init) { var url = typeof input === 'string' ? input : (input.url || ''); var method = (init && init.method) || 'GET'; if (showOptimizer() && url.indexOf('completion') !== -1 && method === 'POST' && !config.paused) { try { var body = init.body; if (typeof body === 'string' && CURRENT_LEAF) { var parsed = JSON.parse(body); var oldParent = parsed.parent_message_uuid; addLog('USER_MSG_OUT', { oldParent: oldParent, currentLeaf: CURRENT_LEAF, needsFix: oldParent !== CURRENT_LEAF }); if (oldParent && oldParent !== CURRENT_LEAF) { parsed.parent_message_uuid = CURRENT_LEAF; init = Object.assign({}, init, { body: JSON.stringify(parsed) }); addLog('PARENT_FIXED', { from: oldParent, to: CURRENT_LEAF }); } } } catch(e) { addLog('ERROR', { type: 'parse_outgoing', error: e.message }); } } return origFetch.apply(this, [input, init]).then(function(res) { if (showOptimizer() && url.indexOf('completion') !== -1 && !config.paused) { var cloneStream = res.clone(); cloneStream.text().then(function(txt) { txt.split('\n').forEach(function(line) { if (line.startsWith('data:')) { try { var d = JSON.parse(line.substring(5)); if (d.type === 'message_start' && d.message) { CURRENT_LEAF = d.message.uuid; sessionStorage.setItem('cc_leaf', CURRENT_LEAF); addLog('AI_RESPONSE', { uuid: d.message.uuid, parent: d.message.parent_message_uuid }); } } catch(e) {} } }); }).catch(function() {}); } if (!showOptimizer() || config.paused) return res; var isChat = url.indexOf('/api/') !== -1 && url.indexOf('chat_conversations/') !== -1 && url.indexOf('completion') === -1; if (!isChat) return res; var contentType = res.headers.get('content-type') || ''; if (contentType.indexOf('application/json') === -1) return res; var clone = res.clone(); return clone.text().then(function(txt) { if (txt.trim().indexOf('event:') === 0) return res; try { var data = JSON.parse(txt); if (!data.chat_messages || data.chat_messages.length === 0) return res; var msgs = data.chat_messages, total = msgs.length; if (data.current_leaf_message_uuid) { CURRENT_LEAF = data.current_leaf_message_uuid; sessionStorage.setItem('cc_leaf', CURRENT_LEAF); } if (total <= config.keep + 1) { updateStats(total, total, false); return res; } var realRoot = msgs[0], keptMessages = msgs.slice(-config.keep), removedMessages = msgs.slice(1, msgs.length - config.keep); storeRemovedMessages(removedMessages); var finalUuids = new Set([realRoot.uuid]); keptMessages.forEach(function(m) { finalUuids.add(m.uuid); }); keptMessages = keptMessages.map(function(m, i) { if (m.parent_message_uuid !== '00000000-0000-4000-8000-000000000000' && !finalUuids.has(m.parent_message_uuid)) { return Object.assign({}, m, { parent_message_uuid: i > 0 ? keptMessages[i - 1].uuid : realRoot.uuid }); } return m; }); data.chat_messages = [realRoot].concat(keptMessages); CURRENT_LEAF = keptMessages[keptMessages.length - 1].uuid; data.current_leaf_message_uuid = CURRENT_LEAF; sessionStorage.setItem('cc_leaf', CURRENT_LEAF); var kept = data.chat_messages.length; addLog('TRIM', { before: total, after: kept, stored: REMOVED_MESSAGES.length }); updateStats(total, kept, true); return new Response(JSON.stringify(data), { status: res.status, statusText: res.statusText, headers: res.headers }); } catch(e) { addLog('ERROR', { type: 'trim', error: e.message }); return res; } }).catch(function() { return res; }); }); };
  
  window.ccResetPos = function() { indicatorPos = { right: 20, bottom: 20 }; localStorage.removeItem('cc_indicator_pos'); if (indicator) { indicator.style.right = '20px'; indicator.style.bottom = '20px'; } };
  window.ccScrollDown = function() { scrollToBottom(); };
  window.ccLimits = function() { return usageLimits; };
  window.ccRefreshLimits = function() { return fetchUsageLimits(); };
  window.ccMode = function(mode) { if (mode) { config.displayMode = mode; rebuildIndicator(); } return config.displayMode; };
  window.ccDebug = function() { console.table({ Keep: config.keep, Paused: config.paused, ShowIndicator: config.showIndicator, Lang: config.lang, Mode: config.displayMode, Leaf: CURRENT_LEAF, Stored: REMOVED_MESSAGES.length, RAM: currentRAM + 'MB', Session: usageLimits && usageLimits.session ? usageLimits.session.percent + '%' : 'N/A' }); };
  window.ccLog = function(n) { DEBUG_LOG.slice(-(n||20)).forEach(function(e) { console.log(e.time, '['+e.type+']', e.data); }); };
  window.ccSearch = function(q) { return searchRemoved(q); };
  window.ccExport = function() { var blob = new Blob([JSON.stringify({ config:config, stats:window.__ccStats, session:SESSION_STATS, removed:REMOVED_MESSAGES, log:DEBUG_LOG, limits:usageLimits }, null, 2)], { type: 'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cc-debug-'+Date.now()+'.json'; a.click(); };
  window.ccReset = function() { SESSION_STATS = { totalTrimmed: 0, trimCount: 0, estimatedRamSaved: 0 }; DEBUG_LOG = []; REMOVED_MESSAGES = []; CURRENT_LEAF = null; ['cc_session','cc_leaf','cc_debug_log','cc_removed'].forEach(function(k) { sessionStorage.removeItem(k); }); updateIndicator(); };
  
  function init() { if (document.body) { createIndicator(); updateIndicator(); log('✅ Claude Lite v10.8 initialized (mode: ' + config.displayMode + ')'); } else { setTimeout(init, 100); } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  console.log('%c[CC] Claude Lite v10.8 - Fixed drag', 'color:#6366f1;font-weight:bold');
  window.postMessage({ source: 'cc-interceptor', type: 'CC_READY' }, '*');
})();
