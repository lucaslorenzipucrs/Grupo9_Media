from app.models.media_model import MediaModel
from conftest import insert_media


def test_admin_delete_removes_media_reorders_and_deletes_object(
    client,
    db_session,
    admin_headers,
    storage_calls
):
    insert_media(
        db_session,
        "media-1",
        object_key="products/Produto1/media/media-1.jpg",
        order=0
    )
    insert_media(
        db_session,
        "media-2",
        object_key="products/Produto1/media/media-2.jpg",
        order=1
    )
    insert_media(
        db_session,
        "media-3",
        object_key="products/Produto1/media/media-3.jpg",
        order=2
    )

    response = client.delete(
        "/media/media-2",
        headers=admin_headers
    )

    assert response.status_code == 204
    assert storage_calls["deletes"] == ["products/Produto1/media/media-2.jpg"]

    remaining = db_session.query(MediaModel)\
        .filter(MediaModel.id_produto == "Produto1")\
        .order_by(MediaModel.ordem)\
        .all()

    assert [(media.id, media.ordem) for media in remaining] == [
        ("media-1", 0),
        ("media-3", 1)
    ]


def test_delete_missing_media_returns_404(
    client,
    admin_headers,
    storage_calls
):
    response = client.delete(
        "/media/missing",
        headers=admin_headers
    )

    assert response.status_code == 404
    assert storage_calls["deletes"] == []
