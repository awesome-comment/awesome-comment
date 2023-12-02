/// <reference types="vite/client" />

declare const __IS_PROD__: string;
declare const __VERSION__: string;
declare const AwesomeComment: {
  init(dom: string | HTMLElement, apiUrl: string, domain: string, clientId: string): void;
};
