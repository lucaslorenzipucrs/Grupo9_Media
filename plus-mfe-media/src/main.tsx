import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./styles";
import MediaDashboardPage from "./pages/MediaDashboardPage";
import { getAccessToken, saveAccessToken, saveRefreshToken, redirectToLogin } from "./services/authStorage";

// Ao ser carregado a partir do DashboardPage (outro MFE/origin),
// o token chega via query param porque localStorage não é compartilhado entre origens.
function bootstrapToken() {
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get("token") || params.get("access_token");
  const refreshFromUrl = params.get("refresh") || params.get("refresh_token");

  if (tokenFromUrl) {
    saveAccessToken(tokenFromUrl);
    if (refreshFromUrl) saveRefreshToken(refreshFromUrl);

    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

bootstrapToken();

function App() {
  const token = getAccessToken();

  if (!token) {
    redirectToLogin();
    return null;
  }

  return <MediaDashboardPage />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);