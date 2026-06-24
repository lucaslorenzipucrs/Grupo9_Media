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

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"id": "550e8400-e29b-41d4-a716-446655440000", "ordem": 0}
            ]
        }
    }


class ReorderMediaDTO(BaseModel):
    medias: list[MediaOrderDTO]

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "medias": [
                        {"id": "550e8400-e29b-41d4-a716-446655440000", "ordem": 0},
                        {"id": "660e8400-e29b-41d4-a716-446655440001", "ordem": 1},
                        {"id": "770e8400-e29b-41d4-a716-446655440002", "ordem": 2}
                    ]
                }
            ]
        }
    }


class MediaResponseDTO(BaseModel):
    id: str
    id_produto: str
    id_variacao: Optional[str]
    caminho_arquivo: str
    ordem: int
    data_criacao: datetime
    data_atualizacao: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "id_produto": "Produto1",
                    "id_variacao": "cor-preta",
                    "caminho_arquivo": "products/Produto1/variations/cor-preta/550e8400-e29b-41d4-a716-446655440000.jpg",
                    "ordem": 0,
                    "data_criacao": "2026-06-20T10:00:00Z",
                    "data_atualizacao": "2026-06-20T10:00:00Z"
                }
            ]
        }
    }
