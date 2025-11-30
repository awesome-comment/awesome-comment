import pkg from '../package.json' with { type: 'json' };
import { translateComments } from './lib/translate-comments';
import { tagComments } from './lib/tag-comments';

export default {
  async fetch() {
    return new Response(
      JSON.stringify({
        code: 0,
        data: {
          version: pkg.version,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  },

  async scheduled(event, env, ctx): Promise<void> {
    switch (event.cron) {
      case '*/10 * * * *':
        ctx.waitUntil(translateComments(env));
        break;

      case '5,15,25,35,45,55 * * * *':
        ctx.waitUntil(tagComments(env));
        break;

      default:
        throw new Error(`No handler for this cron: ${event.cron}`);
    }
  },
} satisfies ExportedHandler<Env>;
