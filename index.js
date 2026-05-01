// 这是加密后的地址，Jamf 看不出来它是谁
const secret = 'aW52LnR1eC5waXp6YQ=='; // 指向 inv.tux.pizza

export default {
  async fetch(request) {
    // 动态解密出真实的后端地址
    const targetHost = atob(secret); 
    const url = new URL(request.url);
    const targetUrl = new URL(url.pathname + url.search, `https://${targetHost}`);

    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', targetHost);
    newHeaders.set('Referer', `https://${targetHost}/`);
    // 模拟普通设备，避开审计
    newHeaders.set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: newHeaders,
        redirect: 'follow'
      });

      let modHeaders = new Headers(response.headers);
      modHeaders.set('Access-Control-Allow-Origin', '*');
      modHeaders.set('Content-Type', 'text/html; charset=utf-8');
      // 抹掉所有敏感的安全头
      modHeaders.delete('Content-Security-Policy');
      modHeaders.delete('X-Frame-Options');

      return new Response(response.body, {
        status: response.status,
        headers: modHeaders
      });
    } catch (e) {
      // 这里的报错也模糊化，防止暴露
      return new Response("Service Unavailable", { status: 503 });
    }
  }
};
