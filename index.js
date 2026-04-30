export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(p => p); // 过滤掉空路径

    // 1. 首页：展示输入框
    if (pathParts.length === 0) {
      return new Response(`
        <html>
          <head><meta charset="UTF-8"><title>Private Proxy</title></head>
          <body style="font-family:sans-serif; text-align:center; padding-top:50px;">
            <div style="display:inline-block; padding:20px; border:1px solid #ccc; border-radius:10px;">
              <h2>私人代理</h2>
              <input type="text" id="v" placeholder="在此贴入视频 ID" style="padding:10px; width:200px;">
              <button onclick="location.href='/video/'+document.getElementById('v').value">播放</button>
            </div>
          </body>
        </html>
      `, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // 2. 播放页：修复了变量拼接逻辑
    if (pathParts[0] === "video" && pathParts[1]) {
      const videoId = pathParts[1]; // 获取真正的 ID
      const embedUrl = `https://youtube.com{videoId}`;
      
      try {
        const response = await fetch(embedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
          }
        });

        let html = await response.text();
        
        // 简单替换掉部分限制
        html = html.replace(/www\.youtube\.com/g, url.hostname);
        
        return new Response(html, {
          headers: { "Content-Type": "text/html;charset=UTF-8" }
        });
      } catch (e) {
        return new Response("请求出错: " + e.message);
      }
    }

    return new Response("路径不对，请返回首页", { status: 404 });
  }
};
