import { createApp } from 'vue'
import { createPinia } from 'pinia';
import { createAuth0 } from '@auth0/auth0-vue';
import './style.css';
import App from './App.vue';

function init() {
  const app = createApp(App);
  const pinia = createPinia();
  const auth0 = createAuth0({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin,
    },
  });
  app.use(auth0);
  app.use(pinia);
  return app;
}

if (!__IS_PROD__) {
  const app = init();
  app.mount('#app');
}

const AwesomeComment = {
  init(dom: string | HTMLElement, apiUrl: string) {
    const app = init();
    app.provide('ApiBaseUrl', apiUrl);
    app.mount(dom);
  }
}
export default AwesomeComment;
