# scripts/player.py
# Класс персонажа: движение, прыжок, гравитация, скины

import pygame
from pygame.locals import *

class Player:
    def __init__(self, x=200, y=300, skin="default"):
        self.x = x
        self.y = y
        self.width = 60
        self.height = 80
        self.speed = 6
        self.jump_power = -18
        self.vel_y = 0
        self.on_ground = True
        self.gravity = 1.0
        self.lives = 3
        self.max_lives = 5
        self.skin = skin

        # Загрузка изображения скина (пока заглушка, если нет файла — рисуем прямоугольник)
        self.image = self._load_skin(skin)
        self.rect = self.image.get_rect(topleft=(self.x, self.y))

        # Для будущей анимации
        self.anim_frame = 0
        self.anim_timer = 0
        self.facing_right = True

    def _load_skin(self, skin_name):
        try:
            img_path = f"../assets/images/skins/{skin_name}.png"
            img = pygame.image.load(img_path).convert_alpha()
            img = pygame.transform.scale(img, (self.width, self.height))
            return img
        except:
            # Если картинки нет — рисуем простого человечка
            surf = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
            # Тело
            pygame.draw.rect(surf, (0, 120, 220), (10, 30, 40, 50))
            # Голова
            pygame.draw.circle(surf, (255, 220, 180), (30, 20), 18)
            # Глаза
            pygame.draw.circle(surf, (0, 0, 0), (25, 18), 4)
            pygame.draw.circle(surf, (0, 0, 0), (35, 18), 4)
            return surf

    def change_skin(self, new_skin):
        self.skin = new_skin
        self.image = self._load_skin(new_skin)

    def update(self, keys):
        # Горизонтальное движение
        dx = 0
        if keys[K_a] or keys[K_LEFT]:
            dx = -self.speed
            self.facing_right = False
        if keys[K_d] or keys[K_RIGHT]:
            dx = self.speed
            self.facing_right = True

        self.x += dx

        # Прыжок
        if (keys[K_SPACE] or keys[K_UP]) and self.on_ground:
            self.vel_y = self.jump_power
            self.on_ground = False

        # Гравитация
        self.vel_y += self.gravity
        self.y += self.vel_y

        # Простая проверка земли (пол на y = HEIGHT - 100)
        ground_y = HEIGHT - 100
        if self.y + self.height >= ground_y:
            self.y = ground_y - self.height
            self.vel_y = 0
            self.on_ground = True

        # Не улетать за экран
        if self.x < 0:
            self.x = 0
        if self.x + self.width > WIDTH:
            self.x = WIDTH - self.width

        # Обновляем rect
        self.rect.topleft = (self.x, self.y)

    def draw(self, surface):
        # Если смотрим влево — зеркалим спрайт
        img = self.image
        if not self.facing_right:
            img = pygame.transform.flip(img, True, False)
        surface.blit(img, self.rect)

    def get_save_data(self):
        return {
            "x": self.x,
            "y": self.y,
            "skin": self.skin,
            "lives": self.lives
        }

    @classmethod
    def from_save_data(cls, data):
        p = cls(
            x=data.get("x", 200),
            y=data.get("y", 300),
            skin=data.get("skin", "default")
        )
        p.lives = data.get("lives", 3)
        return p
