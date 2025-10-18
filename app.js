// Habit Tracker with localStorage persistence
const form = document.getElementById('habit-form');
const input = document.getElementById('habit-input');
const list = document.getElementById('habit-list');
const template = document.getElementById('habit-template');
const exportBtn = document.getElementById('export-btn');
const clearBtn = document.getElementById('clear-btn');

const STORAGE_KEY = 'habit-tracker:v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function weekDays() {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();
  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    result.push({ label: days[d.getDay()], date: d.toISOString().slice(0,10) });
  }
  return result;
}

function render() {
  const data = load();
  list.innerHTML = '';
  const days = weekDays();
  data.forEach((habit, idx) => {
    const node = template.content.cloneNode(true);
    node.querySelector('.habit-title').textContent = habit.title;
    const daysWrap = node.querySelector('.days');
    days.forEach(({label, date}, dayIndex) => {
      const cell = document.createElement('div');
      cell.className = 'day';
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.className = 'checkbox';
      chk.checked = !!(habit.completed && habit.completed[date]);
      chk.addEventListener('change', () => {
        const state = load();
        state[idx].completed = state[idx].completed || {};
        state[idx].completed[date] = chk.checked;
        save(state);
      });
      const lab = document.createElement('span');
      lab.textContent = label;
      cell.appendChild(lab);
      cell.appendChild(chk);
      daysWrap.appendChild(cell);
    });
    node.querySelector('.delete-btn').addEventListener('click', () => {
      const state = load();
      state.splice(idx,1);
      save(state);
      render();
    });
    list.appendChild(node);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  const data = load();
  data.push({ title, createdAt: Date.now(), completed: {} });
  save(data);
  input.value='';
  render();
});

exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(load(), null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'habit-tracker-data.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

clearBtn.addEventListener('click', () => {
  if (confirm('Clear all habits and progress?')){
    save([]);
    render();
  }
});

render();
