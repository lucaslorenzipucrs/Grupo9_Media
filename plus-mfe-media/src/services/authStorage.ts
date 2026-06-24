const ACCESS_KEYS = ["access_token", "token"] as const;
const REFRESH_KEYS = ["refresh_token", "refresh"] as const;

function readToken(keys: readonly string[]): string {
  for (const key of keys) {
    const localValue = localStorage.getItem(key)?.trim();
    if (localValue) return localValue;

    const sessionValue = sessionStorage.getItem(key)?.trim();
    if (sessionValue) return sessionValue;
  }

  return "";
}

export function getAccessToken(): string {
  return readToken(ACCESS_KEYS);
}

export function getRefreshToken(): string {
  return readToken(REFRESH_KEYS);
}

export function saveAccessToken(token: string) {
  const value = token.trim();
  localStorage.setItem("token", value);
  localStorage.setItem("access_token", value);
  sessionStorage.setItem("token", value);
  sessionStorage.setItem("access_token", value);
}

export function saveRefreshToken(token: string) {
  const value = token.trim();
  localStorage.setItem("refresh", value);
  localStorage.setItem("refresh_token", value);
  sessionStorage.setItem("refresh", value);
  sessionStorage.setItem("refresh_token", value);
}

export function clearAuthTokens() {
  for (const key of [...ACCESS_KEYS, ...REFRESH_KEYS]) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

export function redirectToLogin() {
  clearAuthTokens();

  if (window.location.port === "3000") {
    window.location.href = "/login";
    return;
  }

  const authOrigin = (import.meta.env.VITE_MFE_AUTH_ORIGIN as string | undefined)?.trim() || "http://localhost:4001";
  const normalizedAuthOrigin = authOrigin.replace(/\/$/, "");

  const redirectUrl = `${window.location.origin}/media`;
  const loginUrl = new URL(`${normalizedAuthOrigin}/login`);
  loginUrl.searchParams.set("redirect", redirectUrl);

  window.location.href = loginUrl.toString();
}
