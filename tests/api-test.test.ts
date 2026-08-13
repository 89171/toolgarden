import { describe, expect, it } from 'vitest';
import { GET } from '../app/api/test/route';

describe('GET /api/test', () => {
  it('returns the test JSON response', async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: 'API test successful',
    });
  });
});
