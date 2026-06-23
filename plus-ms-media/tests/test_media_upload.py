from app.models.media_model import MediaModel


def test_admin_upload_creates_media_and_object_key(
    client,
    db_session,
    admin_headers,
    storage_calls
):
    response = client.post(
        "/media",
        headers=admin_headers,
        data={"id_produto": "Produto1"},
        files={"arquivo": ("foto-original.jpg", b"image-bytes", "image/jpeg")}
    )

    assert response.status_code == 201

    body = response.json()
    assert body["id_produto"] == "Produto1"
    assert body["id_variacao"] is None
    assert body["ordem"] == 0
    assert body["caminho_arquivo"].startswith("products/Produto1/media/")
    assert body["caminho_arquivo"].endswith(".jpg")
    assert "foto-original" not in body["caminho_arquivo"]

    assert storage_calls["uploads"] == [{
        "object_key": body["caminho_arquivo"],
        "content_type": "image/jpeg"
    }]

    media = db_session.query(MediaModel).filter(MediaModel.id == body["id"]).first()
    assert media is not None
    assert media.caminho_arquivo == body["caminho_arquivo"]


def test_admin_upload_with_variation_uses_variation_path(
    client,
    admin_headers,
    storage_calls
):
    response = client.post(
        "/media",
        headers=admin_headers,
        data={
            "id_produto": "Produto1",
            "id_variacao": "variacao-0"
        },
        files={"arquivo": ("foto.png", b"image-bytes", "image/png")}
    )

    assert response.status_code == 201

    body = response.json()
    assert body["id_variacao"] == "variacao-0"
    assert body["caminho_arquivo"].startswith(
        "products/Produto1/variations/variacao-0/"
    )
    assert body["caminho_arquivo"].endswith(".png")
    assert storage_calls["uploads"][0]["object_key"] == body["caminho_arquivo"]


def test_upload_assigns_next_order_for_same_product(
    client,
    admin_headers,
    storage_calls
):
    first = client.post(
        "/media",
        headers=admin_headers,
        data={"id_produto": "Produto1"},
        files={"arquivo": ("a.jpg", b"a", "image/jpeg")}
    )
    second = client.post(
        "/media",
        headers=admin_headers,
        data={"id_produto": "Produto1"},
        files={"arquivo": ("b.jpg", b"b", "image/jpeg")}
    )

    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["ordem"] == 0
    assert second.json()["ordem"] == 1
    assert len(storage_calls["uploads"]) == 2
