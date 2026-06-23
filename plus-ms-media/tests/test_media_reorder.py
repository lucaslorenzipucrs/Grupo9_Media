from app.models.media_model import MediaModel
from conftest import insert_media


def test_admin_reorder_valid_payload_updates_orders(
    client,
    db_session,
    admin_headers
):
    insert_media(db_session, "media-1", order=0)
    insert_media(db_session, "media-2", order=1)
    insert_media(db_session, "media-3", order=2)

    response = client.patch(
        "/products/Produto1/media/order",
        headers=admin_headers,
        json={
            "medias": [
                {"id": "media-3", "ordem": 0},
                {"id": "media-1", "ordem": 1},
                {"id": "media-2", "ordem": 2}
            ]
        }
    )

    assert response.status_code == 200
    assert [(media["id"], media["ordem"]) for media in response.json()] == [
        ("media-3", 0),
        ("media-1", 1),
        ("media-2", 2)
    ]

    db_medias = db_session.query(MediaModel).order_by(MediaModel.ordem).all()
    assert [(media.id, media.ordem) for media in db_medias] == [
        ("media-3", 0),
        ("media-1", 1),
        ("media-2", 2)
    ]


def test_reorder_rejects_duplicate_ids(client, db_session, admin_headers):
    insert_media(db_session, "media-1", order=0)
    insert_media(db_session, "media-2", order=1)

    response = client.patch(
        "/products/Produto1/media/order",
        headers=admin_headers,
        json={
            "medias": [
                {"id": "media-1", "ordem": 0},
                {"id": "media-1", "ordem": 1}
            ]
        }
    )

    assert response.status_code == 400
    assert "Duplicate media IDs" in response.json()["detail"]


def test_reorder_rejects_duplicate_orders(client, db_session, admin_headers):
    insert_media(db_session, "media-1", order=0)
    insert_media(db_session, "media-2", order=1)

    response = client.patch(
        "/products/Produto1/media/order",
        headers=admin_headers,
        json={
            "medias": [
                {"id": "media-1", "ordem": 0},
                {"id": "media-2", "ordem": 0}
            ]
        }
    )

    assert response.status_code == 400
    assert "Duplicate order values" in response.json()["detail"]


def test_reorder_rejects_non_sequential_orders(client, db_session, admin_headers):
    insert_media(db_session, "media-1", order=0)
    insert_media(db_session, "media-2", order=1)

    response = client.patch(
        "/products/Produto1/media/order",
        headers=admin_headers,
        json={
            "medias": [
                {"id": "media-1", "ordem": 1},
                {"id": "media-2", "ordem": 2}
            ]
        }
    )

    assert response.status_code == 400
    assert "sequential starting from 0" in response.json()["detail"]


def test_reorder_rejects_missing_product_media(client, db_session, admin_headers):
    insert_media(db_session, "media-1", order=0)
    insert_media(db_session, "media-2", order=1)
    insert_media(db_session, "media-3", order=2)

    response = client.patch(
        "/products/Produto1/media/order",
        headers=admin_headers,
        json={
            "medias": [
                {"id": "media-1", "ordem": 0},
                {"id": "media-2", "ordem": 1}
            ]
        }
    )

    assert response.status_code == 400
    assert "must include all media items" in response.json()["detail"]


def test_reorder_rejects_unknown_id(client, db_session, admin_headers):
    insert_media(db_session, "media-1", order=0)

    response = client.patch(
        "/products/Produto1/media/order",
        headers=admin_headers,
        json={
            "medias": [
                {"id": "unknown", "ordem": 0}
            ]
        }
    )

    assert response.status_code == 400
    assert "were not found" in response.json()["detail"]
