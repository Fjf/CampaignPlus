from typing import List, Tuple

from server.lib.database import request_session
from server.lib.model.models import PlayerModel, ItemModel, WeaponModel


def get_all_items(player: PlayerModel) -> List[Tuple[ItemModel, WeaponModel]]:
    db = request_session()

    return db.query(ItemModel, WeaponModel) \
        .filter(ItemModel.playthrough_id == player.playthrough_id or ItemModel.playthrough_id == -1) \
        .join(WeaponModel, WeaponModel.item_id == ItemModel.id, isouter=True) \
        .all()

