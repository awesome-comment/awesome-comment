import { createApp } from 'vue'
import { createPinia } from 'pinia';
import { Auth0Plugin, createAuth0 } from '@auth0/auth0-vue';
import { createI18n } from 'vue-i18n';
import messages from '../i18n.json' assert { type: 'json' };
import './styles/tw-daisy.css';
import './styles/main.css';
import './styles/icon.css'
import './styles/animate.css';
import App from './App.vue';
import { ResponseBody, ResponseComment } from '@awesome-comment/core/types';

export type InitOptions = {
  postId?: string;
  apiUrl?: string;
  domain?: string;
  clientId?: string;
  locale?: string;
};

const comments: ResponseComment[] = [];
let preAuth0: Auth0Plugin | null = null;

function init(domain: string, clientId: string, locale: string = navigator.language) {
  const app = createApp(App);
  const pinia = createPinia();
  const auth0 = preAuth0 || createAuth0({
    domain,
    clientId,
    authorizationParams: {
      redirect_uri: location.origin,
    },
  });
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages,
  });
  app.use(auth0);
  app.use(pinia);
  app.use(i18n);
  return app;
}

if (!__IS_PROD__) {
  const app = init(import.meta.env.VITE_AUTH0_DOMAIN, import.meta.env.VITE_AUTH0_CLIENT_ID);
  app.provide('ApiBaseUrl', '');
  app.provide('postId', 'awesome-comment-self');
  app.provide('Auth0Domain', import.meta.env.VITE_AUTH0_DOMAIN);
  app.mount('#app');
}

const AwesomeComment = {
  postId: '',
  apiUrl: '',
  domain: '',
  clientId: '',
  language: '',
  init(
    dom: string | HTMLElement,
    {
      postId,
      apiUrl,
      domain,
      clientId,
      locale = navigator.language,
    }: InitOptions = {}
  ) {
    postId ??= this.postId;
    apiUrl ??= this.apiUrl;
    domain ??= this.domain;
    clientId ??= this.clientId;
    const app = init(domain, clientId, locale);
    app.provide('ApiBaseUrl', apiUrl);
    app.provide('postId', postId);
    app.provide('Auth0Domain', domain);
    app.provide('comments', comments);
    app.mount(dom);
  },
  async preload(postId: string, apiUrl: string, domain: string, clientId: string): Promise<void> {
    this.postId = postId;
    this.apiUrl = apiUrl;
    this.domain = domain;
    this.clientId = clientId;
    preAuth0 = createAuth0({
      domain,
      clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    });
    const response = await fetch(`${apiUrl}/api/comments?postId=${postId}`);
    if (!response.ok) {
      console.log('[Awesome comment] Failed to preload comments.');
    }
    const json = (await response.json()) as ResponseBody<ResponseComment[]>;
    if (json.data) {
      comments.push(...json.data);

      const event = new CustomEvent('AwesomeComment:total', {
        bubbles: true,
        cancelable: true,
        detail: comments.length,
      });
      document.body.dispatchEvent(event);
    }
  },
};
export default AwesomeComment;
