/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MS_AUTH_URL: string;
  readonly VITE_MS_MEDIA_URL: string;
  readonly VITE_MEDIA_PUBLIC_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}