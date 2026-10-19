import { getState, updateState, getStorageStatus } from './store.js';

const rootURL = new URL('../', import.meta.url);
const courseURL = path => new URL(path, rootURL);
const chapterNumber = Number(location.pathname.match(/\/lesson-0([1-5])(?:\/|$)/)?.[1]) || 0;
const copy = {
  zh: {
    tools: '学习工具', subtitle: '查找知识点，记录你的学习过程', close: '关闭学习工具',
    search: '课程搜索', progress: '学习进度', notes: '收藏笔记', quiz: '章节练习',
    loading: '正在读取课程目录…', indexError: '课程目录暂时无法读取，请检查网络后重试。', retry: '重新加载',
    local: '学习记录只保存在当前浏览器。', storageError: '浏览器无法保存记录：本页暂存仍可使用，关闭或刷新前请导出记录。',
    storageInvalid: '原有学习记录格式异常，已启用空白记录。你可以继续学习并保存新记录。',
    searchLabel: '搜索课程知识点', searchHint: '支持中文、英文和代码关键词，例如 rollup、数据绑定、等值线。',
    searchPlaceholder: '输入知识点或代码关键词…', clear: '清空', results: '个相关小节', noResults: '没有找到相关内容，试试更短的关键词。',
    searchEmpty: '搜索全部 {n} 个课程小节，结果可直接跳转。', suggestions: '试试这些关键词',
    current: '当前小节', homeHint: '进入任一课程小节后，可以标记已学、收藏或写笔记。',
    mark: '标记为已学', unmark: '取消已学', bookmark: '收藏本节', unbookmark: '取消收藏',
    completed: '已学', sections: '个小节', continue: '继续上次学习', noLast: '还没有学习记录，从第1章开始吧。',
    start: '开始学习', overview: '课程总进度', progressHint: '只有主动勾选的小节才计入进度，浏览和切换页面不会自动完成。',
    allLessons: '各章小节', noteLabel: '本节笔记', notePlaceholder: '记下你的理解、疑问或实验结果…',
    noteHint: '输入后自动保存；每节最多 20,000 字。', saving: '正在保存…', saved: '已保存在本地', savedMemory: '已暂存，请及时导出',
    library: '我的收藏与笔记', emptyLibrary: '还没有收藏或笔记。进入课程后，将需要复习的小节收进这里。',
    noteTag: '有笔记', bookmarkTag: '已收藏', open: '打开小节', deleteNote: '删除笔记', export: '导出学习记录',
    exportDone: '已导出包含进度、笔记和答题记录的 JSON 文件。', lab: '时序图表联动实验',
    labHint: '用同一份天气数据，比较折线图、日历热图和螺旋图。', labLink: '进入实验',
    quizLoading: '正在加载章节练习…', quizError: '章节练习暂时无法加载，请重试。',
    privacy: '浏览器本地记录 · 无需注册', noteDeleted: '已删除该笔记。',
  },
  en: {
    tools: 'Learning tools', subtitle: 'Find concepts and keep track of your learning', close: 'Close learning tools',
    search: 'Search', progress: 'Progress', notes: 'Notes', quiz: 'Exercises',
    loading: 'Loading the course index…', indexError: 'The course index could not be loaded. Check your connection and try again.', retry: 'Try again',
    local: 'Learning records are stored only in this browser.', storageError: 'Browser storage is unavailable. Records are held on this page only; export before closing or refreshing.',
    storageInvalid: 'The saved records could not be read. A blank record is ready for new learning activity.',
    searchLabel: 'Search course concepts', searchHint: 'Search in Chinese, English, or code: try rollup, data binding, or contour.',
    searchPlaceholder: 'Search a concept or code keyword…', clear: 'Clear', results: 'matching sections', noResults: 'No matching sections. Try a shorter keyword.',
    searchEmpty: 'Search all {n} course sections and jump directly to a result.', suggestions: 'Try a keyword',
    current: 'Current section', homeHint: 'Open a course section to mark it as studied, bookmark it, or write a note.',
    mark: 'Mark as studied', unmark: 'Unmark studied', bookmark: 'Bookmark section', unbookmark: 'Remove bookmark',
    completed: 'Studied', sections: 'sections', continue: 'Continue learning', noLast: 'No learning history yet. Start with Chapter 1.',
    start: 'Start learning', overview: 'Course progress', progressHint: 'Only sections you explicitly mark count toward progress. Browsing does not mark a section as studied.',
    allLessons: 'Course sections', noteLabel: 'Section note', notePlaceholder: 'Write an explanation, question, or experiment result…',
    noteHint: 'Saves automatically; up to 20,000 characters per section.', saving: 'Saving…', saved: 'Saved locally', savedMemory: 'Held on this page; please export',
    library: 'Bookmarks and notes', emptyLibrary: 'No bookmarks or notes yet. Save a course section here when you want to revisit it.',
    noteTag: 'Has a note', bookmarkTag: 'Bookmarked', open: 'Open section', deleteNote: 'Delete note', export: 'Export learning records',
    exportDone: 'Exported a JSON file containing progress, notes, and exercise answers.', lab: 'Linked time-series lab',
    labHint: 'Compare a line chart, calendar heatmap, and spiral using the same weather data.', labLink: 'Open lab',
    quizLoading: 'Loading exercises…', quizError: 'Exercises could not be loaded. Please try again.',
    privacy: 'Local browser records · No sign-up', noteDeleted: 'The note was deleted.',
  },
};

function readLanguage() {
  const locale = window.__i18n?.getLocale?.() || document.documentElement.lang || 'zh';
  return String(locale).toLowerCase().startsWith('en') ? 'en' : 'zh';
}
let lang = readLanguage();
const t = key => copy[lang][key] || key;
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function button(text, className, action) {
  const node = el('button', className, text);
  node.type = 'button';
  if (action) node.addEventListener('click', action);
  return node;
}
function muted(text) { return el('p', 'vl-muted', text); }
function sectionTitle(section) { return lang === 'en' && section.titleEn ? section.titleEn : section.title; }
function chapterTitle(chapter) { return lang === 'en' && chapter.titleEn ? chapter.titleEn : chapter.title; }
function normalizedPath(path) { return path.replace(/index\.html$/, '').replace(/\/$/, ''); }

let index = null;
let indexFailed = false;
let current = null;
let selectedTab = 'search';
let query = '';
let previousFocus = null;
let isOpen = false;
let quizCleanup = null;
let quizGeneration = 0;
let noteTimer = null;
let pendingNote = null;
const expandedChapters = new Set(chapterNumber ? [chapterNumber] : []);
const inertBefore = new Map();

const host = el('div', 'vl-root');
host.dataset.learningTools = 'true';
const launcher = button('', 'vl-launcher', openDrawer);
launcher.setAttribute('aria-controls', 'vl-drawer');
launcher.setAttribute('aria-expanded', 'false');
const launcherIcon = el('span', 'vl-launcher-icon', '✦');
launcherIcon.setAttribute('aria-hidden', 'true');
const launcherLabel = el('span', 'vl-launcher-label');
launcher.append(launcherIcon, launcherLabel);
const backdrop = el('div', 'vl-backdrop');
backdrop.hidden = true;
backdrop.addEventListener('click', closeDrawer);
const drawer = el('section', 'vl-drawer');
drawer.id = 'vl-drawer';
drawer.hidden = true;
drawer.setAttribute('role', 'dialog');
drawer.setAttribute('aria-modal', 'true');
drawer.setAttribute('aria-labelledby', 'vl-title');
drawer.tabIndex = -1;
const header = el('div', 'vl-header');
const headingBlock = el('div', 'vl-heading-block');
const title = el('h2', 'vl-title');
title.id = 'vl-title';
const subtitle = el('p', 'vl-subtitle');
headingBlock.append(title, subtitle);
const closeButton = button('×', 'vl-close', closeDrawer);
header.append(headingBlock, closeButton);
const storageBanner = el('p', 'vl-storage-banner');
storageBanner.setAttribute('role', 'status');
storageBanner.hidden = true;
const tabList = el('div', 'vl-tabs');
tabList.setAttribute('role', 'tablist');
const tabs = new Map();
for (const name of ['search', 'progress', 'notes', 'quiz']) {
  const tab = button('', 'vl-tab', () => selectTab(name));
  tab.id = `vl-tab-${name}`;
  tab.dataset.vlFocus = `tab-${name}`;
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', 'vl-panel');
  tabs.set(name, tab);
  tabList.append(tab);
}
tabList.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const names = [...tabs.keys()];
  const position = names.indexOf(selectedTab);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? names.length - 1
    : (position + (event.key === 'ArrowRight' ? 1 : -1) + names.length) % names.length;
  selectTab(names[next]);
  tabs.get(names[next]).focus();
});
const panel = el('div', 'vl-panel');
panel.id = 'vl-panel';
panel.setAttribute('role', 'tabpanel');
panel.tabIndex = -1;
const footer = el('div', 'vl-footer');
const privacy = el('span', 'vl-muted');
const exportButton = button('', 'vl-text-button', exportRecords);
exportButton.dataset.vlFocus = 'export';
footer.append(privacy, exportButton);
const announcement = el('div', 'vl-sr-only');
announcement.setAttribute('role', 'status');
announcement.setAttribute('aria-live', 'polite');
drawer.append(header, storageBanner, tabList, panel, footer, announcement);
host.append(launcher, backdrop, drawer);
document.body.append(host);

function announce(text) { announcement.textContent = text; }
function refreshLabels() {
  launcherLabel.textContent = t('tools');
  launcher.setAttribute('aria-label', t('tools'));
  title.textContent = t('tools');
  subtitle.textContent = t('subtitle');
  closeButton.setAttribute('aria-label', t('close'));
  tabList.setAttribute('aria-label', t('tools'));
  privacy.textContent = t('privacy');
  exportButton.textContent = t('export');
  for (const [name, tab] of tabs) {
    tab.textContent = t(name);
    const active = name === selectedTab;
    tab.classList.toggle('vl-is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  panel.setAttribute('aria-labelledby', `vl-tab-${selectedTab}`);
  updateStorageBanner();
}
function updateStorageBanner() {
  const status = getStorageStatus();
  storageBanner.hidden = status.available && !status.reason;
  storageBanner.textContent = status.available ? t('storageInvalid') : t('storageError');
}
function openDrawer() {
  if (isOpen) return;
  isOpen = true;
  previousFocus = document.activeElement;
  for (const sibling of document.body.children) {
    if (sibling === host || ['SCRIPT', 'STYLE'].includes(sibling.tagName)) continue;
    inertBefore.set(sibling, sibling.inert);
    sibling.inert = true;
  }
  document.body.classList.add('vl-scroll-locked');
  launcher.hidden = true;
  backdrop.hidden = false;
  drawer.hidden = false;
  launcher.setAttribute('aria-expanded', 'true');
  renderActive();
  requestAnimationFrame(() => (selectedTab === 'search' ? panel.querySelector('input') : closeButton)?.focus());
}
function closeDrawer() {
  if (!isOpen) return;
  flushNote();
  isOpen = false;
  drawer.hidden = true;
  backdrop.hidden = true;
  launcher.hidden = false;
  launcher.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('vl-scroll-locked');
  for (const [node, wasInert] of inertBefore) node.inert = wasInert;
  inertBefore.clear();
  (previousFocus?.isConnected ? previousFocus : launcher).focus();
}
drawer.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); closeDrawer(); return; }
  if (event.key !== 'Tab') return;
  const focusable = [...drawer.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')]
    .filter(node => !node.disabled && !node.hidden && node.getClientRects().length);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === drawer)) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});

function selectTab(name) {
  flushNote();
  selectedTab = name;
  refreshLabels();
  renderActive();
}
function preserveFocus(render) {
  const active = document.activeElement;
  const wasInsidePanel = panel.contains(active);
  const key = active?.dataset?.vlFocus;
  const selection = active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement
    ? [active.selectionStart, active.selectionEnd] : null;
  render();
  if (!key) return;
  const replacement = [...host.querySelectorAll('[data-vl-focus]')].find(node => node.dataset.vlFocus === key);
  if (replacement) {
    replacement.focus({ preventScroll: true });
    if (selection && typeof replacement.setSelectionRange === 'function') replacement.setSelectionRange(...selection);
  } else if (wasInsidePanel && isOpen) panel.focus({ preventScroll: true });
}
function renderActive() {
  quizGeneration += 1;
  quizCleanup?.();
  quizCleanup = null;
  panel.replaceChildren();
  if (!index) {
    panel.append(muted(t(indexFailed ? 'indexError' : 'loading')));
    if (indexFailed) panel.append(button(t('retry'), 'vl-button vl-button-primary', loadIndex));
    return;
  }
  if (selectedTab === 'search') renderSearch();
  if (selectedTab === 'progress') renderProgress();
  if (selectedTab === 'notes') renderNotes();
  if (selectedTab === 'quiz') renderQuiz();
}
function navigate(section) {
  flushNote();
  const target = courseURL(section.url);
  if (target.origin !== location.origin || !target.pathname.startsWith(rootURL.pathname)) return;
  closeDrawer();
  if (normalizedPath(target.pathname) === normalizedPath(location.pathname)) {
    if (location.hash === target.hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = target.hash;
    requestAnimationFrame(syncCurrent);
  } else location.assign(target.href);
}
function sectionLink(section, className = '', text = sectionTitle(section)) {
  const link = el('a', className, text);
  link.href = courseURL(section.url).href;
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    navigate(section);
  });
  return link;
}

function highlight(node, text, words) {
  const lowered = text.toLocaleLowerCase();
  const ranges = [];
  for (const word of words) {
    let offset = 0;
    let at;
    while (word && (at = lowered.indexOf(word, offset)) !== -1) {
      ranges.push([at, at + word.length]);
      offset = at + word.length;
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const range of ranges) {
    const previous = merged[merged.length - 1];
    if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
    else merged.push([...range]);
  }
  let offset = 0;
  for (const [start, end] of merged) {
    node.append(document.createTextNode(text.slice(offset, start)), el('mark', 'vl-mark', text.slice(start, end)));
    offset = end;
  }
  node.append(document.createTextNode(text.slice(offset)));
}
function excerpt(text, words) {
  const positions = words.map(word => text.toLocaleLowerCase().indexOf(word)).filter(at => at >= 0);
  const at = positions.length ? Math.min(...positions) : 0;
  const start = Math.max(0, at - 34);
  return `${start ? '…' : ''}${text.slice(start, start + 150)}${start + 150 < text.length ? '…' : ''}`;
}
function renderSearch() {
  const label = el('label', 'vl-field-label', t('searchLabel'));
  label.htmlFor = 'vl-search';
  const row = el('div', 'vl-search-row');
  const input = el('input', 'vl-input');
  input.id = 'vl-search';
  input.type = 'search';
  input.value = query;
  input.placeholder = t('searchPlaceholder');
  input.autocomplete = 'off';
  input.maxLength = 180;
  input.dataset.vlFocus = 'search';
  input.setAttribute('aria-describedby', 'vl-search-hint');
  const clear = button(t('clear'), 'vl-button vl-button-small', () => { input.value = ''; query = ''; showResults(); input.focus(); });
  row.append(input, clear);
  const hint = muted(t('searchHint'));
  hint.id = 'vl-search-hint';
  const results = el('div', 'vl-results');
  const resultCount = el('p', 'vl-result-count');
  resultCount.setAttribute('role', 'status');
  resultCount.setAttribute('aria-live', 'polite');
  const entries = el('div', 'vl-result-list');
  results.append(resultCount, entries);
  input.addEventListener('input', () => { query = input.value; showResults(); });
  panel.append(label, row, hint, results);
  function showResults() {
    entries.replaceChildren();
    const words = [...new Set(query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean))].slice(0, 10);
    if (!words.length) {
      resultCount.textContent = t('searchEmpty').replace('{n}', index.sections.length);
      const suggestions = el('div', 'vl-suggestions');
      suggestions.append(el('span', 'vl-small-label', t('suggestions')));
      for (const value of (lang === 'en' ? ['rollup', 'data binding', 'contour', 'color'] : ['数据绑定', 'rollup', '等值线', '配色'])) {
        suggestions.append(button(value, 'vl-chip', () => { query = value; input.value = value; showResults(); input.focus(); }));
      }
      entries.append(suggestions, labCard());
      return;
    }
    const matches = index.sections.map(section => {
      const titleText = `${section.title} ${section.titleEn || ''}`.toLocaleLowerCase();
      const body = `${section.text || ''} ${section.textEn || ''} ${(section.keywords || []).join?.(' ') || section.keywords || ''}`.toLocaleLowerCase();
      const all = `${titleText} ${body} ${section.chapterTitle || ''}`;
      if (!words.every(word => all.includes(word))) return null;
      return { section, score: words.reduce((score, word) => score + (titleText.includes(word) ? 10 : body.includes(word) ? 1 : 0), 0) };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
    resultCount.textContent = `${matches.length} ${t('results')}`;
    if (!matches.length) { entries.append(muted(t('noResults'))); return; }
    for (const { section } of matches) {
      const link = sectionLink(section, 'vl-search-result', '');
      const eyebrow = el('span', 'vl-result-chapter', section.chapterTitle || chapterTitle(index.chapters.find(c => Number(c.id) === Number(section.chapter)) || { title: '' }));
      const heading = el('strong', 'vl-result-title');
      highlight(heading, sectionTitle(section), words);
      const alternateTitle = lang === 'en' ? section.title : section.titleEn;
      const alternateHeading = el('span', 'vl-result-alt-title');
      if (alternateTitle && !words.some(word => sectionTitle(section).toLocaleLowerCase().includes(word))
        && words.some(word => alternateTitle.toLocaleLowerCase().includes(word))) highlight(alternateHeading, alternateTitle, words);
      const body = el('span', 'vl-result-excerpt');
      const primaryText = (lang === 'en' && section.textEn ? section.textEn : section.text) || '';
      const otherText = (lang === 'en' ? section.text : section.textEn) || '';
      const hits = text => words.filter(word => text.toLocaleLowerCase().includes(word)).length;
      const shownText = hits(otherText) > hits(primaryText) ? otherText : primaryText;
      highlight(body, excerpt(shownText, words), words);
      link.append(eyebrow, heading, alternateHeading, body);
      entries.append(link);
    }
  }
  showResults();
}

function currentCard(withNotes = false) {
  const card = el('div', 'vl-current-card');
  card.append(el('p', 'vl-small-label', t('current')));
  if (!current) { card.append(muted(t('homeHint'))); return card; }
  const state = getState();
  card.append(el('h3', 'vl-card-title', sectionTitle(current)));
  const actions = el('div', 'vl-actions');
  const done = state.completed.includes(current.id);
  const marked = state.bookmarks.includes(current.id);
  const complete = button(t(done ? 'unmark' : 'mark'), `vl-button ${done ? 'vl-button-done' : 'vl-button-primary'}`, () => {
    const id = current.id;
    updateState(next => { next.completed = next.completed.includes(id) ? next.completed.filter(value => value !== id) : [...next.completed, id]; });
  });
  complete.setAttribute('aria-pressed', String(done));
  complete.dataset.vlFocus = 'complete-current';
  const bookmark = button(t(marked ? 'unbookmark' : 'bookmark'), 'vl-button', () => {
    const id = current.id;
    updateState(next => { next.bookmarks = next.bookmarks.includes(id) ? next.bookmarks.filter(value => value !== id) : [...next.bookmarks, id]; });
  });
  bookmark.dataset.vlFocus = 'bookmark-current';
  bookmark.setAttribute('aria-pressed', String(marked));
  actions.append(complete, bookmark);
  card.append(actions);
  if (withNotes) {
    const label = el('label', 'vl-field-label', t('noteLabel'));
    label.htmlFor = 'vl-note';
    const textarea = el('textarea', 'vl-textarea');
    textarea.id = 'vl-note';
    textarea.rows = 6;
    textarea.maxLength = 20000;
    textarea.placeholder = t('notePlaceholder');
    textarea.value = state.notes[current.id] || '';
    textarea.dataset.vlFocus = 'note';
    textarea.setAttribute('aria-describedby', 'vl-note-hint');
    const hint = muted(t('noteHint'));
    hint.id = 'vl-note-hint';
    const saveStatus = el('span', 'vl-save-status');
    saveStatus.id = 'vl-note-save-status';
    saveStatus.setAttribute('role', 'status');
    if (state.notes[current.id]) saveStatus.textContent = t(getStorageStatus().available ? 'saved' : 'savedMemory');
    textarea.addEventListener('input', () => {
      pendingNote = { id: current.id, text: textarea.value };
      saveStatus.textContent = t('saving');
      clearTimeout(noteTimer);
      noteTimer = setTimeout(flushNote, 350);
    });
    textarea.addEventListener('blur', flushNote);
    card.append(label, textarea, hint, saveStatus);
  }
  return card;
}
function flushNote() {
  clearTimeout(noteTimer);
  if (!pendingNote) return;
  const entry = pendingNote;
  pendingNote = null;
  updateState(state => {
    if (entry.text.trim()) state.notes[entry.id] = entry.text;
    else delete state.notes[entry.id];
  });
  const feedback = document.getElementById('vl-note-save-status');
  if (feedback) feedback.textContent = t(getStorageStatus().available ? 'saved' : 'savedMemory');
}

function renderProgress() {
  const state = getState();
  const validCompleted = index.sections.filter(section => state.completed.includes(section.id));
  const total = index.sections.length;
  const percentage = total ? Math.round(validCompleted.length / total * 100) : 0;
  const overview = el('div', 'vl-progress-card');
  const top = el('div', 'vl-progress-top');
  top.append(el('h3', 'vl-card-title', t('overview')), el('strong', 'vl-progress-number', `${percentage}%`));
  const bar = el('progress', 'vl-progress');
  bar.max = total;
  bar.value = validCompleted.length;
  bar.setAttribute('aria-label', t('overview'));
  overview.append(top, bar, muted(`${t('completed')} ${validCompleted.length} / ${total} ${t('sections')}`), muted(t('progressHint')));
  const last = state.last && index.sections.find(section => section.url === state.last.url || section.id === state.last.section);
  const continuation = el('div', 'vl-continue-card');
  if (last) {
    continuation.append(el('span', 'vl-small-label', t('continue')), sectionLink(last, 'vl-continue-link'));
  } else {
    continuation.append(muted(t('noLast')));
    if (index.sections[0]) continuation.append(sectionLink(index.sections[0], 'vl-text-link', t('start')));
  }
  panel.append(overview, continuation, currentCard(), el('h3', 'vl-section-heading', t('allLessons')));
  for (const chapter of index.chapters) {
    const sections = index.sections.filter(section => Number(section.chapter) === Number(chapter.id));
    const count = sections.filter(section => state.completed.includes(section.id)).length;
    const details = el('details', 'vl-chapter-progress');
    details.open = expandedChapters.has(Number(chapter.id));
    details.addEventListener('toggle', () => details.open ? expandedChapters.add(Number(chapter.id)) : expandedChapters.delete(Number(chapter.id)));
    const summary = el('summary', 'vl-chapter-summary');
    summary.append(el('span', '', chapterTitle(chapter)), el('span', 'vl-chapter-count', `${count}/${sections.length}`));
    details.append(summary);
    for (const section of sections) {
      const row = el('div', 'vl-section-row');
      const checkbox = el('input', 'vl-checkbox');
      checkbox.type = 'checkbox';
      checkbox.checked = state.completed.includes(section.id);
      checkbox.setAttribute('aria-label', `${t('completed')}: ${sectionTitle(section)}`);
      checkbox.dataset.vlFocus = `complete-${section.id}`;
      checkbox.addEventListener('change', () => updateState(next => {
        next.completed = checkbox.checked ? [...new Set([...next.completed, section.id])] : next.completed.filter(id => id !== section.id);
      }));
      const link = sectionLink(section, 'vl-section-link');
      if (section.id === current?.id) { row.classList.add('vl-current-row'); link.setAttribute('aria-current', 'location'); }
      row.append(checkbox, link);
      details.append(row);
    }
    panel.append(details);
  }
  panel.append(labCard());
}
function renderNotes() {
  panel.append(currentCard(true), el('h3', 'vl-section-heading', t('library')));
  const savedList = el('div', 'vl-saved-list');
  savedList.id = 'vl-saved-list';
  panel.append(savedList);
  renderSavedList(savedList);
}
function renderSavedList(container) {
  const state = getState();
  container.replaceChildren();
  const saved = index.sections.filter(section => state.bookmarks.includes(section.id) || state.notes[section.id]);
  if (!saved.length) container.append(muted(t('emptyLibrary')));
  for (const section of saved) {
    const card = el('div', 'vl-saved-card');
    card.append(sectionLink(section, 'vl-saved-title'));
    const tags = el('div', 'vl-tags');
    if (state.bookmarks.includes(section.id)) tags.append(el('span', 'vl-tag', t('bookmarkTag')));
    if (state.notes[section.id]) tags.append(el('span', 'vl-tag', t('noteTag')));
    card.append(tags);
    if (state.notes[section.id]) card.append(el('p', 'vl-note-preview', state.notes[section.id]));
    const actions = el('div', 'vl-actions');
    actions.append(sectionLink(section, 'vl-text-link', t('open')));
    if (state.bookmarks.includes(section.id)) {
      const remove = button(t('unbookmark'), 'vl-text-button', () => updateState(next => { next.bookmarks = next.bookmarks.filter(id => id !== section.id); }));
      remove.dataset.vlFocus = `bookmark-${section.id}`;
      actions.append(remove);
    }
    if (state.notes[section.id]) {
      const remove = button(t('deleteNote'), 'vl-text-button vl-danger-text', () => {
        pendingNote = null;
        clearTimeout(noteTimer);
        updateState(next => { delete next.notes[section.id]; });
        announce(t('noteDeleted'));
      });
      remove.dataset.vlFocus = `delete-note-${section.id}`;
      actions.append(remove);
    }
    card.append(actions);
    container.append(card);
  }
}
function labCard() {
  const card = el('div', 'vl-lab-card');
  card.append(el('h3', 'vl-card-title', t('lab')), muted(t('labHint')));
  const link = el('a', 'vl-text-link', `${t('labLink')} →`);
  link.href = courseURL('learning/lab/').href;
  card.append(link);
  return card;
}
async function renderQuiz() {
  const generation = quizGeneration;
  const loading = muted(t('quizLoading'));
  panel.append(loading);
  try {
    const { mountQuiz } = await import('./exercises.js');
    if (generation !== quizGeneration || selectedTab !== 'quiz') return;
    panel.replaceChildren();
    const mount = el('div', 'vl-quiz-mount');
    panel.append(mount);
    quizCleanup = mountQuiz(mount, chapterNumber, { lang });
  } catch {
    if (generation !== quizGeneration) return;
    panel.replaceChildren(muted(t('quizError')), button(t('retry'), 'vl-button', renderActive));
  }
}
function exportRecords() {
  flushNote();
  const state = getState();
  const annotated = {
    exportedAt: new Date().toISOString(),
    course: '可视化导论 / Introduction to Visualization',
    ...state,
    sections: (index?.sections || []).filter(section => state.completed.includes(section.id) || state.bookmarks.includes(section.id) || state.notes[section.id])
      .map(section => ({ id: section.id, title: section.title, url: section.url, completed: state.completed.includes(section.id), bookmarked: state.bookmarks.includes(section.id), note: state.notes[section.id] || '' })),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(annotated, null, 2)], { type: 'application/json;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `visualization-learning-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce(t('exportDone'));
}

function syncCurrent() {
  if (!index || !chapterNumber) return;
  const local = index.sections.filter(section => Number(section.chapter) === chapterNumber);
  const hashMatch = local.find(section => courseURL(section.url).hash === location.hash);
  const active = document.querySelector('article.chapter.active');
  const next = hashMatch || local.find(section => courseURL(section.url).hash === `#${active?.id}`) || local[0];
  if (!next || current?.id === next.id) return;
  flushNote();
  current = next;
  updateState(state => { state.last = { url: next.url, title: next.title, chapter: chapterNumber, section: next.id, at: Date.now() }; });
}
let currentFrame = 0;
function scheduleSync() {
  cancelAnimationFrame(currentFrame);
  currentFrame = requestAnimationFrame(syncCurrent);
}
const chapterObserver = new MutationObserver(scheduleSync);
document.querySelectorAll('article.chapter').forEach(article => chapterObserver.observe(article, { attributes: true, attributeFilter: ['class'] }));
window.addEventListener('hashchange', scheduleSync);
window.addEventListener('popstate', scheduleSync);
document.querySelectorAll('.chapter-nav a[data-chapter]').forEach(link => link.addEventListener('click', scheduleSync));
window.addEventListener('pagehide', flushNote);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushNote(); });

window.addEventListener('vis-learning-change', event => {
  updateStorageBanner();
  if (!isOpen || !index || selectedTab === 'search' || selectedTab === 'quiz') return;
  const editingNote = document.activeElement?.id === 'vl-note';
  if (editingNote) {
    const list = document.getElementById('vl-saved-list');
    if (list) renderSavedList(list);
    if (event.detail?.external) {
      const textarea = document.activeElement;
      if (!pendingNote) textarea.value = getState().notes[current?.id] || '';
    }
    return;
  }
  preserveFocus(renderActive);
});
const languageObserver = new MutationObserver(() => {
  const next = readLanguage();
  if (next === lang) return;
  flushNote();
  lang = next;
  refreshLabels();
  if (isOpen) preserveFocus(renderActive);
});
languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

async function loadIndex() {
  indexFailed = false;
  if (isOpen) renderActive();
  try {
    const response = await fetch(new URL('./search-index.json', import.meta.url));
    if (!response.ok) throw new Error('Course index unavailable');
    const data = await response.json();
    if (!Array.isArray(data.sections) || !Array.isArray(data.chapters)) throw new Error('Invalid course index');
    index = data;
    syncCurrent();
  } catch { indexFailed = true; }
  if (isOpen) preserveFocus(renderActive);
}
refreshLabels();
loadIndex();
