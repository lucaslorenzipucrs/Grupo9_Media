import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./styles";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

function AuthApp() {
  const path = window.location.pathname;

  if (path === "/register") {
    return <RegisterPage />;
  }

  if (path === "/dashboard") {
    return <DashboardPage />;
  }

  return (
    <LoginPage
      onLogin={() => {
        window.location.href = "/dashboard";
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthApp />
    </ThemeProvider>
  </React.StrictMode>
);