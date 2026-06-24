import type { MediaItem, UploadMediaInput } from "../types/media";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  redirectToLogin,
  saveAccessToken,
  saveRefreshToken,
} from "./authStorage";

const API = import.meta.env.VITE_MS_MEDIA_URL || "http://localhost:3003";
const AUTH_API = import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";
const PUBLIC_BASE_URL = import.meta.env.VITE_MEDIA_PUBLIC_BASE_URL || "";

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null);
  if (body?.detail) {
    return Array.isArray(body.detail) ? body.detail[0]?.msg || response.statusText : body.detail;
  }
  if (body?.error) {
    return body.error;
  }
  return response.statusText || "Erro na requisicao.";
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${AUTH_API}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) return false;

  const data = await response.json();
  const accessToken = data.access_token || data.token;
  const newRefresh = data.refresh_token || data.refresh;

  if (!accessToken) return false;

  saveAccessToken(accessToken);
  if (newRefresh) saveRefreshToken(newRefresh);
  return true;
}

async function request<T>(url: string, options: RequestInit = {}, retry = true): Promise<T> {
  const response = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },

  });

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(url, options, false);
    }
    redirectToLogin();
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  if (response.status === 401) {
    redirectToLogin();
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getMediaByProduct(productId: string, variationId?: string) {
  const params = new URLSearchParams();
  if (variationId?.trim()) params.set("id_variacao", variationId.trim());
  const qs = params.toString() ? `?${params.toString()}` : "";
  return request<MediaItem[]>(`/products/${encodeURIComponent(productId)}/media${qs}`);
}

export function uploadMedia(input: UploadMediaInput) {
  const formData = new FormData();
  formData.append("arquivo", input.file);
  formData.append("id_produto", input.productId);

  if (input.variationId?.trim()) {
    formData.append("id_variacao", input.variationId.trim());
  }

  return request<MediaItem>("/media", {
    method: "POST",
    body: formData,
  });
}

export function deleteMedia(mediaId: string) {
  return request<void>(`/media/${encodeURIComponent(mediaId)}`, {
    method: "DELETE",
  });
}

export function reorderMedia(productId: string, medias: MediaItem[]) {
  return request<MediaItem[]>(`/products/${encodeURIComponent(productId)}/media/order`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      medias: medias.map((media, index) => ({
        id: media.id,
        ordem: index,
      })),
    }),
  });
}

export function buildMediaUrl(objectKey: string): string {
  if (!PUBLIC_BASE_URL) return "";

  const normalizedBase = PUBLIC_BASE_URL.replace(/\/$/, "");
  const normalizedKey = objectKey
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${normalizedBase}/${normalizedKey}`;
}

export { clearAuthTokens, getAccessToken, redirectToLogin };
