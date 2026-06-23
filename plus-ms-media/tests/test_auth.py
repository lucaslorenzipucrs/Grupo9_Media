from conftest import insert_media


def test_get_media_without_token_is_rejected(client):
    response = client.get("/products/Produto1/media")

    assert response.status_code in (401, 403)


def test_vendedor_cannot_create_media(client, vendedor_headers, storage_calls):
    response = client.post(
        "/media",
        headers=vendedor_headers,
        data={"id_produto": "Produto1"},
        files={"arquivo": ("foto.jpg", b"image-bytes", "image/jpeg")}
    )

    assert response.status_code == 403
    assert storage_calls["uploads"] == []


def test_vendedor_cannot_delete_media(
    client,
    db_session,
    vendedor_headers,
    storage_calls
):
    insert_media(db_session, "media-1")

    response = client.delete(
        "/media/media-1",
        headers=vendedor_headers
    )

    assert response.status_code == 403
    assert storage_calls["deletes"] == []


def test_vendedor_cannot_reorder_media(client, vendedor_headers):
    response = client.patch(
        "/products/Produto1/media/order",
        headers=vendedor_headers,
        json={"medias": [{"id": "media-1", "ordem": 0}]}
    )

    assert response.status_code == 403
