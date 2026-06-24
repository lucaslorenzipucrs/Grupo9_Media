# plus-mfe-media

Microfrontend do **Media Service** do Grupo 9. Expoe uma interface React + TypeScript + MUI para gerenciar imagens de produtos, variacoes visuais e ordem de exibicao.

## Funcionalidades

- Busca da galeria por ID do produto.
- Upload de imagem com `id_produto` e `id_variacao` opcional.
- Listagem das midias retornadas pelo `plus-ms-media`.
- Reordenacao por controles de subir/descer.
- Persistencia da ordem via endpoint do microsservico.
- Exclusao de midia.
- Consumo de JWT salvo no `localStorage` pelo MFE de auth.

## Module Federation

| Propriedade | Valor |
|---|---|
| Nome | `mfe_media` |
| Entry point | `http://localhost:4002/assets/remoteEntry.js` |
| Expoe | `./MediaDashboardPage` |
| Arquivo | `src/pages/MediaDashboardPage.tsx` |

## Variaveis de Ambiente

| Variavel | Descricao | Padrao |
|---|---|---|
| `VITE_MS_MEDIA_URL` | URL do microsservico `plus-ms-media` | `http://localhost:3003` |
| `VITE_MEDIA_PUBLIC_BASE_URL` | Base publica para montar preview a partir de `caminho_arquivo` | vazio |

Para Ministack/LocalStack, uma base comum para preview e:

```bash
VITE_MEDIA_PUBLIC_BASE_URL=http://localhost:4566/plus-media
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

O servidor de desenvolvimento roda na porta `4002`.
