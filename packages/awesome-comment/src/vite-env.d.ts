/// <reference types="vite/client" />

declare const __IS_PROD__: string;
declare const __VERSION__: string;
declare const AwesomeComment: {
  init(dom: string | HTMLElement, apiUrl: string, domain: string, clientId: string): void;
};

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<unknown, unknown, unknown>;
  export default component;
}

declare global {
  interface Window {
    custom_comment_data: unknown;
    BM_LEVEL: unknown;
    BM_VALUE: unknown;
  }
}
