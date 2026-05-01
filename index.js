// 这是一个性能较好的节点，如果失效可以更换为 inv.vern.cc 或 inv.tux.pizza
const UPSTREAM = 'inv.pistasjis.net'; 

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // 直接构造目标请求地址
    const targetUrl = new URL(url.pathname + url.search, `https://${UPSTREAM}`);
    
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', UPSTREAM);
    newHeaders.set('Referer', `https://${UPSTREAM}/`);
    // 模拟真实浏览器，防止被识别为机器人
    newHeaders.set('User-Agent', 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: newHeaders,
        redirect: 'follow'
      });

      // 复制原始响应头并清除安全限制
      const modifiedHeaders = new Headers(response.headers);
      modifiedHeaders.set('Access-Control-Allow-Origin', '*');
      modifiedHeaders.set('Content-Type', response.headers.get('Content-Type') || 'text/html; charset=utf-8');
      
      // 移除可能导致无法播放或白屏的头
      modifiedHeaders.delete('Content-Security-Policy');
      modifiedHeaders.delete('X-Frame-Options');
      modifiedHeaders.delete('X-Content-Type-Options');

      return new Response(response.body, {
        status: response.status,
        headers: modifiedHeaders
      });
    } catch (e) {
      return new Response("连接节点失败: " + e.message, { status: 502 });
    }
  }
};
