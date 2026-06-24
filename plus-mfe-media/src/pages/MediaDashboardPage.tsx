import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Delete as DeleteIcon,
  ImageSearch as ImageSearchIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material";

import {
  buildMediaUrl,
  deleteMedia,
  getMediaByProduct,
  redirectToLogin,
  reorderMedia,
  uploadMedia,
} from "../services/mediaApi";
import type { MediaItem } from "../types/media";


function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Operacao nao concluida.";
}

function moveItem(items: MediaItem[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next.map((media, index) => ({ ...media, ordem: index }));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

// ─── MediaPreview ────────────────────────────────────────────────────────────

function MediaPreview({ media }: { media: MediaItem }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = buildMediaUrl(media.caminho_arquivo);

  if (!imageUrl || failed) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: "text.secondary", px: 2 }}>
        <ImageSearchIcon />
        <Typography variant="caption" align="center" sx={{ wordBreak: "break-word" }}>
          {media.caminho_arquivo}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={imageUrl}
      alt={`Midia ${media.ordem + 1}`}
      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={() => setFailed(true)}
    />
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MediaDashboardPage() {
  const [productId, setProductId]             = useState("Produto1");
  const [variationId, setVariationId]         = useState("");
  const [filterVariationId, setFilterVariationId] = useState("");
  const [selectedFile, setSelectedFile]       = useState<File | null>(null);
  const [medias, setMedias]                   = useState<MediaItem[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [uploading, setUploading]             = useState(false);
  const [savingOrder, setSavingOrder]         = useState(false);
  const [dirtyOrder, setDirtyOrder]           = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const orderedMedias = useMemo(
    () => [...medias].sort((a, b) => a.ordem - b.ordem),
    [medias],
  );


  const loadMedias = useCallback(async () => {
    const trimmed = productId.trim();
    if (!trimmed) { setMessage({ type: "error", text: "Informe o ID do produto." }); return; }
    setLoading(true);
    setMessage(null);
    try {
      const data = await getMediaByProduct(trimmed, filterVariationId || undefined);
      setMedias(data);
      setDirtyOrder(false);
      if (data.length === 0) setMessage({ type: "info", text: "Nenhuma midia cadastrada para este produto" + (filterVariationId.trim() ? " com essa variacao" : "") + "." });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [productId, filterVariationId]);

  const handleUpload = async () => {
    const trimmed = productId.trim();
    if (!trimmed || !selectedFile) { setMessage({ type: "error", text: "Informe o produto e selecione uma imagem." }); return; }
    setUploading(true);
    setMessage(null);
    try {
      await uploadMedia({ file: selectedFile, productId: trimmed, variationId });
      setSelectedFile(null);
      setVariationId("");
      const data = await getMediaByProduct(trimmed);
      setMedias(data);
      setDirtyOrder(false);
      setMessage({ type: "success", text: "Imagem enviada para a galeria." });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (media: MediaItem) => {
    if (!window.confirm("Remover esta imagem da galeria?")) return;
    setMessage(null);
    try {
      await deleteMedia(media.id);
      const data = await getMediaByProduct(productId.trim());
      setMedias(data);
      setDirtyOrder(false);
      setMessage({ type: "success", text: "Imagem removida." });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= orderedMedias.length) return;
    setMedias(moveItem(orderedMedias, index, target));
    setDirtyOrder(true);
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    setMessage(null);
    try {
      const data = await reorderMedia(productId.trim(), orderedMedias);
      setMedias(data);
      setDirtyOrder(false);
      setMessage({ type: "success", text: "Ordem de exibicao salva." });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSavingOrder(false);
    }
  };

  const handleLogout = () => {
    redirectToLogin();
  };


  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }} color="text.primary">
                Media Service
              </Typography>
              <Typography color="text.secondary">
                Galeria de imagens por produto, variacao e ordem de exibicao.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                color={dirtyOrder ? "warning" : "success"}
                label={dirtyOrder ? "Ordem nao salva" : "Sincronizado"}
                sx={{ borderRadius: 1 }}
              />
              <Tooltip title="Sair">
                <IconButton
                  onClick={handleLogout}
                  sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Busca */}
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                <TextField
                  label="Produto"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label="Filtrar por variação (opcional)"
                  placeholder="Ex.: cor-preta"
                  value={filterVariationId}
                  onChange={(e) => setFilterVariationId(e.target.value)}
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: filterVariationId ? (
                        <InputAdornment position="end">
                          <Tooltip title="Limpar filtro">
                            <IconButton size="small" onClick={() => setFilterVariationId("")}>
                              <span style={{ fontSize: 16, lineHeight: 1 }}>✕</span>
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress color="inherit" size={18} /> : <ImageSearchIcon />}
                  onClick={loadMedias}
                  disabled={loading}
                  sx={{ minWidth: 160 }}
                >
                  Buscar galeria
                </Button>
                <Tooltip title="Atualizar">
                  <span>
                    <IconButton
                      onClick={loadMedias}
                      disabled={loading || !productId.trim()}
                      sx={{ width: 48, height: 48, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
              {message && (
                <Alert severity={message.type} onClose={() => setMessage(null)}>
                  {message.text}
                </Alert>
              )}
            </Box>
          </Paper>

          {/* Grid principal */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" }, gap: 3, alignItems: "start" }}>

            {/* Painel upload */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Novo upload</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Envie fotos associadas ao produto e variacao.
                  </Typography>
                </Box>

                <TextField
                  label="Variacao (opcional)"
                  placeholder="Ex.: cor-preta-g2"
                  value={variationId}
                  onChange={(e) => setVariationId(e.target.value)}
                  fullWidth
                  size="small"
                />

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  sx={{ justifyContent: "flex-start" }}
                >
                  {selectedFile ? selectedFile.name : "Selecionar imagem"}
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  />
                </Button>

                {uploading && <LinearProgress />}

                <Button
                  variant="contained"
                  startIcon={<AddPhotoAlternateIcon />}
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile || !productId.trim()}
                >
                  Enviar imagem
                </Button>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary">Total de imagens</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{orderedMedias.length}</Typography>
                </Box>
              </Box>
            </Paper>

            {/* Galeria */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Galeria do produto</Typography>
                    <Typography variant="body2" color="text.secondary">
                      As imagens sao exibidas conforme a ordem abaixo.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={savingOrder ? <CircularProgress color="inherit" size={18} /> : <SaveIcon />}
                    onClick={handleSaveOrder}
                    disabled={!dirtyOrder || savingOrder || orderedMedias.length === 0}
                  >
                    Salvar ordem
                  </Button>
                </Box>

                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                  </Box>
                ) : orderedMedias.length === 0 ? (
                  <Box
                    sx={{
                      minHeight: 220,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 2,
                      color: "text.secondary",
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    <ImageSearchIcon sx={{ fontSize: 40 }} />
                    <Typography sx={{ fontWeight: 700 }}>Nenhuma imagem carregada</Typography>
                    <Typography variant="body2">
                      Busque um produto ou envie a primeira imagem da galeria.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" },
                      gap: 2,
                    }}
                  >
                    {orderedMedias.map((media, index) => (
                      <Box
                        key={media.id}
                        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}
                      >
                        {/* Thumbnail */}
                        <Box sx={{ aspectRatio: "4 / 3", bgcolor: "#E2E8F0", display: "grid", placeItems: "center", overflow: "hidden" }}>
                          <MediaPreview media={media} />
                        </Box>

                        {/* Info */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 1.5 }}>
                          {/* Ordem + controles */}
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Chip size="small" label={`#${media.ordem}`} sx={{ borderRadius: 1 }} />
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Tooltip title="Mover para cima">
                                <span>
                                  <IconButton size="small" disabled={index === 0} onClick={() => handleMove(index, "up")}>
                                    <KeyboardArrowUpIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Mover para baixo">
                                <span>
                                  <IconButton size="small" disabled={index === orderedMedias.length - 1} onClick={() => handleMove(index, "down")}>
                                    <KeyboardArrowDownIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Excluir">
                                <IconButton size="small" color="error" onClick={() => handleDelete(media)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>

                          <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: "break-word" }}>
                            {media.id}
                          </Typography>

                          {/* Chips produto / variacao */}
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            <Chip size="small" variant="outlined" label={media.id_produto} sx={{ borderRadius: 1 }} />
                            {media.id_variacao && (
                              <Chip size="small" color="primary" variant="outlined" label={media.id_variacao} sx={{ borderRadius: 1 }} />
                            )}
                          </Box>

                          <Typography variant="caption" color="text.secondary">
                            {formatDate(media.data_criacao)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}