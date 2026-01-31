# scripts/player.py
# Класс игрока — персонаж, который будет бегать, прыгать и т.д.

import pygame
from pygame.locals import *

class Player:
    def __init__(self, x=100, y=100, skin='default'):
        self.x = x
        self.y = y
        self.width = 50
        self.height = 70
        self.speed = 5
        self.jump_power = -15
        self.vel_y = 0
        self.on_ground = True
        self.lives = 3
        self.max_lives = 3
        self.skin = skin
        self.image = self.load_skin(skin)
        self.rect = self.image.get_rect(topleft=(self.x, self.y))

        # Для анимации (пока заглушка)
        self.frame = 0
        self.anim_speed = 0.2

    def load_skin(self, skin_name):
        # Пока используем простой прямоугольник вместо картинки
        # Позже заменим на pygame.image.load('../assets/images/skins/' + skin_name + '.png')
        surf = pygame.Surface((self.width, self.height))
        surf.fill((0, 200, 100))  # зелёный человечек
        pygame.draw.circle(surf, (255, 200, 150), (25, 20), 15)  # голова
        pygame.draw.rect(surf, (0, 100, 200), (15, 40, 20, 30))  # тело
        return surf

    def change_skin(self, new_skin):
        self.skin = new_skin
        self.image = self.load_skin(new_skin)

    def update(self, keys, platforms=[]):
        # Движение влево/вправо
        if keys[K_a] or keys[K_LEFT]:
            self.x -= self.speed
        if keys[K_d] or keys[K_RIGHT]:
            self.x += self.speed

        # Прыжок
        if (keys[K_SPACE] or keys[K_UP]) and self.on_ground:
            self.vel_y = self.jump_power
            self.on_ground = False

        # Гравитация
        self.vel_y += 1  # ускорение падения
        self.y += self.vel_y

        # Проверка земли (пока простая — пол на y=500)
        if self.y >= 500 - self.height:
            self.y = 500 - self.height
            self.vel_y = 0
            self.on_ground = True

        # Обновляем rect
        self.rect.topleft = (self.x, self.y)

    def draw(self, surface):
        surface.blit(self.image, self.rect)

    def get_data(self):
        """Для сохранения"""
        return {
            "x": self.x,
            "y": self.y,
            "skin": self.skin,
            "lives": self.lives
        }

    def load_from_data(self, data):
        """Для загрузки"""
        self.x = data.get("x", 100)
        self.y = data.get("y", 100)
        self.skin = data.get("skin", "default")
        self.lives = data.get("lives", 3)
        self.image = self.load_skin(self.skin)
        self.rect.topleft = (self.x, self.y)
