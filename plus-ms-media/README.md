# MS3 Media Service

Microsserviço responsável pelo gerenciamento de imagens de produtos e suas variações.

## Stack

Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Amazon S3 compatível via Ministack, Docker

## Como executar

```bash
cd plus-infra
docker compose up
```

O serviço sobe na porta **3003**. Documentação interativa disponível em `http://localhost:3003/docs`.

## Autenticação

Todas as rotas exigem token JWT no header da requisição.

```
Authorization: Bearer <token>
```

O token é obtido através do MS Auth (porta 3001). Existem dois perfis: `admin` e `vendedor`.

## Rotas

### POST /media

Faz upload de uma imagem e associa ao produto. Requer perfil admin.

Corpo da requisição (multipart/form-data):

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| arquivo | file | sim | Arquivo de imagem |
| id_produto | string | sim | ID do produto |
| id_variacao | string | não | ID da variação (ex: cor-preta) |

### GET /products/{product_id}/media

Retorna todas as mídias de um produto ordenadas pelo campo `ordem`. Aceita o query param opcional `id_variacao` para filtrar por variação específica.

Exemplo: `GET /products/Produto1/media?id_variacao=cor-preta`

### GET /media/{media_id}

Retorna os metadados de uma mídia específica pelo UUID.

### DELETE /media/{media_id}

Remove a mídia do storage S3 e do banco de dados. Reorganiza automaticamente a ordem das mídias restantes. Requer perfil admin.

### PATCH /products/{product_id}/media/order

Redefine a ordem de exibição das mídias de um produto. O payload deve conter todos os IDs do produto com ordens sequenciais iniciando em 0.

Exemplo de corpo:

```json
{
  "medias": [
    { "id": "550e8400-e29b-41d4-a716-446655440000", "ordem": 0 },
    { "id": "660e8400-e29b-41d4-a716-446655440001", "ordem": 1 }
  ]
}
```

## Credenciais de desenvolvimento

| Perfil | Email | Senha |
|---|---|---|
| Admin | admindev@admin.com | Senha123 |
| Vendedor | vendedordev@vendedor.com | Senha123 |

## Testes

```bash
cd plus-ms-media
pip install -r requirements.txt
pytest tests/
```
