function normalizeSiteId(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getStorageKey(): string {
  const runtimeConfig = useRuntimeConfig();
  const prefix = (runtimeConfig.public?.keyPrefix || '').trim() || 'ac';
  return `${prefix}-admin-site-id`;
}

function readFromLocalStorage(key: string): string {
  if (!import.meta.client) return '';
  try {
    return normalizeSiteId(window.localStorage.getItem(key));
  } catch {
    return '';
  }
}

function writeToLocalStorage(key: string, value: string): void {
  if (!import.meta.client) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function useAdminSiteId() {
  const route = useRoute();
  const storageKey = getStorageKey();

  const siteId = useState<string>('ac-admin-site-id', function () {
    const fromQuery = normalizeSiteId(route.query.siteId);
    if (fromQuery) {
      writeToLocalStorage(storageKey, fromQuery);
      return fromQuery;
    }
    return readFromLocalStorage(storageKey);
  });

  watch(
    () => route.query.siteId,
    function (value) {
      const next = normalizeSiteId(value);
      if (!next) return;
      siteId.value = next;
      writeToLocalStorage(storageKey, next);
    },
  );

  return siteId;
}

