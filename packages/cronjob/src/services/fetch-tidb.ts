import { JSONData, TiDBDataServiceResponse } from '../types';
import { isPlainObject, mapValues } from 'lodash-es';

export async function fetchTidb<T>(
  env: Cloudflare.Env,
  url: string | URL,
  method: string = 'GET',
  body?: JSONData,
  options?: RequestInit,
): Promise<T[]> {
  const {
    ENVIRONMENT,
    TIDB_CLOUD_API_KEY,
    TIDB_CLOUD_ENDPOINT,
  } = env || {};
  const credentials = btoa(TIDB_CLOUD_API_KEY || '');
  url = `${TIDB_CLOUD_ENDPOINT}${url}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${credentials}`,
      'content-type': 'application/json',
    },
    method,
    ...(body ? { body: toJSON(body) } : {}),
    ...options,
  });

  if (ENVIRONMENT !== 'production') {
    console.log('URL', url);
    console.log('Body', body ? toJSON(body) : 'N/A');
  }
  if (!response.ok) {
    throw new Error(`HTTP error. status: ${response.status}`);
  }

  const result = (await response.json()) as TiDBDataServiceResponse<T>;
  return result.data.rows as T[];
}

function toJSON(value: JSONData): string {
  value = mapValues(value, v =>
    isPlainObject(v) || Array.isArray(v) ? JSON.stringify(v) : v
  );
  return JSON.stringify(value);
}
