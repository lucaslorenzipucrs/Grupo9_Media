from os.path import splitext
from typing import Optional
from uuid import uuid4
from datetime import datetime
from datetime import timezone

from fastapi import UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.media_model import MediaModel
from app.dtos.media_DTOs import ReorderMediaDTO
from app.services.storage_service import StorageService


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class MediaService:

    @staticmethod
    def _build_object_key(
        media_id: str,
        id_produto: str,
        id_variacao: Optional[str],
        filename: Optional[str]
    ) -> str:
        extension = splitext(filename or "")[1].lower()

        if id_variacao:
            return f"products/{id_produto}/variations/{id_variacao}/{media_id}{extension}"

        return f"products/{id_produto}/media/{media_id}{extension}"

    @staticmethod
    def create_media(
        arquivo: UploadFile,
        id_produto: str,
        id_variacao: Optional[str],
        db: Session
    ):
        max_order = db.query(func.max(MediaModel.ordem))\
            .filter(MediaModel.id_produto == id_produto)\
            .scalar()

        media_id = str(uuid4())
        object_key = MediaService._build_object_key(
            media_id,
            id_produto,
            id_variacao,
            arquivo.filename
        )
        content_type = arquivo.content_type or "application/octet-stream"

        StorageService.upload_file(
            arquivo.file,
            object_key,
            content_type
        )

        now = utc_now()
        media = MediaModel(
            id=media_id,
            id_produto=id_produto,
            id_variacao=id_variacao,
            caminho_arquivo=object_key,
            ordem=0 if max_order is None else max_order + 1,
            data_criacao=now,
            data_atualizacao=now
        )

        try:
            db.add(media)
            db.commit()
            db.refresh(media)
        except Exception:
            db.rollback()
            StorageService.delete_file(object_key)
            raise

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
        db: Session,
        id_variacao: Optional[str] = None
    ):
        query = db.query(MediaModel)\
            .filter(MediaModel.id_produto == product_id)

        if id_variacao:
            query = query.filter(MediaModel.id_variacao == id_variacao)

        return query.order_by(MediaModel.ordem).all()

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
        object_key = media.caminho_arquivo
        
        try:
            StorageService.delete_file(object_key) # type: ignore

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
                remaining.data_atualizacao = utc_now() # type: ignore

            db.commit()
        except Exception:
            db.rollback()
            raise

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
            media.data_atualizacao = utc_now()

        db.commit()

        return MediaService.get_media_by_product(product_id, db)
