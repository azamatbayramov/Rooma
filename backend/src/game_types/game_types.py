from enum import Enum


class GameType(Enum):
    HIDE_AND_SEEK = "hide_and_seek"


RULES = {
    GameType.HIDE_AND_SEEK: ("Players will be automatically divided into those who are looking and those who are "
                             "hiding. After the host starts the game, your role appears on the screen. If you are "
                             "hiding, you'll have their own unique qr code, which needs to be shown the one who "
                             "found you. If you are searching player, having found the player, you must find out "
                             "the qr code and enter it on the phone so that the found person is counted.")
}


def get_rules_by_game_type(game_type: GameType) -> str:
    return RULES[game_type]
