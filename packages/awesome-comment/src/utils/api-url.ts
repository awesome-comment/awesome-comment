export function normalizeApiBaseUrl(apiUrl = ''): string {
  const trimmed = apiUrl.trim().replace(/\/+$/, '');

  return trimmed.replace(/\/api$/i, '');
}

export function buildApiUrl(apiUrl: string | undefined, path: string): string {
  const baseUrl = normalizeApiBaseUrl(apiUrl);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}
