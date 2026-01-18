export async function getTidbKey(): Promise<{ username: string; password: string }> {
  return {
    username: process.env.TIDB_PUBLIC_KEY || '',
    password: process.env.TIDB_PRIVATE_KEY || '',
  };
}
