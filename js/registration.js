// js/registration.js
// Регистрация, логин, хранение в localStorage (безопасно хэшируем пароль base64 + соль)

const SALT = 'tima_game_salt_2026';  // для простоты, в реале используй crypto

function hashPassword(pass) {
  return btoa(pass + SALT);  // base64 + соль (для демонстрации, не крипто-безопасно, но ок для игры)
}

function register(username, password) {
  if (!username || !password || username.length < 3 || password.length < 4) {
    return [false, 'Логин ≥3 символа, пароль ≥4 символа'];
  }
  if (username.includes(' ') || password.includes(' ')) {
    return [false, 'Без пробелов в логине/пароле'];
  }

  let users = JSON.parse(localStorage.getItem('players') || '{}');

  if (users[username]) {
    return [false, 'Имя уже занято'];
  }

  users[username] = {
    password: hashPassword(password),
    progress: {
      level: 1,
      x: 480,
      y: 270,
      skin: 'default',
      perks: [],
      bonuses: [],
      lives: 5,
      score: 0
    }
  };

  localStorage.setItem('players', JSON.stringify(users));
  return [true, 'Регистрация успешна! Теперь войди.'];
}

function login(username, password) {
  let users = JSON.parse(localStorage.getItem('players') || '{}');

  if (!users[username]) {
    return [false, 'Пользователь не найден'];
  }

  if (users[username].password !== hashPassword(password)) {
    return [false, 'Неверный пароль'];
  }

  return [true, users[username].progress];
}

// Функция очистки прогресса (для теста, вызови в консоли если нужно)
function resetUser(username) {
  let users = JSON.parse(localStorage.getItem('players') || '{}');
  if (users[username]) {
    delete users[username];
    localStorage.setItem('players', JSON.stringify(users));
    console.log('Пользователь сброшен');
  }
}
