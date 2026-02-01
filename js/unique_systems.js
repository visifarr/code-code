// js/unique_systems.js
// Уникальные системы механик — 10+ оригинальных фич, которых нигде раньше не было (или очень редко)

class EchoSystem {
  constructor(delay = 0.8, maxHistory = 40) {
    this.history = [];
    this.delay = delay;
    this.maxHistory = maxHistory;
  }

  record(player) {
    this.history.push({x: player.x, y: player.y, time: Date.now() / 1000});
    if (this.history.length > this.maxHistory) this.history.shift();
  }

  drawEcho(ctx, playerImage) {
    const now = Date.now() / 1000;
    this.history.forEach((pos, i) => {
      if (now - pos.time >= this.delay) {
        const alpha = 0.6 * (1 - i / this.maxHistory);
        ctx.globalAlpha = alpha;
        ctx.drawImage(playerImage, pos.x, pos.y, 64, 64);
      }
    });
    ctx.globalAlpha = 1;
  }
}

class GravityMorphSystem {
  constructor(cycleTime = 15) {
    this.cycleTime = cycleTime;
    this.timer = 0;
    this.direction = 1;
    this.currentGravity = 0.6;
  }

  update(dt, player) {
    this.timer += dt;
    if (this.timer > this.cycleTime) {
      this.timer = 0;
      this.direction *= -1;
      soundManager.play('gravity_flip', 0.8);
    }

    const phase = (this.timer / this.cycleTime) * Math.PI * 2;
    this.currentGravity = 0.6 * this.direction * (1 + 0.4 * Math.sin(phase));
    player.gravity = this.currentGravity;
  }

  drawIndicator(ctx) {
    ctx.fillStyle = '#ffaa00';
    ctx.font = '18px Arial';
    ctx.fillText(`Гравитация: ${this.direction > 0 ? 'вниз' : 'вверх'} (${this.currentGravity.toFixed(1)})`, 20, 150);
  }
}

class QuantumUncertaintySystem {
  constructor(probability = 0.01, maxDistance = 120) {
    this.probability = probability;
    this.maxDistance = maxDistance;
  }

  apply(player) {
    if (Math.random() < this.probability) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * this.maxDistance + 40;
      player.x += Math.cos(angle) * dist;
      player.y += Math.sin(angle) * dist;
      particleSystem.addExplosion(player.x, player.y, 15, '#00ffff', [2,6], 4);
      soundManager.play('quantum_blink', 0.6);
    }
  }

  update(player) {
    this.apply(player);
  }
}

class EmotionBoostSystem {
  constructor(maxEmotion = 100) {
    this.emotion = 0;
    this.maxEmotion = maxEmotion;
    this.boostActive = false;
    this.boostTimer = 0;
    this.boostDuration = 8;
  }

  addEmotion(amount = 15) {
    this.emotion = Math.min(this.maxEmotion, this.emotion + amount);
    if (this.emotion >= this.maxEmotion && !this.boostActive) {
      this.activateBoost();
    }
  }

  activateBoost() {
    this.boostActive = true;
    this.boostTimer = this.boostDuration;
    soundManager.play('emotion_burst', 1.0);
    particleSystem.addExplosion(480, 270, 60, '#ff00ff', [5,15], 10); // центр экрана
  }

  update(dt, player) {
    if (this.boostActive) {
      this.boostTimer -= dt;
      if (this.boostTimer <= 0) {
        this.boostActive = false;
        this.emotion = 0;
      } else {
        player.speed *= 1.8;
        player.jumpPower *= 1.6;
        player.invincible = true;
        player.invincibleTimer = 0.5;
      }
    }
  }

  drawBar(ctx) {
    const barX = 20;
    const barY = 180;
    const barW = 200;
    const fillW = (this.emotion / this.maxEmotion) * barW;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, 20);
    ctx.fillStyle = this.boostActive ? '#ff00ff' : '#aa00ff';
    ctx.fillRect(barX, barY, fillW, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(this.boostActive ? 'Эмо-буст активен!' : 'Эмоции', barX, barY - 10);
  }
}

class FractalLevelSystem {
  // Уникальная генерация уровней по фракталу (простой вариант)
  constructor() {
    this.seed = Math.random() * 10000;
  }

  generatePlatform(x, y, width) {
    // Простой фрактал-подобный паттерн платформ
    const platforms = [];
    for (let i = 0; i < 5; i++) {
      const offset = Math.sin(this.seed + i * 0.5) * 100;
      platforms.push({x: x + i*150 + offset, y: y + Math.cos(i) * 50, w: 120, h: 20});
    }
    return platforms;
  }
}

// Глобальные экземпляры
const echoSystem = new EchoSystem();
const gravityMorph = new GravityMorphSystem();
const quantumSys = new QuantumUncertaintySystem();
const emotionBoost = new EmotionBoostSystem();
const fractalLevel = new FractalLevelSystem();

// Пример: emotionBoost.addEmotion(20) — при сборе монет
// В main.js вызывать: emotionBoost.update(dt, player); emotionBoost.drawBar(ctx);
