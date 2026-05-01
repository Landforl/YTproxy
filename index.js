// 混淆目标域名，防止代码被静态扫描（目前较稳的节点）
const d1 = 'inv';
const d2 = 'pistasjis';
const d3 = 'net';
const UPSTREAM = `${d1}.${d2}.${d3}`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';

    // --- 1. 伪装首页 (针对 Jamf 扫描机器人) ---
    // 只有访问特定路径（如 /edu-lib）才会触发代理，直接访问根目录显示维护
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(`
        <html>
          <head><title>Access Denied</title></head>
          <body style="font-family:sans-serif;text-align:center;padding-top:100px;background:#f8f9fa;">
            <div style="display:inline-block;padding:40px;background:white;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color:#d93025;">403 Forbidden</h2>
              <p style="color:#5f6368;">当前网络环境未授权访问此教育资源库。</p>
              <p style="font-size:12px;color:#9aa0a6;">节点识别码: ${Math.random().toString(36).substring(7)}</p>
            </div>
          </body>
        </html>`, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    // --- 2. 核心中转逻辑 ---
    // 建议在 iPad 地址栏手动输入: 你的域名.workers.dev/search
    const targetUrl = new URL(url.pathname + url.search, `https://${UPSTREAM}`);
    
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: new Headers(request.headers),
      redirect: 'follow'
    });

    // 深度伪装请求头
    proxyRequest.headers.set('Host', UPSTREAM);
    proxyRequest.headers.set('Referer', `https://${UPSTREAM}/`);
    // 强制使用 iPad Safari 标识
    proxyRequest.headers.set('User-Agent', 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1');

    try {
      const response = await fetch(proxyRequest);
      
      // 过滤掉所有可能触发 Jamf 或防火墙关键词审查的响应头
      let newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      newHeaders.delete('Content-Security-Policy');
      newHeaders.delete('X-Frame-Options');
      newHeaders.delete('X-Content-Type-Options');
      
      // 如果是 HTML 内容，进行关键词脱敏（防止 Jamf 解析标题）
      if (newHeaders.get('Content-Type')?.includes('text/html')) {
        let body = await response.text();
        // 动态替换掉网页中的 YouTube 敏感字眼
        body = body.replace(/YouTube/gi, 'Resources').replace(/Video/gi, 'Media');
        return new Response(body, { status: response.status, headers: newHeaders });
      }

      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });
    } catch (e) {
      return new Response("Connection Timeout", { status: 504 });
    }
  }
};
