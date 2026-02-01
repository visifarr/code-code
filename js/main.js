// js/main.js — ПОФИКСЕННАЯ версия с кнопками в меню и запуском музыки после клика

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.focus();

let state = 'menu';
let username = '';
let password = '';
let message = '';
let loggedInUser = null;
let playerData = {};
let player = null;
let currentMode = null;
let dt = 0;
let lastTime = performance.now();

// Клавиши + кнопки
const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Создаём 2 кнопки в DOM (над canvas)
const ui = document.getElementById('ui');
ui.innerHTML = `
  <button id="btnRegister" style="position:absolute; top:200px; left:50%; transform:translateX(-50%); padding:15px 30px; font-size:24px; background:#444; color:#0ff; border:2px solid #0ff; cursor:pointer;">Регистрация</button>
  <button id="btnLogin" style="position:absolute; top:280px; left:50%; transform:translateX(-50%); padding:15px 30px; font-size:24px; background:#444; color:#0ff; border:2px solid #0ff; cursor:pointer;">Вход</button>
`;

const btnRegister = document.getElementById('btnRegister');
const btnLogin = document.getElementById('btnLogin');

// Клик по кнопкам — переход в состояния
btnRegister.addEventListener('click', () => {
  state = 'register';
  message = '';
  soundManager.userInteracted = true;
  soundManager.playMusic();
});

btnLogin.addEventListener('click', () => {
  state = 'login';
  message = '';
  soundManager.userInteracted = true;
  soundManager.playMusic();
});

// Ввод в состояниях register/login (клавиатура)
window.addEventListener('keydown', e => {
  if (state === 'register' || state === 'login') {
    if (e.key === 'Backspace') {
      if (activeField === 'username') username = username.slice(0, -1);
      else password = password.slice(0, -1);
    } else if (e.key === 'Tab') {
      activeField = activeField === 'username' ? 'password' : 'username';
      e.preventDefault();
    } else if (e.key === 'Enter') {
      handleEnter();
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9]/)) {
      if (activeField === 'username') username += e.key;
      else password += e.key;
    }
  }
});

function handleEnter() {
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
      soundManager.playMusic();
    }
  }
}

function gameLoop(time) {
  dt = (time - lastTime) / 1000;
  lastTime = time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Показываем кнопки только в меню
  btnRegister.style.display = state === 'menu' ? 'block' : 'none';
  btnLogin.style.display = state === 'menu' ? 'block' : 'none';

  if (state === 'menu') {
    ctx.fillStyle = '#0a0015';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawText('ТВОЯ ИГРА', 480, 120, '#00ffff', 60, 'center');
    drawText('Кликни на кнопку ниже', 480, 180, '#aaaaaa', 24, 'center');
  } else if (state === 'register' || state === 'login') {
    drawText(state === 'register' ? 'РЕГИСТРАЦИЯ' : 'ВХОД', 480, 100, '#00ffff', 40, 'center');
    drawText('Логин: ' + username + (activeField === 'username' ? '|' : ''), 300, 200, '#ffffff', 28);
    drawText('Пароль: ' + '*'.repeat(password.length) + (activeField === 'password' ? '|' : ''), 300, 260, '#ffffff', 28);
    drawText(message, 480, 350, message.includes('ошиб') ? '#ff4444' : '#44ff44', 22, 'center');
    drawText('Нажми ENTER для подтверждения', 480, 400, '#aaaaaa', 18, 'center');
  } else if (state === 'mode_select') {
    drawText('ВЫБЕРИ РЕЖИМ', 480, 150, '#00ffff', 40, 'center');
    drawText('1 — Сюжет     2 — Выживание     3 — Аркада', 480, 250, '#ffffff', 28, 'center');
    if (keys['1']) { currentMode = createMode('story'); state = 'game'; }
    if (keys['2']) { currentMode = createMode('survival'); state = 'game'; }
    if (keys['3']) { currentMode = createMode('arcade'); state = 'game'; }
  } else if (state === 'game') {
    player.update(keys, dt);
    echoSystem.record(player);
    gravityMorph.update(dt, player);
    quantumSys.update(player);
    emotionBoost.update(dt, player);
    particleSystem.update(dt);
    enemyManager.update(player, dt);
    currentMode.update(player, dt, keys, playerData);

    if (keys['a'] || keys['d']) soundManager.playRandomStep();

    ctx.fillStyle = '#1a0f00';
    ctx.fillRect(0, 440, canvas.width, 100);

    player.draw(ctx);
    echoSystem.drawEcho(ctx, player.image);
    particleSystem.draw(ctx);
    enemyManager.draw(ctx);

    currentMode.drawUI(ctx);
    emotionBoost.drawBar(ctx);
    gravityMorph.drawIndicator(ctx);

    drawText(`${loggedInUser} | Жизни: ${player.lives} | Очки: ${player.score}`, 20, 40, '#ffffff', 20);
    drawText('R — в меню', 20, 510, '#aaaaaa', 16);

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
