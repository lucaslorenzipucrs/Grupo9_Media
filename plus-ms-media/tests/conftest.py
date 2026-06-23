import sys
from datetime import datetime
from datetime import timezone
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = PROJECT_ROOT / "src"
sys.path.insert(0, str(SRC_DIR))

from app.config.security import create_access_token
from app.controllers.media_controller import router as media_router
from app.database.connection import Base
from app.database.connection import get_db
from app.models.media_model import MediaModel


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine
    )

    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    app = FastAPI()
    app.include_router(media_router)

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def admin_headers():
    token = create_access_token({
        "sub": "admin@example.com",
        "user_id": 1,
        "role": "admin"
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def vendedor_headers():
    token = create_access_token({
        "sub": "vendedor@example.com",
        "user_id": 2,
        "role": "vendedor"
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def storage_calls(monkeypatch):
    calls = {
        "uploads": [],
        "deletes": []
    }

    def fake_upload_file(file_obj, object_key, content_type):
        calls["uploads"].append({
            "object_key": object_key,
            "content_type": content_type
        })
        return object_key

    def fake_delete_file(object_key):
        calls["deletes"].append(object_key)

    monkeypatch.setattr(
        "app.services.media_service.StorageService.upload_file",
        fake_upload_file
    )
    monkeypatch.setattr(
        "app.services.media_service.StorageService.delete_file",
        fake_delete_file
    )

    return calls


def insert_media(
    db_session,
    media_id: str,
    product_id: str = "Produto1",
    variation_id: str | None = None,
    object_key: str | None = None,
    order: int = 0
) -> MediaModel:
    now = datetime.now(timezone.utc)
    media = MediaModel(
        id=media_id,
        id_produto=product_id,
        id_variacao=variation_id,
        caminho_arquivo=object_key or f"products/{product_id}/media/{media_id}.jpg",
        ordem=order,
        data_criacao=now,
        data_atualizacao=now
    )
    db_session.add(media)
    db_session.commit()
    db_session.refresh(media)
    return media
