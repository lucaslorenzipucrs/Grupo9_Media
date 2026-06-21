from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.services.media_service import MediaService
from app.dtos.media_DTOs import CreateMediaDTO

router = APIRouter(
    prefix="/media",
    tags=["Media"]
)


@router.post("/")
def create_media(
    media: CreateMediaDTO,
    db: Session = Depends(get_db)
):
    return MediaService.create_media(
        media,
        db
    )


@router.get("/{media_id}")
def get_media(
    media_id: str,
    db: Session = Depends(get_db)
):
    return MediaService.get_media_by_id(
        media_id,
        db
    )


@router.delete("/{media_id}")
def delete_media(
    media_id: str,
    db: Session = Depends(get_db)
):
    return MediaService.delete_media(
        media_id,
        db
    )


@router.get("/product/{product_id}")
def get_media_by_product(
    product_id: str,
    db: Session = Depends(get_db)
):
    return MediaService.get_media_by_product(
        product_id,
        db
    )