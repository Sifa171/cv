import { describe, expect, it, vi } from 'vitest';
import worker from '../../worker/index';

const assets = () => ({ fetch: vi.fn(async () => new Response('asset', { status: 200 })) });

describe('Worker', () => {
  it('leitet / nach Sprache weiter', async () => {
    const res = await worker.fetch(new Request('https://sifa-web.com/', { headers: { 'accept-language': 'de' } }), { ASSETS: assets() });
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/de/');
    expect(res.headers.get('vary')).toBe('Accept-Language');
  });
  it('leitet www mit Pfad und Query auf die Hauptdomain um', async () => {
    const res = await worker.fetch(new Request('https://www.sifa-web.com/en/?a=1'), { ASSETS: assets() });
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://sifa-web.com/en/?a=1');
  });
  it('reicht alles andere an die Assets durch', async () => {
    const env = { ASSETS: assets() };
    const req = new Request('https://sifa-web.com/de/');
    const res = await worker.fetch(req, env);
    expect(env.ASSETS.fetch).toHaveBeenCalledWith(req);
    expect(await res.text()).toBe('asset');
  });
});
