// js/bonuses_perks.js
// Система перков (постоянные) и бонусов (временные) — 30+ примеров, очень много контента

class Perk {
  constructor(name, description, applyFunc) {
    this.name = name;
    this.description = description;
    this.applyFunc = applyFunc;
  }

  apply(player) {
    this.applyFunc(player);
  }
}

// Большой пул перков (30 штук, как просил — много и уникальных)
const PERKS_POOL = [
  new Perk('Double Jump', 'Двойной прыжок в воздухе', p => p.jumpPower = -15, p => p.doubleJump = true),
  new Perk('Speed Demon', 'Скорость +50%', p => p.speed *= 1.5),
  new Perk('Extra Life', 'Жизней +2', p => { p.lives += 2; p.maxLives += 2; }),
  new Perk('Invincibility Burst', '5 сек неуязвимости при уроне', p => p.invincOnHit = true),
  new Perk('Mega Jump', 'Прыжок в 2 раза выше', p => p.jumpPower *= 2),
  new Perk('Fire Aura', 'Огонь вокруг, урон врагам', p => p.fireAura = true),
  new Perk('Ice Shield', 'Замедляет врагов при касании', p => p.iceShield = true),
  new Perk('Shadow Teleport', 'Телепорт на 100 пикс. назад', p => p.shadowTeleport = true),
  new Perk('Magnet Coins', 'Магнит для монет на 150 пикс.', p => p.magnetRange = 150),
  new Perk('Regeneration', 'Восстанавливает 1 жизнь каждые 20 сек', p => p.regenRate = 20),
  new Perk('Dash', 'Рывок вперёд на SPACE', p => p.dashPower = 15),
  new Perk('Laser Eyes', 'Стрельба лазером', p => p.laser = true),
  new Perk('Bomb Drop', 'Бомбы при прыжке', p => p.bombDrop = true),
  new Perk('Size Grow', 'Увеличивается размер и урон', p => p.sizeMultiplier = 1.5),
  new Perk('Time Slow', 'Замедление врагов на 50%', p => p.timeSlow = 0.5),
  new Perk('Luck Boost', 'Шанс дропа перков +30%', p => p.luck = 1.3),
  new Perk('Fly Mode', 'Летать 10 сек после прыжка', p => p.flyTime = 10),
  new Perk('Wall Walk', 'Ходить по стенам', p => p.wallWalk = true),
  new Perk('Double Damage', 'Урон ×2', p => p.damageMultiplier = 2),
  new Perk('Invisibility', 'Невидим при низком HP', p => p.invisLowHP = true),
  new Perk('Portal Jump', 'Портал при двойном прыжке', p => p.portalJump = true),
  new Perk('Heal Burst', 'Восстанавливает все жизни раз в минуту', p => p.healBurst = 60),
  new Perk('Enemy Freeze', 'Замораживает врагов при касании', p => p.freezeOnTouch = true),
  new Perk('Coin Multiplier', 'Монеты ×3', p => p.coinMult = 3),
  new Perk('Super Speed', 'Скорость ×3 на 10 сек при спаме прыжка', p => p.superSpeedTrigger = true),
  new Perk('Gravity Flip', 'Переворот гравитации', p => p.gravityFlip = true),
  new Perk('Echo Clone', 'Клон повторяет действия', p => p.echoClone = true),
  new Perk('Quantum Dodge', 'Шанс уклонения 30%', p => p.dodgeChance = 0.3),
  new Perk('Ultimate Shield', 'Полная защита 5 сек после урона', p => p.ultimateShield = 5),
  new Perk('Legendary Luck', 'Шанс легендарного перка +10%', p => p.legendaryLuck = 0.1)
];

function unlockRandomPerk(player) {
  const available = PERKS_POOL.filter(p => !player.perks.includes(p.name));
  if (available.length === 0) return null;
  const perk = available[Math.floor(Math.random() * available.length)];
  perk.apply(player);
  player.perks.push(perk.name);
  soundManager.play('perk_unlock', 0.8);
  return perk.name;
}

function getPerksList(player) {
  return player.perks;
}

// Временные бонусы (тоже много — 25 штук)
class Bonus {
  constructor(name, duration, applyFunc, endFunc = () => {}) {
    this.name = name;
    this.duration = duration;
    this.applyFunc = applyFunc;
    this.endFunc = endFunc;
    this.startTime = Date.now() / 1000;
  }

  isActive() {
    return (Date.now() / 1000 - this.startTime) < this.duration;
  }

  update(player) {
    if (this.isActive()) {
      this.applyFunc(player);
    } else {
      this.endFunc(player);
      return false;
    }
    return true;
  }
}

const BONUSES_POOL = [
  new Bonus('Speed Boost', 10, p => p.speed *= 2, p => p.speed /= 2),
  new Bonus('Invincibility', 8, p => p.invincible = true, p => p.invincible = false),
  new Bonus('Jump Boost', 12, p => p.jumpPower *= 1.8, p => p.jumpPower /= 1.8),
  new Bonus('Coin Magnet', 15, p => p.magnetRange = 200, p => p.magnetRange = 0),
  new Bonus('Fire Trail', 10, p => p.fireTrail = true, p => p.fireTrail = false),
  new Bonus('Slow Enemies', 20, p => p.timeSlow = 0.6, p => p.timeSlow = 1),
  new Bonus('Double Score', 15, p => p.scoreMult = 2, p => p.scoreMult = 1),
  new Bonus('Heal Over Time', 10, p => { p.lives = Math.min(p.maxLives, p.lives + 0.2); }, () => {}),
  new Bonus('Dash Mode', 8, p => p.dashPower = 20, p => p.dashPower = 0),
  new Bonus('Size Giant', 12, p => p.sizeMultiplier = 2, p => p.sizeMultiplier = 1),
  new Bonus('Invisibility', 6, p => p.invis = true, p => p.invis = false),
  new Bonus('Bomb Rain', 10, p => p.bombRain = true, p => p.bombRain = false),
  new Bonus('Portal Mode', 15, p => p.portalActive = true, p => p.portalActive = false),
  new Bonus('Gravity Zero', 8, p => p.gravity = 0.1, p => p.gravity = 0.6),
  new Bonus('Echo Power', 12, p => p.echoPower = true, p => p.echoPower = false),
  new Bonus('Luck Surge', 20, p => p.luck = 2, p => p.luck = 1),
  new Bonus('Fly Boost', 10, p => p.flyBoost = true, p => p.flyBoost = false),
  new Bonus('Wall Glide', 15, p => p.wallGlide = true, p => p.wallGlide = false),
  new Bonus('Laser Barrage', 8, p => p.laserBarrage = true, p => p.laserBarrage = false),
  new Bonus('Regen Burst', 12, p => p.regenBurst = true, p => p.regenBurst = false),
  new Bonus('Enemy Freeze', 10, p => p.freezeEnemies = true, p => p.freezeEnemies = false),
  new Bonus('Score Explosion', 15, p => p.scoreExplosion = true, p => p.scoreExplosion = false),
  new Bonus('Super Dash', 8, p => p.superDash = true, p => p.superDash = false),
  new Bonus('Quantum Blink', 10, p => p.quantumBlink = true, p => p.quantumBlink = false),
  new Bonus('Ultimate Power', 20, p => { p.speed *= 2; p.jumpPower *= 1.5; p.damageMult = 3; }, p => { p.speed /= 2; p.jumpPower /= 1.5; p.damageMult = 1; })
];

function activateRandomBonus(player) {
  const bonus = BONUSES_POOL[Math.floor(Math.random() * BONUSES_POOL.length)];
  player.activeBonuses.push(bonus);
  soundManager.play('bonus', 0.8);
  return bonus.name;
}

function updateBonuses(player) {
  player.activeBonuses = player.activeBonuses.filter(bonus => bonus.update(player));
}
