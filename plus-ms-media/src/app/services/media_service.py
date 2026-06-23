from uuid import uuid4
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.media_model import MediaModel
from app.dtos.media_DTOs import CreateMediaDTO
from app.dtos.media_DTOs import ReorderMediaDTO


class MediaService:

    @staticmethod
    def create_media(
        media_data: CreateMediaDTO,
        db: Session
    ):
        max_order = db.query(func.max(MediaModel.ordem))\
            .filter(MediaModel.id_produto == media_data.id_produto)\
            .scalar()

        media = MediaModel(
            id=str(uuid4()),
            id_produto=media_data.id_produto,
            id_variacao=media_data.id_variacao,
            caminho_arquivo=media_data.caminho_arquivo,
            ordem=0 if max_order is None else max_order + 1,
            data_criacao=datetime.utcnow(),
            data_atualizacao=datetime.utcnow()
        )

        db.add(media)
        db.commit()
        db.refresh(media)

        return media

    @staticmethod
    def get_media_by_id(
        media_id: str,
        db: Session
    ):
        return db.query(MediaModel)\
            .filter(MediaModel.id == media_id)\
            .first()

    @staticmethod
    def get_media_by_product(
        product_id: str,
        db: Session
    ):
        return db.query(MediaModel)\
            .filter(MediaModel.id_produto == product_id)\
            .order_by(MediaModel.ordem)\
            .all()

    @staticmethod
    def delete_media(
        media_id: str,
        db: Session
    ):
        media = db.query(MediaModel)\
            .filter(MediaModel.id == media_id)\
            .first()

        if not media:
            return None

        product_id = media.id_produto
        deleted_order = media.ordem

        db.delete(media)

        remaining_medias = db.query(MediaModel)\
            .filter(
                MediaModel.id_produto == product_id,
                MediaModel.ordem > deleted_order
            )\
            .order_by(MediaModel.ordem)\
            .all()

        for remaining in remaining_medias:
            remaining.ordem -= 1 # type: ignore
            remaining.data_atualizacao = datetime.now() # type: ignore

        db.commit()

        return True

    @staticmethod
    def reorder_media(
        product_id: str,
        reorder_data: ReorderMediaDTO,
        db: Session
    ):
        if not reorder_data.medias:
            return MediaService.get_media_by_product(product_id, db)

        payload_ids = [item.id for item in reorder_data.medias]
        payload_orders = [item.ordem for item in reorder_data.medias]

        if len(payload_ids) != len(set(payload_ids)):
            raise ValueError("Duplicate media IDs are not allowed in reorder payload.")
        if len(payload_orders) != len(set(payload_orders)):
            raise ValueError("Duplicate order values are not allowed in reorder payload.")
        
        expected_orders = set(range(len(payload_orders)))
        if set(payload_orders) != expected_orders:
            raise ValueError(
                "Order values must be sequential starting from 0."
            )
        
        existing_medias = db.query(MediaModel)\
            .filter(MediaModel.id.in_(payload_ids))\
            .all()

        if len(existing_medias) != len(payload_ids):
            raise ValueError("One or more media IDs were not found.")

        all_product_media = db.query(MediaModel.id)\
            .filter(MediaModel.id_produto == product_id)\
            .all()
        all_product_ids = {media_id for media_id, in all_product_media}

        if set(payload_ids) != all_product_ids:
            raise ValueError("Reorder payload must include all media items for the product.")

        order_map = {item.id: item.ordem for item in reorder_data.medias}

        for media in existing_medias:
            media.ordem = order_map[media.id]
            media.data_atualizacao = datetime.utcnow()

        db.commit()

        return MediaService.get_media_by_product(product_id, db)
