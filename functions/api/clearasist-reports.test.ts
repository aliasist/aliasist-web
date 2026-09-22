import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../_lib/clerk-auth', () => ({
  authenticateRequest: vi.fn(),
  requireAliasistAdmin: vi.fn(),
  corsHeaders: { 'Content-Type': 'application/json' },
  json: (body: unknown, status = 200) => new Response(JSON.stringify(body), { status }),
}));
import { authenticateRequest, requireAliasistAdmin } from '../_lib/clerk-auth';
import { onRequestGet, onRequestPatch } from './clearasist-reports';

const env = { CLEARASIST_ADMIN_SECRET: 'server-only-test-value', CLEARASIST_METADATA_WORKER_URL: 'https://metadata.example', ALIASIST_ADMIN_USER_IDS: 'owner' };
const get = (path: string) => ({ env, request: new Request(`https://aliasist.example/api/clearasist-reports${path}`) });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(authenticateRequest).mockResolvedValue({ ok: true, userId: 'owner' });
  vi.mocked(requireAliasistAdmin).mockReturnValue({ ok: true });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 12, reports: [], total: 0 }))));
});

describe('Clearasist server-side admin proxy', () => {
  it('rejects unsigned requests before contacting the metadata Worker', async () => {
    vi.mocked(authenticateRequest).mockResolvedValue({ ok: false, status: 401, error: 'Missing session token.' });
    expect((await onRequestGet(get(''))).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('rejects signed-in users outside the owner allowlist', async () => {
    vi.mocked(requireAliasistAdmin).mockReturnValue({ ok: false, status: 403, error: 'Forbidden' });
    expect((await onRequestGet(get('/12'))).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('fails closed without the server-side credential', async () => {
    expect((await onRequestGet({ ...get(''), env: { ...env, CLEARASIST_ADMIN_SECRET: '' } })).status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('retrieves an individual report using only the server credential', async () => {
    const response = await onRequestGet(get('/12'));
    expect(fetch).toHaveBeenCalledWith('https://metadata.example/admin/reports/12', { headers: { Authorization: 'Bearer server-only-test-value' } });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.text()).not.toContain('server-only-test-value');
  });
  it('forwards the list search filter', async () => {
    await onRequestGet(get('?search=photo'));
    expect(String(vi.mocked(fetch).mock.calls[0][0])).toContain('search=photo');
  });
  it.each(['/0', '/-1', '/1.5', '/9007199254740992', '/invalid'])('rejects invalid IDs: %s', async (path) => {
    expect((await onRequestGet(get(path))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('authorizes an update through the same owner check', async () => {
    const request = new Request('https://aliasist.example/api/clearasist-reports/12', { method: 'PATCH', body: JSON.stringify({ notes: 'Reviewed' }) });
    expect((await onRequestPatch({ env, request })).status).toBe(200);
    expect(requireAliasistAdmin).toHaveBeenCalledWith('owner', env);
    expect(vi.mocked(fetch).mock.calls[0][1]?.method).toBe('PATCH');
  });
});
