export interface MediaItem {
  id: string;
  id_produto: string;
  id_variacao: string | null;
  caminho_arquivo: string;
  ordem: number;
  data_criacao: string;
  data_atualizacao: string;
}

export interface UploadMediaInput {
  file: File;
  productId: string;
  variationId?: string;
}

