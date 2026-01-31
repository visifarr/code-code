# main.py
# Теперь с игроком и базовым движением

import sys
import subprocess

def install_pygame():
    try:
        import pygame
    except ImportError:
        print("Устанавливаю pygame...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pygame==2.6.0"])
        import pygame

install_pygame()

import pygame
from pygame.locals import *
from scripts.registration import register, login
from scripts.player import Player

pygame.init()

WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Моя игра — с игроком")
clock = pygame.time.Clock()

font = pygame.font.SysFont("arial", 32)
small_font = pygame.font.SysFont("arial", 24)

# Состояния
STATE_MENU = 0
STATE_REGISTER = 1
STATE_LOGIN = 2
STATE_GAME = 3

state = STATE_MENU

username = ""
password = ""
message = ""
active_field = "username"

logged_in_user = None
player_data = None
player = None  # будет создан после логина

running = True
while running:
    keys = pygame.key.get_pressed()

    for event in pygame.event.get():
        if event.type == QUIT:
            running = False
        if event.type == KEYDOWN:
            if event.key == K_ESCAPE:
                running = False

            if state in (STATE_REGISTER, STATE_LOGIN):
                if event.key == K_TAB:
                    active_field = "password" if active_field == "username" else "username"
                elif event.key == K_BACKSPACE:
                    if active_field == "username":
                        username = username[:-1]
                    else:
                        password = password[:-1]
                elif event.key == K_RETURN:
                    if state == STATE_REGISTER:
                        success, msg = register(username, password)
                        message = msg
                        if success:
                            state = STATE_MENU
                    elif state == STATE_LOGIN:
                        success, data = login(username, password)
                        if success:
                            player_data = data
                            logged_in_user = username
                            message = f"Добро пожаловать, {username}!"
                            state = STATE_GAME
                            # Создаём игрока
                            player = Player(
                                x=player_data.get("position", [100, 100])[0],
                                y=player_data.get("position", [100, 100])[1],
                                skin=player_data.get("skins", ["default"])[0]
                            )
                        else:
                            message = data
                else:
                    if event.unicode.isprintable():
                        if len(event.unicode.strip()) > 0:
                            if active_field == "username":
                                username += event.unicode
                            else:
                                password += event.unicode

            elif state == STATE_GAME:
                if event.key == K_r:
                    state = STATE_MENU
                    username = ""
                    password = ""

    screen.fill((20, 30, 60))

    if state == STATE_MENU:
        title = font.render("ДОБРО ПОЖАЛОВАТЬ", True, (100, 200, 255))
        screen.blit(title, (WIDTH//2 - title.get_width()//2, 100))

        reg = small_font.render("1 — Регистрация", True, (220, 220, 220))
        log = small_font.render("2 — Вход", True, (220, 220, 220))
        screen.blit(reg, (WIDTH//2 - reg.get_width()//2, 250))
        screen.blit(log, (WIDTH//2 - log.get_width()//2, 300))

        if keys[K_1]:
            state = STATE_REGISTER
            message = ""
        if keys[K_2]:
            state = STATE_LOGIN
            message = ""

    elif state in (STATE_REGISTER, STATE_LOGIN):
        title_text = "Регистрация" if state == STATE_REGISTER else "Вход"
        title = font.render(title_text, True, (100, 200, 255))
        screen.blit(title, (WIDTH//2 - title.get_width()//2, 80))

        u_label = small_font.render("Имя:", True, (220, 220, 220))
        p_label = small_font.render("Пароль:", True, (220, 220, 220))
        screen.blit(u_label, (150, 180))
        screen.blit(p_label, (150, 240))

        u_surf = font.render(username + ("|" if active_field == "username" else ""), True, (255, 255, 255))
        p_surf = font.render("*"*len(password) + ("|" if active_field == "password" else ""), True, (255, 255, 255))
        screen.blit(u_surf, (300, 175))
        screen.blit(p_surf, (300, 235))

        msg_color = (255, 100, 100) if "ошиб" in message.lower() or "неверн" in message.lower() else (100, 255, 100)
        msg_surf = small_font.render(message, True, msg_color)
        screen.blit(msg_surf, (WIDTH//2 - msg_surf.get_width()//2, 350))

    elif state == STATE_GAME and player:
        # Обновляем игрока
        player.update(keys)

        # Рисуем пол
        pygame.draw.rect(screen, (100, 50, 0), (0, 500, WIDTH, 100))

        # Рисуем игрока
        player.draw(screen)

        # Инфо
        info = small_font.render(f"Игрок: {logged_in_user} | Жизни: {player.lives} | Уровень: {player_data['level']}", True, (200, 255, 200))
        screen.blit(info, (20, 20))

        back = small_font.render("R — в меню", True, (150, 150, 150))
        screen.blit(back, (WIDTH//2 - back.get_width()//2, 550))

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()
