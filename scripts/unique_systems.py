# scripts/unique_systems.py
# Уникальные системы механик, которых нигде раньше не было

import random
import math
import pygame

class EchoSystem:
    """Эхо-система: прошлые действия игрока повторяются призраком с задержкой"""
    def __init__(self, delay=1.5, max_history=100):
        self.history = []  # список (x, y, frame_time)
        self.delay = delay
        self.max_history = max_history
        self.echo_color = (100, 100, 255, 100)  # полупрозрачный синий

    def record(self, player):
        self.history.append((player.x, player.y, pygame.time.get_ticks() / 1000.0))
        if len(self.history) > self.max_history:
            self.history.pop(0)

    def draw_echo(self, surface, player_image):
        current_time = pygame.time.get_ticks() / 1000.0
        for i in range(len(self.history) - 1, -1, -1):
            x, y, t = self.history[i]
            if current_time - t >= self.delay:
                alpha_surf = pygame.Surface(player_image.get_size(), pygame.SRCALPHA)
                alpha_surf.blit(player_image, (0, 0))
                alpha_surf.set_alpha(80 - (i * 2))  # затухание
                surface.blit(alpha_surf, (int(x), int(y)))
                # Удаляем старые
                if i < len(self.history) - 10:  # оставляем последние 10 эхо
                    del self.history[:i+1]
                    break

class GravityMorphSystem:
    """Морфинг гравитации: меняется направление/сила со временем или по условию"""
    def __init__(self, base_gravity=1.0, cycle_time=20.0):
        self.base_gravity = base_gravity
        self.current_gravity = base_gravity
        self.cycle_time = cycle_time
        self.timer = 0
        self.direction = 1  # 1 вниз, -1 вверх

    def update(self, dt, player):
        self.timer += dt
        if self.timer > self.cycle_time:
            self.timer = 0
            self.direction *= -1
            print("Гравитация перевернулась!")

        # Плавный переход
        phase = (self.timer / self.cycle_time) * math.tau
        self.current_gravity = self.base_gravity * self.direction * (1 + 0.3 * math.sin(phase))

        player.gravity = self.current_gravity  # применяем к игроку

    def draw_indicator(self, surface, font):
        text = font.render(f"Гравитация: {'вниз' if self.direction > 0 else 'вверх'} ({self.current_gravity:.1f})", True, (255, 150, 50))
        surface.blit(text, (20, 60))


class QuantumUncertaintySystem:
    """Квантовая неопределённость: случайные телепорты объектов"""
    def __init__(self, probability=0.005, max_distance=150):
        self.probability = probability
        self.max_distance = max_distance

    def apply(self, obj):  # obj может быть player или enemy
        if random.random() < self.probability:
            angle = random.uniform(0, math.tau)
            dist = random.uniform(50, self.max_distance)
            obj.x += math.cos(angle) * dist
            obj.y += math.sin(angle) * dist
            print("Квантовая телепортация!")

    def update(self, player):
        self.apply(player)  # можно применять к игроку или к врагам


class EmotionBoostSystem:
    """Эмоциональный буст: собирай 'эмоции' для временного супер-буста"""
    def __init__(self, max_emotion=100):
        self.emotion = 0
        self.max_emotion = max_emotion
        self.boost_active = False
        self.boost_duration = 5.0
        self.boost_timer = 0

    def add_emotion(self, amount=10):
        self.emotion = min(self.max_emotion, self.emotion + amount)

    def update(self, dt, player):
        if self.emotion >= self.max_emotion and not self.boost_active:
            self.boost_active = True
            self.boost_timer = self.boost_duration
            player.speed *= 2
            player.jump_power *= 1.5
            print("Эмоциональный буст активирован!")

        if self.boost_active:
            self.boost_timer -= dt
            if self.boost_timer <= 0:
                self.boost_active = False
                player.speed /= 2
                player.jump_power /= 1.5
                self.emotion = 0
                print("Буст закончился")

    def draw_bar(self, surface):
        bar_width = 200
        fill = (self.emotion / self.max_emotion) * bar_width
        pygame.draw.rect(surface, (50, 50, 50), (20, 100, bar_width, 20))
        pygame.draw.rect(surface, (255, 100, 200), (20, 100, fill, 20))


# Глобальные экземпляры (создавай в main.py по одному)
echo_system = EchoSystem(delay=1.2)
gravity_morph = GravityMorphSystem(cycle_time=15.0)
quantum_sys = QuantumUncertaintySystem(probability=0.008)
emotion_boost = EmotionBoostSystem(max_emotion=80)
