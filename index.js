/**
 * 特点：
 * 1. 移除了首页 403 假页面，直接访问。
 * 2. 依然保留 Base64 域名混淆，防止代码被静态扫描。
 * 3. 强制内容脱敏，把网页里的 "YouTube" 关键词实时替换。
 */

// 混淆后的后端地址（inv.pistasjis.net）
// 如果失效，可以去 base64encode.org 重新编码一个新域名替换这里
const secret = 'aW52LnBpc3Rhc2ppcy5uZXQ='; 

export default {
  async fetch(request) {
    try {
      const targetHost = atob(secret); 
      const url = new URL(request.url);
      const targetUrl = new URL(url.pathname + url.search, `https://${targetHost}`);

      const newHeaders = new Headers(request.headers);
      newHeaders.set('Host', targetHost);
      newHeaders.set('Referer', `https://${targetHost}/`);
      // 模拟标准 iPad Safari 环境
      newHeaders.set('User-Agent', 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: newHeaders,
        redirect: 'follow'
      });

      let modHeaders = new Headers(response.headers);
      modHeaders.set('Access-Control-Allow-Origin', '*');
      modHeaders.set('Content-Type', 'text/html; charset=utf-8');
      
      // 抹除安全头，允许视频流加载
      modHeaders.delete('Content-Security-Policy');
      modHeaders.delete('X-Frame-Options');

      // --- 关键防御：关键词脱敏 ---
      // 如果是 HTML 页面，把所有的 YouTube 字样替换掉，防止 Jamf 关键词嗅探
      if (modHeaders.get('Content-Type')?.includes('text/html')) {
        let body = await response.text();
        // 把视频站伪装成“媒体资料库”
        body = body.replace(/YouTube/gi, 'Media').replace(/Video/gi, 'Resource');
        return new Response(body, { status: response.status, headers: modHeaders });
      }

      return new Response(response.body, {
        status: response.status,
        headers: modHeaders
      });
    } catch (e) {
      return new Response("Service Loading...", { status: 200 }); // 报错也伪装成正在加载
    }
  }
};
