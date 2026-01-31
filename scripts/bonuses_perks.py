# scripts/bonuses_perks.py
# Система бонусов (временные) и перков (постоянные улучшения)

import random
import time

class Perk:
    """Постоянный перк — применяется один раз и остаётся"""
    def __init__(self, name, description, effect_func):
        self.name = name
        self.description = description
        self.effect_func = effect_func  # функция, которая применится к игроку

    def apply(self, player):
        self.effect_func(player)


class Bonus:
    """Временный бонус — действует ограниченное время"""
    def __init__(self, name, duration_seconds, effect_func, end_func=None):
        self.name = name
        self.duration = duration_seconds
        self.effect_func = effect_func
        self.end_func = end_func or (lambda p: None)
        self.start_time = time.time()

    def is_active(self):
        return time.time() - self.start_time < self.duration

    def apply(self, player):
        self.effect_func(player)

    def update(self, player):
        if self.is_active():
            self.effect_func(player)  # можно обновлять каждый кадр
        else:
            self.end_func(player)


# Примеры перков (постоянные)
PERKS_POOL = [
    Perk(
        "Двойной прыжок",
        "Можешь прыгать два раза в воздухе",
        lambda p: setattr(p, "double_jump", True)
    ),
    Perk(
        "Быстрее ноги",
        "Скорость бега +50%",
        lambda p: setattr(p, "speed", p.speed * 1.5)
    ),
    Perk(
        "Железная кожа",
        "Жизней +2",
        lambda p: setattr(p, "max_lives", p.max_lives + 2) or setattr(p, "lives", p.lives + 2)
    ),
    Perk(
        "Невидимость на 5 сек",
        "При получении урона становишься невидимым на 5 секунд",
        lambda p: setattr(p, "invis_on_hit", True)
    ),
    Perk(
        "Мега-прыжок",
        "Прыжок в 2 раза выше",
        lambda p: setattr(p, "jump_power", p.jump_power * 2)
    )
]

# Примеры временных бонусов
BONUSES_POOL = [
    Bonus(
        "Скоростной режим",
        10,  # 10 секунд
        lambda p: setattr(p, "speed", p.speed * 2),
        lambda p: setattr(p, "speed", p.speed / 2)  # возвращаем назад
    ),
    Bonus(
        "Бессмертие",
        8,
        lambda p: setattr(p, "invincible", True),
        lambda p: setattr(p, "invincible", False)
    ),
    Bonus(
        "Магнит для монет",
        12,
        lambda p: setattr(p, "magnet_range", 150),
        lambda p: setattr(p, "magnet_range", 0)
    )
]


def unlock_random_perk(player):
    """Разблокировать случайный перк из пула (если ещё нет)"""
    if not hasattr(player, "perks"):
        player.perks = []

    available = [p for p in PERKS_POOL if p.name not in [perk.name for perk in player.perks]]
    if available:
        new_perk = random.choice(available)
        new_perk.apply(player)
        player.perks.append(new_perk)
        return new_perk.name
    return None


def activate_random_bonus(player):
    """Активировать случайный временный бонус"""
    if not hasattr(player, "active_bonuses"):
        player.active_bonuses = []

    bonus = random.choice(BONUSES_POOL)
    bonus.apply(player)
    player.active_bonuses.append(bonus)
    return bonus.name


def update_bonuses(player):
    """Вызывать каждый кадр в игре, чтобы обновлять/удалять временные бонусы"""
    if hasattr(player, "active_bonuses"):
        still_active = []
        for bonus in player.active_bonuses:
            bonus.update(player)
            if bonus.is_active():
                still_active.append(bonus)
        player.active_bonuses = still_active


def get_perks_list(player):
    """Для отображения в интерфейсе"""
    if not hasattr(player, "perks"):
        return []
    return [p.name for p in player.perks]


def get_active_bonuses(player):
    """Для отображения"""
    if not hasattr(player, "active_bonuses"):
        return []
    return [b.name for b in player.active_bonuses if b.is_active()]
