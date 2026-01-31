# scripts/saving.py
# Сохранение и загрузка прогресса игрока

import json
import os
from scripts.registration import load_players, save_players  # берём функции из registration.py

def save_progress(username, progress_data):
    """
    Сохраняет прогресс конкретного игрока.
    progress_data — словарь с данными (позиция, уровень, перки, скины и т.д.)
    """
    players = load_players()
    if username not in players:
        return False, "Игрок не найден"

    players[username].update(progress_data)
    save_players(players)
    return True, "Прогресс сохранён"

def load_progress(username):
    """
    Загружает весь прогресс игрока.
    Возвращает словарь или пустой {}, если ничего нет.
    """
    players = load_players()
    if username in players:
        # Возвращаем только прогресс-часть, без пароля и т.д.
        data = players[username].copy()
        data.pop("password", None)  # не отдаём пароль
        return data
    return {}

def autosave(username, get_current_progress_func):
    """
    Пример функции для автосейва (вызывай в отдельном потоке, если хочешь).
    get_current_progress_func — функция, которая возвращает актуальный словарь прогресса.
    """
    import time
    import threading

    def saver():
        while True:
            time.sleep(300)  # каждые 5 минут
            progress = get_current_progress_func()
            save_progress(username, progress)

    thread = threading.Thread(target=saver, daemon=True)
    thread.start()
