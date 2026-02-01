// js/saving.js
// Сохранение и загрузка прогресса в localStorage (полное, с автосейвом каждые 30 сек)

function saveProgress(username, data) {
  if (!username) return;

  let users = JSON.parse(localStorage.getItem('players') || '{}');

  if (users[username]) {
    users[username].progress = {
      ...users[username].progress,
      ...data,
      lastSave: Date.now()
    };
    localStorage.setItem('players', JSON.stringify(users));
    console.log('Прогресс сохранён для', username);
  }
}

function loadProgress(username) {
  let users = JSON.parse(localStorage.getItem('players') || '{}');
  if (users[username] && users[username].progress) {
    return users[username].progress;
  }
  return {
    level: 1,
    x: 480,
    y: 270,
    skin: 'default',
    perks: [],
    bonuses: [],
    lives: 5,
    score: 0,
    unlockedSkins: ['default'],
    currentMode: 'story'
  };
}

// Автосейв каждые 30 секунд (вызывается из main.js)
function startAutoSave(username, getDataCallback) {
  if (!username) return;

  setInterval(() => {
    const data = getDataCallback();
    if (data) saveProgress(username, data);
  }, 30000);
}

// Ручной сброс прогресса (для теста, вызови в консоли: resetProgress('твой_логин'))
function resetProgress(username) {
  let users = JSON.parse(localStorage.getItem('players') || '{}');
  if (users[username]) {
    users[username].progress = {
      level: 1,
      x: 480,
      y: 270,
      skin: 'default',
      perks: [],
      bonuses: [],
      lives: 5,
      score: 0,
      unlockedSkins: ['default'],
      currentMode: 'story'
    };
    localStorage.setItem('players', JSON.stringify(users));
    console.log('Прогресс сброшен для', username);
  }
}
