/// <reference types="vite/client" />

declare const __IS_PROD__: string;
declare const __VERSION__: string;
declare const AwesomeComment: {
  init(
    dom: string | HTMLElement,
    options: {
      postId?: string;
      apiUrl?: string;
      domain?: string;
      clientId?: string;
      locale?: string;
      awesomeAuth?: unknown;
      siteId?: string;
      turnstileSiteKey?: string;
      autoFocus?: boolean;
    },
  ): void;
};

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<unknown, unknown, unknown>;
  export default component;
}
