import { CfProperties, Request, ExecutionContext, KVNamespace } from '@cloudflare/workers-types';

declare module 'h3' {
  interface H3EventContext {
    cf: CfProperties,
    cloudflare: {
      request: Request,
      env: {
        KV: KVNamespace,
      }
      context: ExecutionContext,
    };
  }
}

declare const __VERSION__: string;
declare const __AC_VERSION__: string;
declare const __AUTH0_DOMAIN__: string;
declare const __AUTH0_CLIENT_ID__: string;
declare const __REPO_URL__: string;
declare const __POST_ID_PREFIX__: string;

