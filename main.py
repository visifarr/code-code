# main.py
# Полная версия с интеграцией всех модулей и меню выбора режима

import sys
import subprocess
import pygame
from pygame.locals import *

# Авто-установка pygame
def install_pygame():
    try:
        import pygame
    except ImportError:
        print("pygame не найден → устанавливаю...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pygame==2.6.0"])
        import pygame

install_pygame()

# Импорты всех модулей
from scripts.registration import register, login
from scripts.player import Player
from scripts.saving import save_progress, load_progress
from scripts.bonuses_perks import unlock_random_perk, activate_random_bonus, update_bonuses, get_perks_list, get_active_bonuses
from scripts.storyline import story_manager
from scripts.animations import particle_system
from scripts.sounds import sound_manager
from scripts.game_modes import create_mode
from scripts.unique_systems import echo_system, gravity_morph, quantum_sys, emotion_boost
from scripts.enemies import enemy_manager

pygame.init()

WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Твоя Игра")
clock = pygame.time.Clock()

font = pygame.font.SysFont("arial", 36, bold=True)
small_font = pygame.font.SysFont("arial", 24)

# Состояния
STATE_MENU      = 0
STATE_REGISTER  = 1
STATE_LOGIN     = 2
STATE_GAME      = 3
STATE_MODE_SELECT = 4  # Новое состояние: выбор режима

state = STATE_MENU

# Ввод
username = ""
password = ""
message = ""
active_field = "username"

logged_in_user = None
player_data = None
player = None
current_mode = None

running = True
while running:
    keys = pygame.key.get_pressed()
    dt = clock.tick(60) / 1000.0

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
                elif event.key == K_RETURN or event.key == K_KP_ENTER:
                    if state == STATE_REGISTER:
                        ok, msg = register(username.strip(), password)
                        message = msg
                        if ok:
                            state = STATE_MENU
                            username = ""
                            password = ""
                    else:
                        ok, data_or_msg = login(username.strip(), password)
                        if ok:
                            player_data = data_or_msg
                            logged_in_user = username.strip()
                            full_data = load_progress(logged_in_user)
                            player_data.update(full_data)

                            state = STATE_MODE_SELECT  # Переходим к выбору режима
                        else:
                            message = data_or_msg
                else:
                    if event.unicode.isprintable() and len(event.unicode.strip()) > 0:
                        if active_field == "username":
                            username += event.unicode
                        else:
                            password += event.unicode

            elif state == STATE_MODE_SELECT:
                if event.key == K_1:
                    current_mode = create_mode("story")
                    player = Player(x=player_data.get("x", 200), y=player_data.get("y", 300), skin=player_data.get("skin", "default"))
                    state = STATE_GAME
                elif event.key == K_2:
                    current_mode = create_mode("survival")
                    player = Player(x=player_data.get("x", 200), y=player_data.get("y", 300), skin=player_data.get("skin", "default"))
                    state = STATE_GAME
                elif event.key == K_3:
                    current_mode = create_mode("arcade")
                    player = Player(x=player_data.get("x", 200), y=player_data.get("y", 300), skin=player_data.get("skin", "default"))
                    state = STATE_GAME

            elif state == STATE_GAME:
                if event.key == K_r:
                    # Сохраняем перед выходом
                    if player and logged_in_user:
                        progress = player.get_save_data()
                        progress["level"] = player_data.get("level", 1)
                        progress["perks"] = get_perks_list(player)
                        save_progress(logged_in_user, progress)
                    state = STATE_MENU
                    logged_in_user = None
                    player = None
                    current_mode = None
                    sound_manager.stop_music()

    screen.fill((18, 18, 45))

    if state == STATE_MENU:
        title = font.render("МОЯ ИГРА", True, (90, 180, 255))
        screen.blit(title, (WIDTH//2 - title.get_width()//2, 120))

        txt1 = small_font.render("1 — Регистрация", True, (220, 220, 220))
        txt2 = small_font.render("2 — Вход", True, (220, 220, 220))
        screen.blit(txt1, (WIDTH//2 - txt1.get_width()//2, 280))
        screen.blit(txt2, (WIDTH//2 - txt2.get_width()//2, 340))

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

    elif state == STATE_MODE_SELECT:
        title = font.render("Выбери режим", True, (90, 180, 255))
        screen.blit(title, (WIDTH//2 - title.get_width()//2, 120))

        txt1 = small_font.render("1 — Сюжетный режим", True, (220, 220, 220))
        txt2 = small_font.render("2 — Выживание", True, (220, 220, 220))
        txt3 = small_font.render("3 — Аркада", True, (220, 220, 220))
        screen.blit(txt1, (WIDTH//2 - txt1.get_width()//2, 220))
        screen.blit(txt2, (WIDTH//2 - txt2.get_width()//2, 270))
        screen.blit(txt3, (WIDTH//2 - txt3.get_width()//2, 320))

    elif state == STATE_GAME:
        if player:
            player.update(keys)

            # Уникальные механики
            echo_system.record(player)
            gravity_morph.update(dt, player)
            quantum_sys.update(player)
            emotion_boost.update(dt, player)

            # Частицы
            particle_system.update(dt)

            # Бонусы
            update_bonuses(player)

            # Враги
            enemy_manager.update(player, dt)

            # Сюжет и режим
            current_mode.update(player, dt, keys, {"level": player_data.get("level", 1)})

            # Звук шагов
            if keys[K_a] or keys[K_d] or keys[K_LEFT] or keys[K_RIGHT]:
                sound_manager.play("step", volume=0.4)

        # Рисование
        pygame.draw.rect(screen, (80, 40, 0), (0, HEIGHT - 100, WIDTH, 100))  # пол

        if player:
            player.draw(screen)
            echo_system.draw_echo(screen, player.image)

        particle_system.draw(screen)

        enemy_manager.draw(screen)

        if current_mode:
            current_mode.draw_ui(screen, small_font)

        emotion_boost.draw_bar(screen)
        gravity_morph.draw_indicator(screen, small_font)

        info = small_font.render(f"{logged_in_user} | Жизни: {player.lives if player else '?'} | Перки: {', '.join(get_perks_list(player))[:50]}...", True, (220, 220, 100))
        screen.blit(info, (20, 20))

        hint = small_font.render("R — меню | SPACE — прыжок | A/D — движение", True, (180, 180, 220))
        screen.blit(hint, (WIDTH//2 - hint.get_width()//2, HEIGHT - 40))

    pygame.display.flip()

# Сохраняем при выходе
if player and logged_in_user:
    progress = player.get_save_data()
    progress["level"] = player_data.get("level", 1)
    progress["perks"] = get_perks_list(player)
    save_progress(logged_in_user, progress)

pygame.quit()
sys.exit()
