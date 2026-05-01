export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(p => p); 

    // 1. 首页逻辑
    if (pathParts.length === 0) {
      return new Response(`
        <html>
          <head><meta charset="UTF-8"><title>Private Proxy</title></head>
          <body style="font-family:sans-serif; text-align:center; padding-top:50px;">
            <div style="display:inline-block; padding:20px; border:1px solid #ccc; border-radius:10px;">
              <h2>私人中转站</h2>
              <input type="text" id="v" placeholder="在此贴入视频 ID (11位)" style="padding:10px; width:200px;">
              <button onclick="var id=document.getElementById('v').value.trim(); if(id) location.href='/video/' + id">播放</button>
            </div>
          </body>
        </html>
      `, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // 2. 视频中转逻辑 (修正了变量读取)
    if (pathParts[0] === "video" && pathParts[1]) {
      const vid = pathParts[1]; // 显式获取数组第二个元素作为 ID
      const embedUrl = "https://youtube.com" + vid;
      
      try {
        const response = await fetch(embedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          }
        });

        if (!response.ok) return new Response("YouTube 拒绝了请求，状态码: " + response.status);

        let html = await response.text();
        
        // 关键：允许 iframe 并在页面中注入必要的基础标签
        html = html.replace('<head>', '<head><base href="https://youtube.com">');

        return new Response(html, {
          headers: { 
            "Content-Type": "text/html;charset=UTF-8",
            "Access-Control-Allow-Origin": "*" 
          }
        });
      } catch (e) {
        return new Response("中转发生异常: " + e.message);
      }
    }

    return new Response("未识别的路径: " + url.pathname, { status: 404 });
  }
};
