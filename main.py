# main.py
# Самый главный файл — запуск игры

import sys
import subprocess

# Автоматическая установка pygame, если его нет
def install_pygame():
    try:
        import pygame
        print("pygame уже есть")
    except ImportError:
        print("pygame не найден → ставлю сам...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pygame==2.6.0"])
            print("pygame установлен!")
            import pygame
        except Exception as e:
            print("Не смог установить pygame автоматически.")
            print("Сделай вручную:   python -m pip install pygame")
            sys.exit(1)

install_pygame()

# Теперь pygame точно работает
import pygame
from pygame.locals import *

pygame.init()

# Окно
WIDTH = 800
HEIGHT = 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Моя игра — начало")
clock = pygame.time.Clock()

# Цвета
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
BLUE = (50, 100, 255)

# Шрифт
font_big = pygame.font.SysFont("arial", 48, bold=True)
font_small = pygame.font.SysFont("arial", 28)

running = True
while running:
    for event in pygame.event.get():
        if event.type == QUIT:
            running = False
        if event.type == KEYDOWN:
            if event.key == K_ESCAPE:
                running = False

    screen.fill(BLACK)

    # Текст по центру
    title = font_big.render("ДОБРО ПОЖАЛОВАТЬ", True, BLUE)
    subtitle = font_small.render("Пока просто окно. Жми ESC чтобы выйти", True, WHITE)

    screen.blit(title, (WIDTH//2 - title.get_width()//2, 200))
    screen.blit(subtitle, (WIDTH//2 - subtitle.get_width()//2, 320))

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()
