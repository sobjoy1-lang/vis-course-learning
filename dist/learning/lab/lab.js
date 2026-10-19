// Daily keys deliberately stay ISO strings. d3.autoType would turn dates into
// Date objects and break lookups against YYYY-MM-DD keys.
const YEAR = 2024;
const DAY_MS = 86400000;
const YEAR_START = `${YEAR}-01-01`;
const YEAR_END = `${YEAR}-12-31`;
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const el = id => document.getElementById(id);
let d3;
let days = [];
let byKey = new Map();
let rangeStart = YEAR_START;
let rangeEnd = YEAR_END;
let activeKey = null;
let lineSvg, calendarMarks, spiralMarks, lineMarks, brush, brushLayer, xScale, yScale;

function parseDate(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().slice(0, 10) === key ? date : null;
}

function parseNumber(value) {
  if (value == null || String(value).trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function displayTemp(value) {
  return value == null ? '缺失' : `${value.toFixed(1)} ℃`;
}

function selectedDays() {
  return days.filter(day => day.key >= rangeStart && day.key <= rangeEnd);
}

function dateDescription(day) {
  return `${day.key} ${weekdays[day.date.getUTCDay()]}，每日最高温${displayTemp(day.value)}`;
}

function selectDate(key) {
  if (!byKey.has(key)) return;
  activeKey = key;
  refresh(false);
  // Keep the synchronized date visible inside horizontally scrollable charts,
  // without moving the reader up or down the page.
  for (const chartId of ['line-chart', 'calendar-chart']) {
    const chart = el(chartId);
    const mark = chart.querySelector(`[data-date="${key}"]`);
    const scroller = chart.closest('.chart-scroll');
    if (!mark || !scroller || scroller.scrollWidth <= scroller.clientWidth) continue;
    const markBox = mark.getBoundingClientRect();
    const box = scroller.getBoundingClientRect();
    if (markBox.left < box.left || markBox.right > box.right) {
      scroller.scrollLeft += (markBox.left + markBox.width / 2) - (box.left + box.width / 2);
    }
  }
}

function moveDate(event, currentKey, marks) {
  const jumps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
  let index = Math.max(0, days.findIndex(day => day.key === (currentKey || activeKey)));
  if (event.key === 'Home') index = 0;
  else if (event.key === 'End') index = days.length - 1;
  else if (Object.hasOwn(jumps, event.key)) index = Math.max(0, Math.min(days.length - 1, index + jumps[event.key]));
  else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    selectDate(currentKey || days[index].key);
    return;
  } else return;
  event.preventDefault();
  selectDate(days[index].key);
  if (marks) marks.filter(day => day.key === activeKey).node()?.focus();
}

function bindDateMarks(marks) {
  marks.attr('role', 'button')
    .attr('tabindex', (_, index) => index === 0 ? 0 : -1)
    .attr('aria-label', dateDescription)
    .on('click', (_, day) => selectDate(day.key))
    .on('keydown', (event, day) => moveDate(event, day.key, marks));
  marks.append('title').text(dateDescription);
}

function addMissingPattern(svg, id) {
  const pattern = svg.append('defs').append('pattern')
    .attr('id', id).attr('width', 5).attr('height', 5).attr('patternUnits', 'userSpaceOnUse');
  pattern.append('rect').attr('width', 5).attr('height', 5).attr('fill', '#f1f5f9');
  pattern.append('path').attr('d', 'M-1,1L1,-1M0,5L5,0M4,6L6,4').attr('stroke', '#cbd5e1').attr('stroke-width', 1);
}

function drawLine(color) {
  lineSvg = d3.select(el('line-chart'));
  const margin = { top: 20, right: 24, bottom: 35, left: 52 };
  const width = 1120, height = 285;
  xScale = d3.scaleUtc().domain([days[0].date, days.at(-1).date]).range([margin.left, width - margin.right]);
  const extent = d3.extent(days.filter(day => day.value != null), day => day.value);
  yScale = d3.scaleLinear().domain([extent[0] - 2, extent[1] + 2]).nice().range([height - margin.bottom, margin.top]);
  lineSvg.append('g').attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(5).tickSize(-(width - margin.left - margin.right)))
    .call(group => group.select('.domain').remove());
  lineSvg.append('g').attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(d3.utcMonth.every(1)).tickFormat(d3.utcFormat('%-m月')).tickSizeOuter(0));
  lineSvg.append('text').attr('x', 13).attr('y', 15).attr('fill', '#64748b').attr('font-size', 11).text('℃');
  const line = d3.line().defined(day => day.value != null)
    .x(day => xScale(day.date)).y(day => yScale(day.value));
  lineSvg.append('path').datum(days).attr('d', line).attr('fill', 'none').attr('stroke', '#94a3b8').attr('stroke-width', 1.8);
  lineMarks = lineSvg.append('g').selectAll('circle').data(days.filter(day => day.value != null)).join('circle')
    .attr('class', 'data-mark').attr('data-date', day => day.key)
    .attr('cx', day => xScale(day.date)).attr('cy', day => yScale(day.value)).attr('r', 2.6)
    .attr('fill', day => color(day.value));
  lineSvg.append('line').attr('class', 'focus-rule').attr('y1', margin.top).attr('y2', height - margin.bottom)
    .attr('stroke', '#2563eb').attr('stroke-width', 1.3).attr('stroke-dasharray', '3 3').attr('pointer-events', 'none').attr('visibility', 'hidden');
  let pointerStartX = null;
  const pointerX = event => d3.pointer(event.changedTouches?.[0] || event.touches?.[0] || event, lineSvg.node())[0];
  brush = d3.brushX().extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on('start', event => {
      if (event.sourceEvent) pointerStartX = pointerX(event.sourceEvent);
    })
    .on('end', event => {
      if (!event.sourceEvent) return;
      const endX = pointerX(event.sourceEvent);
      if (pointerStartX != null && Math.abs(endX - pointerStartX) <= 3) {
        const index = Math.round((+xScale.invert(endX) - +days[0].date) / DAY_MS);
        selectDate(days[Math.max(0, Math.min(days.length - 1, index))].key);
        syncBrush();
      } else if (event.selection) {
        const [left, right] = event.selection;
        // Pick inclusive nearest daily observations rather than mixing local and UTC dates.
        const first = Math.round((+xScale.invert(left) - +days[0].date) / DAY_MS);
        const last = Math.round((+xScale.invert(right) - +days[0].date) / DAY_MS);
        setRange(days[Math.max(0, Math.min(days.length - 1, first))].key, days[Math.max(0, Math.min(days.length - 1, last))].key);
      } else {
        const index = Math.round((+xScale.invert(endX) - +days[0].date) / DAY_MS);
        selectDate(days[Math.max(0, Math.min(days.length - 1, index))].key);
        syncBrush();
      }
    });
  brushLayer = lineSvg.append('g').attr('class', 'brush').call(brush);
  lineSvg.on('keydown', event => moveDate(event, activeKey));
}

function drawCalendar(color) {
  const svg = d3.select(el('calendar-chart'));
  addMissingPattern(svg, 'calendar-missing');
  const cell = 16, gap = 2, left = 36, top = 34;
  const monday = d3.utcMonday.floor(days[0].date);
  const weekIndex = date => d3.utcMonday.count(monday, date);
  ['一', '二', '三', '四', '五', '六', '日'].forEach((label, index) => {
    svg.append('text').attr('x', 17).attr('y', top + index * (cell + gap) + 12)
      .attr('font-size', 11).attr('fill', '#64748b').text(label);
  });
  d3.utcMonths(new Date(Date.UTC(YEAR, 0, 1)), new Date(Date.UTC(YEAR + 1, 0, 1))).forEach(date => {
    svg.append('text').attr('x', left + weekIndex(date) * (cell + gap)).attr('y', 18)
      .attr('font-size', 12).attr('fill', '#475569').text(`${date.getUTCMonth() + 1}月`);
  });
  calendarMarks = svg.append('g').selectAll('rect').data(days).join('rect')
    .attr('class', 'data-mark').attr('data-date', day => day.key)
    .attr('x', day => left + weekIndex(day.date) * (cell + gap))
    .attr('y', day => top + ((day.date.getUTCDay() + 6) % 7) * (cell + gap))
    .attr('width', cell).attr('height', cell).attr('rx', 2)
    .attr('fill', day => day.value == null ? 'url(#calendar-missing)' : color(day.value));
  bindDateMarks(calendarMarks);
}

function drawSpiral(color) {
  const svg = d3.select(el('spiral-chart'));
  addMissingPattern(svg, 'spiral-missing');
  const center = { x: 220, y: 211 };
  function position(day) {
    const month = day.date.getUTCMonth();
    const count = new Date(Date.UTC(YEAR, month + 1, 0)).getUTCDate();
    const u = month + (day.date.getUTCDate() - 1) / count;
    const angle = 2 * Math.PI * u - Math.PI / 2;
    const radius = 24 + 13 * u;
    return [center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle)];
  }
  const spiral = d3.line().x(day => position(day)[0]).y(day => position(day)[1]);
  svg.append('path').datum(days).attr('d', spiral).attr('fill', 'none').attr('stroke', '#e2e8f0').attr('stroke-width', 1.5);
  svg.append('text').attr('x', center.x).attr('y', center.y + 4).attr('text-anchor', 'middle')
    .attr('font-size', 10).attr('fill', '#64748b').text('年初');
  [0, 3, 6, 9, 11].forEach(month => {
    const radius = 24 + 13 * month;
    svg.append('text').attr('x', center.x + 7).attr('y', center.y - radius + 2)
      .attr('font-size', 9).attr('fill', '#64748b').attr('pointer-events', 'none').text(`${month + 1}月`);
  });
  svg.append('text').attr('x', 220).attr('y', 412).attr('text-anchor', 'middle')
    .attr('font-size', 11).attr('fill', '#64748b').text('每圈一个自然月 · 由内向外 1 → 12 月');
  spiralMarks = svg.append('g').selectAll('circle').data(days).join('circle')
    .attr('class', 'data-mark').attr('data-date', day => day.key)
    .attr('cx', day => position(day)[0]).attr('cy', day => position(day)[1]).attr('r', 3.1)
    .attr('fill', day => day.value == null ? 'url(#spiral-missing)' : color(day.value));
  bindDateMarks(spiralMarks);
}

function drawLegend(color, extent) {
  const legend = el('color-legend');
  const label = document.createElement('span');
  label.textContent = '每日最高温';
  const minimum = document.createElement('span');
  minimum.textContent = displayTemp(extent[0]);
  const strip = document.createElement('span');
  strip.className = 'legend-strip';
  strip.setAttribute('aria-hidden', 'true');
  for (let index = 0; index < 40; index++) {
    const item = document.createElement('span');
    item.style.backgroundColor = color(extent[0] + (extent[1] - extent[0]) * index / 39);
    strip.append(item);
  }
  const maximum = document.createElement('span');
  maximum.textContent = displayTemp(extent[1]);
  const missing = document.createElement('span');
  missing.className = 'legend-missing';
  missing.setAttribute('aria-hidden', 'true');
  const missingLabel = document.createElement('span');
  missingLabel.textContent = '缺失';
  legend.replaceChildren(label, minimum, strip, maximum, missing, missingLabel);
}

function syncBrush() {
  const fullYear = rangeStart === YEAR_START && rangeEnd === YEAR_END;
  const left = xScale(byKey.get(rangeStart).date);
  const right = xScale(byKey.get(rangeEnd).date);
  // Give a one-day range a visible brush without including another day's record.
  brushLayer.call(brush.move, fullYear ? null : [Math.max(52, left - 1), Math.min(1096, right + 1)]);
}

function refresh(rebuildTable = true) {
  const selected = selectedDays();
  const numeric = selected.filter(day => day.value != null);
  el('start-date').value = rangeStart;
  el('end-date').value = rangeEnd;
  el('range-summary').textContent = `${rangeStart} 至 ${rangeEnd} · ${selected.length} 天，${numeric.length} 条有效温度记录${numeric.length !== selected.length ? `，缺失 ${selected.length - numeric.length} 天` : ''}`;
  el('stat-count').textContent = `${selected.length} / ${numeric.length}`;
  el('stat-mean').textContent = numeric.length ? displayTemp(d3.mean(numeric, day => day.value)) : '无有效记录';
  el('stat-min').textContent = numeric.length ? displayTemp(d3.min(numeric, day => day.value)) : '无有效记录';
  el('stat-max').textContent = numeric.length ? displayTemp(d3.max(numeric, day => day.value)) : '无有效记录';
  [calendarMarks, spiralMarks, lineMarks].forEach(marks => {
    marks.classed('is-outside', day => day.key < rangeStart || day.key > rangeEnd)
      .classed('is-selected', day => day.key === activeKey);
  });
  [calendarMarks, spiralMarks].forEach(marks => marks
    .attr('aria-pressed', day => String(day.key === activeKey))
    .attr('tabindex', (day, index) => activeKey ? (day.key === activeKey ? 0 : -1) : (index === 0 ? 0 : -1)));
  const focused = byKey.get(activeKey);
  if (focused) {
    el('focus-date').textContent = `${focused.key} · ${weekdays[focused.date.getUTCDay()]}`;
    el('focus-value').textContent = `每日最高温 ${displayTemp(focused.value)}；降水量 ${focused.rain == null ? '缺失' : `${focused.rain.toFixed(1)} mm`}${focused.key < rangeStart || focused.key > rangeEnd ? '（定位日期在当前统计区间之外）' : ''}`;
    const x = xScale(focused.date);
    lineSvg.select('.focus-rule').attr('x1', x).attr('x2', x).attr('visibility', 'visible');
  } else {
    el('focus-date').textContent = '点选图中的一天，开始对照';
    el('focus-value').textContent = '图中的蓝色轮廓表示当前定位日期。';
    lineSvg.select('.focus-rule').attr('visibility', 'hidden');
  }
  if (rebuildTable) rebuildDataTable(selected);
  else el('data-rows').querySelectorAll('tr').forEach(row => row.classList.toggle('is-selected', row.dataset.date === activeKey));
}

function rebuildDataTable(selected) {
  el('table-count').textContent = `${selected.length} 行`;
  const fragment = document.createDocumentFragment();
  selected.forEach(day => {
    const row = document.createElement('tr');
    row.dataset.date = day.key;
    row.classList.toggle('is-selected', day.key === activeKey);
    const dateCell = document.createElement('td');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'table-date';
    button.textContent = day.key;
    button.setAttribute('aria-label', `在三图中定位 ${dateDescription(day)}`);
    button.addEventListener('click', () => selectDate(day.key));
    dateCell.append(button);
    row.append(dateCell);
    [weekdays[day.date.getUTCDay()], day.value == null ? '缺失' : day.value.toFixed(1), day.rain == null ? '缺失' : day.rain.toFixed(1)].forEach(text => {
      const cell = document.createElement('td');
      cell.textContent = text;
      row.append(cell);
    });
    fragment.append(row);
  });
  el('data-rows').replaceChildren(fragment);
  el('data-rows').closest('.data-table-scroll').scrollTop = 0;
}

function setRange(start, end) {
  const error = el('range-error');
  if (!byKey.has(start) || !byKey.has(end) || start > end) {
    error.textContent = '请选择 2024 年内的有效日期，且开始日期不能晚于结束日期。';
    error.hidden = false;
    return false;
  }
  error.hidden = true;
  rangeStart = start;
  rangeEnd = end;
  if (activeKey && (activeKey < start || activeKey > end)) activeKey = null;
  refresh();
  syncBrush();
  return true;
}

function downloadSelection() {
  const rows = selectedDays().map(day => [day.key, day.value ?? '', day.rain ?? ''].join(','));
  const blob = new Blob(['\uFEFFdate,temp_max,rain_mm\r\n', rows.join('\r\n'), '\r\n'], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `weather_${rangeStart}_${rangeEnd}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function init() {
  const status = el('lab-status');
  try {
    d3 = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
    const response = await fetch(new URL('../../lesson-05/data/weather_2024.csv', import.meta.url));
    if (!response.ok) throw new Error(`CSV 加载失败（HTTP ${response.status}）`);
    const csvRows = d3.csvParse(await response.text());
    if (!csvRows.columns.includes('date') || !csvRows.columns.includes('temp_max')) throw new Error('课程数据缺少 date 或 temp_max 列');
    const raw = new Map();
    let ignored = 0;
    csvRows.forEach(row => {
      const key = String(row.date ?? '').trim();
      const date = parseDate(key);
      if (!date || date.getUTCFullYear() !== YEAR) { ignored++; return; }
      if (raw.has(key)) throw new Error(`课程数据中日期 ${key} 重复，请检查 CSV`);
      raw.set(key, { value: parseNumber(row.temp_max), rain: parseNumber(row.rain_mm) });
    });
    days = d3.utcDays(new Date(Date.UTC(YEAR, 0, 1)), new Date(Date.UTC(YEAR + 1, 0, 1))).map(date => {
      const key = date.toISOString().slice(0, 10);
      const record = raw.get(key);
      return { key, date, value: record?.value ?? null, rain: record?.rain ?? null };
    });
    byKey = new Map(days.map(day => [day.key, day]));
    const numeric = days.filter(day => day.value != null);
    if (!numeric.length) throw new Error('课程数据中没有可绘制的有效温度记录');
    let extent = d3.extent(numeric, day => day.value);
    if (extent[0] === extent[1]) extent = [extent[0] - 1, extent[1] + 1];
    const color = d3.scaleSequential(d3.interpolateYlOrRd).domain(extent);
    drawLine(color);
    drawCalendar(color);
    drawSpiral(color);
    drawLegend(color, extent);
    el('data-count').textContent = `${days.length} 天 · ${raw.size} 条原始记录`;
    ['start-date', 'end-date'].forEach(id => { el(id).min = YEAR_START; el(id).max = YEAR_END; });
    el('range-form').addEventListener('submit', event => {
      event.preventDefault();
      setRange(el('start-date').value, el('end-date').value);
    });
    el('reset-range').addEventListener('click', () => { activeKey = null; setRange(YEAR_START, YEAR_END); });
    el('download-csv').addEventListener('click', downloadSelection);
    refresh();
    status.hidden = ignored === 0;
    if (ignored) status.textContent = `已忽略 ${ignored} 条日期无效或不属于 2024 年的记录。缺失日期保留为缺失值。`;
    el('lab-workspace').hidden = false;
  } catch (error) {
    status.hidden = false;
    status.classList.add('is-error');
    status.textContent = `实验暂时未能加载：${error.message}。请检查网络连接后重试。`;
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'lab-button';
    retry.textContent = '重新加载';
    retry.addEventListener('click', () => location.reload());
    status.append(retry);
  }
}

init();
