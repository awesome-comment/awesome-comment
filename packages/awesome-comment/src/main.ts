import { createApp } from 'vue'
import { createPinia } from 'pinia';
import { Auth0Plugin, createAuth0 } from '@auth0/auth0-vue';
import { createI18n } from 'vue-i18n';
import omit from 'lodash-es/omit';
import messages from '@awesome-comment/core/i18n.json' with { type: 'json' };
import './styles/tw-daisy.css';
import './styles/main.css';
import './styles/animate.css';
import App from './App.vue';
import { ResponseBody, ResponseComment } from '@awesome-comment/core/types';
import type { AwesomeAuth } from '@roudanio/awesome-auth';

export type InitOptions = {
  postId?: string;
  apiUrl?: string;
  domain?: string;
  clientId?: string;
  locale?: string;
  awesomeAuth?: AwesomeAuth;
};
type Manager = {
  init: (dom: string | HTMLElement, options: InitOptions) => void;
  preload: (options: InitOptions) => Promise<void>;
}

const comments: ResponseComment[] = [];
let total = 0;
let preAuth0: Auth0Plugin | null = null;

function init({
  domain,
  clientId,
  locale = navigator.language,
}: {
  domain?: string;
  clientId?: string;
  locale?: string;
}) {
  const app = createApp(App);
  const pinia = createPinia();
  const auth0 = preAuth0 || domain && clientId && createAuth0({
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
    messages: {
      ...omit(messages, 'cn'),
      'zh-CN': messages.cn,
    },
  });
  auth0 && app.use(auth0);
  app.use(pinia);
  app.use(i18n);
  return app;
}

if (!__IS_PROD__) {
  const app = init({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  });
  app.provide('ApiBaseUrl', '');
  app.provide('postId', 'awesome-comment-self');
  app.provide('Auth0Domain', import.meta.env.VITE_AUTH0_DOMAIN);
  app.mount('#app');
}

const AwesomeComment: InitOptions & Manager = {
  postId: '',
  apiUrl: '',
  domain: '',
  clientId: '',
  locale: '',
  awesomeAuth: undefined,
  init(
    dom: string | HTMLElement,
    {
      postId,
      apiUrl,
      domain,
      clientId,
      awesomeAuth,
      locale = navigator.language,
    }: InitOptions = {}
  ) {
    postId ??= this.postId;
    apiUrl ??= this.apiUrl;
    domain ??= this.domain || '';
    clientId ??= this.clientId;
    awesomeAuth ??= this.awesomeAuth;
    const app = init({ domain, clientId, locale });
    app.provide('ApiBaseUrl', apiUrl);
    app.provide('postId', postId);
    app.provide('Auth0Domain', domain);
    app.provide('comments', comments);
    app.provide('total', total);
    app.provide('awesomeAuth', awesomeAuth);
    app.mount(dom);
  },
  async preload({
    postId,
    apiUrl,
    domain,
    clientId,
    awesomeAuth,
  }: InitOptions): Promise<void> {
    this.postId = postId || '';
    this.apiUrl = apiUrl || '';
    this.domain = domain || '';
    this.clientId = clientId || '';
    if (domain && clientId) {
      preAuth0 = createAuth0({
        domain,
        clientId,
        authorizationParams: {
          redirect_uri: window.location.origin,
        },
      });
    }
    if (!preAuth0 && !awesomeAuth) {
      throw new Error('You need at least 1 Auth provider.');
    }
    this.awesomeAuth = awesomeAuth as AwesomeAuth;

    const response = await fetch(`${apiUrl}/api/comments?postId=${postId}`);
    if (!response.ok) {
      console.log('[Awesome comment] Failed to preload comments.');
    }
    const json = (await response.json()) as ResponseBody<ResponseComment[]>;
    if (json.data) {
      comments.push(...json.data);
      total = json.meta?.total || json.data.length;

      const event = new CustomEvent('AwesomeComment:total', {
        bubbles: true,
        cancelable: true,
        detail: total,
      });
      document.body.dispatchEvent(event);
    }
  },
};
export default AwesomeComment;
