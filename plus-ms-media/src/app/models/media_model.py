from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import DateTime

from app.database.connection import Base


class MediaModel(Base):
    __tablename__ = "media"

    id = Column(String, primary_key=True)

    id_produto = Column(
        String,
        nullable=False,
        index=True
    )

    id_variacao = Column(
        String,
        nullable=True
    )

    caminho_arquivo = Column(
        String,
        nullable=False
    )

    ordem = Column(
        Integer,
        nullable=False,
        default=0
    )

    data_criacao = Column(
        DateTime,
        nullable=False
    )

    data_atualizacao = Column(
        DateTime,
        nullable=False
    )