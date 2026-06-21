from uuid import uuid4
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.media_model import MediaModel
from app.dtos.media_DTOs import CreateMediaDTO


class MediaService:

    @staticmethod
    def create_media(
        media_data: CreateMediaDTO,
        db: Session
    ):

        media = MediaModel(
            id=str(uuid4()),
            id_produto=media_data.id_produto,
            id_variacao=media_data.id_variacao,
            caminho_arquivo=media_data.caminho_arquivo,
            ordem=0,
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
            .filter(
                MediaModel.id_produto == product_id
            )\
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

        db.delete(media)
        db.commit()

        return True