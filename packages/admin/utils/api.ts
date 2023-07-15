import { User } from '@awesome-comment/core/types';

export async function getUser(accessToken: string, domain: string): Promise<User> {
  domain ??= process.env.AUTH0_DOMAIN || '';
  const response = await fetch(
    `https://${domain}/userinfo`,
    {
      headers: {
        Authorization: accessToken,
        'Content-Type': 'application/json',
      },
    },
  );
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return await response.json();
}
