// 'aW52aWRpb3VzLm5lcmR2cG4uZGU=' 是 invidious.nerdvpn.de
// 'aW52aWRpb3VzLmRyZ25zLnNwYWNl' 是 invidious.drgns.space
const secret = 'aW52aWRpb3VzLm5lcmR2cG4uZGU='; 

export default {
  async fetch(request) {
    try {
      const targetHost = atob(secret);
      const url = new URL(request.url);
      const targetUrl = new URL(url.pathname + url.search, `https://${targetHost}`);

      const newHeaders = new Headers(request.headers);
      newHeaders.set('Host', targetHost);
      newHeaders.set('Referer', `https://${targetHost}/`);
      
      // 【防乱码核心】强制要求不压缩数据
      newHeaders.set('Accept-Encoding', 'identity');
      
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: newHeaders,
        redirect: 'follow'
      });

      let modHeaders = new Headers(response.headers);
      modHeaders.set('Access-Control-Allow-Origin', '*');
      
      // 【防乱码核心】强制声明 UTF-8
      const contentType = modHeaders.get('Content-Type') || '';
      if (contentType.includes('text/html')) {
        modHeaders.set('Content-Type', 'text/html; charset=utf-8');
      }

      // 移除安全限制
      modHeaders.delete('Content-Security-Policy');
      modHeaders.delete('X-Frame-Options');

      return new Response(response.body, {
        status: response.status,
        headers: modHeaders
      });
    } catch (e) {
      return new Response("Node Error", { status: 502 });
    }
  }
};
