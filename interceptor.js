(function() {
  // Prevent double-init
  if (window.__ccInterceptor) return;
  Object.defineProperty(window, '__ccInterceptor', { value: true, configurable: false, enumerable: false });

  // === CONSTANTS ===
  var RAM_MAX_MB = 800;
  var RAM_WARN_MB = 300;
  var RAM_DANGER_MB = 500;
  var MAX_REMOVED_STORAGE = 2000;
  var MAX_REMOVED_FALLBACK = 500;
  var MAX_REMOVED_TEXT_LEN = 300;
  var MAX_LOG_ENTRIES = 100;
  var LIMITS_REFRESH_MS = 60000;
  var RAM_REFRESH_MS = 2000;
  var TOAST_DURATION_MS = 3000;
  var ORIGIN = window.location.origin;

  // Original fetch reference (before override)
  var origFetch = window.fetch;

  // === CONFIG ===
  var config = { keep: 150, paused: false, debug: false, showIndicator: true, lang: 'en', displayMode: 'all' };

  // === i18n ===
  var i18n = {
    en: { ready: 'Ready', paused: 'Paused', msgs: 'msgs', removed: 'Removed', kept: 'Kept', sessionTrims: 'Session trims', storedSearch: 'Stored for search', searchPlaceholder: 'Search removed messages...', noResults: 'No results found', you: 'You', trimmed: 'Trimmed', jsHeap: 'JS Heap', dragTip: 'Drag to move', sessionLimit: 'Session', weeklyLimit: 'Weekly', resetsIn: 'Resets in', used: 'used', claudeLimits: 'Claude.ai Limits', extensionStats: 'Extension Stats', loading: '...' },
    ru: { ready: 'Готов', paused: 'Пауза', msgs: 'сообщ.', removed: 'Удалено', kept: 'Оставлено', sessionTrims: 'Очисток', storedSearch: 'Для поиска', searchPlaceholder: 'Поиск...', noResults: 'Не найдено', you: 'Вы', trimmed: 'Очищено', jsHeap: 'JS Heap', dragTip: 'Перетащите', sessionLimit: 'Сессия', weeklyLimit: 'Неделя', resetsIn: 'Сброс через', used: 'исп.', claudeLimits: 'Лимиты Claude.ai', extensionStats: 'Статистика', loading: '...' },
    uk: { ready: 'Готовий', paused: 'Пауза', msgs: 'повід.', removed: 'Видалено', kept: 'Залишено', sessionTrims: 'Очищень', storedSearch: 'Для пошуку', searchPlaceholder: 'Пошук...', noResults: 'Не знайдено', you: 'Ви', trimmed: 'Очищено', jsHeap: 'JS Heap', dragTip: 'Перетягніть', sessionLimit: 'Сесія', weeklyLimit: 'Тиждень', resetsIn: 'Скидання через', used: 'вик.', claudeLimits: 'Ліміти Claude.ai', extensionStats: 'Статистика', loading: '...' },
    de: { ready: 'Bereit', paused: 'Pause', msgs: 'Nachr.', removed: 'Entfernt', kept: 'Behalten', sessionTrims: 'Bereinigungen', storedSearch: 'Gespeichert', searchPlaceholder: 'Suchen...', noResults: 'Keine Ergebnisse', you: 'Sie', trimmed: 'Bereinigt', jsHeap: 'JS Heap', dragTip: 'Ziehen', sessionLimit: 'Sitzung', weeklyLimit: 'Woche', resetsIn: 'Reset in', used: 'genutzt', claudeLimits: 'Claude.ai Limits', extensionStats: 'Erweiterung', loading: '...' },
    fr: { ready: 'Prêt', paused: 'Pause', msgs: 'msgs', removed: 'Supprimés', kept: 'Gardés', sessionTrims: 'Nettoyages', storedSearch: 'Stockés', searchPlaceholder: 'Rechercher...', noResults: 'Aucun résultat', you: 'Vous', trimmed: 'Nettoyé', jsHeap: 'JS Heap', dragTip: 'Glisser', sessionLimit: 'Session', weeklyLimit: 'Semaine', resetsIn: 'Reset dans', used: 'utilisé', claudeLimits: 'Limites Claude.ai', extensionStats: 'Extension', loading: '...' },
    es: { ready: 'Listo', paused: 'Pausa', msgs: 'msgs', removed: 'Eliminados', kept: 'Mantenidos', sessionTrims: 'Limpiezas', storedSearch: 'Guardados', searchPlaceholder: 'Buscar...', noResults: 'Sin resultados', you: 'Tú', trimmed: 'Limpiado', jsHeap: 'JS Heap', dragTip: 'Arrastrar', sessionLimit: 'Sesión', weeklyLimit: 'Semana', resetsIn: 'Reinicia en', used: 'usado', claudeLimits: 'Límites Claude.ai', extensionStats: 'Extensión', loading: '...' },
    it: { ready: 'Pronto', paused: 'Pausa', msgs: 'msgs', removed: 'Rimossi', kept: 'Mantenuti', sessionTrims: 'Pulizie', storedSearch: 'Salvati', searchPlaceholder: 'Cerca...', noResults: 'Nessun risultato', you: 'Tu', trimmed: 'Pulito', jsHeap: 'JS Heap', dragTip: 'Trascina', sessionLimit: 'Sessione', weeklyLimit: 'Settimana', resetsIn: 'Reset tra', used: 'usato', claudeLimits: 'Limiti Claude.ai', extensionStats: 'Estensione', loading: '...' },
    pt: { ready: 'Pronto', paused: 'Pausa', msgs: 'msgs', removed: 'Removidos', kept: 'Mantidos', sessionTrims: 'Limpezas', storedSearch: 'Guardados', searchPlaceholder: 'Buscar...', noResults: 'Sem resultados', you: 'Você', trimmed: 'Limpo', jsHeap: 'JS Heap', dragTip: 'Arrastar', sessionLimit: 'Sessão', weeklyLimit: 'Semana', resetsIn: 'Reinicia em', used: 'usado', claudeLimits: 'Limites Claude.ai', extensionStats: 'Extensão', loading: '...' },
    zh: { ready: '就绪', paused: '暂停', msgs: '消息', removed: '已删除', kept: '已保留', sessionTrims: '清理次数', storedSearch: '已存储', searchPlaceholder: '搜索...', noResults: '无结果', you: '你', trimmed: '已清理', jsHeap: 'JS Heap', dragTip: '拖动', sessionLimit: '会话', weeklyLimit: '每周', resetsIn: '重置于', used: '已用', claudeLimits: 'Claude.ai 限额', extensionStats: '扩展统计', loading: '...' },
    ja: { ready: '準備完了', paused: '一時停止', msgs: '件', removed: '削除済み', kept: '保持', sessionTrims: 'クリーン回数', storedSearch: '検索用に保存', searchPlaceholder: '検索...', noResults: '結果なし', you: 'あなた', trimmed: 'クリーン済み', jsHeap: 'JS Heap', dragTip: 'ドラッグ', sessionLimit: 'セッション', weeklyLimit: '週間', resetsIn: 'リセットまで', used: '使用', claudeLimits: 'Claude.ai 制限', extensionStats: '拡張機能の統計', loading: '...' },
    ko: { ready: '준비됨', paused: '일시정지', msgs: '개', removed: '삭제됨', kept: '유지됨', sessionTrims: '정리 횟수', storedSearch: '검색용 저장', searchPlaceholder: '검색...', noResults: '결과 없음', you: '나', trimmed: '정리됨', jsHeap: 'JS Heap', dragTip: '드래그', sessionLimit: '세션', weeklyLimit: '주간', resetsIn: '초기화까지', used: '사용', claudeLimits: 'Claude.ai 한도', extensionStats: '확장 통계', loading: '...' },
    tr: { ready: 'Hazır', paused: 'Duraklatıldı', msgs: 'msj', removed: 'Silindi', kept: 'Korundu', sessionTrims: 'Temizleme', storedSearch: 'Arama için', searchPlaceholder: 'Ara...', noResults: 'Sonuç yok', you: 'Sen', trimmed: 'Temizlendi', jsHeap: 'JS Heap', dragTip: 'Sürükle', sessionLimit: 'Oturum', weeklyLimit: 'Haftalık', resetsIn: 'Sıfırlanma', used: 'kullanıldı', claudeLimits: 'Claude.ai Limitler', extensionStats: 'Eklenti İstatistikleri', loading: '...' },
    pl: { ready: 'Gotowy', paused: 'Wstrzymano', msgs: 'wiad.', removed: 'Usunięto', kept: 'Zachowano', sessionTrims: 'Czyszczenia', storedSearch: 'Do wyszukiwania', searchPlaceholder: 'Szukaj...', noResults: 'Brak wyników', you: 'Ty', trimmed: 'Wyczyszczono', jsHeap: 'JS Heap', dragTip: 'Przeciągnij', sessionLimit: 'Sesja', weeklyLimit: 'Tydzień', resetsIn: 'Reset za', used: 'użyto', claudeLimits: 'Limity Claude.ai', extensionStats: 'Statystyki', loading: '...' },
    nl: { ready: 'Klaar', paused: 'Gepauzeerd', msgs: 'ber.', removed: 'Verwijderd', kept: 'Behouden', sessionTrims: 'Opschoningen', storedSearch: 'Opgeslagen', searchPlaceholder: 'Zoeken...', noResults: 'Geen resultaten', you: 'Jij', trimmed: 'Opgeschoond', jsHeap: 'JS Heap', dragTip: 'Slepen', sessionLimit: 'Sessie', weeklyLimit: 'Wekelijks', resetsIn: 'Reset over', used: 'gebruikt', claudeLimits: 'Claude.ai Limieten', extensionStats: 'Extensie Stats', loading: '...' },
    ar: { ready: 'جاهز', paused: 'متوقف', msgs: 'رسالة', removed: 'محذوف', kept: 'محفوظ', sessionTrims: 'عمليات التنظيف', storedSearch: 'للبحث', searchPlaceholder: 'بحث...', noResults: 'لا نتائج', you: 'أنت', trimmed: 'تم التنظيف', jsHeap: 'JS Heap', dragTip: 'اسحب', sessionLimit: 'الجلسة', weeklyLimit: 'أسبوعي', resetsIn: 'إعادة تعيين', used: 'مستخدم', claudeLimits: 'حدود Claude.ai', extensionStats: 'إحصائيات', loading: '...' },
    hi: { ready: 'तैयार', paused: 'रुका हुआ', msgs: 'संदेश', removed: 'हटाया गया', kept: 'रखा गया', sessionTrims: 'सफ़ाई', storedSearch: 'खोज हेतु', searchPlaceholder: 'खोजें...', noResults: 'कोई परिणाम नहीं', you: 'आप', trimmed: 'साफ़ किया', jsHeap: 'JS Heap', dragTip: 'खींचें', sessionLimit: 'सत्र', weeklyLimit: 'साप्ताहिक', resetsIn: 'रीसेट', used: 'उपयोग', claudeLimits: 'Claude.ai सीमा', extensionStats: 'एक्सटेंशन आँकड़े', loading: '...' },
    vi: { ready: 'Sẵn sàng', paused: 'Tạm dừng', msgs: 'tin', removed: 'Đã xóa', kept: 'Đã giữ', sessionTrims: 'Lần dọn', storedSearch: 'Đã lưu', searchPlaceholder: 'Tìm...', noResults: 'Không có kết quả', you: 'Bạn', trimmed: 'Đã dọn', jsHeap: 'JS Heap', dragTip: 'Kéo', sessionLimit: 'Phiên', weeklyLimit: 'Tuần', resetsIn: 'Đặt lại sau', used: 'đã dùng', claudeLimits: 'Giới hạn Claude.ai', extensionStats: 'Thống kê', loading: '...' },
    th: { ready: 'พร้อม', paused: 'หยุดชั่วคราว', msgs: 'ข้อความ', removed: 'ลบแล้ว', kept: 'เก็บไว้', sessionTrims: 'ล้างแล้ว', storedSearch: 'สำหรับค้นหา', searchPlaceholder: 'ค้นหา...', noResults: 'ไม่พบ', you: 'คุณ', trimmed: 'ล้างแล้ว', jsHeap: 'JS Heap', dragTip: 'ลาก', sessionLimit: 'เซสชัน', weeklyLimit: 'รายสัปดาห์', resetsIn: 'รีเซ็ตใน', used: 'ใช้แล้ว', claudeLimits: 'ขีดจำกัด Claude.ai', extensionStats: 'สถิติ', loading: '...' },
    id: { ready: 'Siap', paused: 'Dijeda', msgs: 'pesan', removed: 'Dihapus', kept: 'Disimpan', sessionTrims: 'Pembersihan', storedSearch: 'Tersimpan', searchPlaceholder: 'Cari...', noResults: 'Tidak ada hasil', you: 'Anda', trimmed: 'Dibersihkan', jsHeap: 'JS Heap', dragTip: 'Seret', sessionLimit: 'Sesi', weeklyLimit: 'Mingguan', resetsIn: 'Reset dalam', used: 'digunakan', claudeLimits: 'Batas Claude.ai', extensionStats: 'Statistik', loading: '...' },
    sv: { ready: 'Redo', paused: 'Pausad', msgs: 'medd.', removed: 'Borttagna', kept: 'Behållna', sessionTrims: 'Rensningar', storedSearch: 'Sparade', searchPlaceholder: 'Sök...', noResults: 'Inga resultat', you: 'Du', trimmed: 'Rensat', jsHeap: 'JS Heap', dragTip: 'Dra', sessionLimit: 'Session', weeklyLimit: 'Veckovis', resetsIn: 'Återställs om', used: 'använt', claudeLimits: 'Claude.ai Gränser', extensionStats: 'Statistik', loading: '...' },
    cs: { ready: 'Připraven', paused: 'Pozastaveno', msgs: 'zpr.', removed: 'Odstraněno', kept: 'Ponecháno', sessionTrims: 'Čištění', storedSearch: 'Uloženo', searchPlaceholder: 'Hledat...', noResults: 'Žádné výsledky', you: 'Vy', trimmed: 'Vyčištěno', jsHeap: 'JS Heap', dragTip: 'Přetáhněte', sessionLimit: 'Relace', weeklyLimit: 'Týdně', resetsIn: 'Reset za', used: 'použito', claudeLimits: 'Limity Claude.ai', extensionStats: 'Statistiky', loading: '...' },
    ro: { ready: 'Pregătit', paused: 'Întrerupt', msgs: 'mes.', removed: 'Șterse', kept: 'Păstrate', sessionTrims: 'Curățări', storedSearch: 'Salvate', searchPlaceholder: 'Caută...', noResults: 'Fără rezultate', you: 'Tu', trimmed: 'Curățat', jsHeap: 'JS Heap', dragTip: 'Trage', sessionLimit: 'Sesiune', weeklyLimit: 'Săptămânal', resetsIn: 'Resetare în', used: 'utilizat', claudeLimits: 'Limite Claude.ai', extensionStats: 'Statistici', loading: '...' },
    hu: { ready: 'Kész', paused: 'Szüneteltetve', msgs: 'üz.', removed: 'Törölve', kept: 'Megtartva', sessionTrims: 'Tisztítások', storedSearch: 'Mentve', searchPlaceholder: 'Keresés...', noResults: 'Nincs találat', you: 'Ön', trimmed: 'Megtisztítva', jsHeap: 'JS Heap', dragTip: 'Húzza', sessionLimit: 'Munkamenet', weeklyLimit: 'Heti', resetsIn: 'Visszaáll', used: 'használt', claudeLimits: 'Claude.ai Korlátok', extensionStats: 'Statisztika', loading: '...' },
    el: { ready: 'Έτοιμο', paused: 'Παύση', msgs: 'μνμ.', removed: 'Διαγράφηκαν', kept: 'Διατηρήθηκαν', sessionTrims: 'Καθαρισμοί', storedSearch: 'Αποθηκευμένα', searchPlaceholder: 'Αναζήτηση...', noResults: 'Κανένα αποτέλεσμα', you: 'Εσύ', trimmed: 'Καθαρίστηκε', jsHeap: 'JS Heap', dragTip: 'Σύρετε', sessionLimit: 'Συνεδρία', weeklyLimit: 'Εβδομαδιαίο', resetsIn: 'Επαναφορά σε', used: 'χρήση', claudeLimits: 'Όρια Claude.ai', extensionStats: 'Στατιστικά', loading: '...' },
    he: { ready: 'מוכן', paused: 'מושהה', msgs: 'הודעות', removed: 'הוסרו', kept: 'נשמרו', sessionTrims: 'ניקויים', storedSearch: 'לחיפוש', searchPlaceholder: 'חיפוש...', noResults: 'אין תוצאות', you: 'את/ה', trimmed: 'נוקה', jsHeap: 'JS Heap', dragTip: 'גרור', sessionLimit: 'הפעלה', weeklyLimit: 'שבועי', resetsIn: 'איפוס בעוד', used: 'בשימוש', claudeLimits: 'מגבלות Claude.ai', extensionStats: 'סטטיסטיקה', loading: '...' },
    da: { ready: 'Klar', paused: 'Pauset', msgs: 'besk.', removed: 'Fjernet', kept: 'Beholdt', sessionTrims: 'Rensninger', storedSearch: 'Gemt', searchPlaceholder: 'Søg...', noResults: 'Ingen resultater', you: 'Du', trimmed: 'Renset', jsHeap: 'JS Heap', dragTip: 'Træk', sessionLimit: 'Session', weeklyLimit: 'Ugentlig', resetsIn: 'Nulstilles om', used: 'brugt', claudeLimits: 'Claude.ai Grænser', extensionStats: 'Statistik', loading: '...' },
    fi: { ready: 'Valmis', paused: 'Tauolla', msgs: 'viesti', removed: 'Poistettu', kept: 'Säilytetty', sessionTrims: 'Puhdistukset', storedSearch: 'Tallennettu', searchPlaceholder: 'Hae...', noResults: 'Ei tuloksia', you: 'Sinä', trimmed: 'Puhdistettu', jsHeap: 'JS Heap', dragTip: 'Vedä', sessionLimit: 'Istunto', weeklyLimit: 'Viikko', resetsIn: 'Nollautuu', used: 'käytetty', claudeLimits: 'Claude.ai Rajat', extensionStats: 'Tilastot', loading: '...' },
    no: { ready: 'Klar', paused: 'Pauset', msgs: 'meld.', removed: 'Fjernet', kept: 'Beholdt', sessionTrims: 'Rensinger', storedSearch: 'Lagret', searchPlaceholder: 'Søk...', noResults: 'Ingen resultater', you: 'Du', trimmed: 'Renset', jsHeap: 'JS Heap', dragTip: 'Dra', sessionLimit: 'Økt', weeklyLimit: 'Ukentlig', resetsIn: 'Tilbakestilles om', used: 'brukt', claudeLimits: 'Claude.ai Grenser', extensionStats: 'Statistikk', loading: '...' }
  };

  function t(key) { return (i18n[config.lang] || i18n.en)[key] || i18n.en[key] || key; }

  // === STATE ===
  var CURRENT_LEAF = null;
  var LAST_TRIM_LEAF = null;
  var PENDING_USER_MSG = null;
  var TRIM_GROWTH = 0;
  var LAST_TRIM_CONV = null;
  var LAST_TRIM_COUNT = 0;
  var SESSION_STATS = { totalTrimmed: 0, trimCount: 0 };
  var REMOVED_MESSAGES = [];
  var DEBUG_LOG = [];
  var currentRAM = 0;
  var indicatorPos = { right: 20, bottom: 20 };
  var usageLimits = null;
  var chatOrgUuid = null;
  var ccStats = { total: 0, kept: 0, removed: 0 };

  var ICONS = {
    bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51L12.96 17.55 11 21z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    bot: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5z"/></svg>',
    grip: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>',
    claude: '<svg viewBox="0 0 24 24" fill="#D97757"><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill-rule="nonzero"/></svg>'
  };

  // === DEBUG LOG ===
  function addLog(type, data) {
    DEBUG_LOG.push({ time: new Date().toISOString(), type: type, data: data });
    if (DEBUG_LOG.length > MAX_LOG_ENTRIES) DEBUG_LOG.shift();
    try { sessionStorage.setItem('__cc_debug_log', JSON.stringify(DEBUG_LOG)); } catch(e) {}
  }

  // === SESSION RESTORE ===
  try { var savedLeaf = sessionStorage.getItem('__cc_leaf'); if (savedLeaf) CURRENT_LEAF = savedLeaf; } catch(e) {}
  try { var savedSession = sessionStorage.getItem('__cc_session'); if (savedSession) SESSION_STATS = JSON.parse(savedSession); } catch(e) {}
  try { var savedLog = sessionStorage.getItem('__cc_debug_log'); if (savedLog) DEBUG_LOG = JSON.parse(savedLog); } catch(e) {}
  try { var savedRemoved = sessionStorage.getItem('__cc_removed'); if (savedRemoved) REMOVED_MESSAGES = JSON.parse(savedRemoved); } catch(e) {}
  // Load indicator position
  try {
    var oldPos = localStorage.getItem('cc_indicator_pos');
    if (oldPos) { localStorage.setItem('__cc_indicator_pos', oldPos); localStorage.removeItem('cc_indicator_pos'); }
    var savedPos = localStorage.getItem('__cc_indicator_pos');
    if (savedPos) indicatorPos = JSON.parse(savedPos);
  } catch(e) {}
  // Cleanup legacy keys
  try { ['cc_leaf','cc_session','cc_debug_log','cc_removed'].forEach(function(k) { sessionStorage.removeItem(k); }); } catch(e) {}

  // === HELPERS ===
  function log() { if (config.debug) console.log.apply(console, ['[CC]'].concat(Array.prototype.slice.call(arguments))); }
  function showLimits() { return config.displayMode === 'all' || config.displayMode === 'limits_only'; }
  function showOptimizer() { return config.displayMode === 'all' || config.displayMode === 'optimizer_only'; }
  function escapeRegex(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function escapeHtml(str) { return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function getRAM() {
    try {
      if (performance && typeof performance.memory !== 'undefined' && performance.memory) {
        return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      }
    } catch(e) {}
    return 0;
  }

  function formatResetTime(resetAt) {
    var resetTime = new Date(resetAt);
    var now = new Date();
    var diffMs = resetTime - now;
    if (diffMs < 0) return '0m';
    var diffMins = Math.floor(diffMs / 60000);
    var hours = Math.floor(diffMins / 60);
    var mins = diffMins % 60;
    if (hours > 0) return hours + 'h ' + mins + 'm';
    return mins + 'm';
  }

  // === USAGE LIMITS ===
  async function fetchUsageLimits() {
    if (!showLimits()) return null;
    try {
      if (!chatOrgUuid) {
        var orgs = await origFetch('/api/organizations').then(function(r) { return r.json(); });
        if (!Array.isArray(orgs)) return null;
        var chatOrg = orgs.find(function(o) { return o.capabilities && o.capabilities.includes('chat'); });
        if (chatOrg) { chatOrgUuid = chatOrg.uuid; log('Found chat org:', chatOrgUuid); }
      }
      if (!chatOrgUuid) return null;
      var usage = await origFetch('/api/organizations/' + chatOrgUuid + '/usage').then(function(r) { return r.json(); });
      if (!usage || usage.type === 'error') { log('Usage API error:', usage && usage.error); return null; }
      usageLimits = {
        session: usage.five_hour ? { percent: usage.five_hour.utilization, resetsIn: formatResetTime(usage.five_hour.resets_at), resetsAt: usage.five_hour.resets_at } : null,
        weekly: usage.seven_day ? { percent: usage.seven_day.utilization, resetsIn: formatResetTime(usage.seven_day.resets_at), resetsAt: usage.seven_day.resets_at } : null
      };
      log('Limits:', usageLimits);
      updateIndicatorLimits();
      updatePanelLimits();
      return usageLimits;
    } catch(e) { log('Failed to fetch limits:', e); return null; }
  }

  // === SCROLL ===
  function getScrollInfo() {
    var candidates = document.querySelectorAll('main [role="presentation"], main [role="log"], [class*="scroll"], [class*="conversation"], [class*="messages"], main [style*="overflow"], main > div > div');
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      var style = window.getComputedStyle(el);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return {
          element: el,
          tagName: el.tagName,
          className: (el.className || '').substring(0, 80),
          scrollTop: el.scrollTop,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          scrollBottom: el.scrollHeight - el.scrollTop - el.clientHeight,
          isAtBottom: (el.scrollHeight - el.scrollTop - el.clientHeight) < 50
        };
      }
    }
    return null;
  }

  function scrollToBottom() {
    var beforeScroll = getScrollInfo();
    log('[SCROLL] Before scroll:', beforeScroll);
    requestAnimationFrame(function() {
      setTimeout(function() {
        var info = getScrollInfo();
        if (info && info.element) {
          var oldTop = info.scrollTop;
          info.element.scrollTop = info.scrollHeight;
          log('[SCROLL] Scrolled:', { from: oldTop, to: info.element.scrollTop, scrollHeight: info.scrollHeight, delta: info.element.scrollTop - oldTop });
        } else {
          log('[SCROLL] No scroll container found');
        }
      }, 100);
    });
  }

  // === UI STATE ===
  var indicator = null, panel = null, isDragging = false, dragStartX, dragStartY, startRight, startBottom;
  var ramInterval = null, limitsInterval = null, docClickAttached = false;

  // === PROGRESS RING ===
  function getCircleColor(percent) { if (percent >= 80) return '#ef4444'; if (percent >= 50) return '#f59e0b'; return '#10b981'; }

  function createCircularProgress(percent, size) {
    var radius = (size - 4) / 2;
    var circumference = 2 * Math.PI * radius;
    var offset = circumference - (percent / 100) * circumference;
    var color = getCircleColor(percent);
    return '<svg width="' + size + '" height="' + size + '" class="cc-circle-progress"><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + radius + '" fill="none" stroke="#2e2e4a" stroke-width="3"/><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + radius + '" fill="none" stroke="' + color + '" stroke-width="3" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '" stroke-linecap="round" transform="rotate(-90 ' + (size/2) + ' ' + (size/2) + ')" class="cc-circle-fill"/><text x="' + (size/2) + '" y="' + (size/2) + '" text-anchor="middle" dominant-baseline="central" fill="#f1f5f9" font-size="8" font-weight="600">' + percent + '%</text></svg>';
  }

  function buildIndicatorHTML() {
    var html = '<span class="cc-grip" title="' + t('dragTip') + '">' + ICONS.grip + '</span>';
    html += '<div class="cc-indicator-content"><div class="cc-row">';
    if (showOptimizer()) { html += '<span class="cc-icon">' + ICONS.bolt + '</span><span class="cc-text">' + t('ready') + '</span><div class="cc-mini-ram"><div class="cc-mini-ram-fill"></div></div>'; }
    if (showLimits()) { html += '<span class="cc-circle-wrap" id="cc-session-circle">' + createCircularProgress(0, 28) + '</span>'; }
    html += '</div></div>';
    return html;
  }

  // === DRAG HANDLERS ===
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
      try { localStorage.setItem('__cc_indicator_pos', JSON.stringify(indicatorPos)); } catch(e) {}
    });
  }

  // Keep indicator within viewport on resize
  window.addEventListener('resize', function() {
    if (!indicator) return;
    indicatorPos.right = Math.max(10, Math.min(window.innerWidth - 150, indicatorPos.right));
    indicatorPos.bottom = Math.max(10, Math.min(window.innerHeight - 50, indicatorPos.bottom));
    indicator.style.right = indicatorPos.right + 'px';
    indicator.style.bottom = indicatorPos.bottom + 'px';
    try { localStorage.setItem('__cc_indicator_pos', JSON.stringify(indicatorPos)); } catch(e) {}
  });

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
    };
  }

  // === CREATE INDICATOR ===
  function createIndicator() {
    if (indicator || !config.showIndicator || !document.body) return;
    indicator = document.createElement('div');
    indicator.id = 'cc-indicator';
    indicator.innerHTML = buildIndicatorHTML();
    // Apply saved position
    indicator.style.right = indicatorPos.right + 'px';
    indicator.style.bottom = indicatorPos.bottom + 'px';
    document.body.appendChild(indicator);

    panel = document.createElement('div');
    panel.id = 'cc-indicator-panel';
    updatePanelHTML();
    document.body.appendChild(panel);

    attachGlobalDragHandlers();
    setupDragHandlers();

    indicator.addEventListener('click', function(e) {
      if (isDragging || e.target.closest('.cc-grip')) return;
      e.stopPropagation();
      panel.classList.toggle('show');
      updatePanel();
      updatePanelPosition();
    });

    // Close panel on outside click
    if (!docClickAttached) {
      docClickAttached = true;
      document.addEventListener('click', function(e) {
        if (panel && indicator && !panel.contains(e.target) && !indicator.contains(e.target)) panel.classList.remove('show');
      });
    }

    setupSearch();
    startRAMUpdates();
    startLimitsUpdates();
    log('Indicator created (mode: ' + config.displayMode + ')');
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

  function removeIndicator() {
    if (indicator) { indicator.remove(); indicator = null; }
    if (panel) { panel.remove(); panel = null; }
    if (ramInterval) { clearInterval(ramInterval); ramInterval = null; }
    if (limitsInterval) { clearInterval(limitsInterval); limitsInterval = null; }
  }

  // === RAM & LIMITS UPDATES ===
  function startRAMUpdates() {
    if (ramInterval) return;
    updateIndicatorRAM();
    ramInterval = setInterval(function() { currentRAM = getRAM(); updateIndicatorRAM(); updatePanelRAM(); }, RAM_REFRESH_MS);
  }

  function startLimitsUpdates() {
    if (limitsInterval) return;
    if (showLimits()) { fetchUsageLimits(); limitsInterval = setInterval(fetchUsageLimits, LIMITS_REFRESH_MS); }
  }

  function getLimitColorClass(percent) { if (percent >= 80) return 'red'; if (percent >= 50) return 'yellow'; return 'green'; }

  function updateIndicatorLimits() {
    if (!indicator || !showLimits()) return;
    var circleWrap = document.getElementById('cc-session-circle');
    if (circleWrap && usageLimits && usageLimits.session) circleWrap.innerHTML = createCircularProgress(usageLimits.session.percent, 28);
  }

  function updateIndicatorRAM() {
    if (!indicator || !showOptimizer()) return;
    var fill = indicator.querySelector('.cc-mini-ram-fill');
    if (fill) {
      var percent = Math.min(100, Math.round(currentRAM / RAM_MAX_MB * 100));
      fill.style.width = percent + '%';
      fill.classList.remove('warn', 'danger');
      if (currentRAM > RAM_DANGER_MB) fill.classList.add('danger');
      else if (currentRAM > RAM_WARN_MB) fill.classList.add('warn');
    }
  }

  function updatePanelLimits() {
    if (!showLimits() || !usageLimits) return;
    if (usageLimits.session) {
      var sf = document.getElementById('cc-panel-session-fill'), sp = document.getElementById('cc-panel-session-percent'), sr = document.getElementById('cc-panel-session-reset');
      if (sf) { sf.style.width = usageLimits.session.percent + '%'; sf.className = 'cc-limit-bar-fill ' + getLimitColorClass(usageLimits.session.percent); }
      if (sp) sp.textContent = usageLimits.session.percent + '% ' + t('used');
      if (sr) sr.textContent = t('resetsIn') + ' ' + usageLimits.session.resetsIn;
    }
    if (usageLimits.weekly) {
      var wf = document.getElementById('cc-panel-weekly-fill'), wp = document.getElementById('cc-panel-weekly-percent'), wr = document.getElementById('cc-panel-weekly-reset');
      if (wf) { wf.style.width = usageLimits.weekly.percent + '%'; wf.className = 'cc-limit-bar-fill ' + getLimitColorClass(usageLimits.weekly.percent); }
      if (wp) wp.textContent = usageLimits.weekly.percent + '% ' + t('used');
      if (wr) wr.textContent = t('resetsIn') + ' ' + usageLimits.weekly.resetsIn;
    }
  }

  function updatePanelPosition() {
    if (!panel || !indicator) return;
    var rect = indicator.getBoundingClientRect();
    var panelW = 320, panelH = 400;
    if (rect.top > panelH + 10) { panel.style.bottom = (window.innerHeight - rect.top + 10) + 'px'; panel.style.top = 'auto'; }
    else { panel.style.top = Math.min(rect.bottom + 10, window.innerHeight - panelH - 10) + 'px'; panel.style.bottom = 'auto'; }
    var panelRight = Math.max(10, Math.min(window.innerWidth - panelW - 10, indicatorPos.right - (panelW / 2) + 75));
    panel.style.right = panelRight + 'px';
    panel.style.left = 'auto';
  }

  function updatePanelHTML() {
    if (!panel) return;
    var html = '<h4>' + ICONS.bolt + ' Claude Lite</h4>';
    if (showLimits()) {
      html += '<div class="cc-section"><div class="cc-section-title">' + ICONS.claude + ' ' + t('claudeLimits') + '</div>';
      html += '<div class="cc-limit-row"><div class="cc-limit-header"><span class="cc-limit-label">' + t('sessionLimit') + '</span><span class="cc-limit-value" id="cc-panel-session-percent">' + t('loading') + '</span></div><div class="cc-limit-bar"><div class="cc-limit-bar-fill green" id="cc-panel-session-fill" style="width:0%"></div></div><div class="cc-limit-reset" id="cc-panel-session-reset"></div></div>';
      html += '<div class="cc-limit-row"><div class="cc-limit-header"><span class="cc-limit-label">' + t('weeklyLimit') + '</span><span class="cc-limit-value" id="cc-panel-weekly-percent">' + t('loading') + '</span></div><div class="cc-limit-bar"><div class="cc-limit-bar-fill green" id="cc-panel-weekly-fill" style="width:0%"></div></div><div class="cc-limit-reset" id="cc-panel-weekly-reset"></div></div></div>';
    }
    if (showOptimizer()) {
      html += '<div class="cc-section"><div class="cc-section-title">' + ICONS.bolt + ' ' + t('extensionStats') + '</div>';
      html += '<div class="cc-stat"><span>' + t('removed') + '</span><span id="cc-panel-removed">0</span></div>';
      html += '<div class="cc-stat"><span>' + t('kept') + '</span><span id="cc-panel-kept">0</span></div>';
      html += '<div class="cc-stat"><span>' + t('sessionTrims') + '</span><span id="cc-panel-trims">0</span></div>';
      html += '<div class="cc-stat"><span>' + t('storedSearch') + '</span><span id="cc-panel-stored">0</span></div>';
      html += '<div style="margin-top:10px"><div class="cc-ram-row"><span class="cc-ram-label">' + t('jsHeap') + '</span><span class="cc-ram-value" id="cc-panel-ram">-- MB</span></div><div class="cc-ram-bar"><div class="cc-ram-bar-fill" id="cc-panel-ram-fill"></div></div></div></div>';
      html += '<div class="cc-search-wrap"><span class="cc-search-icon">' + ICONS.search + '</span><input type="text" class="cc-search" placeholder="' + t('searchPlaceholder') + '" id="cc-search-input"></div><div class="cc-results" id="cc-search-results"></div>';
    }
    panel.innerHTML = html;
    setupSearch();
    updatePanelLimits();
    updatePanelRAM();
  }

  function updatePanelRAM() {
    if (!showOptimizer()) return;
    var rv = document.getElementById('cc-panel-ram'), rf = document.getElementById('cc-panel-ram-fill');
    if (rv) rv.textContent = currentRAM + ' MB';
    if (rf) {
      var pct = Math.min(100, Math.round(currentRAM / RAM_MAX_MB * 100));
      rf.style.width = pct + '%'; rf.classList.remove('warn', 'danger');
      if (currentRAM > RAM_DANGER_MB) rf.classList.add('danger');
      else if (currentRAM > RAM_WARN_MB) rf.classList.add('warn');
    }
  }

  // === SEARCH ===
  function setupSearch() {
    var input = document.getElementById('cc-search-input'), results = document.getElementById('cc-search-results');
    if (!input || !results) return;
    var timeout = null;
    input.addEventListener('input', function() {
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        var q = input.value.trim().toLowerCase();
        if (q.length < 2) { results.innerHTML = ''; return; }
        var found = searchRemoved(q);
        if (found.length === 0) { results.innerHTML = '<div class="cc-result">' + t('noResults') + '</div>'; return; }
        results.innerHTML = found.slice(0, 20).map(function(msg) {
          var text = escapeHtml((msg.text || '').substring(0, 200));
          var highlighted = text.replace(new RegExp('(' + escapeRegex(q) + ')', 'gi'), '<mark>$1</mark>');
          var icon = msg.sender === 'human' ? ICONS.user : ICONS.bot;
          var name = msg.sender === 'human' ? t('you') : 'Claude';
          return '<div class="cc-result"><div class="cc-result-sender">' + icon + ' ' + name + ' • #' + msg.index + '</div><div class="cc-result-text">' + highlighted + '...</div></div>';
        }).join('');
      }, 300);
    });
  }

  function searchRemoved(query) {
    query = query.toLowerCase();
    return REMOVED_MESSAGES.filter(function(msg) { return (msg.text || '').toLowerCase().indexOf(query) !== -1; });
  }

  // === STORE REMOVED MESSAGES ===
  function storeRemovedMessages(messages) {
    var baseIndex = REMOVED_MESSAGES.length;
    messages.forEach(function(msg, i) {
      var rawText = msg.text || (msg.content && msg.content[0] && msg.content[0].text) || '';
      REMOVED_MESSAGES.push({
        uuid: msg.uuid,
        text: rawText.substring(0, MAX_REMOVED_TEXT_LEN),
        sender: msg.sender,
        index: baseIndex + i + 1,
        timestamp: msg.created_at || new Date().toISOString()
      });
    });
    if (REMOVED_MESSAGES.length > MAX_REMOVED_STORAGE) REMOVED_MESSAGES = REMOVED_MESSAGES.slice(-MAX_REMOVED_STORAGE);
    try { sessionStorage.setItem('__cc_removed', JSON.stringify(REMOVED_MESSAGES)); }
    catch(e) { REMOVED_MESSAGES = REMOVED_MESSAGES.slice(-MAX_REMOVED_FALLBACK); try { sessionStorage.setItem('__cc_removed', JSON.stringify(REMOVED_MESSAGES)); } catch(e2) {} }
  }

  // === INDICATOR UPDATES ===
  function updateIndicator() {
    if (!config.showIndicator) { removeIndicator(); return; }
    if (!indicator && document.body) createIndicator();
    if (!indicator || !showOptimizer()) return;
    var removed = ccStats.removed || 0;
    var text = indicator.querySelector('.cc-text');
    if (!text) return;
    if (config.paused) { text.textContent = t('paused'); indicator.classList.add('paused'); }
    else if (removed > 0) { text.textContent = '-' + removed + ' ' + t('msgs'); indicator.classList.remove('paused'); }
    else { text.textContent = t('ready'); indicator.classList.remove('paused'); }
  }

  function updatePanel() {
    if (!showOptimizer()) return;
    var el = { r: document.getElementById('cc-panel-removed'), k: document.getElementById('cc-panel-kept'), t: document.getElementById('cc-panel-trims'), s: document.getElementById('cc-panel-stored') };
    if (el.r) el.r.textContent = ccStats.removed || 0;
    if (el.k) el.k.textContent = ccStats.kept || 0;
    if (el.t) el.t.textContent = SESSION_STATS.trimCount;
    if (el.s) el.s.textContent = REMOVED_MESSAGES.length;
    updatePanelRAM();
    updatePanelLimits();
  }

  // === TOAST ===
  function showToast(message) {
    var existing = document.getElementById('cc-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'cc-toast';
    toast.innerHTML = '<span style="width:16px;height:16px;display:inline-flex;margin-right:8px">' + ICONS.bolt + '</span>' + escapeHtml(message);
    toast.style.bottom = Math.min(indicatorPos.bottom + 60, window.innerHeight - 60) + 'px';
    toast.style.right = indicatorPos.right + 'px';
    document.body.appendChild(toast);
    setTimeout(function() { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; toast.style.transition = 'all 0.3s ease'; setTimeout(function() { toast.remove(); }, 300); }, TOAST_DURATION_MS);
  }

  // === MESSAGE HANDLER ===
  window.addEventListener('message', function(e) {
    if (e.source !== window || !e.data || e.data.source !== 'cc-content') return;
    if (e.origin !== ORIGIN) return;

    if (e.data.type === 'CC_SET_CONFIG') {
      if (e.data.keep !== undefined) config.keep = e.data.keep;
      if (e.data.paused !== undefined) config.paused = e.data.paused;
      if (e.data.showIndicator !== undefined) { config.showIndicator = e.data.showIndicator; if (config.showIndicator) createIndicator(); else removeIndicator(); }
      if (e.data.displayMode !== undefined) {
        var oldMode = config.displayMode;
        config.displayMode = e.data.displayMode;
        if (oldMode !== config.displayMode) { rebuildIndicator(); if (showLimits() && !limitsInterval) startLimitsUpdates(); else if (!showLimits() && limitsInterval) { clearInterval(limitsInterval); limitsInterval = null; } }
      }
      if (e.data.lang !== undefined) { config.lang = e.data.lang; rebuildIndicator(); }
      log('Config:', config);
      addLog('CONFIG', config);
      updateIndicator();
    }

    if (e.data.type === 'CC_GET_STATS') {
      window.postMessage({ source: 'cc-interceptor', type: 'CC_STATS', stats: Object.assign({}, ccStats, { session: SESSION_STATS, removedCount: REMOVED_MESSAGES.length, limits: usageLimits, displayMode: config.displayMode }) }, ORIGIN);
    }
  });

  // === STATS UPDATE ===
  function updateStats(total, kept, doScroll) {
    var removed = total - kept;
    ccStats = { total: total, kept: kept, removed: removed, timestamp: Date.now() };
    if (config.debug) console.log('[CC][STATS] Update:', { total: total, kept: kept, removed: removed, doScroll: doScroll, sessionTrimCount: SESSION_STATS.trimCount + (doScroll && removed > 0 ? 1 : 0), sessionTotalTrimmed: SESSION_STATS.totalTrimmed + (doScroll && removed > 0 ? removed : 0) });
    if (doScroll && removed > 0) {
      SESSION_STATS.totalTrimmed += removed;
      SESSION_STATS.trimCount++;
      sessionStorage.setItem('__cc_session', JSON.stringify(SESSION_STATS));
      if (showOptimizer()) showToast(t('trimmed') + ' ' + removed + ' ' + t('msgs'));
    }
    updateIndicator();
    window.postMessage({ source: 'cc-interceptor', type: 'CC_STATS_UPDATE', stats: Object.assign({}, ccStats, { session: SESSION_STATS }) }, ORIGIN);
  }

  // === FETCH OVERRIDE ===
  window.fetch = function() {
    var args = arguments;
    var input = args[0];
    var init = args[1];
    var url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    var method = (init && init.method) || 'GET';

    if (showOptimizer() && url.indexOf('completion') !== -1 && method === 'POST' && !config.paused) {
      try {
        var body = init && init.body;
        if (typeof body === 'string') {
          var parsed = JSON.parse(body);
          PENDING_USER_MSG = { parent: parsed.parent_message_uuid, timestamp: Date.now() };
          TRIM_GROWTH += 2;
          if (config.debug) console.log('[CC] MSG OUT → parent:%s leaf:%s growth:%d',
            (parsed.parent_message_uuid || '').substring(0, 8),
            CURRENT_LEAF ? CURRENT_LEAF.substring(0, 8) : 'null',
            TRIM_GROWTH);
          addLog('USER_MSG_OUT', { parent: parsed.parent_message_uuid, currentLeaf: CURRENT_LEAF, growth: TRIM_GROWTH });
        }
      } catch(e) {}
    }

    return origFetch.apply(this, args).then(function(res) {
      // Handle SSE streams — extract leaf UUID from AI response
      if (showOptimizer() && url.indexOf('completion') !== -1 && !config.paused) {
        var streamCT = res.headers.get('content-type') || '';
        if (streamCT.indexOf('text/event-stream') !== -1) {
          try {
            var streamBody = res.body;
            if (streamBody && typeof streamBody.tee === 'function') {
              var streams = streamBody.tee();
              var reader = streams[1].getReader();
              var decoder = new TextDecoder();
              var foundLeaf = false;

              function readChunk() {
                reader.read().then(function(result) {
                  if (result.done || foundLeaf) { reader.cancel().catch(function() {}); return; }
                  var text = decoder.decode(result.value, { stream: true });
                  var lines = text.split('\n');
                  for (var i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('data:')) {
                      try {
                        var d = JSON.parse(lines[i].substring(5));
                        if (d.type === 'message_start' && d.message) {
                          var prevLeaf = CURRENT_LEAF;
                          CURRENT_LEAF = d.message.uuid;
                          sessionStorage.setItem('__cc_leaf', CURRENT_LEAF);
                          if (config.debug) console.log('[CC] SSE leaf:%s ← parent:%s | prev:%s',
                            d.message.uuid.substring(0, 8),
                            (d.message.parent_message_uuid || '').substring(0, 8),
                            prevLeaf ? prevLeaf.substring(0, 8) : 'null');
                          addLog('AI_RESPONSE', { uuid: d.message.uuid, parent: d.message.parent_message_uuid });
                          PENDING_USER_MSG = null;
                          foundLeaf = true;
                          reader.cancel().catch(function() {});
                          return;
                        }
                      } catch(e) {}
                    }
                  }
                  readChunk();
                }).catch(function() {});
              }
              readChunk();
              return new Response(streams[0], { status: res.status, statusText: res.statusText, headers: res.headers });
            }
          } catch(e) {
            if (config.debug) console.error('[CC] SSE tee error:', e.message);
            addLog('ERROR', { type: 'stream_tee', error: e.message });
          }
        }
      }

      if (!showOptimizer() || config.paused) return res;

      // Process chat conversation API responses
      var isChat = url.indexOf('/api/') !== -1 && url.indexOf('chat_conversations/') !== -1 && url.indexOf('completion') === -1;
      if (!isChat) return res;
      var ct = res.headers.get('content-type') || '';
      if (ct.indexOf('application/json') === -1) return res;

      var clone = res.clone();
      return clone.text().then(function(txt) {
        if (txt.trim().indexOf('event:') === 0) return res;

        try {
          var data = JSON.parse(txt);
          if (!data || !data.chat_messages || !Array.isArray(data.chat_messages) || data.chat_messages.length === 0) return res;

          var msgs = data.chat_messages;
          var total = msgs.length;
          var trimStartTime = performance.now();
          var scrollBeforeTrim = getScrollInfo();

          var convMatch = url.match(/chat_conversations\/([^/?]+)/);
          var convUuid = convMatch ? convMatch[1] : null;
          if (convUuid && convUuid !== LAST_TRIM_CONV) {
            if (LAST_TRIM_CONV && config.debug) console.log('[CC] Chat switch: %s → %s, resetting growth', (LAST_TRIM_CONV || '').substring(0, 8), convUuid.substring(0, 8));
            TRIM_GROWTH = 0;
            LAST_TRIM_COUNT = 0;
            LAST_TRIM_CONV = convUuid;
          }

          var apiLeaf = data.current_leaf_message_uuid;
          var sseLeaf = CURRENT_LEAF;
          var leafMismatch = sseLeaf && apiLeaf && sseLeaf !== apiLeaf;

          if (apiLeaf) {
            CURRENT_LEAF = apiLeaf;
            sessionStorage.setItem('__cc_leaf', CURRENT_LEAF);
          }

          // Dynamic keep — grows with new messages to prevent React sync issues
          var effectiveKeep = config.keep + TRIM_GROWTH;
          var GROWTH_CAP = 100;
          if (TRIM_GROWTH > GROWTH_CAP) {
            if (config.debug) console.log('[CC] Growth cap hit (%d), hard reset to keep=%d', TRIM_GROWTH, config.keep);
            effectiveKeep = config.keep;
            TRIM_GROWTH = 0;
          }

          if (total <= effectiveKeep + 1) {
            LAST_TRIM_LEAF = apiLeaf;
            updateStats(total, total, false);
            return res;
          }

          var msgMap = {};
          msgs.forEach(function(m) { msgMap[m.uuid] = m; });

          var NIL_UUID = '00000000-0000-4000-8000-000000000000';
          var realRoot = msgs.find(function(m) {
            return !m.parent_message_uuid || m.parent_message_uuid === NIL_UUID;
          });
          if (!realRoot) { realRoot = msgs[0]; }

          var originalLeaf = apiLeaf;
          if ((!originalLeaf || !msgMap[originalLeaf]) && sseLeaf && msgMap[sseLeaf]) {
            if (config.debug) console.warn('[CC] API leaf missing, using SSE leaf:', sseLeaf.substring(0, 8));
            originalLeaf = sseLeaf;
          }

          if (!originalLeaf || !msgMap[originalLeaf]) {
            if (config.debug) console.error('[CC] LEAF NOT FOUND! leaf:', originalLeaf, 'msgs:', total);
            addLog('TRIM_SKIP', { reason: 'leaf_not_found', leaf: originalLeaf, total: total });
            updateStats(total, total, false);
            return res;
          }

          // Walk leaf → root to build active path
          var path = [];
          var visited = new Set();
          var walker = msgMap[originalLeaf];

          while (walker && walker.uuid !== realRoot.uuid) {
            if (visited.has(walker.uuid)) {
              if (config.debug) console.error('[CC] CYCLE at:', walker.uuid.substring(0, 8));
              break;
            }
            visited.add(walker.uuid);
            path.unshift(walker);
            walker = walker.parent_message_uuid ? msgMap[walker.parent_message_uuid] : null;
          }

          // Abort trim if path is broken
          if (path.length === 0 || !walker || walker.uuid !== realRoot.uuid) {
            if (config.debug) console.error('[CC] PATH BROKEN — pathLen:', path.length, 'root:', realRoot.uuid.substring(0, 8));
            addLog('TRIM_SKIP', { reason: 'path_broken', pathLen: path.length, leaf: originalLeaf });
            updateStats(total, total, false);
            return res;
          }

          var didTrimActivePath = path.length > effectiveKeep;
          var sideBranchCount = total - 1 - path.length;

          if (!didTrimActivePath) {
            // CASE 1: path fits — remove orphaned side branches only
            var pathUuids = new Set([realRoot.uuid]);
            path.forEach(function(m) { pathUuids.add(m.uuid); });

            var keptSides = [];
            var removedMsgs = [];
            var sideQueue = msgs.filter(function(m) { return !pathUuids.has(m.uuid); });
            var allKeptUuids = new Set(pathUuids);
            var changed = true;
            while (changed) {
              changed = false;
              var stillPending = [];
              for (var si = 0; si < sideQueue.length; si++) {
                if (allKeptUuids.has(sideQueue[si].parent_message_uuid)) {
                  keptSides.push(sideQueue[si]);
                  allKeptUuids.add(sideQueue[si].uuid);
                  changed = true;
                } else {
                  stillPending.push(sideQueue[si]);
                }
              }
              sideQueue = stillPending;
            }
            removedMsgs = sideQueue;

            if (removedMsgs.length > 0) { storeRemovedMessages(removedMsgs); }

            data.chat_messages = [realRoot].concat(path).concat(keptSides);
            data.current_leaf_message_uuid = originalLeaf;
            CURRENT_LEAF = originalLeaf;
            LAST_TRIM_LEAF = originalLeaf;
            LAST_TRIM_COUNT = data.chat_messages.length;
            sessionStorage.setItem('__cc_leaf', CURRENT_LEAF);

            if (config.debug) console.log('[CC] Trim: %d→%d (-%d sides, +%d kept-sides) | path:%d | keep:%d(+%d) | leaf:%s ✓',
              total, data.chat_messages.length, removedMsgs.length, keptSides.length,
              path.length, effectiveKeep, TRIM_GROWTH, originalLeaf.substring(0, 8));
          } else {
            // CASE 2: path exceeds limit — trim oldest, keep recent branches
            var keptPath = path.slice(-effectiveKeep);
            var trimmedPath = path.slice(0, path.length - effectiveKeep);

            storeRemovedMessages(trimmedPath);

            var keptPathUuids = new Set([realRoot.uuid]);
            keptPath.forEach(function(m) { keptPathUuids.add(m.uuid); });

            var allPathUuids = new Set(keptPathUuids);
            trimmedPath.forEach(function(m) { allPathUuids.add(m.uuid); });

            var sideQueue2 = msgs.filter(function(m) { return !allPathUuids.has(m.uuid); });
            var keptSides2 = [];

            var allKeptUuids2 = new Set(keptPathUuids);
            var changed2 = true;
            while (changed2) {
              changed2 = false;
              var stillPending2 = [];
              for (var si2 = 0; si2 < sideQueue2.length; si2++) {
                if (allKeptUuids2.has(sideQueue2[si2].parent_message_uuid)) {
                  keptSides2.push(sideQueue2[si2]);
                  allKeptUuids2.add(sideQueue2[si2].uuid);
                  changed2 = true;
                } else {
                  stillPending2.push(sideQueue2[si2]);
                }
              }
              sideQueue2 = stillPending2;
            }
            var sideBranchMsgs = sideQueue2;
            if (sideBranchMsgs.length > 0) { storeRemovedMessages(sideBranchMsgs); }

            // Re-parent first kept message to root
            if (keptPath.length > 0) {
              keptPath[0] = Object.assign({}, keptPath[0], { parent_message_uuid: realRoot.uuid });
            }

            data.chat_messages = [realRoot].concat(keptPath).concat(keptSides2);
            data.current_leaf_message_uuid = originalLeaf;
            CURRENT_LEAF = originalLeaf;
            LAST_TRIM_LEAF = originalLeaf;
            LAST_TRIM_COUNT = data.chat_messages.length;
            sessionStorage.setItem('__cc_leaf', CURRENT_LEAF);

            var newestKept = keptPath[keptPath.length - 1];
            var leafOk = newestKept.uuid === originalLeaf;
            if (config.debug) console.log('[CC] Trim: %d→%d (-%d path, -%d sides, +%d kept-sides) | keep:%d(+%d) | kept:[%s..%s] | leaf:%s %s',
              total, data.chat_messages.length, trimmedPath.length, sideBranchMsgs.length, keptSides2.length,
              effectiveKeep, TRIM_GROWTH,
              keptPath[0].uuid.substring(0, 8), newestKept.uuid.substring(0, 8),
              originalLeaf.substring(0, 8), leafOk ? '✓' : '✗ MISMATCH!');

            if (!leafOk) {
              if (config.debug) console.error('[CC] LEAF MISMATCH! Last kept:', newestKept.uuid, 'Expected leaf:', originalLeaf);
            }
          }

          // Verify parent chain integrity
          var kept = data.chat_messages.length;
          var resultMap = {};
          data.chat_messages.forEach(function(m) { resultMap[m.uuid] = true; });
          var brokenCount = 0;
          data.chat_messages.forEach(function(m, i) {
            if (i === 0) return;
            if (m.parent_message_uuid && !resultMap[m.parent_message_uuid]) brokenCount++;
          });

          var trimTime = (performance.now() - trimStartTime).toFixed(1);

          if (config.debug && (brokenCount > 0 || leafMismatch)) {
            console.log('[CC] ⚠ chain:%s | leafSync:%s | %sms',
              brokenCount > 0 ? brokenCount + ' BROKEN' : 'OK',
              leafMismatch ? 'MISMATCH(api:' + apiLeaf.substring(0, 8) + ' sse:' + sseLeaf.substring(0, 8) + ')' : 'OK',
              trimTime);
          }

          if (config.debug && brokenCount > 0) {
            console.error('[CC] BROKEN PARENT CHAIN! ' + brokenCount + ' messages with missing parents');
          }

          addLog('TRIM', {
            before: total, after: kept, leaf: originalLeaf,
            didTrimActive: didTrimActivePath, sideBranches: sideBranchCount,
            brokenChains: brokenCount, trimMs: parseFloat(trimTime),
            effectiveKeep: effectiveKeep, growth: TRIM_GROWTH,
            leafMismatch: leafMismatch
          });
          updateStats(total, kept, didTrimActivePath);

          // Scroll restoration
          if (scrollBeforeTrim) {
            requestAnimationFrame(function() {
              setTimeout(function() {
                var scrollAfter = getScrollInfo();
                if (!scrollAfter || !scrollAfter.element) return;

                if (scrollBeforeTrim.isAtBottom) {
                  scrollAfter.element.scrollTop = scrollAfter.element.scrollHeight;
                  if (config.debug) console.log('[CC] Scroll: restored to bottom');
                } else {
                  var targetFromBottom = scrollBeforeTrim.scrollBottom;
                  var newScrollTop = scrollAfter.element.scrollHeight - scrollAfter.element.clientHeight - targetFromBottom;
                  if (newScrollTop < 0) newScrollTop = 0;
                  scrollAfter.element.scrollTop = newScrollTop;
                  if (config.debug) console.log('[CC] Scroll: restored position (fromBottom:%d, newTop:%d, delta:%d)',
                    targetFromBottom, newScrollTop,
                    Math.round(newScrollTop - scrollBeforeTrim.scrollTop));
                }
              }, 150);
            });
          }

          // Build response
          var newBody = JSON.stringify(data);
          var newHeaders = new Headers(res.headers);
          if (newHeaders.has('content-length')) {
            newHeaders.set('content-length', String(new Blob([newBody]).size));
          }
          return new Response(newBody, { status: res.status, statusText: res.statusText, headers: newHeaders });

        } catch(e) {
          if (config.debug) console.error('[CC] TRIM ERROR:', e.message, e.stack);
          addLog('ERROR', { type: 'trim', error: e.message, stack: e.stack });
          return res;
        }
      }).catch(function(e) {
        addLog('ERROR', { type: 'clone_read', error: e.message });
        return res;
      });
    });
  };

  // === DEBUG TOOLS ===
  Object.defineProperty(window, '__ccDebugTools', {
    get: function() {
      return {
        resetPos: function() { indicatorPos = { right: 20, bottom: 20 }; localStorage.removeItem('__cc_indicator_pos'); if (indicator) { indicator.style.right = '20px'; indicator.style.bottom = '20px'; } },
        scrollDown: scrollToBottom,
        limits: function() { return usageLimits; },
        refreshLimits: fetchUsageLimits,
        mode: function(m) { if (m) { config.displayMode = m; rebuildIndicator(); } return config.displayMode; },
        info: function() { console.table({ Keep: config.keep, Paused: config.paused, ShowIndicator: config.showIndicator, Lang: config.lang, Mode: config.displayMode, Leaf: CURRENT_LEAF, LastTrimLeaf: LAST_TRIM_LEAF, PendingMsg: PENDING_USER_MSG ? JSON.stringify(PENDING_USER_MSG) : 'none', Stored: REMOVED_MESSAGES.length, RAM: currentRAM + 'MB', Session: usageLimits && usageLimits.session ? usageLimits.session.percent + '%' : 'N/A' }); },
        log: function(n) { DEBUG_LOG.slice(-(n||20)).forEach(function(e) { console.log(e.time, '['+e.type+']', e.data); }); },
        search: searchRemoved,
        export: function() { var blob = new Blob([JSON.stringify({ config:config, stats:ccStats, session:SESSION_STATS, removed:REMOVED_MESSAGES, log:DEBUG_LOG, limits:usageLimits }, null, 2)], { type: 'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cc-debug-'+Date.now()+'.json'; a.click(); URL.revokeObjectURL(a.href); },
        reset: function() { SESSION_STATS = { totalTrimmed: 0, trimCount: 0 }; DEBUG_LOG = []; REMOVED_MESSAGES = []; CURRENT_LEAF = null; LAST_TRIM_LEAF = null; PENDING_USER_MSG = null; TRIM_GROWTH = 0; LAST_TRIM_CONV = null; LAST_TRIM_COUNT = 0; ccStats = { total: 0, kept: 0, removed: 0 }; ['__cc_session','__cc_leaf','__cc_debug_log','__cc_removed'].forEach(function(k) { sessionStorage.removeItem(k); }); updateIndicator(); }
      };
    },
    configurable: false,
    enumerable: false
  });

  // === INIT ===
  function init() {
    if (document.body) {
      createIndicator();
      updateIndicator();
      log('Claude Lite v11.5 initialized (mode: ' + config.displayMode + ')');
    } else {
      setTimeout(init, 100);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  if (config.debug) console.log('%c[CC] Claude Lite v11.5 - Tree-aware trimming', 'color:#6366f1;font-weight:bold');
  window.postMessage({ source: 'cc-interceptor', type: 'CC_READY' }, ORIGIN);
})();
