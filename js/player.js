// js/player.js
// Класс игрока: движение, гравитация, прыжки, смена скинов, здоровье, перки

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

    // Загрузка скина (прямая ссылка на бесплатный ассет)
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    this.image.src = 'https://opengameart.org/sites/default/files/styles/medium/public/character.png';  // пример персонажа (замени на свой, если скачаешь)
    this.image.onload = () => console.log('Скин загружен:', this.skin);
  }

  update(keys, dt) {
    // Движение
    let dx = 0;
    if (keys['a'] || keys['arrowleft']) { dx -= this.speed; this.facingRight = false; }
    if (keys['d'] || keys['arrowright']) { dx += this.speed; this.facingRight = true; }

    this.x += dx * dt * 60;

    // Прыжок
    if ((keys[' '] || keys['w'] || keys['arrowup']) && this.onGround) {
      this.velY = this.jumpPower;
      this.onGround = false;
      soundManager.play('jump', 0.7);
    }

    // Гравитация
    this.velY += this.gravity * dt * 60;
    this.y += this.velY * dt * 60;

    // Пол (y = 440)
    if (this.y + this.height >= 440) {
      this.y = 440 - this.height;
      this.velY = 0;
      this.onGround = true;
    }

    // Границы экрана
    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));

    // Неуязвимость (от перка)
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }

    // Обновление активных бонусов
    updateBonuses(this);
  }

  draw(ctx) {
    if (this.image.complete) {
      // Зеркалим, если смотрит влево
      ctx.save();
      if (!this.facingRight) {
        ctx.scale(-1, 1);
        ctx.drawImage(this.image, -this.x - this.width, this.y, this.width, this.height);
      } else {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
      ctx.restore();
    } else {
      // Заглушка — квадрат с лицом
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(this.x + 16, this.y + 16, 12, 12); // левый глаз
      ctx.fillRect(this.x + 36, this.y + 16, 12, 12); // правый глаз
    }

    // Индикатор неуязвимости (мигание)
    if (this.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(this.x - 4, this.y - 4, this.width + 8, this.height + 8);
      ctx.globalAlpha = 1;
    }
  }

  changeSkin(newSkin) {
    this.skin = newSkin;
    // Пример скинов с прямых ссылок (скачай, если хочешь локально)
    const skins = {
      default: 'https://opengameart.org/sites/default/files/styles/medium/public/character.png',
      fire: 'https://opengameart.org/sites/default/files/fire_knight_preview.png',
      ice: 'https://opengameart.org/sites/default/files/ice_mage_preview.png',
      shadow: 'https://opengameart.org/sites/default/files/dark_knight_preview.png'
      // Добавь ещё 10+ (ninja, robot, wizard и т.д.)
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
      score: this.score,
      unlockedSkins: this.unlockedSkins || ['default']
    };
  }
}
