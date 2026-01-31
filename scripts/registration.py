# scripts/registration.py
# Простая система регистрации и логина (хранит данные в JSON)

import json
import os
import hashlib

# Путь к файлу с игроками (относительно корня проекта)
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "databases", "players.json")

# Убедимся, что папка databases существует
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

def load_players():
    if os.path.exists(DB_PATH):
        with open(DB_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_players(players):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def register(username, password):
    if not username or not password:
        return False, "Заполни оба поля"
    players = load_players()
    if username in players:
        return False, "Имя уже занято"
    players[username] = {
        "password": hash_password(password),
        "level": 1,
        "skins": ["default"],
        "perks": [],
        "position": [100, 100]  # стартовая позиция
    }
    save_players(players)
    return True, "Регистрация прошла!"

def login(username, password):
    players = load_players()
    if username in players and players[username]["password"] == hash_password(password):
        return True, players[username]
    return False, "Неверный логин или пароль"
