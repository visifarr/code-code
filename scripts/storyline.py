# scripts/storyline.py
# Простая сюжетная линия: уровни, диалоги, цели, события

class StoryLevel:
    def __init__(self, level_id, title, dialog, objective, reward=None):
        self.level_id = level_id
        self.title = title
        self.dialog = dialog  # текст, который показывается при входе
        self.objective = objective  # что нужно сделать
        self.reward = reward or []  # список наград (имена перков/бонусов/скинов)
        self.completed = False

    def check_complete(self, player, game_state):
        """Проверяет, выполнена ли цель уровня (переопределяй в подклассах)"""
        return False

    def on_complete(self, player):
        """Что происходит при завершении уровня"""
        self.completed = True
        print(f"Уровень {self.title} завершён!")
        # Здесь можно добавить перки, бонусы, скины и т.д.
        for rew in self.reward:
            print(f"Получена награда: {rew}")
            # Пример: if rew == "double_jump": player.double_jump = True


# Список уровней сюжета (можно расширять бесконечно)
STORY_LEVELS = [
    StoryLevel(
        level_id=1,
        title="Пробуждение",
        dialog="Ты просыпаешься в тёмной комнате. Где-то вдалеке слышен голос: 'Найди ключ к двери...'",
        objective="Найди и подбери ключ (нажми E рядом с ним)",
        reward=["Быстрее ноги", "Скоростной режим"]
    ),
    
    StoryLevel(
        level_id=2,
        title="Первый враг",
        dialog="Перед тобой появляется странное существо. Оно агрессивно... Придётся сражаться.",
        objective="Победить первого врага (пока просто коснись его)",
        reward=["Железная кожа"]
    ),
    
    StoryLevel(
        level_id=3,
        title="Тайный проход",
        dialog="Дверь открылась, но за ней — лабиринт. Собери 3 кристалла, чтобы открыть портал.",
        objective="Собрать 3 кристалла",
        reward=["Двойной прыжок", "Мега-прыжок"]
    ),
    
    StoryLevel(
        level_id=4,
        title="Босс тени",
        dialog="Ты дошёл до конца... Но тень ждёт тебя. Это финал этой главы.",
        objective="Победить босса (пока просто продержись 30 секунд)",
        reward=["Невидимость на 5 сек"]
    )
]


class StoryManager:
    def __init__(self):
        self.current_level_id = 1
        self.levels = {lvl.level_id: lvl for lvl in STORY_LEVELS}
        self.current_dialog_shown = False

    def get_current_level(self):
        return self.levels.get(self.current_level_id)

    def advance_level(self, player):
        if self.current_level_id < len(STORY_LEVELS):
            self.current_level_id += 1
            self.current_dialog_shown = False
            print(f"Переход на уровень {self.current_level_id}")
            return True
        print("Сюжет завершён!")
        return False

    def show_dialog(self, screen, font):
        level = self.get_current_level()
        if level and not self.current_dialog_shown:
            # Рисуем диалог внизу экрана
            dialog_surf = font.render(level.dialog, True, (255, 220, 100))
            title_surf = font.render(level.title, True, (200, 100, 255))
            screen.blit(title_surf, (20, HEIGHT - 120))
            screen.blit(dialog_surf, (20, HEIGHT - 80))
            # Чтобы не спамило каждый кадр — показываем один раз
            self.current_dialog_shown = True

    def check_objective(self, player, game_state):
        level = self.get_current_level()
        if level and level.check_complete(player, game_state):
            level.on_complete(player)
            self.advance_level(player)


# Глобальный менеджер сюжета (создавай один экземпляр в main.py)
story_manager = StoryManager()
