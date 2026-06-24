import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  ThemeProvider,
  CssBaseline,
  Alert,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import LogoutIcon from "@mui/icons-material/Logout";
import { theme } from "../styles";
const API = import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";

function getStoredToken() {
  return localStorage.getItem("token") || localStorage.getItem("access_token");
}

function getStoredRefreshToken() {
  return localStorage.getItem("refresh") || localStorage.getItem("refresh_token") || "";
}

function buildMediaHref() {
  const token = getStoredToken();
  const refresh = getStoredRefreshToken();

  const params = new URLSearchParams();
  if (token) params.set("token", token);
  if (refresh) params.set("refresh", refresh);

  const mediaOrigin = (import.meta.env.VITE_MFE_MEDIA_ORIGIN as string | undefined)?.trim();

  if (mediaOrigin) {
    const normalized = mediaOrigin.replace(/\/$/, "");
    const query = params.toString();
    return query ? `${normalized}/?${query}` : `${normalized}/`;
  }

  const isShell = window.location.port === "3000";
  const base = isShell ? "" : "http://localhost:4002";

  const query = params.toString();
  return query ? `${base}/media?${query}` : `${base}/media`;
}

function clearAuthTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("refresh_token");
}

export default function DashboardPage() {
  const [user, setUser] = useState<{
    email: string;
    role: { name: string } | string;
  } | null>(null);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mediaHref = buildMediaHref();

  const handleLogout = () => {
    clearAuthTokens();
    window.location.href = "/login";
  };

  const fetchData = useCallback(async () => {
    const token = getStoredToken();
    if (!token) { handleLogout(); return; }

    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!meRes.ok) {
        if (meRes.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Nao foi possivel carregar seu perfil.");
      }

      const meData = await meRes.json();
      setUser(meData);

      const isAdmin = meData.role?.name === "admin" || meData.role === "admin";
      if (isAdmin) {
        const usersRes = await fetch(`${API}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!usersRes.ok) {
          throw new Error("Nao foi possivel carregar a lista de usuarios.");
        }

        const usersData = await usersRes.json();
        setUsersList(Array.isArray(usersData) ? usersData : usersData.users || []);
      }
    } catch (err) {
      console.error("Erro na busca:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar o dashboard.");
    } finally {
      setLoading(false);
    }  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePromote = async (userId: number) => {
    const token = getStoredToken();
    try {
      await fetch(`${API}/auth/promote/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Erro ao promover usuário");
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
          <CircularProgress color="primary" />
        </Box>
      </ThemeProvider>
    );
  }

  const isAdmin =
    user?.role &&
    (typeof user.role === "string" ? user.role === "admin" : user.role.name === "admin");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #7B74F5 0%, #5E56E8 100%)",
          p: 4,
        }}
      >
        <Container maxWidth="md">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}        {/* Cabeçalho */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, color: "white" }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Plus Gestão
          </Typography>

          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderRadius: "16px",
              px: 2.5,
              py: 1.2,
              color: "#fff",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              transition: "all .2s ease",
              "&:hover": {
                background: "rgba(255,255,255,0.2)",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
              },
            }}
          >
            Sair
          </Button>
        </Box>

        {isAdmin ? (
          // TELA ADMIN
          <Paper sx={{ p: 4, borderRadius: "24px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" sx={{ color: "#4a42c8", fontWeight: 700 }}>
                Gerenciamento de Usuários
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  href={mediaHref}
                  sx={{ borderRadius: 10 }}
                >
                  Galeria de Mídia
                </Button>
                <Button variant="outlined" size="small" onClick={fetchData} sx={{ borderRadius: 10 }}>
                  Atualizar Lista
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>E-mail</TableCell>
                    <TableCell>Cargo</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersList.length > 0 ? (
                    usersList.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.email}</TableCell>
                        <TableCell sx={{ textTransform: "capitalize" }}>
                          {u.role?.name || u.role || "vendedor"}
                        </TableCell>
                        <TableCell align="right">
                          {u.role?.name !== "admin" && u.role !== "admin" && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ArrowUpwardIcon />}
                              onClick={() => handlePromote(u.id)}
                              sx={{ borderRadius: 10 }}
                            >
                              Promover
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: "#9898b3" }}>
                        Nenhum usuário encontrado ou erro ao carregar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          // TELA VENDEDOR
          <Paper
            sx={{
              p: 10,
              textAlign: "center",
              borderRadius: "24px",
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography variant="h2" sx={{ color: "#4a42c8", fontWeight: 800 }}>
              Estoque
            </Typography>
            <Typography variant="body1" sx={{ color: "#9898b3", mt: 2 }}>
              Bem-vindo, {user?.email}. Você está no módulo de estoque.
            </Typography>
          </Paper>
        )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}