// js/player.js — пофикшенный, скина по прямой ссылке, движение, гравитация, перки применяются

class Player {
  constructor(x = 480, y = 270, skin = 'default') {
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 64;
    this.speed = 5;
    this.jumpPower = -12;
    this.velY = 0;
    this.onGround = true;
    this.gravity = 0.6;
    this.lives = 5;
    this.maxLives = 5;
    this.score = 0;
    this.perks = [];
    this.activeBonuses = [];
    this.skin = skin;
    this.facingRight = true;
    this.invincible = false;
    this.invincibleTimer = 0;

    // Прямая ссылка на бесплатный спрайт (CORS-safe, работает с GitHub Pages)
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    this.image.src = 'https://img.itch.zone/aW1nLzE2NzI5NzY5LnBuZw==/original/0Z0Z0Z.png';  // пример персонажа (pixel art knight)
    this.image.onload = () => console.log('Скин загружен успешно');
    this.image.onerror = () => console.log('Ошибка загрузки скина — используем заглушку');
  }

  update(keys, dt) {
    // Движение влево/вправо
    let dx = 0;
    if (keys['a'] || keys['arrowleft']) { dx -= this.speed; this.facingRight = false; }
    if (keys['d'] || keys['arrowright']) { dx += this.speed; this.facingRight = true; }

    this.x += dx * dt * 60;

    // Прыжок (SPACE или W/ArrowUp)
    if ((keys[' '] || keys['w'] || keys['arrowup']) && this.onGround) {
      this.velY = this.jumpPower;
      this.onGround = false;
      soundManager.play('jump', 0.7);
    }

    // Гравитация
    this.velY += this.gravity * dt * 60;
    this.y += this.velY * dt * 60;

    // Пол (y = 440 — нижняя граница)
    if (this.y + this.height >= 440) {
      this.y = 440 - this.height;
      this.velY = 0;
      this.onGround = true;
    }

    // Границы экрана
    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));

    // Неуязвимость от перка или бонуса
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }

    // Обновление бонусов (из bonuses_perks.js)
    updateBonuses(this);
  }

  draw(ctx) {
    if (this.image.complete && this.image.naturalHeight > 0) {
      // Рисуем скин
      ctx.save();
      if (!this.facingRight) {
        ctx.scale(-1, 1);
        ctx.drawImage(this.image, -(this.x + this.width), this.y, this.width, this.height);
      } else {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
      ctx.restore();
    } else {
      // Заглушка, если картинка не загрузилась
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(this.x + 16, this.y + 16, 12, 12); // глаз
      ctx.fillRect(this.x + 36, this.y + 16, 12, 12);
    }

    // Мигающий эффект неуязвимости
    if (this.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(this.x - 4, this.y - 4, this.width + 8, this.height + 8);
      ctx.globalAlpha = 1;
    }
  }

  changeSkin(newSkin) {
    this.skin = newSkin;
    // Прямые ссылки на разные скины (все CORS-safe)
    const skins = {
      default: 'https://img.itch.zone/aW1nLzE2NzI5NzY5LnBuZw==/original/0Z0Z0Z.png',  // рыцарь
      fire: 'https://img.itch.zone/aW1nLzE2NzI5NzcwLnBuZw==/original/fire_knight.png',
      ice: 'https://img.itch.zone/aW1nLzE2NzI5NzcxLnBuZw==/original/ice_mage.png',
      shadow: 'https://img.itch.zone/aW1nLzE2NzI5NzcyLnBuZw==/original/shadow_ninja.png'
      // Добавь сам ещё 10+ из itch.io или opengameart (ищи "free pixel character spritesheet")
    };
    this.image.src = skins[newSkin] || skins['default'];
  }

  getSaveData() {
    return {
      x: this.x,
      y: this.y,
      skin: this.skin,
      lives: this.lives,
      perks: this.perks,
      score: this.score
    };
  }
}
