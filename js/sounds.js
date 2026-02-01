// js/sounds.js
// Система звуков и музыки — много эффектов, фоновые треки, прямые ссылки на бесплатные файлы

class SoundManager {
  constructor() {
    this.sounds = {};
    this.musicTracks = [];
    this.currentMusic = null;
    this.volumeEffects = 0.7;
    this.volumeMusic = 0.4;
    this.muted = false;

    this.loadDefaults();
  }

  loadDefaults() {
    // Прямые ссылки на бесплатные звуки (freesound.org / opengameart)
    // Прыжок
    this.addSound('jump', 'https://freesound.org/data/previews/387/387232_7253554-lq.mp3');
    // Шаги (несколько вариантов для разнообразия)
    this.addSound('step1', 'https://freesound.org/data/previews/276/276514_5123857-lq.mp3');
    this.addSound('step2', 'https://freesound.org/data/previews/276/276515_5123857-lq.mp3');
    // Сбор монеты/предмета
    this.addSound('collect', 'https://freesound.org/data/previews/269/269026_5094889-lq.mp3');
    // Урон
    this.addSound('hurt', 'https://freesound.org/data/previews/341/341695_5854226-lq.mp3');
    // Бонус/перк
    this.addSound('bonus', 'https://freesound.org/data/previews/269/269029_5094889-lq.mp3');
    this.addSound('perk_unlock', 'https://freesound.org/data/previews/387/387230_7253554-lq.mp3');
    // Взрыв
    this.addSound('explosion', 'https://freesound.org/data/previews/276/276947_5123857-lq.mp3');
    // Победа
    this.addSound('win', 'https://freesound.org/data/previews/269/269030_5094889-lq.mp3');
    // Смерть
    this.addSound('death', 'https://freesound.org/data/previews/341/341694_5854226-lq.mp3');
    // Клик / меню
    this.addSound('click', 'https://freesound.org/data/previews/387/387231_7253554-lq.mp3');
    // Уровень ап
    this.addSound('level_up', 'https://freesound.org/data/previews/269/269028_5094889-lq.mp3');

    // Фоновая музыка (несколько треков для смены режимов)
    this.musicTracks = [
      'https://opengameart.org/sites/default/files/8bit%20Dungeon%20Level.ogg',  // 8-bit dungeon
      'https://opengameart.org/sites/default/files/adventure.ogg',              // приключение
      'https://opengameart.org/sites/default/files/dark_ambience.ogg',         // тёмный
      'https://opengameart.org/sites/default/files/epic_battle.ogg',           // бой
      'https://opengameart.org/sites/default/files/mysterious.ogg'             // загадка
    ];
  }

  addSound(name, url) {
    const audio = new Audio(url);
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    this.sounds[name] = audio;
  }

  play(name, vol = 1.0) {
    if (this.muted) return;
    const sound = this.sounds[name];
    if (sound) {
      sound.volume = this.volumeEffects * vol;
      sound.currentTime = 0;
      sound.play().catch(e => console.log('Звук не проигрался:', e));
    }
  }

  playRandomStep() {
    const steps = ['step1', 'step2'];
    this.play(steps[Math.floor(Math.random() * steps.length)], 0.5);
  }

  playMusic(index = 0, loop = true) {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }
    const url = this.musicTracks[index % this.musicTracks.length];
    const music = new Audio(url);
    music.crossOrigin = 'anonymous';
    music.loop = loop;
    music.volume = this.volumeMusic;
    music.play().catch(e => console.log('Музыка не запустилась:', e));
    this.currentMusic = music;
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }
  }

  setVolumeEffects(vol) {
    this.volumeEffects = Math.max(0, Math.min(1, vol));
  }

  setVolumeMusic(vol) {
    this.volumeMusic = Math.max(0, Math.min(1, vol));
    if (this.currentMusic) this.currentMusic.volume = this.volumeMusic;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.currentMusic) this.currentMusic.volume = this.muted ? 0 : this.volumeMusic;
  }
}

const soundManager = new SoundManager();

// Автозагрузка тестовых звуков (можно вызвать в main.js)
soundManager.playMusic(0);  // запускаем первую фоновую музыку по умолчанию
