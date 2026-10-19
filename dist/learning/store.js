/** Browser-local learning records shared by the course tools and exercises. */
export const STORAGE_KEY = 'vis-learning-v1';
const emptyState = () => ({ version: 1, completed: [], last: null, bookmarks: [], notes: {}, quiz: {} });
let status = { available: true, reason: '' };
let recoveredInvalid = false;
let memory = emptyState();
const clone = value => JSON.parse(JSON.stringify(value));
const isRecord = value => value && typeof value === 'object' && !Array.isArray(value);
const safeKey = key => typeof key === 'string' && key.length < 250 && !['__proto__', 'constructor', 'prototype'].includes(key);

function cleanState(raw) {
  if (!isRecord(raw) || raw.version !== 1) throw new Error('Invalid learning records');
  const state = emptyState();
  for (const key of ['completed', 'bookmarks']) {
    if (Array.isArray(raw[key])) state[key] = [...new Set(raw[key].filter(safeKey))];
  }
  if (isRecord(raw.last) && typeof raw.last.url === 'string' && typeof raw.last.title === 'string') {
    state.last = { url: raw.last.url.slice(0, 250), title: raw.last.title.slice(0, 250), chapter: Number(raw.last.chapter) || 0,
      section: typeof raw.last.section === 'string' ? raw.last.section.slice(0, 250) : '', at: Number(raw.last.at) || 0 };
  }
  if (isRecord(raw.notes)) {
    Object.keys(raw.notes).filter(safeKey).forEach(key => {
      if (typeof raw.notes[key] === 'string') state.notes[key] = raw.notes[key].slice(0, 20000);
    });
  }
  if (isRecord(raw.quiz)) {
    Object.keys(raw.quiz).filter(key => /^[1-5]$/.test(key)).forEach(chapter => {
      if (!isRecord(raw.quiz[chapter])) return;
      const answers = {};
      Object.keys(raw.quiz[chapter]).filter(safeKey).forEach(id => {
        const entry = raw.quiz[chapter][id];
        if (!isRecord(entry) || !Number.isInteger(entry.answer) || entry.answer < 0 || entry.answer > 20 || typeof entry.correct !== 'boolean') return;
        answers[id] = { answer: entry.answer, correct: entry.correct, at: Number(entry.at) || 0 };
      });
      state.quiz[chapter] = answers;
    });
  }
  return state;
}

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    status = { available: true, reason: recoveredInvalid ? 'invalid' : '' };
    if (!raw) return emptyState();
    try { return cleanState(JSON.parse(raw)); }
    catch { recoveredInvalid = true; status = { available: true, reason: 'invalid' }; return emptyState(); }
  } catch {
    status = { available: false, reason: 'unavailable' };
    return memory;
  }
}
memory = readStored();

export function getState() { return clone(memory); }
export function getStorageStatus() { return { ...status }; }

/** Apply one explicit change; storage failures retain records in this page's memory. */
export function updateState(mutator) {
  const next = clone(memory);
  const returned = mutator(next);
  memory = cleanState(isRecord(returned) ? returned : next);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
    status = { available: true, reason: recoveredInvalid ? 'invalid' : '' };
  } catch { status = { available: false, reason: 'unavailable' }; }
  window.dispatchEvent(new CustomEvent('vis-learning-change', { detail: { state: getState(), storage: getStorageStatus() } }));
  return getState();
}

window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  memory = readStored();
  window.dispatchEvent(new CustomEvent('vis-learning-change', { detail: { state: getState(), storage: getStorageStatus(), external: true } }));
});
