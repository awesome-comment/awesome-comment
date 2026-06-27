import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchTidb } from '../services/fetch-tidb';
import { translateComments } from './translate-comments';
import { createTranslateProvider } from './translate-provider';

vi.mock('../services/fetch-tidb', () => ({
  fetchTidb: vi.fn(),
}));

vi.mock('./translate-provider', () => ({
  createTranslateProvider: vi.fn(),
}));

describe('translateComments', () => {
  const mockKV = {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  const mockEnv = {
    KV: mockKV,
    AFTER_ID: '309600037',
    TRANSLATE_PROVIDER: 'google',
  } as unknown as Cloudflare.Env;

  const mockTranslate = vi.fn();
  const mockProvider = {
    translate: mockTranslate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockKV.get.mockResolvedValue(null);
    mockKV.put.mockResolvedValue(undefined);
    mockKV.delete.mockResolvedValue(undefined);
    vi.mocked(createTranslateProvider).mockReturnValue(mockProvider as any);
  });

  it('should skip run if another instance is locked', async () => {
    mockKV.get.mockResolvedValue('locked');

    await translateComments(mockEnv);

    expect(fetchTidb).not.toHaveBeenCalled();
  });

  it('should fetch comments and do nothing if empty list returned', async () => {
    vi.mocked(fetchTidb).mockResolvedValueOnce([]);

    await translateComments(mockEnv);

    expect(mockKV.put).toHaveBeenCalledWith('cronjob-lock', 'locked', { expirationTtl: 3600 });
    expect(mockKV.delete).toHaveBeenCalledWith('cronjob-lock');
  });

  it('should skip long comments (> 2000 characters)', async () => {
    const longContent = 'a'.repeat(2001);
    vi.mocked(fetchTidb)
      .mockResolvedValueOnce([
        {
          id: 1,
          content: longContent,
          post_id: 'test-post',
        },
      ])
      .mockResolvedValueOnce([]); // mock update_translation call return

    await translateComments(mockEnv);

    // Should update translation to empty string for long comment
    expect(fetchTidb).toHaveBeenCalledWith(mockEnv, '/v1/update_translation', 'PUT', {
      id: 1,
      translation: '',
    });
    expect(mockTranslate).not.toHaveBeenCalled();
  });

  it('should skip comments with specific language paths in post_id', async () => {
    vi.mocked(fetchTidb)
      .mockResolvedValueOnce([
        {
          id: 2,
          content: 'Hello world',
          post_id: '/en/post-1',
        },
      ])
      .mockResolvedValueOnce([]);

    await translateComments(mockEnv);

    expect(fetchTidb).toHaveBeenCalledWith(mockEnv, '/v1/update_translation', 'PUT', {
      id: 2,
      translation: '',
    });
    expect(mockTranslate).not.toHaveBeenCalled();
  });

  it('should translate normal comments successfully', async () => {
    vi.mocked(fetchTidb)
      .mockResolvedValueOnce([
        {
          id: 3,
          content: 'Bonjour tout le monde',
          post_id: 'post-1',
        },
      ])
      .mockResolvedValueOnce([]);

    mockTranslate.mockResolvedValueOnce('Hello everyone');

    await translateComments(mockEnv);

    expect(mockTranslate).toHaveBeenCalledWith('Bonjour tout le monde');
    expect(fetchTidb).toHaveBeenCalledWith(mockEnv, '/v1/update_translation', 'PUT', {
      id: 3,
      translation: 'Hello everyone',
    });
  });
});
