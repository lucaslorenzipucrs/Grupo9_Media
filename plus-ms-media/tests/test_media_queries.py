from conftest import insert_media


def test_get_media_by_id(client, db_session, vendedor_headers):
    media = insert_media(
        db_session,
        "media-1",
        product_id="Produto1",
        object_key="products/Produto1/media/media-1.jpg",
        order=0
    )

    response = client.get(
        f"/media/{media.id}",
        headers=vendedor_headers
    )

    assert response.status_code == 200
    assert response.json()["id"] == "media-1"
    assert response.json()["caminho_arquivo"] == "products/Produto1/media/media-1.jpg"


def test_get_media_by_id_not_found(client, vendedor_headers):
    response = client.get(
        "/media/missing",
        headers=vendedor_headers
    )

    assert response.status_code == 404


def test_get_media_by_product_returns_only_product_ordered(
    client,
    db_session,
    vendedor_headers
):
    insert_media(db_session, "media-2", product_id="Produto1", order=1)
    insert_media(db_session, "media-1", product_id="Produto1", order=0)
    insert_media(db_session, "media-other", product_id="OutroProduto", order=0)

    response = client.get(
        "/products/Produto1/media",
        headers=vendedor_headers
    )

    assert response.status_code == 200
    assert [media["id"] for media in response.json()] == ["media-1", "media-2"]
