from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import Form
from fastapi import HTTPException
from fastapi import Response
from fastapi import UploadFile
from fastapi import status
from sqlalchemy.orm import Session
from typing import Optional

from app.database.connection import get_db
from app.dtos.media_DTOs import MediaResponseDTO
from app.dtos.media_DTOs import ReorderMediaDTO
from app.config.security import get_current_admin_user
from app.config.security import get_current_user
from app.services.media_service import MediaService

router = APIRouter(
    tags=["Media"]
)


@router.post(
    "/media",
    response_model=MediaResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Upload de mídia",
    description="Faz upload de uma imagem e associa ao produto (e opcionalmente a uma variação). **Requer perfil Admin.**",
)
def create_media(
    arquivo: UploadFile = File(..., description="Arquivo de imagem (jpg, png, webp...)"),
    id_produto: str = Form(..., description="ID do produto ao qual a mídia pertence", example="Produto1"),
    id_variacao: Optional[str] = Form(None, description="ID da variação (opcional). Ex.: cor-preta", example="cor-preta"),
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    return MediaService.create_media(
        arquivo,
        id_produto,
        id_variacao,
        db
    )


@router.get(
    "/products/{product_id}/media",
    response_model=list[MediaResponseDTO],
    summary="Listar mídias do produto",
    description="Retorna todas as mídias de um produto ordenadas por `ordem`. Use `id_variacao` para filtrar por variação específica.",
)
def get_media_by_product(
    product_id: str,
    id_variacao: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return MediaService.get_media_by_product(product_id, db, id_variacao)


@router.get(
    "/media/{media_id}",
    response_model=MediaResponseDTO,
    summary="Buscar mídia por ID",
    description="Retorna os metadados de uma mídia específica pelo seu UUID.",
)
def get_media(
    media_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    media = MediaService.get_media_by_id(media_id, db)
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    return media


@router.delete(
    "/media/{media_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remover mídia",
    description="Remove a mídia do S3 e do banco. Reorganiza automaticamente a ordem das mídias restantes. **Requer perfil Admin.**",
)
def delete_media(
    media_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    deleted = MediaService.delete_media(media_id, db)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch(
    "/products/{product_id}/media/order",
    response_model=list[MediaResponseDTO],
    summary="Reordenar mídias",
    description="Redefine a ordem de exibição das mídias de um produto. O payload deve conter **todos** os IDs do produto com ordens sequenciais iniciando em 0.",
)
def reorder_media(
    product_id: str,
    reorder_payload: ReorderMediaDTO,
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    try:
        return MediaService.reorder_media(product_id, reorder_payload, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
