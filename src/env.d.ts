// src/env.d.ts
/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_BASE_API_URL?: string;
    // add other VITE_... env vars here if needed
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
