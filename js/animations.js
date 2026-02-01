// js/animations.js
// Система анимаций и эффектов: частицы, взрывы, следы, fade, shake, glow, много видов

class Particle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = options.vx || (Math.random() * 10 - 5);
    this.vy = options.vy || (Math.random() * 10 - 5);
    this.life = options.life || 1.0;
    this.maxLife = this.life;
    this.size = options.size || Math.random() * 6 + 2;
    this.color = options.color || `hsl(${Math.random()*360}, 100%, 60%)`;
    this.gravity = options.gravity || 0;
    this.fade = options.fade || true;
  }

  update(dt) {
    this.vy += this.gravity * dt * 60;
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.life -= dt;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    const alpha = this.fade ? this.life / this.maxLife : 1;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  addExplosion(x, y, count = 40, color = null, sizeRange = [3,10], speed = 8) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, {
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        life: Math.random() * 0.8 + 0.4,
        size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
        color: color || `hsl(${Math.random()*60 + 10}, 100%, 50%)`,  // огненные тона
        gravity: 400,
        fade: true
      }));
    }
    soundManager.play('explosion', 0.7);
  }

  addTrail(x, y, count = 8, color = '#00ffff') {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x + Math.random()*20 - 10, y + Math.random()*20 - 10, {
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: Math.random() * 0.6 + 0.3,
        size: 4,
        color: color,
        fade: true
      }));
    }
  }

  addRainDrop(x, y) {
    this.particles.push(new Particle(x, y, {
      vx: Math.random() * 2 - 1,
      vy: 20 + Math.random() * 10,
      life: 1.5,
      size: 2,
      color: '#aaffff',
      gravity: 0,
      fade: true
    }));
  }

  update(dt) {
    this.particles = this.particles.filter(p => {
      p.update(dt);
      return p.life > 0;
    });
  }

  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }

  // Дополнительные эффекты
  addGlow(ctx, x, y, radius = 50, color = '#ffff00') {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color + 'ff');
    gradient.addColorStop(0.5, color + '80');
    gradient.addColorStop(1, color + '00');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius*2, radius*2);
  }

  shakeScreen(ctx, intensity = 5, duration = 0.3) {
    // Симуляция тряски — вызывай в main.js
    ctx.translate(Math.random() * intensity - intensity/2, Math.random() * intensity - intensity/2);
    setTimeout(() => ctx.setTransform(1,0,0,1,0,0), duration * 1000);
  }
}

const particleSystem = new ParticleSystem();

// Глобальные эффекты (fade in/out, screen shake и т.д.)
let fadeAlpha = 0;
function fadeInOut(dt, duration = 1.0) {
  fadeAlpha += dt / duration;
  if (fadeAlpha > 1) fadeAlpha = 1;
}

function drawFade(ctx) {
  if (fadeAlpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// Пример вызова эффектов в main.js: particleSystem.addExplosion(player.x, player.y);
