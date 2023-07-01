export async function getUser(accessToken: string) {
  const response = await fetch(
    `https://${process.env.__AUTH0_DOMAIN__}/userinfo`,
    {
      headers: {
        Authorization: accessToken,
        'Content-Type': 'application/json',
      },
    },
  );
  return await response.json();
}
