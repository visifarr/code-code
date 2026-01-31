# scripts/animations.py
# Система анимаций и эффектов: частицы, анимация спрайтов, fade, вспышки

import pygame
import random
import math
from pygame.locals import *

class Particle:
    """Одиночная частица для эффектов (огонь, дым, искры и т.д.)"""
    def __init__(self, x, y, color, size=5, lifetime=1.0, vel_x=0, vel_y=0):
        self.x = x
        self.y = y
        self.color = color
        self.size = size
        self.lifetime = lifetime
        self.max_lifetime = lifetime
        self.vel_x = vel_x
        self.vel_y = vel_y
        self.alpha = 255

    def update(self, dt):
        self.x += self.vel_x * dt
        self.y += self.vel_y * dt
        self.lifetime -= dt
        self.alpha = int(255 * (self.lifetime / self.max_lifetime))
        if self.alpha < 0:
            self.alpha = 0

    def draw(self, surface):
        if self.lifetime > 0:
            surf = pygame.Surface((self.size * 2, self.size * 2), SRCALPHA)
            pygame.draw.circle(surf, (*self.color, self.alpha), (self.size, self.size), self.size)
            surface.blit(surf, (int(self.x - self.size), int(self.y - self.size)))


class ParticleEmitter:
    """Генератор частиц (огонь, взрыв, след и т.д.)"""
    def __init__(self, x, y, count=20, color=(255, 100, 0), lifetime=0.8, spread=5.0, gravity=0):
        self.x = x
        self.y = y
        self.particles = []
        self.count = count
        self.color = color
        self.lifetime = lifetime
        self.spread = spread
        self.gravity = gravity

    def emit(self):
        for _ in range(self.count):
            angle = random.uniform(0, math.tau)
            speed = random.uniform(1, self.spread)
            vel_x = math.cos(angle) * speed
            vel_y = math.sin(angle) * speed
            p = Particle(
                self.x, self.y,
                self.color,
                size=random.randint(2, 6),
                lifetime=random.uniform(self.lifetime * 0.5, self.lifetime * 1.5),
                vel_x=vel_x,
                vel_y=vel_y
            )
            self.particles.append(p)

    def update(self, dt):
        for p in self.particles[:]:
            p.vel_y += self.gravity * dt
            p.update(dt)
            if p.lifetime <= 0:
                self.particles.remove(p)

    def draw(self, surface):
        for p in self.particles:
            p.draw(surface)


class SpriteAnimator:
    """Анимация спрайт-шита для персонажа (ходьба, прыжок и т.д.)"""
    def __init__(self, sprite_sheet_path, frame_width, frame_height, frame_count, fps=10):
        try:
            sheet = pygame.image.load(sprite_sheet_path).convert_alpha()
            self.frames = []
            for i in range(frame_count):
                frame = sheet.subsurface((i * frame_width, 0, frame_width, frame_height))
                self.frames.append(frame)
        except:
            # Заглушка, если файла нет
            self.frames = [pygame.Surface((frame_width, frame_height)) for _ in range(frame_count)]
            for f in self.frames:
                f.fill((100, 200, 100))

        self.frame_count = frame_count
        self.current_frame = 0
        self.frame_time = 1.0 / fps
        self.timer = 0
        self.playing = True

    def update(self, dt):
        if not self.playing:
            return
        self.timer += dt
        if self.timer >= self.frame_time:
            self.timer -= self.frame_time
            self.current_frame = (self.current_frame + 1) % self.frame_count

    def get_current_frame(self):
        return self.frames[self.current_frame]

    def reset(self):
        self.current_frame = 0
        self.timer = 0

    def stop(self):
        self.playing = False

    def play(self):
        self.playing = True


class FadeEffect:
    """Эффект fade in/out для переходов между сценами"""
    def __init__(self, duration=1.0, color=(0, 0, 0), fade_in=True):
        self.duration = duration
        self.color = color
        self.fade_in = fade_in
        self.timer = 0
        self.active = True

    def update(self, dt):
        if not self.active:
            return
        self.timer += dt
        if self.timer >= self.duration:
            self.active = False

    def draw(self, surface):
        if not self.active:
            return
        alpha = int(255 * (1 - self.timer / self.duration)) if self.fade_in else int(255 * (self.timer / self.duration))
        fade_surf = pygame.Surface(surface.get_size()).convert_alpha()
        fade_surf.fill((*self.color, alpha))
        surface.blit(fade_surf, (0, 0))

    def is_done(self):
        return not self.active
