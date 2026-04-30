export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(part => part !== '');
    
    // 1. 首页：展示搜索/输入框
    if (pathParts.length === 0) {
      return new Response(`
        <html>
          <head><meta charset="UTF-8"><title>Private Proxy</title></head>
          <body style="font-family:sans-serif; text-align:center; padding-top:50px; background:#f0f0f0;">
            <div style="background:white; display:inline-block; padding:30px; border-radius:15px; shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2>私人视频中转站</h2>
              <p style="color:#666;">输入 YouTube 视频 ID 即可播放</p>
              <input type="text" id="v" placeholder="例如: dQw4w9WgXcQ" style="width:250px; padding:12px; border:1px solid #ccc; border-radius:5px;">
              <button onclick="var id=document.getElementById('v').value.trim(); if(id) window.location.href='/video/'+id" 
                      style="padding:12px 20px; background:#ff0000; color:white; border:none; border-radius:5px; cursor:pointer;">播放</button>
            </div>
          </body>
        </html>
      `, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // 2. 播放页：转发 YouTube Embed
    if (pathParts[0] === "video" && pathParts[1]) {
      const videoId = pathParts[1];
      const embedUrl = `https://youtube.com{videoId}`;
      
      try {
        const response = await fetch(embedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
          }
        });

        let html = await response.text();
        
        // 关键修复：处理视频流和脚本路径，使其相对于 YouTube 而非你的域名
        html = html.replace(/src="\//g, 'src="https://youtube.com');
        html = html.replace(/href="\//g, 'href="https://youtube.com');
        
        // 允许在 iframe 中运行
        return new Response(html, {
          headers: { 
            "Content-Type": "text/html;charset=UTF-8",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (e) {
        return new Response("中转请求失败: " + e.message, { status: 500 });
      }
    }

    // 3. 其他请求兜底转发
    const targetUrl = new URL(url.pathname + url.search, "https://youtube.com");
    return fetch(new Request(targetUrl, { headers: request.headers }));
  }
};
