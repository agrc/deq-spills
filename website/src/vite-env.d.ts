/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCOVER: string;
  readonly VITE_WEB_API: string;
  readonly VITE_FIREBASE_CONFIG: string;
  readonly VITE_FLOWPATHS_PUBLIC_SERVICE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
