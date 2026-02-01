// js/game_modes.js
// Режимы игры — сюжет, выживание, аркада, пазл, босс-раш и т.д. (много режимов с разными правилами)

class GameMode {
  constructor(name) {
    this.name = name;
    this.score = 0;
    this.timer = 0;
    this.isActive = true;
  }

  update(player, dt, keys, gameState) {
    this.timer += dt;
  }

  drawUI(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`${this.name} режим`, 20, 60);
    ctx.fillText(`Очки: ${Math.floor(this.score)}`, 20, 90);
  }

  end() {
    this.isActive = false;
    soundManager.play('win', 1.0);
  }
}

class StoryMode extends GameMode {
  constructor() {
    super('Сюжет');
    this.story = storyManager;
  }

  update(player, dt, keys, gameState) {
    super.update(player, dt, keys, gameState);
    this.story.update(dt, player, gameState);
    // Пример: если цель уровня выполнена — награда и переход
    if (player.score >= 5 && this.story.currentLevel === 0) {
      unlockRandomPerk(player);
      this.story.advanceLevel(player);
      player.score = 0;
    }
  }

  drawUI(ctx) {
    super.drawUI(ctx);
    this.story.showDialog(ctx);
  }
}

class SurvivalMode extends GameMode {
  constructor() {
    super('Выживание');
    this.spawnTimer = 0;
    this.spawnInterval = 4.0;
  }

  update(player, dt, keys, gameState) {
    super.update(player, dt, keys, gameState);
    this.score += dt * 10;  // очки за время

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      enemyManager.enemies.push(new Enemy(Math.random() * canvas.width, -50));
      this.spawnInterval = Math.max(1.5, this.spawnInterval - 0.2);
      soundManager.play('enemy_spawn', 0.6);
    }

    if (player.lives <= 0) this.end();
  }

  drawUI(ctx) {
    super.drawUI(ctx);
    ctx.fillText(`Время выживания: ${this.timer.toFixed(1)} сек`, 20, 120);
  }
}

class ArcadeMode extends GameMode {
  constructor() {
    super('Аркада');
    this.coinTimer = 0;
  }

  update(player, dt, keys, gameState) {
    super.update(player, dt, keys, gameState);
    this.score += dt * 5;

    this.coinTimer += dt;
    if (this.coinTimer >= 2.0) {
      this.coinTimer = 0;
      // Симулируем монету (можно добавить класс Coin позже)
      player.score += 10;
      soundManager.play('collect', 0.8);
      particleSystem.addExplosion(player.x + 32, player.y + 32, 20, '#ffff00');
    }

    if (this.timer > 60) this.score *= 1.5;  // бонус за минуту
  }

  drawUI(ctx) {
    super.drawUI(ctx);
    ctx.fillText(`Монеты: ${Math.floor(this.score / 10)}`, 20, 120);
  }
}

// Дополнительные режимы (можно расширять)
class PuzzleMode extends GameMode {
  constructor() {
    super('Пазл');
  }
  update(player, dt, keys, gameState) {
    // Логика пазла — например, собрать элементы в правильном порядке
    super.update(player, dt, keys, gameState);
  }
}

class BossRushMode extends GameMode {
  constructor() {
    super('Босс-раш');
    this.bossHealth = 100;
  }
  update(player, dt, keys, gameState) {
    super.update(player, dt, keys, gameState);
    // Босс появляется после 30 сек
    if (this.timer > 30) {
      // Симуляция урона боссу
      if (keys[' ']) this.bossHealth -= dt * 20;
      if (this.bossHealth <= 0) this.end();
    }
  }
  drawUI(ctx) {
    super.drawUI(ctx);
    ctx.fillText(`Босс HP: ${Math.max(0, this.bossHealth)}`, 20, 120);
  }
}

// Словарь режимов
const MODE_FACTORY = {
  story: () => new StoryMode(),
  survival: () => new SurvivalMode(),
  arcade: () => new ArcadeMode(),
  puzzle: () => new PuzzleMode(),
  bossrush: () => new BossRushMode()
  // Добавь ещё: co-op симуляция, speedrun, endless, defense и т.д.
};

function createMode(name) {
  if (MODE_FACTORY[name]) {
    const mode = MODE_FACTORY[name]();
    soundManager.play('mode_start', 0.9);
    return mode;
  }
  return new GameMode('Неизвестный');
}
