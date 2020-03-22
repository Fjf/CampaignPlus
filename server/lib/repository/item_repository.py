from typing import List, Tuple, Optional

from server.lib.database import request_session
from server.lib.model.models import PlayerModel, ItemModel, WeaponModel


def get_all_items(player: Optional[PlayerModel]) -> List[Tuple[ItemModel, WeaponModel]]:
    db = request_session()

    campaign_id = -1 if player is None else player.playthrough_id

    return db.query(ItemModel, WeaponModel) \
        .filter((ItemModel.playthrough_id == campaign_id) or (ItemModel.playthrough_id == -1)) \
        .join(WeaponModel, WeaponModel.item_id == ItemModel.id, isouter=True) \
        .all()
