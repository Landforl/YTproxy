// 备选节点：'invidious.lunar.icu' 或 'iv.melmac.space'
const BACKEND = 'inv.vern.cc'; 

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = `https://${BACKEND}${url.pathname}${url.search}`;

    // 复制请求头
    const newHeaders = new Headers(request.headers);
    
    // --- 核心修复：防止乱码 ---
    // 强制告诉后端不要压缩数据（Identity 表示原样发送）
    // 这样 Worker 拿到的就是纯文本，iPad 解析时绝不会出现“锟斤拷”
    newHeaders.set('Accept-Encoding', 'identity');
    newHeaders.set('Host', BACKEND);
    newHeaders.set('Referer', `https://${BACKEND}/`);

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: newHeaders,
        redirect: 'follow'
      });

      // 允许跨域并清理安全头
      const modHeaders = new Headers(response.headers);
      modHeaders.set('Access-Control-Allow-Origin', '*');
      modHeaders.delete('Content-Security-Policy');
      modHeaders.delete('X-Frame-Options');

      // 强制声明编码为 UTF-8
      const contentType = modHeaders.get('Content-Type') || '';
      if (contentType.includes('text/html')) {
        modHeaders.set('Content-Type', 'text/html; charset=utf-8');
      }

      return new Response(response.body, {
        status: response.status,
        headers: modHeaders
      });
    } catch (e) {
      return new Response("Node Connection Error", { status: 502 });
    }
  }
};

