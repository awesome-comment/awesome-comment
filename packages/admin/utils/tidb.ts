import { get } from '@vercel/edge-config';

export async function getTidbKey(): Promise<{ username: string; password: string; }> {
  const tidb = await get('tidb') as string[];
  const idx = Math.floor(Math.random() * tidb.length);
  const kv = tidb[ idx ].split(':');
  return {
    username: kv[ 0 ],
    password: kv[ 1 ],
  };
}
