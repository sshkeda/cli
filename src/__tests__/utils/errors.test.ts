import { afterEach, describe, expect, it, vi } from 'vitest';
import { keylessGet, keylessRequest } from '../../utils/client';
import { AUTH_REQUIRED_RECOVERY, AuthRequiredError } from '../../utils/errors';

describe('keyless authentication errors', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    [keylessRequest, 403, { error: 'Use an API key or auth.md' }],
    [keylessGet, 401, { error: 'Unauthorized' }],
  ])('returns a typed, non-retryable error', async (request, status, body) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status,
        json: vi.fn().mockResolvedValue(body),
      })
    );

    const call = (
      request as (
        path: string,
        body?: Record<string, unknown>
      ) => Promise<unknown>
    )('/v2/scrape', {});

    await expect(call).rejects.toMatchObject({
      name: 'AuthRequiredError',
      code: 'AUTH_REQUIRED',
      retryable: false,
      recovery: AUTH_REQUIRED_RECOVERY,
    } satisfies Partial<AuthRequiredError>);
  });

  it('preserves unrelated service errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: vi.fn().mockResolvedValue({ error: 'Rate limit exceeded' }),
      })
    );

    await expect(keylessGet('/v2/research')).rejects.toThrow(
      'Rate limit exceeded'
    );
  });
});
