const secret = 'aW52LnBpc3Rhc2ppcy5uZXQ='; // inv.pistasjis.net

export default {
  async fetch(request) {
    try {
      const targetHost = atob(secret);
      const url = new URL(request.url);
      const targetUrl = new URL(url.pathname + url.search, `https://${targetHost}`);

      const newHeaders = new Headers(request.headers);
      newHeaders.set('Host', targetHost);
      newHeaders.set('Referer', `https://${targetHost}/`);
      newHeaders.set('User-Agent', 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: newHeaders,
        redirect: 'follow'
      });

      const contentType = response.headers.get('Content-Type') || '';
      let modHeaders = new Headers(response.headers);
      modHeaders.set('Access-Control-Allow-Origin', '*');
      modHeaders.delete('Content-Security-Policy');
      modHeaders.delete('X-Frame-Options');

      // --- 关键：只有 HTML 页面才进行关键词替换，防止干扰视频流/图片导致乱码 ---
      if (contentType.includes('text/html')) {
        // 强制告诉浏览器使用 UTF-8 编码
        modHeaders.set('Content-Type', 'text/html; charset=utf-8');
        
        let body = await response.text();
        // 只替换标题和关键大字，减少乱码风险
        body = body.replace(/<title>YouTube<\/title>/gi, '<title>Media Lib</title>');
        body = body.replace(/YouTube/g, 'Media'); 
        
        return new Response(body, { status: response.status, headers: modHeaders });
      }

      // 非 HTML 内容（图片、视频流、JS）原样返回，不进行任何修改
      return response;

    } catch (e) {
      return new Response("Loading...", { status: 200 });
    }
  }
};
