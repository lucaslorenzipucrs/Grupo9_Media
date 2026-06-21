from pydantic import BaseModel
from typing import Optional


class CreateMediaDTO(BaseModel):
    id_produto: str
    id_variacao: Optional[str] = None
    caminho_arquivo: str


class MediaResponseDTO(BaseModel):
    id: str
    id_produto: str
    id_variacao: Optional[str]
    caminho_arquivo: str
    ordem: int