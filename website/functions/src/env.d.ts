declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FEATURE_SERVICE_URL: string;
    }
  }
}

export {};
