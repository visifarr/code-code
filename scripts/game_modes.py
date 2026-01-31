# scripts/game_modes.py
# Разные режимы игры: сюжет, выживание, аркада, пазл и т.д.

import random
import time

class GameMode:
    """Базовый класс для любого режима игры"""
    def __init__(self, name="Default"):
        self.name = name
        self.start_time = time.time()
        self.score = 0
        self.is_active = True

    def update(self, player, dt, keys, game_state):
        """Вызывается каждый кадр"""
        pass

    def draw_ui(self, surface, font):
        """Рисует специфический интерфейс режима"""
        pass

    def on_event(self, event):
        """Обработка событий (например, нажатия)"""
        pass

    def end_mode(self):
        self.is_active = False
        print(f"Режим {self.name} завершён")


class StoryMode(GameMode):
    """Режим сюжета — использует storyline.py"""
    def __init__(self):
        super().__init__("Story")
        from scripts.storyline import story_manager
        self.story = story_manager
        self.current_dialog_timer = 0

    def update(self, player, dt, keys, game_state):
        # Прогресс по сюжету
        self.story.check_objective(player, game_state)

        # Показ диалога первые 5 секунд уровня
        if not self.story.current_dialog_shown:
            self.current_dialog_timer += dt
            if self.current_dialog_timer > 5:
                self.story.current_dialog_shown = True

    def draw_ui(self, surface, font):
        self.story.show_dialog(surface, font)


class SurvivalMode(GameMode):
    """Режим выживания — враги спавнятся бесконечно, цель — продержаться как можно дольше"""
    def __init__(self):
        super().__init__("Survival")
        self.spawn_timer = 0
        self.spawn_interval = 3.0  # секунды между спавнами
        self.enemies = []  # список врагов (пока заглушка)

    def update(self, player, dt, keys, game_state):
        self.spawn_timer += dt
        if self.spawn_timer >= self.spawn_interval:
            self.spawn_timer = 0
            # Спавн "врага" (пока просто увеличиваем счётчик)
            self.score += 1
            self.spawn_interval = max(1.0, self.spawn_interval - 0.1)  # ускоряем со временем

        # Пример: если игрок "умирает" — конец режима
        if player.lives <= 0:
            self.end_mode()

    def draw_ui(self, surface, font):
        time_survived = int(time.time() - self.start_time)
        surf = font.render(f"Время выживания: {time_survived} сек | Врагов: {self.score}", True, (255, 100, 100))
        surface.blit(surf, (20, 20))


class ArcadeMode(GameMode):
    """Аркадный режим — собирай очки, избегай препятствий, бесконечный"""
    def __init__(self):
        super().__init__("Arcade")
        self.coins = 0
        self.speed_multiplier = 1.0

    def update(self, player, dt, keys, game_state):
        # Пример: каждые 10 секунд ускоряем игру
        if int(time.time() - self.start_time) % 10 == 0 and int(time.time() - self.start_time) > 0:
            self.speed_multiplier += 0.2
            player.speed = 6 * self.speed_multiplier

        # Собирание "монет" (заглушка — можно добавить реальные объекты)
        if random.random() < 0.01:  # шанс "подобрать монету"
            self.coins += 1

    def draw_ui(self, surface, font):
        surf = font.render(f"Монеты: {self.coins} | Скорость: x{self.speed_multiplier:.1f}", True, (255, 215, 0))
        surface.blit(surf, (20, 20))


# Словарь режимов для быстрого выбора
MODES = {
    "story": StoryMode,
    "survival": SurvivalMode,
    "arcade": ArcadeMode,
    # Добавляй новые: "puzzle": PuzzleMode, "boss": BossRushMode и т.д.
}

def create_mode(mode_name):
    if mode_name in MODES:
        return MODES[mode_name]()
    return GameMode("Unknown")
