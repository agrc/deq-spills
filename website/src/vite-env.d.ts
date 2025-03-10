/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCOVER: string;
  readonly VITE_WEB_API: string;
  readonly VITE_FIREBASE_CONFIG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
