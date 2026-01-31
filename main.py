# main.py
# Главный файл игры — стабильная версия, расширяемая модулями

import sys
import subprocess

# Автоматическая установка pygame один раз
def install_pygame():
    try:
        import pygame
    except ImportError:
        print("pygame не найден → устанавливаю...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pygame==2.6.0"])
            print("pygame установлен!")
            import pygame
        except Exception as e:
            print("Ошибка установки pygame:", e)
            print("Установи вручную: python -m pip install pygame")
            sys.exit(1)

install_pygame()

import pygame
from pygame.locals import *

# Импортируем существующие модули (добавляй новые по мере создания)
from scripts.registration import register, login
# Пока player закомментирован — раскомментируй, когда создашь scripts/player.py
# from scripts.player import Player

pygame.init()

WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Твоя игра")
clock = pygame.time.Clock()

font = pygame.font.SysFont("arial", 36, bold=True)
small_font = pygame.font.SysFont("arial", 24)

# Состояния игры
STATE_MENU      = 0
STATE_REGISTER  = 1
STATE_LOGIN     = 2
STATE_GAME      = 3

state = STATE_MENU

# Переменные ввода
username = ""
password = ""
message = ""
active_field = "username"  # username / password

# Данные после входа
logged_in_user = None
player_data = None
player = None           # будет экземпляр Player после создания модуля

running = True
while running:
    keys = pygame.key.get_pressed()

    for event in pygame.event.get():
        if event.type == QUIT:
            running = False

        if event.type == KEYDOWN:
            if event.key == K_ESCAPE:
                running = False

            # Ввод в полях регистрации/логина
            if state in (STATE_REGISTER, STATE_LOGIN):
                if event.key == K_TAB:
                    active_field = "password" if active_field == "username" else "username"
                elif event.key == K_BACKSPACE:
                    if active_field == "username":
                        username = username[:-1]
                    else:
                        password = password[:-1]
                elif event.key == K_RETURN or event.key == K_KP_ENTER:
                    if state == STATE_REGISTER:
                        ok, msg = register(username.strip(), password)
                        message = msg
                        if ok:
                            state = STATE_MENU
                            username = ""
                            password = ""
                    else:  # LOGIN
                        ok, data_or_msg = login(username.strip(), password)
                        if ok:
                            player_data = data_or_msg
                            logged_in_user = username.strip()
                            message = f"Привет, {logged_in_user}!"
                            state = STATE_GAME

                            # Здесь создаём игрока, когда будет модуль player.py
                            # player = Player(
                            #     x=player_data.get("position", [100, 100])[0],
                            #     y=player_data.get("position", [100, 100])[1],
                            #     skin=player_data["skins"][0] if player_data["skins"] else "default"
                            # )
                        else:
                            message = data_or_msg
                else:
                    if event.unicode.isprintable() and len(event.unicode.strip()) > 0:
                        if active_field == "username":
                            username += event.unicode
                        else:
                            password += event.unicode

            # В игре — возврат в меню
            elif state == STATE_GAME:
                if event.key == K_r:
                    state = STATE_MENU
                    username = ""
                    password = ""
                    logged_in_user = None
                    player_data = None
                    player = None

    screen.fill((18, 18, 45))

    if state == STATE_MENU:
        title = font.render("МОЯ ИГРА", True, (90, 180, 255))
        screen.blit(title, (WIDTH//2 - title.get_width()//2, 120))

        txt1 = small_font.render("1 — Регистрация", True, (220, 220, 220))
        txt2 = small_font.render("2 — Вход", True, (220, 220, 220))
        screen.blit(txt1, (WIDTH//2 - txt1.get_width()//2, 280))
        screen.blit(txt2, (WIDTH//2 - txt2.get_width()//2, 340))

        hint = small_font.render("Нажми 1 или 2", True, (140, 140, 140))
        screen.blit(hint, (WIDTH//2 - hint.get_width()//2, 420))

        if keys[K_1]: 
            state = STATE_REGISTER
            message = ""
        if keys[K_2]: 
            state = STATE_LOGIN
            message = ""

    elif state in (STATE_REGISTER, STATE_LOGIN):
        tit = "Регистрация" if state == STATE_REGISTER else "Вход"
        title = font.render(tit, True, (90, 180, 255))
        screen.blit(title, (WIDTH//2 - title.get_width()//2, 80))

        ul = small_font.render("Логин:", True, (210, 210, 210))
        pl = small_font.render("Пароль:", True, (210, 210, 210))
        screen.blit(ul, (180, 180))
        screen.blit(pl, (180, 250))

        u_text = username + ("|" if active_field == "username" else "")
        p_text = "*" * len(password) + ("|" if active_field == "password" else "")

        u_surf = font.render(u_text, True, (255, 255, 255))
        p_surf = font.render(p_text, True, (255, 255, 255))
        screen.blit(u_surf, (320, 175))
        screen.blit(p_surf, (320, 245))

        col = (255, 80, 80) if "ошиб" in message.lower() or "неверн" in message.lower() else (80, 255, 80)
        msg_surf = small_font.render(message, True, col)
        screen.blit(msg_surf, (WIDTH//2 - msg_surf.get_width()//2, 380))

    elif state == STATE_GAME:
        # Пока просто заглушка — позже здесь будет игрок, уровни, перки и т.д.
        welcome = font.render(f"Привет, {logged_in_user}!", True, (100, 255, 120))
        screen.blit(welcome, (WIDTH//2 - welcome.get_width()//2, 180))

        info = small_font.render("Пока пустой режим игры", True, (180, 180, 220))
        screen.blit(info, (WIDTH//2 - info.get_width()//2, 280))

        lvl = small_font.render(f"Уровень: {player_data.get('level', 1)}", True, (220, 220, 100))
        screen.blit(lvl, (WIDTH//2 - lvl.get_width()//2, 340))

        hint = small_font.render("R — вернуться в меню", True, (140, 140, 140))
        screen.blit(hint, (WIDTH//2 - hint.get_width()//2, 500))

        # Когда добавишь player.py — раскомментируй здесь:
        # if player:
        #     player.update(keys)
        #     player.draw(screen)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()
