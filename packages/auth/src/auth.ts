import EventEmitter3 from 'eventemitter3';
import { ResponseBody } from '@awesome-comment/core/types';
import { jwtDecode, JwtPayload } from 'jwt-decode';

export interface AwesomeAuthProps {
  googleId: string;
  prefix?: string;
  root?: string;
}
declare global {
  function onGoogleLibraryLoad(): void;
}

let intervalId: ReturnType<typeof setInterval>;

class AwesomeAuth extends EventEmitter3 {
  #accessToken: string = '';
  #decoded: JwtPayload = {};
  #expired: number = 0;
  #googleId: string;
  #now: number;
  #prefix: string;
  #root: string;

  constructor({
    googleId,
    prefix = 'aAuth',
    root = '',
  }: AwesomeAuthProps) {
    super();

    this.#googleId = googleId;
    this.#prefix = prefix;
    this.#root = root;
    this.#now = Date.now() / 1000 >> 0;
    this.setAccessToken(localStorage.getItem(this.localKey) || '', false);
    if (this.#accessToken) {
      this.verifyToken();
      return;
    }

    if ('google' in globalThis) {
      this.initGoogleIdentity();
    } else {
      globalThis.onGoogleLibraryLoad = () => this.initGoogleIdentity();
    }
  }

  get accessToken(): string {
    return this.#accessToken;
  }
  get expiredIn(): number {
    return !this.#expired ? this.#expired - this.#now : 0;
  }
  get localKey(): string {
    return `${this.#prefix}-token`
  }

  doSignIn(): void {
    this.initGoogleIdentity();
  }

  private initGoogleIdentity() {
    this.emit('init', true);
    google.accounts.id.initialize({
      client_id: this.#googleId,
      callback: () => this.onGoogleIdentityCallback,
      auto_select: true,
      ux_mode: 'popup',
    });
    google.accounts.id.prompt();
  }
  private refreshCountDown(): void {
    this.#now = Date.now() / 1000 >> 0;
    if (this.expiredIn <= 60) {
      clearInterval(intervalId);
      this.refreshToken();
    }
  }
  private async refreshToken(): Promise<void> {
    this.emit('refresh', true);
    const response = await fetch(`${this.#root}/api/refresh-token`, {
      method: 'POST',
      body: JSON.stringify({
        token: this.#accessToken,
      }),
    });
    const { data } = (await response.json()) as ResponseBody<{ token: string }>;
    const { token } = data as { token: string };
    this.setAccessToken(token);
    this.emit('refresh', false);
  }
  private setAccessToken(token: string, local = true) {
    this.setAccessToken(token);
    local && localStorage.setItem(this.localKey, token);
    if (!token) {
      this.#decoded = {};
      this.#expired = 0;
      return;
    }

    try {
      this.#decoded = jwtDecode<JwtPayload>(token);
    } catch (error) {
      this.#decoded = {};
    }
    this.#expired = this.#decoded.exp || 0;
    if (this.expiredIn > 0) {
      clearInterval(intervalId);
      intervalId = setInterval(() => this.refreshCountDown(), 1000);
    }
  }
  private async verifyToken(): Promise<void> {
    this.emit('auth', true);
    const response = await fetch(`${this.#root}/api/verify-auth`, {
      method: 'POST',
      body: JSON.stringify({
        token: this.#accessToken,
      }),
    });
    const { data } = (await response.json()) as ResponseBody<{ verified: boolean, message: string }>;
    const { verified, message = '' } = data as { verified: boolean, message: string };
    this.emit('verified', verified);
    if (message) this.emit('error', message);
    this.emit('auth', false);
  }
  private async onGoogleIdentityCallback(res: {credential: string}) {
    this.emit('init', false);
    this.emit('auth', true);
    const response = await fetch(`${this.#root}/api/google-auth`, {
      method: 'POST',
      body: JSON.stringify({
        credential: res.credential,
      }),
    });
    const { data } = (await response.json()) as ResponseBody<{token: string}>;
    if (!data) {
      this.emit('error', 'Failed to validate user.');
    }
    const { token } = data as { token: string };
    this.setAccessToken(token);
    this.emit('auth', false);
    this.emit('verified', true);
  }
}

function addGoogleIdentityScript() {
  const src = 'https://accounts.google.com/gsi/client';
  // add script to head if needed
  if (document.querySelector(`script[src="${src}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

let _client: AwesomeAuth;
export default {
  init(params: AwesomeAuthProps) {
    if(_client) return _client;
    addGoogleIdentityScript();

    _client = new AwesomeAuth(params);
    return _client;
  }
}
