# main.py — стартовый файл игры

import sys
import subprocess

def install_pygame():
    try:
        import pygame
        print("Pygame уже установлен, отлично!")
    except ImportError:
        print("Pygame не найден. Устанавливаю автоматически...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pygame==2.6.0"])
            print("Pygame успешно установлен!")
            import pygame  # теперь импортируем после установки
        except Exception as e:
            print("Ошибка установки pygame:", e)
            print("Попробуй установить вручную: python -m pip install pygame")
            sys.exit(1)

# Запускаем проверку
install_pygame()

# Дальше — твой код игры
print("Добро пожаловать в игру! Pygame работает.")
# pygame.init()
# ... весь остальной код игры здесь ...
