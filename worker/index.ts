import { preferredLang } from './lang';

export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.hostname === 'www.sifa-web.com') {
      return Response.redirect(`https://sifa-web.com${url.pathname}${url.search}`, 301);
    }
    if (url.pathname === '/') {
      const lang = preferredLang(request.headers.get('accept-language'));
      return new Response(null, { status: 302, headers: { location: `/${lang}/`, vary: 'Accept-Language', 'cache-control': 'no-cache' } });
    }
    return env.ASSETS.fetch(request);
  },
};
