// js/sounds.js — версия без скачивания, всё по прямым ссылкам, CORS-safe ресурсы

class SoundManager {
  constructor() {
    this.sounds = {};
    this.currentMusic = null;
    this.volumeEffects = 0.6;
    this.volumeMusic = 0.3;
    this.muted = false;
    this.userInteracted = false;

    // Прямые ссылки на звуки с CORS-разрешением (public domain / CC0)
    this.loadRemoteSounds();
  }

  loadRemoteSounds() {
    // Надёжные источники без CORS-блоков
    const soundMap = {
      jump: 'https://assets.codepen.io/21542/jump.mp3',
      step: 'https://assets.codepen.io/21542/step.mp3',
      collect: 'https://assets.codepen.io/21542/coin.mp3',
      hurt: 'https://assets.codepen.io/21542/hit.mp3',
      bonus: 'https://assets.codepen.io/21542/powerup.mp3',
      perk_unlock: 'https://assets.codepen.io/21542/levelup.mp3',
      explosion: 'https://assets.codepen.io/21542/explosion.mp3',
      win: 'https://assets.codepen.io/21542/victory.mp3',
      death: 'https://assets.codepen.io/21542/death.mp3',
      click: 'https://assets.codepen.io/21542/click.mp3',
      level_up: 'https://assets.codepen.io/21542/levelup.mp3'
    };

    for (const [name, url] of Object.entries(soundMap)) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.sounds[name] = audio;
    }

    // Музыка — один трек с CORS-разрешением
    this.musicUrl = 'https://assets.codepen.io/21542/8bit-dungeon.mp3';
  }

  play(name, vol = 1.0) {
    if (this.muted || !this.userInteracted) return;
    const sound = this.sounds[name];
    if (sound) {
      sound.volume = this.volumeEffects * vol;
      sound.currentTime = 0;
      sound.play().catch(() => console.log('Звук не проигрался, ждём клика'));
    }
  }

  playRandomStep() {
    this.play('step', 0.4);
  }

  playMusic() {
    if (this.muted || !this.userInteracted || this.currentMusic) return;

    const music = new Audio(this.musicUrl);
    music.loop = true;
    music.volume = this.volumeMusic;
    music.play().catch(() => console.log('Музыка ждёт взаимодействия'));
    this.currentMusic = music;
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.currentMusic) this.currentMusic.volume = this.muted ? 0 : this.volumeMusic;
  }
}

const soundManager = new SoundManager();

// Включаем звук после любого клика или нажатия
window.addEventListener('click', () => { soundManager.userInteracted = true; soundManager.playMusic(); }, {once: true});
window.addEventListener('keydown', () => { soundManager.userInteracted = true; soundManager.playMusic(); }, {once: true});
