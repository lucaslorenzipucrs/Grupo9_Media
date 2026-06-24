import { createTheme } from "@mui/material/styles";

const PRIMARY = "#0F766E";
const PRIMARY_DARK = "#115E59";
const PRIMARY_LIGHT = "#CCFBF1";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main:          PRIMARY,
      dark:          PRIMARY_DARK,
      light:         PRIMARY_LIGHT,
      contrastText:  "#ffffff",
    },
    secondary: {
      main: "#475569",
      dark: "#334155",
      light: "#E2E8F0",
    },
    background: {
      default: "#F6F8FA",
      paper:   "#ffffff",
    },
    text: {
      primary:   "#17212B",
      secondary: "#64748B",
    },
    divider: "#E2E8F0",
    error:   { main: "#DC2626" },
    success: { main: "#16A34A" },
    warning: { main: "#D97706" },
  },

  typography: {
    fontFamily: '"Nunito", "Inter", "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
  },

  shape: { borderRadius: 12 },

  components: {
    MuiInput: {
      styleOverrides: {
        root: {
          fontSize: "0.9375rem",
          color: "#17212B",
          "&::before":                          { borderBottomColor: "#CBD5E1" },
          "&:hover:not(.Mui-disabled)::before": { borderBottomColor: PRIMARY },
          "&::after":                           { borderBottomColor: PRIMARY },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#64748B",
          "&.Mui-focused": { color: PRIMARY },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.9375rem",
          letterSpacing: 0,
          boxShadow: "none",
          "&:hover":  { boxShadow: "none" },
          "&:active": { boxShadow: "none" },
        },
        contained: {
          borderRadius: 8,
          padding: "12px 24px",
        },
        outlined: {
          borderRadius: 8,
          padding: "10px 24px",
          borderColor: "#CBD5E1",
          color: PRIMARY,
          fontWeight: 600,
          backgroundColor: "#ffffff",
          "&:hover": { borderColor: PRIMARY, backgroundColor: "#F0FDFA" },
        },
      },
    },

    MuiAlert: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
  },
});
