# Grupo 9 — Media Service

Trabalho da disciplina de Engenharia de Software II. O projeto implementa um microsserviço de gerenciamento de mídias de produtos integrado a uma arquitetura de microfrontends.

## Arquitetura

| Componente | Descrição | Porta |
|---|---|---|
| plus-shell | Shell App (Module Federation host) | 3000 |
| plus-ms-auth | Microsserviço de autenticação (Node.js) | 3001 |
| plus-ms-media | Microsserviço de mídias (FastAPI) | 3003 |
| plus-mfe-auth | Microfrontend de login e cadastro (React) | 4001 |
| plus-mfe-media | Microfrontend de galeria de mídias (React) | 4002 |
| ministack | Emulador local AWS S3 e RDS | 4566 |

## Pré-requisitos

Docker e Docker Compose instalados na máquina.

## Como executar

```bash
cd plus-infra
docker compose up
```

Para forçar rebuild completo das imagens:

```bash
cd plus-infra
docker compose down --rmi all --volumes
docker compose build --no-cache
docker compose up
```

Para rebuild de um único serviço:

```bash
docker compose build plus-ms-media
docker compose up -d --force-recreate plus-ms-media
```

## Acessos

| Serviço | URL |
|---|---|
| Shell App | http://localhost:3000 |
| Login e cadastro | http://localhost:4001 |
| Galeria de mídias | http://localhost:4002 |
| API Auth (Swagger) | http://localhost:3001/docs |
| API Media (Swagger) | http://localhost:3003/docs |
| S3 Ministack | http://localhost:4566 |

## Credenciais de desenvolvimento

| Perfil | Email | Senha |
|---|---|---|
| Admin | admindev@admin.com | Senha123 |
| Vendedor | vendedordev@vendedor.com | Senha123 |

O perfil admin pode fazer upload, remover e reordenar mídias. O perfil vendedor tem acesso somente leitura.

## Variáveis de ambiente

As variáveis ficam no arquivo `plus-infra/.env`. Um exemplo está em `plus-infra/.env.example`.

Variáveis relevantes:

| Variável | Valor padrão | Descrição |
|---|---|---|
| JWT_SECRET | dev-secret | Segredo compartilhado entre ms-auth e ms-media |
| MS_AUTH_PORT | 3001 | Porta do microsserviço de auth |
| MFE_AUTH_PORT | 4001 | Porta do MFE de auth |
| MFE_MEDIA_PORT | 4002 | Porta do MFE de mídia |
| SHELL_PORT | 3000 | Porta do shell app |

## Testes automatizados

Os testes do ms-media rodam via pytest e são executados automaticamente no CI (GitHub Actions) a cada push em `plus-ms-media/`.

Para rodar localmente:

```bash
cd plus-ms-media
pip install -r requirements.txt
pytest tests/
```

## CI/CD

O pipeline de build e publicação das imagens Docker fica em `.github/workflows/docker-publish.yml`. As imagens são publicadas no Docker Hub sob o namespace `garssa/` a cada push na branch main.
