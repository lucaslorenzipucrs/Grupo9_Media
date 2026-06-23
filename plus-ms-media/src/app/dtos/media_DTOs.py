from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CreateMediaDTO(BaseModel):
    id_produto: str
    id_variacao: Optional[str] = None
    caminho_arquivo: str


class MediaOrderDTO(BaseModel):
    id: str
    ordem: int


class ReorderMediaDTO(BaseModel):
    medias: list[MediaOrderDTO]


class MediaResponseDTO(BaseModel):
    id: str
    id_produto: str
    id_variacao: Optional[str]
    caminho_arquivo: str
    ordem: int
    data_criacao: datetime
    data_atualizacao: datetime

    class Config:
        orm_mode = True
