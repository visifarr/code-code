# scripts/enemies.py
# Простые враги: гоняются за игроком, наносят урон при касании

import pygame
import random
import math
from pygame.locals import *

class Enemy:
    def __init__(self, x, y, speed=3, color=(255, 50, 50), size=40):
        self.x = x
        self.y = y
        self.speed = speed
        self.size = size
        self.color = color
        self.health = 3
        self.rect = pygame.Rect(self.x, self.y, size, size)

    def update(self, player, dt):
        # Движение к игроку
        if player:
            dx = player.x - self.x
            dy = player.y - self.y
            dist = math.hypot(dx, dy)
            if dist > 0:
                self.x += (dx / dist) * self.speed
                self.y += (dy / dist) * self.speed

        # Не уходить за экран
        self.x = max(0, min(WIDTH - self.size, self.x))
        self.y = max(0, min(HEIGHT - self.size, self.y))

        self.rect.topleft = (self.x, self.y)

    def draw(self, surface):
        pygame.draw.circle(surface, self.color, (int(self.x + self.size/2), int(self.y + self.size/2)), self.size//2)
        # Простой индикатор здоровья
        health_bar_width = self.size * (self.health / 3)
        pygame.draw.rect(surface, (255, 0, 0), (self.x, self.y - 10, self.size, 5))
        pygame.draw.rect(surface, (0, 255, 0), (self.x, self.y - 10, health_bar_width, 5))

    def take_damage(self, amount=1):
        self.health -= amount
        if self.health <= 0:
            return True  # враг мёртв
        return False

    def check_collision(self, player):
        if player and self.rect.colliderect(player.rect):
            return True
        return False


class EnemyManager:
    def __init__(self):
        self.enemies = []
        self.spawn_timer = 0
        self.spawn_interval = 5.0  # секунды между спавнами

    def update(self, player, dt):
        self.spawn_timer += dt
        if self.spawn_timer >= self.spawn_interval:
            self.spawn_timer = 0
            # Спавн нового врага в случайном месте на краю экрана
            side = random.choice(["left", "right", "top", "bottom"])
            if side == "left":
                x, y = 0, random.randint(0, HEIGHT)
            elif side == "right":
                x, y = WIDTH, random.randint(0, HEIGHT)
            elif side == "top":
                x, y = random.randint(0, WIDTH), 0
            else:
                x, y = random.randint(0, WIDTH), HEIGHT
            self.enemies.append(Enemy(x, y, speed=random.uniform(2, 4)))

        # Обновление всех врагов
        for enemy in self.enemies[:]:
            enemy.update(player, dt)

            # Урон игроку при касании
            if enemy.check_collision(player):
                player.lives -= 1
                self.enemies.remove(enemy)  # враг исчезает после атаки
                print("Игрок получил урон!")

            # Удаление мёртвых врагов
            if enemy.health <= 0:
                self.enemies.remove(enemy)
                # Можно добавить частицы взрыва
                # particle_system.add_explosion(enemy.x + enemy.size/2, enemy.y + enemy.size/2, count=30)

    def draw(self, surface):
        for enemy in self.enemies:
            enemy.draw(surface)

    def get_enemies(self):
        return self.enemies


# Глобальный менеджер врагов (создавай в main.py)
enemy_manager = EnemyManager()
