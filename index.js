export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // 如果是首页
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(`
        <body style="text-align:center;padding-top:50px;font-family:sans-serif;">
          <h3>私人视频流中转</h3>
          <input id="url" placeholder="贴入 YouTube 视频地址" style="width:70%;padding:10px;">
          <button onclick="window.location.href='/proxy/'+btoa(document.getElementById('url').value)" style="padding:10px;">中转播放</button>
          <p style="font-size:12px;color:gray;">提示：本工具仅做流量转发，请勿传播</p>
        </body>
      `, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    // 流量中转逻辑
    if (url.pathname.startsWith('/proxy/')) {
      try {
        // 解码目标地址
        const targetUrl = atob(url.pathname.split('/proxy/')[1]);
        
        // 构造伪装请求头
        const modifiedHeaders = new Headers(request.headers);
        modifiedHeaders.set('Host', new URL(targetUrl).hostname);
        modifiedHeaders.set('Referer', 'https://youtube.com');
        modifiedHeaders.set('User-Agent', 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

        const response = await fetch(targetUrl, {
          method: request.method,
          headers: modifiedHeaders,
          redirect: 'follow'
        });

        // 关键：修改返回头，允许跨域，否则 iPad 播放器会报错
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.delete('content-security-policy');

        return new Response(response.body, {
          status: response.status,
          headers: newHeaders
        });
      } catch (e) {
        return new Response('中转出错：' + e.message, { status: 500 });
      }
    }

    return new Response('404 Not Found', { status: 404 });
  }
};
