import EventEmitter3 from 'eventemitter3';
import { ResponseBody } from '@awesome-comment/core/types';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import isString from 'lodash-es/isString';

export interface AwesomeAuthProps {
  googleId: string;
  prefix?: string;
  root?: string;
}
declare global {
  function onGoogleLibraryLoad(): void;
}

export enum AwesomeAuthEvent {
  INIT = 'init',
  VERIFYING = 'verifying',
  VERIFIED = 'verified',
  REFRESH = 'refresh',
  ERROR = 'error',
}

let intervalId: ReturnType<typeof setInterval>;

export class AwesomeAuth extends EventEmitter3 {
  #accessToken: string = '';
  #decoded: JwtPayload = {};
  #expired: number = 0;
  #googleId: string;
  #isSigningIn: boolean = false;
  #isVerifying: boolean = false;
  #isVerified: boolean = false;
  #now: number;
  #prefix: string;
  #root: string;

  constructor({
    googleId,
    prefix = 'aAuth',
    root = '/api',
  }: AwesomeAuthProps) {
    super();

    this.#googleId = googleId;
    this.#prefix = prefix;
    this.#root = root;
    this.#now = Date.now() / 1000 >> 0;
    this.setAccessToken(localStorage.getItem(this.localKey) || '', false);
    if (this.#accessToken) {
      this.verifyToken()
        .then(isVerified => {
          if (!isVerified) {
            this.initGoogleIdentity();
          }
        });
      return;
    }

    this.initGoogleIdentity();
  }

  get accessToken(): string {
    return this.#accessToken;
  }
  get expiredIn(): number {
    return !this.#expired ? this.#expired - this.#now : 0;
  }
  get isVerifying(): boolean {
    return this.#isVerifying;
  }
  get isVerified(): boolean {
    return this.#isVerified;
  }
  get localKey(): string {
    return `${this.#prefix}-token`
  }
  get root(): string {
    return this.#root;
  }
  get user(): JwtPayload {
    return this.#decoded;
  }

  doSignIn(): void {
    this.initGoogleIdentity();
  }
  doSignOut(): void {
    this.#accessToken = '';
    google.accounts.id.revoke(this.#decoded.sub || '');
    this.#decoded = {};
  }
  async store(key: string, value: unknown): Promise<void> {
    value = isString(value) ? value : JSON.stringify(value);
    await fetch(`${this.#root}/store`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${this.#accessToken}`,
      },
      body: JSON.stringify({
        key,
        value,
      }),
    });
  }
  async retrieve(key: string): Promise<unknown> {
    const response = await fetch(`${this.#root}/retrieve`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${this.#accessToken}`,
      },
      body: JSON.stringify({
        key,
      }),
    });
    const { data } = (await response.json()) as ResponseBody<{ value: unknown }>;
    return data?.value;
  }

  private initGoogleIdentity() {
    if (!('google' in globalThis) || !('accounts' in globalThis.google)) {
      addGoogleIdentityScript();
      globalThis.onGoogleLibraryLoad = () => this.initGoogleIdentity();
      return;
    }
    if (this.#isSigningIn) return;

    this.emit(AwesomeAuthEvent.INIT, true);
    this.#isSigningIn = true;
    google.accounts.id.initialize({
      client_id: this.#googleId,
      callback: (res) => this.onGoogleIdentityCallback(res),
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
    this.emit(AwesomeAuthEvent.REFRESH, true);
    const response = await fetch(`${this.#root}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${this.#accessToken}`,
      },
    });
    const { data } = (await response.json()) as ResponseBody<{ token: string }>;
    const { token } = data as { token: string };
    this.setAccessToken(token);
    this.emit(AwesomeAuthEvent.REFRESH, false);
  }
  private setAccessToken(token: string, local = true) {
    this.#accessToken = token;
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
  private async verifyToken(): Promise<boolean> {
    this.emit(AwesomeAuthEvent.VERIFYING, true);
    this.#isVerifying = true;
    try {
      const response = await fetch(`${this.#root}/verify-auth`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${this.#accessToken}`,
        },
      });
      const { data } = (await response.json()) as ResponseBody<JwtPayload>;
      if (data) {
        this.#decoded = data;
        this.#isVerified = true;
        this.emit(AwesomeAuthEvent.VERIFIED, true);
      }
    } catch (e) {
      this.#isVerified = false;
      this.emit(AwesomeAuthEvent.ERROR, (e as Error).message || String(e));
    }
    this.emit(AwesomeAuthEvent.VERIFYING, false);
    this.#isVerifying = false;
    return this.#isVerified;
  }
  private async onGoogleIdentityCallback(res: {credential: string}) {
    this.emit(AwesomeAuthEvent.INIT, false);
    this.#isSigningIn = false;
    this.emit(AwesomeAuthEvent.VERIFYING, true);
    this.#isVerifying = true;
    const response = await fetch(`${this.#root}/google-auth`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        credential: res.credential,
      }),
    });
    const { data } = (await response.json()) as ResponseBody<{token: string}>;
    if (!data) {
      this.emit(AwesomeAuthEvent.ERROR, 'Failed to validate user.');
    }
    const { token } = data as { token: string };
    this.setAccessToken(token);
    this.emit(AwesomeAuthEvent.VERIFYING, false);
    this.#isVerifying = false;
    this.emit(AwesomeAuthEvent.VERIFIED, true);
    this.#isVerified = true;
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
export function getInstance(params: AwesomeAuthProps) {
  _client = _client || new AwesomeAuth(params);
  return _client;
}
