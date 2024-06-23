from uuid import UUID

from beanie.operators import Eq

from src.database.models import Game, User
from src.database.repository.mongo import MongoBeanieRepository


class GameRepository(MongoBeanieRepository):
    model = Game

    async def get_one_by_game_id(self, game_id: UUID) -> Game | None:
        return await self.model.find_one({"game_id": game_id})

    async def add_user_to_lobby(self, game_id: UUID, user: User) -> None:
        game = await self.get_one_by_game_id(game_id)
        if not game:
            return
        if user in game.lobby:
            return
        game.lobby.append(user)
        _ = await game.save()

    async def get_all_users_from_lobby(self, game_id: UUID) -> list[User]:
        game = await self.get_one_by_game_id(game_id)
        if not game:
            return []
        return game.lobby

    async def get_all_active(self) -> list[Game]:
        return await self.model.find(Eq(Game.is_active, True)).to_list()
