import { createApp } from 'vue'
import { createPinia } from 'pinia';
import { createAuth0 } from '@auth0/auth0-vue';
import './tw-daisy.css';
import './style.css';
import './animate.css';
import App from './App.vue';

function init(domain: string, clientId: string) {
  const app = createApp(App);
  const pinia = createPinia();
  const auth0 = createAuth0({
    domain,
    clientId,
    authorizationParams: {
      redirect_uri: window.location.origin,
    },
  });
  app.use(auth0);
  app.use(pinia);
  return app;
}

if (!__IS_PROD__) {
  const app = init(import.meta.env.VITE_AUTH0_DOMAIN, import.meta.env.VITE_AUTH0_CLIENT_ID);
  app.provide('ApiBaseUrl', __API_URL__);
  app.provide('postId', 'awesome-comment-self');
  app.mount('#app');
}

const AwesomeComment = {
  init(dom: string | HTMLElement, postId: string, apiUrl: string, domain: string, clientId: string) {
    const app = init(domain, clientId);
    app.provide('ApiBaseUrl', apiUrl);
    app.provide('postId', postId);
    app.mount(dom);
  }
}
export default AwesomeComment;
