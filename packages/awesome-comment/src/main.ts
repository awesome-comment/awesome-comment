import { createApp } from 'vue'
import {createAuth0} from "@auth0/auth0-vue";
import './style.css'
import App from './App.vue'

const app = createApp(App);
app.use(
  createAuth0({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin,
    },
  })
);
app.mount('#app')
