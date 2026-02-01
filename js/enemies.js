// js/enemies.js
// Враги — много типов, поведение, урон игроку, смерть, дропы

class Enemy {
  constructor(x, y, type = 'basic') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 50;
    this.height = 50;
    this.speed = 3 + Math.random() * 2;
    this.health = 3;
    this.damage = 1;
    this.color = '#ff4444';
    this.velX = 0;
    this.velY = 0;
    this.active = true;

    // Типы врагов (много вариантов)
    switch (type) {
      case 'fast':
        this.speed = 6;
        this.health = 2;
        this.color = '#ff8800';
        break;
      case 'tank':
        this.speed = 2;
        this.health = 8;
        this.damage = 2;
        this.color = '#880000';
        break;
      case 'flying':
        this.speed = 4;
        this.health = 4;
        this.damage = 1;
        this.color = '#aa00ff';
        this.y = Math.random() * 200 + 50; // летает выше
        break;
      case 'ghost':
        this.speed = 3.5;
        this.health = 3;
        this.damage = 1;
        this.color = 'rgba(255,255,255,0.6)';
        this.alpha = 0.6;
        break;
      default:
        // basic — красный квадрат
        break;
    }
  }

  update(player, dt) {
    if (!this.active) return;

    // Преследование игрока
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0) {
      this.velX = (dx / dist) * this.speed;
      this.velY = (dy / dist) * this.speed;
    }

    this.x += this.velX * dt * 60;
    this.y += this.velY * dt * 60;

    // Не уходить за экран (кроме flying)
    if (this.type !== 'flying') {
      this.y = Math.max(0, Math.min(440 - this.height, this.y));
    }
    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));

    // Урон игроку при касании
    if (this.checkCollision(player)) {
      if (!player.invincible) {
        player.lives -= this.damage;
        player.invincible = true;
        player.invincibleTimer = 1.5;
        soundManager.play('hurt', 0.9);
        particleSystem.addExplosion(player.x + 32, player.y + 32, 30, '#ff0000');
        if (player.lives <= 0) {
          soundManager.play('death', 1.0);
        }
      }
      // Враг исчезает после атаки (или ослабляется)
      this.health -= 1;
      if (this.health <= 0) this.die();
    }
  }

  checkCollision(player) {
    return (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    );
  }

  die() {
    this.active = false;
    particleSystem.addExplosion(this.x + this.width/2, this.y + this.height/2, 50, '#ff6600');
    soundManager.play('explosion', 0.8);
    // Дроп перка или бонуса с шансом
    if (Math.random() < 0.3) {
      activateRandomBonus(player);
    } else if (Math.random() < 0.2) {
      unlockRandomPerk(player);
    }
    player.score += 50;
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.globalAlpha = this.type === 'ghost' ? 0.6 : 1;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Индикатор здоровья
    const healthW = (this.health / (this.type === 'tank' ? 8 : 3)) * this.width;
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(this.x, this.y - 10, healthW, 5);
    ctx.globalAlpha = 1;
  }
}

class EnemyManager {
  constructor() {
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = 5.0;
    this.maxEnemies = 10;
  }

  update(player, dt) {
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
      this.spawnTimer = 0;
      const types = ['basic', 'fast', 'tank', 'flying', 'ghost'];
      const type = types[Math.floor(Math.random() * types.length)];
      const side = Math.random() > 0.5 ? -50 : canvas.width + 50;
      this.enemies.push(new Enemy(side, Math.random() * 300 + 100, type));
      this.spawnInterval = Math.max(2.0, this.spawnInterval - 0.15);
      soundManager.play('enemy_spawn', 0.5);
    }

    this.enemies = this.enemies.filter(e => {
      e.update(player, dt);
      return e.active;
    });
  }

  draw(ctx) {
    this.enemies.forEach(e => e.draw(ctx));
  }

  clear() {
    this.enemies = [];
  }
}

const enemyManager = new EnemyManager();
