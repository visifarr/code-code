# scripts/sounds.py
# Система звуков и музыки: загрузка, проигрывание, управление

import pygame
import os
import random

# Инициализация микшера (если ещё не сделано в main.py)
if not pygame.mixer.get_init():
    pygame.mixer.init(frequency=44100, size=-16, channels=2, buffer=512)

class SoundManager:
    def __init__(self):
        self.sounds = {}          # словарь звуковых эффектов
        self.music = None         # текущая музыка
        self.music_volume = 0.5
        self.effects_volume = 0.8
        self.muted = False

        # Путь к папке звуков
        self.base_path = "../assets/sounds/"

        # Загружаем звуки по умолчанию (если файлов нет — пропускаем)
        self.load_default_sounds()

    def load_default_sounds(self):
        """Загружает типичные звуки (можно расширять)"""
        sound_files = {
            "jump": "jump.wav",
            "step": ["step1.wav", "step2.wav", "step3.wav"],  # несколько для вариации
            "collect": "collect.wav",
            "hurt": "hurt.wav",
            "bonus": "bonus.wav",
            "perk_unlock": "perk.wav",
            "death": "death.wav",
            "win": "win.wav",
            "click": "click.wav"
        }

        for name, file_or_list in sound_files.items():
            if isinstance(file_or_list, list):
                self.sounds[name] = []
                for f in file_or_list:
                    path = os.path.join(self.base_path, f)
                    if os.path.exists(path):
                        self.sounds[name].append(pygame.mixer.Sound(path))
            else:
                path = os.path.join(self.base_path, file_or_list)
                if os.path.exists(path):
                    self.sounds[name] = pygame.mixer.Sound(path)

    def play(self, sound_name, loops=0, volume=None):
        """Проиграть звуковой эффект"""
        if self.muted:
            return

        if sound_name in self.sounds:
            sound = self.sounds[sound_name]
            if isinstance(sound, list):
                sound = random.choice(sound)  # случайный из вариантов шагов и т.д.
            if volume is not None:
                old_vol = sound.get_volume()
                sound.set_volume(volume)
                sound.play(loops)
                sound.set_volume(old_vol)  # возвращаем старый
            else:
                sound.set_volume(self.effects_volume)
                sound.play(loops)

    def play_music(self, music_file, loops=-1, fade_ms=2000):
        """Проиграть фоновую музыку"""
        path = os.path.join(self.base_path, music_file)
        if os.path.exists(path):
            pygame.mixer.music.load(path)
            pygame.mixer.music.set_volume(self.music_volume)
            pygame.mixer.music.play(loops, fade_ms=fade_ms)
            self.music = music_file

    def stop_music(self, fade_ms=1000):
        pygame.mixer.music.fadeout(fade_ms)
        self.music = None

    def pause_music(self):
        pygame.mixer.music.pause()

    def unpause_music(self):
        pygame.mixer.music.unpause()

    def set_music_volume(self, vol):
        self.music_volume = max(0.0, min(1.0, vol))
        pygame.mixer.music.set_volume(self.music_volume)

    def set_effects_volume(self, vol):
        self.effects_volume = max(0.0, min(1.0, vol))
        # Можно обновить все загруженные звуки, но проще менять при play

    def mute_all(self):
        self.muted = True
        pygame.mixer.music.set_volume(0)

    def unmute_all(self):
        self.muted = False
        pygame.mixer.music.set_volume(self.music_volume)

    def toggle_mute(self):
        if self.muted:
            self.unmute_all()
        else:
            self.mute_all()

# Глобальный менеджер звуков (создавай один экземпляр)
sound_manager = SoundManager()
