// js/main.js — сердце игры: состояния, цикл, отрисовка, интеграция всего

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.focus();

let state = 'menu';  // menu → register → login → mode_select → game
let username = '';
let password = '';
let message = '';
let activeField = 'username';
let loggedInUser = null;
let playerData = {};
let player = null;
let currentMode = null;
let dt = 0;
let lastTime = performance.now();

// Клавиши
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (state === 'register' || state === 'login') {
    if (e.key === 'Backspace') {
      if (activeField === 'username') username = username.slice(0, -1);
      else password = password.slice(0, -1);
    } else if (e.key === 'Tab') {
      activeField = activeField === 'username' ? 'password' : 'username';
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (state === 'register') {
        const [ok, msg] = register(username, password);
        message = msg;
        if (ok) state = 'menu';
      } else if (state === 'login') {
        const [ok, data] = login(username, password);
        message = ok ? 'Добро пожаловать!' : data;
        if (ok) {
          loggedInUser = username;
          playerData = { ...data, ...loadProgress(username) };
          state = 'mode_select';
          player = new Player(playerData.x || 480, playerData.y || 270, playerData.skin || 'default');
          currentMode = createMode('story');
          soundManager.playMusic(0);
          startAutoSave(loggedInUser, () => player ? player.getSaveData() : null);
        }
      }
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9]/)) {
      if (activeField === 'username') username += e.key;
      else password += e.key;
    }
  }
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function drawText(text, x, y, color = '#ffffff', size = 24, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function gameLoop(time) {
  dt = (time - lastTime) / 1000;
  lastTime = time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state === 'menu') {
    ctx.fillStyle = '#0a0015';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawText('ТВОЯ ЭПИЧНАЯ ИГРА', 480, 150, '#00ffff', 48, 'center');
    drawText('1 — Регистрация     2 — Вход', 480, 250, '#ffffff', 28, 'center');
    if (keys['1']) { state = 'register'; message = ''; }
    if (keys['2']) { state = 'login'; message = ''; }
  } else if (state === 'register' || state === 'login') {
    drawText(state === 'register' ? 'РЕГИСТРАЦИЯ' : 'ВХОД', 480, 100, '#00ffff', 36, 'center');
    drawText('Логин: ' + username + (activeField === 'username' ? '|' : ''), 300, 200, '#ffffff', 24);
    drawText('Пароль: ' + '*'.repeat(password.length) + (activeField === 'password' ? '|' : ''), 300, 250, '#ffffff', 24);
    drawText(message, 480, 350, message.includes('ошиб') || message.includes('неверн') ? '#ff4444' : '#44ff44', 20, 'center');
  } else if (state === 'mode_select') {
    drawText('ВЫБЕРИ РЕЖИМ', 480, 150, '#00ffff', 36, 'center');
    drawText('1 — Сюжетный     2 — Выживание     3 — Аркада', 480, 250, '#ffffff', 24, 'center');
    if (keys['1']) { currentMode = createMode('story'); state = 'game'; }
    if (keys['2']) { currentMode = createMode('survival'); state = 'game'; }
    if (keys['3']) { currentMode = createMode('arcade'); state = 'game'; }
  } else if (state === 'game') {
    // Обновления систем
    player.update(keys, dt);
    echoSystem.record(player);
    gravityMorph.update(dt, player);
    quantumSys.update(player);
    emotionBoost.update(dt, player);
    particleSystem.update(dt);
    enemyManager.update(player, dt);
    currentMode.update(player, dt, keys, playerData);

    // Звук шагов
    if (keys['a'] || keys['d'] || keys['arrowleft'] || keys['arrowright']) {
      soundManager.playRandomStep();
    }

    // Рисование
    ctx.fillStyle = '#1a0f00';
    ctx.fillRect(0, 440, canvas.width, 100);  // пол

    player.draw(ctx);
    echoSystem.drawEcho(ctx, player.image);
    particleSystem.draw(ctx);
    enemyManager.draw(ctx);

    currentMode.drawUI(ctx);
    emotionBoost.drawBar(ctx);
    gravityMorph.drawIndicator(ctx);

    drawText(`${loggedInUser} | Жизни: ${player.lives}/${player.maxLives} | Очки: ${player.score} | Перки: ${getPerksList(player).slice(0,4).join(', ')}...`, 20, 40, '#ffffff', 18);

    if (keys['r']) {
      saveProgress(loggedInUser, player.getSaveData());
      state = 'menu';
      soundManager.stopMusic();
      enemyManager.clear();
    }
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
